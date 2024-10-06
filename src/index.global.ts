
// - Imports - //

import { MixDOM as _MixDOM } from "./MixDOM";
import * as MixinTypes from "mixin-types";
import * as DataSignals from "data-signals";
import * as DataMemo from "data-memo";
// import * as DomTypes from "dom-types";


// - Typing - //

type GlobalDependencies = typeof MixinTypes & typeof DataSignals & typeof DataMemo; // & typeof DomTypes;
declare global {
    interface Window extends GlobalDependencies {
        MixDOM: typeof _MixDOM;
    }
}


// - Attach globals - //

window.MixDOM = _MixDOM;
for (const p in MixinTypes)
    window[p] = MixinTypes;
for (const p in DataSignals)
    window[p] = DataSignals;
for (const p in DataMemo)
    window[p] = DataMemo;
// for (const p in DomTypes)
//     window[p] = DomTypes;
