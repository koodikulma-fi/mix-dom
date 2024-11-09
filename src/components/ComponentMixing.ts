
// - Imports - //

// Typing.
import type { MixDOMDoubleRenderer, MixDOMRenderOutput } from "../typing";
// Routines.
import { newDef } from "../static/index";
// Common.
import { MixDOMContent, SpreadFunc } from "../common/index";
// Local.
import { Component } from "./Component";
import { ComponentShadowAPI } from "./ComponentShadowAPI";
import { ComponentWiredAPI } from "./ComponentWiredAPI";
// Local (only typing).
import type { ReadComponentInfo, ComponentInfo, ComponentInfoEmpty, ReadComponentInfos, ReadComponentRequiredInfo } from "./typesInfo";
import type { ComponentFunc, ComponentType, ComponentTypeAny, GetComponentTypeFrom } from "./Component";
import type { ComponentContextAPI, ComponentCtx, ComponentCtxFunc } from "./ComponentContextAPI";
import type { ComponentShadowFunc } from "./ComponentShadow";
import type { ComponentWiredFunc } from "./ComponentWired";


// - Extra typing - //

// HOCs.
export type ComponentHOC<RequiredType extends ComponentTypeAny, FinalType extends ComponentTypeAny> = (InnerComp: RequiredType) => FinalType;
export type ComponentHOCBase = (InnerComp: ComponentTypeAny) => ComponentTypeAny;

// Mixins.
export type ComponentMixinType<Info extends Partial<ComponentInfo> = {}, RequiresInfo extends Partial<ComponentInfo> = {}> = (Base: GetComponentTypeFrom<RequiresInfo>) => GetComponentTypeFrom<RequiresInfo & Info>;

// Types for combining and extending Component functions.
export type ComponentFuncRequires<RequiresInfo extends Partial<ComponentInfo> = {}, OwnInfo extends Partial<ComponentInfo> = {}> = ComponentFunc<RequiresInfo & OwnInfo> & { _Required?: ComponentFunc<RequiresInfo>; };
export type ComponentFuncMixable<RequiredFunc extends ComponentFunc = ComponentFunc, OwnInfo extends Partial<ComponentInfo> = {}> = ComponentFunc<ReadComponentInfo<RequiredFunc> & OwnInfo> & { _Required?: RequiredFunc; };

// Extending.
/** Helper to test if the component info from the ExtendingAnything extends the infos from the previous component (BaseAnything) - typically in the mixing chain.
 * - In terms of infos, only compares the infos, does not test against what basic component class instances always have.
 * - Feed in the 3rd arg for RequireForm to require about whether should be a function, or class instance, class type, or whatever. (RequireForm defaults to any.)
 */
export type ExtendsComponent<ExtendingAnything, BaseAnything, RequireForm = any> = [ExtendingAnything] extends [RequireForm] ? ReadComponentInfo<BaseAnything> extends ReadComponentRequiredInfo<ExtendingAnything> ? any : never : never;
/** Helper to test if the component info from the ExtendingAnything extends the merged infos from the previous components (BaseAnythings) - typically in the mixing chain.
 * - In terms of infos, only compares the infos, does not test against what basic component class instances always have.
 * - Feed in the 3rd arg for RequireForm to require about whether should be a function, or class instance, class type, or whatever. (RequireForm defaults to any.)
 */
export type ExtendsComponents<ExtendingAnything, BaseAnythings extends any[], RequireForm = any> = [ExtendingAnything] extends [RequireForm] ? ReadComponentInfos<BaseAnythings> extends ReadComponentRequiredInfo<ExtendingAnything> ? any : never : never;


// - Helper to merge ComponentShadowAPI and ComponentWiredAPIs - //

/** This creates a new ComponentShadowAPI or ComponentWiredAPI and merges updateModes and signals.
 * - If is a ComponentWiredAPI also attaches the last builtProps member, and onBuildProps and onMixProps methods.
 */
