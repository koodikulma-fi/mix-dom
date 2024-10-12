
// - Info - //

/**
* @fileoverview
* This file adds automatic support for JSX runtime API:
* - jsx(type, props, key)
* - jsxs(type, props, key)
* - jsxDEV(type, props, key, __source, __self)
* 
* NOTE: Not yet implemented.
*/


// - Exports - //

// Note. Basically needs routinesDefs from JS side and some tiny other for typing.
// .. Could be externalized. Just not sure what exactly this should output, but I think it's relative close to below.
export { newDef as jsx } from "../../src/static/routinesDefs";
export { newDef as jsxDEV } from "../../src/static/routinesDefs";
export { PseudoFragment as Fragment } from "../../src/components/ComponentPseudos";


// // - Imports - //
// 
// import { DOMTags, DOMAttributes, DOMAttributesAny } from "dom-types";
// import { MixDOMDefTarget, MixDOMInternalCompProps, MixDOMComponentTag } from "../../src/typing";
// import { newDef } from "../../src/static/routinesDefs";
// import { PseudoFragment } from "../../src/components/ComponentPseudos";
// import { ComponentTypeAny } from "../../src/components/Component";
//
//
// // - Exports - //
//
// export function jsx<DOMTag extends DOMTags>(domTag: DOMTag, origProps?: DOMAttributes<DOMTag> | null, maybeKey?: any, __self?: any, __source?: any): MixDOMDefTarget | null;
// export function jsx<Props extends Record<string, any>>(componentTag: MixDOMComponentTag<Props>, origProps?: (Props & MixDOMInternalCompProps) | null, maybeKey?: any, __self?: any, __source?: any): MixDOMDefTarget | null;
// export function jsx<Props extends DOMAttributesAny | MixDOMInternalCompProps>(tag: DOMTags | ComponentTypeAny<{ props: Props; }>, origProps?: Props | null, maybeKey?: any, __self?: any, __source?: any): MixDOMDefTarget | null;
// // export function jsx<Props extends DOMAttributes | MixDOMInternalCompProps>(tag: MixDOMPreTag, origProps?: Props | null, maybeKey?: any, __self?: any, __source?: any): MixDOMDefTarget | null;
// export function jsx(tagOrClass: any, origProps: Record<string, any> | null = null, maybeKey?: any): MixDOMDefTarget | null {
//     return newDef(tagOrClass, maybeKey === undefined ? origProps : { _key: maybeKey, ...origProps });
// }
//
// export {
//     jsx as jsxs,
// 	jsx as jsxDEV,
//     PseudoFragment as Fragment
// };
