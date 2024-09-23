
// - Imports - //

// Typing.
import { MixDOMChangeInfos, MixDOMDefTarget, MixDOMPreComponentOnlyProps } from "../typing";
// Routines.
import { newContentPassDef } from "../static/index";
// Common.
import { MixDOMContent } from "../common/index";
// Boundaries.
import { SourceBoundary, ContentClosure, MixDOMContentEnvelope } from "../boundaries/index";
// Host.
import { applyClosureEnvelope, applyClosureRefresh, collectInterestedInClosure, mergeChanges, preRefreshClosure } from "../host/index";
// Local.
import { Component, ComponentType } from "./Component";


// - TODO (v4) - //
//
// MAIN IDEA:
//  - Drop the IMPORTANCE, and instead FEED MULTIPLE TO THE SAME.
//      .. (Unless breaks the concept - but shouldn't really, since each remote has its own content and can be multiplied anyway.)
//  - RENAME to "Remote":

// - MAIN IDEA (v4.0) - //
// 
// BASICS:
//  - We have one kind of remote: ComponentRemote.
//      * It can be used directly or shared via context data (and then using onData() -> setState() flow).
//  - The basic idea is that there's an INPUT SOURCE and STREAM OUTPUT parts.
//      * The input is an instance of the ComponentRemote class, while output is handled by the static side: ComponentRemoteType.
//      * As there can be many instances of a remote, the output can actually receive content from multiple sources.
//      * The static output side can be used just like with MixDOM shortcut: MyRemote.Content, MyRemote.ContentCopy, MyRemote.copyContent(...) and <MyRemote.WithContent>...</MyRemote.WithContent>
//  - To account for situations where you might have access to a remote but it might be empty, there's a MixDOM.EmptyRemote pseudo class.
//      * It actually extends PseudoEmpty but has typing of ComponentRemoteType. You can use its public members and methods in the flow, they'll just return null.
//  - Note that the children needs are handled directly by using a unique WithContent component for each remote: `<MyRemote.WithContent>...</MyRemote.WithContent>`.
//      * It simply renders `null` if the remote has no active content (= no sources, or all sources rendered `null`), or otherwise renders the given content.
//  - Note that in v4, the content can have multiple sources and there is no concept of overriding.



// - Typing - //

/** Props for the Remote component generally. Includes intrinsic signals. */
export interface ComponentRemoteProps extends MixDOMPreComponentOnlyProps {}
/** Instanced remote source. */
export interface ComponentRemote extends Component<{ props: ComponentRemoteProps; }> {
    /** The constructor is typed as ComponentRemoteType. */
    ["constructor"]: ComponentType & ComponentRemoteType; // For some reason we need ComponentType reassurance here or the compile module.d.ts will have an error here (with incompatible contructor.api).
    /** In v4, each remote instance has its own closure. */
    closure: ContentClosure;
    /** Used internally. Whether can refresh the source or not. If it's not attached, cannot. */
    canRefresh(): boolean;
    /** Used internally in relation to the content passing updating process. */
    preRefresh(newEnvelope: MixDOMContentEnvelope | null): Set<SourceBoundary> | null;
    /** Used internally in relation to the content passing updating process. */
    applyRefresh(forceUpdate?: boolean): MixDOMChangeInfos;
    refreshRemote(forceRenderTimeout?: number | null): void;
    // /** To refresh sub mixing - mainly the importance prop. */
    // refreshSource(forceRenderTimeout?: number | null): void;
    // //
    // // <-- .. NO LONGER IMPORTANCE..

    // /** Returns info for removal and additions. */
    // reattachSource(): MixDOMChangeInfos | null;
}
/** Static class side for remote output. */
export interface ComponentRemoteType extends ComponentType<{ props: ComponentRemoteProps; }> {

    readonly MIX_DOM_CLASS: string; // "Remote"

    // We are a static class, and when instanced output a remote source.
    new (props: ComponentRemoteProps, boundary?: SourceBoundary): ComponentRemote;

