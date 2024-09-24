
// - Imports - //

// Libraries.
import { askListeners, callListeners, areEqual, CompareDataDepthEnum, RefreshCycle } from "data-signals";
// Typing.
import {
    MixDOMTreeNode,
    MixDOMSourceBoundaryChange,
    MixDOMRenderInfo,
    MixDOMSourceBoundaryId,
    MixDOMComponentUpdates,
    MixDOMChangeInfos,
    MixDOMDefTarget,
    MixDOMRenderOutput,
    MixDOMUpdateCompareMode,
} from "../typing";
// Routines.
import { newDefFrom, rootDOMTreeNodes } from "../static/index";
// Boundaries (only typing).
import { SourceBoundary } from "../boundaries/index";
// Local.
import { HostRender } from "./HostRender";
import { sortBoundaries, updatedInterestedInClosure } from "./routinesCommon";
import { runBoundaryUpdate } from "./routinesApply";
// Only typing (local).
import { Host } from "./Host";
// Only typing (distant).
import { ComponentTypeAny } from "../components/typesVariants"
import { ComponentFunc } from "../components/Component";
import { ComponentShadowAPI } from "../components/ComponentShadowAPI";
import { ComponentWiredAPI } from "../components/ComponentWiredAPI";


// - HostServices (the technical part) for Host  - //

interface HostUpdateCycleInfo {
    updates: Set<SourceBoundary>;
}
interface HostRenderCycleInfo {
    rCalls: MixDOMSourceBoundaryChange[][];
    rInfos: MixDOMRenderInfo[][];
}

export class HostServices {

    // Relations.
    /** Dedicated render handler class instance. It's public internally, as it has some direct-to-use functionality: like pausing, resuming and hydration. */
    public renderer: HostRender;
    /** Ref up. This whole class could be in host, but for internal clarity the more private and technical side is here. */
    public host: Host;
    public updateCycle: RefreshCycle<HostUpdateCycleInfo>;
    public renderCycle: RefreshCycle<HostRenderCycleInfo>;

    // Bookkeeping.
    /** A simple counter is used to create unique id for each boundary (per host). */
    private bIdCount: number;
    /** This is the target render definition that defines the host's root boundary's render output. */
    private rootDef: MixDOMDefTarget | null;

    // Temporary flags.
    /** Temporary value (only needed for .onlyRunInContainer setting). */
    private _rootDisabled?: true;
    /** Temporary flag to mark while update process is in progress that also serves as an host update cycle id.
     * - The value only exists during updating, and is renewed for each update cycle, and finally synchronously removed.
     * - Currently, it's only used for special cases related to content passing and simultaneous destruction of intermediary source boundaries.
     *      * The case is where simultaneously destroys an intermediary boundary and envelope. Then shouldn't run the destruction for the defs that were moved out.
     *      * Can test by checking whether def.updateId exists and compare it against _whileUpdating. If matches, already paired -> don't destroy.
     *      * The matching _whileUpdating id is put on the def that was _widely moved_ and all that were inside, and can then be detected for in clean up / (through treeNode's sourceBoundary's host).
     *      * The updateId is cleaned away from defs upon next pairing - to avoid cluttering old info (it's just confusing and serves no purpose as information).
     */
    public _whileUpdating?: {};

    constructor(host: Host) {
        this.host = host;
        this.bIdCount = 0;
        this.renderer = new HostRender(host.settings, host.groundedTree); // Should be constructed after assigning settings and groundedTree.
        this.updateCycle = new RefreshCycle<HostUpdateCycleInfo>(() => ({ updates: new Set() }));
        this.renderCycle = new RefreshCycle<HostRenderCycleInfo>(() => ({ rCalls: [], rInfos: [] }));
        (this.constructor as typeof HostServices).initializeCyclesFor(this);
    }

    
    // - Id & timers - //

    /** This creates a new boundary id in the form of "h-hostId:b-bId", where hostId and bId are strings from the id counters. For example: "h-1:b:5"  */
    public createBoundaryId(): MixDOMSourceBoundaryId {
        return "h-" + this.host.constructor.idCount.toString() + ":b-" + (this.bIdCount++).toString();
    }

    public clearTimers(forgetPending: boolean = false): void {
        // Unless we are destroying the whole thing, it's best to (update and) render the post changes into dom.
        if (!forgetPending) {
            this.updateCycle.resolve();
            this.renderCycle.resolve();
        }
        // Make sure are cleared.
        this.updateCycle.reject();
        this.renderCycle.reject();
    }


    // - Host root boundary helpers - //