export function mergeShadowWiredAPIs(apis: Array<ComponentShadowAPI>): ComponentShadowAPI;
export function mergeShadowWiredAPIs(apis: Array<ComponentWiredAPI>): ComponentWiredAPI;
export function mergeShadowWiredAPIs(apis: Array<ComponentShadowAPI | ComponentWiredAPI>): ComponentShadowAPI | ComponentWiredAPI {
    // Create new API.
    const isWired = apis.some(api => api instanceof ComponentWiredAPI);
    const finalAPI = (isWired ? new ComponentWiredAPI() : new ComponentShadowAPI()) as ComponentWiredAPI; // For easier typing below.
    // Combine infos.
    for (const api of apis) {
        // Merge update modes.
        if (api.updateModes) {
            if (!finalAPI.updateModes)
                finalAPI.updateModes = {};
            for (const type in api.updateModes)
                finalAPI.updateModes[type] = { ...finalAPI.updateModes[type], ...api.updateModes[type] };
        }
        // Combine listeners.
        for (const signalName in api.signals)
            finalAPI.signals[signalName] = [ ...finalAPI.signals[signalName] || [], ...api.signals[signalName]! ];
        // ComponentWiredAPI specials.
        // .. Note that this kind of mixing builtProps, onBuildProps and onMixProps from here and there is kind of messy.
        // .. However, very likely this is never used like this. Furthermore this whole function is also probably almost never used.
        if (api instanceof ComponentWiredAPI) {
            // Use the latest builtProps.
            if (api.builtProps)
                finalAPI.builtProps = api.builtProps;
            // Use the latest callbacks.
            if (api.onBuildProps)
                finalAPI.onBuildProps = api.onBuildProps;
            if (api.onMixProps)
                finalAPI.onMixProps = api.onMixProps;
        }
    }
    // Return the combined API.
    return finalAPI;
}


// - Create mixable funcs & classes - //

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
 * - The extra `useRenderer` argument is mostly meant for internal use. If set to `true`, then makes sure that a renderer function is returned - otherwise simply returns the output of the last in the mix.
 *      * Note. In case of merging multiple mixed sequences together (that have no renderer yet), keep this as `false` (default) for the sub mixes and put it as `true` for the final mix (or specifically define a composer with `mixFuncsWith` method).
 */
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>>(a: A, ...extras: [name?: string, useRenderer?: boolean] | [useRenderer?: boolean]): ComponentFunc<ReadComponentInfo<A>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>>(a: A, b: B, ...extras: [name?: string, useRenderer?: boolean] | [useRenderer?: boolean]): ComponentFunc<ReadComponentInfos<[A, B]>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>>(a: A, b: B, c: C, ...extras: [name?: string, useRenderer?: boolean] | [useRenderer?: boolean]): ComponentFunc<ReadComponentInfos<[A, B, C]>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>>(a: A, b: B, c: C, d: D, ...extras: [name?: string, useRenderer?: boolean] | [useRenderer?: boolean]): ComponentFunc<ReadComponentInfos<[A, B, C, D]>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, ...extras: [name?: string, useRenderer?: boolean] | [useRenderer?: boolean]): ComponentFunc<ReadComponentInfos<[A, B, C, D, E]>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, f: F, ...extras: [name?: string, useRenderer?: boolean] | [useRenderer?: boolean]): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F]>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, ...extras: [name?: string, useRenderer?: boolean] | [useRenderer?: boolean]): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G]>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, ...extras: [name?: string, useRenderer?: boolean] | [useRenderer?: boolean]): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G, H]>>;
export function mixFuncs(...args: [...funcs: ComponentFunc[], name: string | undefined, useRenderer: boolean | undefined] | [...funcs: ComponentFunc[], useRenderer: boolean | undefined] | ComponentFunc[]) {
    // Parse args.
    const funcs = args.filter(f => typeof f === "function") as ComponentFunc[];
    const useCtx = funcs.some(f => f.length > 2);
    const lastArgs = args.slice(funcs.length);
    const useRenderer = lastArgs[0] === true || lastArgs[1] === true;
    const name = typeof lastArgs[0] === "string" && lastArgs[0] || "[mixedFunc" + (useCtx ? "Ctx" : "") + "]";
    // Create named func.
    const CompFunc = {
        [name]: (initProps: Record<string, any>, component: Component | ComponentCtx, cAPI?: ComponentContextAPI) => {
            // Go through each, and collect the last non-null output as the final outcome.
            // .. Prefer any functions, put if not provided use the outcome. (We anyway return a component with a renderer func.)
            let lastOutput: MixDOMDoubleRenderer | MixDOMRenderOutput = null;
            for (const func of funcs as ComponentFunc[]) {
                // Skip empties. In case happens for some reason.
                if (!func)
                    continue;
                // Collect state and meta before.
                const state = component.state;
                // Run the initial closure.
                const output = (func as ComponentCtxFunc)(initProps, component as ComponentCtx, cAPI as ComponentContextAPI);
                // If returned a function (or lastOutput wasn't a func), store the output.
                if (typeof output === "function" || typeof lastOutput !== "function")
                    lastOutput = output;
                // Combine together old and new state and meta. As each can still do component.state = { myStuff } 
                if (state !== component.state && component.state)
                    component.state = { ...(state || {}), ...component.state };
            }
            // Just return the last output. Don't force a renderer here - this is for pure mixing purposes.
            return useRenderer ? () => lastOutput : lastOutput;
        }
    }[name];
    // Create final component function.
    const FinalFunc = useCtx ? (initProps: Record<string, any>, component: ComponentCtx, cAPI: ComponentContextAPI) => CompFunc(initProps, component, cAPI) : (initProps: Record<string, any>, component: Component) => CompFunc(initProps, component);
    // Combine static side.
    const apis: Array<ComponentShadowAPI | ComponentWiredAPI> = [];
    for (const f of funcs) {
        // Other static.
        for (const p in f) {
            // Collect ComponentShadowAPIs.
            if (p === "api")
                apis.push((f as ComponentShadowFunc | ComponentWiredFunc).api);
            // Assign normal static.
            else
                FinalFunc[p] = f[p];
        }
    }
    // Assign shadow api.
    if (apis[0])
        (FinalFunc as ComponentShadowFunc | ComponentWiredFunc).api = mergeShadowWiredAPIs(apis); // If had even one, we should create a new one - as this is a new unique component.
    // Return final func.
    return FinalFunc;
}

