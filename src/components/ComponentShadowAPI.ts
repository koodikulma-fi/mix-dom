
// - Imports - //

// Libraries.
import { SignalListener, SignalBoy } from "data-signals";
// Typing.
import { MixDOMUpdateCompareModesBy, OmitPartial } from "../typing";
// Local.
import { ComponentInfo } from "./typesInfo";
import { ComponentContextAPI } from "./ComponentContextAPI";
import { Component, ComponentFunc, ComponentFuncReturn, ComponentType, ComponentTypeEither, createComponent, createComponentCtx } from "./Component";
// Only typing (local).
import { ComponentShadowCtx, ComponentShadowFunc, ComponentShadowFuncWith, ComponentShadowSignals, ComponentShadowType } from "./ComponentShadow";


// - Class - //

/** This allows to access the instanced components as well as to use signal listeners (with component extra param as the first one), and trigger updates. */
export class ComponentShadowAPI<Info extends Partial<ComponentInfo> = {}> extends SignalBoy<ComponentShadowSignals<Info>> {
    
    /** The currently instanced components that use our custom class as their constructor. A new instance is added upon SourceBoundary's reattach process, and removed upon unmount clean up. */
    public components: Set<Component<Info>> = new Set();
    /** Default update modes. Can be overridden by the component's updateModes. */
    public updateModes?: Partial<MixDOMUpdateCompareModesBy>;

    
    // - Methods - //

    /** Call this to trigger an update on the instanced components. */
    public update(update: boolean | "all" = true, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
        for (const component of this.components)
            component.triggerUpdate(update, forceUpdateTimeout, forceRenderTimeout);
    }


    // - Auto pass listeners to components - //

    /** The onListener callback is required by ComponentShadowAPI's functionality for connecting signals to components fluently. */
    public static onListener(compContextAPI: ComponentShadowAPI, name: string, index: number, wasAdded: boolean) {
        // Add our only listener, using the callback as the key.
        if (compContextAPI.components.size && compContextAPI.signals[name]) {
            const listener: SignalListener = compContextAPI.signals[name]![index];
            const callback = listener[0];
            // Add our only listener, using the callback as the key.
            if (wasAdded)
                for (const component of compContextAPI.components)
                    (component as Component).listenTo(name as any, (...args: any[]) => listener[1] ? callback(component, ...args, ...listener[1]) : callback(component, ...args), null, listener[2], callback);
            // Remove our listener, using the callback as the groupId.
            else
                for (const component of compContextAPI.components)
                    component.unlistenTo(name as any, callback);
        }
    }
    
}


// - Create helpers - //

/** Local helper to prepare a Shadow func/class with shadow API, and optional static properties and signals to listen to. */
function prepareShadow(Shadow: ComponentShadowFunc | ComponentShadowFuncWith | ComponentShadowType, signals?: Partial<ComponentShadowSignals> | null, staticProps?: Record<string, any> | null): void {
    // Assign static properties.
    if (staticProps)
        for (const p in staticProps)
            Shadow[p] = staticProps[p];
    // Create shadow API.
    Shadow.api = new ComponentShadowAPI();
    // Attach signals.
    if (signals)
        for (const sName in signals)
            Shadow.api.listenTo(sName as any, signals[sName] as any);
}

/** Create a shadow component omitting the first initProps: (component). The contextAPI is if has 2 arguments (component, contextAPI).
 * - Shadow components are normal components, but they have a ComponentShadowAPI attached as component.constructor.api.
 * - This allows the components to be tracked and managed by the parenting scope who creates the unique component class (whose instances are tracked).
*/
export function createShadow<Info extends Partial<ComponentInfo> = {}>(CompClass: ComponentType<Info>, signals?: Partial<ComponentShadowSignals<Info>> | null, ...args: {} | undefined extends OmitPartial<Info["static"]> | undefined ? [staticProps?: {} | null, name?: string] | [name?: string] : [staticProps: Info["static"], name?: string]): ComponentShadowType<Info>;
export function createShadow<Info extends Partial<ComponentInfo> = {}>(compFunc: ComponentFunc<Info>, signals?: Partial<ComponentShadowSignals<Info>> | null, ...args: {} | undefined extends OmitPartial<Info["static"]> | undefined ? [staticProps?: {} | null, name?: string] | [name?: string] : [staticProps: Info["static"], name?: string]): ComponentShadowFunc<Info>;
export function createShadow<Info extends Partial<ComponentInfo> = {}>(compFunc: ComponentTypeEither<Info>, signals?: Partial<ComponentShadowSignals<Info>> | null, ...args: {} | undefined extends OmitPartial<Info["static"]> | undefined ? [staticProps?: {} | null, name?: string] | [name?: string] : [staticProps: Info["static"], name?: string]): ComponentShadowType<Info> | ComponentShadowFunc<Info>;
export function createShadow<Info extends Partial<ComponentInfo> = {}>(funcOrClass: ComponentTypeEither<Info>, signals?: Partial<ComponentShadowSignals<Info>> | null, ...args: [name?: string] | [staticProps?: Record<string, any> | null, name?: string]): ComponentShadowType<Info> | ComponentShadowFunc<Info> {
    // Parse.
    const staticProps = args[0] && typeof args[0] === "object" ? args[0] : undefined;
    const name = (staticProps ? args[1] as string : args[0] as string) || funcOrClass.name;
    // Exceptionally we also support feeding in a class here. To add support for being a shadow.
    const Shadow = funcOrClass["MIX_DOM_CLASS"] ? { [name]: class extends (funcOrClass as ComponentType) {} }[name] as ComponentShadowType<Info> : createComponent(funcOrClass as any, name) as ComponentShadowFunc<Info>;
    // Attach signals and api.
    prepareShadow(Shadow, signals, staticProps);
    // Return resulting func/class.
    return Shadow;
}

/** Create a shadow component function with ComponentContextAPI omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
export const createShadowCtx = <Info extends Partial<ComponentInfo> = {}>(func: (component: ComponentShadowCtx<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => ComponentFuncReturn<Info>, signals?: Partial<ComponentShadowSignals> | null, ...args: [name?: string] | [staticProps?: Record<string, any> | null, name?: string]): ComponentShadowFuncWith<Info> => {
    // Parse.
    const staticProps = args[0] && typeof args[0] === "object" ? args[0] : undefined;
    // Create.
    const Shadow = createComponentCtx(func, (staticProps ? args[1] as string : args[0] as string) || func.name) as ComponentShadowFuncWith<Info>;
    // Attach signals and api.
    prepareShadow(Shadow, signals, staticProps);
    // Return resulting func.
    return Shadow;
}
