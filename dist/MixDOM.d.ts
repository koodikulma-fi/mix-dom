import { CompareDepthMode } from 'data-memo';
import { ContextsAllType, ContextAPIType, ContextAPI, RefreshCycle, SignalBoy, OmitPartial, SetLike, IsAny, SignalManType, SignalMan, NodeJSTimeout, SignalListener, SignalBoyType, Context, SignalsRecord } from 'data-signals';
import { DOMTags, DOMAttributesBy_native, DOMAttributesBy_camelCase, DOMElement, DOMDiffProps, DOMAttributesAny_camelCase, DOMAttributes_camelCase, DOMAttributesAny_native, DOMAttributes_native, DOMCleanProps } from 'dom-types';
import { AsClass, ClassType, InstanceTypeFrom, IterateBackwards, ReClass } from 'mixin-types';

/** The intrinsic attributes for JSX in native (for listeners and aria props). Recommended when wanting to match traditional string like HTML code inputting (can often just copy-paste the string, and works as TSX directly). */
type IntrinsicAttributesBy_native = {
    [CompOrEl: string]: MixDOMInternalDOMProps;
} & Record<DOMTags, MixDOMInternalDOMProps> & DOMAttributesBy_native;
/** The intrinsic attributes for JSX in camelCase (for listeners and aria props). Recommended as a default. */
type IntrinsicAttributesBy_camelCase = {
    [CompOrEl: string]: MixDOMInternalDOMProps;
} & Record<DOMTags, MixDOMInternalDOMProps> & DOMAttributesBy_camelCase;
/** The intrinsic attributes for JSX in both: native and camelCase (for listeners and aria props). Not typically recommended, but can of course be used. (It's usually best to pick either native or camelCase way and stick to it.) */
type IntrinsicAttributesBy_mixedCase = IntrinsicAttributesBy_camelCase & IntrinsicAttributesBy_native;
/** Include this once in your project in a file included in TS/TSX compilation:
 * - Note that the JSX_camelCase namespace uses _camelCase_ for DOM attributes related to listeners and aria. To use native, use `JSX_native`, or both with `JSX_mixedCase`.
 *
 * ```
import { JSX_camelCase } from "mix-dom";
declare global {
    namespace JSX {
        interface IntrinsicElements extends JSX_camelCase.IntrinsicElements {}
        interface IntrinsicAttributes extends JSX_camelCase.IntrinsicAttributes {}
    }
}
```
 */
declare namespace JSX_camelCase {
    /** This gives support for:
     * - It adds generic support for "_key", "_ref" and "_disable" props (by catch phrase)
     *      * Note however that the "_signals" prop is component specific, so uses the initial props on constructor or func.
     *          * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMInternalCompProps included.
     *      * Similarly the "_contexts" prop is gotten through the props, even though it's not component specific (though could be, but it's not necessarily desired).
     * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
     *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
     */
    interface IntrinsicElements extends IntrinsicAttributesBy_camelCase {
    }
    /** This is needed for components mostly. The IntrinsicElements gets ignored for them when defines precise typing: eg. (props: SomeProps).
     * - However, IntrinsicAttributes then brings those to all (dom and components), so we provide here the three basic: "_key", "_ref" and "_disable".
     * - We leave "_signals" and "_contexts" to be found on the init props if looks in there.
     */
    interface IntrinsicAttributes extends MixDOMInternalBaseProps {
    }
}
/** Include this once in your project in a file included in TS/TSX compilation:
 * - Note that the JSX namespace uses _native_ for DOM attributes related to listeners and aria. To use camelCase, use `JSX_camelCase`, or both with `JSX_mixedCase`.
 *
 * ```
import { JSX_native } from "mix-dom";
declare global {
    namespace JSX {
        interface IntrinsicElements extends JSX_native.IntrinsicElements {}
        interface IntrinsicAttributes extends JSX_native.IntrinsicAttributes {}
    }
}
```
 */
declare namespace JSX_native {
    /** This gives support for:
     * - It adds generic support for "_key", "_ref" and "_disable" props (by catch phrase)
     *      * Note however that the "_signals" prop is component specific, so uses the initial props on constructor or func.
     *          * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMInternalCompProps included.
     *      * Similarly the "_contexts" prop is gotten through the props, even though it's not component specific (though could be, but it's not necessarily desired).
     * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
     *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
     */
    interface IntrinsicElements extends IntrinsicAttributesBy_native {
    }
    /** This is needed for components mostly. The IntrinsicElements gets ignored for them when defines precise typing: eg. (props: SomeProps).
     * - However, IntrinsicAttributes then brings those to all (dom and components), so we provide here the three basic: "_key", "_ref" and "_disable".
     * - We leave "_signals" and "_contexts" to be found on the init props if looks in there. */
    interface IntrinsicAttributes extends MixDOMInternalBaseProps {
    }
}
/** Include this once in your project in a file included in TS/TSX compilation:
 * - Note that the JSX namespace uses _native_ and _camelCase_ for DOM attributes related to listeners and aria. To use only camelCase use `JSX_camelCase`, for only native use `JSX_mixedCase`.
 *
 * ```
import { JSX_mixedCase } from "mix-dom";
declare global {
    namespace JSX {
        interface IntrinsicElements extends JSX_mixedCase.IntrinsicElements {}
        interface IntrinsicAttributes extends JSX_mixedCase.IntrinsicAttributes {}
    }
}
```
 */
declare namespace JSX_mixedCase {
    /** This gives support for:
     * - It adds generic support for "_key", "_ref" and "_disable" props (by catch phrase)
     *      * Note however that the "_signals" prop is component specific, so uses the initial props on constructor or func.
     *          * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMInternalCompProps included.
     *      * Similarly the "_contexts" prop is gotten through the props, even though it's not component specific (though could be, but it's not necessarily desired).
     * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
     *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
     */
    interface IntrinsicElements extends IntrinsicAttributesBy_mixedCase {
    }
    /** This is needed for components mostly. The IntrinsicElements gets ignored for them when defines precise typing: eg. (props: SomeProps).
     * - However, IntrinsicAttributes then brings those to all (dom and components), so we provide here the three basic: "_key", "_ref" and "_disable".
     * - We leave "_signals" and "_contexts" to be found on the init props if looks in there. */
    interface IntrinsicAttributes extends MixDOMInternalBaseProps {
    }
}

declare class ContentBoundary extends BaseBoundary {
    /** The def whose children define our content - we are a fragment-like container. */
    targetDef: MixDOMDefTarget;
    /** Redefine that we always have it. It's based on the targetDef. */
    _innerDef: MixDOMDefApplied;
    /** Redefine that we always have a host for content boundaries - for us, it's the original source of our rendering.
     * - Note that the content might get passed through many boundaries, but now we have landed it.
     */
    sourceBoundary: SourceBoundary;
    /** Redefine that we always have a boundary that grounded us to the tree - we are alive because of it.
     * - Note that it gets assigned (externally) immediately after constructor is called.
     * - The parentBoundary ref is very useful for going quickly up the boundary tree - the opposite of .innerBoundaries.
     */
    parentBoundary: SourceBoundary | ContentBoundary;
    /** Content boundaries will never feature component. So can be used for checks to know if is a source or content boundary. */
    component?: never;
    /** Content boundaries will never feature bId. So can be used for checks to know if is a source or content boundary. */
    bId?: never;
    constructor(outerDef: MixDOMDefApplied, targetDef: MixDOMDefTarget, treeNode: MixDOMTreeNode, sourceBoundary: SourceBoundary);
    /** Apply a targetDef from the new envelope. Simply sets the defs accordingly. */
    updateEnvelope(targetDef: MixDOMDefTarget, truePassDef?: MixDOMDefApplied | null): void;
}

/** This is simply a tiny class that is used to manage the host duplication features in a consistent way.
 * - Each Host has a `.shadowAPI`, but it's the very same class instance for all the hosts that are duplicated - the original and any duplicates have the same instance here.
 * - This way, it doesn't matter who is the original source (or if it dies away). As long as the shadowAPI instance lives, the originality lives.
 */
declare class HostShadowAPI<Contexts extends ContextsAllType = {}> {
    /** These are the Host instances that share the common duplication basis. Note that only appear here once mounted (and disappear once cleaned up). */
    hosts: Set<Host<Contexts>>;
    /** These are the duplicatable contexts (by names). Any time a Host is duplicated, it will get these contexts automatically. */
    contexts: Partial<Contexts>;
}

/** Class type for HostContextAPI. */
interface HostContextAPIType<Contexts extends ContextsAllType = {}> extends AsClass<ContextAPIType<Contexts>, HostContextAPI<Contexts>, []> {
    /** Attached to provide automated context inheritance from host to components. */
    modifyContexts(contextAPI: HostContextAPI, contextMods: Partial<ContextsAllType>, callDataIfChanged: boolean, setAsInherited: boolean): string[];
}
/** The Host based ContextAPI simply adds an extra argument to the setContext and setContexts methods for handling which contexts are auto-assigned to duplicated hosts.
 * - It also has the afterRefresh method assign to the host's cycles.
 */