    public createRoot(content: MixDOMRenderOutput): ComponentTypeAny {
        // Update root def.
        this.rootDef = newDefFrom(content);
        // Create a root boundary that will render our targetDef or null if disabled.
        return ((_props, _component) => () => this._rootDisabled ? null : this.rootDef) as ComponentFunc;
    }

    public updateRoot(content: MixDOMRenderOutput, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
        // Create a def for the root class with given props and contents.
        // .. We have a class, so we know won't be empty.
        this.rootDef = newDefFrom(content);
        // Restart.
        this.host.rootBoundary.update(true, forceUpdateTimeout, forceRenderTimeout);
    }

    public refreshRoot(forceUpdate: boolean = false, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
        // Update state.
        const wasEnabled = !this._rootDisabled;
        const host = this.host;
        const shouldRun = !(host.settings.onlyRunInContainer && !host.groundedTree.domNode && !host.groundedTree.parent);
        shouldRun ? delete this._rootDisabled : this._rootDisabled = true;
        // Force update: create / destroy.
        if (forceUpdate || !shouldRun || !wasEnabled)
            host.rootBoundary.update(true, forceUpdateTimeout, forceRenderTimeout);
        // Do moving.
        else if (shouldRun && wasEnabled) {
            // Get its root nodes.
            const rHostInfos = host.rootBoundary ? rootDOMTreeNodes(host.rootBoundary.treeNode, true).map(treeNode => ({ treeNode, move: true }) as MixDOMRenderInfo) : [];
            // Trigger render immediately - and regardless of whether had info (it's needed for a potential hosting host).
            this.absorbChanges(rHostInfos, null, forceRenderTimeout);
        }
    }

    public clearRoot(forgetPending: boolean = false) {
        // Clear timers.
        this.clearTimers(forgetPending);
        // Clear target.
        this.rootDef = null;
    }

    public getRootDef(shallowCopy?: boolean): MixDOMDefTarget | null {
        return this.rootDef && (shallowCopy ? { ...this.rootDef } : this.rootDef);
    }


    // - Refresh helpers - //

    public hasPending(updateSide: boolean = true, postSide: boolean = true): boolean {
        return !!(updateSide && this.updateCycle.state || postSide && this.renderCycle.state);
    }

    public addRefreshCall(callback: () => void, renderSide: boolean = false): void {
        renderSide ? this.renderCycle.promise.then(callback) : this.updateCycle.promise.then(callback);
    }


    // - 1. Update flow - //

    public cancelUpdates(boundary: SourceBoundary): void {
        this.updateCycle.pending.updates?.delete(boundary);
        // this.updateCycle.eject({ updates: [boundary] }); // Alternative.
    }

    /** This is the main method to update a boundary.
     * - It applies the updates to bookkeeping immediately.
     * - The actual update procedure is either timed out or immediate according to settings.
     *   .. It's recommended to use a tiny update timeout (eg. 0ms) to group multiple updates together. */
    public absorbUpdates(boundary: SourceBoundary, updates: MixDOMComponentUpdates, refresh: boolean = true, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
        // Dead.
        if (boundary.isMounted === null)
            return;
        // Mark forced update.
        if (updates.force)
            boundary._forceUpdate = boundary._forceUpdate === "all" ? "all" : updates.force;
        // Mark props. We put them on the outerDef, if used from this flow.
        if (updates.props)
            boundary._outerDef.props = updates.props;
        // Update state.
        if (updates.state) {
            // Mark old state.
            const component = boundary.component;
            if (!component._lastState)
                // Note. We set a readonly property here on purpose.
                (component as { _lastState: Record<string, any> })._lastState = { ...component.state };
            // Set new state.
            component.state = updates.state;
        }
        // Is rendering, re-render immediately, and go no further. No need to update timeout either.
        if (boundary._renderState) {
            boundary._renderState = "re-updated";
            return;
        }
        // Add to collection.
        this.updateCycle.pending.updates.add(boundary);
        // Trigger.
        if (refresh)
            this.triggerRefresh(forceUpdateTimeout, forceRenderTimeout);
    }

    /** This triggers the update cycle. */
    public triggerRefresh(forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
        // Update times.
        this.updateRefreshTimes(forceUpdateTimeout, forceRenderTimeout);
        // Trigger update.
        this.updateCycle.trigger(this.host.settings.updateTimeout, forceUpdateTimeout);
    }