/** This mixes many component functions together. Each should look like: (initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer.
 * - Unlike mixFuncs, the last argument is a mixable func that should compose all together, and its typing comes from all previous combined.
 *      * If you want to add extra props to the auto typed composer you can add them as the last argument (extraInfo), for example: `{} as { props: { someStuff: boolean; } }`. Non-funcs are ignored on the JS side - only for typing.
 *      * Alternatively you can add them to the 2nd last function with: `SomeMixFunc as ComponentFunc<ReadComponentInfo<typeof SomeMixFunc, ExtraInfo>>`.
 * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
 *      * Note that you should only use ComponentFunc or ComponentFuncMixable. Not supported for spread functions (makes no sense) nor component classes (not supported).
 *      * You should type each function most often with ComponentFunc<Info> or MixDOM.component<Info>(). If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
 * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
 *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
 *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
 */
// Note. We cannot reuse the Mixed for the return if we want the return to be `Func & { _Info: Info }`;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfo<A, ExtraInfo>>>(a: A, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentFunc<ReadComponentInfo<A, ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B], ExtraInfo>>>(a: A, b: B, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentFunc<ReadComponentInfos<[A, B], ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C], ExtraInfo>>>(a: A, b: B, c: C, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentFunc<ReadComponentInfos<[A, B, C], ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D], ExtraInfo>>>(a: A, b: B, c: C, d: D, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentFunc<ReadComponentInfos<[A, B, C, D], ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentFunc<ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>;
export function mixFuncsWith(...funcs: any[]): ComponentFunc {
    // Pass to mixFuncs with useRenderer set to true, and remove the optional typing object - as it has no meaning on the JS side.
    // .. We purposefully bypass the typing, as we're using a dynamic feed.
    return (mixFuncs as any)(...funcs.filter(f => typeof f === "function" || typeof f === "string"), true);
}


// - Class mixins - //

/** This returns the original function (to create a mixin class) back but simply helps with typing. 
 * - The idea of a mixin is this: `(Base) => class extends Base { ... }`. So it creates a new class that extends the provided base class.
 *     * In the context of Components the idea is that the Base is Component and then different features are added to it.
 *     * Optionally, when used with mixMixins the flow also supports adding requirements (in addition to that the Base is a Component class).
 * - To use this method: `const MyMixin = createMixin<RequiresInfo, MyMixinInfo>(Base => class _MyMixin extends Base { ... }`
 *     * Without the method: `const MyMixin = (Base: GetComponentTypeFrom<RequireInfo>) => class _MyMixin extends (Base as GetComponentTypeFrom<RequireInfo & MyMixinInfo>) { ... }`
 *     * So the trick of this method is simply that the returned function still includes `(Base: Required)`, but _inside_ the func it looks like `(Base: Required & Added)`.
*/
export function createMixin<Info extends Partial<ComponentInfo>, RequiresInfo extends Partial<ComponentInfo> = {}>( func: (Base: GetComponentTypeFrom<RequiresInfo & Info>) => GetComponentTypeFrom<RequiresInfo & Info> ): (Base: GetComponentTypeFrom<RequiresInfo>) => GetComponentTypeFrom<RequiresInfo & Info> { return func as any; }

