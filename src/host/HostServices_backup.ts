
// - Imports - //

// Libraries.
import { askListeners, callListeners, areEqual, CompareDataDepthEnum, updateCallTimer } from "data-signals";
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
import { ComponentRemote } from "../components/ComponentRemote";


// - HostServices (the technical part) for Host  - //

export class HostServices {

    // Relations.
    /** Dedicated render handler class instance. It's public internally, as it has some direct-to-use functionality: like pausing, resuming and hydration. */
    public renderer: HostRender;
    /** Ref up. This whole class could be in host, but for internal clarity the more private and technical side is here. */
    private host: Host;

    // Bookkeeping.
    /** A simple counter is used to create unique id for each boundary (per host). */
    private bIdCount: number;
    /** This is the target render definition that defines the host's root boundary's render output. */
    private rootDef: MixDOMDefTarget | null;

    // Update flow.
    private updateTimer: number | NodeJS.Timeout | null;
    private updatesPending: Set<SourceBoundary>;
    // Render flow: execute render infos and boundary calls (eg. didMount and didUpdate).
    private renderTimer: number | NodeJS.Timeout | null;
    private rCallsPending: MixDOMSourceBoundaryChange[][];
    private rInfosPending: MixDOMRenderInfo[][];

    // Temporary flags.
    /** Temporary value (only needed for .onlyRunInContainer setting). */
    private _rootDisabled?: true;
    /** Temporary forced render timeout. */
    private _renderTimeout?: number | null;
    /** Temporary flag to mark while update process is in progress. */
    private _isUpdating?: boolean;
    /** Temporary internal callbacks that will be called when the update cycle is done. */
    _afterUpdate?: Array<() => void>;
    /** Temporary internal callbacks that will be called after the render cycle is done. */
    _afterRender?: Array<() => void>;

    constructor(host: Host) {
        this.host = host;
        this.renderer = new HostRender(host.settings, host.groundedTree); // Should be constructed after assigning settings and groundedTree.
        this.bIdCount = 0;
        this.updateTimer = null;
        this.renderTimer = null;
        this.updatesPending = new Set();
        this.rInfosPending = [];
        this.rCallsPending = [];
    }

    
    // - Id & timers - //

    /** This creates a new boundary id in the form of "h-hostId:b-bId", where hostId and bId are strings from the id counters. For example: "h-1:b:5"  */
    public createBoundaryId(): MixDOMSourceBoundaryId {
        return "h-" + this.host.constructor.idCount.toString() + ":b-" + (this.bIdCount++).toString();
    }