    // Public members - for usage inside the render output.
    Content: MixDOMDefTarget | null;
    ContentCopy: MixDOMDefTarget | null;
    copyContent: (key?: any) => MixDOMDefTarget | null;
    /** A custom component (func) that can be used for remote conditional inserting.
     * - For example: `<MyRemote.WithContent><div class="popup-container">{MyRemote.Content}</div></MyRemote.WithContent>`
     *      * Results in `<div class="popup-container">...</div>`, where ... is the actual content passed (by remote source).
     *      * However, if there was no actual content to pass, then results in `null`.
     * - This is very typically used for adding some wired elements to a popup remote, like in the above example.
     */
    WithContent: ComponentType<{props: { hasContent?: boolean; }; }> & {
        /** Should contain the content pass object. For parental passing it's the MixDOM.Content object. For remotes their Content pass object with its getRemote() method. */
        _WithContent: MixDOMDefTarget;
    };
    isRemote(): boolean;

    // Internal members.

    // sourceClosures: Map<ComponentRemote, ContentClosure>;
    //
    // <--- we could hold as a map... 
    // ..... But...

    // closure: ContentClosure;
    // boundary: SourceBoundary;
    // source: ComponentRemote | null;
    //
    // <-- HERE.. WE'D LIKE ... TO USE... MULTIPLE SOURCES...
    // .. WE ALREADY HAV THEM.. BUT WE'D JUST LIIKE TO USE THEM ALL..
    // ... NOT PIKCING CLOSURE & SOURCE...
    // <--- IS IT SO.. HAT OUR CONTENTCLOSURE STAYS CONSTANT..? OR AND...
    //
    // <-- NO HEY... IT'S LIEKLY MUCH SIMPLER..
    // ... IT'S LIKELY.. MORE LIKE .... EACH SOURCE HAS ITS OWN CONTENT CLOSURE..!
    // ... WHEN ADDS A SOURCE, ADDS CONTNT CLOSURE..
    //
    // ---> IN OTHRE WORDS..
    //... THE INSTANCE SIDE... COULD SIMPLY HOLD THE CLOSURE ..!!!! the source could hold its own content closure..!
    //
    // .... I MEAN.. 
    // ... RE-THINK THE WHOLE CONCEPT: It's simply that STATIC and INSTANCE side are linked.
    // ...... And each INSTANCE SOURCE will simply be added to the CONTENT INSERTIONS...!
    // ..... And... in the ROUTINES... It's simply that loops all closures - ie. sources and adds in order..
    //
    // ... INSTEAD .. OF .. "IMPORTANCE".... COULD SAY "ORDER"....!
    //
    // .. OR.. ALTERNATIVE..
    // ... EACH REMOTE WOULD HAVE "NAMED" STREAMS... AND HAS TO DEFINE THE NAME IN THE REMOTE..
    // ... ... AND IF THERE IS DUPLCIATE.... THEN .... WHAT..? THEN OVERRIDES..??
    //
    // .. anyway. the point would be that the INSERTER CAN DEFINE WHICH + ORDER..!
    // <>{SomeRemote.contents.Popup}{SomeRemote.contents.ToolTip}</>
    // 
    // <--- BUT FOR THIS.. SHOULD REALLY JUST USE MULTIPLE REMOTES... ? It anyway has _nothing_ to do with the overriding...

    sources: ComponentRemote[];

    // Internal methods.
    /** Add a remote source - used internally. */
    addSource(remote: ComponentRemote): void;
    /** Remove a remote source - used internally.
     * - Note that this only returns remove related infos - any additions or updates are run by a host listener afterwards.
     */
    removeSource(remote: ComponentRemote, withSourceRefresh?: boolean): MixDOMChangeInfos | null;
    // /** Returns info for removal and additions.
    //  * - Note that this does not include the destruction info, if it belongs to another host.
    //  *      * Instead in that case will execute the destruction immediately in that other host, and return info about addition if any.
    //  *      * This is to avoid rare bugs from arising, eg: in HostRender marking external elements is host based.
    //  */
    // reattachSourceBy(remote: ComponentRemote): MixDOMChangeInfos | null;
    // /** This doesn't return the infos as they can belong to two different hosts.
    //  * - Instead it absorbs the changes to each host and makes sure micro-timing is correct.
    //  */
    // refreshRemote(forceRenderTimeout?: number | null): void;
}


// - Create - //