    /** Update times without triggering a refresh. However, if forceUpdateTimeout is null, performs it instantly. */
    public updateRefreshTimes(forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
        // Optionally set custom render timeout.
        // .. Note that if is set to use instant rendering, we won't trigger the instant now, but just mark renderCycle to be infinite.
        // .. We then later (in initializeCyclesFor hookup) check if it had no timeout set, then resolve instantly.
        if (forceRenderTimeout !== undefined)
            this.renderCycle.extend(forceRenderTimeout ?? undefined, false);
        // Trigger update.
        if (forceUpdateTimeout !== undefined)
            this.updateCycle.extend(forceUpdateTimeout, false);
    }

    /** This is the core whole command to update a source boundary including checking if it should update and if has already been updated.
     * - It handles the updates bookkeeping and should update checking and return infos for changes.
     * - It should only be called from a few places: 1. runUpdates flow above, 2. within applyDefPairs for updating nested, 3. HostServices.updatedInterestedInClosure for updating indirectly interested sub boundaries.
     * - If gives bInterested, it's assumed to be be unordered, otherwise give areOrdered = true. */
    public updateBoundary(boundary: SourceBoundary, forceUpdate: boolean | "all" = false, movedNodes?: MixDOMTreeNode[], bInterested?: Set<SourceBoundary> | null): MixDOMChangeInfos | null {

        // Parse.
        let shouldUpdate = !!forceUpdate;
        let forceNested = forceUpdate === "all";
        let renderInfos: MixDOMRenderInfo[] = [];
        let boundaryChanges: MixDOMSourceBoundaryChange[] = [];
        const component = boundary.component;

        // Prepare mount run.
        const mountRun = !boundary.isMounted;
        if (mountRun) {
            // Has been destroyed - shouldn't happen. Stop right here. (Perhaps should update interested, if given..?)
            if (boundary.isMounted === null)
                return null;
            // On mount.
            boundaryChanges.push( [boundary, "mounted"] );
            shouldUpdate = true;
        }

        // Update props.
        const prevProps = boundary._outerDef.props !== component.props ? component.props || {} : undefined;
        if (prevProps)
            (component as any as { props: Record<string, any> }).props = boundary._outerDef.props; // Note. We set a readonly property here.

        // If is a wired component and it received props update, we should now rebuild its state very quickly.
        const shadowAPI = component.constructor.api as ComponentShadowAPI & Partial<ComponentWiredAPI> | undefined;
        if (shadowAPI && (mountRun || prevProps)) {
            // On mount run - make sure build has run once.
            if (mountRun && shadowAPI.onBuildProps && !shadowAPI.builtProps)
                shadowAPI.builtProps = shadowAPI.onBuildProps(null);
            // Set the state by mixed props.
            if (shadowAPI.getMixedProps) {
                // Normal run - mark that state will change.
                if (!mountRun && !component._lastState)
                    // Note. We set a readonly property here.
                    (component as { _lastState: Record<string, any> })._lastState = { ...component.state };
                // Update state.
                component.state = shadowAPI.getMixedProps(component);
            }
        }

        // Call beforeUpdate.
        // .. Note. If the state is modified during the call, it will add to the changes and stop.
        // .. This makes it a perfect place to use memos - however they can also be used during the render call (then will call render again).
        if (!mountRun && component.signals.beforeUpdate)
            callListeners(component.signals.beforeUpdate);
        
        // Clear force update.
        if (boundary._forceUpdate) {
            if (boundary._forceUpdate === "all")
                forceNested = true;
            shouldUpdate = true;
            delete boundary._forceUpdate;
        }

        // Perform update run.
        if (!mountRun) {
            
            // Read and clear state.
            const prevState = component._lastState;
            delete (component as any as { _lastState?: Record<string, any> })._lastState; // Note. We unset a readonly property here.

            // Run unless has already been updated.
            if (shouldUpdate || prevProps || prevState) {
                // Check if should update.
                if (!shouldUpdate) {
                    // Run shouldUpdate check.
                    const preShould: boolean | null = component.signals.shouldUpdate ? askListeners(component.signals.shouldUpdate, [component, prevProps, prevState], ["first-true", "no-false"]) : null;
                    // Run by background system.
                    if (preShould === true || preShould == null && HostServices.shouldUpdateBy(boundary, prevProps, prevState))
                        shouldUpdate = true;
                }
                // Set call mode.
                const wasMoved = boundary._outerDef.action === "moved";
                if (wasMoved)
                    boundaryChanges.push([boundary, "moved"]);
                if (shouldUpdate)
                    boundaryChanges.push([boundary, "updated", prevProps, prevState]);
                // Was moved.
                if (wasMoved) {
                    // For clarity and robustness, we collect the render infos here for move, as we collect the boundary for move here, too.
                    // .. However, to support the flow of applyDefPairs we also support an optional .movedNodes array to prevent doubles.
                    for (const node of rootDOMTreeNodes(boundary.treeNode, true, true)) {
                        if (movedNodes) {
                            if (movedNodes.indexOf(node) !== -1)
                                continue;
                            movedNodes.push(node);
                        }
                        renderInfos.push({ treeNode: node, move: true });
                    }
                }
                // Call preUpdate to provide a snapshot of the situation - regardless of whether actually will update or not.
                if (component.signals.preUpdate)
                    callListeners(component.signals.preUpdate, [prevProps, prevState, shouldUpdate]);
            }
        }

        // Run the update routine.
        if (shouldUpdate) {
            const [rInfos, bUpdates] = runBoundaryUpdate(boundary, forceNested);
            renderInfos = renderInfos.concat(rInfos);
            boundaryChanges = boundaryChanges.concat(bUpdates);
        }
        // Add wired updates.
        // .. So this is when this component's .createWired method was used and auto-bound to the component for updates.
        // .. Note that we do this after having updated, so we have a fresh state.
        if (component.wired) {
            for (const Wired of component.wired) {
                // Build common props.
                if (Wired.api.onBuildProps) {
                    // Build new common props.
                    const propsWere = Wired.api.builtProps;
                    Wired.api.builtProps = Wired.api.onBuildProps(propsWere);
                    // If had callback and it gave back exactly the old props, then we take it to mean, don't go further.
                    if (propsWere === Wired.api.builtProps)
                        continue;
                    // 
                    // <-- Maybe this is a bit confusing feature..? Because if doesn't have the callback will and should flow thru. Well..

                }
                // Update state for each manually.
                if (Wired.api.components.size) {
                    // Prepare.
                    if (!bInterested)
                        bInterested = new Set();
                    // Preset and add each.
                    for (const wired of Wired.api.components) {
                        wired.boundary._outerDef.props = {...wired.boundary._outerDef.props}; // Take a shallow copy to trigger props change.
                        bInterested.add(wired.boundary);
                    }
                }
            }
        }

        // Update interested boundaries.
        // .. Each is a child boundary of ours (sometimes nested deep inside).
        // .. We have them from 2 sources: 1. interested in our content (parent-chain or remote flow), 2. wired components.
        if (bInterested && bInterested.size) {
            const uInfos = updatedInterestedInClosure(bInterested, true);
            renderInfos = renderInfos.concat(uInfos[0]);
            boundaryChanges = boundaryChanges.concat(uInfos[1]);
        }

        // Return infos.
        return (renderInfos[0] || boundaryChanges[0]) ? [ renderInfos, boundaryChanges ] : null;
    }


