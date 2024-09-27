import { newDef, PseudoFragment } from "mix-dom";
export function jsx(tagOrClass, origProps = null, maybeKey) {
    return newDef(tagOrClass, maybeKey === undefined ? origProps : Object.assign({ _key: maybeKey }, origProps));
}
export { jsx as jsxs, jsx as jsxDEV, PseudoFragment as Fragment };