/** Create a component for remote content. */
export const createRemote = (): ComponentRemoteType =>
    class _Remote extends Component<{ props: ComponentRemoteProps; }> {


        // - Members - //

        /** The constructor is typed as ComponentRemoteType. */
        ["constructor"]: ComponentRemoteType;

        public closure: ContentClosure = new ContentClosure(null, this.boundary);


        // - Instanced - //

        public canRefresh(): boolean {
            return true; // _Remote.source === this;
        }

        public preRefresh(newEnvelope: MixDOMContentEnvelope | null): Set<SourceBoundary> | null {
            // Pass the preRefresh (part 1/2) from closure to closure.
            return preRefreshClosure(this.closure, newEnvelope, this) || null;
        }

        public applyRefresh(forceUpdate: boolean = false): MixDOMChangeInfos {
            // Pass the applyRefresh (part 2/2) from closure to closure.
            return applyClosureRefresh(this.closure, forceUpdate) || [ [], [] ];
        }

        // /** Returns info for removal and additions. */
        // public reattachSource(): MixDOMChangeInfos | null {
        //     return _Remote.reattachSourceBy(this);
        // }

        /** This doesn't return the infos as they can belong to two different hosts.
         * - Instead it absorbs the changes to each host and makes sure micro-timing is correct.
         */
        public refreshRemote(forceRenderTimeout?: number | null): void {
            // Function to add new.
            // Cancel, if already been applied - or if the remove process had run and source is different (it pre-assigns us).
            const closure = this.closure;
            const boundary = this.boundary;
            if (boundary.closure.envelope === closure.envelope)
                return;

            // <--alwys..

            // Assign source.
            closure.sourceBoundary = boundary;
            // Refresh envelope.
            const [rInfos, bCalls ]= applyClosureEnvelope(closure, boundary.closure.envelope);
            // Absorb changes - immediately if also removed old.
            if (rInfos[0] || bCalls[0])
                boundary.host.services.absorbChanges(rInfos, bCalls, forceRenderTimeout);
        }

        // Make sure renders null.
        public render() {
            return null;
        }


        // - Static - //

        public static MIX_DOM_CLASS = "Remote";
        // public static boundary: SourceBoundary | null = null;
        // public static closure: ContentClosure = new ContentClosure();
        // public static source: ComponentRemote | null = null;
        public static sources: ComponentRemote[] = [];


        // - Static external usage - //

        public static Content: MixDOMDefTarget | null = { ...newContentPassDef(_Remote), contentPass: null, getRemote: () => _Remote };
        public static ContentCopy: MixDOMDefTarget | null = { ...newContentPassDef(_Remote, true), contentPass: null, getRemote: () => _Remote };
        public static copyContent = (key?: any): MixDOMDefTarget | null => ({ ...newContentPassDef(key ?? _Remote, true), contentPass: null, getRemote: () => _Remote });
        public static WithContent = class WithContent extends Component<{ props: { hasContent?: boolean; }; }> {
            public static _WithContent = _Remote.Content as MixDOMDefTarget;
            public render() {
                return (this.props.hasContent != null ? this.props.hasContent : _Remote.sources && _Remote.sources.some(source => source.closure.hasContent())) ? MixDOMContent : null;
            }
        };
        
        public static isRemote(): boolean { return true; }


        // - Static helpers - //

        /** Add a remote source - used internally. */
        public static addSource(remote: ComponentRemote, atIndex: number = -1): void {
            // Add as an active source.
            const nSourcesWas = _Remote.sources.length;
            const iNow = _Remote.sources.indexOf(remote);
            if (iNow === -1) {
                atIndex = atIndex < 0 ? Math.max(0, atIndex + nSourcesWas) : Math.min(atIndex, nSourcesWas);
                atIndex === nSourcesWas ? _Remote.sources.push(remote) : _Remote.sources.splice(atIndex, 0, remote);
            }
            // Already there.
            else {
                atIndex = atIndex < 0 ? Math.max(0, atIndex + nSourcesWas - 1) : Math.min(atIndex, nSourcesWas - 1);
                if (iNow === atIndex)
                    return;
                // Move.
                _Remote.sources.splice(iNow, 1);
                _Remote.sources.splice(atIndex, 0, remote);
            }

            // Update closure..?

        }

        /** Remove a remote source - used internally.
         * - Note that this only returns remove related infos - any additions or updates are run by a host listener afterwards.
         */
        public static removeSource(remote: ComponentRemote, withSourceRefresh: boolean = true): MixDOMChangeInfos | null {
            // Not found.
            const iRemote = _Remote.sources.indexOf(remote);
            if (iRemote === -1)
                return null;
            // Remove from local bookkeeping.
            _Remote.sources.splice(iRemote, 1);
            // Collect interested. We won't mark anything, just collect them.
            let infos: MixDOMChangeInfos | null = null;
            const interested: Set<SourceBoundary> | null = collectInterestedInClosure(remote.closure, remote);
            // Apply null to the envelope to destroy the content.
            infos = applyClosureEnvelope(remote.closure, null);
            // Nullify the references, to mark that we have no active source now.
            remote.closure.sourceBoundary = null;
            // Finally, add a listener to the remote's host. We'll use it to refresh a better source and also to update the interested boundaries.
            // .. Importantly, we must use "render" flush. The "update" flush is too early (with case 1 below) as it's going on already (we're called from routinesApply.destroyBoundary).
            // .. Note. To do practical tests, see these two important special cases:
            // .... 1. Try having one source and remove it (-> null). If the inserter has withContent, then uses the interested ones, while refreshRemote wouldn't run (= already removed source).
            // .... 2. Try having two sources and remove the active one (-> refresh). The refreshRemote should run to update the content.
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
                        remote.refreshRemote(); // _Remote.refreshRemote();
                }, true); // On the render side.
            // Return infos.
            return infos;
        }

        // /** Returns info for removal and additions.
        //  * - Note that this does not include the destruction info, if it belongs to another host.
        //  *      * Instead in that case will execute the destruction immediately in that other host, and return info about addition if any.
        //  *      * This is to avoid rare bugs from arising, eg: in MixDOMRender marking external elements is host based.
        //  */
        // public static reattachSourceBy(source: ComponentRemote): MixDOMChangeInfos | null {
        //     // Same source, or cannot hijack forcibly.
        //     // .. Note. We use source.boundary._outerDef.props (as opposed to remote.props) to get the freshest situation.
        //     const oldSource = _Remote.source;
        //     if (oldSource === source || (((source.boundary._outerDef.props as ComponentRemoteProps).importance || 0) <= (oldSource ? (oldSource.boundary._outerDef.props as ComponentRemoteProps).importance || 0 : -Infinity)))
        //         return null;
        //     // Get changes.
        //     let infos: MixDOMChangeInfos | null = null;
        //     const boundary = source.boundary;
        //     if (oldSource) {
        //         infos = applyClosureEnvelope(_Remote.closure, null);
        //         // If the host for destruction is different from the source's host, we should execute it in it instead - immediately.
        //         if (infos && boundary.host !== oldSource.boundary.host) {
        //             oldSource.boundary.host.services.absorbChanges(infos[0], infos[1], null);
        //             infos = null;
        //         }
        //     }
        //     // Take over.
        //     _Remote.source = source;
        //     _Remote.closure.sourceBoundary = boundary;
        //     // Apply the envelope - unless there's nothing to apply.
        //     // .. Note that we never get here if the source was already this remote. So our envelope is nouveau for _Remote.closure.
        //     if (boundary.closure.envelope)
        //         infos = mergeChanges(infos, applyClosureEnvelope(_Remote.closure, boundary.closure.envelope));
        //     // Return changes - for both destruction and additions.
        //     return infos;
        // }

        // /** This doesn't return the infos as they can belong to two different hosts.
        //  * - Instead it absorbs the changes to each host and makes sure micro-timing is correct.
        //  */
        // public static refreshRemote(forceRenderTimeout?: number | null): void {
        //     // Get best remote - stop if already there.
        //     const remote = _Remote.getBestRemote();
        //     const oldSource = _Remote.source || null;
        //     if (remote === oldSource)
        //         return;
        //     const closure = _Remote.closure;
        //     // Function to add new.
        //     const addNew = remote ? (didRemove = true) => {
        //         // Cancel, if already been applied - or if the remove process had run and source is different (it pre-assigns us).
        //         const boundary = remote.boundary;
        //         if (boundary.closure.envelope === closure.envelope || didRemove && _Remote.source !== remote)
        //             return;
        //         // Assign source.
        //         _Remote.source = remote;
        //         closure.sourceBoundary = boundary;
        //         // Refresh envelope.
        //         const [rInfos, bCalls ]= applyClosureEnvelope(closure, boundary.closure.envelope);
        //         // Absorb changes - immediately if also removed old.
        //         if (rInfos[0] || bCalls[0])
        //             boundary.host.services.absorbChanges(rInfos, bCalls, didRemove ? null : forceRenderTimeout);
        //     } : null;
        //     // Remove.
        //     // .. Already has a source.
        //     if (oldSource) {
        //         // Remove old.
        //         const oldHost = oldSource.boundary.host;
        //         let oldInfos = applyClosureEnvelope(closure, null);
        //         // Clear - or actually set the new ones in place already.
        //         // .. This way, we can prevent multiple refreshes - and according recursive addition problems.
        //         _Remote.source = remote;
        //         closure.sourceBoundary = remote && remote.boundary;
        //         // Did get removal infos.
        //         if (oldInfos[0][0] || oldInfos[1][0]) {
        //             if (addNew)
        //                 oldHost.addRefreshCall(addNew, false); // On the update side.
        //             oldHost.services.absorbChanges(oldInfos[0], oldInfos[1], forceRenderTimeout);
        //         }
        //         // Just add, if even that.
        //         else if (addNew)
        //             addNew();
        //     }
        //     // .. Just add.
        //     else if (addNew)
        //         addNew(false);
        // }

    }