interface HostContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {
    ["constructor"]: ContextAPIType<Contexts> & HostContextAPIType<Contexts>;
    /** The Host that this ContextAPI is attached to. Should be set manually after construction.
     * - It's used for two purposes: 1. Marking duplicatable contexts to the Host's shadowAPI, 2. syncing to the host refresh (with the afterRefresh method).
     * - It's assigned as a member to write HostContextAPI as a clean class.
     */
    host: Host<Contexts>;
    /** This triggers a refresh and returns a promise that is resolved when the Host's update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately.
     * - This uses the signals system, so the listener is called among other listeners depending on the adding order.
     */
    afterRefresh(fullDelay?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void>;
    /** Attach the context to this ContextAPI by name. Returns true if did attach, false if was already there.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     * - Note that this method is extended on the HostContextAPI to include markAsDuplicatable option (defaults to false).
     *      * If set to true, will also modify the host.shadowAPI.contexts: if has a context adds there, if null or undefined removes from there.
     *      * It's a dictionary used for auto-assigning contexts to a new duplicated host - requires `host.settings.duplicatableHost: true`.
     */
    setContext<Name extends keyof Contexts & string>(name: Name, context: Contexts[Name] | null | undefined, callDataIfChanged?: boolean, markAsDuplicatable?: boolean): boolean;
    /** Set multiple named contexts in one go. Returns true if did changes, false if didn't. This will only modify the given keys.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     * - Note that this method is extended on the HostContextAPI to include markAsDuplicatable option (defaults to false).
     *      * If set to true, will also modify the host.shadowAPI.contexts: if has a context adds there, if null or undefined removes from there.
     *      * It's a dictionary used for auto-assigning contexts to a new duplicated host - requires `host.settings.duplicatableHost: true`.
     */
    setContexts(contexts: Partial<{
        [CtxName in keyof Contexts & string]: Contexts[CtxName] | null | undefined;
    }>, callDataIfChanged?: boolean, markAsDuplicatable?: boolean): Array<string & keyof Contexts>;
}
declare class HostContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {
    awaitDelay(): Promise<void>;
    static modifyContexts(contextAPI: HostContextAPI, contextMods: Partial<ContextsAllType>, callDataIfChanged: boolean, setAsInherited: boolean): string[];
}

interface HostUpdateCycleInfo {
    updates: Set<SourceBoundary>;
}
interface HostRenderCycleInfo {
    rCalls: MixDOMSourceBoundaryChange[][];
    rInfos: MixDOMRenderInfo[][];
}
declare class HostServices {
    /** Dedicated render handler class instance. It's public internally, as it has some direct-to-use functionality: like pausing, resuming and reassimilation. */
    renderer: HostRender;
    /** Ref up. This whole class could be in host, but for internal clarity the more private and technical side is here. */
    host: Host;
    updateCycle: RefreshCycle<HostUpdateCycleInfo>;
    renderCycle: RefreshCycle<HostRenderCycleInfo>;
    /** A simple counter is used to create unique id for each boundary (per host). */
    private bIdCount;
    /** This is the target render definition that defines the host's root boundary's render output. */
    private rootDef;
    /** Temporary value (only needed for .onlyRunInContainer setting). */
    private _rootDisabled?;
    /** Temporary flag to mark while update process is in progress that also serves as an host update cycle id.
     * - The value only exists during updating, and is renewed for each update cycle, and finally synchronously removed.
     * - Currently, it's used for special cases related to content passing and simultaneous destruction of intermediary source boundaries.
     *      * The case is where simultaneously destroys an intermediary boundary and envelope. Then shouldn't run the destruction for the defs that were moved out.
     *      * Can test by checking whether def.updateId exists and compare it against _whileUpdating. If matches, already paired -> don't destroy.
     *      * The matching _whileUpdating id is put on the def that was _widely moved_ and all that were inside, and can then be detected for in clean up / (through treeNode's sourceBoundary's host).
     *      * The updateId is cleaned away from defs upon next pairing - to avoid cluttering old info (it's just confusing and serves no purpose as information).
     * - It's also used for a special case related to _simultaneous same scope remote content pass + insertion_.
     *      * The case is similar to above in that it is related to toggling (Remote) content feed on / off, while using a stable WithContent in the same scope.
     *          - If the WithContent is _earlier_ in the scope, there is no problem: first run will not ground it, then it's updated with new content.
     *          - But if it's _later_, then without the special detection would actually create another instance of the WithContent, and result in treeNode confusion and partial double rendering.
     *      * So in this case, the _whileUpdating id is assigned to each sourceBoundary's _updateId at the moment its update routine begins during HostServices.runUpdates cycle.
     *          - This is then used to detect if the interested boundary has _not yet been updated_ during this cycle, and if so to _not_ update it instantly, but just mark _forceUpdate = true.
     */
    _whileUpdating?: {};
    constructor(host: Host);
    /** This creates a new boundary id in the form of "h-hostId:b-bId", where hostId and bId are strings from the id counters. For example: "h-1:b:5"  */
    createBoundaryId(): MixDOMSourceBoundaryId;
    clearTimers(forgetPending?: boolean): void;
    createRoot(content: MixDOMRenderOutput): ComponentTypeAny;
    updateRoot(content: MixDOMRenderOutput, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    refreshRoot(forceUpdate?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    clearRoot(forgetPending?: boolean): void;
    getRootDef(shallowCopy?: boolean): MixDOMDefTarget | null;
    hasPending(updateSide?: boolean, postSide?: boolean): boolean;
    addRefreshCall(callback: () => void, renderSide?: boolean): void;
    cancelUpdates(boundary: SourceBoundary): void;
    /** This is the main method to update a boundary.
     * - It applies the updates to bookkeeping immediately.
     * - The actual update procedure is either timed out or immediate according to settings.
     *   .. It's recommended to use a tiny update timeout (eg. 0ms) to group multiple updates together. */
    absorbUpdates(boundary: SourceBoundary, updates: MixDOMComponentUpdates, refresh?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** This triggers the update cycle. */
    triggerRefresh(forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Update times without triggering a refresh. However, if forceUpdateTimeout is null, performs it instantly. */
    updateRefreshTimes(forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** This is the core whole command to update a source boundary including checking if it should update and if has already been updated.
     * - It handles the updates bookkeeping and should update checking and return infos for changes.
     * - It should only be called from a few places: 1. runUpdates flow above, 2. within applyDefPairs for updating nested, 3. HostServices.updatedInterestedInClosure for updating indirectly interested sub boundaries.
     * - If gives bInterested, it's assumed to be be unordered, otherwise give areOrdered = true. */
    updateBoundary(boundary: SourceBoundary, forceUpdate?: boolean | "all", movedNodes?: MixDOMTreeNode[], bInterested?: Set<SourceBoundary> | null): MixDOMChangeInfos | null;
    /** This absorbs infos from the updates done. Infos are for update calls and to know what to render. Triggers calling runRender. */
    absorbChanges(renderInfos: MixDOMRenderInfo[] | null, boundaryChanges?: MixDOMSourceBoundaryChange[] | null, forceRenderTimeout?: number | null): void;
    /** Initialize cycles. */
    static initializeCyclesFor(services: HostServices): void;
    /** This method should always be used when executing updates within a host - it's the main orchestrator of updates.
     * To add to post updates use the .absorbUpdates() method above. It triggers calling this with the assigned timeout, so many are handled together.
     */
    static runUpdates(services: HostServices, pending: HostUpdateCycleInfo, resolvePromise: (keepResolving?: boolean) => void): void;
    static runRenders(services: HostServices, pending: HostRenderCycleInfo, resolvePromise: (keepResolving?: boolean) => void): void;
    static shouldUpdateBy(boundary: SourceBoundary, prevProps: Record<string, any> | undefined, prevState: Record<string, any> | undefined): boolean;
    static callBoundariesBy(boundaryChanges: MixDOMSourceBoundaryChange[]): void;
}

/** Typing for a SpreadFunc: It's like a Component, except it's spread out immediately on the parent render scope when defined. */
type SpreadFunc<Props extends Record<string, any> = {}> = (props: SpreadFuncProps & Props) => MixDOMRenderOutput;
/** Typing for a SpreadFunc with extra arguments. Note that it's important to define the JS side as (props, ...args) so that the func.length === 1.
 * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
 */
type SpreadFuncWith<Props extends Record<string, any> = {}, ExtraArgs extends any[] = any[]> = (props: SpreadFuncProps & Props, ...args: ExtraArgs) => MixDOMRenderOutput;
/** Check whether the type is a SpreadFunc.
 * ```
 * type TestSpreads = [
 *
 *      // - Simple cases - //
 *
 *      // Not a spread.
 *      IsSpreadFunc<Component>,                            // false
 *      IsSpreadFunc<typeof Component>,                     // false
 *      IsSpreadFunc<ComponentFunc>,                        // false
 *      IsSpreadFunc<(props: false) => null>,               // false
 *      // Is a spread.
 *      IsSpreadFunc<SpreadFunc>,                           // true
 *      IsSpreadFunc<() => null>,                           // true
 *      IsSpreadFunc<(props: {}) => null>,                  // true
 *
 *
 *      // - Complex cases - //
 *
 *      // Not a spread.
 *      IsSpreadFunc<(props: {}, test: any) => null>,       // false
 *      IsSpreadFunc<(props: {}, test?: any) => null>,      // false
 *      IsSpreadFunc<(props?: {}, test?: any) => null>,     // false
 *      IsSpreadFunc<(props: {}, test: any, ...more: any[]) => null>,   // false
 *      IsSpreadFunc<(props?: {}, test?: any, ...more: any[]) => null>, // false
 *      // Is a spread.
 *      // .. Note that on the JS side the arguments length is 1.
 *      IsSpreadFunc<(props: {}, ...test: any[]) => null>,  // true
 * ];
 * ```
 */
type IsSpreadFunc<Anything> = Anything extends (props?: Record<string, any>, ...args: any[]) => MixDOMRenderOutput ? Parameters<Anything>["length"] extends 0 | 1 ? true : number extends Parameters<Anything>["length"] ? Parameters<Anything> extends [any, ...infer Rest] ? any[] extends Rest ? true : false : false : false : false;
/** The spread function props including the internal props `_disable` and `_key`. */
interface SpreadFuncProps extends MixDOMInternalBaseProps {
}
/** Create a SpreadFunc - it's actually just a function with 0 or 1 arguments: (props?).
 * - It's the most performant way to render things (no lifecycle, just spread out with its own pairing scope).
 * - Note that this simply gives back the original function, unless it has more than 1 arguments, in which case an intermediary function is created.
 *      * This intermediary function actually supports feeding in more arguments - this works since a func with (props, ...args) actually has length = 1.
 *      * If you want to include the props and extra arguments typing into the resulting function use the createSpreadWith function instead (it also automatically reads the types).
 */
declare const createSpread: <Props extends Record<string, any> = {}>(func: (props: Props, ...args: any[]) => MixDOMRenderOutput) => SpreadFunc<Props>;
/** Create a SpreadFunc by automatically reading the types for Props and ExtraArgs from the given function. See createSpread for details.
 * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
 */
declare const createSpreadWith: <Props extends Record<string, any>, ExtraArgs extends any[]>(func: (props: Props, ...args: ExtraArgs) => MixDOMRenderOutput) => SpreadFuncWith<Props, ExtraArgs>;

type ComponentSignals<Info extends Partial<ComponentInfo> = {}> = {
    /** Special call - called right after constructing. */
    preMount: () => void;
    /** Callback that is fired after the initial rendering has been done and elements are in the dom. After any further updates onUpdate (and onPreUpdate and onShouldUpdate) are called. */
    didMount: () => void;
    /** This is a callback that will always be called when the component is checked for updates.
     * - Note that this is not called on mount, but will be called everytime on update when it's time to check whether should update or not - regardless of whether will actually update.
     * - This is the perfect place to use Memos to, as you can modify the state immediately and the mods will be included in the current update run. Access the new values in component.props and component.state (new props are set right before, and state read right after).
     *   .. Note that you can also use Memos on the render scope. The only difference is that the render method will be called again immediately after (but likewise included in the same update run). */
    beforeUpdate: () => void;
    /** Callback to determine whether should update or not.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     * - If returns true, component will update. If false, will not.
     * - If returns null (or no onShouldUpdate method assigned), will use the rendering settings to determine.
     * - Note that this is not called every time necessarily (never on mount, and not if was forced).
     * - Note that this is called right before onPreUpdate and the actual update (if that happens).
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before.
     * - Note that due to handling return value, emitting this particular signal is handled a bit differently. If any says true, will update, otherwise will not. */
    shouldUpdate: (prevProps: Info["props"] | undefined, prevState: Info["state"] | undefined) => boolean | null;
    /** This is a callback that will always be called when the component is checked for updates. Useful to get a snapshot of the situation.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     * - Note that this is not called on mount, but will be called everytime on update, even if will not actually update (use the 3rd param).
     * - Note that this will be called right after onShouldUpdate (if that is called) and right before the update happens.
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before. */
    preUpdate: (prevProps: Info["props"] | undefined, prevState: Info["state"] | undefined, willUpdate: boolean) => void;
    /** Called after the component has updated and changes been rendered into the dom.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it. */
    didUpdate: (prevProps: Info["props"] | undefined, prevState: Info["state"] | undefined) => void;
    /** Called when the component has moved in the tree structure. */
    didMove: () => void;
    /** Called when the component is about to be ungrounded: removed from the tree and dom elements destroyed. */
    willUnmount: () => void;
};
type ComponentExternalSignalsFrom<Info extends Partial<ComponentInfo> = Partial<ComponentInfo>, Comp extends Component<any> = Component<Info>, CompSignals extends Record<string, (...args: any[]) => any | void> = ComponentSignals<Info> & Info["signals"]> = {
    [SignalName in keyof CompSignals]: (comp: Comp & Info["class"] & {
        ["constructor"]: Info["static"];
    }, ...params: Parameters<CompSignals[SignalName]>) => ReturnType<CompSignals[SignalName]>;
};
type ComponentExternalSignals<Comp extends Component = Component> = {
    /** Special call - called right after constructing the component instance. */
    preMount: (component: Comp) => void;
    /** Callback that is fired after the initial rendering has been done and elements are in the dom. After any further updates onUpdate (and onPreUpdate and onShouldUpdate) are called. */
    didMount: (component: Comp) => void;
    /** This is a callback that will always be called when the component is checked for updates.
     * - Note that this is not called on mount, but will be called everytime on update when it's time to check whether should update or not - regardless of whether will actually update.
     * - This is the perfect place to use Memos to, as you can modify the state immediately and the mods will be included in the current update run. Access the new values in component.props and component.state.
     *   .. Note that you can also use Memos on the render scope. The only difference is that the render method will be called again immediately after (but likewise included in the same update run). */
    beforeUpdate: (component: Comp) => void;
    /** Callback to determine whether should update or not.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     * - If returns true, component will update. If false, will not.
     * - If returns null (or no onShouldUpdate method assigned), will use the rendering settings to determine.
     * - Note that this is not called every time necessarily (never on mount, and not if was forced).
     * - Note that this is called right before onPreUpdate and the actual update (if that happens).
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before.
     * - Note that due to handling return value, emitting this particular signal is handled a bit differently. If any says true, will update, otherwise will not. */
    shouldUpdate: (component: Comp, prevProps: (Comp["constructor"]["_Info"] & {
        props?: {};
    })["props"], prevState: (Comp["constructor"]["_Info"] & {
        state?: {};
    })["state"]) => boolean | null;
    /** This is a callback that will always be called when the component is checked for updates. Useful to get a snapshot of the situation.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     * - Note that this is not called on mount, but will be called everytime on update, even if will not actually update (use the 3rd param).
     * - Note that this will be called right after onShouldUpdate (if that is called) and right before the update happens.
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before. */
    preUpdate: (component: Comp, prevProps: (Comp["constructor"]["_Info"] & {
        props?: {};
    })["props"], prevState: (Comp["constructor"]["_Info"] & {
        state?: {};
    })["state"], willUpdate: boolean) => void;
    /** Called after the component has updated and changes been rendered into the dom.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     */
    didUpdate: (component: Comp, prevProps: (Comp["constructor"]["_Info"] & {
        props?: {};
    })["props"], prevState: (Comp["constructor"]["_Info"] & {
        state?: {};
    })["state"]) => void;
    /** Called when the component has moved in the tree structure. */
    didMove: (component: Comp) => void;
    /** Called when the component is about to be ungrounded: removed from the tree and dom elements destroyed. */
    willUnmount: (component: Comp) => void;
};

/** Type for the ComponentShadowAPI signals. */
type ComponentShadowSignals<Info extends Partial<ComponentInfo> = {}> = ComponentExternalSignalsFrom<Info, ComponentShadow>;
type ComponentShadowFunc<Info extends Partial<ComponentInfo> = {}> = (((props: ComponentProps<Info>, component: ComponentShadow<Info>) => ComponentFuncReturn<Info>)) & {
    Info?: Info;
    api: ComponentShadowAPI<Info>;
};
type ComponentShadowFuncWith<Info extends Partial<ComponentInfo> = {}> = ((props: ComponentProps<Info>, component: ComponentShadowCtx<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => ComponentFuncReturn<Info>) & {
    Info?: Info;
    api: ComponentShadowAPI<Info>;
};
type ComponentShadowFuncWithout<Info extends Partial<ComponentInfo> = {}> = ((props: ComponentProps<Info>, component: ComponentShadow<Info>, contextAPI?: never) => ComponentFuncReturn<Info>) & {
    Info?: Info;
    api: ComponentShadowAPI<Info>;
};
/** The static class type for ComponentShadow. */
interface ComponentShadowType<Info extends Partial<ComponentInfo> = {}> extends ComponentType<Info> {
    api: ComponentShadowAPI<Info>;
}
/** There is no actual pre-existing class for ComponentShadow. Instead a new class is created when createShadow is used. */
interface ComponentShadow<Info extends Partial<ComponentInfo> = {}> extends Component<Info> {
    ["constructor"]: ComponentShadowType<Info>;
}
/** Type for Component with ComponentContextAPI. Also includes the signals that ComponentContextAPI brings. */
interface ComponentShadowCtx<Info extends Partial<ComponentInfo> = {}> extends ComponentShadow<Info> {
    contextAPI: ComponentContextAPI<Info["contexts"] & {}>;
}

/** This allows to access the instanced components as well as to use signal listeners (with component extra param as the first one), and trigger updates. */
declare class ComponentShadowAPI<Info extends Partial<ComponentInfo> = {}> extends SignalBoy<ComponentShadowSignals<Info>> {
    /** The currently instanced components that use our custom class as their constructor. A new instance is added upon SourceBoundary's reattach process, and removed upon unmount clean up. */
    components: Set<Component<Info>>;
    /** Default update modes. Can be overridden by the component's updateModes. */
    updateModes?: Partial<MixDOMUpdateCompareModesBy>;
    /** Call this to trigger an update on the instanced components. */
    update(update?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** The onListener callback is required by ComponentShadowAPI's functionality for connecting signals to components fluently. */
    static onListener(compContextAPI: ComponentShadowAPI, name: string, index: number, wasAdded: boolean): void;
}
/** Create a shadow component omitting the first initProps: (component). The contextAPI is if has 2 arguments (component, contextAPI).
 * - Shadow components are normal components, but they have a ComponentShadowAPI attached as component.constructor.api.
 * - This allows the components to be tracked and managed by the parenting scope who creates the unique component class (whose instances are tracked).
 * - Note that when including static properties, the typing only requires them in functional form - if the 1st arg is a class, then typing for staticProps is partial.
*/
declare function createShadow<Info extends Partial<ComponentInfo> = {}>(CompClass: ComponentType<Info>, signals?: Partial<ComponentShadowSignals<Info>> | null, ...args: [staticProps?: Partial<Info["static"]> | null, name?: string] | [name?: string]): ComponentShadowType<Info>;
declare function createShadow<Info extends Partial<ComponentInfo> = {}>(compFunc: ComponentFunc<Info>, signals?: Partial<ComponentShadowSignals<Info>> | null, ...args: {} | undefined extends OmitPartial<Info["static"]> | undefined ? [staticProps?: {} | null, name?: string] | [name?: string] : [staticProps: Info["static"], name?: string]): ComponentShadowFunc<Info>;
declare function createShadow<Info extends Partial<ComponentInfo> = {}>(compFunc: ComponentTypeEither<Info>, signals?: Partial<ComponentShadowSignals<Info>> | null, ...args: {} | undefined extends OmitPartial<Info["static"]> | undefined ? [staticProps?: {} | null, name?: string] | [name?: string] : [staticProps: Info["static"], name?: string]): ComponentShadowType<Info> | ComponentShadowFunc<Info>;
/** Create a shadow component function with ComponentContextAPI omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
declare const createShadowCtx: <Info extends Partial<ComponentInfo<{}, {}, {}, {}, {}, any, {}>> = {}>(func: (component: ComponentShadowCtx<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => ComponentFuncReturn<Info>, signals?: Partial<ComponentShadowSignals> | null, ...args: [name?: string] | [staticProps?: Record<string, any> | null, name?: string]) => ComponentShadowFuncWith<Info>;

/** Typing infos for Components. */
interface ComponentInfo<Props extends Record<string, any> = {}, State extends Record<string, any> = {}, Signals extends Record<string, (...args: any[]) => any> = {}, Class extends Record<string, any> = {}, Static extends Record<string, any> & {
    api?: ComponentShadowAPI<any>;
} = {}, Timers extends any = any, Contexts extends ContextsAllType = {}> {
    /** Typing for the props for the component - will be passed by parent. */
    props: Props;
    /** Typing for the local state of the component. */
    state: State;
    /** Only for functional components - can type extending the component with methods and members.
     * - For example: `{ class: { doSomething(what: string): void; }; }`
     * - And then `(initProps, component) => { component.doSomething = (what) => { ... } }`
     */
    class: Class;
    /** Typed signals. For example `{ signals: { onSomething: (what: string) => void; }; }`.
     * - Note that these are passed on to the props._signals typing. However props._signals will not actually be found inside the render method.
     */
    signals: Signals;
    /** Typing for timers. Usually strings but can be anything. */
    timers: Timers;
    /** Typing for the related contexts: a dictionary where keys are context names and values are each context.
     * - The actual contexts can be attached directly on the Component using its contextAPI or _contexts prop, but they are also secondarily inherited from the Host.
     */
    contexts: Contexts;
    /** Anything on static side of class, including what is attached to the functions directly. In both cases: `SomeComponent.someStaticMember` - be their funcs or classes. */
    static: Static;
}
/** Partial version of the ComponentInfo. */
interface ComponentInfoPartial<Props extends Record<string, any> = {}, State extends Record<string, any> = {}, Signals extends Record<string, (...args: any[]) => any> = {}, Class extends Record<string, any> = {}, Static extends Record<string, any> & {
    api?: ComponentShadowAPI<any>;
} = {}, Timers extends any = any, Contexts extends ContextsAllType = {}> extends Partial<ComponentInfo<Props, State, Signals, Class, Static, Timers, Contexts>> {
}
/** Component info that uses `any` for all info parts, except for "class" and "static" uses `{}`. */
type ComponentInfoAny = ComponentInfo<any, any, any, {}, {}, any, any>;
/** Empty component info type. */
type ComponentInfoEmpty = {
    props?: {};
    state?: {};
    class?: {};
    signals?: {};
    timers?: {};
    contexts?: {};
    static?: {};
};
/** This declares a Component class instance but allows to input the Infos one by one: <Props, State, Signals, Class, Static, Timers, Contexts> */
interface ComponentOf<Props extends Record<string, any> = {}, State extends Record<string, any> = {}, Signals extends Record<string, (...args: any[]) => any> = {}, Class extends Record<string, any> = {}, Static extends Record<string, any> & {
    api?: ComponentShadowAPI<any>;
} = {}, Timers extends any = {}, Contexts extends ContextsAllType = {}> extends Component<ComponentInfo<Props, State, Signals, Class, Static, Timers, Contexts>> {
}
/** This declares a Component class type but allows to input the Infos one by one: <Props, State, Signals, Class, Static, Timers, Contexts> */
interface ComponentTypeOf<Props extends Record<string, any> = {}, State extends Record<string, any> = {}, Signals extends Record<string, (...args: any[]) => any> = {}, Class extends Record<string, any> = {}, Static extends Record<string, any> & {
    api?: ComponentShadowAPI<any>;
} = {}, Timers extends any = {}, Contexts extends ContextsAllType = {}> extends ComponentType<ComponentInfo<Props, State, Signals, Class, Static, Timers, Contexts>> {
}
/** This declares a ComponentFunc but allows to input the Infos one by one: <Props, State, Signals, Class, Static, Timers, Contexts> */
type ComponentFuncOf<Props extends Record<string, any> = {}, State extends Record<string, any> = {}, Signals extends Record<string, (...args: any[]) => any> = {}, Class extends Record<string, any> = {}, Static extends Record<string, any> & {
    api?: ComponentShadowAPI<any>;
} = {}, Timers extends any = any, Contexts extends ContextsAllType = {}> = (initProps: ComponentProps<ComponentInfo<Props, State, Signals, Class, Static, Timers, Contexts>>, component: Component<ComponentInfo<Props, State, Signals, Class, Static, Timers, Contexts>> & Class, contextAPI: ComponentContextAPI<Contexts>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;
/** Type for anything that from which component info can be derived. */
type ComponentInfoInterpretable = Partial<ComponentInfo> | {
    _Info?: Partial<ComponentInfo>;
} | Component | ComponentType | ComponentFunc | SpreadFunc;
/** Robust component info reader from any kind of type: info object, component class type or instance, component function or spread function. Define BaseInfo to enforce the known outcome, eg. using ComponentInfoEmpty. */
type ReadComponentInfo<Anything, BaseInfo extends Record<string, any> = {}> = BaseInfo & (Anything extends ClassType | undefined ? (InstanceTypeFrom<Anything> & {
    ["constructor"]: {
        _Info?: {};
    };
})["constructor"]["_Info"] : Anything extends {
    _Info?: Partial<ComponentInfo>;
} | undefined ? (Anything & {
    _Info?: {};
})["_Info"] : Anything extends {
    constructor: {
        _Info?: Partial<ComponentInfo>;
    };
} | undefined ? (Anything & {
    constructor: {
        _Info?: {};
    };
})["constructor"]["_Info"] : Anything extends ((...args: any[]) => any | void) | undefined ? ReadComponentInfoFromArgsReturn<Parameters<(Anything & {})>, ReturnType<Anything & {}>> : Anything extends Partial<ComponentInfo> | undefined ? {
    [Key in string & keyof ComponentInfo & keyof Anything]: Anything[Key];
} : {});
/** Read merged info from multiple anythings inputted as an array. */
type ReadComponentInfos<Anythings extends any[], BaseInfo extends Record<string, any> = {}, Index extends number = Anythings["length"], Collected extends Partial<ComponentInfo> = {}> = number extends Index ? Collected & BaseInfo : Index extends 0 ? Collected & BaseInfo : ReadComponentInfos<Anythings, BaseInfo, IterateBackwards[Index], Collected & ReadComponentInfo<Anythings[IterateBackwards[Index]]>>;
/** For mixing components together, this reads any kind of info that refers to mixable's "_Required" part (in any form from anything, supporting mixables and HOCs).
 * - The _Required info indicates what the mixable component requires before it in the mixing chain.
 * - The actual info in _Required can be info or a componentfunc with info or such, but in here we read only the component info part from it.
 */
type ReadComponentRequiredInfo<Anything, BaseInfo extends Record<string, any> = {}> = Anything extends {
    _Required?: ComponentInfoInterpretable;
} | undefined ? ReadComponentInfo<(Anything & {})["_Required"], BaseInfo> : Anything extends {
    constructor: {
        _Required?: ComponentInfoInterpretable;
    };
} | undefined ? ReadComponentInfo<(Anything & {
    constructor: {
        _Required?: {};
    };
})["constructor"]["_Required"], BaseInfo> : Anything extends ClassType<{
    constructor: {
        _Required?: ComponentInfoInterpretable;
    };
}> | undefined ? ReadComponentInfo<(InstanceTypeFrom<Anything> & {
    ["constructor"]: {
        _Required?: {};
    };
})["constructor"]["_Required"], BaseInfo> : Anything extends ((...args: any[]) => any | void) | undefined ? Anything extends (Base: ComponentTypeAny) => ComponentTypeAny ? ReadComponentInfo<Parameters<Anything>[0], BaseInfo> : Parameters<(Anything & {})> extends [Record<string, any> | undefined, {
    constructor: {
        _Required?: ComponentInfoInterpretable;
    };
}] ? ReadComponentInfo<Parameters<(Anything & {})>[1]["constructor"]["_Required"], BaseInfo> : BaseInfo : BaseInfo;
/** Reads component info based on function's arguments, or return (for mixables). Provides BaseInfo to enforce the type. */
type ReadComponentInfoFromArgsReturn<Params extends any[], Return extends any = void> = Params extends [Record<string, any> | undefined, {
    constructor: {
        _Info?: Partial<ComponentInfo>;
    };
}, ...any[]] ? Params[1]["constructor"]["_Info"] : Params extends [ComponentTypeAny] ? Return extends ComponentTypeAny ? ReadComponentInfo<Return> : {} : Params extends [Record<string, any>] ? {
    props: Params[0];
} : {};

/** Type for Component class instance with ContextAPI. Also includes the signals that ContextAPI brings. */
interface ComponentCtx<Info extends Partial<ComponentInfo> = {}> extends Component<Info> {
    /** The ContextAPI instance hooked up to this component. */
    contextAPI: ComponentContextAPI<Info["contexts"] & {}>;
}
/** Type for Component class type with ContextAPI. Also includes the signals that ContextAPI brings. */
type ComponentTypeCtx<Info extends Partial<ComponentInfo> = {}> = Component<Info> & Info["class"] & {
    ["constructor"]: Info["static"];
};
/** Type for Component function with ContextAPI. Also includes the signals that ContextAPI brings. */
type ComponentCtxFunc<Info extends Partial<ComponentInfo> = {}> = ((initProps: ComponentProps<Info>, component: ComponentCtxWith<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => ComponentFuncReturn<Info>) & {
    _Info?: Info;
} & Info["static"];
/** Class type for ComponentContextAPI. */
interface ComponentContextAPIType<Contexts extends ContextsAllType = {}> extends AsClass<ContextAPIType<Contexts>, ComponentContextAPI<Contexts>, []> {
}
interface ComponentContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {
    /** Constructor as a typed property. */
    ["constructor"]: ComponentContextAPIType<Contexts>;
    /** The Host that this ContextAPI is related to (through the component). Should be set manually after construction.
     * - It's used for two purposes: 1. Inheriting contexts, 2. syncing to the host refresh (with the afterRefresh method).
     * - It's assigned as a member to write ComponentContextAPI as a clean class.
     */
    host: Host<Contexts>;
    /** This triggers a refresh and returns a promise that is resolved when the Component's Host's update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately.
     * - This uses the signals system, so the listener is called among other listeners depending on the adding order.
     */
    afterRefresh(fullDelay?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void>;
}
/** Component's ContextAPI allows to communicate with named contexts using their signals and data systems. */
declare class ComponentContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {
    host: Host<Contexts>;
    /** At ComponentContextAPI level, awaitDelay is hooked up to awaiting host's render cycle. */
    awaitDelay(): Promise<void>;
}

/** The basic dom node cloning modes - either deep or shallow: element.clone(mode === "deep").
 * - If in "always" then is deep, and will never use the original.
 */
type MixDOMCloneNodeBehaviour = "deep" | "shallow" | "always";
type MixDOMRenderTextTagCallback = (text: string | number) => Node | null;
type MixDOMRenderTextContentCallback = (text: string | number) => string | number;
type MixDOMRenderTextTag = DOMTags | "" | MixDOMRenderTextTagCallback;
interface HostType<Contexts extends ContextsAllType = {}> {
    /** Used for host based id's. To help with sorting fluently across hosts. */
    idCount: number;
    new (content?: MixDOMRenderOutput, domContainer?: Node | null, settings?: HostSettingsUpdate | null): Host<Contexts>;
    modifySettings(baseSettings: HostSettings, newSettings: HostSettingsUpdate): void;
    getDefaultSettings(): HostSettings;
}
interface HostSettingsUpdate extends Partial<Omit<HostSettings, "updateComponentModes">> {
    updateComponentModes?: Partial<HostSettings["updateComponentModes"]>;
}
/** Settings for MixDOM behaviour for all inside a host instance.
 * - The settings can be modified in real time: by `host.modifySettings(someSettings)`.
 *      * You can also mutate the object manually, eg. `host.settings.updateTimeout = null`.
 *      * However `settings.onlyRunInContainer` requires a refresh that is automated using modifySettings.
 */
interface HostSettings {
    /** If is null, then is synchronous. Otherwise uses the given timeout in ms. Defaults to 0ms.
     * - This timeout delays the beginning of the update process.
     *   * After the timeout has elapsed, .render() is called on components and a new structure is received.
     *   * The structure is then applied to the component, and for any nested components similarly .render() is called and then the defs applied recursively.
     *   * Finally, the process outputs a list of render callbacks to apply the related dom changes. Executing the changes can be delayed with the 2nd timeout: settings.renderTimeout.
     * - Note. Generally this helps to combine multiple updates together and thus prevent unnecessary updates.
     *   * This is useful if (due to complex app setup) you sometimes end up calling update multiple times for the same component.
     *     .. Without this, the update procedure would go through each time (and if rendering set to null, it as well).
     *     .. But with this, the updates get clumped together. For example, updating immediately after startup will not result in onUpdate, but only one onMount.
     * - Recommended usage for updateTimeout & renderTimeout:
     *   * For most cases, use updateTimeout: 0 and renderTimeout: 0 or null. Your main code line will run first, and rendering runs after (sync or async).
     *   * If you want synchronous updates on your components, use updateTimeout: null, renderTimeout: 0 - so updates are done before your main code line continues, but dom rendering is done after.
     *     .. In this case also consider putting useImmediateCalls to true.
     *   * If you want everything to be synchronous (including the dom), put both to null. */
    updateTimeout: number | null;
    /** If is null, then is synchronous. Otherwise uses the given timeout in ms. Defaults to 0ms.
     * - This timeout delays the actual dom rendering part of the component update process.
     * - It's useful to have a tiny delay to save from unnecessary rendering, when update gets called multiple times - even 0ms can help.
     * - Only use null renderTimeout (= synchronous rendering after updateTimeout) if you really want rendering to happen immediately after update.
     *     * Typically, you then also want the updateTimeout to be null (synchronous), so you get access to your dom elements synchronously.
     * - Note that renderTimeout happens after updateTimeout, so they both affect how fast rendering happens - see settings.updateTimeout for details. */
    renderTimeout: number | null;
    /** The lifecycle calls (onMount, onUpdate, ...) are collected (together with render infos) and called after the recursive update process has finished.
     * - This option controls whether the calls are made immediately after the update process or only after the (potentially delayed) rendering.
     * - Keep this as false, if you want the components to have their dom elements available upon onMount - like in React. (Defaults to false.)
     * - Put this to true, only if you really want the calls to be executed before the rendering happens.
     *     * If you combine this with updateTimeout: null, then you get synchronously updated state, with only rendering delayed.
     *     * However, you won't have dom elements on mount. To know when that happens should use refs or signals and .domDidMount and .domWillUnmount callbacks. */
    useImmediateCalls: boolean;
    /** Defines what components should look at when doing onShouldUpdate check for "props" and "state". */
    updateComponentModes: MixDOMUpdateCompareModesBy;
    /** Whether does a equalDOMProps check on the updating process.
     * - If true: Only adds render info (for updating dom props) if there's a need for it.
     * - If false: Always adds render info for updating dom elements. They will be diffed anyhow.
     * - If "if-needed": Then marks to be updated if had other rendering needs (move or content), if didn't then does equalDOMProps check. (So that if no need, don't mark render updates at all.)
     * Note that there is always a diffing check before applying dom changes, and the process only applies changes from last set.
     * .. In other words, this does not change at all what gets applied to the dom.
     * .. The only thing this changes, is whether includes an extra equalDOMProps -> boolean run during the update process.
     * .. In terms of assumed performance:
     * .... Even though equalDOMProps is an extra process, it's a bit faster to run than collecting diffs and in addition it can stop short - never add render info.
     * .... However, the only time it stops short is for not-equal, in which case it also means that we will anyway do the diff collection run later on.
     * .... In other words, it's in practice a matter of taste: if you want clean renderinfos (for debugging) use true. The default is "if-needed". */
    preCompareDOMProps: boolean | "if-needed";
    /** The maximum number of times a boundary is allowed to be render during an update due to update calls during the render func.
     * .. If negative, then there's no limit. If 0, then doesn't allow to re-render. The default is 1: allow to re-render once (so can render twice in a row).
     * .. If reaches the limit, stops re-rendering and logs a warning if devLogToConsole has .Warnings on. */
    maxReRenders: number;
    /** Which element (tag) to wrap texts (from props.children) into.
     * - By default, no wrapping is applied: treats texts as textNodes (instanceof Node).
     * - You can also pass in a callback to do custom rendering - should return a Node, or then falls back to textNode. */
    renderTextTag: MixDOMRenderTextTag;
    /** Tag to use for as a fallback when using the MixDOM.defHTML feature (that uses .innerHTML on a dummy element). Defaults to "span".
     * - It only has meaning, if the output contains multiple elements and didn't specifically define the container tag to use. */
    renderHTMLDefTag: DOMTags;
    /** If you want to process the simple content text, assign a callback here. */
    renderTextHandler: MixDOMRenderTextContentCallback | null;
    /** This defines how MixDOM will treat "simple content". The options are:
     *     1. When set to false (default), renders everything except null and undefined. (Other values are stringified.)
     *     2. When set to true, renders only values that doesn't amount to !!false. So skips: false and 0 as well.
     *     3. Third option is to give an array of values that should never be rendered.
     * Technical notes:
     *     - Regardless of the setting, MixDOM will always skip simple content of `null` and `undefined` (already at the static def creation level).
     *     - This setting applies as early as possible in the non-static side of process (in pairDefs routine).
     *     - How it works is that it will actually go and modify the target def by removing any unwanted child, before it would be paired.
     */
    noRenderValuesMode: boolean | any[];
    /** For svg content, the namespaceURI argument to be passed into createElementNS(namespaceURI, tag).
     * If empty, hard coded default is: "http://www.w3.org/2000/svg"
     */
    renderSVGNamespaceURI: string;
    /** When using MixDOM.Element to insert nodes, and swaps them, whether should apply (true), and if so whether should read first ("read").
     * Defaults to true, which means will apply based on scratch, but not read before it. */
    renderDOMPropsOnSwap: boolean | "read";
    /** This is useful for server side functionality. (Defaults to false, as most of the times you're using MixDOM on client side.)
     * - Put this to true, to disable the rendering aspects (will pause the dedicated HostRender instance). Instead use host.readDOMString() or MixDOM.readDOMString(treeNode) to get the html string.
     * - Note that you might want to consider putting settings.renderTimeout to null, so that the dom string is immediately renderable after the updates. */
    disableRendering: boolean;
    /** This is useful for nesting hosts.
     * - Put this to true to make nested but not currently grounded hosts be unmounted internally.
     * - When they are grounded again, they will mount and rebuild their internal structure from the rootBoundary up. */
    onlyRunInContainer: boolean;
    /** When pairing defs for reusing, any arrays are dealt as if their own key scope by default.
     * - By setting this to true, wide key pairing is allowed for arrays as well.
     * - Note that you can always use {...myArray} instead of {myArray} to avoid this behaviour (even wideKeysInArrays: false).
     *   .. In other words, if you do not want the keys in the array contents to mix widely, keep it as an array - don't spread it. */
    wideKeysInArrays: boolean;
    /** Default behaviour for handling duplicated instances of dom nodes.
     * - The duplication can happen due to manually inserting many, or due to multiple content passes, copies.
     * - The detection is host based and simply based on whether the element to create was already grounded or not.
     */
    duplicateDOMNodeBehaviour: MixDOMCloneNodeBehaviour | "";
    /** Custom handler for the duplicateDOMNodeBehaviour. */
    duplicateDOMNodeHandler: ((domNode: Node, treeNode: MixDOMTreeNodeDOM) => Node | null) | null;
    /** Whether this host can be auto-duplicated when included dynamically multiple times. Defaults to false.
     * - Can also be a callback that returns a boolean (true to include, false to not), or a new host.
     * - Note that if uses a custom Host class, the new duplicate will be made from the normal Host class. Use the callback to provide manually.
     * - The treeNode in the arguments defines where would be inserted. */
    duplicatableHost: boolean | ((host: Host, treeNode: MixDOMTreeNodeHost) => Host | boolean | null);
    /** For debugging information and logging (rare) warnings. */
    debugMode: boolean;
}
/** The main class to orchestrate and start rendering in MixDOM.
 * - Often the initialization looks like this as JSX:
 *      ```typescript
 *      const myHost = new Host(<App/>, document.querySelector("#app-root"));
 *      ```
 * - All constructor arguments are optional: `(content?, domContainer?, settings?, contexts?, shadowAPI?)`
 *      * `content?: MixDOMRenderOutput`: Refers to the "root def" to start rendering inside the host. Typically something like `<App />` in JSX form.
 *      * `domContainer?: Element | null`: Typically a DOM element for the container is given as the 2nd constructor args, but if not you can use `host.moveRoot(newContainer)` to move/insert afterwards.
 *      * `settings?: HostSettingsUpdate | null`: Optionally customize the host settings. They define how the host runs.
 *      * `contexts?: Contexts | null`: Assign a dictionary of named contexts to the host. They are then available at host's contextAPI and for all components part of the host.
 *      * `shadowAPI?: HostShadowAPI | null`: This is only used internally in cases where a host is automatically duplicated. Like the ComponentShadowAPI, the HostShadowAPI helps to track instances of the same (customly created) class.
 */
declare class Host<Contexts extends ContextsAllType = any> {
    static MIX_DOM_CLASS: string;
    static idCount: number;
    ["constructor"]: HostType<Contexts>;
    /** This represents abstractly what the final outcome looks like in DOM. */
    groundedTree: MixDOMTreeNode;
    /** The root boundary that renders whatever is fed to the host on `updateRoot` (or as the 1st arg in constructor). */
    rootBoundary: SourceBoundary;
    /** The general settings for this host instance.
     * - Do not modify directly, use the .modifySettings method instead.
     * - Otherwise rendering might have old settings, or setting.onlyRunInContainer might be uncaptured.
     */
    settings: HostSettings;
    /** Internal services to keep the whole thing together and synchronized.
     * They are the semi-private internal part of Host, so separated into its own class. */
    services: HostServices;
    /** This is used for duplicating hosts. It's the very same instance for all duplicated (and their source, which can be a duplicated one as well). */
    shadowAPI: HostShadowAPI<Contexts>;
    /** This provides the data and signal features for this Host and all the Components that are part of it.
     * - You can use .contextAPI directly for external usage.
     * - When using from within components, it's best to use their dedicated methods (for auto-disconnection features).
     */
    contextAPI: HostContextAPI<Contexts>;
    /** This contains all the components that have a contextAPI assigned. Automatically updated, used internally. The info can be used for custom purposes (just don't modify). */
    contextComponents: Set<ComponentCtx>;
    constructor(content?: MixDOMRenderOutput, domContainer?: Element | null, settings?: HostSettingsUpdate | null, contexts?: Contexts | null, shadowAPI?: HostShadowAPI | null);
    /** Clear whatever has been previously rendered - destroys all boundaries inside the rootBoundary. */
    clearRoot(update?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Move the host root into another dom container. You can also use this to set the container in case the Host was started without a container. */
    moveRoot(newContainer: Node | null, renderTimeout?: number | null): void;
    /** Update the previously render content with new render output definitions. */
    updateRoot(content: MixDOMRenderOutput, updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Triggers an update on the host root, optionally forcing it. This is useful for refreshing the container. */
    refreshRoot(forceUpdate?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Triggers a process that refreshes the dom nodes based on the current state.
     * - In case forceDOMRead is on will actually read from dom to look for real changes to be done.
     * - Otherwise just reapplies the situation - as if some updates had not been done.
     * - Note. This is a partly experimental feature - it's not assumed to be used in normal usage.
     */
    refreshDOM(forceDOMRead?: boolean, renderTimeout?: number | null): void;
    /** This triggers a refresh and returns a promise that is resolved when the update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately.
     * - Note that this uses the signals system, so the listener is called among other listeners depending on the adding order.
     */
    afterRefresh(renderSide?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void>;
    /** Update the refresh times without triggering update. Not however that if updates updateTimeout to `null`, will trigger the update cycle instantly if was pending. */
    updateRefreshTimes(updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** This is like afterRefresh but works with a callback, given as the first arg. (This is the core method for the feature.)
     * - Triggers a refresh and calls the callback once the update / render cycle is completed.
     * - If there's nothing pending, then will call immediately.
     * - Note that this uses the signals system, so the listener is called among other listeners depending on the adding order.
     */
    afterRefreshCall(callback: () => void, renderSide?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** This adds a one-shot callback to the refresh cycle (update / render) - without triggering refresh. (So like afterRefreshCall but without refreshing.) */
    addRefreshCall(callback: () => void, renderSide?: boolean): void;
    /** Trigger refreshing the host's pending updates and render changes. */
    triggerRefresh(updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Pause the rendering. Resume it by calling resume(), reassimilate() or reassimilateWith(). */
    pause(): void;
    /** Resume rendering - triggers reassimilation. */
    resume(): void;
    /** Tells whether the rendering is currently paused or not. */
    isPaused(): boolean;
    /** Reassimilates actual (unknown) dom elements into existing state of the Host (= its treeNode/def structure from the root down) without remounting.
     * - The method supports reusing custom DOM elements from within the given "container" element - it should be the element that _contains_ the Host's root element. (Defaults to the Host's container element.)
     * - The method also resumes rendering if was paused - unless is disableRendering is set to true in host settings.
     *      * Works internally by: 1. pause, 2. update, 3. resume & reassimilate.
     *      * Note that this is different from the `remount` flow, even though both use the same core methods (and has thus very similar arguments).
     * @param container Optionally define the container for assimilation. If none given defaults to the `host.groundedTree.domNode`.
     * @param readFromDOM Re-reads the current dom props from the existing ones as well. Defaults to false.
     *      - Note that unlike in `remount` flow, any text content will always be re-updated - so readFromDOM only affects pre-reading attributes here.
     * @param smuggleMode Allows to replace existing elements with better ones from the container (instead of reusing what components have) - otherwise only tries to fill missing ones. Defaults to false.
     * @param removeUnused Remove the other unused DOM elements found in the container. Defaults to false. Note. This can be a bit dangerous.
     * @param validator Can veto any DOM element from being used. Return true to accept, false to not accept.
     * @param suggester Can be used to suggest better DOM elements in a custom fashion. Should return a DOM Node, MixDOMAssimilateItem or null.
     *
     *
     * ```
     *
     * // - Example to showcase the core feature (not practical) - //
     *
     * // Get container and read DOM output as a string.
     * const elContainer = host.getContainerElement();
     *
     * // After the line below, the DOM is gone. (Assuming the host had a container element.)
     * // .. However, our host and components are still alive, though unaware of this external destruction.
     * if (elContainer)
     *     elContainer.innerHTML = "";
     *
     * // After the line below, the DOM has been recreated - or actually only the root element moved back.
     * // .. The other elements are also evaluated for updates, but likely nothing needed.
     * // .. Note that the component life cycles remain unaffected, though of course Ref calls and such are triggered.
     * host.reassimilate(); // Could also feed (elContainer) here. Same as default 1st arg.
     *
     * // We could actually put some DOM elements in and call `host.reassimilate(elContainer, true, true)`.
     * // .. This would try to smuggle the DOM elements (2nd true), and read info from them (1st true).
     *
     * ```
     */
    reassimilate(container?: Node | null, readFromDOM?: boolean, smuggleMode?: boolean, removeUnused?: boolean, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): void;
    /** This accepts new render content to update the groundedTree first and then reassimilates accordingly.
     * - Functions synchronously, so applies all updates and rendering immediately, and resumes paused rendering.
     * - See `reassimilate` method for more information.
     * @param content Define the new render content to update the groundedTree with.
     * @param container Optionally define the container for assimilation. If none given defaults to the `host.groundedTree.domNode`.
     * @param readFromDOM Re-reads the current dom props from the existing ones as well. Defaults to false.
     *      - Note that unlike in `remount` flow, any text content will always be re-updated - so readFromDOM only affects pre-reading attributes here.
     * @param smuggleMode Allows to replace existing elements with better ones from the container (instead of reusing what components have) - otherwise only tries to fill missing ones. Defaults to false.
     * @param removeUnused Remove the other unused DOM elements found in the container. Defaults to false. Note. This can be a bit dangerous.
     * @param validator Can veto any DOM element from being used. Return true to accept, false to not accept.
     * @param suggester Can be used to suggest better DOM elements in a custom fashion. Should return a DOM Node, MixDOMAssimilateItem or null.
     */
    reassimilateWith(content: MixDOMRenderOutput, container?: Node | null, readFromDOM?: boolean, smuggleMode?: boolean, removeUnused?: boolean, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): void;
    /** Remounts the whole Host, optionally assimilating the DOM structure found inside the given container element.
     * - The assimilation part comes in when mounting the DOM elements, as can reuse/smuggle/assimilate the DOM nodes from the container.
     * - Extra notes:
     *      * If you're using data in Contexts to drive your app state, you will likely end up with the same main state for the app. Of course any local state and DOM state (like scrolling position and focus) are lost.
     *      * This method is similar to React's `hydrateRoot` in its core functioning, though without defining content. (Use `remountWith` for that instead.)
     *      * Unlike in `reassimilate` flow, there's no default `container` and `removeUnused` defaults to `true`, as otherwise any mismatches would leave the DOM tree in a messy state.
     *          - The flow is also different in that `remount` performs a full remount on the components (vs. partial smuggling of DOM elements to existing state).
     * @param container Optionally define the container for DOM reassimilation while mounting. If null, won't try to reuse DOM elements. If given, should often be equivalent to `host.getContainerElement()`.
     * @param readFromDOM Whether re-reads the current dom props ("attributes") and/or text content ("content") from the reused DOM elements. Defaults to false. If true, reads both.
     *      - Note. If some text contents were not correctly re-rendered (after remounting with DOM reassimilation), try setting readFromDOM to "content" (or true).
     * @param removeUnused Remove the other unused DOM elements found in the container. Defaults to true in remounting.
     * @param validator Can veto any DOM element from being used. Return true to accept, false to not accept.
     * @param suggester Can be used to suggest better DOM elements in a custom fashion. Should return a DOM Node, MixDOMAssimilateItem or null.
     * @returns If host.settings.debugMode is true and container given, then returns info: `{ created: Set<Node>; reused: Set<Node>; unused: Set<Node>; }`. Otherwise no return.
     *
     * ```
     *
     * // - Example to showcase the core feature (not practical) - //
     *
     * // Get container and read DOM output as a string.
     * const elContainer = host.getContainerElement();
     * const htmlStr = host.readDOMString();
     *
     * // After the line below, the DOM looks the same, but nothing JS related works.
     * // .. Of course, assuming the host has a container - most often has on the client side.
     * if (elContainer)
     *     elContainer.innerHTML = htmlStr;
     *
     * // After the line below, the component structure in the host has been remounted, and DOM reassimilated.
     * // .. Before executing the line below, you can go and modify the DOM and see how the mods are retained (if could match).
     * host.remount(elContainer);
     *
     * // Notes about the above line.
     * // .. If the state is somewhat similar to what it was, the process has likely has reused many if not all nodes.
     * // .... Most likely places of inconsistencies are related to text nodes: eg. whether two simple adjacent texts were joined as 1 or left as 2.
     * // .... To account for text content inconsistencies, set readFromDOM to "content" (or true).
     * // .. If container given, the method actually outputs info about usage `Record<"created" | "reused" | "unused", Set<Node>>`, otherwise `null`.
     * // .... This is useful for debugging, in case things don't look right while the new app state is similar to old.
     *
     * ```
     */
    remount(container: Node, readFromDOM?: boolean | "attributes" | "content", removeUnused?: boolean, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): {
        created: Set<Node>;
        reused: Set<Node>;
        unused: Set<Node>;
    };
    remount(container?: Node | null, readFromDOM?: boolean | "attributes" | "content", removeUnused?: boolean, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): void;
    /** Remounts the whole Host, optionally assimilating into given DOM structure (found inside the container, if given).
     * - The assimilation part comes in when mounting the DOM elements, as can reuse/smuggle/assimilate the DOM nodes from the container.
     * - See `remount` method for more information.
     * @param content Optionally define new render content. If null|undefined, then reuses the current root def as the content.
     * @param container Optionally define the container for DOM reassimilation while mounting. If null, won't try to reuse DOM elements. If given, should often be equivalent to `host.getContainerElement()`.
     * @param readFromDOM Whether re-reads the current dom props ("attributes") and/or text content ("content") from the reused DOM elements. Defaults to false. If true, reads both.
     *      - Note. If some text contents were not correctly re-rendered (after remounting with DOM reassimilation), try setting readFromDOM to "content" (or true).
     * @param removeUnused Remove the other unused DOM elements found in the container. Defaults to true in remounting.
     * @param validator Can veto any DOM element from being used. Return true to accept, false to not accept.
     * @param suggester Can be used to suggest better DOM elements in a custom fashion. Should return a DOM Node, MixDOMAssimilateItem or null.
     * @returns If host.settings.debugMode is true and container given, then returns info: `{ created: Set<Node>; reused: Set<Node>; unused: Set<Node>; }`. Otherwise no return.
     *
     * ```
     *
     * // - Showcasing `remountWith` for hydration purposes - //
     *
     * // As a quick example of usage for DOM hydration purposes:
     * const container = document.querySelector("#app-root");
     * const host = new Host(null, container);          // Don't render content yet.
     * host.remountWith(contentFromSrv, container);     // Rehydrate the DOM.
     *
     * // Note. The `contentFromSrv` is likely a simple def like: `<App />`.
     * // .. It comes from the server side rendering.
     * // .. To dummy-test the feature on a living app, get the container and contentFromSrv like this:
     * const container = host.getContainerElement();    // Current container element.
     * const contentFromSrv = host.getRootDef();        // Current root def (copy).
     *
     * // You could then clear the DOM and try to rehydrating it.
     * const domString = host.readDOMString();          // Current DOM structure as a string.
     * container.innerHTML = domString;                 // Apply new DOM from string.
     * host.remountWith(contentFromSrv, container);     // Rehydrate the DOM.
     *
     * ```
     *
     */
    remountWith(content: MixDOMRenderOutput, container: Node, readFromDOM?: boolean | "attributes" | "content", removeUnused?: boolean, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): {
        created: Set<Node>;
        reused: Set<Node>;
        unused: Set<Node>;
    };
    remountWith(content: MixDOMRenderOutput, container?: Node | null, readFromDOM?: boolean | "attributes" | "content", removeUnused?: boolean, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): void;
    /** Read the whole rendered contents as a html string. Typically used with settings.disableRendering (and settings.renderTimeout = null). */
    readDOMString(): string;
    /** Get a (shallow) copy of the root def. Use this only for technical special cases and only as _readonly_ - do not mutate the def. Should not be needed in normal circumstances. */
    getRootDef(): MixDOMDefTarget | null;
    /** Get the element that contains the Host. */
    getContainerElement(): Node | null;
    /** Get the root dom node (ours or by a nested boundary) - if has many, the first one (useful for insertion). */
    getRootElement(): Node | null;
    /** Get all the root dom nodes - might be many if used with a fragment.
     * - Optionally define whether to search in nested boundaries or not (by default does).
     */
    getRootElements(inNestedBoundaries?: boolean): Node[];
    /** Get the first dom element by a selectors within the host (like document.querySelector). Should rarely be used, but it's here if needed. */
    queryElement<T extends Element = Element>(selectors: string, overHosts?: boolean): T | null;
    /** Get dom elements by a selectors within the host (like document.querySelectorAll). Should rarely be used, but it's here if needed. */
    queryElements<T extends Element = Element>(selectors: string, maxCount?: number, overHosts?: boolean): T[];
    /** Find all dom nodes by an optional validator. */
    findElements<T extends Node = Node>(maxCount?: number, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): T[];
    /** Find all components by an optional validator. */
    findComponents<Comp extends ComponentTypeAny = ComponentTypeAny>(maxCount?: number, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): Comp[];
    /** Find all treeNodes by given types and an optional validator. */
    findTreeNodes(types: SetLike<MixDOMTreeNodeType>, maxCount?: number, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[];
    /** Modify previously given settings with partial settings.
     * - Note that if any value in the dictionary is `undefined` uses the default setting.
     * - Supports handling the related special cases:
     *      * `onlyRunInContainer`: Refreshes whether is visible or not (might destroy all / create all, if needed).
     */
    modifySettings(settings: HostSettingsUpdate, passToDuplicated?: boolean): void;
    static modifySettings(base: HostSettings, newSettings: HostSettingsUpdate, useDefaults?: boolean): void;
    static getDefaultSettings(): HostSettings;
}

type HostRenderSettings = Pick<HostSettings, "renderTextHandler" | "renderTextTag" | "renderHTMLDefTag" | "renderSVGNamespaceURI" | "renderDOMPropsOnSwap" | "noRenderValuesMode" | "disableRendering" | "duplicateDOMNodeHandler" | "duplicateDOMNodeBehaviour" | "debugMode">;
declare class HostRender {
    /** These imply which type of tree nodes allow to "pass" the DOM element reference through them - ie. they are not strictly DOM related tree nodes. */
    static PASSING_TYPES: Partial<Record<MixDOMTreeNodeType | MixDOMDefType, true>>;
    /** Detect if is running in browser or not. */
    inBrowser: boolean;
    /** Root for pausing. */
    assimilationRoot: MixDOMTreeNode | null;
    /** Pausing. When resumes, reassimilates. */
    paused: boolean;
    /** When paused, if has any infos about removing elements, we store them - so that we can call unmount (otherwise the treeNode ref is lost). */
    pausedPending?: MixDOMRenderInfo[];
    /** Collection of settings. */
    settings: HostRenderSettings;
    /** To keep track of featured external dom elements. */
    externalElements: Set<Node>;
    /** Temporary information for remount feature - can be set externally. When applyDOM is called, the feature is triggered to pre-modify the groundedTree. */
    sourceRemount?: MixDOMRemountInfo;
    constructor(settings: HostRenderSettings, assimilationRoot?: MixDOMTreeNode);
    /** Pause the renderer from receiving updates. */
    pause(): void;
    /** Resume the renderer after pausing. Will reassimilate dom elements and reapply changes to them.
     * - Note that calling resume will unpause rendering even when settings.disableRendering is set to true.
     */
    resume(): void;
    /** Reassimilates actual (unknown) dom elements into existing state of the Host (= its treeNode/def structure from the root down) without remounting.
     * - The method supports reusing custom DOM elements from within the given "container" element - it should be the _containing_ element. You should most often use the element that _contains_ the host.
     * - The method also resumes rendering if was paused - unless is disableRendering is set to true in Host's settings.
     * @param container Optionally define the container for assimilation. If none given, won't use most of the features in the other arguments.
     * @param readFromDOM Re-reads the current dom props from the existing ones as well. Defaults to false.
     * @param smuggleMode Allows to replace existing elements with better ones from the container (instead of reusing what components have) - otherwise only tries to fill missing ones. Defaults to false.
     * @param removeUnused Destroy the other unused elements found in the container. Defaults to false. Note. This can be a bit dangerous.
     * @param validator Can veto any DOM element from being used. Return true to accept, false to not accept.
     * @param suggester Can be used to suggest better DOM elements in a custom fashion. Should return a DOM Node, MixDOMAssimilateItem or null.
     */
    reassimilate(container?: Node | null, readFromDOM?: boolean, smuggleMode?: boolean, removeUnused?: boolean, validator?: MixDOMAssimilateValidator | null, suggester?: MixDOMAssimilateSuggester | null): void;
    /** The main method to apply renderInfos. Everything else in here serves this.
     * - Note that all the infos in a single renderInfos array should be in tree order. (Happens automatically by the update order.)
     * - Except emptyMove's should be prepended to the start, and destructions appended to the end (<- happens automatically due to clean up being after).
     */
    applyToDOM(renderInfos: MixDOMRenderInfo[]): void;
    /** Get a dom node with approval related to cloning dom nodes. Uses instanced settings.duplicateDOMNodeHandler and externalElements bookkeeping. */
    private getApprovedNode;
    /** Core handler to create a single dom node based on a treeNode info. */
    private createDOMNodeBy;
    static escapeHTML(htmlStr: string): string;
    /** Using the bookkeeping logic, find the parent node and next sibling as html insertion targets.
     *
     * ```
     *
     * // Situation example:
     * //
     * //  <div>                               // domNode: <div/>
     * //      <Something>                     // domNode: <span/> #1
     * //          <Onething>                  // domNode: <span/> #1
     * //              <span>Stuff 1</span>    // domNode: <span/> #1
     * //          </Onething>                 //
     * //          <Onething>                  // domNode: <span/> #2
     * //              <span>Stuff 2</span>    // domNode: <span/> #2
     * //              <span>Stuff 3</span>    // domNode: <span/> #3
     * //          </Onething>                 //
     * //          <Onething>                  // domNode: <span/> #4
     * //              <span>Stuff 4</span>    // domNode: <span/> #4
     * //          </Onething>                 //
     * //      </Something>                    //
     * //      <Something>                     // domNode: <span/> #5
     * //          <Onething>                  // domNode: <span/> #5
     * //              <span>Stuff 5</span>    // domNode: <span/> #5
     * //              <span>Stuff 6</span>    // domNode: <span/> #6
     * //          </Onething>                 //
     * //          <Onething>                  // domNode: <span/> #7
     * //              <span>Stuff 7</span>    // domNode: <span/> #7
     * //          </Onething>                 //
     * //      </Something>                    //
     * //  </div>                              //
     * //
     * //
     * // LOGIC FOR INSERTION (moving and creation):
     * // 1. First find the domParent by simply going up until hits a treeNode with a dom tag.
     * //    * If none found, stop. We cannot insert the element. (Should never happen - except for swappable elements, when it's intended to "remove" them.)
     * //    * If the domParent was found in the newlyCreated smart bookkeeping, skip step 2 below (there are no next siblings yet).
     * //       - Actually newlyCreated info is no longer used.
     * // 2. Then find the next domSibling reference element.
     * //    * Go up and check your index.
     * //    * Loop your next siblings and see if any has .domNode. If has, stop, we've found it.
     * //    * If doesn't find any (or no next siblings), repeat the loop (go one up and check index). Until hits the domParent.
     * // 3. Insert the domElement into the domParent using the domSibling reference if found (otherwise null -> becomes the last one).
     * //
     * //
     * // CASE EXAMPLE FOR FINDING NEXT SIBLING - for <span/> #2 above:
     * // 1. We first go up to <Onething/> and see if we have next siblings.
     * //    * If <span /3> has .domNode, we are already finished.
     * // 2. There are no more siblings after it, so we go up to <Something/> and do the same.
     * //    * If the third <Onething/> has a .domNode, we are finished.
     * // 3. Otherwise we go up to <div> and look for siblings.
     * //    * If the second <Something/> has a .domNode, we are finished.
     * // 4. Otherwise we are finished as well, but without a .domNode. We will be inserted as the last child.
     * //
     * //
     * // BOOKKEEPING (see updateDOMChainBy() below):
     * // - The bookkeeping is done by whenever an element is moved / created:
     * //   * Goes to update domNode up the chain until is not the first child of parent or hits a dom tag.
     * //   * Actually, it's a tiny bit more complicated: even if we are, say, the 2nd child,
     * //     but 1st child has no domNode (eg. boundary rendered null), then we should still also update the chain.
     * // - In the case of removing, the procedure is a bit more complex:
     * //   * Goes up level by level until not the first child anymore or hits a dom tag.
     * //     - On each tries to find a next sibling, unless already did find earlier.
     * //     - Then applies that node to the current (boundary) treeNode.
     * // - So if <span/> #2 is inserted above, after creating the element (and before inserting it),
     * //   will go one up to update <Onething/>, but then is not anymore the first child (of <Something>), so stops.
     *
     * ```
     *
     */
    static findInsertionNodes(treeNode: MixDOMTreeNode): [Node, Node | null] | [null, null];
    /** This should be called (after the dom action) for each renderInfo that has action: "create" / "move" / "remove" / "swap" (and on "content" if changed node).
     * - The respective action is defined by whether gives a domNode or null. If null, it's remove, otherwise it's like moving (for creation too).
     * - In either case, it goes and updates the bookkeeping so that each affected boundary always has a .domNode reference that points to its first element.
     * - This information is essential (and as minimal as possible) to know where to insert new domNodes in a performant manner. (See above findInsertionNodes().)
     * - Note that if the whole boundary unmounts, this is not called. Instead the one that was "moved" to be the first one is called to replace this.
     *      * In dom sense, we can skip these "would move to the same point" before actual dom moving, but renderInfos should be created - as they are automatically by the basic flow.
     */
    static updateDOMChainBy(fromTreeNode: MixDOMTreeNode, domNode: Node | null, fromSelf?: boolean): void;
    /** Returns a single html element.
     * - In case, the string refers to multiple, returns a fallback element containing them - even if has no content.
     */
    static domNodeFrom(innerHTML: string, fallbackTagOrEl?: DOMTags | HTMLElement, keepTag?: boolean): Node | null;
    /** Read the content inside a (root) tree node as a html string. Useful for server side or static rendering.
     * @param treeNode An abstract info object: MixDOMTreeNode. Contains all the necessary info and linking and implies tree structure.
     * @param escapeHTML Defaults to false. If set to true escapes the `&`, `<` and `>` characters in text content.
     * @param onlyClosedTagsFor Define how to deal with closed / open tags per tag name. Defaults to `domSelfClosingTags` (from "dom-types").
     *      - If an array, only uses a single closed tag (`<div />`) for elements with matching tag (if they have no kids), for others forces start and end tags.
     *      - If it's null | undefined, then uses closed tags based on whether has children or not (= only if no children).
     */
    static readDOMString(treeNode: MixDOMTreeNode, escapeHTML?: boolean, indent?: number, onlyClosedTagsFor?: readonly string[] | string[] | null | undefined): string;
    /** Modifies the groundedTree by smuggling in already existing DOM nodes. */
    static onRemount(remountSource: MixDOMRemountInfo, groundedTree: MixDOMTreeNode): void;
    /** Create virtual items mapping from the given container node. */
    static createVirtualItemsFor(container: Node): {
        vRoot: MixDOMAssimilateItem;
        vKeyedByTags: Partial<Record<DOMTags, MixDOMAssimilateItem[]>>;
    };
    /** Flattens the virtual item tree structure into an array.
     * @param vRoot The root virtual item to flatten by its children. The root is included in the returned array.
     * @returns The flattened array of virtual items containing all the items in tree order.
     */
    static flattenVirtualItems(vRoot: MixDOMAssimilateItem): MixDOMAssimilateItem[];
    /** Returns a DOM matched [treeNode, virtualItem, node] pairings. If onlyMatched is true and vRoot provided, only returns the ones matched with the virtual structure. Otherwise just all by "dom" type treeNode - paired or not. */
    static getVirtualDomPairs(rootNode: MixDOMTreeNode, vInfo: MixDOMReassimilateInfo, onlyMatched: true): [treeNode: MixDOMTreeNodeDOM, vItem: MixDOMAssimilateItem | null, node: Node][];
    static getVirtualDomPairs(rootNode: MixDOMTreeNode, vInfo: MixDOMReassimilateInfo, onlyMatched?: boolean): [treeNode: MixDOMTreeNodeDOM, vItem: MixDOMAssimilateItem | null, node: Node | null][];
    /** Find a suitable virtual item from the structure.
     * - Tries the given vItem, or if used its children.
     * - Can use an optional suggester that can suggest some other virtual item or a direct dom node.
     *      * Any suggestions (by the callback or our tree structure) must always have matching tag and other some requirements.
     *      * If suggests a virtual item it must fit the structure. If suggests a dom node, it can be from anywhere basically - don't steal from another host.
     * - Can also use an optional validator that should return true to accept, false to not accept. It's the last one in the chain that can say no.
     * - DEV. NOTE. This is a bit SKETCHY.
     */
    static getTreeNodeMatch(treeNode: MixDOMTreeNodeDOM, vItem: MixDOMAssimilateItem | null, vKeyedByTags?: Partial<Record<DOMTags, MixDOMAssimilateItem[]>> | null, excludedNodes?: Set<Node> | null, validator?: MixDOMAssimilateValidator | null, suggester?: MixDOMAssimilateSuggester | null): MixDOMAssimilateItem | Node | null;
    /** Internal helper for getTreeNodeMatch. Checks if the virtual item is acceptable for the treeNode. Returns true if it is, false if not. */
    private static isVirtualItemOk;
}

interface MixDOMPrePseudoProps extends MixDOMInternalBaseProps {
}
interface PseudoFragmentProps extends MixDOMPrePseudoProps {
}
/** Fragment represent a list of render output instead of stuff under one root. Usage example: `<MixDOM.Fragment><div/><div/></MixDOM.Fragment>` */
declare class PseudoFragment<Props = {}> {
    ["constructor"]: {
        _Info?: {
            props: PseudoFragmentProps & Props;
        };
    };
    static MIX_DOM_CLASS: string;
    readonly props: PseudoFragmentProps & Props;
    constructor(_props: PseudoFragmentProps & Props);
}
interface PseudoPortalProps extends MixDOMPrePseudoProps {
    container: Node | null;
}
/** Portal allows to insert the content into a foreign dom node.
 * Usage example: `<MixDOM.Portal container={myDOMElement}><div/></MixDOM.Portal>` */
declare class PseudoPortal<Props = {}> {
    ["constructor"]: {
        _Info?: {
            props: PseudoPortalProps & Props;
        };
    };
    static MIX_DOM_CLASS: string;
    readonly props: PseudoPortalProps & Props;
    constructor(_props: PseudoPortalProps & Props);
}
type PseudoElementProps<Tag extends DOMTags | string & {} = DOMTags, DOMCase extends MixDOMCase = "mixedCase"> = MixDOMPreProps<Tag, DOMCase> & {
    /** HTML or SVG element to smuggle in. */
    element: HTMLElement | SVGElement | null;
    /** Determines what happens when meeting duplicates.
     * - If == null, uses the Host based setting.
     * - If boolean, then is either "deep" or nothing. */
    cloneMode?: boolean | MixDOMCloneNodeBehaviour | null;
};
/** PseudoElement component class allows to use an existing dom element as if it was part of the system, so you can modify its props and insert content etc.
 * - Usage example: `<MixDOM.Element element={el} style="background: #ccc"><span>Some content</span></MixDOM.Element>`.
 */
declare class PseudoElement<Tag extends DOMTags | string & {} = DOMTags, DOMCase extends MixDOMCase = "mixedCase", Props = {}> {
    ["constructor"]: {
        _Info?: {
            props: PseudoElementProps<Tag, DOMCase> & Props;
        };
    };
    static MIX_DOM_CLASS: string;
    readonly props: PseudoElementProps<Tag, DOMCase> & Props;
    constructor(_props: PseudoElementProps<Tag, DOMCase> & Props);
}
/** Empty dummy component that accepts any props, but always renders null. */
interface PseudoEmptyProps {
}
declare class PseudoEmpty<Props = {}> {
    ["constructor"]: {
        _Info?: {
            props: PseudoEmptyProps & Props;
        };
    };
    static MIX_DOM_CLASS: string;
    readonly props: PseudoEmptyProps & Props;
    constructor(_props: PseudoEmptyProps & Props);
    render(): MixDOMRenderOutput;
}
interface PseudoEmptyRemoteProps extends ComponentRemoteProps {
}
declare const PseudoEmptyRemote_base: ReClass<ComponentRemoteType<{}>, {}, [props: ComponentRemoteProps, boundary?: SourceBoundary | undefined]>;
/** This is an empty dummy remote class:
 * - Its purpose is to make writing render output easier (1. no empty checks, and 2. for typing):
 *     * For example: `const MyRemote = component.state.PopupRemote || MixDOM.EmptyRemote;`
 *     * You can then access the Content and ContentCopy members, and copyContent(key) and withContent(...contents) methods fluently.
 * - However, they will just return null, so won't have any effect on anything.
 *     * Note also that technically speaking this class extends PseudoEmpty.
 *     * And it only adds the 2 public members (Content and ContentCopy) and 2 public methods (copycontent and withContent).
 *     * Due to not actually being a remote, it will never be used as a remote. It's just a straw dog.
 * - If you need to distinguish between real and fake, use `isRemote()` method. The empty returns false.
 */
declare class PseudoEmptyRemote<Props = {}> extends PseudoEmptyRemote_base {
    constructor(props: ComponentProps<{
        props: ComponentRemoteProps & Props;
    }>, boundary?: SourceBoundary);
    static MIX_DOM_CLASS: string;
    static Content: MixDOMDefTarget | null;
    static ContentCopy: MixDOMDefTarget | null;
    static copyContent: (_key?: any) => MixDOMDefTarget | null;
    static filterContent: (_filterer: (remote: ComponentRemote, i: number) => boolean, _copyKey?: any) => MixDOMDefTarget | null;
    static wrapContent: (_wrapper: (remote: ComponentRemote, i: number) => MixDOMRenderOutput, _copyKey?: any) => MixDOMDefTarget | null;
    static renderContents: (_handler: (remotes: Array<ComponentRemote>) => MixDOMRenderOutput) => MixDOMDefTarget | null;
    static hasContent: (_filterer?: ((remote: ComponentRemote, i: number) => boolean) | undefined) => boolean;
    static WithContent: ComponentTypeEither<{
        props: {
            hasContent?: boolean | undefined;
        };
    }> & {
        _WithContent: MixDOMDefTarget;
        withContents: Set<SourceBoundary>;
    };
    static isRemote(): boolean;
    static sources: ComponentRemote[];
}
interface PseudoEmptyRemote<Props = {}> extends ComponentRemote<Props & {}> {
    ["constructor"]: ComponentRemoteType<Props & {}>;
}
type MixDOMPseudoTags<Props extends Record<string, any> = {}> = typeof PseudoFragment<Props> | typeof PseudoElement<DOMTags, "mixedCase", Props> | typeof PseudoPortal<Props> | typeof PseudoEmpty<Props> | typeof PseudoEmptyRemote<Props>;

declare class ComponentWiredAPI<ParentProps extends Record<string, any> = {}, BuiltProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = {}> extends ComponentShadowAPI<{
    props: ParentProps;
    state: MixedProps;
}> {
    /** The additional props created by the builder are stored here. */
    builtProps: BuiltProps | null;
    /** Default update modes. These will be used for each wired component instance.
     * - Note that we add `{ props: "never" }` as default in the constructor.
     * - This is because we want the update checks to skip props and use the `state` (that we pass as props to the inner component).
     */
    updateModes?: Partial<MixDOMUpdateCompareModesBy>;
    constructor();
    /** This is used to get the new props by the builder. It's only used when manually called with .refresh() or when the wired source component (if any) updates. */
    buildProps(): BuiltProps | null;
    /** Get the final mixed props for a component instance of our wired class. */
    getMixedProps(wired: Component): MixedProps;
    /** Call this to manually update the wired part of props and force a refresh.
     * - This is most often called by the static refresh method above, with props coming from the builder / built props. */
    setProps(builtProps: BuiltProps | null, forceUpdate?: boolean | "all" | "trigger", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Call this to rebuild the wired part of props and trigger a refresh on the instances.
     * - If the props stay the same, you should set `forceUpdate = "trigger"`, or rather just call `update()` directly if you know there's no builder. */
    refresh(forceUpdate?: boolean | "all" | "trigger", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Call this to trigger an update on the instanced components.
     * - This sets the state of each wired components using the getMixedProps method to produce the final mixed props (that will be passed to the renderer component as props). */
    update(update?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Optional callback to build the common props upon refresh start. These are then fed to the mixer as extra info. */
    onBuildProps?(lastProps: BuiltProps | null): BuiltProps | null;
    /** Optional callback to build the common props upon refresh start. These are then fed to the mixer as extra info. */
    onMixProps?(parentProps: ParentProps & {}, buildProps: [this["onBuildProps"]] extends [Function] ? BuiltProps : null, wired: Component<{
        props?: ParentProps;
    }>): MixedProps;
}
/** Creates a wired component.
 * - The wired component is an intermediary component to help produce extra props to an inner component.
 *      * It receives its parent props normally, and then uses its `state` for the final props that will be passed to the inner component (as its `props`).
 * - About arguments:
 *      1. The optional Builder function builds the common external props for all wired instances. These are added to the component's natural props.
 *      2. The optional Mixer function builds unique props for each wired instance. If used, the common props are fed to it and the output of the mixer instead represents the final props to add.
 *      3. The only mandatory argument is the component to be used in rendering, can be a spread func, too. It's the one that receives the mixed props: from the tree flow and from the wiring source by handled by Mixer and Builder functions.
 *      4. Finally you can also define the name of the component (useful for debugging).
 * - Technically this method creates a component function (but could as well be a class extending Component).
 *      - The important thing is that it's a unique component func/class and it has `api` member that is of `WiredAPI` type (extending `ComponentShadowAPI`).
 *      - When the component is instanced, its static class side contains the same `api` which serves as the connecting interface between the driver and all instances.
 *      - This class can then allow to set and refresh the common props, and trigger should-updates for all the instances and use signals.
 *      - The `WiredAPI` extension contains then features related to the automated mixing of parent props and custom data to produce final state -> inner component props.
 * - Note that when creates a stand alone wired component (not through Component component's .createWired method), you should drive the updates manually by .setProps.
 * - Note. To hook up the new wired component (class/func) to the updates of another component use: `component.addWired(Wired)` and remove with `component.removeWired(Wired)`.
 *
 * ```
 *
 *  // Imports.
 *  import { MixDOM, ComponentTypeAny } from "mix-dom";
 *
 *  // Typing extra props.
 *  interface MyWiredProps {
 *      name: string;
 *  }
 *  interface MyWiredBuiltProps {
 *      enabled: boolean;
 *  }
 *
 *  // The source component.
 *  const Source = MixDOM.component<{ props: { enableWired: boolean; }; }>(comp => {
 *
 *  	// Create a wired component to be passed down.
 *      // .. The wired component can use things from our scope here.
 *  	// .. Can feed in 3 type args: <ParentProps, BuiltProps, MixedProps>
 *  	const MyWired = MixDOM.wired<MyWiredProps, MyWiredBuiltProps>(
 *
 *  		// // Could have a builder func as the 1st arg - to build common props for all instances.
 *  		// // .. It would be called when the Source is checked for updates (even if not updated).
 *  		// (lastProps) => ({ enabled: comp.props.enableWired }), // typed: `MyWiredBuiltProps | null`
 *
 *  		// The next arg is the props mixer function - to build props for each wired instance.
 *  		// .. You can mix parent props (by flow) and props from build (by builder).
 *          // .. To drop the mixer but use a builder, set the mixer arg to \`null\`.
 *  		(parentProps, _buildProps, _wired) =>
 *  			({ ...parentProps, enabled: comp.props.enableWired }),
 *
 *  		// The last arg is the component renderer - let's just define an inline spread func.
 *  		// .. Its props are the individually mixed props created with the mixer above.
 *  		(props) => <span class={props.enabled ? "enabled" : ""}>{props.name}</span>,
 *
 *  		// Name for debugging.
 *  		"MyWired"
 *  	);
 *
 *  	// Hook up to updates.
 *      // .. As we use our own props in our Wired component, let's hook it up for our refreshes.
 *  	comp.addWired(MyWired);
 *
 *  	// Return renderer.
 *  	// .. Let's say SomeComponent is a component that utilizes MyWired somewhere deep down.
 *  	return () => <SomeComponent MyWired={MyWired} />;
 *  });
 *
 *  // Dummy component.
 *  type SomeComponentInfo = { props: { MyWired: ComponentTypeAny<{ props: MyWiredProps; }>}; };
 *  const SomeComponent = MixDOM.component<SomeComponentInfo>(() =>
 *      (props) => <div><props.MyWired name="test" /></div>);
 *
 * ```
 */
declare function createWired<ParentProps extends Record<string, any> = {}, BuiltProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = ParentProps & BuiltProps>(mixer: null, renderer: ComponentTypeAny<{
    props: MixedProps;
}>, name?: string): ComponentWiredFunc<ParentProps, BuiltProps, MixedProps>;
declare function createWired<ParentProps extends Record<string, any> = {}, BuiltProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = ParentProps & BuiltProps, Mixer extends (parentProps: ParentProps, buildProps: null, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps = (parentProps: ParentProps, buildProps: null, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps>(mixer: Mixer, renderer: ComponentTypeAny<{
    props: MixedProps;
}>, name?: string): ComponentWiredFunc<ParentProps, BuiltProps, MixedProps>;
declare function createWired<ParentProps extends Record<string, any> = {}, BuiltProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = ParentProps & BuiltProps, Mixer extends (parentProps: ParentProps, buildProps: null, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps = (parentProps: ParentProps, buildProps: null, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps>(builder: null, mixer: Mixer, renderer: ComponentTypeAny<{
    props: MixedProps;
}>, name?: string): ComponentWiredFunc<ParentProps, BuiltProps, MixedProps>;
declare function createWired<ParentProps extends Record<string, any> = {}, BuiltProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = ParentProps & BuiltProps, Builder extends (lastProps: BuiltProps | null) => BuiltProps = (lastProps: BuiltProps | null) => BuiltProps, Mixer extends (parentProps: ParentProps, buildProps: BuiltProps, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps = (parentProps: ParentProps, buildProps: BuiltProps, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps>(builder: Builder | BuiltProps, mixer: Mixer | null, renderer: ComponentTypeAny<{
    props: MixedProps;
}>, name?: string): ComponentWiredFunc<ParentProps, BuiltProps, MixedProps>;

/** Wired can be a function with `{ api }` assigned. The access is the same: `MyWiredCompOrFunc.api`. */
type ComponentWiredFunc<ParentProps extends Record<string, any> = {}, BuiltProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = {}> = ((props: ParentProps, component: ComponentWired<ParentProps>) => MixDOMRenderOutput | MixDOMDoubleRenderer<ParentProps, MixedProps>) & {
    api: ComponentWiredAPI<ParentProps, BuiltProps, MixedProps>;
};
/** There is no actual pre-existing class for ComponentWired. But for typing, we can provide the info for the static side. */
interface ComponentWiredType<ParentProps extends Record<string, any> = {}, BuiltProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = {}> extends ComponentShadowType<{
    props: ParentProps;
    state: MixedProps;
}> {
    api: ComponentShadowAPI<{
        props: ParentProps;
        state: MixedProps;
    }> & ComponentWiredAPI<ParentProps, BuiltProps, MixedProps>;
}
/** There is no actual class for ComponentWired. Instead a new class is created when createWired method is used. */
interface ComponentWired<ParentProps extends Record<string, any> = {}, BuiltProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = {}> extends ComponentShadow<{
    props: ParentProps;
    state: MixedProps;
}> {
    ["constructor"]: ComponentWiredType<ParentProps, BuiltProps, MixedProps>;
}

type WithContentInfo = {
    props: {
        /** If set to a boolean value (= not null nor undefined), skips checking whether actually has content and returns the value. */
        hasContent?: boolean | null;
    };
    class: {
        /** Internal method to check whether has content - checks recursively through the parental chain. */
        hasContent(): boolean;
    };
};
declare const MixDOMWithContent: ComponentType<WithContentInfo>;

type ComponentHOC<RequiredType extends ComponentTypeAny, FinalType extends ComponentTypeAny> = (InnerComp: RequiredType) => FinalType;
type ComponentHOCBase = (InnerComp: ComponentTypeAny) => ComponentTypeAny;
type ComponentMixinType<Info extends Partial<ComponentInfo> = {}, RequiresInfo extends Partial<ComponentInfo> = {}> = (Base: GetComponentTypeFrom<RequiresInfo>) => GetComponentTypeFrom<RequiresInfo & Info>;
type ComponentFuncRequires<RequiresInfo extends Partial<ComponentInfo> = {}, OwnInfo extends Partial<ComponentInfo> = {}> = ComponentFunc<RequiresInfo & OwnInfo> & {
    _Required?: ComponentFunc<RequiresInfo>;
};
type ComponentFuncMixable<RequiredFunc extends ComponentFunc = ComponentFunc, OwnInfo extends Partial<ComponentInfo> = {}> = ComponentFunc<ReadComponentInfo<RequiredFunc> & OwnInfo> & {
    _Required?: RequiredFunc;
};
/** Helper to test if the component info from the ExtendingAnything extends the infos from the previous component (BaseAnything) - typically in the mixing chain.
 * - In terms of infos, only compares the infos, does not test against what basic component class instances always have.
 * - Feed in the 3rd arg for RequireForm to require about whether should be a function, or class instance, class type, or whatever. (RequireForm defaults to any.)
 */
type ExtendsComponent<ExtendingAnything, BaseAnything, RequireForm = any> = [ExtendingAnything] extends [RequireForm] ? ReadComponentInfo<BaseAnything> extends ReadComponentRequiredInfo<ExtendingAnything> ? any : never : never;
/** Helper to test if the component info from the ExtendingAnything extends the merged infos from the previous components (BaseAnythings) - typically in the mixing chain.
 * - In terms of infos, only compares the infos, does not test against what basic component class instances always have.
 * - Feed in the 3rd arg for RequireForm to require about whether should be a function, or class instance, class type, or whatever. (RequireForm defaults to any.)
 */
type ExtendsComponents<ExtendingAnything, BaseAnythings extends any[], RequireForm = any> = [ExtendingAnything] extends [RequireForm] ? ReadComponentInfos<BaseAnythings> extends ReadComponentRequiredInfo<ExtendingAnything> ? any : never : never;
/** This creates a new ComponentShadowAPI or ComponentWiredAPI and merges updateModes and signals.
 * - If is a ComponentWiredAPI also attaches the last builtProps member, and onBuildProps and onMixProps methods.
 */
declare function mergeShadowWiredAPIs(apis: Array<ComponentShadowAPI>): ComponentShadowAPI;
declare function mergeShadowWiredAPIs(apis: Array<ComponentWiredAPI>): ComponentWiredAPI;
/** This mixes many component functions together. Each should look like: `(initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer`.
 * - Note that this only "purely" mixes the components together (on the initial render call).
 *      * By default does not put a renderer function in the end but just passes last output (preferring funcs, tho). If you want make sure a renderer is in the end, put last param to true: `(...funcs, true)`
 *      * Compare this with `mixFuncsWith(..., composer)`, that always returns a renderer. (And its last argument is auto-typed based on all previous.)
 * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
 *      * Note that you should only use `ComponentFunc` or `ComponentFuncMixable`. Not supported for spread functions (makes no sense) nor component classes (not supported for this flow, see mixClassFuncs instead).
 *      * You should type each function most often with `ComponentFunc<Info>` type or `MixDOM.component<Info>()` method. If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
 * - This also supports handling contextual needs (by a func having 3 args) as well as attaching / merging ComponentShadowAPI | ComponentWiredAPI.
 * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
 *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
 *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
 * - Note that if the mixable funcs contain static properties, the "api" is a reserved property for ComponentShadowAPI and ComponentWiredAPI, otherwise can freely assign - each extends more.
 */
declare function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>>(a: A, useRenderer?: boolean): ComponentFunc<ReadComponentInfo<A>>;
declare function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>>(a: A, b: B, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B]>>;
declare function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>>(a: A, b: B, c: C, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C]>>;
declare function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>>(a: A, b: B, c: C, d: D, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D]>>;
declare function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D, E]>>;
declare function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, f: F, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F]>>;
declare function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G]>>;
declare function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G, H]>>;
/** This mixes many component functions together. Each should look like: (initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer.
 * - Unlike mixFuncs, the last argument is a mixable func that should compose all together, and its typing comes from all previous combined.
 *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
 *      * Alternatively you can add them to the 2nd last function with: `SomeMixFunc as ComponentFunc<ReadComponentInfo<typeof SomeMixFunc, ExtraInfo>>`.
 * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
 *      * Note that you should only use ComponentFunc or ComponentFuncMixable. Not supported for spread functions (makes no sense) nor component classes (not supported).
 *      * You should type each function most often with ComponentFunc<Info> or MixDOM.component<Info>(). If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
 * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
 *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
 *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
 */
declare function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfo<A, ExtraInfo>>>(a: A, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfo<A, ExtraInfo>>;
declare function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B], ExtraInfo>>>(a: A, b: B, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B], ExtraInfo>>;
declare function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C], ExtraInfo>>>(a: A, b: B, c: C, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C], ExtraInfo>>;
declare function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D], ExtraInfo>>>(a: A, b: B, c: C, d: D, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D], ExtraInfo>>;
declare function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>;
declare function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>;
declare function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>;
declare function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>;
/** This returns the original function (to create a mixin class) back but simply helps with typing.
 * - The idea of a mixin is this: `(Base) => class extends Base { ... }`. So it creates a new class that extends the provided base class.
 *     * In the context of Components the idea is that the Base is Component and then different features are added to it.
 *     * Optionally, when used with mixMixins the flow also supports adding requirements (in addition to that the Base is a Component class).
 * - To use this method: `const MyMixin = createMixin<RequiresInfo, MyMixinInfo>(Base => class _MyMixin extends Base { ... }`
 *     * Without the method: `const MyMixin = (Base: GetComponentTypeFrom<RequireInfo>) => class _MyMixin extends (Base as GetComponentTypeFrom<RequireInfo & MyMixinInfo>) { ... }`
 *     * So the trick of this method is simply that the returned function still includes `(Base: Required)`, but _inside_ the func it looks like `(Base: Required & Added)`.
*/
declare function createMixin<Info extends Partial<ComponentInfo>, RequiresInfo extends Partial<ComponentInfo> = {}>(func: (Base: GetComponentTypeFrom<RequiresInfo & Info>) => GetComponentTypeFrom<RequiresInfo & Info>): (Base: GetComponentTypeFrom<RequiresInfo>) => GetComponentTypeFrom<RequiresInfo & Info>;
/** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ...)`.
 * - Note. The last mixin with a render method defined is used as the render method of the combined class.
 * - Note. If you want to define a custom base class (extending Component) you can use `mixClassMixins` method whose first argument is a base class.
 * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
*/
declare function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>>(a: A): ComponentType<ReadComponentInfo<A>>;
declare function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>>(a: A, b: B): ComponentType<ReadComponentInfos<[A, B]>>;
declare function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>>(a: A, b: B, c: C): ComponentType<ReadComponentInfos<[A, B, C]>>;
declare function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>>(a: A, b: B, c: C, d: D): ComponentType<ReadComponentInfos<[A, B, C, D]>>;
declare function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E): ComponentType<ReadComponentInfos<[A, B, C, D, E]>>;
declare function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<ReadComponentInfos<[A, B, C, D, E, F]>>;
declare function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G]>>;
declare function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G, H]>>;
/** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ..., ComposerMixin)`
 * - Note. The last mixin is assumed to be the one to do the rendering and its type is combined from all the previous + the optional extra info given as the very last argument.
 * - This is like mixFuncsWith but for mixins. On the javascript this function is teh same as MixDOM.mixMixins.
 */
declare function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, Info extends ReadComponentInfo<A, ExtraInfo>>(a: A, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, Info extends ReadComponentInfos<[A, B], ExtraInfo>>(a: A, b: B, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C], ExtraInfo>>(a: A, b: B, c: C, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D], ExtraInfo>>(a: A, b: B, c: C, d: D, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
/** Mix many mixins together with a custom Component class as the basis to mix on: `(MyClass, MyMixin1, MyMixin2, ...)`.
 * - Note. The last mixin with a render method defined is used as the render method of the combined class.
 * - Note. If you don't want to define a custom component class as the base, you can use the `mixMixins` function instead (which uses the Component class). These two funcs are split to get better typing experience.
 * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
*/
declare function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>>(base: Base, a: A): ReturnType<A>;
declare function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>>(base: Base, a: A, b: B): ComponentType<ReadComponentInfos<[Base, A, B]>>;
declare function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>>(base: Base, a: A, b: B, c: C): ComponentType<ReadComponentInfos<[Base, A, B, C]>>;
declare function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>>(base: Base, a: A, b: B, c: C, d: D): ComponentType<ReadComponentInfos<[Base, A, B, C, D]>>;
declare function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>>(base: Base, a: A, b: B, c: C, d: D, e: E): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E]>>;
declare function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [Base, A, B, C, D, E], ComponentMixinType>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E, F]>>;
declare function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [Base, A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [Base, A, B, C, D, E, F], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E, F, G]>>;
declare function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [Base, A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [Base, A, B, C, D, E, F], ComponentMixinType>, H extends ExtendsComponents<H, [Base, A, B, C, D, E, F, G], ComponentMixinType>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E, F, G, H]>>;
/** This mixes together a Component class and one or many functions.
 * - By default, attaches the return of the last function as the renderer (if function type, otherwise an earlier one).
 * - Optionally as the 3rd arg, can provide a boolean to use the class renderer instead. */
declare function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>>(Base: Class, a: A, useClassRender?: boolean): A;
declare function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>>(Base: Class, a: A, b: B, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B]>>;
declare function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>>(Base: Class, a: A, b: B, c: C, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C]>>;
declare function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D]>>;
declare function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D, E]>>;
declare function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [BaseFunc, A, B, C, D, E], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D, E, F]>>;
declare function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [BaseFunc, A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [BaseFunc, A, B, C, D, E, F], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G]>>;
declare function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [BaseFunc, A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [BaseFunc, A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [BaseFunc, A, B, C, D, E, F, G], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G, H]>>;
/** This mixes together a Component class and one or many functions with a composer function as the last function.
 * - The last function is always used as the renderer and its typing is automatic.
 *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
 */
declare function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, Mixed extends ComponentFunc<ReadComponentInfo<BaseFunc, ExtraInfo>>>(Base: Class, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A], ExtraInfo>>>(Base: Class, a: A, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B], ExtraInfo>>>(Base: Class, a: A, b: B, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E, F], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E, F, G], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E, F, G, H], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
/** Combine many HOCs together. */
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A): SpreadFunc<ReadComponentInfo<A, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B): SpreadFunc<ReadComponentInfo<B, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C): SpreadFunc<ReadComponentInfo<C, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D): SpreadFunc<ReadComponentInfo<D, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E): SpreadFunc<ReadComponentInfo<E, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F): SpreadFunc<ReadComponentInfo<F, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G): SpreadFunc<ReadComponentInfo<G, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H): SpreadFunc<ReadComponentInfo<H, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny, I extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H, hoc9: (h: H) => I): SpreadFunc<ReadComponentInfo<I, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny, I extends ComponentTypeAny, J extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H, hoc9: (h: H) => I, hoc10: (i: I) => J): SpreadFunc<ReadComponentInfo<J, ComponentInfoEmpty>["props"] & {}>;

/** Get the component instance type from component class type or component function, with optional fallback (defaults to Component). */
type ComponentInstance<CompType extends ComponentType | ComponentFunc> = Component<ReadComponentInfo<CompType>>;
/** Same as `Component<Info>` but enforces the "class" and "static" infos on the resulting type. */
type ComponentWith<Info extends ComponentInfoPartial = {}> = Component<Info> & Info["class"] & {
    ["constructor"]: ComponentType<Info> & Info["static"];
};
/** Same as `ComponentWith<Info>` but makes sure contextAPI is assigned as non-optional member. (Enforces the "class" and "static" infos on the resulting type.) */
type ComponentCtxWith<Info extends ComponentInfoPartial = {}> = ComponentCtx<Info> & Info["class"] & {
    ["constructor"]: ComponentType<Info> & Info["static"];
};
/** The common component constructor arguments from component info. (Only uses "props" from it.) */
type ComponentConstructorArgs<Info extends ComponentInfoPartial = {}> = [props: ComponentProps<Info>, boundary?: SourceBoundary, ...args: any[]];
/** Typing (from the given Info) for the first initProps argument of functional (non-spread) components.
 * - The typing includes all the internal special props: `{ _key, _disable, _ref, _signals, _contexts }`.
 *      * The typing for `_signals` and `_contexts` includes reading them from the Info accordingly, while typing for `_ref` is tied to `ComponentTypeEither<any>` or similar array.
 *      * Note however that these special props _never exist_ as part of the actual props for the component. They are only present for TSX typing reasons.
 * - Note. Use this type for the functional component's 1st arg: `(initProps, component)`, and likewise in component class constructor's 1st arg `(initProps, boundary?)`.
 *      * The actual (props) in the render method / returned function will never include any special properties. (And of course they are never present on the JS side - not in render method nor in constructor/initialization.)
 */
type ComponentProps<Info extends ComponentInfoPartial = {}> = MixDOMInternalCompProps<Info["signals"] & {}> & Info["props"];
/** Functional type for component fed with ComponentInfo. Defaults to providing contextAPI, but one will only be hooked if actually provides 3 arguments - at least 2 is mandatory (otherwise just a SpreadFunc). To apply { static } info, use the MixDOM.component shortcut. */
type ComponentFunc<Info extends ComponentInfoPartial = {}> = ((initProps: ComponentProps<Info>, component: ComponentWith<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => ComponentFuncReturn<Info>) & {
    _Info?: Info;
} & (IsAny<Info["static"]> extends true ? Record<string, any> : Info["static"]);
/** The arguments for functional components without contextAPI - so just 2 args. To include contextAPI use `ComponentCtxFuncArgs<Info>` instead. */
type ComponentFuncArgs<Info extends ComponentInfoPartial = {}> = [initProps: ComponentProps<Info>, component: ComponentWith<Info>];
/** The arguments for functional components with contextAPI - so 3 args. Also enforces the presence of component.contextAPI in the 2nd arg. */
type ComponentCtxFuncArgs<Info extends ComponentInfoPartial = {}> = [initProps: ComponentProps<Info>, component: ComponentCtxWith<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>];
/** Typing for functional component's return - same as component's `render` method. */
type ComponentFuncReturn<Info extends ComponentInfoPartial = {}> = MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>;
/** Any type of functional component including spread funcs.
 * - Note. The type does not actually include SpreadFunc specifically - but includes it as being a more restricted form of a ComponentFunc.
 *      * This is simply so that (props) can be auto typed when using this type. The same goes for the ComponentCtxFunc with its 3rd arg - already included in ComponentFunc.
 */
type ComponentFuncAny<Info extends Partial<ComponentInfo> = {}> = ComponentFunc<Info>;
/** Either a class type or a component func - not a spread func (nor a component class instance). */
type ComponentTypeEither<Info extends Partial<ComponentInfo> = {}> = ComponentType<Info> | ComponentFunc<Info>;
/** This is a shortcut for all valid MixDOM components: class, component func or a spread func. Not including class instances, only types.
 * - Hint. You can use this type in props to refer to a custom component with info: `{ ItemRenderer: ComponentTypeAny<Info>; }`, and then just insert it by `<props.ItemRenderer {...itemInfo} />`
 */
type ComponentTypeAny<Info extends Partial<ComponentInfo> = {}> = ComponentType<Info> | ComponentFuncAny<Info>;
/** Get a clean Component class instance type from anything (info, class type/instance, func, spread, HOC, mixin, mixable func, ...). Enforces the "class" requirements. */
type GetComponentFrom<Anything> = Component<ReadComponentInfo<Anything, ComponentInfoEmpty>> & ReadComponentInfo<Anything, ComponentInfoEmpty>["class"] & {
    ["constructor"]: ReadComponentInfo<Anything, ComponentInfoEmpty>["static"];
};
/** Get a clean Component class type (non-instanced) from anything (info, class type/instance, func, spread, HOC, mixin, mixable func, ...). Enforces the "class" requirements. */
type GetComponentTypeFrom<Anything> = ComponentType<ReadComponentInfo<Anything, ComponentInfoEmpty>> & ReadComponentInfo<Anything, ComponentInfoEmpty>["static"];
/** Get a clean Component function type from anything (info, class type/instance, func, spread, HOC, mixin, mixable func, ...). Enforces the "class" requirements. */
type GetComponentFuncFrom<Anything> = ComponentFunc<ReadComponentInfo<Anything, ComponentInfoEmpty>>;
/** Add Component features to a custom class. Provide the BaseClass type specifically as the 2nd type argument.
 * - For examples of how to use mixins, see: [mixin-types README](https://www.npmjs.com/package/mixin-types).
 * - To read typing of the base class use one of the below:
 *      1. Provide it manually using `typeof BaseClass`. For example: `mixinComponent<Info, typeof BaseClass>(BaseClass)`.
 *      2. Use `AsMixin` to auto-read the typing from the BaseClass. For example: `mixinComponent as AsMixin<Component<Info>>(BaseClass)`.
 * - Note that this feature can be used for the concept of Component mixing in the class form.
 *      * However, you can also mix components in the functional form. See more at MixDOM.mixin, MixDOM.mixFuncs and other related methods.
 *
 * ```
 *
 * // - Basic typed example - //
 *
 * // Base class with static type.
 * interface MyBaseType extends ClassType<MyBase> {
 *      SOME_STATIC: boolean;
 * }
 * class MyBase { something: boolean = false; static SOME_STATIC: boolean = false; }
 *
 * // Create some mixed components. (Should define render method, too.)
 * // .. Typing.
 * type MyInfo = { props: { test: boolean; }; };
 * // .. Without base class.
 * const MyComponent = mixinComponent<MyInfo>(Object);
 * class MyComponentClass extends mixinComponent<MyInfo>(Object) {}
 * // .. With typed base class.
 * class MyComponentWith extends mixinComponent<MyInfo, typeof MyBase>(MyBase) {
 *  	test() {
 *  		this.something = false; 	// Test MyBase instance side.
 *  		this.props.someProp; 		// Typed boolean, if using typing.
 *  		// Test static typing.
 *  		this.constructor.MIX_DOM_CLASS;
 *  		this.constructor.SOME_STATIC;
 *  	}
 * }
 * const MyComponentWith2 = mixinComponent<MyInfo, MyBaseType>(MyBase);
 * const MyComponentWith3 = (mixinComponent as AsMixin<Component<MyInfo>>)(MyBase);
 * const MyComponentWith4 = (mixinComponent as ReMixin<ComponentType<MyInfo>>)(MyBase);
 *
 * // Test static typing. (All found as expected.)
 * MyComponent.MIX_DOM_CLASS
 * MyComponentClass.MIX_DOM_CLASS
 * MyComponentWith1.MIX_DOM_CLASS
 * MyComponentWith1.SOME_STATIC
 * MyComponentWith2.MIX_DOM_CLASS
 * MyComponentWith2.SOME_STATIC
 * MyComponentWith3.MIX_DOM_CLASS
 * MyComponentWith3.SOME_STATIC
 * MyComponentWith4.MIX_DOM_CLASS
 * MyComponentWith4.SOME_STATIC
 *
 * // Test props.
 * const Test: SpreadFunc = () =>
 *      <>
 *          <MyComponent test={false} />
 *          <MyComponentClass test={false} />
 *          <MyComponentWith1 test={false} />
 *          <MyComponentWith2 test={false} />
 *          <MyComponentWith3 test={false} />
 *          <MyComponentWith4 test={false} />
 *      </>;
 *
 *
 * // - Advanced typed example - //
 * //
 * // Note. For advanced examples and guidelines, see `mixin-types` documentation:
 * // https://www.npmjs.com/package/mixin-types
 *
 * // To use generics (mixed with custom info).
 * // ..
 * type MyGenInfo = { state: { enabled: boolean; }; props: { more?: boolean; }; };
 * interface MyGenComponentType<Info extends ComponentInfoPartial = {}>
 * 	    extends ComponentType<Info & MyGenInfo> {}
 * interface MyGenComponent<Info extends ComponentInfoPartial = {}>
 * 	    extends Component<Info & MyGenInfo>, MyBase {}
 * class MyGenComponent<Info = {}> extends
 *      (mixinComponent as any as ReMixin<MyGenComponentType<any>>)(MyBase) {
 *
 *      // Can add here things, they'll be auto-typed to MyGenComponent interface.
 * 		myThing?: Info;
 * 		constructor(props: ComponentProps<Info & MyGenInfo>, boundary?: SourceBoundary, ...args: any[]) {
 * 			super(props, boundary, ...args);
 * 			this.state = {
 * 				enabled: false,
 * 			};
 * 		}
 * 		test(): void {
 * 			// Recognized correctly.
 * 			this.something = false;
 * 			this.constructor.MIX_DOM_CLASS;
 * 			// The base class needs some help here.
 * 			(this.constructor as MyGenComponentType & MyBaseType).SOME_STATIC;
 * 		}
 * 		render() {
 * 			return <div>{this.state.enabled ? "yes" : "no"}</div>;
 * 		}
 * 	}
 *
 * // Test static typing. (All found as expected.)
 * MyGenComponent.MIX_DOM_CLASS
 * MyGenComponent.SOME_STATIC
 *
 * // Test interface typing - automated from what's inside the class declaration.
 * type TestMyThing = MyGenComponent<MyInfo>["myThing"]; // MyInfo | undefined
 *
 * // Test props.
 * const TestMore: SpreadFunc = () =>
 *     <>
 *         <MyGenComponent<MyInfo> test={false} more={true} />
 *     </>;
 *
 * ```
 *
 */
declare function mixinComponent<Info extends ComponentInfoPartial = {}, BaseClass extends ClassType = ClassType>(Base: BaseClass): AsClass<ComponentType<Info> & BaseClass, Component<Info> & InstanceType<BaseClass>, ComponentConstructorArgs<Info>>;
/** Class type (vs. instance) for component fed with ComponentInfo. Note that this does not include the Info["static"] part directly. */
interface ComponentType<Info extends ComponentInfoPartial = {}> extends AsClass<SignalManType<ComponentSignals<Info> & Info["signals"]>, // & Info["static"],
ComponentWith<Info>, ComponentConstructorArgs<Info>> {
    /** Class type. */
    MIX_DOM_CLASS: string;
    /** May feature a ComponentShadowAPI. It's potential existence is pre-typed here to make typing easier. */
    api?: ComponentShadowAPI<Info>;
    /** This is only provided for typing related technical reasons. There's no actual _Info static member on the JS side. */
    _Info?: Info;
}
/** Class type (vs. instance) for component fed with ComponentInfo with enforcing the static side from Info["static"]. */
type ComponentTypeWith<Info extends ComponentInfoPartial = {}> = ComponentType<Info> & Info["static"];
declare const Component_base: ReClass<ComponentType<{}>, {}, [props: MixDOMInternalCompProps<{}>, boundary?: SourceBoundary | undefined, ...args: any[]]>;
/** Standalone Component class.
 * - Provides the basic features for rendering into the MixDOM system, orchestrator by the containing Host.
 * - Use the `render(props, state)` method to render the contents - the method is called automatically by the flow (calling it manually has no meaning).
 */
declare class Component<Info extends ComponentInfoPartial = {}> extends Component_base {
    constructor(props: ComponentProps<Info>, boundary?: SourceBoundary);
}
interface Component<Info extends ComponentInfoPartial = {}> extends SignalMan<ComponentSignals<Info> & Info["signals"]> {
    ["constructor"]: ComponentType<Info> & Info["static"];
    /** Fresh props from the parent. */
    readonly props: Info["props"] & {};
    /** If the state has changed since last render, this contains the shallow copy of the previous state. */
    readonly lastState?: Info["state"] & {};
    /** Locally defined state. When state is updated (through setState or setInState), the component will be checked for updates and then re-render if needed. */
    state: Info["state"] & {};
    /** Map of the timers by id, the value is the reference for cancelling the timer. Only appears here if uses timers. */
    timers?: Map<Info["timers"] & {}, number | NodeJSTimeout>;
    /** If any is undefined / null, then uses the default from host.settings. */
    updateModes: Partial<MixDOMUpdateCompareModesBy>;
    /** If constantProps is defined, then its keys defines props that must not change, and values how the comparison is done for each.
     * This affects the def pairing process by disallowing pairing if conditions not met, which in turn results in unmount and remount instead of just updating props (and potentially moving). */
    constantProps?: Partial<Record<keyof (Info["props"] & {}), CompareDepthMode | number | true>>;
    /** ContextAPI for the component. You can use it to access contextual features. By default inherits the named contexts from the Host, but you can also override them locally. */
    contextAPI?: ComponentContextAPI<Info["contexts"] & {}>;
    /** Ref to the dedicated SourceBoundary - it's technical side of a Component. */
    readonly boundary: SourceBoundary;
    /** Any wired component classes created by us. */
    readonly wired?: Set<ComponentWiredType | ComponentWiredFunc>;
    /** This initializes the contextAPI instance (once). */
    initContextAPI(): void;
    /** This returns a promise that is resolved after the host's refresh cycle has finished.
     * - By default delays until the "update" cycle (renderSide = false). If renderSide is true, then is resolved after the "render" cycle (after updates).
     */
    afterRefresh(renderSide?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): Promise<void>;
    /** Whether this component has mounted. If false, then has not yet mounted or has been destroyed. */
    isMounted(): boolean;
    /** This gets the state that was used during last render call (by shallow copy), and by default falls back to the current state - otherwise to null.
     * - Most often you want to deal with the new state (= `this.state`), but this is useful in cases where you want to refer to what has been rendered.
     *      * Note the lastState is simply a shallow copy of the state (at the moment of last render). So if any deeper objects within have been mutated, their state is fresher than at the moment of the last render.
     * - You can also access the previous state by `this.lastState`. If it's undefined, there hasn't been any changes in the state since last render.
     */
    getLastState(fallbackToCurrent?: true): Info["state"] & {};
    getLastState(fallbackToCurrent?: boolean): Info["state"] & {} | null;
    /** Gets the rendering host that this component belongs to. By default uses the same Contexts typing as in the component's info, but can provide custom Contexts here too. */
    getHost<Contexts extends ContextsAllType = Info["contexts"] & {}>(): Host<Contexts>;
    /** Get the first dom element within by a selectors within the host (like document.querySelector). Should rarely be used, but it's here if needed. */
    queryElement<T extends Element = Element>(selector: string, withinBoundaries?: boolean, overHosts?: boolean): T | null;
    /** Get dom elements within by a selectors within the host (like document.querySelectorAll). Should rarely be used, but it's here if needed. */
    queryElements<T extends Element = Element>(selector: string, maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean): T[];
    /** Find all dom nodes within by an optional validator. */
    findElements<T extends Node = Node>(maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): T[];
    /** Find all components within by an optional validator. */
    findComponents<Comp extends ComponentTypeAny = ComponentTypeAny>(maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): Comp[];
    /** Find all treeNodes within by given types and an optional validator. */
    findTreeNodes(types?: SetLike<MixDOMTreeNodeType>, maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[];
    /** Add a new timer with a custom id, or without if null. Returns id. Timers will be automatically cancelled if the component unmounts. You can provide the typing locally to the method. */
    setTimer(timerId: NonNullable<Info["timers"]> | null, callback: () => void, timeout: number): NonNullable<Info["timers"]> | {};
    /** Check whether the current timer id exists. */
    hasTimer(timerId: NonNullable<Info["timers"]>): boolean;
    /** Clear timer(s) by ids. If none given, clears all. */
    clearTimers(...timerIds: NonNullable<Info["timers"]>[]): void;
    /** Modify the updateModes member that defines how should compare { props, data, children, remotes } during the update process. */
    setUpdateModes(modes: Partial<MixDOMUpdateCompareModesBy>, extend?: boolean): void;
    /** Modify the constantProps member that defines which props must not change (and how) without a remount. If you set the mode to `true` it means "changed" (= 0 depth).
     * You can also override the mode for each if you just want to use the keys of another dictionary.
     * By default extends the given constant props, if you want to reset put extend to `false`. If you want to clear, leave the constProps empty (null | [] | {}) as well. */
    setConstantProps(constProps: Partial<Record<keyof (Info["props"] & {}), CompareDepthMode | number | true>> | (keyof (Info["props"] & {}))[] | null, extend?: boolean, overrideEach?: CompareDepthMode | number | null): void;
    /** Set many properties in the state at once. Can optionally define update related timing. If wanting to replace the whole state, set extend (2nd arg) to false. */
    setState<Key extends keyof (Info["state"] & {})>(fullState: Info["state"] & {}, extend: boolean, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    setState<Key extends keyof (Info["state"] & {})>(partialState: Pick<Info["state"] & {}, Key> | Info["state"] & {}, extend?: false | never, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    setState(newState: Info["state"], extend?: false | never, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Set one property in the state with typing support. Can optionally define update related timing. */
    setInState<Key extends keyof (Info["state"] & {})>(property: Key, value: (Info["state"] & {})[Key], forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Trigger an update manually. Normally you never need to use this. Can optionally define update related timing */
    triggerUpdate(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Add a wired component to this component's refresh cycle. Create the wired component using the `createWired` method. */
    addWired(Wired: ComponentWiredFunc): void;
    /** Remove a wired component to this component's refresh cycle. */
    removeWired(Wired: ComponentWiredFunc): void;
    /** The most important function of any component: the render function. If not using functional rendering, override this manually on the class.
     */
    render(props: Info["props"] & {}, state: Info["state"] & {}): ComponentFuncReturn<Info>;
}
/** Create a component by func. You get the component as the first parameter (component), while initProps are omitted. You can also give a dictionary of static properties to assign (as the 2nd arg to this creator method). */
declare function createComponent<Info extends ComponentInfoPartial = {}>(func: (component: ComponentWith<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => ComponentFuncReturn<Info>, ...args: {} | undefined extends OmitPartial<Info["static"]> | undefined ? [staticProps?: {} | null, name?: string] | [name?: string] : [staticProps: Info["static"], name?: string]): ComponentFunc<Info>;
/** Create a component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count and component typing includes component.contextAPI. You can also give a dictionary of static properties to assign (as the 2nd arg to this creator method). */
declare function createComponentCtx<Info extends ComponentInfoPartial = {}>(func: (component: ComponentCtxWith<Info> & Info["class"] & {
    ["constructor"]: Info["static"];
}, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => ComponentFuncReturn<Info>, ...args: {} | undefined extends OmitPartial<Info["static"]> | undefined ? [staticProps?: {} | null, name?: string] | [name?: string] : [staticProps: Info["static"], name?: string]): ComponentCtxFunc<Info>;

interface ContentPasserProps<CustomProps extends Record<string, any> = {}> {
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
interface ComponentRemoteProps {
    order?: number;
}
/** Instanced remote source. */
interface ComponentRemote<CustomProps extends Record<string, any> = {}> extends Component<{
    props: ComponentRemoteProps & CustomProps;
}> {
    /** The constructor is typed as ComponentRemoteType. */
    ["constructor"]: ComponentRemoteType<CustomProps>;
    /** Each remote instance has its own closure, whose contents are rendered by the unknown source instance. */
    closure: ContentClosure;
    /** Unique content pass for this source instance. It's used internally. */
    Content: MixDOMDefTarget;
    ContentCopy: MixDOMDefTarget;
    copyContent: (key?: any) => MixDOMDefTarget;
    WithContent: ComponentTypeEither<{
        props: {
            hasContent?: boolean;
        };
    }> & {
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
/** Static class side for remote output. */
interface ComponentRemoteType<CustomProps extends Record<string, any> = {}> extends ComponentType<{
    props: ComponentRemoteProps & CustomProps;
}> {
    readonly MIX_DOM_CLASS: string;
    new (props: ComponentRemoteProps & CustomProps, boundary?: SourceBoundary): ComponentRemote<CustomProps>;
    /** Check whether is the real thing or an empty pseudo remote. */
    isRemote(): boolean;
    /** Check whether any of the content passes has content. Optionally define a filterer for the check: only checks for those that returned `true` for. */
    hasContent: (filterer?: (remote: ComponentRemote<CustomProps>, i: number) => boolean) => boolean;
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
    WithContent: ComponentTypeEither<{
        props: {
            hasContent?: boolean;
        };
    }> & {
        /** Should contain the content pass object.
         * - For parental passing it's the MixDOM.Content object.
         * - For remote instance it's their Content pass object with its getRemote() method.
         * - For remote static side it's a def for a boundary.
         */
        _WithContent: MixDOMDefTarget;
        /** On the static remote side we collect the source boundaries of the instanced WithContents, for getting access to interests. */
        withContents: Set<SourceBoundary>;
    };
    /** The active remote sources. */
    sources: ComponentRemote<CustomProps>[];
    /** Add a remote source - used internally. */
    addSource(remote: ComponentRemote<CustomProps>): void;
    /** Remove a remote source - used internally.
     * - Note that this only returns remove related infos - any additions or updates are run by a host listener afterwards.
     */
    removeSource(remote: ComponentRemote<CustomProps>): MixDOMChangeInfos | null;
    /** A component to render the content passes: simply combines all the unique content passes of the child remote together. */
    ContentPasser: ComponentType<{
        props: ContentPasserProps<CustomProps>;
        static: {
            passers: Set<Component>;
        };
    }>;
}
/** Create a ComponentRemote class for remote flow (in / out).
 * - For example, `export const MyRemote = createRemote("MyRemote");`.
 * - And then to feed content in a render method: `<MyRemote>Some content..</MyRemote>`.
 * - Finally insert it somewhere in a render method: `{MyRemote.Content}`.
 */
declare const createRemote: <CustomProps extends Record<string, any> = {}>(name?: string) => ComponentRemoteType<CustomProps>;

interface MixDOMContentEnvelope {
    applied: MixDOMDefApplied;
    target: MixDOMDefTarget;
}
/** This is a technically important class used in the update flow.
 * - Most of its members are managed by the "../host/routine.ts" handlers (due to getting rid of cyclical reference on JS side).
 */
declare class ContentClosure {
    /** The boundary that is connected to this closure - we are its link upwards in the content chain. */
    thruBoundary: SourceBoundary | null;
    /** The sourceBoundary is required to render anything - it defines to whom the content originally belongs.
     * - If it would ever be switched (eg. by remote flow from multiple sources), should clear the envelope first, and then assign new.
     */
    sourceBoundary: SourceBoundary | null;
    /** The sealed envelope that contains the content to pass: { applied, targetDef }. */
    envelope: MixDOMContentEnvelope | null;
    /** If not null, then this is the grounding def that features a true pass. */
    truePassDef: MixDOMDefApplied | null;
    /** Map where keys are the grounded defs (applied), and values are [boundary, treeNode, copyKey]. */
    groundedDefs: Map<MixDOMDefApplied, [boundary: SourceBoundary | ContentBoundary, treeNode: MixDOMTreeNode, copyKey: any]>;
    /** The grounded defs that are pending refresh. If all should be refreshed, contains all the keys in the groundedDefs. */
    pendingDefs: Set<MixDOMDefApplied>;
    /** This contains the boundaries from any WithContent components that refer to us.
     * - They will be re-updated every time our envelope changes. (Actually they would just care about null vs. non-null.)
     */
    withContents?: Set<SourceBoundary>;
    /** Used to detect which closures are linked together through content passing.
     * - This is further more used for the withContents feature. (But could be used for more features.)
     * - Note that this kind of detection is not needed for remotes: as there's only the sources and target - nothing in between them.
     *      * Note that the static side of Remote's WithContent does not have its own content pass, but just checks all sources.
     */
    chainedClosures?: Set<ContentClosure>;
    /** If this closure is linked to feed a remote, assign the remote instance here. */
    remote?: ComponentRemote | null;
    constructor(thruBoundary?: SourceBoundary | null, sourceBoundary?: SourceBoundary | null);
    /** Whether we have any actual content to pass. */
    hasContent(): boolean;
    /** Get the content that we pass. */
    readContent(shallowCopy?: boolean): Readonly<MixDOMDefTarget[]> | null;
}

/** This is what "contains" a Component instance.
 * - It's a technical boundary between a Component and its Host's update flow orchestration.
 * - Each component receives its boundary as the 2nd constructor argument: `(props, boundary)`.
 */
declare class SourceBoundary extends BaseBoundary {
    /** Redefine that the outer def is about a boundary. */
    _outerDef: MixDOMDefApplied & MixDOMDefBoundary;
    /** Temporary rendering state indicator. */
    _renderState?: "active" | "re-updated";
    /** If has marked to be force updated. */
    _forceUpdate?: boolean | "all";
    /** Temporary id used during update cycle. Needed for special same-scope-multi-update case detections. (Not in def, since its purpose is slightly different there - it's for wide moves.) */
    _updateId?: {};
    /** Our host based quick id. It's mainly used for sorting, and sometimes to detect whether is content or source boundary, helps in debugging too. */
    bId: MixDOMSourceBoundaryId;
    /** Shortcut for the component. Only one can be set (and typically one is). */
    component: Component;
    /** The content closure tied to this boundary.
     * - It it's the channel through which our parent passes content to us - regardless of the update flow.
     * - When tied to a boundary, the content closure has a reference to it as .thruBoundary. (It can also be used without .thruBoundary, see ComponentRemote.) */
    closure: ContentClosure;
    constructor(host: Host, outerDef: MixDOMDefApplied & MixDOMDefBoundary, treeNode: MixDOMTreeNode, sourceBoundary?: SourceBoundary);
    /** Should actually only be called once. Initializes a Component class and assigns renderer and so on. */
    reattach(): void;
    update(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    updateBy(updates: MixDOMComponentUpdates, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    render(iRecursion?: number): MixDOMRenderOutput;
    /** Get a component class for a functional component. If has static properties, creates a new class extending Component and adds the stati properties to it, otherwise uses Component directly. */
    static getComponentFuncClass(func: ComponentFunc): ComponentType;
}

declare class BaseBoundary {
    /** The def that defined this boundary to be included. This also means it contains our last applied props. */
    _outerDef: MixDOMDefApplied;
    /** The _innerDef is the root def for what the boundary renders inside - or passes inside for content boundaries.
     * - Note that the _innerDef is only null when the boundary renders null. For content boundaries it's never (they'll be destroyed instead). */
    _innerDef: MixDOMDefApplied | null;
    /** The reference for containing host for many technical things as well as general settings. */
    host: Host;
    /** Whether the boundary is mounted. Starts as false, set to true right before didMount is called and null after willUnmount. */
    isMounted: boolean | null;
    /** The fixed treeNode of the boundary is a very important concept and reference for technical reasons.
     * - It allows to keep the separate portions of the GroundedTree structure together by tying parent and child boundary to each other.
     *   .. So, ultimately it allows us to keep a clear bookkeeping of the dom tree and makes it easy, flexible and performant to apply changes to it.
     * - The node is given by the host boundary (or host for root) and the reference always stays the same (even when mangling stuff around).
     *   1. The first host is the host instance: it creates the root treeNode and its first child, and passes the child for the first boundary.
     *   2. The boundary then simply adds add kids to this treeNode.
     *   3. If the boundary has a sub-boundary in it, it similarly gives it a treeNode to work with.
     *   4. When the boundary re-renders, it will reuse the applied defs and if did for any sub-boundary,
     *      will then reuse the same treeNode and just modify its parent accordingly. So the sub-boundary doesn't even need to know about it.
     */
    treeNode: MixDOMTreeNode;
    /** The sourceBoundary refers to the original SourceBoundary who defined us.
     * - Due to content passing, it's not necessarily our .parentBoundary, who is the one who grounded us to the tree.
     * - For the rootBoundary of a host, there's no .sourceBoundary, but for all nested, there always is.
     * - Note that for source boundarries, the sourceBoundary should never change from what was given in the constructor.
     *   .. It's passed to the source boundary's content closure, and from there further on. Swapping it on the boundary is not supported (see ComponentRemote for swapping it on the closure).
     */
    sourceBoundary: SourceBoundary | null;
    /** The parentBoundary ref is very useful for going quickly up the boundary tree - the opposite of .innerBoundaries. */
    parentBoundary: SourceBoundary | ContentBoundary | null;
    /** Any source or content boundaries inside that we have directly grounded in tree order - updated during every update run (don't use during). */
    innerBoundaries: (SourceBoundary | ContentBoundary)[];
    /** The component instance tied to this boundary - necessarily extends Component. */
    component?: Component;
    constructor(host: Host, outerDef: MixDOMDefApplied, treeNode: MixDOMTreeNode);
}

type MixDOMTreeNodeType = "dom" | "portal" | "boundary" | "pass" | "contexts" | "host" | "root";
interface MixDOMTreeNodeBase {
    /** The main type of the treeNode that defines how it should behave and what it contains.
     * - The type "" is only used temporarily - it shouldn't end up in the grounded treeNodes.
     */
    type: MixDOMTreeNodeType | "";
    /** Normally, only the root has no parent, but all others do.
     * - However, if we are talking about a treeNode that is no longer in the tree (= a dead branch), then the parent is null, or one of the parents in the chain is null even though it's not a real root node.
     */
    parent: MixDOMTreeNode | null;
    /** The treeNodes inside - for navigation. */
    children: MixDOMTreeNode[];
    /** Every treeNode has a domNode reference. It refers to the NEAREST DOM ELEMENT DOWNWARDS from this treeNode.
     * - So if this treeNode is of "dom" type, it's actually its own node.
     * - But boundaries and other abstractions do not have their own dom node.
     * - Instead, it's updated UPWARDS (until meets a dom tag parent) from an actual treeNode with dom element upon create / remove / move.
     *      * The reason for this weirdness is bookkeeping performance logic (see HostRender.findInsertionNodes).
     *      * We do minimal bookkeeping for a very quick way to find where any node should be.*/
    domNode: DOMElement | Node | null;
    /** The boundary that produced this tree node - might be passed through content closures. */
    sourceBoundary: SourceBoundary | null;
    /** If refers to a boundary - either a custom class / function or then a content passing boundary. */
    boundary?: MixDOMBoundary | null;
    /** The applied def tied to this particular treeNode. */
    def?: MixDOMDefApplied;
}
interface MixDOMTreeNodeBaseWithDef extends MixDOMTreeNodeBase {
    def: MixDOMDefApplied;
}
interface MixDOMTreeNodeEmpty extends MixDOMTreeNodeBase {
    type: "";
}
interface MixDOMTreeNodeRoot extends MixDOMTreeNodeBase {
    type: "root";
    def?: never;
}
interface MixDOMTreeNodeDOM extends MixDOMTreeNodeBaseWithDef {
    type: "dom";
    /** This exists only for treeNodes referring to dom elements (typeof appliedDef.tag === "string").
     * To avoid ever missing diffs, it's best to hold a memory for the props that were actually applied to a dom element.
     * Note. Like React, we do not want to read the state of the dom element due to 2 reasons:
     *   1. Reading from dom element is relatively slow (in comparison to reading property of an object).
     *   2. It's actually better for outside purposes that we only take care of our own changes to dom - not forcing things there (except create / destroy our own). */
    domProps: MixDOMProcessedDOMProps;
}
interface MixDOMTreeNodePortal extends MixDOMTreeNodeBaseWithDef {
    type: "portal";
    /** For portals, the domNode refers to the external container. */
    domNode: MixDOMTreeNodeBase["domNode"];
}
interface MixDOMTreeNodeBoundary extends MixDOMTreeNodeBaseWithDef {
    type: "boundary";
    /** This will be set to the treeNode right after instancing the source boundary. */
    boundary: SourceBoundary;
}
interface MixDOMTreeNodePass extends MixDOMTreeNodeBaseWithDef {
    type: "pass";
    /** This will be set to the treeNode right after instancing the content boundary.
     * - It's null only if there's no content, otherwise there's a content boundary.
     */
    boundary: ContentBoundary | null;
}
interface MixDOMTreeNodeHost extends MixDOMTreeNodeBaseWithDef {
    type: "host";
}
type MixDOMTreeNode = MixDOMTreeNodeEmpty | MixDOMTreeNodeDOM | MixDOMTreeNodePortal | MixDOMTreeNodeBoundary | MixDOMTreeNodePass | MixDOMTreeNodeHost | MixDOMTreeNodeRoot;

type RefDOMSignals<Type extends Node = Node> = {
    /** Called when a ref is about to be attached to a dom element. */
    domDidAttach: (domNode: Type) => void;
    /** Called when a ref is about to be detached from a dom element. */
    domWillDetach: (domNode: Type) => void;
    /** Called when a reffed dom element has been mounted: rendered into the dom for the first time. */
    domDidMount: (domNode: Type) => void;
    /** Called when a reffed dom element updates (not on the mount run). */
    domDidUpdate: (domNode: Type, diffs: DOMDiffProps) => void;
    /** Called when the html content of a dom element has changed. */
    domDidContent: (domNode: Type, simpleContent: MixDOMContentSimple | null) => void;
    /** Called when a reffed dom element has been moved in the tree. */
    domDidMove: (domNode: Type, fromContainer: Node | null, fromNextSibling: Node | null) => void;
    /** Return true to salvage the element: won't be removed from dom.
     * This is only useful for fade out animations, when the parenting elements also stay in the dom (and respective children). */
    domWillUnmount: (domNode: Type) => boolean | void;
};
type RefComponentSignals<Type extends ComponentTypeEither = ComponentTypeEither, Instance extends ComponentInstance<Type> = ComponentInstance<Type>> = {
    /** Called when a ref is about to be attached to a component. */
    didAttach: (component: Type) => void;
    /** Called when a ref is about to be detached from a component. */
    willDetach: (component: Type | ContentBoundary) => void;
} & ([Instance] extends [Component] ? ComponentExternalSignalsFrom<ReadComponentInfo<Instance>> : {});
type RefSignals<Type extends Node | ComponentTypeEither = Node | ComponentTypeEither> = [Type] extends [Node] ? RefDOMSignals<Type> : [Type] extends [ComponentTypeEither] ? RefComponentSignals<Type> : RefDOMSignals<Type & Node> & RefComponentSignals<Type & ComponentTypeEither>;
interface RefBase {
    signals: Partial<Record<string, SignalListener[]>>;
    treeNodes: Set<MixDOMTreeNode>;
    getTreeNode(): MixDOMTreeNode | null;
    getTreeNodes(): MixDOMTreeNode[];
    getElement(onlyForDOMRefs?: boolean): Node | null;
    getElements(onlyForDOMRefs?: boolean): Node[];
    getComponent(): Component | null;
    getComponents(): Component[];
}
interface RefType<Type extends Node | ComponentTypeEither = Node | ComponentTypeEither> extends SignalBoyType<RefSignals<Type>> {
    new (): Ref<Type>;
    MIX_DOM_CLASS: string;
    /** Internal call tracker. */
    onListener(instance: RefBase & SignalBoy<RefSignals<Type>>, name: string, index: number, wasAdded: boolean): void;
    /** Internal flow helper to call after attaching the ref. Static to keep the class clean. */
    didAttachOn(ref: RefBase, treeNode: MixDOMTreeNode): void;
    /** Internal flow helper to call right before detaching the ref. Static to keep the class clean. */
    willDetachFrom(ref: RefBase, treeNode: MixDOMTreeNode): void;
}
/** Class to help keep track of components or DOM elements in the state based tree. */
declare class Ref<Type extends Node | ComponentTypeEither = Node | ComponentTypeEither> extends SignalBoy<RefSignals<Type>> {
    static MIX_DOM_CLASS: string;
    /** The collection (for clarity) of tree nodes where is attached to.
     * It's not needed internally but might be useful for custom needs. */
    treeNodes: Set<MixDOMTreeNode>;
    constructor(...args: any[]);
    /** This returns the last reffed treeNode, or null if none.
     * - The MixDOMTreeNode is a descriptive object attached to a location in the grounded tree. Any tree node can be targeted by refs.
     * - The method works as if the behaviour was to always override with the last one.
     * - Except that if the last one is removed, falls back to earlier existing. */
    getTreeNode(): MixDOMTreeNode | null;
    /** This returns all the currently reffed tree nodes (in the order added). */
    getTreeNodes(): MixDOMTreeNode[];
    /** This returns the last reffed domNode, or null if none.
     * - The method works as if the behaviour was to always override with the last one.
     * - Except that if the last one is removed, falls back to earlier existing. */
    getElement(onlyForDOMRefs?: boolean): [Type] extends [Node] ? Type | null : Node | null;
    /** This returns all the currently reffed dom nodes (in the order added). */
    getElements(onlyForDOMRefs?: boolean): [Type] extends [Node] ? Type[] : Node[];
    /** This returns the last reffed component, or null if none.
     * - The method works as if the behaviour was to always override with the last one.
     * - Except that if the last one is removed, falls back to earlier existing. */
    getComponent(): [Type] extends [Node] ? Component | null : [Type] extends [ComponentTypeEither] ? ComponentInstance<Type> : Component | null;
    /** This returns all the currently reffed components (in the order added). */
    getComponents(): [Type] extends [Node] ? Component[] : [Type] extends [ComponentTypeEither] ? ComponentInstance<Type>[] : Component[];
    /** The onListener callback is required by Ref's functionality for connecting signals to components fluently. */
    static onListener(ref: RefBase & SignalBoy<RefSignals>, name: string & keyof RefSignals, index: number, wasAdded: boolean): void;
    /** Internal flow helper to call after attaching the ref. Static to keep the class clean. */
    static didAttachOn(ref: RefBase, treeNode: MixDOMTreeNode): void;
    /** Internal flow helper to call right before detaching the ref. Static to keep the class clean. */
    static willDetachFrom(ref: RefBase, treeNode: MixDOMTreeNode): void;
}

/** Describes what kind of def it is.
 * - Compared to treeNode.type, we have extra: "content" | "element" | "fragment". But don't have "root" (or ""). */
type MixDOMDefType = "dom" | "content" | "element" | "portal" | "boundary" | "pass" | "contexts" | "fragment" | "host";
type MixDOMSpreadLinks = {
    /** This contains any true and copy passes. It's the point where the inner spread stopped processing, and the parent spread can continue from it. */
    passes: MixDOMDefTarget[];
    /** This contains any MixDOM.WithContent components, if they were not sure whether they actually have content or not (due to only having "pass" defs without any solid stuff).
     * - The structure is [ childDefs, withDef ], where childDefs are the children originally passed to the spread.
     */
    withs: [childDefs: MixDOMDefTarget[], withDef: MixDOMDefTarget & {
        props: {
            hasContent?: boolean;
        };
    }][];
};
interface MixDOMDefBase<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> {
    /** This is to distinguish from other objects as well as to define the type both in the same.
     * - That's why it's name so strangely (to distinguish from objects), but still somewhat sensibly to be readible.
     * - In earlier quick tests, it seemed (almost 2x) faster to use { _isDef: true} as opposed to creating a new class instance (without _isDef member). */
    MIX_DOM_DEF: MixDOMDefType;
    tag: any;
    childDefs: MixDOMDefApplied[] | MixDOMDefTarget[];
    /** The def should be skipped - used internally.
     * - Currently only used for type "content" for settings.noRenderValuesMode and "fragment" for withContent() and spread usage. */
    disabled?: boolean;
    key?: any;
    attachedRefs?: RefBase[];
    attachedSignals?: Partial<Record<string, SignalListener[0]>>;
    attachedContexts?: Partial<Record<string, Context | null>>;
    props?: Props;
    isArray?: boolean;
    scopeType?: "spread" | "spread-pass" | "spread-copy";
    scopeMap?: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>;
    spreadLinks?: MixDOMSpreadLinks;
    domContent?: MixDOMContentSimple | null;
    domHTMLMode?: boolean;
    domElement?: HTMLElement | SVGElement | null;
    domCloneMode?: MixDOMCloneNodeBehaviour | "" | null;
    domPortal?: Node | null;
    contentPass?: ContentClosure | null;
    contentPassType?: "pass" | "copy";
    getRemote?: () => ComponentRemote;
    host?: Host;
    hasPassWithin?: true;
    treeNode?: MixDOMTreeNode;
}
interface MixDOMDefDOM<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "dom";
    tag: DOMTags;
    props: Props;
    attachedRefs?: RefBase[];
}
interface MixDOMDefContent<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase {
    MIX_DOM_DEF: "content";
    tag: "" | DOMTags;
    domContent: MixDOMContentSimple;
    /** If true, sets the content as innerHTML, and can use Props. */
    domHTMLMode?: boolean;
    props?: Props;
}
interface MixDOMDefElement<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "element";
    tag: "_";
    props: Props;
    domElement: HTMLElement | SVGElement | null;
    domCloneMode?: MixDOMCloneNodeBehaviour | "" | null;
}
interface MixDOMDefPortal<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "portal";
    tag: null;
    domPortal: Node | null;
    props?: never;
}
interface MixDOMDefBoundary<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "boundary";
    tag: MixDOMComponentTags;
    props: Props;
    /** Internal marker put on the applied def to mark that was passed in a content pass.
     * - This helps to form a parental chain of closures that pass the content down.
     * - This in turn helps to make WithContent feature work recursively.
     * - Note that alternatively this could be after-checked in contentClosure.preRefresh.
     *      * However, it's more performant to just go check for this while pairing defs.
     */
    hasPassWithin?: true;
}
interface MixDOMDefFragment extends MixDOMDefBase {
    MIX_DOM_DEF: "fragment";
    tag: null;
    isArray?: boolean;
    scopeType?: MixDOMDefBase["scopeType"];
    /** This helps to optimize nested spread processing, as well as handle WithContent recursively for spreads. */
    spreadLinks?: MixDOMDefBase["spreadLinks"];
    /** Scope map is used only on the applied def side.
     * - This is used to isolate the scopes for the pairing process.
     * - For example, any spread function outputs, and any content pass copies in them, should be isolated.
     * - This means, that when the root of the isolation is paired with a new target, the inner pairing will use this scope only - and nothing else can use it.
     */
    scopeMap?: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>;
}
interface MixDOMDefPass extends MixDOMDefBase {
    MIX_DOM_DEF: "pass";
    tag: null;
    contentPass?: ContentClosure | null;
    contentPassType?: "pass" | "copy";
    /** If is about a remote source, this is assigned and gets the remote source instance. */
    getRemote?: () => ComponentRemote;
    props?: never;
}
interface MixDOMDefHost extends MixDOMDefBase {
    MIX_DOM_DEF: "host";
    tag: null;
    host: Host;
    props?: never;
}
type MixDOMDefTypesAll = MixDOMDefDOM | MixDOMDefContent | MixDOMDefElement | MixDOMDefPortal | MixDOMDefBoundary | MixDOMDefPass | MixDOMDefFragment | MixDOMDefHost;
interface MixDOMDefAppliedBase extends MixDOMDefBase {
    childDefs: MixDOMDefApplied[];
    action: "mounted" | "moved" | "updated";
    treeNode?: MixDOMTreeNode;
    /** Used internally for special case detections.
     * - Only applied when is performing a _wide move_ - to the mover and all defs inside. The updateId value {} comes from hostServices and is renewed on every update cycle
     * - The updateId is used in a case where moves contents out of a content pass while destroying an intermediary boundary (that holds the pass) simultaneously.
     *      * If had already paired some defs (impying they were moved out by the sourceBoundary), then shouldn't clean up those defs.
     *      * The detection is done by: `def.updateId && def.updateId === def.treeNode?.sourceBoundary?.host.services._whileUpdating`.
     *      * The updateId is cleaned away from the def on next pairing - to avoid cluttering old info (it's just confusing and serves no purpose as information).
     */
    updateId?: {};
}
interface MixDOMDefTargetBase extends MixDOMDefBase {
    childDefs: MixDOMDefTarget[];
    treeNode?: never;
    action?: never;
}
type MixDOMDefApplied = MixDOMDefAppliedBase & MixDOMDefTypesAll;
type MixDOMDefTarget = MixDOMDefTargetBase & MixDOMDefTypesAll;

type MixDOMDoubleRenderer<Props extends Record<string, any> = {}, State extends Record<string, any> = {}> = (props: Props, state: State) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;
type MixDOMBoundary = SourceBoundary | ContentBoundary;
type MixDOMSourceBoundaryId = string;
/** Any known MixDOM component related tags, from spread funcs to component ctx funcs to component classes and pseudo elements. */
type MixDOMComponentTags = ComponentType<any> | ComponentFuncAny<ComponentInfoAny> | MixDOMPseudoTags<Record<string, any>>;
type MixDOMTags = "" | "_" | DOMTags;
type MixDOMAnyTags = MixDOMComponentTags | MixDOMTags | null;
/** This tag conversion is used for internal tag based def mapping. The MixDOMDefTarget is the MixDOM.ContentPass.
 * The number type refers to the values of searchByTag in routinesPairing. */
type MixDOMDefKeyTag = MixDOMAnyTags | MixDOMDefTarget | typeof PseudoFragment | Host | number;
type MixDOMAssimilateItem = {
    tag: DOMTags;
    node: Element | SVGElement | Node;
    parent: MixDOMAssimilateItem | null;
    children?: MixDOMAssimilateItem[];
    key?: any;
    /** Can be used externally to exclude. */
    used?: boolean;
};
/** Should return true like value to accept, false like to not accept. */
type MixDOMAssimilateValidator = (item: MixDOMAssimilateItem | null, treeNode: MixDOMTreeNodeDOM, tag: DOMTags | "_" | "", key: any) => any;
/** Should return a Node or MixDOMAssimilateItem to suggest, or null otherwise. */
type MixDOMAssimilateSuggester = (item: MixDOMAssimilateItem | null, treeNode: MixDOMTreeNodeDOM, tag: DOMTags | "_" | "", key: any) => Node | MixDOMAssimilateItem | null;
/** Used for reassimilation (and as a basis for remounting). */
interface MixDOMReassimilateInfo {
    /** The virtual item root.*/
    vRoot?: MixDOMAssimilateItem;
    /** Helper for virtualization. */
    vKeyedByTags?: Partial<Record<DOMTags, MixDOMAssimilateItem[]>>;
    /** Used for exclusion purposes. */
    reused?: Set<Node>;
    /** External validator (always optional). */
    validator?: MixDOMAssimilateValidator | null;
    /** External suggester (always optional). */
    suggester?: MixDOMAssimilateSuggester | null;
}
/** Used for the remount feature. */
interface MixDOMRemountInfo extends MixDOMReassimilateInfo {
    /** Whether should read the attributes and/or text content from DOM before updating.
     * - If false, then will leave any existing attributes and content in place.
     * - If "attributes" (or true) ends up removing any old attributes (by first pre-reading the situation from the DOM element).
     * - If "content" (or true) re-reads the text content from text nodes. Technically, reapplies the text content for them and removes any unused text nodes.
     * - If true, then functions like "attributes" and "content" together.
     */
    readFromDOM?: boolean | "attributes" | "content";
    /** Whether should remove unused DOM elements. Note that any elements that were "loosely" matched to be inside a HTML def (that would use innerHTML) won't be affected - only the ones that were truely non-matched. */
    removeUnused?: boolean;
    /** Will be updated by HostRenderer. Collects all newly created nodes. */
    created?: Set<Node>;
    /** Will be updated by HostRenderer. Collects all unused nodes. */
    unused?: Set<Node>;
}
/** Basis for the pre processed props. */
interface MixDOMInternalBaseProps {
    /** Disable the def altogether - including all contents inside. (Technically makes the def amount to null.)
     * - Note that "_disable" is a special prop only available _outside_ - for components, it's not actually part of its props.
     */
    _disable?: boolean;
    /** Attach key for moving the def around.
     * - Note that "_key" is a special prop only available _outside_ - for components, it's not actually part of its props.
     */
    _key?: any;
}
/** All the 5 internal special props for components with typing: `{ _key, _disable, _ref, _signals, _contexts }`.
 * - As of v4.1, the main rule of thumb is consistency and clarity.
 *      * The JSX basis only contains `_key` and `_disable`, and thus only directly supports SpreadFuncs.
 *      * For components, should use ComponentProps for the initProps (1st arg) or the 1st constructor arg for classes.
 *      * For DOM, gets them by intrinsic tag based attributes.
 * - Accordingly, when uses ComponentProps gets the all the 5 special props: (`_disable`, `_key`, `_ref`, `_signals`, `_contexts`).
 *      * This is for clarity and consistency. It's more confusing to just get the 2 or 3 props that require typing and leave 2 or 3 others out.
 *      * It's also for better support for manually typed component funcs - eg. when uses generic props.
 * - For spreads can also specifically get the 2 (`_key` and `_disable`) with SpreadFuncProps. (The DOM types have 4: no `_contexts`.)
 */
interface MixDOMInternalCompProps<Signals extends SignalsRecord = {}> extends MixDOMInternalBaseProps {
    /** Disable the def altogether - including all contents inside. (Technically makes the def amount to null.)
     * - Note that "_disable" is a special prop only available _outside_ the component - it's not actually part of props.
     */
    _disable?: boolean;
    /** Attach key for moving the def around.
     * - Note that "_key" is a special prop only available _outside_ the component - it's not actually part of props.
     */
    _key?: any;
    /** Attach one or many refs. (Not available for SpreadFuncs.)
     * - Note that "_ref" is a special prop only available _outside_ the component - it's not actually part of props.
     */
    _ref?: Ref<ComponentTypeEither<any>> | Ref<ComponentTypeEither<any>>[];
    /** Attach signals to a child component directly through props. (Not available for SpreadFuncs.)
     * - Note that "_signals" is a special prop only available _outside_ the component - it's not actually part of props.
     */
    _signals?: Partial<ComponentSignals & Signals> | null;
    /** Attach named contexts on a child component. Any changes call component.contextAPI.setContext() accordingly. (Not available for SpreadFuncs.)
     * - Note that "_contexts" is a special prop only available _outside_ the component - it's not actually part of props.
     */
    _contexts?: Partial<Record<string, Context | null>> | null;
}
/** This combines all the 4 internal DOM related special props together: "_key", "_ref", "_disable" and "_signals" with its DOM specific listeners. */
interface MixDOMInternalDOMProps extends MixDOMInternalBaseProps {
    /** Disable the DOM node altogether - including all contents inside. (Technically makes the def amount to null.) */
    _disable?: boolean;
    /** Attach key for moving the DOM node around. */
    _key?: any;
    /** Attach one or many refs to keep track of the DOM nodes.
     * - Note that "_ref" is a special prop that will not be applied as an attribute, but instead it implements the Ref feature.
     */
    _ref?: Ref<Node> | Ref<Node>[];
    /** The common DOM signals are the same as with Refs: "domDidAttach", "domWillDetach", "domDidMount", "domDidUpdate", "domDidContent", "domDidMove" and "domWillUnmount".
     * - Note that "_signals" is a special prop that will not be applied as an attribute, but instead it implements the direct signal listening feature.
     */
    _signals?: Partial<RefDOMSignals> | null;
}
/** The spelling modes available for DOM attributes. Default is "mixedCase". Used in MixDOMPreProps, MixDOMProps, PseudoElementProps and GetPropsFor type helpers (and related JS methods for deffing). */
type MixDOMCase = "native" | "camelCase" | "mixedCase";
/** Contains tag based DOM attributes including internal DOM props (_key, _ref, _disabled, _signals).
 * - The DOM attributes contain the common attributes (class, className, style, data, ...) and any specific for the given DOM tag.
 * - To define the "native" vs. "camelCase" spelling for DOM attributes, define the 2nd argument. Defaults to "mixedCase", so allows both.
 */
type MixDOMPreProps<Tag extends string = any, DOMCase extends MixDOMCase = "mixedCase"> = MixDOMInternalDOMProps & MixDOMProps<Tag, DOMCase>;
/** Contains tag based DOM attributes _without_ the internal DOM props (_key, _ref, _disabled, _signals).
 * - This is the same as DOMAttributes from the "dom-types" library, but can define DOMCase as the 2nd type arg: "native" | "camelCase" | "mixedCase". Defaults to "mixedCase".
 */
type MixDOMProps<Tag extends string = any, DOMCase extends MixDOMCase = "mixedCase"> = DOMCase extends "camelCase" ? [DOMTags] extends [Tag] ? DOMAttributesAny_camelCase : DOMAttributes_camelCase<Tag> : DOMCase extends "native" ? [DOMTags] extends [Tag] ? DOMAttributesAny_native : DOMAttributes_native<Tag> : [
    DOMTags
] extends [Tag] ? DOMAttributesAny_camelCase & DOMAttributesAny_native : DOMAttributes_camelCase<Tag> & DOMAttributes_native<Tag>;
/** Post props don't contain key, ref. In addition className and class have been merged, and style processed to a dictionary.
 * - For DOM related, the type is equal to DOMCleanTypes { className, style, data, listeners, attributes }, whereas for others, it's simply Record<string, any>.
 * - So, for DOM related, the rest of the props are found in { attributes }, while for non-DOM related the props are directly there.
 */
type MixDOMProcessedDOMProps = DOMCleanProps;
type MixDOMContentNull = null | undefined;
type MixDOMContentSimple = string | number | Node;
type MixDOMRenderOutputSingle = MixDOMDefTarget | MixDOMContentSimple | Host | MixDOMContentNull;
interface MixDOMRenderOutputMulti extends Array<MixDOMRenderOutputSingle | MixDOMRenderOutputMulti> {
}
type MixDOMRenderOutput = MixDOMRenderOutputSingle | MixDOMRenderOutputMulti;
interface MixDOMComponentUpdates<Props extends Record<string, any> = {}, State = {}> {
    props?: Props;
    state?: State;
    force?: boolean | "all";
}
/** Defines how often components should update for each updatable type: props, state, context.
 * - If type not defined, uses the default value for it.
 * - Note that the pure checks only check those types that have just been changed.
 */
interface MixDOMUpdateCompareModesBy {
    props: CompareDepthMode | number;
    state: CompareDepthMode | number;
}
/** This info is used for executing rendering changes to dom for a given appliedDef (which is modified during the process).
 * - If props is given it modifies the class, style and attributes of the element. This modifies the .domProps in the appliedDef.
 * - If create info is provided, creates a new dom element.
 * - If move info is provided, moves the given element to the new location.
 * - If destroy is provided, removes the element from dom and from appliedDef.domElement.
 */
interface MixDOMRenderInfoBase {
    treeNode: MixDOMTreeNode;
    remove?: boolean;
    create?: boolean;
    move?: boolean;
    emptyMove?: boolean;
    update?: boolean;
    content?: boolean;
    swap?: boolean | Node;
    refresh?: boolean | "read";
}
interface MixDOMRenderInfoBoundary extends MixDOMRenderInfoBase {
    treeNode: MixDOMTreeNodeBoundary | MixDOMTreeNodePass;
    remove?: true;
    create?: false;
    update?: false;
    content?: false;
    move?: false | never;
    swap?: false;
}
interface MixDOMRenderInfoDOMLike extends MixDOMRenderInfoBase {
    treeNode: MixDOMTreeNodeDOM | MixDOMTreeNodePortal;
    swap?: boolean | Node;
    remove?: true;
    create?: true;
    move?: true;
    update?: true;
    content?: true;
}
interface MixDOMRenderInfoHost extends MixDOMRenderInfoBase {
    treeNode: MixDOMTreeNodeHost;
    remove?: boolean;
    create?: boolean;
    move?: boolean;
    update?: false;
    content?: false;
    swap?: false;
}
type MixDOMRenderInfo = MixDOMRenderInfoBoundary | MixDOMRenderInfoDOMLike | MixDOMRenderInfoHost;
/** This only includes the calls that can be made after the fact: onUnmount is called before (so not here). */
type MixDOMSourceBoundaryChangeType = "mounted" | "updated" | "moved";
type MixDOMSourceBoundaryChange = [boundary: SourceBoundary, changeType: MixDOMSourceBoundaryChangeType, prevProps?: Record<string, any>, prevState?: Record<string, any>];
type MixDOMChangeInfos = [renderInfos: MixDOMRenderInfo[], boundaryChanges: MixDOMSourceBoundaryChange[]];

/** Get init props for any MixDOM tag.
 * - Note that the props include the special props (`_disable`, `_key`, `_ref`, `_signals`, `_contexts`) based on tag and typing for them.
 * @param Tag The tag to get the props for. Can be any kind of tag: DOM tags, spread funcs, component funcs & classes, pseudo classes, ... All string tags refer to DOM tags except for "_" which refers to PseudoElement.
 * @param Fallback Provide second argument Fallback in case does not match known types.
 * @param DOMCase Use the optional 3rd arg to define whether DOM attributes typing is in native case or camelCase: eg. "fill-opacity" (native) vs. "fillOpacity" (camelCase).
 */
type GetPropsFor<Tag, Fallback = {}, DOMCase extends "native" | "camelCase" | "mixedCase" = "mixedCase"> = Tag extends string ? Tag extends "_" ? PseudoElementProps<Tag, DOMCase> : MixDOMPreProps<Tag, DOMCase> : Tag extends (...args: any[]) => any ? IsSpreadFunc<Tag> extends true ? SpreadFuncProps & Parameters<Tag>[0] : ComponentProps<ReadComponentInfo<Tag>> : Tag extends MixDOMPseudoTags ? (InstanceType<Tag>["constructor"]["_Info"] & {})["props"] : Tag extends ClassType<Component<any>> ? ComponentProps<ReadComponentInfo<Tag>> : Fallback;
/** Create a rendering definition. Supports receive direct JSX compiled output.
 * - In terms of typing, this method reflects TSX typing for "mixedCase" in regards to DOM elements.
 *      * Use `nativeDef` or `camelCaseDef` methods to explicitly use native or camelCase typing.
 */
declare function newDef<Tag>(...args: Tag extends string ? [domTag: Tag & string, props?: GetPropsFor<Tag> | null, ...contents: MixDOMRenderOutput[]] : {} | undefined extends OmitPartial<GetPropsFor<Tag>> | undefined ? [
    componentTag: Tag,
    props?: GetPropsFor<Tag> | null,
    ...contents: MixDOMRenderOutput[]
] : [
    componentTag: Tag,
    props: GetPropsFor<Tag>,
    ...contents: MixDOMRenderOutput[]
]): MixDOMDefTarget | null;
/** Create a new def from a html string. Returns a def for a single html element
 * - If a wrapInTag given will use it as a container.
 * - Otherwise, if the string refers to multiple, returns an element containing them (with settings.renderHTMLDefTag).
 * - Normally uses a container only as a fallback if has many children.
 * - To define typing for props, use the DOMCase type argument. Defaults to "mixedCase".
 */
declare function newDefHTML<DOMCase extends "native" | "camelCase" | "mixedCase" = "mixedCase">(innerHTML: string, wrapInTag?: DOMTags, props?: MixDOMPreProps<any, DOMCase>, key?: any): MixDOMDefTarget;
declare function newContentCopyDef(key?: any): MixDOMDefTarget;
/** Check recursively from applied or target defs, whether there's actually stuff that amounts to a content.
 * - To handle interpreting content passes, feed the handlePass boolean answer (when used in spreads), or callback (when used non-statically to use parent content closure).
 *      * If not given, defaults to a recursive pass checker - suitably for external usage, eg. reading situation from the grounded tree.
 * - Note that this returns `"maybe"` if handlePass was `true` (or callback and said "maybe") and it was the only one inside.
 * - However if there's anything solid anywhere, will return `true`. Otherwise then `false`, if it's all clear.
 */
declare function hasContentInDefs<Def extends MixDOMDefApplied | MixDOMDefTarget>(childDefs: Array<Def>, handlePass?: ((def: Def) => boolean | "maybe") | boolean | "maybe"): boolean | "maybe";

declare const MixDOMContent: MixDOMDefTarget;
declare const MixDOMContentCopy: MixDOMDefTarget;

/** Shortcut dictionary to contain all the main features of MixDOM library. */
declare const MixDOM: {
    /** Create a new render definition. Can feed JSX input. (It's like `React.createElement` but `MixDOM.def`). */
    def: typeof newDef;
    /** Create a new def from a HTML string. Returns a def for a single HTML element.
     * - If a wrapInTag given will use it as a container.
     * - Otherwise, if the string refers to multiple, returns an element containing them (with settings.renderHTMLDefTag).
     * - Normally uses a container only as a fallback if has many children. */
    defHTML: typeof newDefHTML;
    /** Generic def for passing content.
     * - Use this to include content (~ React's props.children) from the parent component.
     * - Note that in the case of multiple contentPasses the first one in tree order is the real one.
     *   .. If you deliberately want to play with which is the real one and which is a copy, use MixDOM.ContentCopy or MixDOM.copyContent(someKey) for the others. */
    Content: MixDOMDefTarget;
    /** A custom component (func) that can be used for conditional inserting.
     * - For example: `<WithContent><span class="title">{MixDOM.Content}</span></WithContent>`
     *      * Results in `<span class="title">...</span>`, where ... is the actual content passed (by parent).
     *      * However, if there was no actual content to pass (`null` or `undefined`), then results in `null`.
     *      * Note that if the parent passes {MixDOM.Content}, then it is something and will render with the wrapping (so does not work recursively).
     * - Note that if the component ever needs to "handle" the children, or be refreshed when they change, should put the related info as `props`.
     *      * For example, `{ props.children: MixDOMRenderOutput[]; }`. Or even better as: `{ props.items: MyItem[]; }` and then create the defs within from the MyItem info.
     *      * You can then also easily detect if there are any children/items and do conditional rendering accordingly.
     * - Note that prior to v3.1, this feature worked technically differently.
     *      * Now it's implemented in a much simpler way, only drawback being the lack of recursive support, but benefit being that parent won't have to re-render (and ~4kB less minified code).
     */
    WithContent: ComponentType<WithContentInfo>;
    /** A generic shortcut for a content copy.
     * .. We give it a unique key ({}), so that it can be widely moved around.
     * .. In the case you use multiple ContentCopy's, then reuses each widely by tree order. */
    ContentCopy: MixDOMDefTarget;
    /** Use this method to create a copy of the content that is not swappable with the original render content.
     * - This is very rarely useful, but in the case you want to display the passed content multiple times,
     *   this allows to distinguish from the real content pass: `{ MixDOM.Content }` vs. `{ MixDOM.copyContent("some-key") }` */
    copyContent: typeof newContentCopyDef;
    /** Standalone Component class.
     * - Provides the basic features for rendering into the MixDOM system, orchestrator by the containing Host.
     * - Use the `render(props, state)` method to render the contents - the method is called automatically by the flow (calling it manually has no meaning).
     */
    Component: typeof Component;
    /** The main class to orchestrate and start rendering in MixDOM. */
    Host: typeof Host;
    /** Class to help keep track of components or DOM elements in the state based tree. */
    Ref: typeof Ref;
    /** Fragment represent a list of render output instead of stuff under one root.
     * - Usage example: `<MixDOM.Fragment><div/><div/></MixDOM.Fragment>`, or just `<><div/><div/></>`.
     */
    Fragment: typeof PseudoFragment;
    /** Portal allows to insert the content into a foreign dom node.
     * - Usage example: `<MixDOM.Portal container={myDOMElement}><div/></MixDOM.Portal>`
     */
    Portal: typeof PseudoPortal;
    /** Element allows to use an existing dom element as if it was part of the system, so you can modify its props and insert content etc.
     * - Usage example: `<MixDOM.Element element={el} style="background: #ccc"><span>Some content</span></MixDOM.Element>`.
     */
    Element: typeof PseudoElement;
    /** Empty dummy component that accepts any props, but always renders null. */
    Empty: typeof PseudoEmpty;
    /** This is an empty dummy ComponentRemote class:
     * - Its purpose is to make writing render output easier (1. no empty checks, and 2. for typing):
     *     * For example: `const MyRemote = component.state.PopupRemote || MixDOM.EmptyRemote;`
     *     * You can then access the Content and ContentCopy members, and copyContent(key) and withContent(...contents) methods fluently.
     * - However, they will just return null, so won't have any effect on anything.
     *     * Note also that technically speaking this class extends PseudoEmpty.
     *     * And it only adds the 2 public members (Content and ContentCopy) and 2 public methods (copycontent and withContent).
     *     * Due to not actually being a remote, it will never be used as a remote. It's just a straw dog.
     * - If you need to distinguish between real and fake, use `isRemote()` method. The empty returns false.
     */
    EmptyRemote: typeof PseudoEmptyRemote;
    /** Alias for createComponent. Create a functional component. You get the component as the first parameter, and optionally contextAPI as the second if you define 2 args: (component, contextAPI). You can also give a dictionary of static properties to assign (as the 2nd arg to MixDOM.component). */
    component: typeof createComponent;
    /** Create a functional component with ContextAPI. The first initProps is omitted: (component, contextAPI). The contextAPI is instanced regardless of argument count. You can also give a dictionary of static properties to assign (as the 2nd arg to MixDOM.componentCtx). */
    componentCtx: typeof createComponentCtx;
    /** Create a shadow component omitting the first initProps: (component). The contextAPI is if has 2 arguments (component, contextAPI).
     * - Shadow components are normal components, but they have a ShadowAPI attached as component.constructor.api.
     * - This allows the components to be tracked and managed by the parenting scope who creates the unique component class (whose instances are tracked).
    */
    shadow: typeof createShadow;
    /** Create a shadow component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
    shadowCtx: <Info extends Partial<ComponentInfo<{}, {}, {}, {}, {}, any, {}>> = {}>(func: (component: ComponentShadowCtx<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => ComponentFuncReturn<Info>, signals?: Partial<ComponentExternalSignalsFrom<{}, ComponentShadow<{}>, ComponentSignals<{}>>> | null | undefined, ...args: [name?: string | undefined] | [staticProps?: Record<string, any> | null | undefined, name?: string | undefined]) => ComponentShadowFuncWith<Info>;
    /** Create a SpreadFunc - it's actually just a function with 0 or 1 arguments: (props?).
     * - It's the most performant way to render things (no lifecycle, just spread out with its own pairing scope).
     * - Note that this simply gives back the original function, unless it has more than 1 arguments, in which case an intermediary function is created.
     *      * This intermediary function actually supports feeding in more arguments - this works since a func with (props, ...args) actually has length = 1.
     *      * If you want to include the props and extra arguments typing into the resulting function use the MixDOM.spreadWith function instead (it also automatically reads the types).
     */
    spread: <Props extends Record<string, any> = {}>(func: (props: Props, ...args: any[]) => MixDOMRenderOutput) => SpreadFunc<Props>;
    /** Create a SpreadFunc by automatically reading the types for Props and ExtraArgs from the given function. See MixDOM.spread for details.
     * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
     */
    spreadWith: <Props_1 extends Record<string, any>, ExtraArgs extends any[]>(func: (props: Props_1, ...args: ExtraArgs) => MixDOMRenderOutput) => SpreadFuncWith<Props_1, ExtraArgs>;
    /** Create a ComponentRemote class for remote flow (in / out).
     * - For example, `export const MyRemote = MixDOM.remote("MyRemote");`.
     * - And then to feed content in a render method: `<MyRemote>Some content..</MyRemote>`.
     * - Finally insert it somewhere in a render method: `{MyRemote.Content}`.
     */
    remote: <CustomProps extends Record<string, any> = {}>(name?: string) => ComponentRemoteType<CustomProps>;
    /** Creates an intermediary component (function) to help produce extra props to an inner component.
     *      * It receives its parent `props` normally, and then uses its `state` for the final props that will be passed to the inner component (as its `props`).
     * - About arguments:
     *      1. The optional Builder function builds the common external props for all wired instances. These are added to the component's natural props.
     *      2. The optional Mixer function builds unique props for each wired instance. If used, the common props are fed to it and the output of the mixer instead represents the final props to add.
     *      3. The only mandatory argument is the component to be used in rendering, can be a spread func, too. It's the one that receives the mixed props: from the tree flow and from the wiring source by handled by Mixer and Builder functions.
     *      4. Finally you can also define the name of the component (useful for debugging).
     * - Technically this method creates a component function (but could as well be a class extending Component).
     *      - The important thing is that it's a unique component func/class and it has `api` member that is of `WiredAPI` type (extending `ShadowAPI`).
     *      - When the component is instanced, its static class side contains the same `api` which serves as the connecting interface between the driver and all instances.
     *      - This class can then allow to set and refresh the common props, and trigger should-updates for all the instances and use signals.
     *      - The `WiredAPI` extension contains then features related to the automated mixing of parent props and custom data to produce final state -> inner component props.
     * - Note that when creates a stand alone wired component (not through Component component's .createWired method), you should drive the updates manually by .setProps.
     * - Note. To hook up the new wired component (class/func) to the updates of another component use: `component.addWired(Wired)` and remove with `component.removeWired(Wired)`.
     */
    wired: typeof createWired;
    /** Function that on JS side returns the original function back (to create a mixin class) but simply helps with typing.
     * - The idea of a mixin is this: `(Base) => class extends Base { ... }`. So it creates a new class that extends the provided base class.
     *     * In the context of Components the idea is that the Base is Component and then different features are added to it.
     *     * Optionally, when used with mixMixins the flow also supports adding requirements (in addition to that the Base is a Component class).
     * - To use this method: `const MyMixin = MixDOM.mixin<RequiresInfo, MyMixinInfo>(Base => class _MyMixin extends Base { ... }`
     *     * Without the method: `const MyMixin = (Base: GetComponentTypeFrom<RequireInfo>) => class _MyMixin extends (Base as GetComponentTypeFrom<RequireInfo & MyMixinInfo>) { ... }`
     *     * So the trick of this method is simply that the returned function still includes `(Base: Required)`, but _inside_ the func it looks like `(Base: Required & Added)`.
    */
    mixin: typeof createMixin;
    /** Add Component features to a custom class. Provide the BaseClass type specifically as the 2nd type argument.
     * - For examples of how to use mixins, see: [mixin-types README](https://www.npmjs.com/package/mixin-types).
     * - To read typing of the base class use one of the below:
     *      1. Provide it manually using `typeof BaseClass`. For example: `mixinComponent<Info, typeof BaseClass>(BaseClass)`.
     *      2. Use `AsMixin` to auto-read the typing from the BaseClass. For example: `mixinComponent as AsMixin<Component<Info>>(BaseClass)`.
     * - Note that this feature can be used for the concept of Component mixing in the class form.
     *      * However, you can also mix components in the functional form. See more at MixDOM.mixin, MixDOM.mixFuncs and other related methods.
     *
     * ```
     *
     * // - Basic typed example - //
     *
     * // Base class with static type.
     * interface MyBaseType extends ClassType<MyBase> {
     *     SOME_STATIC: boolean;
     * }
     * class MyBase { something: boolean = false; static SOME_STATIC: boolean = false; }
     *
     * // Create some mixed components. (Should define render method, too.)
     * // .. Typing.
     * type MyInfo = { props: { test: boolean; }; };
     * // .. Without base class.
     * const MyComponent = mixinComponent<MyInfo>(Object);
     * class MyComponentClass extends mixinComponent<MyInfo>(Object) {}
     * // .. With typed base class.
     * const MyComponentWith1 = mixinComponent<MyInfo, typeof MyBase>(MyBase);
     * const MyComponentWith2 = mixinComponent<MyInfo, MyBaseType>(MyBase);
     * const MyComponentWith3 = (mixinComponent as AsMixin<Component<MyInfo>>)(MyBase);
     * const MyComponentWith4 = (mixinComponent as ReMixin<ComponentType<MyInfo>>)(MyBase);
     *
     * // Test static typing. (All found as expected.)
     * MyComponent.MIX_DOM_CLASS
     * MyComponentClass.MIX_DOM_CLASS
     * MyComponentWith1.MIX_DOM_CLASS
     * MyComponentWith1.SOME_STATIC
     * MyComponentWith2.MIX_DOM_CLASS
     * MyComponentWith2.SOME_STATIC
     * MyComponentWith3.MIX_DOM_CLASS
     * MyComponentWith3.SOME_STATIC
     * MyComponentWith4.MIX_DOM_CLASS
     * MyComponentWith4.SOME_STATIC
     *
     * // Test props.
     * const Test: SpreadFunc = () =>
     *     <>
     *         <MyComponent test={false} />
     *         <MyComponentClass test={false} />
     *         <MyComponentWith1 test={false} />
     *         <MyComponentWith2 test={false} />
     *         <MyComponentWith3 test={false} />
     *         <MyComponentWith4 test={false} />
     *     </>;
     *
     *
     * // - Advanced typed example - //
     * //
     * // Note. For advanced examples and guidelines, see `mixin-types` documentation:
     * // https://www.npmjs.com/package/mixin-types
     *
     * // To use generics (mixed with custom info).
     * // ..
     * type MyGenInfo = { state: { enabled: boolean; }; props: { more?: boolean; }; };
     * interface MyGenComponentType<Info extends ComponentInfoPartial = {}>
     * 	    extends ComponentType<Info & MyGenInfo> {}
     * interface MyGenComponent<Info extends ComponentInfoPartial = {}>
     * 	    extends Component<Info & MyGenInfo>, MyBase {}
     * class MyGenComponent<Info = {}> extends
     *      (mixinComponent as any as ReMixin<MyGenComponentType<any>>)(MyBase) {
     *
     *      // Can add here things, they'll be auto-typed to MyGenComponent interface.
     * 		myThing?: Info;
     * 		constructor(props: ComponentProps<Info & MyGenInfo>, boundary?: SourceBoundary, ...args: any[]) {
     * 			super(props, boundary, ...args);
     * 			this.state = {
     * 				enabled: false,
     * 			};
     * 		}
     * 		test(): void {
     * 			// Recognized correctly.
     * 			this.something = false;
     * 			this.constructor.MIX_DOM_CLASS;
     * 			// The base class needs some help here.
     * 			(this.constructor as MyGenComponentType & MyBaseType).SOME_STATIC;
     * 		}
     * 		render() {
     * 			return <div>{this.state.enabled ? "yes" : "no"}</div>;
     * 		}
     * 	}
     *
     * // Test static typing. (All found as expected.)
     * MyGenComponent.MIX_DOM_CLASS
     * MyGenComponent.SOME_STATIC
     *
     * // Test interface typing - automated from what's inside the class declaration.
     * type TestMyThing = MyGenComponent<MyInfo>["myThing"]; // MyInfo | undefined
     *
     * // Test props.
     * const TestMore: SpreadFunc = () =>
     *     <>
     *         <MyGenComponent<MyInfo> test={false} more={true} />
     *     </>;
     *
     * ```
     *
     */
    mixinComponent: typeof mixinComponent;
    /** This mixes many component functions together. Each should look like: `(initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer`.
     * - Note that this only "purely" mixes the components together (on the initial render call).
     *      * By default does not put a renderer function in the end but just passes last output (preferring funcs, tho). If you want make sure a renderer is in the end, put last param to true: `(...funcs, true)`
     *      * Compare this with `MixDOM.mixFuncsWith(..., composer)`, that always returns a renderer. (And its last argument is auto-typed based on all previous.)
     * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
     *      * Note that you should only use `ComponentFunc` or `ComponentFuncMixable`. Not supported for spread functions (makes no sense) nor component classes (not supported for this flow, see mixClassFunc instead).
     *      * You should type each function most often with `ComponentFunc<Info>` type or `MixDOM.component<Info>()` method. If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
     * - This also supports handling contextual needs (by a func having 3 args) as well as attaching / merging ShadowAPI | WiredAPI.
     * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
     *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
     *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
     */
    mixFuncs: typeof mixFuncs;
    /** This mixes many component functions together. Each should look like: (initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer.
     * - Unlike MixDOM.mixFuncs, the last argument is a mixable func that should compose all together, and its typing comes from all previous combined.
     *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
     *      * Alternatively you can add them to the 2nd last function with: `SomeMixFunc as ComponentFunc<ReadComponentInfo<typeof SomeMixFunc, ExtraInfo>>`.
     * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
     *      * Note that you should only use ComponentFunc or ComponentFuncMixable. Not supported for spread functions (makes no sense) nor component classes (not supported).
     *      * You should type each function most often with ComponentFunc<Info> or MixDOM.component<Info>(). If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
     * - This also supports handling contextual needs (by a func having 3 args) as well as attaching / merging ShadowAPI | WiredAPI.
     * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
     *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
     *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
     */
    mixFuncsWith: typeof mixFuncsWith;
    /** This mixes together a Component class and one or many functions.
     * - By default, attaches the return of the last function as the renderer (if function type, otherwise an earlier one).
     * - Optionally as the 3rd arg, can provide a boolean to use the class renderer instead. */
    mixClassFuncs: typeof mixClassFuncs;
    /** This mixes together a Component class and one or many functions with a composer function as the last function.
     * - The last function is always used as the renderer and its typing is automatic.
     *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
     */
    mixClassFuncsWith: typeof mixClassFuncsWith;
    /** Mix many mixins together with a custom Component class as the basis to mix on: `(MyClass, MyMixin1, MyMixin2, ...)`.
     * - Note. The last mixin with a render method defined is used as the render method of the combined class.
     * - Note. If you don't want to define a custom component class as the base, you can use the `MixDOM.mixMixins` function instead (which uses the Component class). These two funcs are split to get better typing experience.
     * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
    */
    mixClassMixins: typeof mixClassMixins;
    /** Mix many mixins together into using the basic Component class as the basis to mix on: `(MyMixin1, MyMixin2, ...)`.
     * - Note. The last mixin with a render method defined is used as the render method of the combined class.
     * - Note. If you want to define a custom base class (extending Component) you can use `MixDOM.mixClassMixins` method whose first argument is a base class.
     * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
     */
    mixMixins: typeof mixMixins;
    /** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ..., ComposerMixin)`
     * - Note. The last mixin is assumed to be the one to do the rendering and its type is combined from all the previous + the optional extra info given as the very last argument.
     * - This is like MixDOM.mixFuncsWith but for mixins. On the javascript this function is teh same as MixDOM.mixMixins.
     */
    mixMixinsWith: typeof mixMixinsWith;
    /** This creates a final component for a list of HOCs with a based component: `(Base, HOC1, HOC2, ... )`
     * - Note that conceptually HOCs are not very performant as they create extra intermediary components.
     * - Consider using mixFuncs or mixMixins concepts instead. They are like HOCs merged into one component with a dynamic base.
     */
    mixHOCs: typeof mixHOCs;
    /** Find tree nodes within a treeNode. */
    findTreeNodesIn: (treeNode: MixDOMTreeNode, types?: SetLike<MixDOMTreeNodeType>, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined) => MixDOMTreeNode[];
    /** Get all components within a treeNode. */
    findComponentsIn: <Comp extends ComponentTypeAny<{}> = ComponentTypeAny<{}>>(treeNode: MixDOMTreeNode, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined) => Comp[];
    /** Get all elements within a treeNode. */
    findElementsIn: <T extends Node = Node>(treeNode: MixDOMTreeNode, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined) => T[];
    /** Find the first matching element within a treeNode using a selector. */
    queryElementIn: <T_1 extends Element = Element>(treeNode: MixDOMTreeNode, selector: string, inNested?: boolean, overHosts?: boolean) => T_1 | null;
    /** Find the matching elements within a treeNode using a selector. */
    queryElementsIn: <T_2 extends Element = Element>(treeNode: MixDOMTreeNode, selector: string, maxCount?: number, inNested?: boolean, overHosts?: boolean) => T_2[];
    /** Read html content as string from the given treeNode, component or boundary.
     * - Typically used with Host having settings.disableRendering (and settings.renderTimeout = null).
     * @param treeNode An abstract info object: MixDOMTreeNode. Contains all the necessary info and linking and implies tree structure.
     * @param escapeHTML Defaults to false. If set to true escapes the `&`, `<` and `>` characters in text content.
     * @param indent Defaults to -1. If 0 or positive, adds line breaks and tabs to the outputted code.
     * @param onlyClosedTagsFor Define how to deal with closed / open tags per tag name. Defaults to `domSelfClosingTags` (from "dom-types").
     *      - If an array, only uses a single closed tag (`<div />`) for elements with matching tag (if they have no kids), for others forces start and end tags.
     *      - If it's null | undefined, then uses closed tags based on whether has children or not (= only if no children).
     */
    readDOMString: (from: MixDOMTreeNode | Component | MixDOMBoundary, escapeHTML?: boolean, indent?: number, onlyClosedTagsFor?: readonly string[] | string[] | null | undefined) => string;
};

export { Component, ComponentConstructorArgs, ComponentContextAPI, ComponentContextAPIType, ComponentCtx, ComponentCtxFunc, ComponentCtxFuncArgs, ComponentCtxWith, ComponentExternalSignals, ComponentExternalSignalsFrom, ComponentFunc, ComponentFuncAny, ComponentFuncArgs, ComponentFuncMixable, ComponentFuncOf, ComponentFuncRequires, ComponentFuncReturn, ComponentHOC, ComponentHOCBase, ComponentInfo, ComponentInfoAny, ComponentInfoEmpty, ComponentInfoInterpretable, ComponentInfoPartial, ComponentInstance, ComponentMixinType, ComponentOf, ComponentProps, ComponentRemote, ComponentRemoteProps, ComponentRemoteType, ComponentShadow, ComponentShadowAPI, ComponentShadowCtx, ComponentShadowFunc, ComponentShadowFuncWith, ComponentShadowFuncWithout, ComponentShadowSignals, ComponentShadowType, ComponentSignals, ComponentType, ComponentTypeAny, ComponentTypeCtx, ComponentTypeEither, ComponentTypeOf, ComponentTypeWith, ComponentWired, ComponentWiredAPI, ComponentWiredFunc, ComponentWiredType, ComponentWith, ContentPasserProps, ExtendsComponent, ExtendsComponents, GetComponentFrom, GetComponentFuncFrom, GetComponentTypeFrom, GetPropsFor, Host, HostContextAPI, HostContextAPIType, HostSettings, HostSettingsUpdate, HostType, IsSpreadFunc, JSX_camelCase, JSX_mixedCase, JSX_native, MixDOM, MixDOMAnyTags, MixDOMAssimilateItem, MixDOMAssimilateSuggester, MixDOMAssimilateValidator, MixDOMBoundary, MixDOMCloneNodeBehaviour, MixDOMComponentTags, MixDOMComponentUpdates, MixDOMContent, MixDOMContentCopy, MixDOMDefApplied, MixDOMDefTarget, MixDOMDefType, MixDOMDoubleRenderer, MixDOMInternalBaseProps, MixDOMInternalCompProps, MixDOMInternalDOMProps, MixDOMPreProps, MixDOMPrePseudoProps, MixDOMProps, MixDOMPseudoTags, MixDOMRenderOutput, MixDOMRenderTextContentCallback, MixDOMRenderTextTag, MixDOMRenderTextTagCallback, MixDOMTags, MixDOMTreeNode, MixDOMTreeNodeBoundary, MixDOMTreeNodeDOM, MixDOMTreeNodeEmpty, MixDOMTreeNodeHost, MixDOMTreeNodePass, MixDOMTreeNodePortal, MixDOMTreeNodeRoot, MixDOMTreeNodeType, MixDOMUpdateCompareModesBy, MixDOMWithContent, PseudoElement, PseudoElementProps, PseudoEmpty, PseudoEmptyProps, PseudoEmptyRemote, PseudoEmptyRemoteProps, PseudoFragment, PseudoFragmentProps, PseudoPortal, PseudoPortalProps, ReadComponentInfo, ReadComponentInfoFromArgsReturn, ReadComponentInfos, ReadComponentRequiredInfo, Ref, RefBase, RefComponentSignals, RefDOMSignals, RefSignals, RefType, SourceBoundary, SpreadFunc, SpreadFuncProps, SpreadFuncWith, WithContentInfo, createComponent, createComponentCtx, createMixin, createRemote, createShadow, createShadowCtx, createSpread, createSpreadWith, createWired, hasContentInDefs, mergeShadowWiredAPIs, mixClassFuncs, mixClassFuncsWith, mixClassMixins, mixFuncs, mixFuncsWith, mixHOCs, mixMixins, mixMixinsWith, mixinComponent, newDef, newDefHTML };
