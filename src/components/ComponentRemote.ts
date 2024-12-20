
// - Imports - //

// Library.
import { orderedIndex } from "data-memo";
// Typing.
import type { MixDOMChangeInfos, MixDOMDefTarget, MixDOMRenderOutput } from "../typing";
// Routines.
import { newContentPassDef, newDef, newDefFrom, collectInterestedInClosure } from "../static/index";
// Common.
import { MixDOMContent } from "../common/index";
// Boundaries.
import { ContentClosure } from "../boundaries/index";
// Local.
import { Component } from "./Component";
import { applyClosureEnvelope } from "./routinesApply";
// Only typical (local).
import type { ComponentProps, ComponentType, ComponentTypeEither, ComponentTypeWith } from "./Component";
import type { SourceBoundary } from "./SourceBoundary";



// - MAIN IDEA (v4.0) - //
// 
// BASICS:
//  - We have one kind of remote: ComponentRemote.
//      * It can be used directly or shared via context data (and then using onData() -> setState() flow).
//  - The basic idea is that there's an INPUT SOURCE and STREAM OUTPUT parts.
//      * The input is an instance of the ComponentRemote class, while output is handled by the static side: ComponentRemoteType.
//      * The static output side can be used just like with MixDOM shortcut: MyRemote.Content, MyRemote.ContentCopy, MyRemote.copyContent(...) and <MyRemote.WithContent>...</MyRemote.WithContent>
//  - Mixing many:
//      * As there can be many instances of a remote, the output can actually receive content from multiple sources.
//      * Accordingly the .Content (and alike) do not actually refer to a content pass, but instead a def for the "ContentPasser" component of the MyRemote class.
//      * The ContentPasser in turn renders a fragment containing the actual unique content passes of each active source.
//      * As an extra conveniency, the pass can actually filter them uniquely for each insertion: eg. `MyRemote.filterContent((remote, i) => i === 0)`.
//  - To account for situations where you might have access to a remote but it might be empty, there's a MixDOM.EmptyRemote pseudo class.
//      * It actually extends PseudoEmpty but has typing of ComponentRemoteType. You can use its public members and methods in the flow, they'll just return null.
//  - Note that the children needs are handled directly by using a unique WithContent component for each remote: `<MyRemote.WithContent>...</MyRemote.WithContent>`.
//      * It simply renders `null` if the remote has no active content (= no sources, or all sources rendered `null`), or otherwise renders the given content.
//  - Note that in v4, the content can have multiple sources and there is no concept of overriding.



// - Typing - //

// Props.
export interface ContentPasserProps<CustomProps extends Record<string, any> = {}> {
    /** Use a copy instead of a true pass. */
    copy?: boolean;
    /** Use a copy (instead of a true pass) with specific copy key. (Note. Both `copy: true` or `copyKey != null` indicate a copy.) */
    copyKey?: any;
    /** Optionally filter which content passes are shown. Ignored if wrapper or renderer defined. */
    filterer?: (remote: ComponentRemote<CustomProps>, iRemote: number) => boolean;
    /** Optionally wrap the content passes. Ignored if renderer defined. Setting wrapper ignores filterer. */
    wrapper?: (remote: ComponentRemote<CustomProps>, iRemote: number) => MixDOMRenderOutput;
    /** Optionally render all the content passes in a custom way. Setting renderer ignores filterer and wrapper. */
    renderer?: (remotes: ComponentRemote<CustomProps>[]) => MixDOMRenderOutput;
}
/** The Remote component's own props (without intrinsic). */
export interface ComponentRemoteProps {
    order?: number;
}

// Remote class instance.
/** Instanced remote source. */
export interface ComponentRemote<CustomProps extends Record<string, any> = {}> extends Component<{ props: ComponentRemoteProps & CustomProps; }> {

    // Class side.
    /** The constructor is typed as ComponentRemoteType. */
    ["constructor"]: ComponentRemoteType<CustomProps>;

    // Closure.
    /** Each remote instance has its own closure, whose contents are rendered by the unknown source instance. */
    closure: ContentClosure;

    // Content passing public like API.
    /** Unique content pass for this source instance. It's used internally. */
    Content: MixDOMDefTarget;
    ContentCopy: MixDOMDefTarget;
    copyContent: (key?: any) => MixDOMDefTarget;
    WithContent: ComponentTypeEither<{props: { hasContent?: boolean; }; }> & {
        /** Should contain the content pass object.
         * - For parental passing it's the MixDOM.Content object.
         * - For remote instance it's their Content pass object with its getRemote() method.
         * - For remote static side it's a def for a boundary.
         */
        _WithContent: MixDOMDefTarget;
    };
    /** Check whether this remote content pass has content to render (vs. null like). */
    hasContent: () => boolean;
}