/** Mix many mixins together using the common Component class as the basis to mix on: `(MyMixin1, MyMixin2, ...)`.
 * - Note. The last mixin with a render method defined is used as the render method of the combined class.
 * - Note. If you want to define a custom base class (extending Component) you can use `mixClassMixins` method whose first argument is a base class.
 *      * Technically mixMixins supports the first argument being a component class (instead of a mixin func to create a class), but it's purposefully left out of typing (use mixClassMixins instead).
 *      * Note that the optional name arg is only used if did not give a custom base clas, as then the class has already been created and already has a name.
 * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
 */
// Using two different funcs for best typing experience and avoiding compiling and circular problems.
// Types for only mixins.
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>>(a: A, name?: string): ComponentType<ReadComponentInfo<A>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>>(a: A, b: B, name?: string): ComponentType<ReadComponentInfos<[A, B]>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>>(a: A, b: B, c: C, name?: string): ComponentType<ReadComponentInfos<[A, B, C]>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>>(a: A, b: B, c: C, d: D, name?: string): ComponentType<ReadComponentInfos<[A, B, C, D]>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, name?: string): ComponentType<ReadComponentInfos<[A, B, C, D, E]>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F, name?: string): ComponentType<ReadComponentInfos<[A, B, C, D, E, F]>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, name?: string): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G]>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, name?: string): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G, H]>>;
// The actual func. Note that its implementation actually supports the first argument being either: a component base class or a mixin.
export function mixMixins(...args: any[]) {
    // Extract the name.
    const nArgs = args.length;
    const CustomBase = nArgs && (args[0] as ComponentType).MIX_DOM_CLASS ? args[0] : null;
    // Create a named base class.
    let name: string;
    let BaseClass: ComponentType = CustomBase || (name = typeof args[nArgs-1] === "string" && args[nArgs-1] || "[mixMixins]") && { [name]: Component }[name];
    // Loop each and extend.
    for (const mixin of (CustomBase ? args.slice(1) : args) as ComponentMixinType[])
        BaseClass = mixin(BaseClass);
    // Return the final class.
    return BaseClass;
}

/** Mix many mixins together into using the common Component class as the basis to mix on: `(MyMixin1, MyMixin2, ..., ComposerMixin)`
 * - In other words, works like the `mixFuncsWith` method but meant for mixable class mixins, instead of mixable component funcs.
 *      * Technically mixMixins supports the first argument being a component class (instead of a mixin func to create a class), but it's purposefully left out of typing (use mixClassMixinsWith instead).
 * - Note. The last mixin is assumed to be the one to do the rendering and its type is combined from all the previous + the optional extra info given as the very last argument.
 * - Note. If you want to define a custom base class (extending Component) you can use `mixClassMixins` method whose first argument is a base class.
 */
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, Info extends ReadComponentInfo<A, ExtraInfo>>(a: A, composer: ComponentMixinType<Info, Info>, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, Info extends ReadComponentInfos<[A, B], ExtraInfo>>(a: A, b: B, composer: ComponentMixinType<Info, Info>, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C], ExtraInfo>>(a: A, b: B, c: C, composer: ComponentMixinType<Info, Info>, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D], ExtraInfo>>(a: A, b: B, c: C, d: D, composer: ComponentMixinType<Info, Info>, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, composer: ComponentMixinType<Info, Info>, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, composer: ComponentMixinType<Info, Info>, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: ComponentMixinType<Info, Info>, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: ComponentMixinType<Info, Info>, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<Info>;
// The actual func. Note that its implementation actually supports the first argument being either: a component base class or a mixin.
export function mixMixinsWith(...args: any[]) {
    // Pass to mixMixins, and remove the optional typing object - as it has no meaning on the JS side.
    // .. Note that the implementation of mixMixins actually supports the first argument being either: a component base class or a mixin.
    // .. Note also that we purposefully bypass the typing, as we're using a dynamic feed.
    return (mixMixins as any)(...args.filter(f => typeof f === "function" || typeof f === "string"));
}

/** Mix many mixins together using a custom Component class as the basis to mix on: `(MyClass, MyMixin1, MyMixin2, ...)`.
 * - Note. The last mixin with a render method defined is used as the render method of the combined class.
 * - Note. If you don't want to define a custom component class as the base, you can use the `mixMixins` function instead (which uses the Component class). These two funcs are split to get better typing experience.
 *      * For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
 * - Note that the name of the final mix comes automatically from the last mixin class in the sequence.
 */
export function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>>(base: Base, a: A): ReturnType<A>;
export function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>>(base: Base, a: A, b: B): ComponentType<ReadComponentInfos<[Base, A, B]>>;
export function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>>(base: Base, a: A, b: B, c: C): ComponentType<ReadComponentInfos<[Base, A, B, C]>>;
export function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>>(base: Base, a: A, b: B, c: C, d: D): ComponentType<ReadComponentInfos<[Base, A, B, C, D]>>;
export function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>>(base: Base, a: A, b: B, c: C, d: D, e: E): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E]>>;
export function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [Base, A, B, C, D, E], ComponentMixinType>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E, F]>>;
export function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [Base, A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [Base, A, B, C, D, E, F], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E, F, G]>>;
export function mixClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [Base, A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [Base, A, B, C, D, E, F], ComponentMixinType>, H extends ExtendsComponents<H, [Base, A, B, C, D, E, F, G], ComponentMixinType>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E, F, G, H]>>;
export function mixClassMixins(...args: any[]): any { return (mixMixins as any)(...args); }