    // - 2. Post process flow - //

    /** This absorbs infos from the updates done. Infos are for update calls and to know what to render. Triggers calling runRender. */
    public absorbChanges(renderInfos: MixDOMRenderInfo[] | null, boundaryChanges?: MixDOMSourceBoundaryChange[] | null, forceRenderTimeout?: number | null) {
        // Add rendering to post.
        if (renderInfos)
            this.renderCycle.pending.rInfos.push(renderInfos);
        // Add boundary calls.
        if (boundaryChanges) {
            // Immediately.
            if (this.host.settings.useImmediateCalls)
                HostServices.callBoundariesBy(boundaryChanges);
            // After rendering.
            else
                this.renderCycle.pending.rCalls.push(boundaryChanges);
        }
        // Refresh.
        // .. Don't trigger instantly. If set to be instant, just mark as infinite - we'll resolve it instantly _after_ the update cycle.
        this.renderCycle.trigger(this.host.settings.renderTimeout ?? undefined, forceRenderTimeout ?? undefined);
    }


    // - Public static cycle helpers - //

    /** Initialize cycles. */
    public static initializeCyclesFor(services: HostServices): void {
        // Hook up cycle interconnections.
        // .. Do the actual running.
        services.updateCycle.listenTo("onRefresh", (pending, resolvePromise) => (services.constructor as typeof HostServices).runUpdateFor(services, pending, resolvePromise));
        services.renderCycle.listenTo("onRefresh", (pending, resolvePromise) => (services.constructor as typeof HostServices).runRenderFor(services, pending, resolvePromise));
        // .. Make sure "render" is run when "update" finishes.
        services.updateCycle.listenTo("onFinish", () => {
            // Trigger with default timing. (If was already active, won't do anything.)
            services.renderCycle.trigger(services.host.settings.renderTimeout);
            // See here if renderCycle had been set to infinite timeout. If so, resolve instantly.
            if (services.renderCycle.timer === undefined)
                services.renderCycle.resolve();
        });
        // .. Make sure to start "update" when "render" is started.
        services.renderCycle.listenTo("onStart", () => services.updateCycle.trigger(services.host.settings.updateTimeout));
        // .. Make sure "update" is always resolved right before "render".
        services.renderCycle.listenTo("onResolve", () => services.updateCycle.resolve());
    }
    
