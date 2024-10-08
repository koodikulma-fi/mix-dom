
// - Imports - //

// Library.
import { ClassType, AsClass, ReClass } from "mixin-types";
import { ContextsAllType, SignalMan, mixinSignalMan, SetLike, NodeJSTimeout, SignalManType } from "data-signals";
import { CompareDepthMode } from "data-memo";
// Typing.
import { MixDOMDoubleRenderer, MixDOMRenderOutput, MixDOMUpdateCompareModesBy, MixDOMTreeNodeType, MixDOMTreeNode, MixDOMPreComponentOnlyProps } from "../typing";
// Routines.
import { domElementByQuery, domElementsByQuery, treeNodesWithin } from "../static/index";
// Boundaries.
import { SourceBoundary } from "../boundaries/index";
// Host.
import { Host } from "../host/index";
// Local typing.
import { ComponentInfoPartial } from "./typesInfo";
import { ComponentSignals } from "./typesSignals";
import { ComponentTypeAny } from "./typesVariants";
// Local class.
import { ComponentContextAPI, ComponentFuncCtx, ComponentCtx } from "./ComponentContextAPI";
// Only typing (local).
import { ComponentWiredFunc, ComponentWiredType } from "./ComponentWired";
import { ComponentShadowAPI } from "./ComponentShadowAPI";


// - Local typing - //