// Remote class type.
/** Static class side for remote output. */
export interface ComponentRemoteType<CustomProps extends Record<string, any> = {}> extends ComponentType<{ props: ComponentRemoteProps & CustomProps; }> {

    readonly MIX_DOM_CLASS: string; // "Remote"

    // We are a static class, and when instanced output a remote source.
    new (props: ComponentRemoteProps & CustomProps, boundary?: SourceBoundary): ComponentRemote<CustomProps>;

    // Remote vs. pseudo.
    /** Check whether is the real thing or an empty pseudo remote. */
    isRemote(): boolean;
    /** Check whether any of the content passes has content. Optionally define a filterer for the check: only checks for those that returned `true` for. */
    hasContent: (filterer?: (remote: ComponentRemote<CustomProps>, i: number) => boolean) => boolean;

    // Public members - for usage inside the render output.
    /** The Content pass for the Remote. It's actually a def to render the content pass from each active source as a fragment. */
    Content: MixDOMDefTarget | null;
    /** The ContentCopy pass for the Remote. It's actually a def to render the content copy pass from each active source as a fragment. */
    ContentCopy: MixDOMDefTarget | null;
    /** Copy content with custom key for the Remote. It's actually a def to render the copyContent for each active source as a fragment. */
    copyContent: (key?: any) => MixDOMDefTarget | null;
    /** Alternative way to insert contents by filtering the sources (instead of just all). Typically you would use the `remote.props` typed with CustomProps. */
    filterContent: (filterer: (remote: ComponentRemote<CustomProps>, iRemote: number) => boolean, copyKey?: any) => MixDOMDefTarget | null;
    /** Alternative way to insert contents by custom wrapping. Can also filter by simply returning null or undefined.
     * - The Content pass for the remote is found at `remote.Content`, where you can also find `ContentCopy`, `copyContent`, `hasContent` and other such.
     */
    wrapContent: (wrapper: (remote: ComponentRemote<CustomProps>, iRemote: number) => MixDOMRenderOutput, copyKey?: any) => MixDOMDefTarget | null;
    /** Alternative way to handle inserting the remote contents - all remotes together in a custom manner.
     * - The Content pass for each remote is found at `remote.Content`, where you can also find `ContentCopy`, `copyContent`, `hasContent` and other such.
     */
    renderContents: (renderer: (remotes: Array<ComponentRemote<CustomProps>>) => MixDOMRenderOutput) => MixDOMDefTarget | null;

    /** A custom component (func) that can be used for remote conditional inserting. If any source is active and has content renders, otherwise not.
     * - For example: `<MyRemote.WithContent><div class="popup-container">{MyRemote.Content}</div></MyRemote.WithContent>`
     *      * Results in `<div class="popup-container">...</div>`, where ... is the actual content passed (by remote source).
     *      * However, if there was no actual content to pass, then results in `null`.
     * - This is very typically used for adding some wired elements to a popup remote, like in the above example.
     */
    WithContent: ComponentTypeEither<{props: { hasContent?: boolean; }; }> & {
        /** Should contain the content pass object.
         * - For parental passing it's the MixDOM.Content object.
         * - For remote instance it's their Content pass object with its getRemote() method.
         * - For remote static side it's a def for a boundary.
         */
        _WithContent: MixDOMDefTarget;
        /** On the static remote side we collect the source boundaries of the instanced WithContents, for getting access to interests. */
        withContents: Set<SourceBoundary>;
    };

    // Sources - used internally.
    /** The active remote sources. */
    sources: ComponentRemote<CustomProps>[];
    /** Add a remote source - used internally. */
    addSource(remote: ComponentRemote<CustomProps>): void;
    /** Remove a remote source - used internally.
     * - Note that this only returns remove related infos - any additions or updates are run by a host listener afterwards.
     */
    removeSource(remote: ComponentRemote<CustomProps>): MixDOMChangeInfos | null;

    // Semi-public.
    /** A component to render the content passes: simply combines all the unique content passes of the child remote together. */
    ContentPasser: ComponentType<{ props: ContentPasserProps<CustomProps>; static: { passers: Set<Component>; }; }>;

}


// - Create - //

