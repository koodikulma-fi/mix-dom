
// - Info - //

/**
* @fileoverview
* This file adds automatic support for JSX runtime API:
* - jsx(type, props, key)
* - jsxs(type, props, key)
* - jsxDEV(type, props, key, __source, __self)
*/


// - Imports - //

import {
    DOMTags,
    DOMAttributes,
    MixDOMDefTarget,
	MixDOMPreComponentProps,
    MixDOMComponentTag,
    MixDOMPreTag
} from "../../src/typing";
import { newDef } from "../../src/static/routinesDefs";
import { PseudoFragment } from "../../src/components/ComponentPseudos";
import { ComponentTypeAny } from "../../src/components/typesVariants";


// - Exports - //

export function jsx<DOMTag extends DOMTags>(domTag: DOMTag, origProps?: DOMAttributes<DOMTag> | null, maybeKey?: any, __self?: any, __source?: any): MixDOMDefTarget | null;
export function jsx<Props extends Record<string, any>>(componentTag: MixDOMComponentTag<Props>, origProps?: (Props & MixDOMPreComponentProps) | null, maybeKey?: any, __self?: any, __source?: any): MixDOMDefTarget | null;
export function jsx<Props extends DOMAttributes | MixDOMPreComponentProps>(tag: DOMTags | ComponentTypeAny<{ props: Props; }>, origProps?: Props | null, maybeKey?: any, __self?: any, __source?: any): MixDOMDefTarget | null;
// export function jsx<Props extends DOMAttributes | MixDOMPreComponentProps>(tag: MixDOMPreTag, origProps?: Props | null, maybeKey?: any, __self?: any, __source?: any): MixDOMDefTarget | null;
export function jsx(tagOrClass: MixDOMPreTag, origProps: Record<string, any> | null = null, maybeKey?: any): MixDOMDefTarget | null {
    return newDef(tagOrClass, maybeKey === undefined ? origProps : { _key: maybeKey, ...origProps });
}

export {
    jsx as jsxs,
	jsx as jsxDEV,
    PseudoFragment as Fragment
};
