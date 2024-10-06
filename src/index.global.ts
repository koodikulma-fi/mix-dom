
// - Imports - //

import { MixDOM as _MixDOM } from "./MixDOM";
import * as _MixinTypes from "mixin-types";
import * as _DataSignals from "data-signals";
import * as _DataMemo from "data-memo";
// import * as _DomTypes from "dom-types";


// - Typing - //

declare global {
    interface Window {
        MixDOM: typeof _MixDOM;
        DataMemo: typeof _DataMemo;
        DataSignals: typeof _DataSignals;
        MixinTypes: typeof _MixinTypes;
        // DomTypes: typeof _DomTypes;
    }
}


// - Attach globals - //

window.MixDOM = _MixDOM;
window.DataSignals = _DataSignals;
window.DataMemo = _DataMemo;
window.MixinTypes = _MixinTypes;
// window.DomTypes = _DomTypes;
