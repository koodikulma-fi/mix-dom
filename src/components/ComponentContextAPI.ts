
// - Import - //

// Libraries.
import { ContextsAllType, ContextsAllTypeWith, ContextAPI, RecordableType, Context } from "data-signals";
// Typing.
import { MixDOMDoubleRenderer, MixDOMPreComponentOnlyProps, MixDOMRenderOutput } from "../typing";
// Host.
import { Host } from "../host/index";
// Only typing (local).
import { ComponentInfo } from "./typesInfo";
import { Component } from "./Component";


// - Component with ContextAPI - //

/** Type for Component class instance with ContextAPI. Also includes the signals that ContextAPI brings. */
export interface ComponentCtx<Info extends Partial<ComponentInfo> = {}> extends Component<Info> {
    contextAPI: ComponentContextAPI<Info["contexts"] & {}>;
}
/** Type for Component class type with ContextAPI. Also includes the signals that ContextAPI brings. */
export type ComponentTypeCtx<Info extends Partial<ComponentInfo> = {}> = Component<Info> & Info["class"];

/** Type for Component function with ContextAPI. Also includes the signals that ContextAPI brings. */
export type ComponentFuncCtx<Info extends Partial<ComponentInfo> = {}> =
    ((initProps: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentCtx<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & { _Info?: Info; };


// - ComponentContextAPI class - //

export interface ComponentContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {
    /** The Host that this ContextAPI is related to (through the component). Should be set manually after construction.
     * - It's used for two purposes: 1. Inheriting contexts, 2. syncing to the host refresh (with the afterRefresh method).
     * - It's assigned as a member to write ComponentContextAPI as a clean class.
     */
    host: Host<Contexts>;
    /** Get the named context for the component.
     * - Note that for the ComponentContextAPI, its local bookkeeping will be used primarily. If a key is found there it's returned (even if `null`).
     * - Only if the local bookkeeping gave `undefined` will the inherited contexts from the host be used, unless includeInherited is set to `false` (defaults to `true`).
     */
    getContext<Name extends keyof Contexts & string>(name: Name, includeInherited?: boolean): Contexts[Name] | null | undefined;
    /** Get the contexts for the component, optionally only for given names.
     * - Note that for the ComponentContextAPI, its local bookkeeping will be used primarily. If a key is found there it's returned (even if `null`).
     * - Only if the local bookkeeping gave `undefined` will the inherited contexts from the host be used, unless includeInherited is set to `false` (defaults to `true`).
     */
    getContexts<Name extends keyof Contexts & string>(onlyNames?: RecordableType<Name> | null, includeInherited?: boolean): Partial<Record<string, Context | null>> & Partial<ContextsAllTypeWith<Contexts>>;
    /** This triggers a refresh and returns a promise that is resolved when the Component's Host's update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately. 
     * - This uses the signals system, so the listener is called among other listeners depending on the adding order. */
    afterRefresh(fullDelay?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void>;
}
/** Component's ContextAPI allows to communicate with named contexts using their signals and data systems. */
export class ComponentContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {
    host: Host<Contexts>;
    public getContext<Name extends keyof Contexts & string>(name: Name, includeInherited: boolean = true): Contexts[Name] | null | undefined {
        return this.contexts[name] !== undefined ? this.contexts[name] as Contexts[Name] | null : includeInherited ? this.host.contextAPI.contexts[name] as Contexts[Name] | undefined : undefined;
    }
    public getContexts<Name extends keyof Contexts & string>(onlyNames?: RecordableType<Name> | null, includeInherited?: boolean, skipNulls?: true): Partial<ContextsAllTypeWith<Contexts, never, Name>>;
    public getContexts<Name extends keyof Contexts & string>(onlyNames?: RecordableType<Name> | null, includeInherited?: boolean, skipNulls?: boolean | never): Partial<ContextsAllTypeWith<Contexts, null, Name>>;
    public getContexts<Name extends keyof Contexts & string>(onlyNames?: RecordableType<Name> | null, includeInherited: boolean = true, skipNulls: boolean = false): Partial<Contexts> | Partial<ContextsAllTypeWith<Contexts, null>> {
        return (includeInherited ? { ...this.host.contextAPI.getContexts(onlyNames, skipNulls), ...super.getContexts(onlyNames, skipNulls) } : super.getContexts(onlyNames, skipNulls)) as Partial<Contexts> | Partial<ContextsAllTypeWith<Contexts, null>>;
    }
    public afterRefresh(fullDelay?: boolean | undefined, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void> {
        return this.host.afterRefresh(fullDelay, updateTimeout, renderTimeout);
    }
}