    public clearTimers(forgetPending: boolean = false): void {
        // Unless we are destroying the whole thing, it's best to (update and) render the post changes into dom.
        if (!forgetPending)
            this.runUpdates(null);
        // Clear update timer.
        if (this.updateTimer != null) {
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
        // Clear render timer.
        if (this.renderTimer != null) {
            clearTimeout(this.renderTimer);
            this.renderTimer = null;
        }
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


    // - Has pending updates or post process - //

    public hasPending(updateSide: boolean = true, postSide: boolean = true): boolean {
        return updateSide && this.updateTimer !== null || postSide && this.renderTimer !== null;
    }


    // - 1. Update flow - //

    public cancelUpdates(boundary: SourceBoundary): void {
        this.updatesPending.delete(boundary);
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
        this.updatesPending.add(boundary);
        // Trigger.
        if (refresh)
            this.triggerUpdates(forceUpdateTimeout, forceRenderTimeout);
    }

    /** This triggers the update cycle. */
    public triggerUpdates(forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null) {
        // Update temporary time out if given a tighter time.
        if (forceRenderTimeout !== undefined) {
            if ((forceRenderTimeout === null) || (this._renderTimeout === undefined) || (this._renderTimeout !== null) && (forceRenderTimeout < this._renderTimeout) )
                this._renderTimeout = forceRenderTimeout;
        }
        // If is updating, just wait.
        if (this._isUpdating)
            return;
        // Refresh.
        this.triggerRefreshFor("update", forceUpdateTimeout);
    }

    /** This method should always be used when executing updates within a host - it's the main orchestrator of updates.
     * To add to post updates use the .absorbUpdates() method above. It triggers calling this with the assigned timeout, so many are handled together. */
    private runUpdates(postTimeout?: number | null) {

        // Set flags.
        this.updateTimer = null;
        this._isUpdating = true;
        // Get render timeout.
        postTimeout = postTimeout !== undefined ? postTimeout : (this._renderTimeout !== undefined ? this._renderTimeout : this.host.settings.renderTimeout);
        delete this._renderTimeout;

        // Update again immediately, if new ones collected.
        while (this.updatesPending.size) {

            // Copy and clear delayed, so can add new during.
            let sortedUpdates = [...this.updatesPending];
            this.updatesPending.clear();

            // Do smart sorting here if has at least 2 boundaries.
            if (sortedUpdates[1])
                sortBoundaries(sortedUpdates);

            // Collect output.
            let renderInfos: MixDOMRenderInfo[] = [];
            let bChanges: MixDOMSourceBoundaryChange[] = [];

            // Run update for each.
            for (const boundary of sortedUpdates) {
                const updates = this.updateBoundary(boundary);
                if (updates) {
                    renderInfos = renderInfos.concat(updates[0]);
                    bChanges = bChanges.concat(updates[1]);
                }
            }

            // Add to post post.
            if (renderInfos[0])
                this.rInfosPending.push(renderInfos);
            if (bChanges[0]) {
                if (this.host.settings.useImmediateCalls)
                    HostServices.callBoundariesBy(bChanges);
                else
                    this.rCallsPending.push(bChanges);
            }

        }

        // Call listeners.
        if (this._afterUpdate)
            this.callAndClear("_afterUpdate");

        // Render.
        this.triggerRefreshFor("render", postTimeout);

        // Finished.
        delete this._isUpdating;
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
        const isRemote = boundary.component.constructor["MIX_DOM_CLASS"] === "Remote";
        if (bInterested && bInterested.size) {
            const uInfos = updatedInterestedInClosure(bInterested, true);
            renderInfos = renderInfos.concat(uInfos[0]);
            boundaryChanges = boundaryChanges.concat(uInfos[1]);
        }

        // Trigger refresh for remote source - presumably the importance has changed if ever is updated (or was just mounted).
        // .. Note that due to the multi-host and micro-timing complexities, this actually doesn't return render infos but rather performs the refresh.
        // .. The infos are fed to each host synchronously using the host's own feed.
        if (isRemote)
            (boundary.component as ComponentRemote).refreshSource();

        // Return infos.
        return (renderInfos[0] || boundaryChanges[0]) ? [ renderInfos, boundaryChanges ] : null;

    }


    // - 2. Post process flow - //

    /** This absorbs infos from the updates done. Infos are for update calls and to know what to render. Triggers calling runRender. */
    public absorbChanges(renderInfos: MixDOMRenderInfo[] | null, boundaryChanges?: MixDOMSourceBoundaryChange[] | null, forceRenderTimeout?: number | null) {
        // Add rendering to post.
        if (renderInfos)
            this.rInfosPending.push(renderInfos);
        // Add boundary calls.
        if (boundaryChanges) {
            // Immediately.
            if (this.host.settings.useImmediateCalls)
                HostServices.callBoundariesBy(boundaryChanges);
            // After rendering.
            else
                this.rCallsPending.push(boundaryChanges);
        }
        // Refresh.
        this.triggerRefreshFor("render", forceRenderTimeout);
    }

    private runRender() {
        // Clear timer ref.
        this.renderTimer = null;
        // Render infos.
        const infos = this.rInfosPending;
        this.rInfosPending = [];
        for (const renderInfos of infos)
            if (renderInfos[0])
                this.renderer.applyToDOM(renderInfos);
        // Boundary changes.
        const calls = this.rCallsPending;
        this.rCallsPending = [];
        for (const boundaryChanges of calls)
            if (boundaryChanges[0])
                HostServices.callBoundariesBy(boundaryChanges);
        // Call listeners.
        if (this._afterRender)
            this.callAndClear("_afterRender");
    }


    // - Helpers - //

    private triggerRefreshFor(side: "update" | "render", forceTimeout?: number | null) {
        if (side === "update")
            this.updateTimer = updateCallTimer(() => this.runUpdates(), this.updateTimer, this.host.settings.updateTimeout, forceTimeout);
        else
            this.renderTimer = updateCallTimer(() => this.runRender(), this.renderTimer, this.host.settings.renderTimeout, forceTimeout);
    }


    // - Static - //

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


    // - Private helpers - //

    /** Get callbacks by a property and delete the member and call each. */
    private callAndClear(property: string) {
        const calls = this[property] as Array<() => void>;
        delete this[property];
        for (const callback of calls)
            callback();
    }

    private static callBoundariesBy(boundaryChanges: MixDOMSourceBoundaryChange[]) {
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
