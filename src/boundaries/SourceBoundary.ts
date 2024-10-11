
// - Imports - //

// Libraries.
import { SignalListener, SignalListenerFlags, callListeners } from "data-signals";
// Routines.
import {
    MixDOMTreeNode,
    MixDOMDefApplied,
    MixDOMComponentUpdates,
    MixDOMRenderOutput,
    MixDOMSourceBoundaryId,
    MixDOMDefBoundary,
} from "../typing";
// Boundaries.
import { BaseBoundary } from "./BaseBoundary";
import { ContentClosure } from "./ContentClosure";
// Only typing (distant).
import { Host } from "../host/Host";
import { Component, ComponentFunc, ComponentType } from "../components/Component";
import { ComponentShadowAPI } from "../components/ComponentShadowAPI";
import { ComponentRemote, ComponentRemoteType } from "../components/ComponentRemote";


// - Class -//

/** This is what "contains" a Component instance.
 * - It's a technical boundary between a Component and its Host's update flow orchestration.
 * - Each component receives its boundary as the 2nd constructor argument: `(props, boundary)`.
 */
export class SourceBoundary extends BaseBoundary {


    // - Redefine - //

    /** Redefine that the outer def is about a boundary. */
    public _outerDef: MixDOMDefApplied & MixDOMDefBoundary;


    // - Private-like temporary states - //

    /** Temporary rendering state indicator. */
    public _renderState?: "active" | "re-updated";
    /** If has marked to be force updated. */
    public _forceUpdate?: boolean | "all";
    /** Temporary id used during update cycle. Needed for special same-scope-multi-update case detections. (Not in def, since its purpose is slightly different there - it's for wide moves.) */
    public _updateId?: {};


    // - Host related - //

    /** Our host based quick id. It's mainly used for sorting, and sometimes to detect whether is content or source boundary, helps in debugging too. */
    public bId: MixDOMSourceBoundaryId;


    // - Type and main features - //

    /** Shortcut for the component. Only one can be set (and typically one is). */
    public component: Component;

    
    // - Boundary, closure & children - //

    /** The content closure tied to this boundary.
     * - It it's the channel through which our parent passes content to us - regardless of the update flow.
     * - When tied to a boundary, the content closure has a reference to it as .thruBoundary. (It can also be used without .thruBoundary, see ComponentRemote.) */
    public closure: ContentClosure;


    // - Init & destroy - //

    constructor(host: Host, outerDef: MixDOMDefApplied & MixDOMDefBoundary, treeNode: MixDOMTreeNode, sourceBoundary?: SourceBoundary) {
        // Init.
        super(host, outerDef, treeNode);
        this.bId = host.services.createBoundaryId();
        this.sourceBoundary = sourceBoundary || null;
        this.closure = new ContentClosure(this, sourceBoundary);
    }

