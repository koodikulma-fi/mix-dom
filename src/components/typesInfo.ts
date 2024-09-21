
// - Imports - //

// Library.
import { ClassType, IterateBackwards } from "mixin-types";
import { ContextsAllType } from "data-signals";
// Typing.
import { MixDOMDoubleRenderer, MixDOMPreComponentOnlyProps, MixDOMRenderOutput } from "../typing";
// Only typing (local).
import { ComponentTypeAny } from "./typesVariants";
import { Component, ComponentFunc, ComponentType } from "./Component";
import { SpreadFunc } from "./ComponentSpread";
import { ComponentContextAPI } from "./ComponentContextAPI";


// - Component info - //

/** Typing infos for Components. */
export interface ComponentInfo<
    Props extends Record<string, any> = {},
    State extends Record<string, any> = {},
    Class extends Record<string, any> = {},
    Signals extends Record<string, (...args: any[]) => any> = {},
    Timers extends any = any,
    Contexts extends ContextsAllType = {}
> {
    /** Typing for the props for the component - will be passed by parent. */
    props: Props;
    /** Typing for the local state of the component. */
    state: State;
    /** Only for functional components - can type extending the component with methods and members.
     * - For example: `{ class: { doSomething(what: string): void; }; }`
     * - And then `(initProps, component) => { component.doSomething = (what) => { ... } }`
     */
    class: Class;
    /** Typed signals. For example `{ signals: { onSomething: (what: string) => void; }; }`.
     * - Note that these are passed on to the props._signals typing. However props._signals will not actually be found inside the render method.
     */
    signals: Signals;
    /** Typing for timers. Usually strings but can be anything. */
    timers: Timers;
    /** Typing for the related contexts: a dictionary where keys are context names and values are each context.
     * - The actual contexts can be attached directly on the Component using its contextAPI or _contexts prop, but they are also secondarily inherited from the Host.
     */
    contexts: Contexts;
}

/** Empty component info type. */
export type ComponentInfoEmpty = {
    props?: {};
    state?: {};
    class?: {};
    signals?: {};
    timers?: {};
    contexts?: {};
}


// - Create by info args - //

/** This declares a Component class instance but allows to input the Infos one by one: <Props, State, Class, Signals, Timers, Contexts> */
export interface ComponentOf<
    Props extends Record<string, any> = {},
    State extends Record<string, any> = {},
    Class extends Record<string, any> = {},
    Signals extends Record<string, (...args: any[]) => any> = {},
    Timers extends any = {},
    Contexts extends ContextsAllType = {},
> extends Component<ComponentInfo<Props, State, Class, Signals, Timers, Contexts>> {}

/** This declares a Component class type but allows to input the Infos one by one: <Props, State, Class, Signals, Timers, Contexts> */
export interface ComponentTypeOf<
    Props extends Record<string, any> = {},
    State extends Record<string, any> = {},
    Class extends Record<string, any> = {},
    Signals extends Record<string, (...args: any[]) => any> = {},
    Timers extends any = {},
    Contexts extends ContextsAllType = {},
> extends ComponentType<ComponentInfo<Props, State, Class, Signals, Timers, Contexts>> {}

/** This declares a ComponentFunc but allows to input the Infos one by one: <Props, State, Class, Signals, Timers, Contexts> */
export type ComponentFuncOf<
    Props extends Record<string, any> = {},
    State extends Record<string, any> = {},
    Class extends Record<string, any> = {},
    Signals extends Record<string, (...args: any[]) => any> = {},
    Timers extends any = any,
    Contexts extends ContextsAllType = {}