/** Mix many mixins together with a composer at the end and using a custom Component class as the basis to mix on: `(MyClass, MyMixin1, MyMixin2, ...)`.
 * - See mixClassMixins for more. This just adds a composer mixin at the end. On the JS side the method uses `mixMixinsWith`.
 * - Note also that often the base class might contain a renderer - however it cannot be type specific to the mixins that it will extend it (unlike the composer that's at the end of the sequence).
 * - Note that the name of the final mix comes automatically from the last mixin class in the sequence.
 */
export function mixClassMixinsWith<ExtraInfo extends Partial<ComponentInfo>, Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, Info extends ReadComponentInfo<A, ExtraInfo>>(base: Base, a: A, composer: ComponentMixinType<Info, Info>): ReturnType<A>;
export function mixClassMixinsWith<ExtraInfo extends Partial<ComponentInfo>, Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, Info extends ReadComponentInfos<[A, B], ExtraInfo>>(base: Base, a: A, b: B, composer: ComponentMixinType<Info, Info>): ComponentType<ReadComponentInfos<[Base, A, B]>>;
export function mixClassMixinsWith<ExtraInfo extends Partial<ComponentInfo>, Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C], ExtraInfo>>(base: Base, a: A, b: B, c: C, composer: ComponentMixinType<Info, Info>): ComponentType<ReadComponentInfos<[Base, A, B, C]>>;
export function mixClassMixinsWith<ExtraInfo extends Partial<ComponentInfo>, Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D], ExtraInfo>>(base: Base, a: A, b: B, c: C, d: D, composer: ComponentMixinType<Info, Info>): ComponentType<ReadComponentInfos<[Base, A, B, C, D]>>;
export function mixClassMixinsWith<ExtraInfo extends Partial<ComponentInfo>, Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>(base: Base, a: A, b: B, c: C, d: D, e: E, composer: ComponentMixinType<Info, Info>): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E]>>;
export function mixClassMixinsWith<ExtraInfo extends Partial<ComponentInfo>, Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [Base, A, B, C, D, E], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F, composer: ComponentMixinType<Info, Info>): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E, F]>>;
export function mixClassMixinsWith<ExtraInfo extends Partial<ComponentInfo>, Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [Base, A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [Base, A, B, C, D, E, F], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: ComponentMixinType<Info, Info>): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E, F, G]>>;
export function mixClassMixinsWith<ExtraInfo extends Partial<ComponentInfo>, Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [Base, A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [Base, A, B, C, D, E, F], ComponentMixinType>, H extends ExtendsComponents<H, [Base, A, B, C, D, E, F, G], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: ComponentMixinType<Info, Info>): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E, F, G, H]>>;
export function mixClassMixinsWith(...args: any[]): any { return (mixMixinsWith as any)(...args); }

