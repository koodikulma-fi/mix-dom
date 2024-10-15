export * from "./MixDOM";
import { JSX_native } from "./MixDOM";
declare global {
    namespace JSX {
        interface IntrinsicElements extends JSX_native.IntrinsicElements {}
        interface IntrinsicAttributes extends JSX_native.IntrinsicAttributes {}
    }
}