> = (initProps: MixDOMPreComponentOnlyProps<Signals> & Props, component: Component<ComponentInfo<Props, State, Class, Signals, Timers, Contexts>> & Class, contextAPI: ComponentContextAPI<Contexts>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;


// - Read component info - //

/** Type for anything that from which component info can be derived. */
export type ComponentInfoInterpretable = Partial<ComponentInfo> | { _Info?: Partial<ComponentInfo>; } | Component | ComponentType | ComponentFunc | SpreadFunc;

/** Robust component info reader from any kind of type: info object, component class type or instance, component function or spread function. Define BaseInfo to enforce the known outcome, eg. using ComponentInfoEmpty. */
export type ReadComponentInfo<Anything, BaseInfo extends Record<string, any> = {}> = BaseInfo & (

    // Direct info from anything that fits the info type.
    // .. In practice this applies to fully typed component functions.
    // .. It could/should also apply to component class types, but doesn't - seems it's due to having mixin support at Component level.
    Anything extends { _Info?: Partial<ComponentInfo>; } | undefined ? (Anything & {})["_Info"] :

    // From class instance through its constructor.
    Anything extends { constructor: { _Info?: Partial<ComponentInfo>; }; } | undefined ? (Anything & {})["constructor"]["_Info"] :
    
    // From class type through instance and contructor. It's kind of senseless, but this way we get through the mixin base.
    // .. Note that if we were to directly add static _Info on the _Component mixin base, it would not contain the correctly typed info.
    Anything extends ClassType<{ constructor: { _Info?: Partial<ComponentInfo>; } }> | undefined ? InstanceType<(Anything & {})>["constructor"]["_Info"] :

    // Func without info - infer from parameters.
    Anything extends ((...args: any[]) => any | void) | undefined ? ReadComponentInfoFromArgsReturn<Parameters<(Anything & {})>, ReturnType<Anything & {}>> :

    // Direct info.
    Anything extends Partial<ComponentInfo> ? Anything : 
    
    // Otherwise couldn't find any valid info.
    {}
);

/** Read merged info from multiple anythings inputted as an array. */
export type ReadComponentInfos<Anythings extends any[], BaseInfo extends Record<string, any> = {}, Index extends number = Anythings["length"], Collected extends Partial<ComponentInfo> = {}> =
    Index extends 0 ? Collected & BaseInfo : ReadComponentInfos<Anythings, BaseInfo, IterateBackwards[Index], Collected & ReadComponentInfo<Anythings[IterateBackwards[Index]]>>;

/** For mixing components together, this reads any kind of info that refers to mixable's "_Required" part (in any form from anything, supporting mixables and HOCs).
 * - The _Required info indicates what the mixable component requires before it in the mixing chain.
 * - The actual info in _Required can be info or a componentfunc with info or such, but in here we read only the component info part from it.
 */
export type ReadComponentRequiredInfo<Anything, BaseInfo extends Record<string, any> = {}> =

    // Direct info from anything that fits the info type.
    // .. In practice this applies to fully typed component functions.
    // .. It could/should also apply to component class types, but doesn't - seems it's due to having mixin support at Component level.
    Anything extends { _Required?: ComponentInfoInterpretable; } | undefined ? ReadComponentInfo<(Anything & {})["_Required"], BaseInfo> :

    // From class instance through its constructor.
    Anything extends { constructor: { _Required?: ComponentInfoInterpretable }; } | undefined ? ReadComponentInfo<(Anything & {})["constructor"]["_Required"], BaseInfo> :
    
    // From class type through instance and contructor. It's kind of senseless, but this way we get through the mixin base.
    Anything extends ClassType<{ constructor: { _Required?: ComponentInfoInterpretable } }> | undefined ? ReadComponentInfo<InstanceType<(Anything & {})>["constructor"]["_Required"], BaseInfo> :

    // Func without info - infer from parameters.
    Anything extends ((...args: any[]) => any | void) | undefined ?

        // Fits HOC or class mixin pattern. The required component (class or func) is implied by the Base argument - so we just read info from it.
        Anything extends (Base: ComponentTypeAny) => ComponentTypeAny ? ReadComponentInfo<Parameters<Anything>[0], BaseInfo> :

        // See if the parameters match expectations of a component func. Only use the component info at 2nd arg - we don't care about spreads and such here.
        Parameters<(Anything & {})> extends [Record<string, any> | undefined, { constructor: { _Required?: ComponentInfoInterpretable }; }] ?
            // Does have _Required info. (Not sure if any flow puts it here currently, but it's not insensible to do that.)
            ReadComponentInfo<Parameters<(Anything & {})>[1]["constructor"]["_Required"], BaseInfo> : 
        
        // Didn't have any useful info, but was a function.
        BaseInfo :

    // Otherwise couldn't find any valid info.
    BaseInfo;

/** Reads component info based on function's arguments, or return (for mixables). Provides BaseInfo to enforce the type. */
export type ReadComponentInfoFromArgsReturn<Params extends any[], Return extends any = void> = 
    // Take the info hidden in the second prop representing the Component instance.
    Params extends [Record<string, any> | undefined, { constructor: { _Info?: Partial<ComponentInfo>; }; }, ...any[]] ? Params[1]["constructor"]["_Info"] :
    // Otherwise support mixins.
    Params extends [ComponentTypeAny] ?
        // Get the info from the returned component class or func type, if fits the pattern.
        Return extends ComponentTypeAny ? ReadComponentInfo<Return> :
        // Didn't fit the pattern.
        {} :
    // Otherwise fallback to reading props from the first argument. But only if had only one argument.
    Params extends [Record<string,any>] ? { props: Params[0]; } :
    // Couldn't read realiably.
    {};
