
// - Imports - //

// Library.
import { cleanIndex, orderedIndex } from "data-signals";
// Typing.
import { MixDOMChangeInfos, MixDOMDefTarget, MixDOMPreComponentOnlyProps, MixDOMRenderOutput } from "../typing";
// Routines.
import { newContentPassDef, newDef, newDefFrom } from "../static/index";
// Common.
import { MixDOMContent } from "../common/index";
// Boundaries.
import { SourceBoundary, ContentClosure, MixDOMContentEnvelope } from "../boundaries/index";
// Host.
import { applyClosureEnvelope, applyClosureRefresh, collectInterestedInClosure, Host, mergeChanges, preRefreshClosure } from "../host/index";
// Local.
import { Component, ComponentFunc, ComponentType } from "./Component";


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
/** Props for the Remote component generally. Includes intrinsic signals. */
export interface ComponentRemoteProps extends MixDOMPreComponentOnlyProps {
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

    // Refreshing.
    /** Used internally. Whether can refresh the source or not. If it's not attached, cannot. */
    canRefresh(): boolean;
    /** Used internally in relation to the content passing updating process. */
    preRefresh(newEnvelope: MixDOMContentEnvelope | null): Set<SourceBoundary> | null;
    /** Used internally in relation to the content passing updating process. */
    applyRefresh(forceUpdate?: boolean): MixDOMChangeInfos;
    refreshRemote(forceRenderTimeout?: number | null): void;
}

// Remote class type.
/** Static class side for remote output. */
export interface ComponentRemoteType<CustomProps extends Record<string, any> = {}> extends ComponentType<{ props: ComponentRemoteProps & CustomProps; }> {

    readonly MIX_DOM_CLASS: string; // "Remote"

    // We are a static class, and when instanced output a remote source.
    new (props: ComponentRemoteProps & CustomProps, boundary?: SourceBoundary): ComponentRemote<CustomProps>;

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
     * - The Content pass for the remote is found at `remote.Content`, where you can also find `ContentCopy`, `copyContent` and other such.
     */
    wrapContent: (wrapper: (remote: ComponentRemote<CustomProps>, iRemote: number) => MixDOMRenderOutput, copyKey?: any) => MixDOMDefTarget | null;
    /** Alternative way to handle inserting the remote contents - all remotes together in a custom manner.
     * - The Content pass for each remote is found at `remote.Content`, where you can also find `ContentCopy`, `copyContent` and other such.
     */
    renderContent: (handler: (remotes: Array<ComponentRemote<CustomProps>>) => MixDOMRenderOutput) => MixDOMDefTarget | null;

    /** A custom component (func) that can be used for remote conditional inserting. If any source is active and has content renders, otherwise not.
     * - For example: `<MyRemote.WithContent><div class="popup-container">{MyRemote.Content}</div></MyRemote.WithContent>`
     *      * Results in `<div class="popup-container">...</div>`, where ... is the actual content passed (by remote source).
     *      * However, if there was no actual content to pass, then results in `null`.
     * - This is very typically used for adding some wired elements to a popup remote, like in the above example.
     */
    WithContent: ComponentType<{props: { hasContent?: boolean; }; }> & {
        /** Should contain the content pass object. For parental passing it's the MixDOM.Content object. For remotes their Content pass object with its getRemote() method. */
        _WithContent: MixDOMDefTarget;
    };
    /** Check whether is the real thing or an empty pseudo remote. */
    isRemote(): boolean;

    // Sources - used internally.
    /** The active remote sources. */
    sources: ComponentRemote<CustomProps>[];
    /** Add a remote source - used internally. */
    addSource(remote: ComponentRemote<CustomProps>): void;
    /** Remove a remote source - used internally.
     * - Note that this only returns remove related infos - any additions or updates are run by a host listener afterwards.
     */
    removeSource(remote: ComponentRemote<CustomProps>): MixDOMChangeInfos | null;

    // // Private.
    // /** A component to render the content passes: simply combines all the unique content passes of the child remote together. */
    // ContentPasser: ComponentFunc<{ props: ContentPasserProps; }>;
    // /** The active ContentPasser instances: one for each insertion point. */
    // passers: Set<Component>;

}


// - Create - //

