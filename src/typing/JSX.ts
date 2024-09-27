
// - Imports - //

// Local typing.
import { DOMAttributesBy, DOMAttributesBy_lowercase, DOMAttributesBy_mixedCase } from "./DOMTypes";
import { MixDOMCommonDOMProps, MixDOMPreBaseProps, MixDOMPreComponentProps, MixDOMPreDOMProps, MixDOMPreProps } from "./MixDOMTypes";


// - JSX - Intrinsic attributes - //

/** The intrinsic attributes for JSX in camelCase (for listeners and aria props). */
type IntrinsicAttributesBy_camelCase = { [CompOrEl: string]: MixDOMPreProps | MixDOMPreComponentProps; } & {[Tag in keyof DOMAttributesBy]: MixDOMPreDOMProps & MixDOMCommonDOMProps; } & DOMAttributesBy;
/** The intrinsic attributes for JSX in lowercase (for listeners and aria props). */
type IntrinsicAttributesBy_lowercase = { [CompOrEl: string]: MixDOMPreProps | MixDOMPreComponentProps; } & {[Tag in keyof DOMAttributesBy_lowercase]: MixDOMPreDOMProps & MixDOMCommonDOMProps; } & DOMAttributesBy_lowercase;
/** The intrinsic attributes for JSX in both: lowercase and camelCase (for listeners and aria props). */
type IntrinsicAttributesBy_mixedCase = { [CompOrEl: string]: MixDOMPreProps | MixDOMPreComponentProps; } & {[Tag in keyof DOMAttributesBy_mixedCase]: MixDOMPreDOMProps & MixDOMCommonDOMProps; } & DOMAttributesBy_mixedCase;


// - Exports - //

/** Include this once in your project in a file included in TS/TSX compilation:
 * - Note that the JSX namespace uses _camelCase_ for DOM attributes related to listeners and aria. To use lowercase, use `JSX_lowercase`, or both with `JSX_mixedCase`.
 * 
 * ```
import { JSX_camelCase } from "mix-dom";
declare global {
	namespace JSX {
		interface IntrinsicElements extends JSX_camelCase.IntrinsicElements {}
		interface IntrinsicAttributes extends JSX_camelCase.IntrinsicAttributes {}
	}
}
```
 */
export declare namespace JSX_camelCase {

    /** This gives support for:
     * - It adds generic support for "_key", "_ref" and "_disable" props (by catch phrase)
     *      * Note however that the "_signals" prop is component specific, so uses the initial props on constructor or func.
     *          * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMPreComponentProps included.
     *      * Similarly the "_contexts" prop is gotten through the props, even though it's not component specific (though could be, but it's not necessarily desired).
     * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
     *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
     */
    export interface IntrinsicElements extends IntrinsicAttributesBy_camelCase {}
    
    /** This is needed for components mostly. The IntrinsicElements gets ignored for them when defines precise typing: eg. (props: SomeProps).
     * - However, IntrinsicAttributes then brings those to all (dom and components), so we provide here the three basic: "_key", "_ref" and "_disable". 
     * - We leave "_signals" and "_contexts" to be found on the init props if looks in there. */
    export interface IntrinsicAttributes extends MixDOMPreBaseProps { }

}
/** Include this once in your project in a file included in TS/TSX compilation:
 * - Note that the JSX namespace uses _lowercase_ for DOM attributes related to listeners and aria. To use camelCase, use `JSX_camelCase`, or both with `JSX_mixedCase`.
 * 
 * ```
import { JSX_lowercase } from "mix-dom";
declare global {
	namespace JSX {
		interface IntrinsicElements extends JSX_lowercase.IntrinsicElements {}
		interface IntrinsicAttributes extends JSX_lowercase.IntrinsicAttributes {}
	}
}
```
 */
export declare namespace JSX_lowercase {

    /** This gives support for:
     * - It adds generic support for "_key", "_ref" and "_disable" props (by catch phrase)
     *      * Note however that the "_signals" prop is component specific, so uses the initial props on constructor or func.
     *          * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMPreComponentProps included.
     *      * Similarly the "_contexts" prop is gotten through the props, even though it's not component specific (though could be, but it's not necessarily desired).
     * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
     *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
     */
    export interface IntrinsicElements extends IntrinsicAttributesBy_lowercase {}
    
    /** This is needed for components mostly. The IntrinsicElements gets ignored for them when defines precise typing: eg. (props: SomeProps).
     * - However, IntrinsicAttributes then brings those to all (dom and components), so we provide here the three basic: "_key", "_ref" and "_disable". 
     * - We leave "_signals" and "_contexts" to be found on the init props if looks in there. */
    export interface IntrinsicAttributes extends MixDOMPreBaseProps { }

}
/** Include this once in your project in a file included in TS/TSX compilation:
 * - Note that the JSX namespace uses _lowercase_ and _camelCase_ for DOM attributes related to listeners and aria. To use only camelCase use `JSX_camelCase`, for only lowercase use `JSX_mixedCase`.
 * 
 * ```
import { JSX_mixedCase } from "mix-dom";
declare global {
	namespace JSX {
		interface IntrinsicElements extends JSX_mixedCase.IntrinsicElements {}
		interface IntrinsicAttributes extends JSX_mixedCase.IntrinsicAttributes {}
	}
}
```
 */
export declare namespace JSX_mixedCase {

    /** This gives support for:
     * - It adds generic support for "_key", "_ref" and "_disable" props (by catch phrase)
     *      * Note however that the "_signals" prop is component specific, so uses the initial props on constructor or func.
     *          * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMPreComponentProps included.
     *      * Similarly the "_contexts" prop is gotten through the props, even though it's not component specific (though could be, but it's not necessarily desired).
     * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
     *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
     */
    export interface IntrinsicElements extends IntrinsicAttributesBy_mixedCase {}
    
    /** This is needed for components mostly. The IntrinsicElements gets ignored for them when defines precise typing: eg. (props: SomeProps).
     * - However, IntrinsicAttributes then brings those to all (dom and components), so we provide here the three basic: "_key", "_ref" and "_disable". 
     * - We leave "_signals" and "_contexts" to be found on the init props if looks in there. */
    export interface IntrinsicAttributes extends MixDOMPreBaseProps { }

}