/** This mixes together a Component class and one or many functions. 
 * - By default, attaches the return of the last function as the renderer (if function type, otherwise an earlier one). 
 * - Optionally as the 2nd last or last arg, can provide the name of the final class that is created by extending the given base class with the mixable functions applied.
 *      * If not provided uses `"[" + BaseClass.name + "_mix]"`.
 * - Optionally as the last arg, can provide a boolean to use the class renderer instead.
 */
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>>(Base: Class, a: A, ...extra: [name?: string, useClassRender?: boolean] | [useClassRender?: boolean]): A;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>>(Base: Class, a: A, b: B, ...extra: [name?: string, useClassRender?: boolean] | [useClassRender?: boolean]): ComponentType<ReadComponentInfos<[A, B]>>;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>>(Base: Class, a: A, b: B, c: C, ...extra: [name?: string, useClassRender?: boolean] | [useClassRender?: boolean]): ComponentType<ReadComponentInfos<[A, B, C]>>;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, ...extra: [name?: string, useClassRender?: boolean] | [useClassRender?: boolean]): ComponentType<ReadComponentInfos<[A, B, C, D]>>;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, ...extra: [name?: string, useClassRender?: boolean] | [useClassRender?: boolean]): ComponentType<ReadComponentInfos<[A, B, C, D, E]>>;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [BaseFunc, A, B, C, D, E], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, ...extra: [name?: string, useClassRender?: boolean] | [useClassRender?: boolean]): ComponentType<ReadComponentInfos<[A, B, C, D, E, F]>>;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [BaseFunc, A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [BaseFunc, A, B, C, D, E, F], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, ...extra: [name?: string, useClassRender?: boolean] | [useClassRender?: boolean]): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G]>>;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [BaseFunc, A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [BaseFunc, A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [BaseFunc, A, B, C, D, E, F, G], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, ...extra: [name?: string, useClassRender?: boolean] | [useClassRender?: boolean]): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G, H]>>;
export function mixClassFuncs(BaseClass: ComponentType, ...args: ComponentFunc[] | [...funcs: ComponentFunc[], name: string | undefined, useClassRender: boolean | undefined] | [...funcs: ComponentFunc[], useClassRender: boolean | undefined]): ComponentType {
    // Mix.
    const funcs = args.filter(f => typeof f === "function") as ComponentFunc[];
    const compFunc = funcs.length > 1 ? (mixFuncs as any)(...funcs) as ComponentFunc : funcs[0] as ComponentFunc;
    const lastArgs = args.slice(funcs.length);
    const useClassRender = lastArgs[0] === true || lastArgs[1] === true;
    const name = typeof lastArgs[0] === "string" && lastArgs[0] || "[" + BaseClass.name + "_mix]";
    // Return a new class extending the base.
    const Class = { [name]: class extends (BaseClass as ComponentType) {
        // Assign render method. It will only be used for the very first time.
        render(initProps: Record<string, any>) {
            // Run the compFunc initializer once.
            const output = compFunc(initProps, this, this.contextAPI as ComponentContextAPI);
            // Return a renderer.
            return useClassRender ? super.render : typeof output === "function" ? output : () => output;
        }
    }}[name];
    // Assign static.
    for (const p in compFunc) {
        // Assign/Combine ComponentShadowAPI.
        if (p === "api")
            Class.api = Class.api ? mergeShadowWiredAPIs([Class.api, (compFunc as ComponentShadowFunc | ComponentWiredFunc).api]) : (compFunc as ComponentShadowFunc | ComponentWiredFunc).api;
        // Assign normal static.
        else
            Class[p] = compFunc[p];
    }
    // Return resulting class.
    return Class;
}

/** This mixes together a Component class and one or many functions with a composer function as the last function.
 * - The last function is always used as the renderer and its typing is automatic.
 *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
 * - Internally this method uses mixClassFuncs (but just cuts out the optional typing related object).
 * - Optionally as the very last arg (after optional typing info), can provide the name of the final class that is created by extending the given base class with the mixable functions applied.
 */
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, Mixed extends ComponentFunc<ReadComponentInfo<BaseFunc, ExtraInfo>>>(Base: Class, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A], ExtraInfo>>>(Base: Class, a: A, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B], ExtraInfo>>>(Base: Class, a: A, b: B, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E, F], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E, F, G], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E, F, G, H], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, ...extra: [extraInfo?: ExtraInfo, name?: string] | [extraInfo?: ExtraInfo] | [name?: string]): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith(...funcs: any[]) {
    // Pass to mixClassFuncs, and remove the optional typing object - as it has no meaning on the JS side.
    // .. Note also that we purposefully bypass the typing, as we're using a dynamic feed.
    return (mixClassFuncs as any)(...funcs.filter(f => typeof f === "function" || typeof f === "string"));
}


// - Component HOCs - //

