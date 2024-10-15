export * from "./MixDOM";
import { JSX_mixedCase } from "./MixDOM";
declare global {
    namespace JSX {
        interface IntrinsicElements extends JSX_mixedCase.IntrinsicElements {}
        interface IntrinsicAttributes extends JSX_mixedCase.IntrinsicAttributes {}
    }
}
