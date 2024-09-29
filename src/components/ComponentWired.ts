
// - Imports - //

// Typing.
import { MixDOMRenderOutput, MixDOMDoubleRenderer } from "../typing";
// Only typing (local).
import { ComponentShadow, ComponentShadowType } from "./ComponentShadow";
import { ComponentShadowAPI } from "./ComponentShadowAPI";
import { ComponentWiredAPI } from "./ComponentWiredAPI";


// - Types - //

/** Wired can be a function with `{ api }` assigned. The access is the same: `MyWiredCompOrFunc.api`. */
export type ComponentWiredFunc<
    ParentProps extends Record<string, any> = {},
    BuildProps extends Record<string, any> = {},
    MixedProps extends Record<string, any> = {}
> = ((props: ParentProps, component: ComponentWired<ParentProps>) =>
        MixDOMRenderOutput | MixDOMDoubleRenderer<ParentProps, MixedProps> ) & { api: ComponentWiredAPI<ParentProps, BuildProps, MixedProps>; };
/** There is no actual pre-existing class for ComponentWired. But for typing, we can provide the info for the static side. */
export interface ComponentWiredType<
    ParentProps extends Record<string, any> = {},
    BuildProps extends Record<string, any> = {},
    MixedProps extends Record<string, any> = {}
> extends ComponentShadowType<{ props: ParentProps; state: MixedProps; }> {
    api: ComponentShadowAPI<{ props: ParentProps; state: MixedProps }> & ComponentWiredAPI<ParentProps, BuildProps, MixedProps>;
}
/** There is no actual class for ComponentWired. Instead a new class is created when createWired is used. */
export interface ComponentWired<ParentProps extends Record<string, any> = {}, BuildProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = {}> extends ComponentShadow<{ props: ParentProps; state: MixedProps; }> {
    ["constructor"]: ComponentWiredType<ParentProps, BuildProps, MixedProps>;
}
