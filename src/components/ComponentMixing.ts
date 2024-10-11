
// - Imports - //

// Typing.
import { MixDOMDoubleRenderer, MixDOMRenderOutput } from "../typing";
// Routines.
import { newDef } from "../static/index";
// Common.
import { MixDOMContent } from "../common/index";
// Local.
import { ReadComponentInfo, ComponentInfo, ComponentInfoEmpty, ReadComponentInfos } from "./typesInfo";
import { ComponentTypeAny, GetComponentTypeFrom, ComponentHOCBase, ComponentMixinType, ExtendsComponent, ExtendsComponents } from "./typesVariants";
import { SpreadFunc } from "./ComponentSpread";
import { Component, ComponentFunc, ComponentType } from "./Component";
import { ComponentContextAPI, ComponentCtx, ComponentFuncCtx } from "./ComponentContextAPI";
import { ComponentShadowFunc } from "./ComponentShadow";
import { ComponentShadowAPI } from "./ComponentShadowAPI";
import { ComponentWiredFunc } from "./ComponentWired";
import { ComponentWiredAPI } from "./ComponentWiredAPI";


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
 */
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>>(a: A, useRenderer?: boolean): ComponentFunc<ReadComponentInfo<A>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>>(a: A, b: B, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B]>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>>(a: A, b: B, c: C, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C]>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>>(a: A, b: B, c: C, d: D, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D]>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D, E]>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, f: F, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F]>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G]>>;
export function mixFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G, H]>>;
export function mixFuncs(...args: [...funcs: ComponentFunc[], useRenderer: boolean | undefined] | ComponentFunc[]) {
    // Parse args.
    const nArgs = args.length;
    const useRenderer = args[nArgs - 1] === true;
    const funcs = (useRenderer || !args[nArgs - 1] ? args.slice(0, nArgs - 1) : args) as ComponentFunc[];
    // Go through each.
    const CompFunc = (initProps: Record<string, any>, component: Component | ComponentCtx, cAPI?: ComponentContextAPI) => {
        // Collect the last non-null output as the final outcome.
        // .. Prefer any functions, put if not provided use the outcome. We anyway return a renderer func.
        let lastOutput: MixDOMDoubleRenderer | MixDOMRenderOutput = null;
        for (const func of funcs as ComponentFunc[]) {
            // Skip empties. In case happens for some reason.
            if (!func)
                continue;
            // Collect state and meta before.
            const state = component.state;
            // Run the initial closure.
            const output = (func as ComponentFuncCtx)(initProps, component as ComponentCtx, cAPI as ComponentContextAPI);
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
    // Handle APIs: Check if any had 3 arguments for ContextAPI, and if any had ComponentShadowAPI | ComponentWiredAPI attached.
    let hadContext = false;
    const apis = (funcs as Array<ComponentShadowFunc | ComponentWiredFunc>).filter(func => (hadContext = hadContext || func.length > 2) && false || func.api).map(func => func.api);
    // Create and return final component func, and attach ComponentShadowAPI | ComponentWiredAPI.
    const FinalFunc = hadContext ? (initProps: Record<string, any>, component: ComponentCtx, cAPI: ComponentContextAPI) => CompFunc(initProps, component, cAPI) : (initProps: Record<string, any>, component: Component) => CompFunc(initProps, component);
    if (apis[0])
        (FinalFunc as ComponentShadowFunc | ComponentWiredFunc).api = mergeShadowWiredAPIs(apis); // If had even one, we should create a new one - as this is a new unique component.
    return FinalFunc;
}

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
// Note. We cannot reuse the Mixed for the return if we want the return to be `Func & { _Info: Info }`;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfo<A, ExtraInfo>>>(a: A, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfo<A, ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B], ExtraInfo>>>(a: A, b: B, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B], ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C], ExtraInfo>>>(a: A, b: B, c: C, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C], ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D], ExtraInfo>>>(a: A, b: B, c: C, d: D, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D], ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>;
export function mixFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>;
export function mixFuncsWith(...funcs: any[]): ComponentFunc {
    // Remove the typing object.
    const nFuncs = funcs.length;
    if (typeof funcs[nFuncs - 1] !== "function")
        return (mixFuncs as any)(...funcs.slice(0, nFuncs - 1), true);
    // Just pass all.
    return (mixFuncs as any)(...funcs, true);
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

/** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ...)`.
 * - Note. The last mixin with a render method defined is used as the render method of the combined class.
 * - Note. If you want to define a custom base class (extending Component) you can use `mixClassMixins` method whose first argument is a base class.
 * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
*/
// Using two different funcs for best typing experience and avoiding compiling and circular problems.
// Types for only mixins.
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>>(a: A): ComponentType<ReadComponentInfo<A>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>>(a: A, b: B): ComponentType<ReadComponentInfos<[A, B]>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>>(a: A, b: B, c: C): ComponentType<ReadComponentInfos<[A, B, C]>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>>(a: A, b: B, c: C, d: D): ComponentType<ReadComponentInfos<[A, B, C, D]>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E): ComponentType<ReadComponentInfos<[A, B, C, D, E]>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<ReadComponentInfos<[A, B, C, D, E, F]>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G]>>;
export function mixMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G, H]>>;
// The actual func. Note that its implementation actually supports the first argument being either: a component base class or a mixin.
export function mixMixins(...args: any[]) {
    // Loop each and extend.
    const CustomBase = (args[0] as ComponentType).MIX_DOM_CLASS ? args[0] : null;
    let BaseClass: ComponentType = CustomBase || Component;
    for (const mixin of (CustomBase ? args.slice(1) : args) as ComponentMixinType[])
        BaseClass = mixin(BaseClass);
    // Return the final class.
    return BaseClass;
}

/** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ..., ComposerMixin)`
 * - Note. The last mixin is assumed to be the one to do the rendering and its type is combined from all the previous + the optional extra info given as the very last argument.
 * - This is like mixFuncsWith but for mixins. On the javascript this function is teh same as MixDOM.mixMixins.
 */
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, Info extends ReadComponentInfo<A, ExtraInfo>>(a: A, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, Info extends ReadComponentInfos<[A, B], ExtraInfo>>(a: A, b: B, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C], ExtraInfo>>(a: A, b: B, c: C, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D], ExtraInfo>>(a: A, b: B, c: C, d: D, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
export function mixMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
// The actual func. Note that its implementation actually supports the first argument being either: a component base class or a mixin.
export function mixMixinsWith(...args: any[]) {
    // Remove the typing object.
    const nArgs = args.length;
    if (typeof args[nArgs - 1] !== "function")
        return (mixMixins as any)(...args.slice(0, nArgs - 1));
    // Just pass all.
    return (mixMixins as any)(args);
}


/** Mix many mixins together with a custom Component class as the basis to mix on: `(MyClass, MyMixin1, MyMixin2, ...)`.
 * - Note. The last mixin with a render method defined is used as the render method of the combined class.
 * - Note. If you don't want to define a custom component class as the base, you can use the `mixMixins` function instead (which uses the Component class). These two funcs are split to get better typing experience.
 * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
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

/** This mixes together a Component class and one or many functions. 
 * - By default, attaches the return of the last function as the renderer (if function type, otherwise an earlier one). 
 * - Optionally as the 3rd arg, can provide a boolean to use the class renderer instead. */
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>>(Base: Class, a: A, useClassRender?: boolean): A;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>>(Base: Class, a: A, b: B, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B]>>;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>>(Base: Class, a: A, b: B, c: C, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C]>>;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D]>>;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D, E]>>;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [BaseFunc, A, B, C, D, E], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D, E, F]>>;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [BaseFunc, A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [BaseFunc, A, B, C, D, E, F], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G]>>;
export function mixClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [BaseFunc, A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [BaseFunc, A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [BaseFunc, A, B, C, D, E, F, G], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G, H]>>;
export function mixClassFuncs(BaseClass: ComponentType, ...funcArgs: ComponentFunc[] | [...funcs: ComponentFunc[], useClassRender: boolean | undefined]): any {
    // Mix.
    const useClassRender = typeof funcArgs[funcArgs.length - 1] !== "function" ? !!funcArgs.pop() : false;
    // const compFunc = funcArgs.length > 1 ? mixFuncs(...funcArgs as [ComponentFunc]) : funcArgs[0] as ComponentFunc;
    const compFunc = funcArgs.length > 1 ? (mixFuncs as any)(...funcArgs) : funcArgs[0] as ComponentFunc;
    // Return a new class extending the base.
    return { [BaseClass.name]: class extends (BaseClass as ComponentType) {
        // Assign render method. It will only be used for the very first time.
        render(initProps: Record<string, any>) {
            // Run the compFunc initializer once.
            const output = compFunc(initProps, this, this.contextAPI as ComponentContextAPI);
            // Return a renderer.
            return useClassRender ? super.render : typeof output === "function" ? output : () => output;
        }
    }}[BaseClass.name] as any;
}

/** This mixes together a Component class and one or many functions with a composer function as the last function.
 * - The last function is always used as the renderer and its typing is automatic.
 *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
 */
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, Mixed extends ComponentFunc<ReadComponentInfo<BaseFunc, ExtraInfo>>>(Base: Class, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A], ExtraInfo>>>(Base: Class, a: A, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B], ExtraInfo>>>(Base: Class, a: A, b: B, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E, F], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E, F, G], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E, F, G, H], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
export function mixClassFuncsWith(...funcs: any[]) {
    const nFuncs = funcs.length;
    return (mixClassFuncs as any)(...(typeof funcs[nFuncs - 1] !== "function" ? funcs.slice(0, nFuncs - 1) : funcs)) as any;
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
    return (props) => newDef(Base as any, props, MixDOMContent);
}


// // - Testing - // 
//
// import { ComponentFuncMixable, ComponentFuncRequires } from "./typesVariants";
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
