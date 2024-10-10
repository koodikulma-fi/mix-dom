
// - Imports - //

// Libraries.
import { InstanceTypeFrom } from "mixin-types";
// Only typing (local).
import { ComponentInfo, ComponentInfoEmpty, ReadComponentInfo, ReadComponentInfos, ReadComponentRequiredInfo } from "./typesInfo";
import { Component, ComponentFunc, ComponentType } from "./Component";


// - Component class / func type helpers - //

/** Either type of functional component: spread or a full component (with optional contextAPI).
 * - Note. The type does not actually include SpreadFunc specifically - but includes it as being a more restricted form of a ComponentFunc.
 *      * This is simply so that (props) can be auto typed when using this type. The same goes for the ComponentFuncCtx with its 3rd arg - already included in ComponentFunc.
 */
export type ComponentFuncAny<Info extends Partial<ComponentInfo> = {}> = ComponentFunc<Info>; // | SpreadFunc<Info["props"] & {}>; // <-- Removed as it ruins (props) typing.

// Special class/func types.
/** Either a class type or a component func (not a spread func, nor a component class instance). */
export type ComponentTypeEither<Info extends Partial<ComponentInfo> = {}> = ComponentType<Info> | ComponentFunc<Info>;
/** This is a shortcut for all valid MixDOM components: class, component func or a spread func. Not including class instances, only types.
 * - Hint. You can use this in props: `{ ItemRenderer: ComponentTypeAny<Info>; }` and then just insert it by `<props.ItemRenderer {...itemInfo} />`
 */
export type ComponentTypeAny<Info extends Partial<ComponentInfo> = {}> = ComponentType<Info> | ComponentFuncAny<Info>;
/** Get the component instance type from component class type or component function, with optional fallback (defaults to Component). */
export type ComponentInstance<CompType extends ComponentType | ComponentFunc, Fallback = Component> = [CompType] extends [ComponentFunc] ? Component<ReadComponentInfo<CompType>> : [CompType] extends [ComponentType] ? InstanceTypeFrom<CompType> : Fallback;


// - Component with class requirements - //

/** Get a clean Component class instance type from anything (info, class type/instance, func, spread, HOC, mixin, mixable func, ...). Enforces the "class" requirements. */
export type GetComponentFrom<Anything> = Component<ReadComponentInfo<Anything, ComponentInfoEmpty>> & ReadComponentInfo<Anything, ComponentInfoEmpty>["class"];
/** Get a clean Component class type (non-instanced) from anything (info, class type/instance, func, spread, HOC, mixin, mixable func, ...). Enforces the "class" requirements. */
export type GetComponentTypeFrom<Anything> = ComponentType<ReadComponentInfo<Anything, ComponentInfoEmpty>>; // & ClassType<ReadComponentInfo<Anything, ComponentInfoEmpty>["class"]>; // Not needed, enforced in constructor's new.
/** Get a clean Component function type from anything (info, class type/instance, func, spread, HOC, mixin, mixable func, ...). Enforces the "class" requirements. */
export type GetComponentFuncFrom<Anything> = ComponentFunc<ReadComponentInfo<Anything, ComponentInfoEmpty>>;


// - Hocs - //

export type ComponentHOC<RequiredType extends ComponentTypeAny, FinalType extends ComponentTypeAny> = (InnerComp: RequiredType) => FinalType;
export type ComponentHOCBase = (InnerComp: ComponentTypeAny) => ComponentTypeAny;


// - Mixins - //

export type ComponentMixinType<Info extends Partial<ComponentInfo> = {}, RequiresInfo extends Partial<ComponentInfo> = {}> = (Base: GetComponentTypeFrom<RequiresInfo>) => GetComponentTypeFrom<RequiresInfo & Info>;

// Types for combining and extending Component functions.
export type ComponentFuncRequires<RequiresInfo extends Partial<ComponentInfo> = {}, OwnInfo extends Partial<ComponentInfo> = {}> = ComponentFunc<RequiresInfo & OwnInfo> & { _Required?: ComponentFunc<RequiresInfo>; };
export type ComponentFuncMixable<RequiredFunc extends ComponentFunc = ComponentFunc, OwnInfo extends Partial<ComponentInfo> = {}> = ComponentFunc<ReadComponentInfo<RequiredFunc> & OwnInfo> & { _Required?: RequiredFunc; };


// - Extending - //

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