// - Backup notes - //
// 
// 
// - MAIN IDEA (v3.1) - //
// 
// BASICS:
//  - We have one kind of remote: ComponentRemote.
//      * It can be used directly or shared via context data (and then using onData() -> setState() flow).
//  - The basic idea is that there's an INPUT SOURCE and STREAM OUTPUT parts.
//      * The input is an instance of the ComponentRemote class, while output is handled by the static side: ComponentRemoteType.
//      * As there can be many instances of a remote, there is mixing on the static class side to decide which one is the active source.
//      * The static output side can be used just like with MixDOM shortcut: MyRemote.Content, MyRemote.ContentCopy, MyRemote.copyContent(...) and <MyRemote.WithContent>...</MyRemote.WithContent>
//  - To account for situations where you might have access to a remote but it might be empty, there's a MixDOM.EmptyRemote pseudo class.
//      * It actually extends PseudoEmpty but has typing of ComponentRemoteType. You can use its public members and methods in the flow, they'll just return null.
//  - Note that as of v3.1, there's no more need to keep meticulous bookkeeping of children needs.
//      * Instead, each Remote class provides a component for the WithContent feature: `<MyRemote.WithContent>...</MyRemote.WithContent>`.
//      * It simply renders `null` if the remote has no active content (= no source, or source rendered `null`), or otherwise renders the given content.
// 
// 
// - OLD MAIN IDEA (v3.0) - //
// 
// I - BASICS:
//  - We have one kind of remote: ComponentRemote.
//      * It can be used directly or shared via context data (and then using onData() -> setState() flow).
//  - The basic idea is that there's an INPUT SOURCE and STREAM OUTPUT parts.
//      * The input is an instance of the ComponentRemote class, while output is handled by the static side: ComponentRemoteType.
//      * As there can be many instances of a remote, there is mixing on the static class side to decide which one is the active source.
//      * The static output side can be used just like with MixDOM shortcut: Remote.Content, Remote.ContentCopy, Remote.copyContent(...) and Remote.withContent(...)
//  - To account for situations where you might have access to a remote but it might be empty, there's a MixDOM.EmptyRemote pseudo class.
//      * It actually extends PseudoEmpty but has typing of ComponentRemoteType. You can use its public members and methods in the flow, they'll just return null.
//
// II - CHILDREN NEEDS:
//  - Finally we also need to do bookkeeping of children needs so that can use withContent as well as specifically define needs for a boundary.
//      * Like always, this is done via contentAPI, but with the getFor(Remote, ...) method.
//  - When you have stable access to the remote, it's relatively straightforward: just use contentApi.getFor(MyRemote) to get the children or .needsFor to mark the needs.
//      * As normally, using the getFor method also by default marks the "temp" needs to the contentAPI's bookkeeping.
//  - If you don't have stable access, you should use a memo and run it when the remote has changed (eg. in state.PopupRemote).
//      * The memo's mount part should set the needs, eg. `contentAPI.needsFor(MyRemote, true)`, and the unmount part unset them `.needsFor(MyRemote, null)`.
//      * If you have EmptyRemotes in the flow you can use `MyRemote.isRemote()` method to tell which is a real remote. The ContentAPI methods also use it internally.
//  - Note that normally you never need to assign specific needs.
//      * You can just insert the content by `MyRemote.Content`, or use a wrapper that auto-sets needs: `MyRemote.withContent(...)` or to handle each kid with auto needs `contentAPI.getFor(MyRemote)`.
// 
// 
// - OLD MAIN IDEA (on the way to v3.0) - //
// 
// DEV. NOTE:
// .. The ContextRemotes concept was dropped as you can achieve the same ends via sharing the remote through context data.
// .. As the idea below shows, it required relatively lot of technical additions in many parts of code (minified to about 3kb), also related to typing.
// .... In addition, swapping elements fluently in the render scope using ContextRemotes did not work in the original v3.0.0: instead it unmounted and mounted them. (It works for normal Remotes.)
// .... The only real drawback of not having ContextRemotes is that if you ever need to specifically set needs to a remote, you should use a memo. However, it's extremely rare to need to do this.
// .... Otherwise everything can be done in the normal flow (listenToData -> setState) taking maybe one or two lines of code more than would with ContextRemotes. And fewer things to learn.
//
// I - BASICS:
//  - We have two kinds of remotes: ComponentRemote and ComponentContextRemote.
//      * The ComponentRemote is the basis that allows to insert content, while ComponentContextRemote connects to a ComponentRemote via context.
//  - For ComponentRemote:
//      * The basic idea is that there's an INPUT SOURCE and STREAM OUTPUT parts.
//          - The input is an instance of the ComponentRemote class, while output is handled by the static side: ComponentRemoteType.
//          - As there can be many instances of a remote, there is mixing on the static class side to decide which one is the active source.
//          - The static output side can be used just like with MixDOM shortcut: Remote.Content, Remote.ContentCopy, Remote.copyContent(...) and Remote.withContent(...)
//  - For ComponentContextRemote:
//      * Things are a bit different, as each instance is located in a different part of tree, and can thus have different context -> different output remote.
//          - So instead, for inputting, each source connects independently to the output as a source. (If context toggles off, removes itself from being a source.)
//      * The static output side works similarly: Remote.Content, Remote.ContentCopy, Remote.copyContent(...) and Remote.withContent(...)
//          - Likewise the location (of the output def) in the grounded tree makes a difference, as it reads contexts at that location.
//      * Accordingly, and a bit surprisingly, context remotes are created through: MixDOM.createContextRemote(ctxName, remoteName).
//          - You can also use context.getRemote(), but it actually returns a ComponentRemote, not ComponentContextRemote (as it's always attached to the context).
//          - The contextAPI holds no methods for remotes. (To avoid unnecessary bookkeeping, instead just store it in the initializing closure or meta or as a class member.)
//
// II - CHILDREN MARKING:
//  - Finally we also need to do bookkeeping of children needs so that can use withContent as well as specifically define needs for a boundary.
//      * This is done via contentAPI's getFor method.
//      * For ComponentRemote, it's relatively straight forward: eg. use contentApi.getFor(MyRemote) to get the children and mark the needs.
//      * For ComponentContextRemote, it's a bit more complicated, as it's impossible to determine where the reading point is.
//          - So instead, you must manually give the surrounding contexts: contentApi.getFor(MyRemote, _skipNeeds, _shallowCopy, contexts)
// - The marking also adds the remote to the boundary's contentApi (if found, which is requirement for setting needs).
//      * So when the boundary renders again, it can clear the temporary needs (refering to it) from the bookkeeping in the remote class.