    /** Should actually only be called once. Initializes a Component class and assigns renderer and so on. */
    public reattach(): void {
        // Nullify for a moment. It will be set back below in all cases.
        this.component = null as unknown as Component;
        const props = this._outerDef.props || {};
        // Setup the rendering.
        let tag = this._outerDef.tag;
        if (typeof tag === "function") {
            
            // Prepare.
            const shadowAPI = tag["api"] as ComponentShadowAPI | undefined;
            const renderFunc = tag["MIX_DOM_CLASS"] ? null : this._outerDef.tag as ComponentFunc;
            const withContextAPI = renderFunc && renderFunc.length >= 3 || false;
            
            // Create component.
            const component = this.component = new (renderFunc ? shadowAPI ? { [renderFunc.name]: class extends Component {}}[renderFunc.name] : Component : tag as ComponentType)(props, this) as Component;
            this.component = component;
            if (withContextAPI)
                component.initContextAPI();
            
            // Assign renderFunc.
            if (renderFunc)
                // For the first time, let's wrap the original function - presumably only called once, then gets reassigned.
                component.render = withContextAPI ? (freshProps) => renderFunc.call(component, freshProps, component, component.contextAPI) : (freshProps) => renderFunc.call(component, freshProps, component);

            // Note. In class form, in case uses closure in the constructor, should pass the 2nd arg as well: super(props, boundary).
            // .. This way, it's all handled and ready, and there's no need to add special checks or do some initial "flushing".
            // .. But we provide it here if didn't pass them.
            if (!component.boundary)
                // We set a readonly value here - it's on purpose: it's only set if wasn't set in the constructor (by not being passed to super).
                (component as { boundary: SourceBoundary }).boundary = this;
            
            // Handle ComponentShadowAPI.
            if (shadowAPI) {
                // Make sure is assigned for functional components. If was a class then assumes it was unique class already.
                component.constructor.api = shadowAPI;
                // Add to collection.
                shadowAPI.components.add(component);
                // Add listeners.
                for (const name in shadowAPI.signals) {
                    for (const listener of shadowAPI.signals[name]!) {
                        const [callback, extraArgs, flags ] = listener as [callback: (...args: any[]) => any, extraArgs: any[] | null, flags: SignalListenerFlags, groupId: any | null, origListeners?: SignalListener[] ];
                        component.listenTo(name as any, (...args: any[]) => extraArgs ? callback(component, ...args, ...extraArgs) : callback(component, ...args), null, flags, callback);
                    }
                }
            }
            
            // Handle Remote.
            if (tag["MIX_DOM_CLASS"] === "Remote") {
                // Get remote and assign the remote source to the closure for passing refreshes further.
                this.closure.remote = component as ComponentRemote;
                // Add source - they are always available after being born (until dying).
                (tag as ComponentRemoteType).addSource(component as ComponentRemote);
            }
            
            // Add and call preMount.
            if (component.signals.preMount)
                callListeners(component.signals.preMount);

        }
        // Fallback to empty Component - shouldn't happen.
        else
            this.component = new Component(props, this);
    }


    // - Update & render - //

    public update(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null) {
        this.host.services.absorbUpdates(this, { force: !this.isMounted ? "all" : forceUpdate || false }, true, forceUpdateTimeout, forceRenderTimeout);
    }

    public updateBy(updates: MixDOMComponentUpdates, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null) {
        this.host.services.absorbUpdates(this, { ...updates, force: !this.isMounted ? "all" : forceUpdate || false }, true, forceUpdateTimeout, forceRenderTimeout);
    }

    public render(iRecursion: number = 0): MixDOMRenderOutput {
        // Rendering state.
        const firstTime = this.isMounted === false && !this._renderState;
        if (!iRecursion)
            this._renderState = "active";
        // Render.
        const component = this.component;
        const content = component.render(component.props || {}, component.state);
        const reassign = typeof content === "function";
        // Reassign.
        if (reassign)
            component.render = content;
        // If on the mount run, call the data listeners.
        // .. We do this even in class form, due to the mixing capabilities there might be functional components mixed in, too.
        // .. So will anyway receive the initial call right after the initial render - double renderer or not.
        if (firstTime && component.contextAPI)
            component.contextAPI.callDataBy();
        // Re-render - don't add iRecursion, we got a new render function.
        if (reassign)
            return this.render(iRecursion);
        // Wanted to update during render. Run again and return the new render defs instead.
        if (this._renderState === "re-updated") {
            // Render with iRecursion counting.
            const settings = this.host.settings;
            if (settings.maxReRenders < 0 || iRecursion < settings.maxReRenders) {
                iRecursion++;
                this._renderState = "active";
                return this.render(iRecursion);
            }
            // - DEV-LOG - //
            else {
                if (settings.debugMode) {
                    console.warn("__SourceBoundary.render: Warning: The component tried to render for over " + ((iRecursion + 1).toString()) + " times.",
                        (this._outerDef.tag as ComponentType).MIX_DOM_CLASS ? component.constructor : this._outerDef.tag,
                        component
                    );
                }
            }
        }
        // Finish up.
        delete this._renderState;
        // Return content.
        return content;
    }
}