// Internal helpers - not exported.
type ComponentFuncShortcut<Info extends ComponentInfoPartial = {}> = (component: Component<Info> & Info["class"]) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>;
type ComponentFuncCtxShortcut<Info extends ComponentInfoPartial = {}> = (component: ComponentCtx<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>;


// - Mixin - //

/** Add Component features to a custom class. Provide the BaseClass type specifically as the 2nd type argument.
 * - For examples of how to use mixins, see: [mixin-types README](https://github.com/koodikulma-fi/mixin-types).
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
 * 		constructor(props: (Info & MyGenInfo)["props"], boundary?: SourceBoundary, ...args: any[]) {
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
export function mixinComponent<Info extends ComponentInfoPartial = {}, BaseClass extends ClassType = ClassType>(Base: BaseClass): AsClass<
    // Static.
    ComponentType<Info> & BaseClass,
    // Instanced.
    Component<Info> & InstanceType<BaseClass>,
    // Constructor args.
    [props: Info["props"] & {}, boundary?: SourceBoundary, ...args: any[]]
> {

    return class Component extends (mixinSignalMan(Base) as ClassType) {


        // - Static side - //

        public static MIX_DOM_CLASS = "Component";


        // - Members - //

        public readonly boundary: SourceBoundary;
        public readonly props: Record<string, any>;
        public readonly lastState?: Record<string, any>;
        public state: Record<string, any>;
        public updateModes: Partial<MixDOMUpdateCompareModesBy>;
        public constantProps?: Partial<Record<string, CompareDepthMode | number | true>>;
        public timers?: Map<any, number | NodeJSTimeout>;
        public readonly wired?: Set<ComponentWiredType | ComponentWiredFunc>;
        public contextAPI?: ComponentContextAPI<Info["contexts"] & {}>;


        // - Construction - //

        constructor(props: Record<string, any>, boundary?: SourceBoundary, ...passArgs: any[]) {
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

        public getLastState(fallbackToCurrent: boolean = true): Record<string, any> | null {
            return this.lastState || fallbackToCurrent && this.state || null;
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

        public setConstantProps(constProps: Partial<Record<string, CompareDepthMode | number | true>> | string[] | null, extend: boolean = true, overrideEach: CompareDepthMode | number | null = null): void {
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

        public setState(newState: Record<string, any>, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
            this.boundary.updateBy({ state: { ...this.state, ...newState } }, forceUpdate, forceUpdateTimeout, forceRenderTimeout);
        }

        public setInState(property: string, value: any, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
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

        public render(_props: Record<string, any>, _lastState: Record<string, any>): MixDOMRenderOutput | MixDOMDoubleRenderer & MixDOMDoubleRenderer { return null; }

    } as any; // We're detached from the return type.
}


// - Class - //

/** Functional type for component fed with ComponentInfo. Defaults to providing contextAPI, but one will only be hooked if actually provides 3 arguments - at least 2 is mandatory (otherwise just a SpreadFunc). */
export type ComponentFunc<Info extends ComponentInfoPartial = {}> = 
    ((initProps: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & { _Info?: Info; };

/** Class type (vs. instance) for component fed with ComponentInfo. */
export interface ComponentType<Info extends ComponentInfoPartial = {}> extends AsClass<
    // Static.
    SignalManType<ComponentSignals<Info> & Info["signals"]>,
    // Instance.
    Component<Info> & Info["class"],
    // Constructor args.
    [props: Info["props"] & {}, boundary?: SourceBoundary, ...args: any[]]>
{
    // Static members.
    /** Class type. */
    MIX_DOM_CLASS: string; // "Component"
    /** May feature a ComponentShadowAPI. It's potential existence is pre-typed here to make typing easier. */
    api?: ComponentShadowAPI<Info>; // Could consider `ComponentShadowAPI<any>` here.

    // Typing info.
    /** This is only provided for typing related technical reasons. There's no actual _Info static member on the JS side. */
    _Info?: Info;
}

/** Standalone Component class.
 * - Provides the basic features for rendering into the MixDOM system, orchestrator by the containing Host.
 * - Use the `render(props, state)` method to render the contents - the method is called automatically by the flow (calling it manually has no meaning).
 */
export class Component<Info extends ComponentInfoPartial = {}> extends
    (mixinComponent(Object) as any as ReClass<ComponentType, {}, [props: Record<string, any>, boundary?: SourceBoundary, ...args: any[]]>) { }
export interface Component<Info extends ComponentInfoPartial = {}> extends SignalMan<ComponentSignals<Info> & Info["signals"]> {

    // Type the constructor as property. Needed for our info typing.
    ["constructor"]: ComponentType<Info>; // Let's hold the info on the static side, to keep things clean on the instance.

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

    // Related class instances.
    /** Ref to the dedicated SourceBoundary - it's technical side of a Component. */
    readonly boundary: SourceBoundary;
    /** Any wired component classes created by us. */
    readonly wired?: Set<ComponentWiredType | ComponentWiredFunc>;


    // - Internal - //

    /** This initializes the contextAPI instance (once). */
    initContextAPI(): void;

        
    // - Extend signal delay handling - //

    /** This returns a promise that is resolved after the host's refresh cycle has finished.
     * - By default delays until the "update" cycle (renderSide = false). If renderSide is true, then is resolved after the "render" cycle (after updates).
     */
    afterRefresh(renderSide?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): Promise<void>;


    // - Getters - //

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
    setConstantProps(constProps: Partial<Record<keyof (Info["props"] & {}), CompareDepthMode | number | true>> | (keyof (Info["props"] & {}))[] | null, extend?: boolean, overrideEach?: CompareDepthMode | number | null): void;

    // State.
    /** Set many properties in the state at once. Can optionally define update related timing. */
    setState<Key extends keyof (Info["state"] & {})>(partialState: Pick<Info["state"] & {}, Key> | Info["state"] & {}, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    setState(newState: Info["state"], forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Set one property in the state with typing support. Can optionally define update related timing. */
    setInState<Key extends keyof (Info["state"] & {})>(property: Key, value: (Info["state"] & {})[Key], forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    
    // Force update.
    /** Trigger an update manually. Normally you never need to use this. Can optionally define update related timing */
    triggerUpdate(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;


    // - Wired component - //
    
    /** Add a wired component to this component's refresh cycle. Create the wired component using the `createWired` method. */
    addWired(Wired: ComponentWiredFunc): void;
    /** Remove a wired component to this component's refresh cycle. */
    removeWired(Wired: ComponentWiredFunc): void;


    // - Render - //

    /** The most important function of any component: the render function. If not using functional rendering, override this manually on the class.
     */
    render(props: Info["props"] & {}, state: Info["state"] & {}): MixDOMRenderOutput | MixDOMDoubleRenderer & MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>;

}

// - Create component function - //

/** Create a component by func. You get the component as the first parameter (component), while initProps are omitted. */
export function createComponent<Info extends ComponentInfoPartial = {}>(func: (component: Component<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>, name?: string): ComponentFunc<Info>;
export function createComponent<Info extends ComponentInfoPartial = {}>(func: ComponentFuncShortcut<Info> | ComponentFuncCtxShortcut<Info>, name: string = func.name) {
    // This { [func.name]: someFunc }[func.name] trick allows to reuse the name dynamically. However, its mostly useful for classes, as the functions are named outside (= afterwards).
    return { [name]: 
        func.length > 1 ?
            function (_props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentCtx<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) { return (func as ComponentFuncCtxShortcut<Info>)(component, contextAPI); } as ComponentFuncCtx<Info> :
            function (_props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info>) { return (func as ComponentFuncShortcut<Info>)(component); } as ComponentFunc<Info>
    }[name];
}

/** Create a component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count and component typing includes component.contextAPI. */
export const createComponentCtx = <Info extends ComponentInfoPartial = {}>(func: ComponentFuncCtxShortcut<Info>, name: string = func.name): ComponentFuncCtx<Info> =>
    // This { [func.name]: someFunc }[func.name] trick allows to reuse the name dynamically.
    ({ [name]: function (_props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentCtx<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) { return (func as ComponentFuncCtxShortcut<Info>)(component, contextAPI); }})[name] as ComponentFuncCtx<Info>;
