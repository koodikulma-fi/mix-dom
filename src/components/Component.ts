
// - Imports - //

// Library.
import { ClassType, AsMixin } from "mixin-types";
import { ContextsAllType, SignalMan, mixinSignalMan, SetLike, NodeJSTimeout } from "data-signals";
// Typing.
import {
    MixDOMDoubleRenderer,
    MixDOMRenderOutput,
    MixDOMUpdateCompareModesBy,
    MixDOMTreeNodeType,
    MixDOMTreeNode,
    MixDOMUpdateCompareMode,
    MixDOMPreComponentOnlyProps,
} from "../typing";
// Routines.
import { domElementByQuery, domElementsByQuery, treeNodesWithin } from "../static/index";
// Boundaries.
import { SourceBoundary } from "../boundaries/index";
// Host.
import { Host } from "../host/index";
// Local typing.
import { ComponentInfo } from "./typesInfo";
import { ComponentSignals } from "./typesSignals";
import { ComponentTypeAny } from "./typesVariants";
// Local class.
import { ComponentContextAPI, ComponentFuncCtx, ComponentCtx } from "./ComponentContextAPI";
// Only typing (local).
import { ComponentWiredFunc, ComponentWiredType } from "./ComponentWired";
import { ComponentShadowAPI } from "./ComponentShadowAPI";


// - Local typing - //

