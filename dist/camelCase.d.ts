export * from "./MixDOM";
import { JSX_camelCase } from "./MixDOM";
declare global {
    namespace JSX {
        interface IntrinsicElements extends JSX_camelCase.IntrinsicElements {}
        interface IntrinsicAttributes extends JSX_camelCase.IntrinsicAttributes {}
    }
}