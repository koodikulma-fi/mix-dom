
// - Import - //

// Libraries.
import { AsClass } from "mixin-types";
import { ContextsAllType, ContextAPI, ContextAPIType } from "data-signals";
// Host.
import { Host } from "../host/index";
// Only typing (local).
import { ComponentInfo } from "./typesInfo";
import { Component, ComponentCtxWith, ComponentFuncReturn, ComponentProps } from "./Component";


// - Component with ContextAPI - //

/** Type for Component class instance with ContextAPI. Also includes the signals that ContextAPI brings. */
export interface ComponentCtx<Info extends Partial<ComponentInfo> = {}> extends Component<Info> {
    /** The ContextAPI instance hooked up to this component. */
    contextAPI: ComponentContextAPI<Info["contexts"] & {}>;
}
/** Type for Component class type with ContextAPI. Also includes the signals that ContextAPI brings. */
export type ComponentTypeCtx<Info extends Partial<ComponentInfo> = {}> = Component<Info> & Info["class"] & { ["constructor"]: Info["static"]; };

/** Type for Component function with ContextAPI. Also includes the signals that ContextAPI brings. */
export type ComponentCtxFunc<Info extends Partial<ComponentInfo> = {}> = ((initProps: ComponentProps<Info>, component: ComponentCtxWith<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => ComponentFuncReturn<Info>) & { _Info?: Info; } & Info["static"];


// - ComponentContextAPI class - //

/** Class type for ComponentContextAPI. */
export interface ComponentContextAPIType<Contexts extends ContextsAllType = {}> extends AsClass<ContextAPIType<Contexts>, ComponentContextAPI<Contexts>, []> { }
export interface ComponentContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {

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
export class ComponentContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {
    host: Host<Contexts>;
    /** At ComponentContextAPI level, full "delay" (renderSide = true) is hooked up to awaiting host's render cycle, while "pre-delay" to the update cycle. */
    public afterRefresh(renderSide: boolean = false, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void> {
        // Trigger and await update cycle.
        if (!renderSide)
            return this.host.afterRefresh(false, updateTimeout, renderTimeout);
        // Trigger update with custom times.
        this.host.triggerRefresh(updateTimeout, renderTimeout);
        return this.awaitDelay();
    }
    /** At ComponentContextAPI level, awaitDelay is hooked up to awaiting host's render cycle. */
    awaitDelay(): Promise<void> {
        return this.host.afterRefresh(true);
    }
}
