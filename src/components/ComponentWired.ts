
// - Imports - //

// Typing.
import { MixDOMRenderOutput, MixDOMDoubleRenderer } from "../typing";
// Only typing (local).
import { ComponentShadow, ComponentShadowType } from "./ComponentShadow";
import { ComponentShadowAPI } from "./ComponentShadowAPI";
import { ComponentWiredAPI } from "./ComponentWiredAPI";


// - Types - //

/** Wired component is a functional component with `{ api }` assigned. The access is the same as if was using a class with static api: `MyWiredFunc.api`. */
export type ComponentWiredFunc<
    ParentProps extends Record<string, any> = {},
    BuiltProps extends Record<string, any> = {},
    MixedProps extends Record<string, any> = {}
> = ((props: ParentProps, component: ComponentWired<ParentProps, BuiltProps, MixedProps>) =>
    MixDOMRenderOutput | MixDOMDoubleRenderer<ParentProps, MixedProps> ) & { api: ComponentWiredAPI<ParentProps, BuiltProps, MixedProps>; };
/** Use `ComponentWiredFunc` for referring to the wired component in normal circumstances - it's always a functional component. There is no actual pre-existing class for ComponentWired - but for typing, we can provide the info for the static side. */
export interface ComponentWiredType<
    ParentProps extends Record<string, any> = {},
    BuiltProps extends Record<string, any> = {},
    MixedProps extends Record<string, any> = {}
> extends ComponentShadowType<{ props: ParentProps; state: MixedProps; }> {
    api: ComponentShadowAPI<{ props: ParentProps; state: MixedProps }> & ComponentWiredAPI<ParentProps, BuiltProps, MixedProps>;
}
/** The typing for a virtual class instance of a Wired Component. Note that there's no actual pre-existing class for ComponentWired. */
export interface ComponentWired<ParentProps extends Record<string, any> = {}, BuiltProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = {}> extends ComponentShadow<{ props: ParentProps; state: MixedProps; }> {
    ["constructor"]: ComponentWiredType<ParentProps, BuiltProps, MixedProps>;
}