/** Combine many HOCs together. */
// Note. There is something wrong with assigning a func to ComponentTypeAny upon compiling (not before) in module usage.
// .. Something about the props not being okay to ComponentFunc<{}>. It only happens when using an untyped spread func as the BASE.
// .... In that case the type is (props: { ...}) => any ..! Where as shouldn't be ANY.
// .. Could solve it generally by using `Base extends any`, not ComponentTypeAny. But let's just leave it. If uses a typed base func works fine.
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A): SpreadFunc<ReadComponentInfo<A, ComponentInfoEmpty>["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B): SpreadFunc<ReadComponentInfo<B, ComponentInfoEmpty>["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C): SpreadFunc<ReadComponentInfo<C, ComponentInfoEmpty>["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D): SpreadFunc<ReadComponentInfo<D, ComponentInfoEmpty>["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E): SpreadFunc<ReadComponentInfo<E, ComponentInfoEmpty>["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F): SpreadFunc<ReadComponentInfo<F, ComponentInfoEmpty>["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G): SpreadFunc<ReadComponentInfo<G, ComponentInfoEmpty>["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H): SpreadFunc<ReadComponentInfo<H, ComponentInfoEmpty>["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny, I extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H, hoc9: (h: H) => I): SpreadFunc<ReadComponentInfo<I, ComponentInfoEmpty>["props"] & {}>;
export function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny, I extends ComponentTypeAny, J extends ComponentTypeAny>
    (base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H, hoc9: (h: H) => I, hoc10: (i: I) => J): SpreadFunc<ReadComponentInfo<J, ComponentInfoEmpty>["props"] & {}>;
export function mixHOCs(baseComp: ComponentTypeAny, ...hocs: ComponentHOCBase[]): SpreadFunc {
    // First compose new components.
    let Base = baseComp;
    for (const thisHOC of hocs)
        Base = thisHOC(Base);
    // Then create a def for the last component in the chain. We can just use a spread as our final component.
    return (props) => newDef(Base as any, props as any, MixDOMContent);
}


