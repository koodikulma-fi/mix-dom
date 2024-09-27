import { newDef } from "../../src/static/routinesDefs";
import { PseudoFragment } from "../../src/components/ComponentPseudos";
export function jsx(tagOrClass, origProps = null, maybeKey) {
    return newDef(tagOrClass, maybeKey === undefined ? origProps : Object.assign({ _key: maybeKey }, origProps));
}
export { jsx as jsxs, jsx as jsxDEV, PseudoFragment as Fragment };
