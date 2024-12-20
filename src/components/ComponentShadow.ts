
// - Imports - //

// Base.
import type { Component, ComponentFuncReturn, ComponentProps, ComponentType } from "./Component";
// Only typing (local).
import type { ComponentInfo } from "./typesInfo";
import type { ComponentExternalSignalsFrom } from "./typesSignals";
import type { ComponentContextAPI } from "./ComponentContextAPI";
import type { ComponentShadowAPI } from "./ComponentShadowAPI";


// - Helper types - //

/** Type for the ComponentShadowAPI signals. */
export type ComponentShadowSignals<Info extends Partial<ComponentInfo> = {}> = ComponentExternalSignalsFrom<Info, ComponentShadow>;
export type ComponentShadowFunc<Info extends Partial<ComponentInfo> = {}> = (
    ((props: ComponentProps<Info>, component: ComponentShadow<Info>) => ComponentFuncReturn<Info>)
    ) & { Info?: Info; api: ComponentShadowAPI<Info>; };
export type ComponentShadowFuncWith<Info extends Partial<ComponentInfo> = {}> =
    ((props: ComponentProps<Info>, component: ComponentShadowCtx<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => ComponentFuncReturn<Info>) & { Info?: Info; api: ComponentShadowAPI<Info>; };
export type ComponentShadowFuncWithout<Info extends Partial<ComponentInfo> = {}> =
    ((props: ComponentProps<Info>, component: ComponentShadow<Info>, contextAPI?: never) => ComponentFuncReturn<Info>) & { Info?: Info; api: ComponentShadowAPI<Info>; };


// - Class types - //

/** The static class type for ComponentShadow. */
export interface ComponentShadowType<Info extends Partial<ComponentInfo> = {}> extends ComponentType<Info> {
    api: ComponentShadowAPI<Info>;
}
/** There is no actual pre-existing class for ComponentShadow. Instead a new class is created when createShadow is used. */
export interface ComponentShadow<Info extends Partial<ComponentInfo> = {}> extends Component<Info> {
    ["constructor"]: ComponentShadowType<Info>;
}
/** Type for Component with ComponentContextAPI. Also includes the signals that ComponentContextAPI brings. */
export interface ComponentShadowCtx<Info extends Partial<ComponentInfo> = {}> extends ComponentShadow<Info> {
    contextAPI: ComponentContextAPI<Info["contexts"] & {}>;
}
