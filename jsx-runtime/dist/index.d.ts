/**
* @fileoverview
* This file adds automatic support for JSX runtime API:
* - jsx(type, props, key)
* - jsxs(type, props, key)
* - jsxDEV(type, props, key, __source, __self)
*/
import { DOMTags, DOMAttributes, MixDOMDefTarget, MixDOMPreComponentProps, MixDOMComponentTag } from "../../src/typing";
import { PseudoFragment } from "../../src/components/ComponentPseudos";
import { ComponentTypeAny } from "../../src/components/typesVariants";
export declare function jsx<DOMTag extends DOMTags>(domTag: DOMTag, origProps?: DOMAttributes<DOMTag> | null, maybeKey?: any, __self?: any, __source?: any): MixDOMDefTarget | null;
export declare function jsx<Props extends Record<string, any>>(componentTag: MixDOMComponentTag<Props>, origProps?: (Props & MixDOMPreComponentProps) | null, maybeKey?: any, __self?: any, __source?: any): MixDOMDefTarget | null;
export declare function jsx<Props extends DOMAttributes | MixDOMPreComponentProps>(tag: DOMTags | ComponentTypeAny<{ props: Props }>, origProps?: Props | null, maybeKey?: any, __self?: any, __source?: any): MixDOMDefTarget | null;
export { jsx as jsxs, jsx as jsxDEV, PseudoFragment as Fragment };