/** Create a ComponentRemote class for remote flow (in / out).
 * - For example, `export const MyRemote = createRemote("MyRemote");`.
 * - And then to feed content in a render method: `<MyRemote>Some content..</MyRemote>`.
 * - Finally insert it somewhere in a render method: `{MyRemote.Content}`.
 */
export const createRemote = <CustomProps extends Record<string, any> = {}>(name: string = "Remote"): ComponentRemoteType<CustomProps> => {

    // Shortcut for naming.
    const wStr = "WithContent";

    // Create a new class with dynamic name. (Don't assign static members yet.)
    const _Remote = {
        
        [name]: class extends Component<{ props: ComponentRemoteProps & CustomProps; }> {


            // - Members & property funcs - //

            /** The constructor is typed as ComponentRemoteType. */
            ["constructor"]: ComponentRemoteType<CustomProps>;

            public closure: ContentClosure = new ContentClosure(null, this.boundary);
            public Content: MixDOMDefTarget = { ...newContentPassDef(this), contentPass: null, getRemote: () => this as ComponentRemote };
            public ContentCopy: MixDOMDefTarget = { ...newContentPassDef(this, true), contentPass: null, getRemote: () => this as ComponentRemote };
            public copyContent = (key?: any): MixDOMDefTarget => ({ ...newContentPassDef(key ?? _Remote, true), contentPass: null, getRemote: () => this as ComponentRemote });
            public hasContent = (): boolean => this.closure.hasContent();
            public WithContent = (() => {
                const remote = this as ComponentRemote<CustomProps>;
                const With = {
                    [name + "[i]." + wStr]: class extends Component<{ props: { hasContent?: boolean; }; }> {
                        public static _WithContent: MixDOMDefTarget;
                        public render() {
                            return (this.props.hasContent != null ? this.props.hasContent : remote.hasContent()) ? MixDOMContent : null;
                        }
                    }
                }[name + "[i]." + wStr];
                With._WithContent = remote.Content;
                return With;
            })();


            // - Render - //

            // Make sure renders null.
            public render() {
                return null;
            }


            // - Static members - //

            // Note that the static non-methods (= static properties) are applied afterwards to retain dynamic class name (through bundling).
            // .. Public.
            public static MIX_DOM_CLASS: string;
            public static sources: ComponentRemote<CustomProps>[];
            public static Content: MixDOMDefTarget | null;
            public static ContentCopy: MixDOMDefTarget | null;
            public static copyContent: ComponentRemoteType<CustomProps>["copyContent"]; 
            public static hasContent: ComponentRemoteType<CustomProps>["hasContent"];
            public static filterContent: ComponentRemoteType<CustomProps>["filterContent"];
            public static wrapContent: ComponentRemoteType<CustomProps>["wrapContent"];
            public static renderContents: ComponentRemoteType<CustomProps>["renderContents"];
            public static WithContent: ComponentRemoteType<CustomProps>["WithContent"];
            public static ContentPasser: ComponentType<{ props: ContentPasserProps<CustomProps>; static: { passers: Set<Component>; }; }>;


            // - Static helper methods - //

            public static isRemote(): boolean { return true; }

            /** Add a remote source - used internally. */
            public static addSource(remote: ComponentRemote<CustomProps>, order: number | null | undefined = remote.props.order): void {
                // Prepare to add as an active source.
                const iNow = _Remote.sources.indexOf(remote);
                const atIndex = orderedIndex(order, _Remote.sources.map(remote => remote.props.order));
                // New one - add (furher below).
                if (iNow === -1) {}
                // Already there - see if should move.
                else if (atIndex === -1 ? iNow !== _Remote.sources.length - 1 : iNow !== atIndex)
                    // Remove - will be added below.
                    _Remote.sources.splice(iNow, 1);
                // Really nothing to do.
                else
                    return;
                // Do the addition.
                atIndex === -1 ? _Remote.sources.push(remote) : _Remote.sources.splice(atIndex, 0, remote);
                // Trigger a forced update for the content passing boundaries.
                for (const passer of ContentPasser.passers)
                    // If uses the same host, just force an update on the passer - it will be then handled smoothly with true pass (if such is the case).
                    // .. If uses a different host, then trigger an update right after the other host has finished its update - we need to allow the current cycle to finish first.
                    // .. Actually, let's then use the render cycle and do an immediate update + render instead (as a refine).
                    passer.boundary.host === remote.boundary.host ? passer.boundary.update(true) : passer.boundary.host.addRefreshCall(() => passer.boundary.update(true, null, null), true); // Render side.
            }

            /** Remove a remote source - used internally.
             * - Note that this only returns remove related infos - any additions or updates are run by a host listener afterwards.
             */
            public static removeSource(remote: ComponentRemote<CustomProps>): MixDOMChangeInfos | null {
                // Not found.
                const iRemote = _Remote.sources.indexOf(remote);
                if (iRemote === -1)
                    return null;
                
                // Remove from local bookkeeping.
                _Remote.sources.splice(iRemote, 1);
                // Collect interested. We won't mark anything, just collect them.
                let infos: MixDOMChangeInfos | null = null;
                const interested: Set<SourceBoundary> | null = collectInterestedInClosure(remote.closure, remote as ComponentRemote);

                // Apply null to the envelope to destroy the content.
                infos = applyClosureEnvelope(remote.closure, null);
                // Nullify the references, to mark that we have no active source now.
                remote.closure.sourceBoundary = null;

                // Trigger a forced update for the content passing boundaries.
                for (const passer of ContentPasser.passers)
                    // If uses the same host, just force an update on the passer - it will be then handled smoothly with true pass (if such is the case).
                    // .. If uses a different host, then trigger an update right after the other host has finished its update - we need to allow the current cycle to finish first.
                    // .. Actually, let's then use the render cycle and do an immediate update + render instead (as a refine).
                    passer.boundary.host === remote.boundary.host ? passer.boundary.update(true) : passer.boundary.host.addRefreshCall(() => passer.boundary.update(true, null, null), true); // Render side.

                // Finally, add a listener to the remote's host. We'll use it to update the interested boundaries.
                // .. Importantly, we must use "render" flush. The "update" flush is too early (with case 1 below) as it's going on already (we're called from routinesApply.destroyBoundary).
                // .. Note. To do practical tests, see these two important special cases:
                // .... 1. Try having one source and remove it (-> null). If the inserter has withContent, then uses the interested ones, while refreshRemote wouldn't run (= already removed source).
                // .... 2. Try having two sources and remove one (-> refresh).
                if (interested)
                    remote.boundary.host.addRefreshCall(() => {
                        for (const b of interested)
                            b.update(true, null, null); // Force an immediate.
                    }, true); // On the render side.

                // Return infos.
                return infos;
            }

        } as ComponentRemoteType<CustomProps>
    }[name] as ComponentRemoteType<CustomProps> & {
        // /** The active ContentPasser instances: one for each insertion point. */
        // passers: Set<Component>;
        /** A component to render the content passes: simply combines all the unique content passes of the child remote together. */
        ContentPasser: ComponentType<{ props: ContentPasserProps<CustomProps>; static: { passers: Set<Component>; }; }>;
    };

    
    // - Finish off - //

    // Create content passer, that is used with the Remote.Content.
    // .. This is because the static side does not have a real content pass on .Content, but a component to render all active passes.
    const ContentPasser = {
        [name + ".Passer"]: class extends Component<{ props: ContentPasserProps<CustomProps>; }> {

            /** The active ContentPasser instances: one for each insertion point. */
            public static passers: Set<Component>; // = new Set();
            
            ["constructor"]: ComponentTypeWith<{ props: ContentPasserProps<CustomProps>; static: { passers: Set<Component>; }; }>;

            constructor(props: ComponentProps<{ props: ContentPasserProps<CustomProps>; }>, boundary: SourceBoundary) {
                super(props, boundary);
                // Bookkeeping.
                this.constructor.passers.add(this);
                // Listen to unmount.
                // .. As we're a special component that is directly used (vs. extendable basis), let's just use the listenTo flow.
                this.listenTo("willUnmount", () => this.constructor.passers.delete(this));
            }
            
            // Return a renderer to render a fragment for the content pass of each source.
            public render(props: ContentPasserProps<CustomProps>): MixDOMRenderOutput {
                // Use renderer.
                if (props.renderer)
                    return props.renderer(_Remote.sources.slice());
                // Render a fragment for the content pass of each source.
                return {
                    tag: null,
                    MIX_DOM_DEF: "fragment",
                    childDefs:
                        // Use wrapper.
                        props.wrapper ? _Remote.sources.map((source, i) => props.wrapper ? newDefFrom(props.wrapper(source, i)) :
                            props.copyKey != null ? source.copyContent(props.copyKey) : props.copy ? source.ContentCopy : source.Content
                        ).filter(def => def) as MixDOMDefTarget[] :
                        // Use filterer.
                        (props.filterer ? _Remote.sources.filter(props.filterer) : _Remote.sources)
                            // Use copyKey.
                            .map(source => props.copyKey != null ? source.copyContent(props.copyKey) : props.copy ? source.ContentCopy : source.Content)
                };
            }
        }
    }[name + ".Passer"];
    // Note. Like below, we assign the static members manually afterwards, so that /bundling doesn't ruin the dynamic name for the class.
    ContentPasser.passers = new Set();

    // Create unique Content - for the static side it's actually a def for the ContentPasser component.
    const RemoteContent = newDef(ContentPasser)!;

    // Create WithContent component.
    const WithContent = {
        [name + "." + wStr]: class extends Component<{ props: { hasContent?: boolean; }; }> {
            // Define constructor.
            ["constructor"]: ComponentTypeWith<{props: { hasContent?: boolean; }; static: { _WithContent: MixDOMDefTarget; withContents: Set<SourceBoundary>; }}>;
            // Instance side.
            constructor(props: { hasContent?: boolean; }, boundary?: SourceBoundary) {
                super(props, boundary);
                // Mark to interests.
                this.constructor.withContents.add(this.boundary);
                // Listen to unmount.
                // .. As we're a special component that is directly used (vs. extendable basis), let's just use the listenTo flow.
                this.listenTo("willUnmount", () => this.constructor.withContents.delete(this.boundary))
            }
            // For detection.
            public static _WithContent: MixDOMDefTarget | null;
            public static withContents: Set<SourceBoundary>;
            // Render.
            public render() {
                return (this.props.hasContent != null ? this.props.hasContent : _Remote.hasContent()) ? MixDOMContent : null;
            }
        } as ComponentRemoteType<CustomProps>["WithContent"]
        //
        // <- For some reason, needs to be explicitly specified here.
        // .. There's some tiny typing discrepancy in lates refines that pops up here for WithContent on the static side.
        // .. The core reason seems to revolve around the RemoteComponentType's static WithContent.
        // .... It's possible related to ComponentType's { api?: ComponentShadowAPI<Info> }, though could drop <Info> for that.
        // .... In any case, that's not the core reason. It rather looks like the _Info is not passed somewhere along the flow.
        //       - Even after clearing other problems, says _Info is `{} | undefined` in one, and `{ props: { hasContent?: boolean; }; } | undefined` in the other.
        //       - So very likely, it's something in relation to the 

    }[name + "." + wStr];
    // Note. Like below, we assign the static members manually afterwards, so that /bundling doesn't ruin the dynamic name for the class.
    WithContent._WithContent = RemoteContent;
    WithContent.withContents = new Set();
    
    // Note. We assign the static members manually afterwards, so that /bundling doesn't ruin the dynamic name for the class.
    // .. This is because the process would move the static assignments to be applied after in any case, and then use a variable shortcut for the class (-> ruining the name).
    (_Remote as Record<"MIX_DOM_CLASS", string>).MIX_DOM_CLASS = "Remote"; // We set a read-only value here on purpose.
    _Remote.sources = [];
    _Remote.ContentPasser = ContentPasser as ComponentType<{ props: ContentPasserProps<CustomProps>; }> as ComponentType<{ props: ContentPasserProps<CustomProps>; static: { passers: Set<Component>; }; }>;
    // Note that in all below, we don't have `getRemote()` in the def. It's because we don't have an actual pass here.
    _Remote.Content = RemoteContent;
    _Remote.ContentCopy = newDef(ContentPasser, { copy: true });
    _Remote.copyContent = (key?: any): MixDOMDefTarget | null => newDef(ContentPasser, { copy: true, copyKey: key });
    _Remote.hasContent = (filterer?: (remote: ComponentRemote<CustomProps>, i: number) => boolean): boolean =>
        filterer ? _Remote.sources.some((source, i) => filterer(source, i) && source.closure.hasContent()) : _Remote.sources.some(source => source.closure.hasContent());
    _Remote.filterContent = (filterer, copyKey?): MixDOMDefTarget | null => newDef(ContentPasser, { copyKey, filterer });
    _Remote.wrapContent = (wrapper, copyKey?): MixDOMDefTarget | null => newDef(ContentPasser, { copyKey, wrapper });
    _Remote.renderContents = (renderer) => newDef(ContentPasser, { renderer });
    _Remote.WithContent = WithContent;

    // Return the newly created remote component.
    return _Remote;
}