// // - Testing - // 
//
// interface MixEnabledInfo {
//     props: { enabled?: boolean; }
//     state: { enabled: boolean; };
//     class: { toggleEnabled: () => void; };
// }
//
// const MixEnabled: ComponentFunc<MixEnabledInfo> = (initProps, comp) => {
//     // Note that we can just assign our own state with _functional_ mixing.
//     // .. Even if there were many parts adding state - it's handled by the mixer.
//     comp.state = {
//         enabled: initProps.enabled || false
//     };
//     // Simple feature: toggle state on click.
//     comp.toggleEnabled = () => comp.setInState("enabled", !comp.state.enabled);
//     // Nothing to render.
// 	return null;
// }
//
// /** Requires MixEnabledInfo and provides toggling enabled off with "Escape" key. No info added. */
// //const MixEscEnabled: ComponentFuncRequires<MixEnabledInfo> = (_initProps, comp) => {
// const MixEscEnabled: ComponentFuncMixable<typeof MixEnabled> = (_initProps, comp) => {
//     // Prepare keydown handler.
//     const onKeyDown = (e: KeyboardEvent) => {
//         // On escape, toggle off and mark event as handled.
//         if (e.key === "Escape" && comp.state.enabled) {
//             comp.toggleEnabled();
//             e.preventDefault();
//             e.stopPropagation();
//         }
//     }
//     // Extend toggleEnabled feature.
//     const origToggle = comp.toggleEnabled;
//     comp.toggleEnabled = () => {
//         // Add / remove native keydown event listener.
//         if (!comp.state.enabled)
//             window.addEventListener("keydown", onKeyDown);
//         else
//             window.removeEventListener("keydown", onKeyDown);
//         // Do the original toggling.
//         origToggle();
//     }
//     // Nothing to render.
//     return null;
// }
//
// type T3 = [1] extends [number, number, ...any[]] ? true : false;
//
// interface MixPopupEnabledInfo {
// 	// We shall put popupContainer into our class and require another to implement it.
// 	// .. For example, MixAppPopupButton that would have access to the app root's element.
//     // .. Putting it into props would require nesting components - we want to _mix_ them.
//     class: {
//         /** Either a stream, or a node for a portal - if none, uses document.body. */
//         // popupContainer: Node | ComponentRemoteType | null;
//         popupContainer: Node | null;
//         /** The render output should include this component. Optionally exclude by WithPopup.WithContent. */
//         WithPopup: ComponentTypeAny;
//     };
// }
//
// // const MixPopupEnabled: ComponentFuncRequires<MixEnabledInfo & { props: { SHUOLD_FAIL: boolean; } }, MixPopupEnabledInfo> = (_, comp) => {
// // const MixPopupEnabled: ComponentFuncRequires<MixEnabledInfo, MixPopupEnabledInfo> = (_, comp) => {
// const MixPopupEnabled: ComponentFuncMixable<typeof MixEnabled, MixPopupEnabledInfo> = (_, comp) => {
//
//     // Let's create a spread func that can be included in render output to provide the tip feature.
// 	// .. Note that the spread function is assumed to be in our own render output.
// 	// .. That said, we can very conveniently use our own comp instance in it, eg. comp.props.
//     comp.WithPopup = () => {
//         // If is enabled.
//         if (comp.state.enabled) {
//             // Prepare the content.
//             const content = null;
//             // Return with container.
//             return (
//                 null
//             );
//         }
//         // Fallback to rendering nothing.
//         return null;
//     }
//     // We won't render anything.
//     // .. Instead we provide what what we want to be rendered as .WithPopup.
//     return null;
// }
//
// const PopupButton = mixFuncsWith(
//     MixEnabled,
//     MixEscEnabled,
//     MixPopupEnabled,
//     (_initProps, component) => {
//         // Here we combine the features together with a renderer function.
//         // .. We simply render a button, attach onClick to open popup, and pass the content.
//         // .. So when the popup is opened the passed content from parent chain gets grounded.
//         return (props) => null
// }, {} as { props: { text?: MixDOMRenderOutput; }} ); // Extra info for the composer.
//
//
// // type T = ReadComponentInfos<[typeof MixEnabled, typeof MixEnabled, typeof MixPopupEnabled]>;
//
// // type TT = ReadComponentRequiredInfo<typeof MixPopupEnabled>;
// // type TTT = (typeof MixPopupEnabled)["_Required"]
//
//
// const MyMixin = (Base: ComponentType<{ props: {apina: boolean;}}>): ComponentType<{ state: {apina: boolean;}}> => {
//     return null as any;
// };
//
// class Clssi extends Component<{ state: {apina: boolean;}}> {}
// const Clssi2 = class Clssi2 extends Component<{ state: {apina: boolean;}}> {} as ComponentType<{ state: {apina: boolean;}}>;
//
// type CCC = ReadComponentInfo<typeof Clssi>;
// type CCC2 = ReadComponentInfo<typeof Clssi2>;
// type R = ReturnType<typeof MyMixin>;
// type T2 = ReadComponentInfo<typeof MyMixin>;
//
//
// type MixHoverableInfo = {
// 	// These are found as component.hoverTimeout, etc.
// 	class: {
// 		hoverDisabled?: boolean; // If true, disabled.
// 		hoverTimeout: number; // Assignable.
// 		onMouseEnter: (e) => void; // For element.
// 		onMouseLeave: (e) => void; // For element.
// 	};
// 	// Timer ids to prevent collisions and writing accidents.
// 	timers: "onMouseEnter";
// 	// State is used to trigger a render change.
// 	state: {
// 		hovered: boolean;
// 	};
// }
//
// interface MixinHoverableInfo extends MixHoverableInfo {} // Let's just reuse from above.
// const MixinHoverable = createMixin<MixHoverableInfo, {}>(Base => class extends Base {
// // const MixinHoverable = createMixin<MixHoverableInfo, MixEnabledInfo>(Base => class extends Base {
//	
// 	// Extra members.
//     // .. We can just define them here to avoid using constructor.
//     hoverDisabled?: boolean;
// 	hoverTimeout: number = 500; // Just assign it here, no need for constructor.
//
// 	// Prepare state. Likewise assign it here - without a constructor.
//     state = {
// 		// For mixins, we have to support others with state. For functions it's automated.
// 		...this.state || {},
//         hovered: false
//     };
//
//     // Mouse enter and leave features.
//     // .. Let's use arrow functions (not class methods) to skip .bind(this)
//     // .. This means that when the class is created, they will be attached for each instance.
//     onMouseEnter = () => {
//         if (!this.hoverDisabled)
//             this.setTimer("onMouseEnter", () => {
//                 this.setInState("hovered", true);
//             }, this.hoverTimeout);
//     }
//     onMouseLeave = () => {
//         this.clearTimers("onMouseEnter");
//         if (this.state.hovered)
//             this.setInState("hovered", false);
//     }
// });
//
//
// // In TypeScript, we can define our requirements for the class we build on.
// const HoverTest = mixMixinsWith(
//     MixinHoverable,
//     (Base) => class extends Base {
// 	render() {
// 		return null;
// 	}
// }, {} as { props: { className?: string; } })