    /** This method should always be used when executing updates within a host - it's the main orchestrator of updates.
     * To add to post updates use the .absorbUpdates() method above. It triggers calling this with the assigned timeout, so many are handled together.
     */
    public static runUpdateFor(services: HostServices, pending: HostUpdateCycleInfo, resolvePromise: (keepResolving?: boolean) => void): void {

        // Prevent multi-running during.
        if (services._whileUpdating)
            return;

        // Update again immediately, if new ones collected. We'll reassign pending variable below.
        while (pending.updates.size) {
            
            // Renew id and marker.
            services._whileUpdating = {};

            // Collect output.
            let renderInfos: MixDOMRenderInfo[] = [];
            let bChanges: MixDOMSourceBoundaryChange[] = [];

            // Run update for each.
            // .. Do smart sorting here if has at least 2 boundaries.
            for (const boundary of (pending.updates.size > 1 ? sortBoundaries(pending.updates) : [...pending.updates])) {
                const updates = services.updateBoundary(boundary);
                if (updates) {
                    renderInfos = renderInfos.concat(updates[0]);
                    bChanges = bChanges.concat(updates[1]);
                }
            }

            // Add infos to render cycle.
            if (renderInfos[0])
                services.renderCycle.pending.rInfos.push(renderInfos);
            if (bChanges[0]) {
                if (services.host.settings.useImmediateCalls)
                    HostServices.callBoundariesBy(bChanges);
                else
                    services.renderCycle.pending.rCalls.push(bChanges);
            }

            // Reassign pending (for another loop).
            pending = services.updateCycle.resetPending();
        }

        // Finished.
        delete services._whileUpdating;

        // Call listeners - we just do it automatically by having resolvePromise be auto-called after.
        // resolvePromise();
    }

    public static runRenderFor(services: HostServices, pending: HostRenderCycleInfo, resolvePromise: (keepResolving?: boolean) => void): void {
        // Render infos.
        if (pending.rInfos)
            for (const renderInfos of pending.rInfos)
                if (renderInfos[0])
                    services.renderer.applyToDOM(renderInfos);
        // Boundary changes.
        if (pending.rCalls)
            for (const boundaryChanges of pending.rCalls)
                if (boundaryChanges[0])
                    HostServices.callBoundariesBy(boundaryChanges);
        // Call listeners - we just do it automatically by having resolvePromise be auto-called after.
        // resolvePromise();
    }


    // - Other static helpers - //

    public static shouldUpdateBy(boundary: SourceBoundary, prevProps: Record<string, any> | undefined, prevState: Record<string, any> | undefined): boolean {
        // Prepare.
        const component = boundary.component;
        const settingsUpdateModes = boundary.host.settings.updateComponentModes;
        const shadowUpdateModes = component.constructor.api?.updateModes;
        const types: Array<"props" | "state"> = prevProps && prevState ? [ "props", "state" ] : prevProps ? ["props"] : prevState ? ["state"] : [];
        // Loop changed.
        for (const type of types) {
            // Prepare.
            const mode: MixDOMUpdateCompareMode | number = (component.updateModes && component.updateModes[type]) ?? (shadowUpdateModes && shadowUpdateModes[type]) ?? settingsUpdateModes[type];
            const nMode = typeof mode === "number" ? mode : CompareDataDepthEnum[mode] as number || 0;
            // Always or never.
            if (nMode < -1) {
                if (nMode === -2)
                    return true;
                continue;
            }
            // Changed. We know there's change, because we're looping the type - see above.
            if (nMode === 0)
                return true;
            // Otherwise use the library method.
            if (!areEqual(type === "state" ? prevState : prevProps, component[type], nMode))
                return true;
        }
        // No reason to update.
        return false;
    }

    public static callBoundariesBy(boundaryChanges: MixDOMSourceBoundaryChange[]) {
        // Loop each.
        for (const info of boundaryChanges) {
            // Parse.
            const [ boundary, change, prevProps, prevState ] = info;
            const component = boundary.component;
            const signalName: "didUpdate" | "didMount" | "didMove" = change === "mounted" ? "didMount" : change === "moved" ? "didMove" : "didUpdate";
            // Call the component. Pre-check here some common cases to not need to call.
            if (component.signals[signalName])
                callListeners(component.signals[signalName], change === "updated" ? [prevProps, prevState] : undefined);
        }
    }
    
}
