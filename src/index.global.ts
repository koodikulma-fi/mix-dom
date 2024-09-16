
import { MixDOM as _MixDOM } from "./MixDOM";

window.MixDOM = _MixDOM;

declare global {
    interface Window {
        MixDOM: typeof _MixDOM;
    }
}
