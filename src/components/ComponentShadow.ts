
// - Imports - //

// Typing.
import { MixDOMPreComponentOnlyProps, MixDOMDoubleRenderer, MixDOMRenderOutput } from "../typing";
// Only typing (local).
import { ComponentInfo } from "./typesInfo";
import { ComponentExternalSignalsFor } from "./typesSignals";
import { ComponentContextAPI } from "./ComponentContextAPI";
import { Component, ComponentType } from "./Component";
import { ComponentShadowAPI } from "./ComponentShadowAPI";


// - Helper types - //

/** Type for the ComponentShadowAPI signals. */
export type ComponentShadowSignals<Info extends Partial<ComponentInfo> = {}> = ComponentExternalSignalsFor<ComponentShadow<Info>>;
export type ComponentShadowFunc<Info extends Partial<ComponentInfo> = {}> = (
    ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadow<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>)
    ) & { Info?: Info; api: ComponentShadowAPI<Info>; };
export type ComponentShadowFuncWith<Info extends Partial<ComponentInfo> = {}> =
    ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadowCtx<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>) & { Info?: Info; api: ComponentShadowAPI<Info>; };
export type ComponentShadowFuncWithout<Info extends Partial<ComponentInfo> = {}> =
    ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadow<Info>, contextAPI?: never) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>) & { Info?: Info; api: ComponentShadowAPI<Info>; };


// - Class types - //

export interface ComponentShadowType<Info extends Partial<ComponentInfo> = {}> extends ComponentType<Info> {
    api: ComponentShadowAPI<Info>;
}
/** There is no actual pre-existing class for ComponentShadow. Instead a new class is created when createShadow is used. */
export interface ComponentShadow<Info extends Partial<ComponentInfo> = {}> extends Component<Info> { }
/** Type for Component with ComponentContextAPI. Also includes the signals that ComponentContextAPI brings. */
export interface ComponentShadowCtx<Info extends Partial<ComponentInfo> = {}> extends ComponentShadow<Info> {
    contextAPI: ComponentContextAPI<Info["contexts"] & {}>;
}