// Internal helpers - not exported.
type ComponentFuncShortcut<Info extends Partial<ComponentInfo> = {}> = (component: Component<Info> & Info["class"]) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>;
type ComponentFuncCtxShortcut<Info extends Partial<ComponentInfo> = {}> = (component: ComponentCtx<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>;


// - Mixin - //

function _ComponentMixin<Info extends Partial<ComponentInfo> = {}, Props extends Record<string, any> = NonNullable<Info["props"]>, State extends Record<string, any> = NonNullable<Info["state"]>>(Base: ClassType) {

    // A bit surprisingly, using this way of typing (combined with the ComponentMixin definition below), everything works perfectly.
    // .. The only caveat is that within here, we don't have the base class available.
    return class _Component extends (mixinSignalMan(Base) as any as ClassType) {


        // - Static side - //

        // // Typing info.
        // /** This is only provided for typing related technical reasons. There's no actual _Info member on the javascript side. */
        // public static _Info?: Info;
        //
        // <-- Note that holding this here wouldn't help in practice. It's because in here we don't actually have the final typed Info.

        public static MIX_DOM_CLASS = "Component";

        // ["constructor"]: ComponentType<Info>;


        // - Members - //

        public readonly boundary: SourceBoundary;
        public readonly props: Props;
        public readonly _lastState?: State;
        public state: State;
        public updateModes: Partial<MixDOMUpdateCompareModesBy>;
        public constantProps?: Partial<Record<keyof Props, MixDOMUpdateCompareMode | number | true>>;
        public timers?: Map<any, number | NodeJSTimeout>;
        public readonly wired?: Set<ComponentWiredType | ComponentWiredFunc>;

        public contextAPI?: ComponentContextAPI<Info["contexts"] & {}>;


        // - Construction - //

        constructor(props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Props, boundary?: SourceBoundary, ...passArgs: any[]) {
            // We are a mixin.
            super(...passArgs);
            // Set from args.
            this.props = props;
            if (boundary) {
                this.boundary = boundary;
                boundary.component = this as any;
            }
        }

        /** This initializes the contextAPI instance (once). */
        public initContextAPI(): void {
            // Already created.
            if (this.contextAPI)
                return;
            // Create new.
            this.contextAPI = new ComponentContextAPI();
            this.contextAPI.host = this.boundary.host;
            // Attach to host for hooking up to its contexts automatically. Will be removed on unmounting.
            this.boundary.host.contextComponents.add(this as any as ComponentCtx);
            // Set initial contexts.
            const _contexts = this.boundary._outerDef.attachedContexts;
            if (_contexts)
                for (const ctxName in _contexts)
                    this.contextAPI.setContext(ctxName as never, _contexts[ctxName] as never, false);
        }


        // - Getters - //

        public isMounted(): boolean {
            return this.boundary.isMounted === true;
        }

        public getLastState(fallbackToCurrent: boolean = true): State | null {
            return this._lastState || fallbackToCurrent && this.state || null;
        }

        public getHost<Contexts extends ContextsAllType = Info["contexts"] & {}>(): Host<Contexts> {
            return this.boundary.host;
        }

        public queryElement(selector: string, withinBoundaries: boolean = false, overHosts: boolean = false): Element | null {
            return domElementByQuery(this.boundary.treeNode, selector, withinBoundaries, overHosts);
        }

        public queryElements(selector: string, maxCount: number = 0, withinBoundaries: boolean = false, overHosts: boolean = false): Element[] {
            return domElementsByQuery(this.boundary.treeNode, selector, maxCount, withinBoundaries, overHosts);
        }

        public findElements(maxCount: number = 0, withinBoundaries: boolean = false, overHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): Node[] {
            return treeNodesWithin(this.boundary.treeNode, new Set(["dom"]), maxCount, withinBoundaries, overHosts, validator).map(tNode => tNode.domNode) as Node[];
        }

        public findComponents<Comp extends ComponentTypeAny = ComponentTypeAny>(maxCount: number = 0, withinBoundaries: boolean = false, overHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): Comp[] {
            return treeNodesWithin(this.boundary.treeNode, new Set(["boundary"]), maxCount, withinBoundaries, overHosts, validator).map(t => (t.boundary && t.boundary.component) as unknown as Comp);
        }

        public findTreeNodes(types?: SetLike<MixDOMTreeNodeType>, maxCount: number = 0, withinBoundaries: boolean = false, overHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[] {
            const okTypes = types ? types.constructor === Set ? types : types.constructor === Array ? new Set(types) : new Set(Object.keys(types)) : undefined;
            return treeNodesWithin(this.boundary.treeNode, okTypes as Set<MixDOMTreeNodeType> | undefined, maxCount, withinBoundaries, overHosts, validator);
        }


        // - Timer service - automatically cleared upon unmounting - //

        public setTimer(timerId: any, callback: () => void, timeout: number): void {
            // New id.
            if (timerId == null)
                timerId = {};
            // Clear old.
            if (!this.timers)
                this.timers = new Map();
            else if (this.timers.has(timerId))
                this.clearTimers(timerId);
            // Assign.
            this.timers.set(timerId, setTimeout(() => {
                this.clearTimers(timerId);
                callback.call(this);
            }, timeout));
            // Return id.
            return timerId;
        }
        public hasTimer(timerId: any): boolean {
            return this.timers ? this.timers.has(timerId) : false;
        }
        public clearTimers(...timerIds: any[]): void {
            // Has none.
            if (!this.timers)
                return;
            // Many.
            if (timerIds.length) {
                for (const timerId of timerIds) {
                    const timer = this.timers.get(timerId);
                    if (timer != null) {
                        clearTimeout(timer as number | undefined);
                        this.timers.delete(timerId);
                    }
                }
            }
            // All.
            else {
                this.timers.forEach(timer => clearTimeout(timer as number | undefined));
                this.timers.clear();
            }
        }


        // - Updating - //

        public setUpdateModes(modes: Partial<MixDOMUpdateCompareModesBy>, extend: boolean = true): void {
            // Reset.
            if (!extend || !this.updateModes)
                this.updateModes = {};
            // Extend.
            for (const type in modes)
                this.updateModes[type] = modes[type];
        }

        public setConstantProps(constProps: Partial<Record<keyof Props, MixDOMUpdateCompareMode | number | true>> | (keyof Props)[] | null, extend: boolean = true, overrideEach: MixDOMUpdateCompareMode | number | null = null): void {
            // Reset or initialize.
            if (!extend || !this.constantProps)
                this.constantProps = {};
            // Extend.
            let didAdd = false;
            if (constProps) {
                // Handle array.
                if (Array.isArray(constProps))
                    for (const prop of constProps)
                        this.constantProps[prop] = ((didAdd = true) && overrideEach) ?? true;
                // Handle dictionary.
                else
                    for (const prop in constProps)
                        this.constantProps[prop] = ((didAdd = true) && overrideEach) ?? constProps[prop];
            }
            // Remove totally.
            if (!didAdd && !extend)
                delete this.constantProps;
        }

        public setState(newState: Pick<State, keyof State> | State, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
            this.boundary.updateBy({ state: { ...this.state, ...newState } as State }, forceUpdate, forceUpdateTimeout, forceRenderTimeout);
        }

        public setInState(property: keyof State, value: any, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
            this.boundary.updateBy({ state: { ...this.state, [property]: value } }, forceUpdate, forceUpdateTimeout, forceRenderTimeout);
        }

        public triggerUpdate(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
            this.boundary.host.services.absorbUpdates(this.boundary, { force: forceUpdate || false }, true, forceUpdateTimeout, forceRenderTimeout);
        }


        // - Wired component - //

        // // Dropped due to circular dependency, and reorganizations/clean ups.
        // public createWired(...args: any[]): ComponentWiredFunc | ComponentWiredType {
        //     const Wired = createWired(...args as Parameters<typeof createWired>);
        //     if (!this.wired)
        //         // We set a readonly value here - it's on purpose: we want it to be readonly for all others except our lines.
        //         (this as { wired: Set<ComponentWiredFunc | ComponentWiredType>; }).wired = new Set([Wired]);
        //     else
        //         this.wired.add(Wired);
        //     return Wired;
        // }

        public addWired(Wired: ComponentWiredFunc | ComponentWiredType): void {
            if (!this.wired)
                // We set a readonly value here - it's on purpose: we want it to be readonly for all others except our lines.
                (this as { wired: Set<ComponentWiredFunc | ComponentWiredType>; }).wired = new Set([Wired]);
            else
                this.wired.add(Wired);
        }

        public removeWired(Wired: ComponentWiredFunc | ComponentWiredType): void {
            // We mutate a readonly value here - it's on purpose: we want it to be readonly for all others except our lines.
            this.wired?.delete(Wired);
        }

        
        // - Extend signal delay handling - //

        // Overridden.
        public afterRefresh(renderSide: boolean = false, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): Promise<void> {
            return this.boundary.host.afterRefresh(renderSide, forceUpdateTimeout, forceRenderTimeout);
        }


        // - Render - //

        public render(_props: Props, _lastState: State): MixDOMRenderOutput | MixDOMDoubleRenderer & MixDOMDoubleRenderer<Props, State> { return null; }

    }
}

/** There are two ways you can use this:
 * 1. Call this to give basic Component features with advanced typing being empty.
 *      * For example: `class MyMix extends ComponentMixin(MyBase) {}`
 * 2. If you want to define Props, State, Signals, Timers and Contexts, use this simple trick instead:
 *      * For example: `class MyMix extends (ComponentMixin as ClassMixer<ComponentType<{ props: MyProps; timers: MyTimers; }>>)(MyBase) {}`
 * - Note that the Info["class"] only works for functional components. In class form, you simply extend the class or mixin with a custom class or mixin.
 */
export const ComponentMixin = _ComponentMixin as unknown as AsMixin<ComponentType>;


// - Class - //

/** Functional type for component fed with ComponentInfo. */
export type ComponentFunc<Info extends Partial<ComponentInfo> = {}> = 
    // ((initProps: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info> & Info["class"]) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & { _Info?: Info; };
    ((initProps: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & { _Info?: Info; };
/** Class type (vs. instance) for component fed with ComponentInfo. */
export interface ComponentType<Info extends Partial<ComponentInfo> = {}> {
    /** Class type. */
    MIX_DOM_CLASS: string; // "Component"
    /** May feature a ComponentShadowAPI, it's put here to make typing easier. */
    api?: ComponentShadowAPI<Info>; // Too deep. Either ["constructor"] or api here.
    // We are a static class, and when instanced output a remote flow source.
    // new (props: Info["props"] & {}, boundary?: SourceBoundary): Component<Info>;
    new (props: Info["props"] & {}, boundary?: SourceBoundary): Component<Info> & Info["class"];

    // Typing info.
    /** This is only provided for typing related technical reasons. There's no actual _Info static member on the javascript side. */
    _Info?: Info;
}
/** Standalone Component class. */
export class Component<Info extends Partial<ComponentInfo> = {}, Props extends Record<string, any> = NonNullable<Info["props"]>, State extends Record<string, any> = NonNullable<Info["state"]>> extends _ComponentMixin(Object) {
    // Type the constructor as property. Needed for our info typing.
    ["constructor"]: ComponentType<Info>; // Let's hold the info on the static side, to keep things clean on the instance.
    // Type the constructor as a method. Needed for TSX.
    constructor(props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Props, boundary?: SourceBoundary, ...passArgs: any[]) { super(props, boundary, ...passArgs); }
}
export interface Component<
    Info extends Partial<ComponentInfo> = {},
    Props extends Record<string, any> = NonNullable<Info["props"]>,
    State extends Record<string, any> = NonNullable<Info["state"]>
> extends SignalMan<ComponentSignals<Info> & Info["signals"]> {

    /** Fresh props from the parent. */
    readonly props: Props;
    /** If the state has changed since last render, this contains the previous state. */
    readonly _lastState?: State;
    /** Locally defined state. When state is updated (through setState or setInState), the component will be checked for updates and then re-render if needed. */
    state: State;
    /** Map of the timers by id, the value is the reference for cancelling the timer. Only appears here if uses timers. */
    timers?: Map<Info["timers"] & {}, number | NodeJSTimeout>;

    /** If any is undefined / null, then uses the default from host.settings. */
    updateModes: Partial<MixDOMUpdateCompareModesBy>;

    /** If constantProps is defined, then its keys defines props that must not change, and values how the comparison is done for each.
     * This affects the def pairing process by disallowing pairing if conditions not met, which in turn results in unmount and remount instead of just updating props (and potentially moving). */
    constantProps?: Partial<Record<keyof Props, MixDOMUpdateCompareMode | number | true>>;
    /** ContextAPI for the component. You can use it to access contextual features. By default inherits the named contexts from the Host, but you can also override them locally. */
    contextAPI?: ComponentContextAPI<Info["contexts"] & {}>;

    // Related class instances.
    /** Ref to the dedicated SourceBoundary - it's technical side of a Component. */
    readonly boundary: SourceBoundary;
    /** Any wired component classes created by us. */
    readonly wired?: Set<ComponentWiredType | ComponentWiredFunc>;

    /** The constructor is typed as ComponentType. */
    ["constructor"]: ComponentType<Info>;


    // - Extend signal delay handling - //

    /** This returns a promise that is resolved after the host's refresh cycle has finished.
     * - By default delays until the "update" cycle (renderSide = false). If renderSide is true, then is resolved after the "render" cycle (after updates).
     */
    afterRefresh(renderSide?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): Promise<void>;


    // - Getters - //

    /** Whether this component has mounted. If false, then has not yet mounted or has been destroyed. */
    isMounted(): boolean;
    /** This gets the state that was used during last render call, and by default falls back to the current state.
     * - Most often you want to deal with the new state (= `this.state`), but this is useful in cases where you want to refer to what has been rendered. 
     * - You can also access the previous state by `this._lastState`. If it's undefined, there hasn't been any changes in the state since last render.
     */
    getLastState(fallbackToCurrent?: true): State;
    getLastState(fallbackToCurrent?: boolean): State | null;
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


    // - Timer service - automatically cleared on unmount - //

    /** Add a new timer with a custom id, or without if null. Returns id. Timers will be automatically cancelled if the component unmounts. You can provide the typing locally to the method. */
    setTimer(timerId: NonNullable<Info["timers"]> | null, callback: () => void, timeout: number): NonNullable<Info["timers"]> | {};
    /** Check whether the current timer id exists. */
    hasTimer(timerId: NonNullable<Info["timers"]>): boolean;
    /** Clear timer(s) by ids. If none given, clears all. */
    clearTimers(...timerIds: NonNullable<Info["timers"]>[]): void;


    // - Updating - //

    // Update settings.
    /** Modify the updateModes member that defines how should compare { props, data, children, remotes } during the update process. */
    setUpdateModes(modes: Partial<MixDOMUpdateCompareModesBy>, extend?: boolean): void;
    /** Modify the constantProps member that defines which props must not change (and how) without a remount. If you set the mode to `true` it means "changed" (= 0 depth).
     * You can also override the mode for each if you just want to use the keys of another dictionary. 
     * By default extends the given constant props, if you want to reset put extend to `false`. If you want to clear, leave the constProps empty (null | [] | {}) as well. */
    setConstantProps(constProps: Partial<Record<keyof Props, MixDOMUpdateCompareMode | number | true>> | (keyof Props)[] | null, extend?: boolean, overrideEach?: MixDOMUpdateCompareMode | number | null): void;

    // State.
    /** Set many properties in the state at once. Can optionally define update related timing. */
    setState<Key extends keyof State>(partialState: Pick<State, Key> | State, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    setState(newState: State, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Set one property in the state with typing support. Can optionally define update related timing. */
    setInState<Key extends keyof State>(property: Key, value: State[Key], forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    
    // Force update.
    /** Trigger an update manually. Normally you never need to use this. Can optionally define update related timing */
    triggerUpdate(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;


    // - Wired component - //

    // /** Creates a wired component (function) and attaches it to the .wired set for automatic updates.
    //  * - The wired component is an intermediary component to help produce extra props to an inner component.
    //  *      * It receives its parent props normally, and then uses its `state` for the final props that will be passed to the inner component (as its `props`).
    //  * - About arguments:
    //  *      1. The optional Builder function builds the common external props for all wired instances. These are added to the component's natural props.
    //  *      2. The optional Mixer function builds unique props for each wired instance. If used, the common props are fed to it and the output of the mixer instead represents the final props to add.
    //  *      3. The only mandatory argument is the component to be used in rendering, can be a spread func, too. It's the one that receives the mixed props: from the tree flow and from the wiring source by handled by Mixer and Builder functions.
    //  *      4. Finally you can also define the name of the component (useful for debugging).
    //  * - Technically this method creates a component function (but could as well be a class extending Component).
    //  *      - The important thing is that it's a unique component func/class and it has `api` member that is of `WiredAPI` type (extending `ComponentShadowAPI`).
    //  *      - When the component is instanced, its static class side contains the same `api` which serves as the connecting interface between the driver and all instances.
    //  *      - This class can then allow to set and refresh the common props, and trigger should-updates for all the instances and use signals.
    //  *      - The `WiredAPI` extension contains then features related to the automated mixing of parent props and custom data to produce final state -> inner component props.
    //  * - Note that when creates a wired component through this method (on a Component component), it's added to the .wired set and automatically triggered for updates whenever this component is checked for should-updates.
    //  */
    // createWired<
    //     ParentProps extends Record<string, any> = {},
    //     BuildProps extends Record<string, any> = {},
    //     MixedProps extends Record<string, any> = ParentProps & BuildProps,
    //     Builder extends (lastProps: BuildProps | null) => BuildProps = (lastProps: BuildProps | null) => BuildProps,
    //     Mixer extends (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps = (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps,
    //     >(mixer: Mixer | BuildProps | null, renderer: ComponentTypeAny<{ props: MixedProps; }>, name?: string): ComponentWiredFunc<ParentProps, BuildProps, MixedProps>;
    // createWired<
    //     ParentProps extends Record<string, any> = {},
    //     BuildProps extends Record<string, any> = {},
    //     MixedProps extends Record<string, any> = ParentProps & BuildProps,
    //     Builder extends (lastProps: BuildProps | null) => BuildProps = (lastProps: BuildProps | null) => BuildProps,
    //     Mixer extends (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps = (parentProps: ParentProps, addedProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps,
    // >(builder: Builder | BuildProps | null, mixer: Mixer | null, renderer: ComponentTypeAny<{ props: MixedProps; }>, name?: string): ComponentWiredFunc<ParentProps, BuildProps, MixedProps>;

    /** Add a wired component to this component's refresh cycle. Create the wired component using the `createWired` method. */
    addWired(Wired: ComponentWiredFunc): void;
    /** Remove a wired component to this component's refresh cycle. */
    removeWired(Wired: ComponentWiredFunc): void;


    // - Render - //

    /** The most important function of any component: the render function. If not using functional rendering, override this manually on the class.
     */
    render(props: Props, state: State): MixDOMRenderOutput | MixDOMDoubleRenderer & MixDOMDoubleRenderer<Props, State>;

}

// - Create component function - //

/** Create a component by func. You get the component as the first parameter (component), while initProps are omitted. */
export function createComponent<Info extends Partial<ComponentInfo> = {}>(func: (component: Component<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>, name?: string): ComponentFunc<Info>;
export function createComponent<Info extends Partial<ComponentInfo> = {}>(func: ComponentFuncShortcut<Info> | ComponentFuncCtxShortcut<Info>, name: string = func.name) {
    // This { [func.name]: someFunc }[func.name] trick allows to reuse the name dynamically. However, its mostly useful for classes, as the functions are named outside (= afterwards).
    return { [name]: 
        func.length > 1 ?
            function (_props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentCtx<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) { return (func as ComponentFuncCtxShortcut<Info>)(component, contextAPI); } as ComponentFuncCtx<Info> :
            function (_props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info>) { return (func as ComponentFuncShortcut<Info>)(component); } as ComponentFunc<Info>
    }[name];
}

/** Create a component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count and component typing includes component.contextAPI. */
export const createComponentCtx = <Info extends Partial<ComponentInfo> = {}>(func: ComponentFuncCtxShortcut<Info>, name: string = func.name): ComponentFuncCtx<Info> =>
    // This { [func.name]: someFunc }[func.name] trick allows to reuse the name dynamically.
    ({ [name]: function (_props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentCtx<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) { return (func as ComponentFuncCtxShortcut<Info>)(component, contextAPI); }})[name] as ComponentFuncCtx<Info>;