/** Create a component for remote content. */
export const createRemote = <CustomProps extends Record<string, any> = {}>(): ComponentRemoteType<CustomProps> =>

    class _Remote extends Component<{ props: ComponentRemoteProps & CustomProps; }> {


        // - Members - //

        /** The constructor is typed as ComponentRemoteType. */
        ["constructor"]: ComponentRemoteType<CustomProps>;

        public closure: ContentClosure = new ContentClosure(null, this.boundary);
        public Content: MixDOMDefTarget = { ...newContentPassDef(this), contentPass: null, getRemote: () => this as ComponentRemote };
        public ContentCopy: MixDOMDefTarget = { ...newContentPassDef(this, true), contentPass: null, getRemote: () => this as ComponentRemote };
        public copyContent = (key?: any): MixDOMDefTarget => ({ ...newContentPassDef(key ?? _Remote, true), contentPass: null, getRemote: () => this as ComponentRemote });


        // - Instanced - //

        public canRefresh(): boolean {
            return true; // _Remote.source === this;
        }

        public preRefresh(newEnvelope: MixDOMContentEnvelope | null): Set<SourceBoundary> | null {
            // Pass the preRefresh (part 1/2) from closure to closure.
            return preRefreshClosure(this.closure, newEnvelope, this as ComponentRemote) || null;
        }

        public applyRefresh(forceUpdate: boolean = false): MixDOMChangeInfos {
            // Pass the applyRefresh (part 2/2) from closure to closure.
            return applyClosureRefresh(this.closure, forceUpdate) || [ [], [] ];
        }

        /** This doesn't return the infos as they can belong to two different hosts.
         * - Instead it absorbs the changes to each host and makes sure micro-timing is correct.
         */
        public refreshRemote(forceRenderTimeout?: number | null): void {
            // Cancel, if already been applied - or if the remove process had run and source is different (it pre-assigns us).
            const closure = this.closure;
            const boundary = this.boundary;
            console.log(" REFRESH REMOTE ", boundary.closure.envelope === closure.envelope ? "same envelope" : boundary.closure.envelope, closure.sourceBoundary === boundary ? "same source" : closure.sourceBoundary, this.isMounted() ? " is mounted" : "unmounted");

            if (boundary.closure.envelope === closure.envelope)
                return;

            // Assign source.
            

            closure.sourceBoundary = boundary;
            // Refresh envelope.
            const [rInfos, bCalls ]= applyClosureEnvelope(closure, boundary.closure.envelope);
            // Absorb changes - immediately if also removed old.
            if (rInfos[0] || bCalls[0])
                boundary.host.services.absorbChanges(rInfos, bCalls, forceRenderTimeout);

            console.log(" DOES THIS HAPPEN..???", this.isMounted(), rInfos, bCalls);

            
            //
            // <-- IT HAPPENS WHEN _UNMOUNTS A SOURCE_.. 
            // .. Then... SHOULD UNMOUNT IT CORRECTLY HERE.

            // It is not triggered when a source is added..
            //
            // <
        }

        // Make sure renders null.
        public render() {
            return null;
        }


        // - Static - //

        public static MIX_DOM_CLASS = "Remote";
        /** A component to render the content passes: simply combines all the unique content passes of the child remote together. */
        private static ContentPasser: ComponentFunc<{ props: ContentPasserProps<CustomProps>; }> = (_initProps, component) => {
            // Bookkeeping.
            _Remote.passers.add(component);
            component.listenTo("willUnmount", () => _Remote.passers.delete(component));
            // Return a renderer to render a fragment for the content pass of each source.
            return (props): MixDOMRenderOutput => {
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
            };
        };

        /** The active ContentPasser instances: one for each insertion point. */
        private static passers: Set<Component> = new Set();
        /** The active remote source instances. */
        public static sources: ComponentRemote<CustomProps>[] = [];


        // - Static public usage - //

        public static Content: MixDOMDefTarget | null = newDef(_Remote.ContentPasser);
        public static ContentCopy: MixDOMDefTarget | null = newDef(_Remote.ContentPasser, { copy: true });
        public static copyContent = (key?: any): MixDOMDefTarget | null => newDef(_Remote.ContentPasser, { copy: true, copyKey: key });
        public static filterContent = (filterer, copyKey?): MixDOMDefTarget | null => newDef(_Remote.ContentPasser, { copyKey, filterer });
        public static wrapContent = (wrapper, copyKey?): MixDOMDefTarget | null => newDef(_Remote.ContentPasser, { copyKey, wrapper });
        public static renderContent = (renderer) => newDef(_Remote.ContentPasser, { renderer });

        public static WithContent = class WithContent extends Component<{ props: { hasContent?: boolean; }; }> {
            public static _WithContent = _Remote.Content as MixDOMDefTarget;
            public render() {
                return (this.props.hasContent != null ? this.props.hasContent : _Remote.sources && _Remote.sources.some(source => source.closure.hasContent())) ? MixDOMContent : null;
            }
        };
        
        public static isRemote(): boolean { return true; }


        // - Static helpers - //

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
            for (const passer of _Remote.passers)
                passer.boundary.update(true);
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
            // Finally, add a listener to the remote's host. We'll use it to refresh a better source and also to update the interested boundaries.
            // .. Importantly, we must use "render" flush. The "update" flush is too early (with case 1 below) as it's going on already (we're called from routinesApply.destroyBoundary).
            // .. Note. To do practical tests, see these two important special cases:
            // .... 1. Try having one source and remove it (-> null). If the inserter has withContent, then uses the interested ones, while refreshRemote wouldn't run (= already removed source).
            // .... 2. Try having two sources and remove the active one (-> refresh). The refreshRemote should run to update the content.

            // HMM...
            // ..... NO LONGER BETTER SOURCE ... BUT UPDATE INTERESTED BOUNDARIES....

            const withSourceRefresh = true;

            if (withSourceRefresh || interested)
                remote.boundary.host.addRefreshCall(() => {
                    // Before we refresh the remote connections, let's premark all our interested boundaries to have no remote content (childDefs: []).
                    // .. If the refreshing finds a new remote, it will update the content then again, before the actual update is run.
                    if (interested) {
                        for (const b of interested)
                            b.host.services.absorbUpdates(b, { force: true });
                    }
                    // Refresh the remote.
                    if (withSourceRefresh)
                        remote.refreshRemote();
                }, true); // On the render side.

            // Trigger a forced update for the insertion boundaries.
            for (const passer of _Remote.passers)
                passer.boundary.update(true);

            // Return infos.
            return infos;
        }

    };
