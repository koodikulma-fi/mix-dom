/// <reference types="node" />
import * as data_signals from 'data-signals';
import { ContextsAllType, ContextAPIType, ContextAPI, SignalListener, GetJoinedDataKeysFrom, GetDataFromContexts, SetLike, Context, ContextsAllTypeWith, RefreshCycle, SignalMan, SignalManType, SignalsRecord, ContextSettings } from 'data-signals';
import * as mixin_types from 'mixin-types';
import { AsClass, ClassType, IterateBackwards, AsMixin } from 'mixin-types';

/** Type for className input.
 * - Represents what can be fed into the MixDOM.classNames method with (ValidName extends string):
 *     1. ValidName (single className string),
 *     2. Array<ValidName>,
 *     3. Record<ValidName, any>.
 *     + If you want to use the validation only for Arrays and Records but not Strings, add 2nd parameter `string` to the type: `CleanClassName<ValidName, string>`
 */
type MixDOMPreClassName<Valid extends string = string, Single extends string = Valid> = Single | Partial<Record<Valid, any>> | Array<Valid> | Set<Valid>;
/** Split a string into a typed array.
 * - Use with PropType to validate and get deep value types with, say, dotted strings.
 */
type Split<S extends string, D extends string> = string extends S ? string[] : S extends '' ? [] : S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S];
/** Split a string array by a string. */
type SplitArr<S extends string[] | readonly string[], D extends string> = Split<S[number] & string, D>;
/** Typing tool for class name validation. The input can be:
 *    1. A string, either single or concatenated: "bold", "bold italic".
 *    2. An array of strings, similarly either single or concatenated: ["bold", "bold italic"].
 *    3. A record of string keys (where values are non-important for typing). Similarly short or long: { "bold": false, "bold italic": true }
 *    4. Anything else is accepted including "". This is to allow usage like: doHighlight && "highlight" (for strings or arrays). For objects used like: { "highlight": doHighlight }.
 * - Note that this returns either `string` (for valid strings), `Valid[]` or `any` (for valid objects & arrays), or `never` type (for failure).
 *   .. This is mostly because of whatever happens to work in practice in all the required scenarios.
 *   .. It's also because more detail is not required, and can then support mangling more flexible (while avoiding problems like circular constraints).
 * - Note that this functionality is paired with a javascript function's inner workings. (It will collect a valid class name out of the same input.)
 */
type NameValidator<Valid extends any, Input> = [
    Input
] extends [string] ? Split<Input, " "> extends Valid[] ? string : never : [
    Input
] extends [Array<any> | Readonly<Array<any>>] ? Input extends Valid[] ? Valid[] : SplitArr<Input, " "> extends Valid[] ? any : never : [
    Input
] extends [object] ? keyof Input extends Valid ? any : Split<keyof Input & string, " "> extends Valid[] ? any : never : any;
/** Helper to validate class names (paired with a javascript function that actually supports handling: (...params: any[]) => string;
 * 1. First create a type for valid names, eg.: `type ValidNames = "bold" | "italic" | "underline" | "dimmed";
 * 2. Then define a shortcut for the validator with the ValidNames type: `const cleanNames: ValidateNames<ValidNames> = MixDOM.classNames;`.
 * 3. Then reuse the function for validation:
 *     a. For strings: `const okName = cleanNames("bold", "underline italic", false, "");` // => "bold underline italic"
 *     b. For arrays: `const okName = cleanNames(["underline", "dimmed italic", false, ""], [], undefined, ["bold"]);` // => "underline dimmed italic bold"
 *     c. For objects: `const okName = cleanNames({"bold": false, "dimmed italic": true}, null, {"underline": true });` // => "dimmed italic underline"
 * - You can also mix these freely: `const okName = cleanNames("bold", ["italic"], {"underline": false});`
 * - Note however, that the typing support is made for 10 arguments max. Anything after that uses a common type ...T[], so it will get buggy in various ways.
 */
type ValidateNames<Valid extends string, Nulls extends any = undefined | null | false | 0 | ""> = <T1 extends NameValidator<Valid | Nulls, T1>, T2 extends NameValidator<Valid | Nulls, T2>, T3 extends NameValidator<Valid | Nulls, T3>, T4 extends NameValidator<Valid | Nulls, T4>, T5 extends NameValidator<Valid | Nulls, T5>, T6 extends NameValidator<Valid | Nulls, T6>, T7 extends NameValidator<Valid | Nulls, T7>, T8 extends NameValidator<Valid | Nulls, T8>, T9 extends NameValidator<Valid | Nulls, T9>, T10 extends NameValidator<Valid | Nulls, T10>, Tn extends NameValidator<Valid, Tn>>(t1?: T1, t2?: T2, t3?: T3, t4?: T4, t5?: T5, t6?: T6, t7?: T7, t8?: T8, t9?: T9, t10?: T10, ...tn: Tn[]) => string;

type HTMLTags = keyof HTMLElementTagNameMap;
type HTMLElementType<Tag extends HTMLTags = HTMLTags> = HTMLElementTagNameMap[Tag];
type HTMLAttributes<Tag extends HTMLTags = HTMLTags> = Partial<Omit<HTMLElementType<Tag>, "style" | "class" | "className" | "textContent" | "innerHTML" | "outerHTML" | "outerText" | "innerText">> & Partial<ListenerAttributesAll>;
interface ListenerAttributesAll {
    onAbort: GlobalEventHandlers["onabort"];
    onActivate: (this: GlobalEventHandlers, ev: UIEvent) => void;
    onAnimationCancel: GlobalEventHandlers["onanimationcancel"];
    onAnimationEnd: GlobalEventHandlers["onanimationend"];
    onAnimationIteration: GlobalEventHandlers["onanimationiteration"];
    onAnimationStart: GlobalEventHandlers["onanimationstart"];
    onAuxClick: GlobalEventHandlers["onauxclick"];
    onBlur: GlobalEventHandlers["onblur"];
    onCanPlay: GlobalEventHandlers["oncanplay"];
    onCanPlayThrough: GlobalEventHandlers["oncanplaythrough"];
    onChange: GlobalEventHandlers["onchange"];
    onClick: GlobalEventHandlers["onclick"];
    onClose: GlobalEventHandlers["onclose"];
    onContextMenu: GlobalEventHandlers["oncontextmenu"];
    onCueChange: GlobalEventHandlers["oncuechange"];
    onDblClick: GlobalEventHandlers["ondblclick"];
    onDrag: GlobalEventHandlers["ondrag"];
    onDragEnd: GlobalEventHandlers["ondragend"];
    onDragEnter: GlobalEventHandlers["ondragenter"];
    onDragLeave: GlobalEventHandlers["ondragleave"];
    onDragOver: GlobalEventHandlers["ondragover"];
    onDragStart: GlobalEventHandlers["ondragstart"];
    onDrop: GlobalEventHandlers["ondrop"];
    onDurationChange: GlobalEventHandlers["ondurationchange"];
    onEmptied: GlobalEventHandlers["onemptied"];
    onEnded: GlobalEventHandlers["onended"];
    onError: GlobalEventHandlers["onerror"];
    onFocus: GlobalEventHandlers["onfocus"];
    onFocusIn: (this: GlobalEventHandlers, ev: UIEvent) => void;
    onFocusOut: (this: GlobalEventHandlers, ev: UIEvent) => void;
    onGotPointerCapture: GlobalEventHandlers["ongotpointercapture"];
    onInput: GlobalEventHandlers["oninput"];
    onInvalid: GlobalEventHandlers["oninvalid"];
    onKeyDown: GlobalEventHandlers["onkeydown"];
    onKeyPress: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null;
    onKeyUp: GlobalEventHandlers["onkeyup"];
    onLoad: GlobalEventHandlers["onload"];
    onLoadedData: GlobalEventHandlers["onloadeddata"];
    onLoadedMetaData: GlobalEventHandlers["onloadedmetadata"];
    onLoadStart: GlobalEventHandlers["onloadstart"];
    onLostPointerCapture: GlobalEventHandlers["onlostpointercapture"];
    onMouseDown: GlobalEventHandlers["onmousedown"];
    onMouseEnter: GlobalEventHandlers["onmouseenter"];
    onMouseLeave: GlobalEventHandlers["onmouseleave"];
    onMouseMove: GlobalEventHandlers["onmousemove"];
    onMouseOut: GlobalEventHandlers["onmouseout"];
    onMouseOver: GlobalEventHandlers["onmouseover"];
    onMouseUp: GlobalEventHandlers["onmouseup"];
    onPause: GlobalEventHandlers["onpause"];
    onPlay: GlobalEventHandlers["onplay"];
    onPlaying: GlobalEventHandlers["onplaying"];
    onPointerCancel: GlobalEventHandlers["onpointercancel"];
    onPointerDown: GlobalEventHandlers["onpointerdown"];
    onPointerEnter: GlobalEventHandlers["onpointerenter"];
    onPointerLeave: GlobalEventHandlers["onpointerleave"];
    onPointerMove: GlobalEventHandlers["onpointermove"];
    onPointerOut: GlobalEventHandlers["onpointerout"];
    onPointerOver: GlobalEventHandlers["onpointerover"];
    onPointerUp: GlobalEventHandlers["onpointerup"];
    onProgress: GlobalEventHandlers["onprogress"];
    onRateChange: GlobalEventHandlers["onratechange"];
    onReset: GlobalEventHandlers["onreset"];
    onResize: GlobalEventHandlers["onresize"];
    onScroll: GlobalEventHandlers["onscroll"];
    onSecurityPolicyViolation: GlobalEventHandlers["onsecuritypolicyviolation"];
    onSeeked: GlobalEventHandlers["onseeked"];
    onSeeking: GlobalEventHandlers["onseeking"];
    onSelect: GlobalEventHandlers["onselect"];
    onStalled: GlobalEventHandlers["onstalled"];
    onSubmit: GlobalEventHandlers["onsubmit"];
    onSuspend: GlobalEventHandlers["onsuspend"];
    onTimeUpdate: GlobalEventHandlers["ontimeupdate"];
    onToggle: GlobalEventHandlers["ontoggle"];
    onTouchCancel: GlobalEventHandlers["ontouchcancel"];
    onTouchEnd: GlobalEventHandlers["ontouchend"];
    onTouchMove: GlobalEventHandlers["ontouchmove"];
    onTouchStart: GlobalEventHandlers["ontouchstart"];
    onTransitionCancel: GlobalEventHandlers["ontransitioncancel"];
    onTransitionEnd: GlobalEventHandlers["ontransitionend"];
    onTransitionRun: GlobalEventHandlers["ontransitionrun"];
    onTransitionStart: GlobalEventHandlers["ontransitionstart"];
    onVolumeChange: GlobalEventHandlers["onvolumechange"];
    onWaiting: GlobalEventHandlers["onwaiting"];
    onWheel: GlobalEventHandlers["onwheel"];
}

type SVGGlobalAttributes = Partial<SVGCoreAttributes> & Partial<SVGPresentationalAttributes> & Partial<SVGStylingAttributes> & Partial<SVGCoreAttributes> & Partial<SVGGraphicalEventAttributes>;
type SVGGeneralAttributes = SVGGlobalAttributes & Partial<SVGNativeAttributes>;
type SVGTags = keyof SVGElementTagNameMap;
type SVGElementType<Tag extends SVGTags = SVGTags> = SVGElementTagNameMap[Tag];
interface SVGAttributesBy extends SVGAttributesByTag {
}
type SVGAttributesByTag = SVGManualAttributes & Record<Exclude<keyof SVGElementTagNameMap, keyof SVGManualAttributes>, Partial<SVGNativeAttributes>>;
interface SVGManualAttributes {
    a: {
        "download"?: HTMLAnchorElement["download"];
        "href"?: HTMLAnchorElement["href"];
        "hreflang"?: HTMLAnchorElement["hreflang"];
        "ping"?: SVGNativeAttributes["ping"];
        "referrerpolicy"?: SVGNativeAttributes["referrerpolicy"];
        "rel"?: SVGNativeAttributes["rel"];
        "target"?: HTMLAnchorElement["target"];
        "type"?: SVGNativeAttributes["type"];
        "xlink:href"?: SVGNativeAttributes["xlink:href"];
    } & SVGGlobalAttributes;
    circle: {
        "cx"?: SVGNativeAttributes["cx"];
        "cy"?: SVGNativeAttributes["cy"];
        "r"?: SVGNativeAttributes["r"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    ellipse: {
        "cx"?: SVGNativeAttributes["cx"];
        "cy"?: SVGNativeAttributes["cy"];
        "rx"?: SVGNativeAttributes["rx"];
        "ry"?: SVGNativeAttributes["ry"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    g: {} & SVGGlobalAttributes;
    image: {
        "x"?: SVGNativeAttributes["x"];
        "y"?: SVGNativeAttributes["y"];
        "width"?: SVGNativeAttributes["width"];
        "height"?: SVGNativeAttributes["height"];
        "href"?: HTMLAnchorElement["href"];
        "xlink:href"?: SVGNativeAttributes["xlink:href"];
        "preserveAspectRatio"?: SVGNativeAttributes["preserveAspectRatio"];
        "crossorigin"?: SVGNativeAttributes["crossorigin"];
    } & SVGGlobalAttributes;
    line: {
        "x1"?: SVGNativeAttributes["x1"];
        "y1"?: SVGNativeAttributes["y1"];
        "x2"?: SVGNativeAttributes["x2"];
        "y2"?: SVGNativeAttributes["y2"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    path: {
        "d"?: SVGNativeAttributes["d"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    polyline: {
        "points"?: SVGNativeAttributes["points"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    polygon: {
        "points"?: SVGNativeAttributes["points"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    rect: {
        "x"?: SVGNativeAttributes["x"];
        "y"?: SVGNativeAttributes["y"];
        "width"?: SVGNativeAttributes["width"];
        "height"?: SVGNativeAttributes["height"];
        "rx"?: SVGNativeAttributes["rx"];
        "ry"?: SVGNativeAttributes["ry"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    } & SVGGlobalAttributes;
    use: {
        "href"?: HTMLAnchorElement["href"];
        "xlink:href"?: SVGNativeAttributes["xlink:href"];
        "x"?: SVGNativeAttributes["x"];
        "y"?: SVGNativeAttributes["y"];
        "width"?: SVGNativeAttributes["width"];
        "height"?: SVGNativeAttributes["height"];
    } & SVGGlobalAttributes;
}
interface SVGCoreAttributes {
    "id": string;
    "lang": string;
    "tabindex": string;
    "xml:base": string;
    "xml:lang": string;
    "xml:space": string;
    "xmlns": string;
    "xmlns:xlink": string;
}
interface SVGStylingAttributes {
    "class": string;
    "style": string;
}
interface SVGGraphicalEventAttributes {
    onActivate: (this: GlobalEventHandlers, ev: UIEvent) => void;
    onFocusIn: (this: GlobalEventHandlers, ev: UIEvent) => void;
    onFocusOut: (this: GlobalEventHandlers, ev: UIEvent) => void;
}
interface SVGPresentationalAttributes {
    "clip-path": string;
    "clip-rule": number | string;
    "color": string;
    "color-interpolation": 'auto' | 'sRGB' | 'linearRGB' | 'inherit';
    "color-rendering": number | string;
    "cursor": number | string;
    "display": number | string;
    "fill": string;
    "fill-opacity": number | string;
    "fill-rule": 'nonzero' | 'evenodd' | 'inherit';
    "filter": string;
    "mask": string;
    "opacity": number | string;
    "pointer-events": number | string;
    "shape-rendering": number | string;
    "stroke": string;
    "stroke-dasharray": number | string;
    "stroke-dashoffset": number | string;
    "stroke-linecap": 'butt' | 'round' | 'square' | 'inherit';
    "stroke-linejoin": 'butt' | 'round' | 'square' | 'inherit';
    "stroke-miterlimit": number | string;
    "stroke-opacity": number | string;
    "stroke-width": number | string;
    "transform": string;
    "vector-effect": number | string;
    "visibility": number | string;
}
interface SVGAriaAttributes {
    "aria-activedescendant": string;
    "aria-atomic": string;
    "aria-autocomplete": string;
    "aria-busy": string;
    "aria-checked": string;
    "aria-colcount": string;
    "aria-colindex": string;
    "aria-colspan": string;
    "aria-controls": string;
    "aria-current": string;
    "aria-describedby": string;
    "aria-details": string;
    "aria-disabled": string;
    "aria-dropeffect": string;
    "aria-errormessage": string;
    "aria-expanded": string;
    "aria-flowto": string;
    "aria-grabbed": string;
    "aria-haspopup": string;
    "aria-hidden": string;
    "aria-invalid": string;
    "aria-keyshortcuts": string;
    "aria-label": string;
    "aria-labelledby": string;
    "aria-level": string;
    "aria-live": string;
    "aria-modal": string;
    "aria-multiline": string;
    "aria-multiselectable": string;
    "aria-orientation": string;
    "aria-owns": string;
    "aria-placeholder": string;
    "aria-posinset": string;
    "aria-pressed": string;
    "aria-readonly": string;
    "aria-relevant": string;
    "aria-required": string;
    "aria-roledescription": string;
    "aria-rowcount": string;
    "aria-rowindex": string;
    "aria-rowspan": string;
    "aria-selected": string;
    "aria-setsize": string;
    "aria-sort": string;
    "aria-valuemax": string;
    "aria-valuemin": string;
    "aria-valuenow": string;
    "aria-valuetext": string;
    "role": string;
}
/** The collected native attributes for all svg elements combined - excluding the global attributes belonging to all. */
interface SVGNativeAttributes extends SVGCoreAttributes {
    "accent-height": number | string;
    "accumulate": 'none' | 'sum';
    "additive": 'replace' | 'sum';
    "alignment-baseline": 'auto' | 'baseline' | 'before-edge' | 'text-before-edge' | 'middle' | 'central' | 'after-edge' | 'text-after-edge' | 'ideographic' | 'alphabetic' | 'hanging' | 'mathematical' | 'inherit';
    "allow-reorder": 'no' | 'yes';
    "alphabetic": number | string;
    "amplitude": number | string;
    "arabic-form": 'initial' | 'medial' | 'terminal' | 'isolated';
    "ascent": number | string;
    "attribute-name": string;
    "attribute-type": string;
    "auto-reverse": number | string;
    "azimuth": number | string;
    "baseFrequency": number | string;
    "baseline-shift": number | string;
    "baseProfile": number | string;
    "bbox": number | string;
    "begin": number | string;
    "bias": number | string;
    "by": number | string;
    "calcMode": number | string;
    "cap-height": number | string;
    "clip": number | string;
    "clip-path": string;
    "clipPathUnits": number | string;
    "clip-rule": number | string;
    "color-interpolation": number | string;
    "color-interpolation-filters": 'auto' | 'sRGB' | 'linearRGB' | 'inherit';
    "color-profile": number | string;
    "color-rendering": number | string;
    "contentScriptType": number | string;
    "contentStyleType": number | string;
    "crossorigin": string;
    "cursor": number | string;
    "cx": number | string;
    "cy": number | string;
    "d": string;
    "decelerate": number | string;
    "descent": number | string;
    "diffuseConstant": number | string;
    "direction": number | string;
    "display": number | string;
    "divisor": number | string;
    "dominant-baseline": number | string;
    "dur": number | string;
    "dx": number | string;
    "dy": number | string;
    "edgeMode": number | string;
    "elevation": number | string;
    "enable-background": number | string;
    "end": number | string;
    "exponent": number | string;
    "external-resources-required": number | string;
    "fill": string;
    "fill-opacity": number | string;
    "fill-rule": 'nonzero' | 'evenodd' | 'inherit';
    "filter": string;
    "filterRes": number | string;
    "filterUnits": number | string;
    "flood-color": number | string;
    "flood-opacity": number | string;
    "focusable": number | string;
    "font-family": string;
    "font-size": number | string;
    "font-size-adjust": number | string;
    "font-stretch": number | string;
    "font-style": number | string;
    "font-variant": number | string;
    "font-weight": number | string;
    "format": number | string;
    "from": number | string;
    "fx": number | string;
    "fy": number | string;
    "g1": number | string;
    "g2": number | string;
    "glyph-name": number | string;
    "glyph-orientation-horizontal": number | string;
    "glyph-orientation-vertical": number | string;
    "glyphRef": number | string;
    "gradientTransform": string;
    "gradientUnits": string;
    "hanging": number | string;
    "height": number | string;
    "horiz-adv-x": number | string;
    "horiz-origin-x": number | string;
    "ideographic": number | string;
    "image-rendering": number | string;
    "in2": number | string;
    "in": string;
    "intercept": number | string;
    "k1": number | string;
    "k2": number | string;
    "k3": number | string;
    "k4": number | string;
    "k": number | string;
    "kernelMatrix": number | string;
    "kernelUnitLength": number | string;
    "kerning": number | string;
    "keyPoints": number | string;
    "keySplines": number | string;
    "keyTimes": number | string;
    "lengthAdjust": number | string;
    "letter-spacing": number | string;
    "lighting-color": number | string;
    "limitingConeAngle": number | string;
    "local": number | string;
    "marker-end": string;
    "marker-mid": string;
    "marker-start": string;
    "markerHeight": number | string;
    "markerUnits": number | string;
    "markerWidth": number | string;
    "mask": string;
    "maskContentUnits": number | string;
    "maskUnits": number | string;
    "mathematical": number | string;
    "mode": number | string;
    "numOctaves": number | string;
    "offset": number | string;
    "opacity": number | string;
    "operator": number | string;
    "order": number | string;
    "orient": number | string;
    "orientation": number | string;
    "origin": number | string;
    "overflow": number | string;
    "overline-position": number | string;
    "overline-thickness": number | string;
    "paint-order": number | string;
    "panose1": number | string;
    "pathLength": number | string;
    "patternContentUnits": string;
    "patternTransform": number | string;
    "patternUnits": string;
    "ping": string;
    "pointer-events": number | string;
    "points": string;
    "pointsAtX": number | string;
    "pointsAtY": number | string;
    "pointsAtZ": number | string;
    "preserveAlpha": number | string;
    "preserveAspectRatio": string;
    "primitiveUnits": number | string;
    "r": number | string;
    "radius": number | string;
    "refX": number | string;
    "refY": number | string;
    "rel": string;
    "rendering-intent": number | string;
    "repeatCount": number | string;
    "repeatDur": number | string;
    "requiredExtensions": number | string;
    "requiredFeatures": number | string;
    "referrerpolicy": 'no-referrer' | 'no-referrer-when-downgrade' | 'same-origin' | 'origin' | 'strict-origin' | 'origin-when-cross-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
    "restart": number | string;
    "result": string;
    "rotate": number | string;
    "rx": number | string;
    "ry": number | string;
    "scale": number | string;
    "seed": number | string;
    "shape-rendering": number | string;
    "slope": number | string;
    "spacing": number | string;
    "specularConstant": number | string;
    "specularExponent": number | string;
    "speed": number | string;
    "spreadMethod": string;
    "startOffset": number | string;
    "stdDeviation": number | string;
    "stemh": number | string;
    "stemv": number | string;
    "stitchTiles": number | string;
    "stop-color": string;
    "stop-opacity": number | string;
    "strikethrough-position": number | string;
    "strikethrough-thickness": number | string;
    "string": number | string;
    "stroke": string;
    "stroke-dasharray": string | number;
    "stroke-dashoffset": string | number;
    "stroke-linecap": 'butt' | 'round' | 'square' | 'inherit';
    "stroke-linejoin": 'miter' | 'round' | 'bevel' | 'inherit';
    "stroke-miterlimit": string | number;
    "stroke-opacity": number | string;
    "stroke-width": number | string;
    "surfaceScale": number | string;
    "systemLanguage": number | string;
    "tableValues": number | string;
    "targetX": number | string;
    "targetY": number | string;
    "text-anchor": string;
    "text-decoration": number | string;
    "text-rendering": number | string;
    "textLength": number | string;
    "to": number | string;
    "transform": string;
    "transform-origin": string;
    "type": string;
    "u1": number | string;
    "u2": number | string;
    "underline-position": number | string;
    "underline-thickness": number | string;
    "unicode": number | string;
    "unicode-bidi": number | string;
    "unicode-range": number | string;
    "units-per-em": number | string;
    "v-alphabetic": number | string;
    "values": string;
    "vector-effect": number | string;
    "version": string;
    "vert-adv-y": number | string;
    "vert-origin-x": number | string;
    "vert-origin-y": number | string;
    "v-hanging": number | string;
    "v-ideographic": number | string;
    "viewBox": string;
    "viewTarget": number | string;
    "visibility": number | string;
    "v-mathematical": number | string;
    "width": number | string;
    "widths": number | string;
    "word-spacing": number | string;
    "writing-mode": number | string;
    "x1": number | string;
    "x2": number | string;
    "x": number | string;
    "xChannelSelector": string;
    "xHeight": number | string;
    "xlink:actuate": string;
    "xlink:arcrole": string;
    "xlink:href": string;
    "xlink:role": string;
    "xlink:show": string;
    "xlink:title": string;
    "xlink:type": string;
    "xml:base": string;
    "xml:lang": string;
    "xml:space": string;
    "y1": number | string;
    "y2": number | string;
    "y": number | string;
    "yChannelSelector": string;
    "z": number | string;
    "zoomAndPan": string;
}

/** This is simply a tiny class that is used to manage the host duplication features in a consistent way.
 * - Each Host has a `.shadowAPI`, but it's the very same class instance for all the hosts that are duplicated - the original and any duplicates have the same instance here.
 * - This way, it doesn't matter who is the original source (or if it dies away). As long as the shadowAPI instance lives, the originality lives.
 */
declare class HostShadowAPI<Contexts extends ContextsAllType = {}> {
    /** These are the Host instances that share the common duplication basis. Note that only appear here once mounted (and disappear once cleaned up). */
    hosts: Set<Host<Contexts>>;
    /** These are the duplicatable contexts (by names). Any time a Host is duplicated, it will get these contexts automatically. */
    contexts: Partial<Contexts>;
}

/** Class type for HostContextAPI. */
interface HostContextAPIType<Contexts extends ContextsAllType = {}> extends AsClass<ContextAPIType<Contexts>, HostContextAPI<Contexts>, []> {
}
/** The Host based ContextAPI simply adds an extra argument to the setContext and setContexts methods for handling which contexts are auto-assigned to duplicated hosts.
 * - It also has the afterRefresh method assign to the host's cycles.
 */
interface HostContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {
    /** The Host that this ContextAPI is attached to. Should be set manually after construction.
     * - It's used for two purposes: 1. Marking duplicatable contexts to the Host's shadowAPI, 2. syncing to the host refresh (with the afterRefresh method).
     * - It's assigned as a member to write HostContextAPI as a clean class.
     */
    host: Host<Contexts>;
    /** Attach the context to this ContextAPI by name. Returns true if did attach, false if was already there.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     * - Note that this method is extended on the HostContextAPI to include markAsDuplicatable option (defaults to false).
     *      * If set to true, will also modify the host.shadowAPI.contexts: if has a context adds there, if null or undefined removes from there.
     *      * It's a dictionary used for auto-assigning contexts to a new duplicated host - requires `host.settings.duplicatableHost: true`.
     */
    setContext<Name extends keyof Contexts & string>(name: Name, context: Contexts[Name] | null | undefined, callDataIfChanged?: boolean, markAsDuplicatable?: boolean): boolean;
    /** Set multiple named contexts in one go. Returns true if did changes, false if didn't. This will only modify the given keys.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     * - Note that this method is extended on the HostContextAPI to include markAsDuplicatable option (defaults to false).
     *      * If set to true, will also modify the host.shadowAPI.contexts: if has a context adds there, if null or undefined removes from there.
     *      * It's a dictionary used for auto-assigning contexts to a new duplicated host - requires `host.settings.duplicatableHost: true`.
     */
    setContexts(contexts: Partial<{
        [CtxName in keyof Contexts]: Contexts[CtxName] | null | undefined;
    }>, callDataIfChanged?: boolean, markAsDuplicatable?: boolean): boolean;
    /** This triggers a refresh and returns a promise that is resolved when the Host's update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately.
     * - This uses the signals system, so the listener is called among other listeners depending on the adding order.
     */
    afterRefresh(fullDelay?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void>;
    /** Attached to provide adding all component based signals. Note that will skip any components that have the given context name overridden. If signalName omitted gets all for context. */
    getListenersFor<CtxName extends string & keyof Contexts>(ctxName: CtxName, signalName?: string & keyof Contexts[CtxName]["_Signals"]): SignalListener[] | undefined;
    /** Attached to provide adding all component based data listeners. Note that will skip any components that have all of those names overridden. */
    callDataListenersFor(ctxDataKeys?: true | GetJoinedDataKeysFrom<GetDataFromContexts<Contexts>>[]): void;
}
declare class HostContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {
    awaitDelay(): Promise<void>;
    static getListenersFor(contextAPI: HostContextAPI, ctxName: string, signalName?: string): SignalListener[] | undefined;
    static callDataListenersFor(contextAPI: HostContextAPI, ctxDataKeys?: true | string[]): void;
}

/** Typing for a SpreadFunc: It's like a Component, except it's spread out immediately on the parent render scope when defined. */
type SpreadFunc<Props extends Record<string, any> = {}> = (props: Props) => MixDOMRenderOutput;
/** Typing for a SpreadFunc with extra arguments. Note that it's important to define the JS side as (props, ...args) so that the func.length === 1.
 * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
 */
type SpreadFuncWith<Props extends Record<string, any> = {}, ExtraArgs extends any[] = any[]> = (props: Props, ...args: ExtraArgs) => MixDOMRenderOutput;
/** The spread component props. */
interface ComponentSpreadProps extends Pick<MixDOMPreBaseProps, "_disable" | "_key"> {
}
/** There is no actual class for ComponentSpread. It's not even a real component, but only spreads out the defs instantly on the static side. */
interface ComponentSpread<Props extends Record<string, any> = {}> extends SpreadFunc<Props> {
}
/** Create a SpreadFunc - it's actually just a function with 0 or 1 arguments: (props?).
 * - It's the most performant way to render things (no lifecycle, just spread out with its own pairing scope).
 * - Note that this simply gives back the original function, unless it has more than 1 arguments, in which case an intermediary function is created.
 *      * This intermediary function actually supports feeding in more arguments - this works since a func with (props, ...args) actually has length = 1.
 *      * If you want to include the props and extra arguments typing into the resulting function use the createSpreadWith function instead (it also automatically reads the types).
 */
declare const createSpread: <Props extends Record<string, any> = {}>(func: (props: Props, ...args: any[]) => MixDOMRenderOutput) => SpreadFunc<Props>;
/** Create a SpreadFunc by automatically reading the types for Props and ExtraArgs from the given function. See createSpread for details.
 * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
 */
declare const createSpreadWith: <Props extends Record<string, any>, ExtraArgs extends any[]>(func: (props: Props, ...args: ExtraArgs) => MixDOMRenderOutput) => SpreadFuncWith<Props, ExtraArgs>;

/** Type for Component class instance with ContextAPI. Also includes the signals that ContextAPI brings. */
interface ComponentCtx<Info extends Partial<ComponentInfo> = {}> extends Component<Info> {
    contextAPI: ComponentContextAPI<Info["contexts"] & {}>;
}
/** Type for Component class type with ContextAPI. Also includes the signals that ContextAPI brings. */
type ComponentTypeCtx<Info extends Partial<ComponentInfo> = {}> = Component<Info> & Info["class"];
/** Type for Component function with ContextAPI. Also includes the signals that ContextAPI brings. */
type ComponentFuncCtx<Info extends Partial<ComponentInfo> = {}> = ((initProps: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentCtx<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & {
    _Info?: Info;
};
interface ComponentContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {
    /** The Host that this ContextAPI is related to (through the component). Should be set manually after construction.
     * - It's used for two purposes: 1. Inheriting contexts, 2. syncing to the host refresh (with the afterRefresh method).
     * - It's assigned as a member to write ComponentContextAPI as a clean class.
     */
    host: Host<Contexts>;
    /** Get the named context for the component.
     * - Note that for the ComponentContextAPI, its local bookkeeping will be used primarily. If a key is found there it's returned (even if `null`).
     * - Only if the local bookkeeping gave `undefined` will the inherited contexts from the host be used, unless includeInherited is set to `false` (defaults to `true`).
     */
    getContext<Name extends keyof Contexts & string>(name: Name, includeInherited?: boolean): Contexts[Name] | null | undefined;
    /** Get the contexts for the component, optionally only for given names.
     * - Note that for the ComponentContextAPI, its local bookkeeping will be used primarily. If a key is found there it's returned (even if `null`).
     * - Only if the local bookkeeping gave `undefined` will the inherited contexts from the host be used, unless includeInherited is set to `false` (defaults to `true`).
     */
    getContexts<Name extends keyof Contexts & string>(onlyNames?: SetLike<Name> | null, includeInherited?: boolean): Partial<Record<string, Context | null>> & Partial<ContextsAllTypeWith<Contexts>>;
    /** This triggers a refresh and returns a promise that is resolved when the Component's Host's update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately.
     * - This uses the signals system, so the listener is called among other listeners depending on the adding order.
     */
    afterRefresh(fullDelay?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void>;
}
/** Component's ContextAPI allows to communicate with named contexts using their signals and data systems. */
declare class ComponentContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {
    host: Host<Contexts>;
    getContexts<Name extends keyof Contexts & string>(onlyNames?: SetLike<Name> | null, includeInherited?: boolean, skipNulls?: true): Partial<ContextsAllTypeWith<Contexts, never, Name>>;
    getContexts<Name extends keyof Contexts & string>(onlyNames?: SetLike<Name> | null, includeInherited?: boolean, skipNulls?: boolean | never): Partial<ContextsAllTypeWith<Contexts, null, Name>>;
    /** At ComponentContextAPI level, awaitDelay is hooked up to awaiting host's render cycle. */
    awaitDelay(): Promise<void>;
}

/** Typing infos for Components. */
interface ComponentInfo<Props extends Record<string, any> = {}, State extends Record<string, any> = {}, Class extends Record<string, any> = {}, Signals extends Record<string, (...args: any[]) => any> = {}, Timers extends any = any, Contexts extends ContextsAllType = {}> {
    /** Typing for the props for the component - will be passed by parent. */
    props: Props;
    /** Typing for the local state of the component. */
    state: State;
    /** Only for functional components - can type extending the component with methods and members.
     * - For example: `{ class: { doSomething(what: string): void; }; }`
     * - And then `(initProps, component) => { component.doSomething = (what) => { ... } }`
     */
    class: Class;
    /** Typed signals. For example `{ signals: { onSomething: (what: string) => void; }; }`.
     * - Note that these are passed on to the props._signals typing. However props._signals will not actually be found inside the render method.
     */
    signals: Signals;
    /** Typing for timers. Usually strings but can be anything. */
    timers: Timers;
    /** Typing for the related contexts: a dictionary where keys are context names and values are each context.
     * - The actual contexts can be attached directly on the Component using its contextAPI or _contexts prop, but they are also secondarily inherited from the Host.
     */
    contexts: Contexts;
}
/** Empty component info type. */
type ComponentInfoEmpty = {
    props?: {};
    state?: {};
    class?: {};
    signals?: {};
    timers?: {};
    contexts?: {};
};
/** This declares a Component class instance but allows to input the Infos one by one: <Props, State, Class, Signals, Timers, Contexts> */
interface ComponentOf<Props extends Record<string, any> = {}, State extends Record<string, any> = {}, Class extends Record<string, any> = {}, Signals extends Record<string, (...args: any[]) => any> = {}, Timers extends any = {}, Contexts extends ContextsAllType = {}> extends Component<ComponentInfo<Props, State, Class, Signals, Timers, Contexts>> {
}
/** This declares a Component class type but allows to input the Infos one by one: <Props, State, Class, Signals, Timers, Contexts> */
interface ComponentTypeOf<Props extends Record<string, any> = {}, State extends Record<string, any> = {}, Class extends Record<string, any> = {}, Signals extends Record<string, (...args: any[]) => any> = {}, Timers extends any = {}, Contexts extends ContextsAllType = {}> extends ComponentType<ComponentInfo<Props, State, Class, Signals, Timers, Contexts>> {
}
/** This declares a ComponentFunc but allows to input the Infos one by one: <Props, State, Class, Signals, Timers, Contexts> */
type ComponentFuncOf<Props extends Record<string, any> = {}, State extends Record<string, any> = {}, Class extends Record<string, any> = {}, Signals extends Record<string, (...args: any[]) => any> = {}, Timers extends any = any, Contexts extends ContextsAllType = {}> = (initProps: MixDOMPreComponentOnlyProps<Signals> & Props, component: Component<ComponentInfo<Props, State, Class, Signals, Timers, Contexts>> & Class, contextAPI: ComponentContextAPI<Contexts>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;
/** Type for anything that from which component info can be derived. */
type ComponentInfoInterpretable = Partial<ComponentInfo> | {
    _Info?: Partial<ComponentInfo>;
} | Component | ComponentType | ComponentFunc | SpreadFunc;
/** Robust component info reader from any kind of type: info object, component class type or instance, component function or spread function. Define BaseInfo to enforce the known outcome, eg. using ComponentInfoEmpty. */
type ReadComponentInfo<Anything, BaseInfo extends Record<string, any> = {}> = BaseInfo & (Anything extends {
    _Info?: Partial<ComponentInfo>;
} | undefined ? (Anything & {})["_Info"] : Anything extends {
    constructor: {
        _Info?: Partial<ComponentInfo>;
    };
} | undefined ? (Anything & {})["constructor"]["_Info"] : Anything extends ClassType<{
    constructor: {
        _Info?: Partial<ComponentInfo>;
    };
}> | undefined ? InstanceType<(Anything & {})>["constructor"]["_Info"] : Anything extends ((...args: any[]) => any | void) | undefined ? ReadComponentInfoFromArgsReturn<Parameters<(Anything & {})>, ReturnType<Anything & {}>> : Anything extends Partial<ComponentInfo> ? Anything : {});
/** Read merged info from multiple anythings inputted as an array. */
type ReadComponentInfos<Anythings extends any[], BaseInfo extends Record<string, any> = {}, Index extends number = Anythings["length"], Collected extends Partial<ComponentInfo> = {}> = Index extends 0 ? Collected & BaseInfo : ReadComponentInfos<Anythings, BaseInfo, IterateBackwards[Index], Collected & ReadComponentInfo<Anythings[IterateBackwards[Index]]>>;
/** For mixing components together, this reads any kind of info that refers to mixable's "_Required" part (in any form from anything, supporting mixables and HOCs).
 * - The _Required info indicates what the mixable component requires before it in the mixing chain.
 * - The actual info in _Required can be info or a componentfunc with info or such, but in here we read only the component info part from it.
 */
type ReadComponentRequiredInfo<Anything, BaseInfo extends Record<string, any> = {}> = Anything extends {
    _Required?: ComponentInfoInterpretable;
} | undefined ? ReadComponentInfo<(Anything & {})["_Required"], BaseInfo> : Anything extends {
    constructor: {
        _Required?: ComponentInfoInterpretable;
    };
} | undefined ? ReadComponentInfo<(Anything & {})["constructor"]["_Required"], BaseInfo> : Anything extends ClassType<{
    constructor: {
        _Required?: ComponentInfoInterpretable;
    };
}> | undefined ? ReadComponentInfo<InstanceType<(Anything & {})>["constructor"]["_Required"], BaseInfo> : Anything extends ((...args: any[]) => any | void) | undefined ? Anything extends (Base: ComponentTypeAny) => ComponentTypeAny ? ReadComponentInfo<Parameters<Anything>[0], BaseInfo> : Parameters<(Anything & {})> extends [Record<string, any> | undefined, {
    constructor: {
        _Required?: ComponentInfoInterpretable;
    };
}] ? ReadComponentInfo<Parameters<(Anything & {})>[1]["constructor"]["_Required"], BaseInfo> : BaseInfo : BaseInfo;
/** Reads component info based on function's arguments, or return (for mixables). Provides BaseInfo to enforce the type. */
type ReadComponentInfoFromArgsReturn<Params extends any[], Return extends any = void> = Params extends [Record<string, any> | undefined, {
    constructor: {
        _Info?: Partial<ComponentInfo>;
    };
}, ...any[]] ? Params[1]["constructor"]["_Info"] : Params extends [ComponentTypeAny] ? Return extends ComponentTypeAny ? ReadComponentInfo<Return> : {} : Params extends [Record<string, any>] ? {
    props: Params[0];
} : {};

/** Either type of functional component: spread or a full component (with optional contextAPI). */
type ComponentFuncAny<Info extends Partial<ComponentInfo> = {}> = ComponentFunc<Info> | SpreadFunc<Info["props"] & {}>;
/** Either a class type or a component func (not a spread func, nor a component class instance). */
type ComponentTypeEither<Info extends Partial<ComponentInfo> = {}> = ComponentType<Info> | ComponentFunc<Info>;
/** This is a shortcut for all valid MixDOM components: class, component func or a spread func. Not including class instances, only types.
 * - Hint. You can use this in props: `{ ItemRenderer: ComponentTypeAny<Info>; }` and then just insert it by `<props.ItemRenderer {...itemInfo} />`
 */
type ComponentTypeAny<Info extends Partial<ComponentInfo> = {}> = ComponentType<Info> | ComponentFunc<Info> | SpreadFunc<Info["props"] & {}>;
/** Get the component instance type from component class type or component function, with optional fallback (defaults to Component). */
type ComponentInstanceType<CompType extends ComponentType | ComponentFunc, Fallback = Component> = [CompType] extends [ComponentFunc] ? Component<ReadComponentInfo<CompType>> : [CompType] extends [ComponentType] ? InstanceType<CompType> : Fallback;
/** Get a clean Component class instance type from anything (info, class type/instance, func, spread, HOC, mixin, mixable func, ...). Enforces the "class" requirements. */
type GetComponentFrom<Anything> = Component<ReadComponentInfo<Anything, ComponentInfoEmpty>> & ReadComponentInfo<Anything, ComponentInfoEmpty>["class"];
/** Get a clean Component class type (non-instanced) from anything (info, class type/instance, func, spread, HOC, mixin, mixable func, ...). Enforces the "class" requirements. */
type GetComponentTypeFrom<Anything> = ComponentType<ReadComponentInfo<Anything, ComponentInfoEmpty>>;
/** Get a clean Component function type from anything (info, class type/instance, func, spread, HOC, mixin, mixable func, ...). Enforces the "class" requirements. */
type GetComponentFuncFrom<Anything> = ComponentFunc<ReadComponentInfo<Anything, ComponentInfoEmpty>>;
type ComponentHOC<RequiredType extends ComponentTypeAny, FinalType extends ComponentTypeAny> = (InnerComp: RequiredType) => FinalType;
type ComponentHOCBase = (InnerComp: ComponentTypeAny) => ComponentTypeAny;
type ComponentMixinType<Info extends Partial<ComponentInfo> = {}, RequiresInfo extends Partial<ComponentInfo> = {}> = (Base: GetComponentTypeFrom<RequiresInfo>) => GetComponentTypeFrom<RequiresInfo & Info>;
type ComponentFuncRequires<RequiresInfo extends Partial<ComponentInfo> = {}, OwnInfo extends Partial<ComponentInfo> = {}> = ComponentFunc<RequiresInfo & OwnInfo> & {
    _Required?: ComponentFunc<RequiresInfo>;
};
type ComponentFuncMixable<RequiredFunc extends ComponentFunc = ComponentFunc, OwnInfo extends Partial<ComponentInfo> = {}> = ComponentFunc<ReadComponentInfo<RequiredFunc> & OwnInfo> & {
    _Required?: RequiredFunc;
};
/** Helper to test if the component info from the ExtendingAnything extends the infos from the previous component (BaseAnything) - typically in the mixing chain.
 * - In terms of infos, only compares the infos, does not test against what basic component class instances always have.
 * - Feed in the 3rd arg for RequireForm to require about whether should be a function, or class instance, class type, or whatever. (RequireForm defaults to any.)
 */
type ExtendsComponent<ExtendingAnything, BaseAnything, RequireForm = any> = [ExtendingAnything] extends [RequireForm] ? ReadComponentInfo<BaseAnything> extends ReadComponentRequiredInfo<ExtendingAnything> ? any : never : never;
/** Helper to test if the component info from the ExtendingAnything extends the merged infos from the previous components (BaseAnythings) - typically in the mixing chain.
 * - In terms of infos, only compares the infos, does not test against what basic component class instances always have.
 * - Feed in the 3rd arg for RequireForm to require about whether should be a function, or class instance, class type, or whatever. (RequireForm defaults to any.)
 */
type ExtendsComponents<ExtendingAnything, BaseAnythings extends any[], RequireForm = any> = [ExtendingAnything] extends [RequireForm] ? ReadComponentInfos<BaseAnythings> extends ReadComponentRequiredInfo<ExtendingAnything> ? any : never : never;

interface HostUpdateCycleInfo {
    updates: Set<SourceBoundary>;
}
interface HostRenderCycleInfo {
    rCalls: MixDOMSourceBoundaryChange[][];
    rInfos: MixDOMRenderInfo[][];
}
declare class HostServices {
    /** Dedicated render handler class instance. It's public internally, as it has some direct-to-use functionality: like pausing, resuming and hydration. */
    renderer: HostRender;
    /** Ref up. This whole class could be in host, but for internal clarity the more private and technical side is here. */
    host: Host;
    updateCycle: RefreshCycle<HostUpdateCycleInfo>;
    renderCycle: RefreshCycle<HostRenderCycleInfo>;
    /** A simple counter is used to create unique id for each boundary (per host). */
    private bIdCount;
    /** This is the target render definition that defines the host's root boundary's render output. */
    private rootDef;
    /** Temporary value (only needed for .onlyRunInContainer setting). */
    private _rootDisabled?;
    /** Temporary flag to mark while update process is in progress. */
    private _whileUpdating?;
    constructor(host: Host);
    /** This creates a new boundary id in the form of "h-hostId:b-bId", where hostId and bId are strings from the id counters. For example: "h-1:b:5"  */
    createBoundaryId(): MixDOMSourceBoundaryId;
    clearTimers(forgetPending?: boolean): void;
    createRoot(content: MixDOMRenderOutput): ComponentTypeAny;
    updateRoot(content: MixDOMRenderOutput, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    refreshRoot(forceUpdate?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    clearRoot(forgetPending?: boolean): void;
    getRootDef(shallowCopy?: boolean): MixDOMDefTarget | null;
    hasPending(updateSide?: boolean, postSide?: boolean): boolean;
    addRefreshCall(callback: () => void, renderSide?: boolean): void;
    cancelUpdates(boundary: SourceBoundary): void;
    /** This is the main method to update a boundary.
     * - It applies the updates to bookkeeping immediately.
     * - The actual update procedure is either timed out or immediate according to settings.
     *   .. It's recommended to use a tiny update timeout (eg. 0ms) to group multiple updates together. */
    absorbUpdates(boundary: SourceBoundary, updates: MixDOMComponentUpdates, refresh?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** This triggers the update cycle. */
    triggerRefresh(forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Update times without triggering a refresh. However, if forceUpdateTimeout is null, performs it instantly. */
    updateRefreshTimes(forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** This is the core whole command to update a source boundary including checking if it should update and if has already been updated.
     * - It handles the updates bookkeeping and should update checking and return infos for changes.
     * - It should only be called from a few places: 1. runUpdates flow above, 2. within applyDefPairs for updating nested, 3. HostServices.updatedInterestedInClosure for updating indirectly interested sub boundaries.
     * - If gives bInterested, it's assumed to be be unordered, otherwise give areOrdered = true. */
    updateBoundary(boundary: SourceBoundary, forceUpdate?: boolean | "all", movedNodes?: MixDOMTreeNode[], bInterested?: Set<SourceBoundary> | null): MixDOMChangeInfos | null;
    /** This absorbs infos from the updates done. Infos are for update calls and to know what to render. Triggers calling runRender. */
    absorbChanges(renderInfos: MixDOMRenderInfo[] | null, boundaryChanges?: MixDOMSourceBoundaryChange[] | null, forceRenderTimeout?: number | null): void;
    /** Initialize cycles. */
    static initializeCyclesFor(services: HostServices): void;
    /** This method should always be used when executing updates within a host - it's the main orchestrator of updates.
     * To add to post updates use the .absorbUpdates() method above. It triggers calling this with the assigned timeout, so many are handled together.
     */
    static runUpdateFor(services: HostServices, pending: HostUpdateCycleInfo, resolvePromise: (keepResolving?: boolean) => void): void;
    static runRenderFor(services: HostServices, pending: HostRenderCycleInfo, resolvePromise: (keepResolving?: boolean) => void): void;
    static shouldUpdateBy(boundary: SourceBoundary, prevProps: Record<string, any> | undefined, prevState: Record<string, any> | undefined): boolean;
    static callBoundariesBy(boundaryChanges: MixDOMSourceBoundaryChange[]): void;
}

/** The basic dom node cloning modes - either deep or shallow: element.clone(mode === "deep").
 * - If in "always" then is deep, and will never use the original. */
type MixDOMCloneNodeBehaviour = "deep" | "shallow" | "always";
type MixDOMRenderTextTagCallback = (text: string | number) => Node | null;
type MixDOMRenderTextContentCallback = (text: string | number) => string | number;
type MixDOMRenderTextTag = DOMTags | "" | MixDOMRenderTextTagCallback;
interface HostType<Contexts extends ContextsAllType = {}> {
    /** Used for host based id's. To help with sorting fluently across hosts. */
    idCount: number;
    new (content?: MixDOMRenderOutput, domContainer?: Node | null, settings?: HostSettingsUpdate | null): Host<Contexts>;
    modifySettings(baseSettings: HostSettings, newSettings: HostSettingsUpdate): void;
    getDefaultSettings(): HostSettings;
}
interface HostSettingsUpdate extends Partial<Omit<HostSettings, "updateComponentModes">> {
    updateComponentModes?: Partial<HostSettings["updateComponentModes"]>;
}
/** Settings for MixDOM behaviour for all inside a host instance.
 * The settings can be modified in real time: by host.updateSettings(someSettings) or manually, eg. host.settings.updateTimeout = null. */
interface HostSettings {
    /** If is null, then is synchronous. Otherwise uses the given timeout in ms. Defaults to 0ms.
     * - This timeout delays the beginning of the update process.
     *   * After the timeout has elapsed, .render() is called on components and a new structure is received.
     *   * The structure is then applied to the component, and for any nested components similarly .render() is called and then the defs applied recursively.
     *   * Finally, the process outputs a list of render callbacks to apply the related dom changes. Executing the changes can be delayed with the 2nd timeout: settings.renderTimeout.
     * - Note. Generally this helps to combine multiple updates together and thus prevent unnecessary updates.
     *   * This is useful if (due to complex app setup) you sometimes end up calling update multiple times for the same component.
     *     .. Without this, the update procedure would go through each time (and if rendering set to null, it as well).
     *     .. But with this, the updates get clumped together. For example, updating immediately after startup will not result in onUpdate, but only one onMount.
     * - Recommended usage for updateTimeout & renderTimeout:
     *   * For most cases, use updateTimeout: 0 and renderTimeout: 0 or null. Your main code line will run first, and rendering runs after (sync or async).
     *   * If you want synchronous updates on your components, use updateTimeout: null, renderTimeout: 0 - so updates are done before your main code line continues, but dom rendering is done after.
     *     .. In this case also consider putting useImmediateCalls to true.
     *   * If you want everything to be synchronous (including the dom), put both to null. */
    updateTimeout: number | null;
    /** If is null, then is synchronous. Otherwise uses the given timeout in ms. Defaults to 0ms.
     * - This timeout delays the actual dom rendering part of the component update process.
     * - It's useful to have a tiny delay to save from unnecessary rendering, when update gets called multiple times - even 0ms can help.
     * - Only use null renderTimeout (= synchronous rendering after updateTimeout) if you really want rendering to happen immediately after update.
     *     * Typically, you then also want the updateTimeout to be null (synchronous), so you get access to your dom elements synchronously.
     * - Note that renderTimeout happens after updateTimeout, so they both affect how fast rendering happens - see settings.updateTimeout for details. */
    renderTimeout: number | null;
    /** The lifecycle calls (onMount, onUpdate, ...) are collected (together with render infos) and called after the recursive update process has finished.
     * - This option controls whether the calls are made immediately after the update process or only after the (potentially delayed) rendering.
     * - Keep this as false, if you want the components to have their dom elements available upon onMount - like in React. (Defaults to false.)
     * - Put this to true, only if you really want the calls to be executed before the rendering happens.
     *     * If you combine this with updateTimeout: null, then you get synchronously updated state, with only rendering delayed.
     *     * However, you won't have dom elements on mount. To know when that happens should use refs or signals and .domDidMount and .domWillUnmount callbacks. */
    useImmediateCalls: boolean;
    /** Defines what components should look at when doing onShouldUpdate check for "props" and "state". */
    updateComponentModes: MixDOMUpdateCompareModesBy;
    /** Whether does a equalDOMProps check on the updating process.
     * - If true: Only adds render info (for updating dom props) if there's a need for it.
     * - If false: Always adds render info for updating dom elements. They will be diffed anyhow.
     * - If "if-needed": Then marks to be updated if had other rendering needs (move or content), if didn't then does equalDOMProps check. (So that if no need, don't mark render updates at all.)
     * Note that there is always a diffing check before applying dom changes, and the process only applies changes from last set.
     * .. In other words, this does not change at all what gets applied to the dom.
     * .. The only thing this changes, is whether includes an extra equalDOMProps -> boolean run during the update process.
     * .. In terms of assumed performance:
     * .... Even though equalDOMProps is an extra process, it's a bit faster to run than collecting diffs and in addition it can stop short - never add render info.
     * .... However, the only time it stops short is for not-equal, in which case it also means that we will anyway do the diff collection run later on.
     * .... In other words, it's in practice a matter of taste: if you want clean renderinfos (for debugging) use true. The default is "if-needed". */
    preCompareDOMProps: boolean | "if-needed";
    /** The maximum number of times a boundary is allowed to be render during an update due to update calls during the render func.
     * .. If negative, then there's no limit. If 0, then doesn't allow to re-render. The default is 1: allow to re-render once (so can render twice in a row).
     * .. If reaches the limit, stops re-rendering and logs a warning if devLogToConsole has .Warnings on. */
    maxReRenders: number;
    /** Which element (tag) to wrap texts (from props.children) into.
     * - By default, no wrapping is applied: treats texts as textNodes (instanceof Node).
     * - You can also pass in a callback to do custom rendering - should return a Node, or then falls back to textNode. */
    renderTextTag: MixDOMRenderTextTag;
    /** Tag to use for as a fallback when using the MixDOM.defHTML feature (that uses .innerHTML on a dummy element). Defaults to "span".
     * - It only has meaning, if the output contains multiple elements and didn't specifically define the container tag to use. */
    renderHTMLDefTag: DOMTags;
    /** If you want to process the simple content text, assign a callback here. */
    renderTextHandler: MixDOMRenderTextContentCallback | null;
    /** This defines how MixDOM will treat "simple content". The options are:
     *     1. When set to false (default), renders everything except null and undefined. (Other values are stringified.)
     *     2. When set to true, renders only values that doesn't amount to !!false. So skips: false and 0 as well.
     *     3. Third option is to give an array of values that should never be rendered.
     * Technical notes:
     *     - Regardless of the setting, MixDOM will always skip simple content of `null` and `undefined` (already at the static def creation level).
     *     - This setting applies as early as possible in the non-static side of process (in pairDefs routine).
     *     - How it works is that it will actually go and modify the target def by removing any unwanted child, before it would be paired.
     */
    noRenderValuesMode: boolean | any[];
    /** For svg content, the namespaceURI argument to be passed into createElementNS(namespaceURI, tag).
     * If none given, hard coded default is: "http://www.w3.org/2000/svg" */
    renderSVGNamespaceURI: string;
    /** When using MixDOM.Element to insert nodes, and swaps them, whether should apply (true), and if so whether should read first ("read").
     * Defaults to true, which means will apply based on scratch, but not read before it. */
    renderDOMPropsOnSwap: boolean | "read";
    /** This is useful for server side functionality. (Defaults to false, as most of the times you're using MixDOM on client side.)
     * - Put this to true, to disable the rendering aspects (will pause the dedicated HostRender instance). Instead use host.readAsString() or MixDOM.readAsString(treeNode) to get the html string.
     * - Note that you might want to consider putting settings.renderTimeout to null, so that the dom string is immediately renderable after the updates. */
    disableRendering: boolean;
    /** This is useful for nesting hosts.
     * - Put this to true to make nested but not currently grounded hosts be unmounted internally.
     * - When they are grounded again, they will mount and rebuild their internal structure from the rootBoundary up. */
    onlyRunInContainer: boolean;
    /** When pairing defs for reusing, any arrays are dealt as if their own key scope by default.
     * - By setting this to true, wide key pairing is allowed for arrays as well.
     * - Note that you can always use {...myArray} instead of {myArray} to avoid this behaviour (even wideKeysInArrays: false).
     *   .. In other words, if you do not want the keys in the array contents to mix widely, keep it as an array - don't spread it. */
    wideKeysInArrays: boolean;
    /** Default behaviour for handling duplicated instances of dom nodes.
     * - The duplication can happen due to manually inserting many, or due to multiple content passes, copies, or .getChildren().
     * - The detection is host based and simply based on whether the element to create was already grounded or not. */
    duplicateDOMNodeBehaviour: MixDOMCloneNodeBehaviour | "";
    /** Custom handler for the duplicateDOMNodeBehaviour. */
    duplicateDOMNodeHandler: ((domNode: Node, treeNode: MixDOMTreeNodeDOM) => Node | null) | null;
    /** Whether this host can be auto-duplicated when included dynamically multiple times. Defaults to false.
     * - Can also be a callback that returns a boolean (true to include, false to not), or a new host.
     * - Note that if uses a custom Host class, the new duplicate will be made from the normal Host class. Use the callback to provide manually.
     * - The treeNode in the arguments defines where would be inserted. */
    duplicatableHost: boolean | ((host: Host, treeNode: MixDOMTreeNodeHost) => Host | boolean | null);
    /** For weird behaviour. */
    devLogWarnings: boolean;
    /** Mostly for developing MixDOM.
     * - This log can be useful when testing how MixDOM behaves (in very small tests, not for huge apps) - eg. to optimize using keys.
     * - To get nice results, set preCompareDOMProps setting to `true`. */
    devLogRenderInfos: boolean;
}
/** This is the main class to orchestrate and start rendering. */
declare class Host<Contexts extends ContextsAllType = {}> {
    static MIX_DOM_CLASS: string;
    static idCount: number;
    ["constructor"]: HostType<Contexts>;
    /** This represents abstractly what the final outcome looks like in dom. */
    groundedTree: MixDOMTreeNode;
    /** The root boundary that renders whatever is fed to the host on .update or initial creation. */
    rootBoundary: SourceBoundary;
    /** The general settings for this host instance.
     * - Do not modify directly, use the .modifySettings method instead.
     * - Otherwise rendering might have old settings, or setting.onlyRunInContainer might be uncaptured. */
    settings: HostSettings;
    /** Internal services to keep the whole thing together and synchronized.
     * They are the semi-private internal part of Host, so separated into its own class. */
    services: HostServices;
    /** This is used for duplicating hosts. It's the very same instance for all duplicated (and their source, which can be a duplicated one as well). */
    shadowAPI: HostShadowAPI<Contexts>;
    /** This provides the data and signal features for this Host and all the Components that are part of it.
     * - You can use .contextAPI directly for external usage.
     * - When using from within components, it's best to use their dedicated methods (for auto-disconnection features). */
    contextAPI: HostContextAPI<Contexts>;
    /** This contains all the components that have a contextAPI assigned. Automatically updated, used internally. The info can be used for custom purposes (just don't modify). */
    contextComponents: Set<ComponentCtx>;
    constructor(content?: MixDOMRenderOutput, domContainer?: Node | null, settings?: HostSettingsUpdate | null, contexts?: Contexts | null, shadowAPI?: HostShadowAPI | null);
    /** Clear whatever has been previously rendered - destroys all boundaries inside the rootBoundary. */
    clearRoot(update?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Move the host root into another dom container. */
    moveRoot(newParent: Node | null, renderTimeout?: number | null): void;
    /** Update the previously render content with new render output definitions. */
    updateRoot(content: MixDOMRenderOutput, updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Triggers an update on the host root, optionally forcing it. This is useful for refreshing the container. */
    refreshRoot(forceUpdate?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Triggers a process that refreshes the dom nodes based on the current state.
     * - In case forceDOMRead is on will actually read from dom to look for real changes to be done.
     * - Otherwise just reapplies the situation - as if some updates had not been done.
     * - Note. This is a partly experimental feature - it's not assumed to be used in normal usage. */
    refreshDOM(forceDOMRead?: boolean, renderTimeout?: number | null): void;
    /** This triggers a refresh and returns a promise that is resolved when the update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately.
     * - Note that this uses the signals system, so the listener is called among other listeners depending on the adding order.
     */
    afterRefresh(renderSide?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void>;
    /** Update the refresh times without triggering update. Not however that if updates updateTimeout to `null`, will trigger the update cycle instantly if was pending. */
    updateRefreshTimes(updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** This is like afterRefresh but works with a callback, given as the first arg. (This is the core method for the feature.)
     * - Triggers a refresh and calls the callback once the update / render cycle is completed.
     * - If there's nothing pending, then will call immediately.
     * - Note that this uses the signals system, so the listener is called among other listeners depending on the adding order.
     */
    afterRefreshCall(callback: () => void, renderSide?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** This adds a one-shot callback to the refresh cycle (update / render) - without triggering refresh. (So like afterRefreshCall but without refreshing.) */
    addRefreshCall(callback: () => void, renderSide?: boolean): void;
    /** Trigger refreshing the host's pending updates and render changes. */
    triggerRefresh(updateTimeout?: number | null, renderTimeout?: number | null): void;
    /** Pause the rendering. Resume it by calling resume(), rehydrate() or rehydrateWith(). */
    pause(): void;
    /** Resume rendering - triggers rehydration. */
    resume(): void;
    /** Tells whether the rendering is currently paused or not. */
    isPaused(): boolean;
    /** This rehydrates the rendered defs with actual dom elements iterating down the groundedTree and the container (defaults to the host's container element).
     * - It supports reusing custom html elements from a custom "container" element as well. Note it should be the _containing_ element.
     * - In readAllMode will re-read the current dom props from the existing ones as well. Defaults to false.
     * - In smuggleMode will replace the existing elements with better ones from "from" - otherwise only tries to fill missing ones. Defaults to false.
     * - In destroyOthersMode will destroy the other unused elements found in the container. Defaults to false. Note. This can be a bit dangerous.
     * - This also resumes rendering if was paused - unless is disableRendering is set to true in host settings.
     */
    rehydrate(container?: Node | null, readAllMode?: boolean, smuggleMode?: boolean, destroyOthersMode?: boolean, validator?: MixDOMHydrationValidator, suggester?: MixDOMHydrationSuggester): void;
    /** This accepts new render content to update the groundedTree first and then rehydrates accordingly. See rehydrate method for details of the other arguments.
     * - Functions synchronously, so applies all updates and rendering immediately.
     * - Note that like rehydrate this also resumes paused state. (And works by: 1. pause, 2. update, 3. rehydrate.) */
    rehydrateWith(content: MixDOMRenderOutput, container?: Node | null, readAllMode?: boolean, smuggleMode?: boolean, destroyOthersMode?: boolean, validator?: MixDOMHydrationValidator, suggester?: MixDOMHydrationSuggester): void;
    /** Read the whole rendered contents as a html string. Typically used with settings.disableRendering (and settings.renderTimeout = null). */
    readAsString(): string;
    /** Get the root dom node (ours or by a nested boundary) - if has many, the first one (useful for insertion). */
    getRootElement(): Node | null;
    /** Get all the root dom nodes - might be many if used with a fragment.
     * - Optionally define whether to search in nested boundaries or not (by default does). */
    getRootElements(inNestedBoundaries?: boolean): Node[];
    /** Get the first dom element by a selectors within the host (like document.querySelector). Should rarely be used, but it's here if needed. */
    queryElement<T extends Element = Element>(selectors: string, overHosts?: boolean): T | null;
    /** Get dom elements by a selectors within the host (like document.querySelectorAll). Should rarely be used, but it's here if needed. */
    queryElements<T extends Element = Element>(selectors: string, maxCount?: number, overHosts?: boolean): T[];
    /** Find all dom nodes by an optional validator. */
    findElements<T extends Node = Node>(maxCount?: number, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): T[];
    /** Find all components by an optional validator. */
    findComponents<Comp extends ComponentTypeAny = ComponentTypeAny>(maxCount?: number, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): Comp[];
    /** Find all treeNodes by given types and an optional validator. */
    findTreeNodes(types: SetLike<MixDOMTreeNodeType>, maxCount?: number, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[];
    /** Modify previously given settings with partial settings.
     * - Note that if any value in the dictionary is `undefined` uses the default setting.
     * - Supports handling the related special cases:
     *      * `onlyRunInContainer`: Refreshes whether is visible or not (might destroy all / create all, if needed).
     */
    modifySettings(settings: HostSettingsUpdate, passToDuplicated?: boolean): void;
    static modifySettings(base: HostSettings, newSettings: HostSettingsUpdate, useDefaults?: boolean): void;
    static getDefaultSettings(): HostSettings;
}
/** Create a new host and start rendering into it. */
declare const newHost: <Contexts extends ContextsAllType = {}>(content?: MixDOMRenderOutput, container?: HTMLElement | null, settings?: HostSettingsUpdate | null, contexts?: Contexts | undefined) => Host<Contexts>;

type HostRenderSettings = Pick<HostSettings, "renderTextHandler" | "renderTextTag" | "renderHTMLDefTag" | "renderSVGNamespaceURI" | "renderDOMPropsOnSwap" | "noRenderValuesMode" | "disableRendering" | "duplicateDOMNodeHandler" | "duplicateDOMNodeBehaviour" | "devLogWarnings" | "devLogRenderInfos">;
declare class HostRender {
    /** Detect if is running in browser or not. */
    inBrowser: boolean;
    /** Root for pausing. */
    hydrationRoot: MixDOMTreeNode | null;
    /** Pausing. When resumes, rehydrates. */
    paused: boolean;
    /** When paused, if has any infos about removing elements, we store them - so that we can call unmount (otherwise the treeNode ref is lost). */
    pausedPending?: MixDOMRenderInfo[];
    /** Collection of settings. */
    settings: HostRenderSettings;
    /** To keep track of featured external dom elements. */
    externalElements: Set<Node>;
    constructor(settings: HostRenderSettings, hydrationRoot?: MixDOMTreeNode);
    /** Pause the renderer from receiving updates. */
    pause(): void;
    /** Resume the renderer after pausing. Will rehydrate dom elements and reapply changes to them.
     * Note that calling resume will unpause rendering even when settings.disableRendering is set to true. */
    resume(): void;
    /** This rehydrates the rendered defs with actual dom elements.
     * - It supports reusing custom html elements from within the given "container" element - it should be the _containing_ element. You should most often use the host's container element.
     * - In smuggleMode will replace the existing elements with better ones from "from" - otherwise only tries to fill missing ones.
     * - In destroyOthersMode will destroy the unused elements found in the container.
     * - In readAllMode will re-read the current dom props from the existing ones as well.
     * - This also resumes rendering if was paused - unless is disableRendering is set to true in host settings.
     */
    rehydrate(container?: Node | null, readAllMode?: boolean, smuggleMode?: boolean, destroyOthersMode?: boolean, validator?: MixDOMHydrationValidator | null, suggester?: MixDOMHydrationSuggester | null): void;
    /** The main method to apply renderInfos. Everything else in here serves this.
     * - Note that all the infos in a single renderInfos array should be in tree order. (Happens automatically by the update order.)
     * - Except emptyMove's should be prepended to the start, and destructions appended to the end (<- happens automatically due to clean up being after).
     */
    applyToDOM(renderInfos: MixDOMRenderInfo[]): void;
    private getApprovedNode;
    private createDOMNodeBy;
    static SIMPLE_TAGS: string[];
    static SPECIAL_PROPS: Record<string, "other" | "render" | undefined>;
    static PASSING_TYPES: Partial<Record<MixDOMTreeNodeType | MixDOMDefType, true>>;
    static LISTENER_PROPS: Record<keyof ListenerAttributesAll, (e: Event) => void>;
    /** Using the bookkeeping logic, find the parent node and next sibling as html insertion targets. */
    static findInsertionNodes(treeNode: MixDOMTreeNode): [Node, Node | null] | [null, null];
    /** This should be called (after the dom action) for each renderInfo that has action: "create" / "move" / "remove" / "swap" (and on "content" if changed node).
     * - The respective action is defined by whether gives a domNode or null. If null, it's remove, otherwise it's like moving (for creation too).
     * - In either case, it goes and updates the bookkeeping so that each affected boundary always has a .domNode reference that points to its first element.
     * - This information is essential (and as minimal as possible) to know where to insert new domNodes in a performant manner. (See above findInsertionNodes().)
     * - Note that if the whole boundary unmounts, this is not called. Instead the one that was "moved" to be the first one is called to replace this.
     *   .. In dom sense, we can skip these "would move to the same point" before actual dom moving, but renderInfos should be created - as they are automatically by the basic flow. */
    static updateDOMChainBy(fromTreeNode: MixDOMTreeNode, domNode: Node | null, fromSelf?: boolean): void;
    /** This reads the domProps (for MixDOMTreeNodeDOM) from a domNode. Skips listeners, but supports class, style and data. */
    static readFromDOM(domNode: HTMLElement | SVGElement | Node): MixDOMProcessedDOMProps;
    /** Returns a single html element.
     * - In case, the string refers to multiple, returns a fallback element containing them - even if has no content. */
    static domNodeFrom(innerHTML: string, fallbackTagOrEl?: DOMTags | HTMLElement, keepTag?: boolean): Node | null;
    /** Apply properties to dom elements for the given treeNode. Returns [ appliedProps, domElement, diffs? ]. */
    static domApplyProps(treeNode: MixDOMTreeNodeDOM, logWarnings?: boolean): [MixDOMProcessedDOMProps, Element | SVGElement | null, MixDOMDOMDiffs?];
    /**
     * - With "-" as replaceBy, functions like this: "testProp" => "test-prop", and "TestProp" => "-test-prop".
     * - This behaviour mirrors how element.dataset[prop] = value works. For example: data.TestProp = true   =>   <div data--test-prop="true" />
     */
    static decapitalizeString(str: string, replaceBy?: string): string;
    /** This returns the content inside a root tree node as a html string. */
    static readAsString(treeNode: MixDOMTreeNode): string;
    /** This returns a suitable virtual item from the structure.
     * - Tries the given vItem, or if used its children.
     * - Can use an optional suggester that can suggest some other virtual item or a direct dom node.
     *   * Any suggestions (by the callback or our tree structure) must always have matching tag and other some requirements.
     *   * If suggests a virtual item it must fit the structure. If suggests a dom node, it can be from anywhere basically - don't steal from another host.
     * - Can also use an optional validator that should return true to accept, false to not accept. It's the last one in the chain that can say no.
     * - DEV. NOTE. This is a bit SKETCHY.
     */
    static getTreeNodeMatch(treeNode: MixDOMTreeNodeDOM, vItem: MixDOMHydrationItem | null, vKeyedByTags?: Partial<Record<DOMTags, MixDOMHydrationItem[]>>, excludedNodes?: Set<Node> | null, validator?: MixDOMHydrationValidator | null, suggester?: MixDOMHydrationSuggester | null): MixDOMHydrationItem | Node | null;
    private static isVirtualItemOk;
}

type ComponentSignals<Info extends Partial<ComponentInfo> = {}> = {
    /** Special call - called right after constructing. */
    preMount: () => void;
    /** Callback that is fired after the initial rendering has been done and elements are in the dom. After any further updates onUpdate (and onPreUpdate and onShouldUpdate) are called. */
    didMount: () => void;
    /** This is a callback that will always be called when the component is checked for updates.
     * - Note that this is not called on mount, but will be called everytime on update when it's time to check whether should update or not - regardless of whether will actually update.
     * - This is the perfect place to use Memos to, as you can modify the state immediately and the mods will be included in the current update run. Access the new values in component.props and component.state (new props are set right before, and state read right after).
     *   .. Note that you can also use Memos on the render scope. The only difference is that the render method will be called again immediately after (but likewise included in the same update run). */
    beforeUpdate: () => void;
    /** Callback to determine whether should update or not.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     * - If returns true, component will update. If false, will not.
     * - If returns null (or no onShouldUpdate method assigned), will use the rendering settings to determine.
     * - Note that this is not called every time necessarily (never on mount, and not if was forced).
     * - Note that this is called right before onPreUpdate and the actual update (if that happens).
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before.
     * - Note that due to handling return value, emitting this particular signal is handled a bit differently. If any says true, will update, otherwise will not. */
    shouldUpdate: (prevProps: Info["props"] | undefined, prevState: Info["state"] | undefined) => boolean | null;
    /** This is a callback that will always be called when the component is checked for updates. Useful to get a snapshot of the situation.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     * - Note that this is not called on mount, but will be called everytime on update, even if will not actually update (use the 3rd param).
     * - Note that this will be called right after onShouldUpdate (if that is called) and right before the update happens.
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before. */
    preUpdate: (prevProps: Info["props"] | undefined, prevState: Info["state"] | undefined, willUpdate: boolean) => void;
    /** Called after the component has updated and changes been rendered into the dom.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it. */
    didUpdate: (prevProps: Info["props"] | undefined, prevState: Info["state"] | undefined) => void;
    /** Called when the component has moved in the tree structure. */
    didMove: () => void;
    /** Called when the component is about to be ungrounded: removed from the tree and dom elements destroyed. */
    willUnmount: () => void;
};
type ComponentExternalSignalsFor<Comp extends Component = Component, CompSignals extends Record<string, (...args: any[]) => any | void> = ComponentSignals<Comp["constructor"]["_Info"] & {}> & (Comp["constructor"]["_Info"] & {} & {
    signals: {};
})["signals"]> = {
    [SignalName in keyof CompSignals]: (comp: Comp, ...params: Parameters<CompSignals[SignalName]>) => ReturnType<CompSignals[SignalName]>;
};
type ComponentExternalSignals<Comp extends Component = Component> = {
    /** Special call - called right after constructing the component instance. */
    preMount: (component: Comp) => void;
    /** Callback that is fired after the initial rendering has been done and elements are in the dom. After any further updates onUpdate (and onPreUpdate and onShouldUpdate) are called. */
    didMount: (component: Comp) => void;
    /** This is a callback that will always be called when the component is checked for updates.
     * - Note that this is not called on mount, but will be called everytime on update when it's time to check whether should update or not - regardless of whether will actually update.
     * - This is the perfect place to use Memos to, as you can modify the state immediately and the mods will be included in the current update run. Access the new values in component.props and component.state.
     *   .. Note that you can also use Memos on the render scope. The only difference is that the render method will be called again immediately after (but likewise included in the same update run). */
    beforeUpdate: (component: Comp) => void;
    /** Callback to determine whether should update or not.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     * - If returns true, component will update. If false, will not.
     * - If returns null (or no onShouldUpdate method assigned), will use the rendering settings to determine.
     * - Note that this is not called every time necessarily (never on mount, and not if was forced).
     * - Note that this is called right before onPreUpdate and the actual update (if that happens).
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before.
     * - Note that due to handling return value, emitting this particular signal is handled a bit differently. If any says true, will update, otherwise will not. */
    shouldUpdate: (component: Comp, prevProps: (Comp["constructor"]["_Info"] & {
        props?: {};
    })["props"], prevState: (Comp["constructor"]["_Info"] & {
        state?: {};
    })["state"]) => boolean | null;
    /** This is a callback that will always be called when the component is checked for updates. Useful to get a snapshot of the situation.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     * - Note that this is not called on mount, but will be called everytime on update, even if will not actually update (use the 3rd param).
     * - Note that this will be called right after onShouldUpdate (if that is called) and right before the update happens.
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before. */
    preUpdate: (component: Comp, prevProps: (Comp["constructor"]["_Info"] & {
        props?: {};
    })["props"], prevState: (Comp["constructor"]["_Info"] & {
        state?: {};
    })["state"], willUpdate: boolean) => void;
    /** Called after the component has updated and changes been rendered into the dom.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     */
    didUpdate: (component: Comp, prevProps: (Comp["constructor"]["_Info"] & {
        props?: {};
    })["props"], prevState: (Comp["constructor"]["_Info"] & {
        state?: {};
    })["state"]) => void;
    /** Called when the component has moved in the tree structure. */
    didMove: (component: Comp) => void;
    /** Called when the component is about to be ungrounded: removed from the tree and dom elements destroyed. */
    willUnmount: (component: Comp) => void;
};

interface MixDOMPrePseudoProps {
    /** Disable the def altogether - including all contents inside. (Technically makes the def amount to null.) */
    _disable?: boolean;
    /** Attach key for moving the def around. */
    _key?: any;
}
interface PseudoFragmentProps extends MixDOMPrePseudoProps {
}
/** Fragment represent a list of render output instead of stuff under one root.
 * Usage example: `<MixDOM.Fragment><div/><div/></MixDOM.Fragment>` */
declare class PseudoFragment<Props extends PseudoFragmentProps = PseudoFragmentProps> {
    static MIX_DOM_CLASS: string;
    readonly props: Props;
    constructor(_props: Props);
}
interface PseudoPortalProps extends MixDOMPrePseudoProps {
    container: Node | null;
}
/** Portal allows to insert the content into a foreign dom node.
 * Usage example: `<MixDOM.Portal container={myDOMElement}><div/></MixDOM.Portal>` */
declare class PseudoPortal<Props extends PseudoPortalProps = PseudoPortalProps> {
    static MIX_DOM_CLASS: string;
    readonly props: Props;
    constructor(_props: Props);
}
type PseudoElementProps<Tag extends DOMTags = DOMTags> = MixDOMPreDOMTagProps<Tag> & {
    element: HTMLElement | SVGElement | null;
    /** Determines what happens when meeting duplicates.
     * - If == null, uses the Host based setting.
     * - If boolean, then is either "deep" or nothing. */
    cloneMode?: boolean | MixDOMCloneNodeBehaviour | null;
};
/** This allows to use an existing dom element as if it was part of the system.
 * So you can modify its props and such. */
declare class PseudoElement<Tag extends DOMTags = DOMTags, Props extends PseudoElementProps<Tag> = PseudoElementProps<Tag>> {
    static MIX_DOM_CLASS: string;
    readonly props: Props;
    constructor(_props: Props);
}
/** Empty dummy component that accepts any props, but always renders null. */
interface PseudoEmptyProps extends Record<string, any> {
}
declare class PseudoEmpty<Props extends PseudoEmptyProps = PseudoEmptyProps> {
    static MIX_DOM_CLASS: string;
    readonly props: Props;
    constructor(_props: Props);
    render(): MixDOMRenderOutput;
}
/** This is an empty dummy remote class:
 * - Its purpose is to make writing render output easier (1. no empty checks, and 2. for typing):
 *     * For example: `const MyRemote = component.state.PopupRemote || MixDOM.EmptyRemote;`
 *     * You can then access the Content and ContentCopy members, and copyContent(key) and withContent(...contents) methods fluently.
 * - However, they will just return null, so won't have any effect on anything.
 *     * Note also that technically speaking this class extends PseudoEmpty.
 *     * And it only adds the 2 public members (Content and ContentCopy) and 2 public methods (copycontent and withContent).
 *     * Due to not actually being a remote, it will never be used as a remote. It's just a straw dog.
 * - If you need to distinguish between real and fake, use `isRemote()` method. The empty returns false.
 *     * For example, to set specific content listening needs, you can use a memo - run it on render or .onBeforeUpdate callback.
 *     * Memo onMount: `(NewRemote: ComponentRemoteType) => NewRemote.isRemote() && component.contentAPI.needsFor(NewRemote, true);`
 *     * Memo onUnmount: `(OldRemote: ComponentRemoteType) => OldRemote.isRemote() && component.contentAPI.needsFor(OldRemote, null);`
 */
declare const PseudoEmptyRemote: ComponentRemoteType;

/** This allows to access the instanced components as well as to use signal listeners (with component extra param as the first one), and trigger updates. */
declare class ComponentShadowAPI<Info extends Partial<ComponentInfo> = {}> extends SignalMan<ComponentShadowSignals<Info>> {
    /** The currently instanced components that use our custom class as their constructor. */
    components: Set<Component<Info>>;
    /** Default update modes. Can be overridden by the component's updateModes. */
    updateModes?: Partial<MixDOMUpdateCompareModesBy>;
    /** The instance is constructed when a new component func is created. When they are instanced they are added to our .components collection. */
    constructor();
    /** Call this to trigger an update on the instanced components. */
    update(update?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** The onListener callback is required by ComponentShadowAPI's functionality for connecting signals to components fluently. */
    static onListener(compContextAPI: ComponentShadowAPI, name: string, index: number, wasAdded: boolean): void;
}
/** Create a shadow component omitting the first initProps: (component). The contextAPI is if has 2 arguments (component, contextAPI).
 * - Shadow components are normal components, but they have a ComponentShadowAPI attached as component.constructor.api.
 * - This allows the components to be tracked and managed by the parenting scope who creates the unique component class (whose instances are tracked).
*/
declare function createShadow<Info extends Partial<ComponentInfo> = {}>(CompClass: ComponentType<Info>, signals?: Partial<ComponentShadowSignals<Info>> | null, name?: string): ComponentShadowType<Info>;
/** Create a shadow component with ComponentContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
declare const createShadowCtx: <Info extends Partial<ComponentInfo<{}, {}, {}, {}, any, {}>> = {}>(func: (component: ComponentShadow<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>, signals?: Partial<ComponentShadowSignals> | null, name?: string) => ComponentShadowFuncWith<Info>;

/** Type for the ComponentShadowAPI signals. */
type ComponentShadowSignals<Info extends Partial<ComponentInfo> = {}> = ComponentExternalSignalsFor<ComponentShadow<Info>>;
type ComponentShadowFunc<Info extends Partial<ComponentInfo> = {}> = (((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadow<Info>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>)) & {
    Info?: Info;
    api: ComponentShadowAPI<Info>;
};
type ComponentShadowFuncWith<Info extends Partial<ComponentInfo> = {}> = ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadowCtx<Info>, contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>) & {
    Info?: Info;
    api: ComponentShadowAPI<Info>;
};
type ComponentShadowFuncWithout<Info extends Partial<ComponentInfo> = {}> = ((props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: ComponentShadow<Info>, contextAPI?: never) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info["props"]>, NonNullable<Info["state"]>>) & {
    Info?: Info;
    api: ComponentShadowAPI<Info>;
};
interface ComponentShadowType<Info extends Partial<ComponentInfo> = {}> extends ComponentType<Info> {
    api: ComponentShadowAPI<Info>;
}
/** There is no actual pre-existing class for ComponentShadow. Instead a new class is created when createShadow is used. */
interface ComponentShadow<Info extends Partial<ComponentInfo> = {}> extends Component<Info> {
}
/** Type for Component with ComponentContextAPI. Also includes the signals that ComponentContextAPI brings. */
interface ComponentShadowCtx<Info extends Partial<ComponentInfo> = {}> extends ComponentShadow<Info> {
    contextAPI: ComponentContextAPI<Info["contexts"] & {}>;
}

declare class ComponentWiredAPI<ParentProps extends Record<string, any> = {}, BuildProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = {}> extends ComponentShadowAPI<{
    props: ParentProps;
    state: MixedProps;
}> {
    /** The additional props created by the builder are stored here. */
    builtProps: BuildProps | null;
    /** Default update modes. These will be used for each wired component instance.
     * - Note that we add `{ props: "never" }` as default in the constructor.
     * - This is because we want the update checks to skip props and use the `state` (that we pass as props to the inner component).
     */
    updateModes?: Partial<MixDOMUpdateCompareModesBy>;
    constructor();
    /** This is used to get the new props by the builder. It's only used when manually called with .refresh() or when the wired source component (if any) updates. */
    buildProps(): BuildProps | null;
    /** Get the final mixed props for a component instance of our wired class. */
    getMixedProps(wired: Component): MixedProps;
    /** Call this to manually update the wired part of props and force a refresh.
     * - This is most often called by the static refresh method above, with props coming from the builder / built props. */
    setProps(builtProps: BuildProps | null, forceUpdate?: boolean | "all" | "trigger", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Call this to rebuild the wired part of props and trigger a refresh on the instances.
     * - If the props stay the same, you should set `forceUpdate = "trigger"`, or rather just call `update()` directly if you know there's no builder. */
    refresh(forceUpdate?: boolean | "all" | "trigger", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Call this to trigger an update on the instanced components.
     * - This sets the state of each wired components using the getMixedProps method to produce the final mixed props (that will be passed to the renderer component as props). */
    update(update?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Optional callback to build the common props upon refresh start. These are then fed to the mixer as extra info. */
    onBuildProps?(lastProps: BuildProps | null): BuildProps | null;
    /** Optional callback to build the common props upon refresh start. These are then fed to the mixer as extra info. */
    onMixProps?(parentProps: ParentProps & {}, buildProps: [this["onBuildProps"]] extends [() => any] ? BuildProps : null, wired: Component<{
        props?: ParentProps;
    }>): MixedProps;
}
/** Creates a wired component.
 * - The wired component is an intermediary component to help produce extra props to an inner component.
 *      * It receives its parent props normally, and then uses its `state` for the final props that will be passed to the inner component (as its `props`).
 * - About arguments:
 *      1. The optional Builder function builds the common external props for all wired instances. These are added to the component's natural props.
 *      2. The optional Mixer function builds unique props for each wired instance. If used, the common props are fed to it and the output of the mixer instead represents the final props to add.
 *      3. The only mandatory argument is the component to be used in rendering, can be a spread func, too. It's the one that receives the mixed props: from the tree flow and from the wiring source by handled by Mixer and Builder functions.
 *      4. Finally you can also define the name of the component (useful for debugging).
 * - Technically this method creates a component function (but could as well be a class extending Component).
 *      - The important thing is that it's a unique component func/class and it has `api` member that is of `WiredAPI` type (extending `ComponentShadowAPI`).
 *      - When the component is instanced, its static class side contains the same `api` which serves as the connecting interface between the driver and all instances.
 *      - This class can then allow to set and refresh the common props, and trigger should-updates for all the instances and use signals.
 *      - The `WiredAPI` extension contains then features related to the automated mixing of parent props and custom data to produce final state -> inner component props.
 * - Note that when creates a stand alone wired component (not through Component component's .createWired method), you should drive the updates manually by .setProps.
 */
declare function createWired<ParentProps extends Record<string, any> = {}, BuildProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = {}, Builder extends (lastProps: BuildProps | null) => BuildProps = (lastProps: BuildProps | null) => BuildProps, Mixer extends (parentProps: ParentProps, buildProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps = (parentProps: ParentProps, buildProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps>(mixer: Mixer | BuildProps | null, renderer: ComponentTypeAny<{
    props: MixedProps;
}>, name?: string): ComponentWiredFunc<ParentProps, BuildProps, MixedProps>;
declare function createWired<ParentProps extends Record<string, any> = {}, BuildProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = {}, Builder extends (lastProps: BuildProps | null) => BuildProps = (lastProps: BuildProps | null) => BuildProps, Mixer extends (parentProps: ParentProps, buildProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps = (parentProps: ParentProps, buildProps: [Builder] extends [() => any] ? BuildProps : null, wired: Component<{
    props: ParentProps;
    state: MixedProps;
}>) => MixedProps>(builder: Builder | BuildProps | null, mixer: Mixer | null, renderer: ComponentTypeAny<{
    props: MixedProps;
}>, name?: string): ComponentWiredFunc<ParentProps, BuildProps, MixedProps>;

/** Wired can be a func with { api }. */
type ComponentWiredFunc<ParentProps extends Record<string, any> = {}, BuildProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = {}> = ((props: ParentProps, component: ComponentWired<ParentProps>) => MixDOMRenderOutput | MixDOMDoubleRenderer<ParentProps, MixedProps>) & {
    api: ComponentWiredAPI<ParentProps, BuildProps, MixedProps>;
};
/** There is no actual pre-existing class for ComponentWired. But for typing, we can provide the info for the static side. */
interface ComponentWiredType<ParentProps extends Record<string, any> = {}, BuildProps extends Record<string, any> = {}, MixedProps extends Record<string, any> = {}> extends ComponentShadowType<{
    props: ParentProps;
}> {
    api: ComponentWiredAPI<ParentProps, BuildProps, MixedProps>;
}
/** There is no actual class for ComponentWired. Instead a new class is created when createWired is used. */
interface ComponentWired<ParentProps extends Record<string, any> = {}> extends Component<{
    props: ParentProps;
}> {
}

type WithContentInfo = {
    props: {
        /** If set to a boolean value (= not null nor undefined), skips checking whether actually has content and returns the value. */
        hasContent?: boolean | null;
    };
    class: {
        /** Internal method to check whether has content - checks recursively through the parental chain. */
        hasContent(): boolean;
    };
};
declare const MixDOMWithContent: ComponentType<WithContentInfo>;

/** This creates a new ComponentShadowAPI or ComponentWiredAPI and merges updateModes and signals.
 * - If is a ComponentWiredAPI also attaches the last builtProps member, and onBuildProps and onMixProps methods.
 */
declare function mergeShadowWiredAPIs(apis: Array<ComponentShadowAPI>): ComponentShadowAPI;
declare function mergeShadowWiredAPIs(apis: Array<ComponentWiredAPI>): ComponentWiredAPI;
/** This mixes many component functions together. Each should look like: `(initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer`.
 * - Note that this only "purely" mixes the components together (on the initial render call).
 *      * By default does not put a renderer function in the end but just passes last output (preferring funcs, tho). If you want make sure a renderer is in the end, put last param to true: `(...funcs, true)`
 *      * Compare this with `mixComponentFuncsWith(..., composer)`, that always returns a renderer. (And its last argument is auto-typed based on all previous.)
 * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
 *      * Note that you should only use `ComponentFunc` or `ComponentFuncMixable`. Not supported for spread functions (makes no sense) nor component classes (not supported for this flow, see mixComponentClassFuncs instead).
 *      * You should type each function most often with `ComponentFunc<Info>` type or `MixDOM.component<Info>()` method. If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
 * - This also supports handling contextual needs (by a func having 3 args) as well as attaching / merging ComponentShadowAPI | ComponentWiredAPI.
 * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
 *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
 *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
 */
declare function mixComponentFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>>(a: A, useRenderer?: boolean): ComponentFunc<ReadComponentInfo<A>>;
declare function mixComponentFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>>(a: A, b: B, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B]>>;
declare function mixComponentFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>>(a: A, b: B, c: C, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C]>>;
declare function mixComponentFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>>(a: A, b: B, c: C, d: D, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D]>>;
declare function mixComponentFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D, E]>>;
declare function mixComponentFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, f: F, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F]>>;
declare function mixComponentFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G]>>;
declare function mixComponentFuncs<A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<A, B, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentFunc>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, useRenderer?: boolean): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G, H]>>;
/** This mixes many component functions together. Each should look like: (initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer.
 * - Unlike mixComponentFuncs, the last argument is a mixable func that should compose all together, and its typing comes from all previous combined.
 *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
 *      * Alternatively you can add them to the 2nd last function with: `SomeMixFunc as ComponentFunc<ReadComponentInfo<typeof SomeMixFunc, ExtraInfo>>`.
 * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
 *      * Note that you should only use ComponentFunc or ComponentFuncMixable. Not supported for spread functions (makes no sense) nor component classes (not supported).
 *      * You should type each function most often with ComponentFunc<Info> or MixDOM.component<Info>(). If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
 * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
 *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
 *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
 */
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfo<A, ExtraInfo>>>(a: A, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfo<A, ExtraInfo>>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B], ExtraInfo>>>(a: A, b: B, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B], ExtraInfo>>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C], ExtraInfo>>>(a: A, b: B, c: C, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C], ExtraInfo>>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D], ExtraInfo>>>(a: A, b: B, c: C, d: D, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D], ExtraInfo>>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>;
declare function mixComponentFuncsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, extraInfo?: ExtraInfo): ComponentFunc<ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>;
/** This returns the original function (to create a mixin class) back but simply helps with typing.
 * - The idea of a mixin is this: `(Base) => class extends Base { ... }`. So it creates a new class that extends the provided base class.
 *     * In the context of Components the idea is that the Base is Component and then different features are added to it.
 *     * Optionally, when used with mixComponentMixins the flow also supports adding requirements (in addition to that the Base is a Component class).
 * - To use this method: `const MyMixin = createMixin<RequiresInfo, MyMixinInfo>(Base => class _MyMixin extends Base { ... }`
 *     * Without the method: `const MyMixin = (Base: GetComponentTypeFrom<RequireInfo>) => class _MyMixin extends (Base as GetComponentTypeFrom<RequireInfo & MyMixinInfo>) { ... }`
 *     * So the trick of this method is simply that the returned function still includes `(Base: Required)`, but _inside_ the func it looks like `(Base: Required & Added)`.
*/
declare function createMixin<Info extends Partial<ComponentInfo>, RequiresInfo extends Partial<ComponentInfo> = {}>(func: (Base: GetComponentTypeFrom<RequiresInfo & Info>) => GetComponentTypeFrom<RequiresInfo & Info>): (Base: GetComponentTypeFrom<RequiresInfo>) => GetComponentTypeFrom<RequiresInfo & Info>;
/** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ...)`.
 * - Note. The last mixin with a render method defined is used as the render method of the combined class.
 * - Note. If you want to define a custom base class (extending Component) you can use `mixComponentClassMixins` method whose first argument is a base class.
 * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
*/
declare function mixComponentMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>>(a: A): ComponentType<ReadComponentInfo<A>>;
declare function mixComponentMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>>(a: A, b: B): ComponentType<ReadComponentInfos<[A, B]>>;
declare function mixComponentMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>>(a: A, b: B, c: C): ComponentType<ReadComponentInfos<[A, B, C]>>;
declare function mixComponentMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>>(a: A, b: B, c: C, d: D): ComponentType<ReadComponentInfos<[A, B, C, D]>>;
declare function mixComponentMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E): ComponentType<ReadComponentInfos<[A, B, C, D, E]>>;
declare function mixComponentMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<ReadComponentInfos<[A, B, C, D, E, F]>>;
declare function mixComponentMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G]>>;
declare function mixComponentMixins<A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G, H]>>;
/** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ..., ComposerMixin)`
 * - Note. The last mixin is assumed to be the one to do the rendering and its type is combined from all the previous + the optional extra info given as the very last argument.
 * - This is like mixComponentFuncsWith but for mixins. On the javascript this function is teh same as MixDOM.mixMixins.
 */
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, Info extends ReadComponentInfo<A, ExtraInfo>>(a: A, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, Info extends ReadComponentInfos<[A, B], ExtraInfo>>(a: A, b: B, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C], ExtraInfo>>(a: A, b: B, c: C, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D], ExtraInfo>>(a: A, b: B, c: C, d: D, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F, G], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
declare function mixComponentMixinsWith<ExtraInfo extends Partial<ComponentInfo>, A extends ExtendsComponent<A, {}, ComponentMixinType>, B extends ExtendsComponent<B, A, ComponentMixinType>, C extends ExtendsComponents<C, [A, B], ComponentMixinType>, D extends ExtendsComponents<D, [A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentMixinType>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentMixinType>, Info extends ReadComponentInfos<[A, B, C, D, E, F, G, H], ExtraInfo>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: ComponentMixinType<Info, Info>, extraInfo?: ExtraInfo): ComponentType<Info>;
/** Mix many mixins together with a custom Component class as the basis to mix on: `(MyClass, MyMixin1, MyMixin2, ...)`.
 * - Note. The last mixin with a render method defined is used as the render method of the combined class.
 * - Note. If you don't want to define a custom component class as the base, you can use the `mixComponentMixins` function instead (which uses the Component class). These two funcs are split to get better typing experience.
 * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
*/
declare function mixComponentClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>>(base: Base, a: A): ReturnType<A>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>>(base: Base, a: A, b: B): ComponentType<ReadComponentInfos<[Base, A, B]>>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>>(base: Base, a: A, b: B, c: C): ComponentType<ReadComponentInfos<[Base, A, B, C]>>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>>(base: Base, a: A, b: B, c: C, d: D): ComponentType<ReadComponentInfos<[Base, A, B, C, D]>>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>>(base: Base, a: A, b: B, c: C, d: D, e: E): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E]>>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [Base, A, B, C, D, E], ComponentMixinType>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E, F]>>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [Base, A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [Base, A, B, C, D, E, F], ComponentMixinType>>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E, F, G]>>;
declare function mixComponentClassMixins<Base extends ComponentType, A extends ExtendsComponent<A, Base, ComponentMixinType>, B extends ExtendsComponents<B, [Base, A], ComponentMixinType>, C extends ExtendsComponents<C, [Base, A, B], ComponentMixinType>, D extends ExtendsComponents<D, [Base, A, B, C], ComponentMixinType>, E extends ExtendsComponents<E, [Base, A, B, C, D], ComponentMixinType>, F extends ExtendsComponents<F, [Base, A, B, C, D, E], ComponentMixinType>, G extends ExtendsComponents<G, [Base, A, B, C, D, E, F], ComponentMixinType>, H extends ExtendsComponents<H, [Base, A, B, C, D, E, F, G], ComponentMixinType>>(base: Base, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): ComponentType<ReadComponentInfos<[Base, A, B, C, D, E, F, G, H]>>;
/** This mixes together a Component class and one or many functions.
 * - By default, attaches the return of the last function as the renderer (if function type, otherwise an earlier one).
 * - Optionally as the 3rd arg, can provide a boolean to use the class renderer instead. */
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>>(Base: Class, a: A, useClassRender?: boolean): A;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>>(Base: Class, a: A, b: B, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B]>>;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>>(Base: Class, a: A, b: B, c: C, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C]>>;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D]>>;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D, E]>>;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [BaseFunc, A, B, C, D, E], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D, E, F]>>;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [BaseFunc, A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [BaseFunc, A, B, C, D, E, F], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G]>>;
declare function mixComponentClassFuncs<Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponents<B, [BaseFunc, A], ComponentFunc>, C extends ExtendsComponents<C, [BaseFunc, A, B], ComponentFunc>, D extends ExtendsComponents<D, [BaseFunc, A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [BaseFunc, A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [BaseFunc, A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [BaseFunc, A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [BaseFunc, A, B, C, D, E, F, G], ComponentFunc>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, useClassRender?: boolean): ComponentType<ReadComponentInfos<[A, B, C, D, E, F, G, H]>>;
/** This mixes together a Component class and one or many functions with a composer function as the last function.
 * - The last function is always used as the renderer and its typing is automatic.
 *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
 */
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, Mixed extends ComponentFunc<ReadComponentInfo<BaseFunc, ExtraInfo>>>(Base: Class, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A], ExtraInfo>>>(Base: Class, a: A, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B], ExtraInfo>>>(Base: Class, a: A, b: B, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E, F], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E, F, G], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
declare function mixComponentClassFuncsWith<ExtraInfo extends Partial<ComponentInfo>, Class extends ComponentType, BaseFunc extends ComponentFunc<Class["_Info"] & {}>, A extends ExtendsComponent<A, BaseFunc, ComponentFunc>, B extends ExtendsComponent<B, A, ComponentFunc>, C extends ExtendsComponents<C, [A, B], ComponentFunc>, D extends ExtendsComponents<D, [A, B, C], ComponentFunc>, E extends ExtendsComponents<E, [A, B, C, D], ComponentFunc>, F extends ExtendsComponents<F, [A, B, C, D, E], ComponentFunc>, G extends ExtendsComponents<G, [A, B, C, D, E, F], ComponentFunc>, H extends ExtendsComponents<H, [A, B, C, D, E, F, G], ComponentFunc>, Mixed extends ComponentFunc<ReadComponentInfos<[BaseFunc, A, B, C, D, E, F, G, H], ExtraInfo>>>(Base: Class, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, composer: Mixed, extraInfo?: ExtraInfo): ComponentType<ReadComponentInfo<Mixed>>;
/** Combine many HOCs together. */
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A): SpreadFunc<ReadComponentInfo<A, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B): SpreadFunc<ReadComponentInfo<B, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C): SpreadFunc<ReadComponentInfo<C, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D): SpreadFunc<ReadComponentInfo<D, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E): SpreadFunc<ReadComponentInfo<E, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F): SpreadFunc<ReadComponentInfo<F, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G): SpreadFunc<ReadComponentInfo<G, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H): SpreadFunc<ReadComponentInfo<H, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny, I extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H, hoc9: (h: H) => I): SpreadFunc<ReadComponentInfo<I, ComponentInfoEmpty>["props"] & {}>;
declare function mixHOCs<Base extends ComponentTypeAny, A extends ComponentTypeAny, B extends ComponentTypeAny, C extends ComponentTypeAny, D extends ComponentTypeAny, E extends ComponentTypeAny, F extends ComponentTypeAny, G extends ComponentTypeAny, H extends ComponentTypeAny, I extends ComponentTypeAny, J extends ComponentTypeAny>(base: Base, hoc1: (base: Base) => A, hoc2: (a: A) => B, hoc3: (b: B) => C, hoc4: (c: C) => D, hoc5: (d: D) => E, hoc6: (e: E) => F, hoc7: (f: F) => G, hoc8: (g: G) => H, hoc9: (h: H) => I, hoc10: (i: I) => J): SpreadFunc<ReadComponentInfo<J, ComponentInfoEmpty>["props"] & {}>;

type ComponentFuncCtxShortcut<Info extends Partial<ComponentInfo> = {}> = (component: ComponentCtx<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>;
/** There are two ways you can use this:
 * 1. Call this to give basic Component features with advanced typing being empty.
 *      * For example: `class MyMix extends ComponentMixin(MyBase) {}`
 * 2. If you want to define Props, State, Signals, Timers and Contexts, use this simple trick instead:
 *      * For example: `class MyMix extends (ComponentMixin as ClassMixer<ComponentType<{ props: MyProps; timers: MyTimers; }>>)(MyBase) {}`
 * - Note that the Info["class"] only works for functional components. In class form, you simply extend the class or mixin with a custom class or mixin.
 */
declare const ComponentMixin: AsMixin<ComponentType<{}>, any[]>;
/** Functional type for component fed with ComponentInfo. */
type ComponentFunc<Info extends Partial<ComponentInfo> = {}> = ((initProps: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Info["props"], component: Component<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>) & {
    _Info?: Info;
};
/** Class type (vs. instance) for component fed with ComponentInfo. */
interface ComponentType<Info extends Partial<ComponentInfo> = {}> {
    /** Class type. */
    MIX_DOM_CLASS: string;
    /** May feature a ComponentShadowAPI, it's put here to make typing easier. */
    api?: ComponentShadowAPI<Info>;
    new (props: Info["props"] & {}, boundary?: SourceBoundary): Component<Info> & Info["class"];
    /** This is only provided for typing related technical reasons. There's no actual _Info static member on the javascript side. */
    _Info?: Info;
}
declare const Component_base: {
    new (props: MixDOMPreComponentOnlyProps<{}>, boundary?: SourceBoundary | undefined, ...passArgs: any[]): {
        constructor: ComponentType<{}>;
        readonly boundary: SourceBoundary;
        readonly props: {};
        readonly _lastState?: {} | undefined;
        state: {};
        updateModes: Partial<MixDOMUpdateCompareModesBy>;
        constantProps?: Partial<Record<never, number | true | MixDOMUpdateCompareMode>> | undefined;
        timers?: Map<any, number | NodeJS.Timeout> | undefined;
        readonly wired?: Set<ComponentWiredType<{}, {}, {}> | ComponentWiredFunc<{}, {}, {}>> | undefined;
        contextAPI?: ComponentContextAPI<{}> | undefined;
        /** This initializes the contextAPI instance (once). */
        initContextAPI(): void;
        isMounted(): boolean;
        getLastState(fallbackToCurrent?: boolean): {} | null;
        getHost<Contexts extends ContextsAllType = {}>(): Host<Contexts>;
        queryElement(selector: string, withinBoundaries?: boolean, overHosts?: boolean): Element | null;
        queryElements(selector: string, maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean): Element[];
        findElements(maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined): Node[];
        findComponents<Comp extends ComponentTypeAny<{}> = ComponentTypeAny<{}>>(maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined): Comp[];
        findTreeNodes(types?: SetLike<MixDOMTreeNodeType> | undefined, maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined): MixDOMTreeNode[];
        setTimer(timerId: any, callback: () => void, timeout: number): void;
        hasTimer(timerId: any): boolean;
        clearTimers(...timerIds: any[]): void;
        setUpdateModes(modes: Partial<MixDOMUpdateCompareModesBy>, extend?: boolean): void;
        setConstantProps(constProps: never[] | Partial<Record<never, number | true | MixDOMUpdateCompareMode>> | null, extend?: boolean, overrideEach?: number | MixDOMUpdateCompareMode | null): void;
        setState(newState: {} | Pick<{}, never>, forceUpdate?: boolean | "all" | undefined, forceUpdateTimeout?: number | null | undefined, forceRenderTimeout?: number | null | undefined): void;
        setInState(property: never, value: any, forceUpdate?: boolean | "all" | undefined, forceUpdateTimeout?: number | null | undefined, forceRenderTimeout?: number | null | undefined): void;
        triggerUpdate(forceUpdate?: boolean | "all" | undefined, forceUpdateTimeout?: number | null | undefined, forceRenderTimeout?: number | null | undefined): void;
        addWired(Wired: ComponentWiredType<{}, {}, {}> | ComponentWiredFunc<{}, {}, {}>): void;
        removeWired(Wired: ComponentWiredType<{}, {}, {}> | ComponentWiredFunc<{}, {}, {}>): void;
        afterRefresh(renderSide?: boolean, forceUpdateTimeout?: number | null | undefined, forceRenderTimeout?: number | null | undefined): Promise<void>;
        render(_props: {}, _lastState: {}): MixDOMRenderOutput | MixDOMDoubleRenderer<{}, {}>;
    };
    MIX_DOM_CLASS: string;
};
/** Standalone Component class. */
declare class Component<Info extends Partial<ComponentInfo> = {}, Props extends Record<string, any> = NonNullable<Info["props"]>, State extends Record<string, any> = NonNullable<Info["state"]>> extends Component_base {
    ["constructor"]: ComponentType<Info>;
    constructor(props: MixDOMPreComponentOnlyProps<Info["signals"] & {}> & Props, boundary?: SourceBoundary, ...passArgs: any[]);
}
interface Component<Info extends Partial<ComponentInfo> = {}, Props extends Record<string, any> = NonNullable<Info["props"]>, State extends Record<string, any> = NonNullable<Info["state"]>> extends SignalMan<ComponentSignals<Info> & Info["signals"]> {
    /** Fresh props from the parent. */
    readonly props: Props;
    /** If the state has changed since last render, this contains the previous state. */
    readonly _lastState?: State;
    /** Locally defined state. When state is updated (through setState or setInState), the component will be checked for updates and then re-render if needed. */
    state: State;
    /** Map of the timers by id, the value is the reference for cancelling the timer. Only appears here if uses timers. */
    timers?: Map<Info["timers"] & {}, number | NodeJS.Timeout>;
    /** If any is undefined / null, then uses the default from host.settings. */
    updateModes: Partial<MixDOMUpdateCompareModesBy>;
    /** If constantProps is defined, then its keys defines props that must not change, and values how the comparison is done for each.
     * This affects the def pairing process by disallowing pairing if conditions not met, which in turn results in unmount and remount instead of just updating props (and potentially moving). */
    constantProps?: Partial<Record<keyof Props, MixDOMUpdateCompareMode | number | true>>;
    /** ContextAPI for the component. You can use it to access contextual features. By default inherits the named contexts from the Host, but you can also override them locally. */
    contextAPI?: ComponentContextAPI<Info["contexts"] & {}>;
    /** Ref to the dedicated SourceBoundary - it's technical side of a Component. */
    readonly boundary: SourceBoundary;
    /** Any wired component classes created by us. */
    readonly wired?: Set<ComponentWiredType | ComponentWiredFunc>;
    /** The constructor is typed as ComponentType. */
    ["constructor"]: ComponentType<Info>;
    /** This returns a promise that is resolved after the host's refresh cycle has finished.
     * - By default delays until the "update" cycle (renderSide = false). If renderSide is true, then is resolved after the "render" cycle (after updates).
     */
    afterRefresh(renderSide?: boolean, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): Promise<void>;
    /** Whether this component has mounted. If false, then has not yet mounted or has been destroyed. */
    isMounted(): boolean;
    /** This gets the state that was used during last render call, and by default falls back to the current state.
     * - Most often you want to deal with the new state (= `this.state`), but this is useful in cases where you want to refer to what has been rendered.
     * - You can also access the previous state by `this._lastState`. If it's undefined, there hasn't been any changes in the state since last render.
     */
    getLastState(fallbackToCurrent?: true): State;
    getLastState(fallbackToCurrent?: boolean): State | null;
    /** Gets the rendering host that this component belongs to. By default uses the same Contexts typing as in the component's info, but can provide custom Contexts here too. */
    getHost<Contexts extends ContextsAllType = Info["contexts"] & {}>(): Host<Contexts>;
    /** Get the first dom element within by a selectors within the host (like document.querySelector). Should rarely be used, but it's here if needed. */
    queryElement<T extends Element = Element>(selector: string, withinBoundaries?: boolean, overHosts?: boolean): T | null;
    /** Get dom elements within by a selectors within the host (like document.querySelectorAll). Should rarely be used, but it's here if needed. */
    queryElements<T extends Element = Element>(selector: string, maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean): T[];
    /** Find all dom nodes within by an optional validator. */
    findElements<T extends Node = Node>(maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): T[];
    /** Find all components within by an optional validator. */
    findComponents<Comp extends ComponentTypeAny = ComponentTypeAny>(maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): Comp[];
    /** Find all treeNodes within by given types and an optional validator. */
    findTreeNodes(types?: SetLike<MixDOMTreeNodeType>, maxCount?: number, withinBoundaries?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[];
    /** Add a new timer with a custom id, or without if null. Returns id. Timers will be automatically cancelled if the component unmounts. You can provide the typing locally to the method. */
    setTimer(timerId: NonNullable<Info["timers"]> | null, callback: () => void, timeout: number): NonNullable<Info["timers"]> | {};
    /** Check whether the current timer id exists. */
    hasTimer(timerId: NonNullable<Info["timers"]>): boolean;
    /** Clear timer(s) by ids. If none given, clears all. */
    clearTimers(...timerIds: NonNullable<Info["timers"]>[]): void;
    /** Modify the updateModes member that defines how should compare { props, data, children, remotes } during the update process. */
    setUpdateModes(modes: Partial<MixDOMUpdateCompareModesBy>, extend?: boolean): void;
    /** Modify the constantProps member that defines which props must not change (and how) without a remount. If you set the mode to `true` it means "changed" (= 0 depth).
     * You can also override the mode for each if you just want to use the keys of another dictionary.
     * By default extends the given constant props, if you want to reset put extend to `false`. If you want to clear, leave the constProps empty (null | [] | {}) as well. */
    setConstantProps(constProps: Partial<Record<keyof Props, MixDOMUpdateCompareMode | number | true>> | (keyof Props)[] | null, extend?: boolean, overrideEach?: MixDOMUpdateCompareMode | number | null): void;
    /** Set many properties in the state at once. Can optionally define update related timing. */
    setState<Key extends keyof State>(partialState: Pick<State, Key> | State, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    setState(newState: State, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Set one property in the state with typing support. Can optionally define update related timing. */
    setInState<Key extends keyof State>(property: Key, value: State[Key], forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Trigger an update manually. Normally you never need to use this. Can optionally define update related timing */
    triggerUpdate(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    /** Add a wired component to this component's refresh cycle. Create the wired component using the `createWired` method. */
    addWired(wired: ComponentWiredFunc): void;
    /** Remove a wired component to this component's refresh cycle. */
    removeWired(wired: ComponentWiredFunc): void;
    /** The most important function of any component: the render function. If not using functional rendering, override this manually on the class.
     */
    render(props: Props, state: State): MixDOMRenderOutput | MixDOMDoubleRenderer & MixDOMDoubleRenderer<Props, State>;
}
/** Create a component by func. You get the component as the first parameter (component), while initProps are omitted. */
declare function createComponent<Info extends Partial<ComponentInfo> = {}>(func: (component: Component<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>, name?: string): ComponentFunc<Info>;
/** Create a component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count and component typing includes component.contextAPI. */
declare const createComponentCtx: <Info extends Partial<ComponentInfo<{}, {}, {}, {}, any, {}>> = {}>(func: ComponentFuncCtxShortcut<Info>, name?: string) => ComponentFuncCtx<Info>;

/** Props for the Remote component generally. Includes intrinsic signals. */
interface ComponentRemoteProps extends MixDOMPreComponentOnlyProps {
    /** Define the relative importance of this Remote instance amongst others of the same Remote class.
     * - The higher the number, the more important the remote.
     * - Note that if you want to disable the remote source totally (as if it weren't there), you can use the general _disable prop. */
    importance?: number;
}
/** Instanced remote source. */
interface ComponentRemote extends Component<{
    props: ComponentRemoteProps;
}> {
    /** The constructor is typed as ComponentRemoteType. */
    ["constructor"]: ComponentType & ComponentRemoteType;
    /** Used internally. Whether can refresh the source or not. If it's not attached, cannot. */
    canRefresh(): boolean;
    /** Used internally in relation to the content passing updating process. */
    preRefresh(newEnvelope: MixDOMContentEnvelope | null): Set<SourceBoundary> | null;
    /** Used internally in relation to the content passing updating process. */
    applyRefresh(forceUpdate?: boolean): MixDOMChangeInfos;
    /** To refresh sub mixing - mainly the importance prop. */
    refreshSource(forceRenderTimeout?: number | null): void;
    /** Returns info for removal and additions. */
    reattachSource(): MixDOMChangeInfos | null;
}
/** Static class side for remote output. */
interface ComponentRemoteType extends ComponentType<{
    props: ComponentRemoteProps;
}> {
    readonly MIX_DOM_CLASS: string;
    new (props: ComponentRemoteProps, boundary?: SourceBoundary): ComponentRemote;
    Content: MixDOMDefTarget | null;
    ContentCopy: MixDOMDefTarget | null;
    copyContent: (key?: any) => MixDOMDefTarget | null;
    /** A custom component (func) that can be used for remote conditional inserting.
     * - For example: `<MyRemote.WithContent><div class="popup-container">{MyRemote.Content}</div></MyRemote.WithContent>`
     *      * Results in `<div class="popup-container">...</div>`, where ... is the actual content passed (by remote source).
     *      * However, if there was no actual content to pass, then results in `null`.
     * - This is very typically used for adding some wired elements to a popup remote, like in the above example.
     */
    WithContent: ComponentType<{
        props: {
            hasContent?: boolean;
        };
    }> & {
        /** Should contain the content pass object. For parental passing it's the MixDOM.Content object. For remotes their Content pass object with its getRemote() method. */
        _WithContent: MixDOMDefTarget;
    };
    isRemote(): boolean;
    closure: ContentClosure;
    source: ComponentRemote | null;
    sources: Set<ComponentRemote>;
    addSource(remote: ComponentRemote): void;
    removeSource(remote: ComponentRemote, withSourceRefresh?: boolean): MixDOMChangeInfos | null;
    reattachSourceBy(remote: ComponentRemote): MixDOMChangeInfos | null;
    refreshRemote(forceRenderTimeout?: number | null): void;
    getBestRemote(preferCurrent?: boolean): ComponentRemote | null;
}
/** Create a component for remote content. */
declare const createRemote: () => ComponentRemoteType;

interface MixDOMContentEnvelope {
    applied: MixDOMDefApplied;
    target: MixDOMDefTarget;
}
/** This is a technically important class used in the update flow.
 * - Most of its members are managed by the "../host/routine.ts" handlers (due to getting rid of cyclical reference on JS side).
 */
declare class ContentClosure {
    /** The boundary that is connected to this closure - we are its link upwards in the content chain. */
    thruBoundary: SourceBoundary | null;
    /** The sourceBoundary is required to render anything - it defines to whom the content originally belongs.
     * If it would ever be switched (eg. by remote flow from multiple sources), should clear the envelope first, and then assign new. */
    sourceBoundary: SourceBoundary | null;
    /** The sealed envelope that contains the content to pass: { applied, targetDef }. */
    envelope: MixDOMContentEnvelope | null;
    /** If not null, then this is the grounding def that features a true pass. */
    truePassDef: MixDOMDefApplied | null;
    /** Map where keys are the grounded defs (applied), and values are [boundary, treeNode, copyKey]. */
    groundedDefs: Map<MixDOMDefApplied, [boundary: SourceBoundary | ContentBoundary, treeNode: MixDOMTreeNode, copyKey: any]>;
    /** The grounded defs that are pending refresh. If all should be refreshed, contains all the keys in the groundedDefs. */
    pendingDefs: Set<MixDOMDefApplied>;
    /** This contains the boundaries from any WithContent components that refer to us.
     * - They will be re-updated every time our envelope changes. (Actually they would just care about null vs. non-null.) */
    withContents?: Set<SourceBoundary>;
    /** Used to detect which closures are linked together through content passing.
     * - This is further more used for the withContents feature. (But could be used for more features.)
     * - Note that this kind of detection is not needed for remotes: as there's only the (active) source and target - nothing in between them.
     */
    chainedClosures?: Set<ContentClosure>;
    /** If this closure is linked to feed a remote, assign the remote instance here. */
    remote?: ComponentRemote | null;
    constructor(thruBoundary?: SourceBoundary | null, sourceBoundary?: SourceBoundary | null);
    /** Whether we have any actual content to pass. */
    hasContent(): boolean;
    /** Get the content that we pass. */
    readContent(shallowCopy?: boolean): Readonly<MixDOMDefTarget[]> | null;
}

/** This is what "contains" a component.
 * .. It's the common interface for technical as well as advanced API interfacing. */
declare class SourceBoundary extends BaseBoundary {
    /** Redefine that the outer def is about a boundary. */
    _outerDef: MixDOMDefApplied & MixDOMDefBoundary;
    /** Temporary rendering state indicator. */
    _renderState?: "active" | "re-updated";
    /** If has marked to be force updated. */
    _forceUpdate?: boolean | "all";
    /** Our host based quick id. It's mainly used for sorting, and sometimes to detect whether is content or source boundary, helps in debugging too. */
    bId: MixDOMSourceBoundaryId;
    /** Shortcut for the component. Only one can be set (and typically one is). */
    component: Component;
    /** The content closure tied to this boundary.
     * - It it's the channel through which our parent passes content to us - regardless of the update flow.
     * - When tied to a boundary, the content closure has a reference to it as .thruBoundary. (It can also be used without .thruBoundary, see ComponentRemote.) */
    closure: ContentClosure;
    constructor(host: Host, outerDef: MixDOMDefApplied & MixDOMDefBoundary, treeNode: MixDOMTreeNode, sourceBoundary?: SourceBoundary);
    /** Should actually only be called once. Initializes a Component class and assigns renderer and so on. */
    reattach(): void;
    update(forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    updateBy(updates: MixDOMComponentUpdates, forceUpdate?: boolean | "all", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void;
    render(iRecursion?: number): MixDOMRenderOutput;
}

declare class BaseBoundary {
    /** The def that defined this boundary to be included. This also means it contains our last applied props. */
    _outerDef: MixDOMDefApplied;
    /** The _innerDef is the root def for what the boundary renders inside - or passes inside for content boundaries.
     * - Note that the _innerDef is only null when the boundary renders null. For content boundaries it's never (they'll be destroyed instead). */
    _innerDef: MixDOMDefApplied | null;
    /** The reference for containing host for many technical things as well as general settings. */
    host: Host;
    /** Whether the boundary is mounted. Starts as false, set to true right before didMount is called and null after willUnmount. */
    isMounted: boolean | null;
    /** The fixed treeNode of the boundary is a very important concept and reference for technical reasons.
     * - It allows to keep the separate portions of the GroundedTree structure together by tying parent and child boundary to each other.
     *   .. So, ultimately it allows us to keep a clear bookkeeping of the dom tree and makes it easy, flexible and performant to apply changes to it.
     * - The node is given by the host boundary (or host for root) and the reference always stays the same (even when mangling stuff around).
     *   1. The first host is the host instance: it creates the root treeNode and its first child, and passes the child for the first boundary.
     *   2. The boundary then simply adds add kids to this treeNode.
     *   3. If the boundary has a sub-boundary in it, it similarly gives it a treeNode to work with.
     *   4. When the boundary re-renders, it will reuse the applied defs and if did for any sub-boundary,
     *      will then reuse the same treeNode and just modify its parent accordingly. So the sub-boundary doesn't even need to know about it.
     */
    treeNode: MixDOMTreeNode;
    /** The sourceBoundary refers to the original SourceBoundary who defined us.
     * - Due to content passing, it's not necessarily our .parentBoundary, who is the one who grounded us to the tree.
     * - For the rootBoundary of a host, there's no .sourceBoundary, but for all nested, there always is.
     * - Note that for source boundarries, the sourceBoundary should never change from what was given in the constructor.
     *   .. It's passed to the source boundary's content closure, and from there further on. Swapping it on the boundary is not supported (see ComponentRemote for swapping it on the closure). */
    sourceBoundary: SourceBoundary | null;
    /** The parentBoundary ref is very useful for going quickly up the boundary tree - the opposite of .innerBoundaries. */
    parentBoundary: SourceBoundary | ContentBoundary | null;
    /** Any source or content boundaries inside that we have directly grounded in tree order - updated during every update run (don't use during). */
    innerBoundaries: (SourceBoundary | ContentBoundary)[];
    /** The component instance tied to this boundary - necessarily extends Component. */
    component?: Component;
    constructor(host: Host, outerDef: MixDOMDefApplied, treeNode: MixDOMTreeNode);
}

declare class ContentBoundary extends BaseBoundary {
    /** The def whose children define our content - we are a fragment-like container. */
    targetDef: MixDOMDefTarget;
    /** Redefine that we always have it. It's based on the targetDef. */
    _innerDef: MixDOMDefApplied;
    /** Redefine that we always have a host for content boundaries - for us, it's the original source of our rendering.
     * Note that the content might get passed through many boundaries, but now we have landed it. */
    sourceBoundary: SourceBoundary;
    /** Redefine that we always have a boundary that grounded us to the tree - we are alive because of it.
     * - Note that it gets assigned (externally) immediately after constructor is called.
     * - The parentBoundary ref is very useful for going quickly up the boundary tree - the opposite of .innerBoundaries. */
    parentBoundary: SourceBoundary | ContentBoundary;
    /** Content boundaries will never feature component. So can be used for checks to know if is a source or content boundary. */
    component?: never;
    /** Content boundaries will never feature bId. So can be used for checks to know if is a source or content boundary. */
    bId?: never;
    constructor(outerDef: MixDOMDefApplied, targetDef: MixDOMDefTarget, treeNode: MixDOMTreeNode, sourceBoundary: SourceBoundary);
    /** Apply a targetDef from the new envelope. Simply sets the defs accordingly. */
    updateEnvelope(targetDef: MixDOMDefTarget, truePassDef?: MixDOMDefApplied | null): void;
}

type RefDOMSignals<Type extends Node = Node> = {
    /** Called when a ref is about to be attached to a dom element. */
    domDidAttach: (domNode: Type) => void;
    /** Called when a ref is about to be detached from a dom element. */
    domWillDetach: (domNode: Type) => void;
    /** Called when a reffed dom element has been mounted: rendered into the dom for the first time. */
    domDidMount: (domNode: Type) => void;
    /** Called when a reffed dom element updates (not on the mount run). */
    domDidUpdate: (domNode: Type, diffs: MixDOMDOMDiffs) => void;
    /** Called when the html content of a dom element has changed. */
    domDidContent: (domNode: Type, simpleContent: MixDOMContentSimple | null) => void;
    /** Called when a reffed dom element has been moved in the tree. */
    domDidMove: (domNode: Type, fromContainer: Node | null, fromNextSibling: Node | null) => void;
    /** Return true to salvage the element: won't be removed from dom.
     * This is only useful for fade out animations, when the parenting elements also stay in the dom (and respective children). */
    domWillUnmount: (domNode: Type) => boolean | void;
};
type RefComponentSignals<Type extends ComponentTypeEither = ComponentTypeEither, Instance extends ComponentInstanceType<Type> = ComponentInstanceType<Type>> = {
    /** Called when a ref is about to be attached to a component. */
    didAttach: (component: Type) => void;
    /** Called when a ref is about to be detached from a component. */
    willDetach: (component: Type | ContentBoundary) => void;
} & ([Instance] extends [Component] ? ComponentExternalSignalsFor<Instance> : {});
type RefSignals<Type extends Node | ComponentTypeEither = Node | ComponentTypeEither> = [Type] extends [Node] ? RefDOMSignals<Type> : [Type] extends [ComponentTypeEither] ? RefComponentSignals<Type> : RefDOMSignals<Type & Node> & RefComponentSignals<Type & ComponentTypeEither>;
interface RefBase {
    signals: Record<string, SignalListener[]>;
    treeNodes: Set<MixDOMTreeNode>;
    getTreeNode(): MixDOMTreeNode | null;
    getTreeNodes(): MixDOMTreeNode[];
    getElement(onlyForDOMRefs?: boolean): Node | null;
    getElements(onlyForDOMRefs?: boolean): Node[];
    getComponent(): Component | null;
    getComponents(): Component[];
}
interface RefType<Type extends Node | ComponentTypeEither = Node | ComponentTypeEither> extends SignalManType<RefSignals<Type>> {
    new (): Ref<Type>;
    MIX_DOM_CLASS: string;
    /** Internal call tracker. */
    onListener(instance: RefBase & SignalMan<RefSignals<Type>>, name: string, index: number, wasAdded: boolean): void;
    /** Internal flow helper to call after attaching the ref. Static to keep the class clean. */
    didAttachOn(ref: RefBase, treeNode: MixDOMTreeNode): void;
    /** Internal flow helper to call right before detaching the ref. Static to keep the class clean. */
    willDetachFrom(ref: RefBase, treeNode: MixDOMTreeNode): void;
}
declare class Ref<Type extends Node | ComponentTypeEither = Node | ComponentTypeEither> extends SignalMan<RefSignals<Type>> {
    static MIX_DOM_CLASS: string;
    /** The collection (for clarity) of tree nodes where is attached to.
     * It's not needed internally but might be useful for custom needs. */
    treeNodes: Set<MixDOMTreeNode>;
    constructor(...args: any[]);
    /** This returns the last reffed treeNode, or null if none.
     * - The MixDOMTreeNode is a descriptive object attached to a location in the grounded tree. Any tree node can be targeted by refs.
     * - The method works as if the behaviour was to always override with the last one.
     * - Except that if the last one is removed, falls back to earlier existing. */
    getTreeNode(): MixDOMTreeNode | null;
    /** This returns all the currently reffed tree nodes (in the order added). */
    getTreeNodes(): MixDOMTreeNode[];
    /** This returns the last reffed domNode, or null if none.
     * - The method works as if the behaviour was to always override with the last one.
     * - Except that if the last one is removed, falls back to earlier existing. */
    getElement(onlyForDOMRefs?: boolean): [Type] extends [Node] ? Type | null : Node | null;
    /** This returns all the currently reffed dom nodes (in the order added). */
    getElements(onlyForDOMRefs?: boolean): [Type] extends [Node] ? Type[] : Node[];
    /** This returns the last reffed component, or null if none.
     * - The method works as if the behaviour was to always override with the last one.
     * - Except that if the last one is removed, falls back to earlier existing. */
    getComponent(): [Type] extends [Node] ? Component | null : [Type] extends [ComponentTypeEither] ? ComponentInstanceType<Type> : Component | null;
    /** This returns all the currently reffed components (in the order added). */
    getComponents(): [Type] extends [Node] ? Component[] : [Type] extends [ComponentTypeEither] ? ComponentInstanceType<ComponentTypeEither & Type>[] : Component[];
    /** The onListener callback is required by Ref's functionality for connecting signals to components fluently. */
    static onListener(ref: RefBase & SignalMan<RefSignals>, name: string & keyof RefSignals, index: number, wasAdded: boolean): void;
    /** Internal flow helper to call after attaching the ref. Static to keep the class clean. */
    static didAttachOn(ref: RefBase, treeNode: MixDOMTreeNode): void;
    /** Internal flow helper to call right before detaching the ref. Static to keep the class clean. */
    static willDetachFrom(ref: RefBase, treeNode: MixDOMTreeNode): void;
}
/** Create a new ref instance shortcut. */
declare const newRef: <Type extends Node | ComponentTypeEither<{}> = Node | ComponentTypeEither<{}>>() => Ref<Type>;

/** Describes what kind of def it is.
 * - Compared to treeNode.type, we have extra: "content" | "element" | "fragment". But don't have "root" (or ""). */
type MixDOMDefType = "dom" | "content" | "element" | "portal" | "boundary" | "pass" | "contexts" | "fragment" | "host";
type MixDOMSpreadLinks = {
    /** This contains any true and copy passes. It's the point where the inner spread stopped processing, and the parent spread can continue from it. */
    passes: MixDOMDefTarget[];
    /** This contains any MixDOM.WithContent components, if they were not sure whether they actually have content or not (due to only having "pass" defs without any solid stuff).
     * - The structure is [ childDefs, withDef ], where childDefs are the children originally passed to the spread.
     */
    withs: [childDefs: MixDOMDefTarget[], withDef: MixDOMDefTarget & {
        props: {
            hasContent?: boolean;
        };
    }][];
};
interface MixDOMDefBase<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> {
    /** This is to distinguish from other objects as well as to define the type both in the same.
     * - That's why it's name so strangely (to distinguish from objects), but still somewhat sensibly to be readible.
     * - In earlier quick tests, it seemed (almost 2x) faster to use { _isDef: true} as opposed to creating a new class instance (without _isDef member). */
    MIX_DOM_DEF: MixDOMDefType;
    tag: MixDOMPostTag;
    childDefs: MixDOMDefApplied[] | MixDOMDefTarget[];
    /** The def should be skipped - used internally.
     * - Currently only used for type "content" for settings.noRenderValuesMode and "fragment" for withContent() and spread usage. */
    disabled?: boolean;
    key?: any;
    attachedRefs?: RefBase[];
    attachedSignals?: Partial<Record<string, SignalListener[0]>>;
    attachedContexts?: Partial<Record<string, Context | null>>;
    props?: Props;
    isArray?: boolean;
    scopeType?: "spread" | "spread-pass" | "spread-copy";
    scopeMap?: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>;
    spreadLinks?: MixDOMSpreadLinks;
    domContent?: MixDOMContentSimple | null;
    domHTMLMode?: boolean;
    domElement?: HTMLElement | SVGElement | null;
    domCloneMode?: MixDOMCloneNodeBehaviour | "" | null;
    domPortal?: Node | null;
    contentPass?: ContentClosure | null;
    contentPassType?: "pass" | "copy";
    getRemote?: () => ComponentRemoteType;
    host?: Host;
    hasPassWithin?: true;
    treeNode?: MixDOMTreeNode;
}
interface MixDOMDefDOM<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "dom";
    tag: DOMTags;
    props: Props;
    attachedRefs?: RefBase[];
}
interface MixDOMDefContent extends MixDOMDefBase {
    MIX_DOM_DEF: "content";
    tag: "" | DOMTags;
    domContent: MixDOMContentSimple;
    domHTMLMode?: false;
    props?: never;
}
interface MixDOMDefContentInner<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase {
    MIX_DOM_DEF: "content";
    tag: "" | DOMTags;
    domContent: MixDOMContentSimple;
    /** If true, sets the content as innerHTML. */
    domHTMLMode: true;
    props?: Props;
}
interface MixDOMDefElement<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "element";
    tag: "_";
    props: Props;
    domElement: HTMLElement | SVGElement | null;
    domCloneMode?: MixDOMCloneNodeBehaviour | "" | null;
}
interface MixDOMDefPortal<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "portal";
    tag: null;
    domPortal: Node | null;
    props?: never;
}
interface MixDOMDefBoundary<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "boundary";
    tag: MixDOMComponentTag;
    props: Props;
    /** Internal marker put on the applied def to mark that was passed in a content pass.
     * - This helps to form a parental chain of closures that pass the content down.
     * - This in turn helps to make WithContent feature work recursively.
     * - Note that alternatively this could be after-checked in contentClosure.preRefresh.
     *      * However, it's more performant to just go check for this while pairing defs.
     */
    hasPassWithin?: true;
}
interface MixDOMDefFragment extends MixDOMDefBase {
    MIX_DOM_DEF: "fragment";
    tag: null;
    isArray?: boolean;
    scopeType?: MixDOMDefBase["scopeType"];
    /** This helps to optimize nested spread processing, as well as handle WithContent recursively for spreads. */
    spreadLinks?: MixDOMDefBase["spreadLinks"];
    /** Scope map is used only on the applied def side.
     * - This is used to isolate the scopes for the pairing process.
     * - For example, any spread function outputs, and any content pass copies in them, should be isolated.
     * - This means, that when the root of the isolation is paired with a new target, the inner pairing will use this scope only - and nothing else can use it. */
    scopeMap?: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>;
}
interface MixDOMDefPass extends MixDOMDefBase {
    MIX_DOM_DEF: "pass";
    tag: null;
    contentPass?: ContentClosure | null;
    contentPassType?: "pass" | "copy";
    /** If is about a remote, this is assigned and gets the common static class part for a remote component. */
    getRemote?: () => ComponentRemoteType;
    props?: never;
}
interface MixDOMDefHost extends MixDOMDefBase {
    MIX_DOM_DEF: "host";
    tag: null;
    host: Host;
    props?: never;
}
type MixDOMDefTypesAll = MixDOMDefDOM | MixDOMDefContent | MixDOMDefContentInner | MixDOMDefElement | MixDOMDefPortal | MixDOMDefBoundary | MixDOMDefPass | MixDOMDefFragment | MixDOMDefHost;
interface MixDOMDefAppliedBase extends MixDOMDefBase {
    childDefs: MixDOMDefApplied[];
    action: "mounted" | "moved" | "updated";
    treeNode?: MixDOMTreeNode;
}
interface MixDOMDefTargetBase extends MixDOMDefBase {
    childDefs: MixDOMDefTarget[];
    treeNode?: never;
    action?: never;
}
type MixDOMDefApplied = MixDOMDefAppliedBase & MixDOMDefTypesAll;
type MixDOMDefTarget = MixDOMDefTargetBase & MixDOMDefTypesAll;
interface DefPseudo {
    MIX_DOM_DEF?: "";
    childDefs: MixDOMDefApplied[] | MixDOMDefTarget[];
    disabled?: boolean;
    type?: MixDOMDefType | "";
    tag?: any;
    isArray?: boolean;
    props?: Record<string, any> | MixDOMProcessedDOMProps;
    domElement?: HTMLElement | SVGElement | null;
    _skipDef?: true;
}
interface MixDOMDefTargetPseudo extends DefPseudo {
    childDefs: MixDOMDefTarget[];
    scopeType?: MixDOMDefFragment["scopeType"];
    scopeMap?: MixDOMDefFragment["scopeMap"];
}
interface MixDOMDefAppliedPseudo extends DefPseudo {
    childDefs: MixDOMDefApplied[];
    scopeType?: MixDOMDefFragment["scopeType"];
    scopeMap?: MixDOMDefFragment["scopeMap"];
    action?: MixDOMDefAppliedBase["action"];
    hasPassWithin?: true;
}

type MixDOMTreeNodeType = "dom" | "portal" | "boundary" | "pass" | "contexts" | "host" | "root";
interface MixDOMTreeNodeBase {
    /** The main type of the treeNode that defines how it should behave and what it contains.
     * The type "" is only used temporarily - it can only end up in treeNodes if there's an error. */
    type: MixDOMTreeNodeType | "";
    /** Normally, only the root has no parent, but all others do.
     * However, if we are talking about a treeNode that is no longer in the tree (= a dead branch),
     * .. then the parent is null, or one of the parents in the chain is null even though it's not a real root node. */
    parent: MixDOMTreeNode | null;
    /** The treeNodes inside - for navigation. */
    children: MixDOMTreeNode[];
    /** Every treeNode has a domNode reference. It refers to the NEAREST DOM ELEMENT DOWNWARDS from this treeNode.
     * - So if this treeNode is of "dom" type, it's actually its own node.
     * - But boundaries and other abstractions do not have their own dom node.
     * - Instead, it's updated UPWARDS (until meets a dom tag parent) from an actual treeNode with dom element upon create / remove / move.
     *   .. The reason for this weirdness is bookkeeping performance logic (see HostRender.findInsertionNodes).
     *   .. We do minimal bookkeeping for a very quick way to find where any node should be.*/
    domNode: DOMElement | Node | null;
    /** The boundary that produced this tree node - might be passed through content closures. */
    sourceBoundary: SourceBoundary | null;
    /** If refers to a boundary - either a custom class / functino or then a content passing boundary. */
    boundary?: MixDOMBoundary | null;
    /** The def tied to this particular treeNode. */
    def?: MixDOMDefApplied;
}
interface MixDOMTreeNodeBaseWithDef extends MixDOMTreeNodeBase {
    def: MixDOMDefApplied;
}
interface MixDOMTreeNodeEmpty extends MixDOMTreeNodeBase {
    type: "";
}
interface MixDOMTreeNodeRoot extends MixDOMTreeNodeBase {
    type: "root";
    def?: never;
}
interface MixDOMTreeNodeDOM extends MixDOMTreeNodeBaseWithDef {
    type: "dom";
    /** This exists only for treeNodes referring to dom elements (typeof appliedDef.tag === "string").
     * To avoid ever missing diffs, it's best to hold a memory for the props that were actually applied to a dom element.
     * Note. Like React, we do not want to read the state of the dom element due to 2 reasons:
     *   1. Reading from dom element is relatively slow (in comparison to reading property of an object).
     *   2. It's actually better for outside purposes that we only take care of our own changes to dom - not forcing things there (except create / destroy our own). */
    domProps: MixDOMProcessedDOMProps;
}
interface MixDOMTreeNodePortal extends MixDOMTreeNodeBaseWithDef {
    type: "portal";
    /** For portals, the domNode refers to the external container. */
    domNode: MixDOMTreeNodeBase["domNode"];
}
interface MixDOMTreeNodeBoundary extends MixDOMTreeNodeBaseWithDef {
    type: "boundary";
    /** This will be set to the treeNode right after instancing the source boundary. */
    boundary: SourceBoundary;
}
interface MixDOMTreeNodePass extends MixDOMTreeNodeBaseWithDef {
    type: "pass";
    /** This will be set to the treeNode right after instancing the content boundary.
     * - It's null only if there's no content, otherwise there's a content boundary.*/
    boundary: ContentBoundary | null;
}
interface MixDOMTreeNodeHost extends MixDOMTreeNodeBaseWithDef {
    type: "host";
}
type MixDOMTreeNode = MixDOMTreeNodeEmpty | MixDOMTreeNodeDOM | MixDOMTreeNodePortal | MixDOMTreeNodeBoundary | MixDOMTreeNodePass | MixDOMTreeNodeHost | MixDOMTreeNodeRoot;

interface CSSProperties extends Partial<Omit<CSSStyleDeclaration, "item" | "getPropertyPriority" | "getPropertyValue" | "removeProperty" | "setProperty" | CSSNumericKeys> & Record<CSSNumericKeys, string | number>> {
    [index: number]: never;
}
/** Some commonly used CSS properties that can receive numeric input. */
type CSSNumericKeys = "borderWidth" | "borderBottomWidth" | "borderLeftWidth" | "borderRightWidth" | "borderTopWidth" | "bottom" | "columnGap" | "flexGrow" | "flexShrink" | "fontWeight" | "gap" | "gridColumnEnd" | "gridColumnGap" | "gridColumnStart" | "gridRowEnd" | "gridRowGap" | "gridRowStart" | "height" | "inset" | "left" | "margin" | "marginBottom" | "marginLeft" | "marginRight" | "marginTop" | "maxWidth" | "maxHeight" | "minWidth" | "minHeight" | "offsetDistance" | "opacity" | "order" | "outlineWidth" | "padding" | "paddingTop" | "paddingBottom" | "paddingLeft" | "paddingRight" | "right" | "rowGap" | "scrollMargin" | "scrollMarginBlock" | "scrollMarginBlockEnd" | "scrollMarginBlockStart" | "scrollMarginBottom" | "scrollMarginInline" | "scrollMarginInlineEnd" | "scrollMarginInlineStart" | "scrollMarginLeft" | "scrollMarginRight" | "scrollMarginTop" | "scrollPadding" | "scrollPaddingBlock" | "scrollPaddingBlockEnd" | "scrollPaddingBlockStart" | "scrollPaddingBottom" | "scrollPaddingInline" | "scrollPaddingInlineEnd" | "scrollPaddingInlineStart" | "scrollPaddingLeft" | "scrollPaddingRight" | "scrollPaddingTop" | "stopOpacity" | "strokeWidth" | "strokeOpacity" | "tabIndex" | "tabSize" | "top" | "width" | "zIndex";
type DOMTags = HTMLTags | SVGTags;
type DOMElement = HTMLElement | SVGElement;
type ListenerAttributeNames = keyof ListenerAttributesAll;
type ListenerAttributes = {
    [Name in keyof ListenerAttributesAll]?: ListenerAttributesAll[Name] | null;
};
type SVGAttributes<Tag extends SVGTags = SVGTags> = Omit<SVGAttributesBy[Tag], "style" | "class" | "className"> & Partial<ListenerAttributesAll>;
type HTMLSVGAttributes<Tag extends DOMTags = DOMTags, Other = never> = [Tag] extends [HTMLTags] ? HTMLAttributes<Tag> : [Tag] extends [SVGTags] ? SVGAttributes<Tag> : Other;
type HTMLSVGAttributesBy = {
    [Tag in DOMTags]: HTMLSVGAttributes<Tag>;
};
type MixDOMDoubleRenderer<Props extends Record<string, any> = {}, State extends Record<string, any> = {}> = (props: Props, state: State) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;
type MixDOMBoundary = SourceBoundary | ContentBoundary;
type MixDOMSourceBoundaryId = string;
type MixDOMPseudoTag<Props extends Record<string, any> = {}> = ([Props] extends [PseudoFragmentProps] ? typeof PseudoFragment<Props> : never) | ([Props] extends [PseudoElementProps] ? typeof PseudoElement<HTMLTags | SVGTags, Props> : never) | ([Props] extends [PseudoPortalProps] ? typeof PseudoPortal<Props> : never) | ([Props] extends [PseudoEmptyProps] ? typeof PseudoEmpty<Props> : never);
type MixDOMComponentTag<Props extends Record<string, any> = {}> = ComponentTypeAny<Props> | MixDOMPseudoTag<Props>;
type MixDOMPreTag = DOMTags | MixDOMPseudoTag | MixDOMComponentTag;
type MixDOMPostTag = "" | "_" | DOMTags | MixDOMComponentTag | null;
/** This tag conversion is used for internal tag based def mapping. The MixDOMDefTarget is the MixDOM.ContentPass.
 * The number type refers to the values of searchByTag in routinesPairing. */
type MixDOMDefKeyTag = MixDOMPostTag | MixDOMDefTarget | typeof PseudoFragment | Host | number;
type MixDOMHydrationItem = {
    tag: DOMTags;
    node: Element | SVGElement | Node;
    parent: MixDOMHydrationItem | null;
    children?: MixDOMHydrationItem[];
    key?: any;
    used?: boolean;
};
/** Should return true like value to accept, false like to not accept. */
type MixDOMHydrationValidator = (item: MixDOMHydrationItem | null, treeNode: MixDOMTreeNodeDOM, tag: DOMTags | "_" | "", key: any) => any;
/** Should return a Node or MixDOMHydrationItem to suggest, or null otherwise. */
type MixDOMHydrationSuggester = (item: MixDOMHydrationItem | null, treeNode: MixDOMTreeNodeDOM, tag: DOMTags | "_" | "", key: any) => Node | MixDOMHydrationItem | null;
interface MixDOMPreBaseProps {
    /** Disable the def altogether - including all contents inside. (Technically makes the def amount to null.) */
    _disable?: boolean;
    /** Attach key for moving the def around. */
    _key?: any;
    /** Attach one or many refs. */
    _ref?: RefBase | RefBase[];
}
interface MixDOMPreProps<Signals extends SignalsRecord = {}> extends MixDOMPreBaseProps {
    /** Attach signals. */
    _signals?: Partial<Signals> | null;
    /** Attach named contexts on a child component. Any changes in these will call component.contextAPI.setContext() accordingly. */
    _contexts?: Partial<Record<string, Context | null>> | null;
}
/** Dev. note. The current decision is to rely on JSX global declaration and not include MixDOMPreComponentProps into each Component type (including funcs) or constructor(props).
 * - However, the _signals are reliant on having more typed info to be used nicely. So that's why we have this type specifically. The _signals will not be there during the render cycle, tho.
 * - Note that above decision relies mainly on two things: 1. The JSX intrinsic declaration is anyway needed for DOM elements, 2. It's very confusing to have _key and _disable appearing in the type inside render method / func.
 */
type MixDOMPreComponentOnlyProps<Signals extends SignalsRecord = {}> = {
    /** Attach signals to component. Exceptionally the _signals prop is exposed even tho it will not be there during the render cycle. It's exposed due to getting better typing experience when using it in TSX. */
    _signals?: Partial<ComponentSignals & Signals> | null;
    /** Attach named contexts on a child component. Any changes in these will call component.contextAPI.setContext() accordingly. */
    _contexts?: Partial<Record<string, Context | null>> | null;
};
type MixDOMPreComponentProps<Signals extends SignalsRecord = {}> = MixDOMPreBaseProps & MixDOMPreComponentOnlyProps<Signals>;
/** This combines all the internal dom props together: "_key", "_ref", "_disable" and _"signals" with its dom specific listeners. */
interface MixDOMPreDOMProps extends MixDOMPreBaseProps {
    /** The common DOM signals are the same as with Refs: "domDidAttach", "domWillDetach", "domDidMount", "domDidUpdate", "domDidContent", "domDidMove" and "domWillUnmount". */
    _signals?: Partial<RefDOMSignals> | null;
}
/** This includes all the internal dom props (_key, _ref, ...) as well as common attributes (class, className, style, data, ...) and any specific for the given DOM tag. */
type MixDOMPreDOMTagProps<Tag extends DOMTags = DOMTags> = MixDOMPreDOMProps & HTMLSVGAttributes<Tag, {}> & ListenerAttributes & MixDOMCommonDOMProps;
interface MixDOMCommonDOMProps {
    class?: string;
    className?: string;
    style?: CSSProperties | string;
    data?: Record<string, any>;
}
/** These are any DOM props excluding internal props (like _key, _ref, ...), but also including HTML and SVG attributes (including listeners) by inputting Tag. */
type MixDOMDOMProps<Tag extends DOMTags = DOMTags> = HTMLSVGAttributes<Tag, {}> & ListenerAttributes & MixDOMCommonDOMProps;
/** Post props don't contain key, ref. In addition className and class have been merged, and style processed to a dictionary. */
type MixDOMProcessedDOMProps = {
    className?: string;
    style?: CSSProperties;
    data?: Record<string, any>;
};
/** Meant for JSX.
 * - Generic support for "_key", "_ref" and "_disable" props (by catch phrase).
 *      * Note that for components, the "_signals" prop is component specific, so uses the initial props on constructor or func.
 *      * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMPreComponentProps included.
 * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
 *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
 */
type IntrinsicAttributesBy = {
    [CompOrEl: string]: MixDOMPreProps | MixDOMPreComponentProps;
} & {
    [Tag in keyof HTMLSVGAttributesBy]: MixDOMPreDOMProps & MixDOMCommonDOMProps;
} & HTMLSVGAttributesBy;
type MixDOMContentNull = null | undefined;
type MixDOMContentValue = string | number;
type MixDOMContentSimple = MixDOMContentValue | Node;
type MixDOMRenderOutputSingle = MixDOMDefTarget | MixDOMContentSimple | MixDOMContentNull | Host;
interface MixDOMRenderOutputMulti extends Array<MixDOMRenderOutputSingle | MixDOMRenderOutputMulti> {
}
type MixDOMRenderOutput = MixDOMRenderOutputSingle | MixDOMRenderOutputMulti;
interface MixDOMComponentUpdates<Props extends Record<string, any> = {}, State = {}> {
    props?: Props;
    state?: State;
    force?: boolean | "all";
}
/** Defines how often components should render after updates (how onShouldUpdate works).
 * - "always" means they will always re-render. You should use this only for debugging.
 * - "changed" means they will render if the reference has changed.
 * - "shallow" means they will render if any prop (of an object/array) has changed. This is the default for most.
 * - "double" is like "shallow" but any prop value that is object or array will do a further shallow comparison to determine if it has changed.
 * - "deep" compares all the way down recursively. Only use this if you it's really what you want - never use it with recursive objects (= with direct or indirect self references).
 */
type MixDOMUpdateCompareMode = "never" | "always" | "changed" | "shallow" | "double" | "deep";
/** Defines how often components should update for each updatable type: props, state, context.
 * - If type not defined, uses the default value for it.
 * - Note that the pure checks only check those types that have just been changed.
 */
interface MixDOMUpdateCompareModesBy {
    props: MixDOMUpdateCompareMode | number;
    state: MixDOMUpdateCompareMode | number;
}
/** Differences made to a dom element. Note that this never includes tag changes, because it requires creating a new element. */
interface MixDOMDOMDiffs {
    /** If no attributes, no changes in general attributes. If value in the dictionary is undefined means removed. */
    attributes?: Record<string, any>;
    /** If no listeners, no changes in listeners. If value in the dictionary is undefined means removed. */
    listeners?: Record<string, any>;
    /** If no style, no changes in styles. If value in the dictionary is undefined means removed. */
    style?: CSSProperties;
    /** If no data, no changes in data attribute. If value in the dictionary is undefined means removed. */
    data?: Record<string, any>;
    /** If no classNames, no changes in class names. The keys are class names: for each, if true class name was added, if false name was removed. */
    classNames?: Record<string, boolean>;
}
/** This info is used for executing rendering changes to dom for a given appliedDef (which is modified during the process).
 * - If props is given it modifies the class, style and attributes of the element. This modifies the .domProps in the appliedDef.
 * - If create info is provided, creates a new dom element.
 * - If move info is provided, moves the given element to the new location.
 * - If destroy is provided, removes the element from dom and from appliedDef.domElement.
 */
interface MixDOMRenderInfoBase {
    treeNode: MixDOMTreeNode;
    remove?: boolean;
    create?: boolean;
    move?: boolean;
    emptyMove?: boolean;
    update?: boolean;
    content?: boolean;
    swap?: boolean | Node;
    refresh?: boolean | "read";
}
interface MixDOMRenderInfoBoundary extends MixDOMRenderInfoBase {
    treeNode: MixDOMTreeNodeBoundary | MixDOMTreeNodePass;
    remove?: true;
    create?: false;
    update?: false;
    content?: false;
    move?: false | never;
    swap?: false;
}
interface MixDOMRenderInfoDOMLike extends MixDOMRenderInfoBase {
    treeNode: MixDOMTreeNodeDOM | MixDOMTreeNodePortal;
    swap?: boolean | Node;
    remove?: true;
    create?: true;
    move?: true;
    update?: true;
    content?: true;
}
interface MixDOMRenderInfoHost extends MixDOMRenderInfoBase {
    treeNode: MixDOMTreeNodeHost;
    remove?: boolean;
    create?: boolean;
    move?: boolean;
    update?: false;
    content?: false;
    swap?: false;
}
type MixDOMRenderInfo = MixDOMRenderInfoBoundary | MixDOMRenderInfoDOMLike | MixDOMRenderInfoHost;
/** This only includes the calls that can be made after the fact: onUnmount is called before (so not here). */
type MixDOMSourceBoundaryChangeType = "mounted" | "updated" | "moved";
type MixDOMSourceBoundaryChange = [boundary: SourceBoundary, changeType: MixDOMSourceBoundaryChangeType, prevProps?: Record<string, any>, prevState?: Record<string, any>];
type MixDOMChangeInfos = [MixDOMRenderInfo[], MixDOMSourceBoundaryChange[]];

/** Include this once in your project in a file included in TS/TSX compilation:
 *
 * ```
import { JSX as _JSX } from "mix-dom";
declare global {
    namespace JSX {
        interface IntrinsicElements extends _JSX.IntrinsicElements {}
        interface IntrinsicAttributes extends _JSX.IntrinsicAttributes {}
    }
}
```
 */
declare namespace JSX {
    /** This gives support for:
     * - It adds generic support for "_key", "_ref" and "_disable" props (by catch phrase)
     *      * Note however that the "_signals" prop is component specific, so uses the initial props on constructor or func.
     *          * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMPreComponentProps included.
     *      * Similarly the "_contexts" prop is gotten through the props, even though it's not component specific (though could be, but it's not necessarily desired).
     * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
     *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
     */
    interface IntrinsicElements extends IntrinsicAttributesBy {
    }
    /** This is needed for components mostly. The IntrinsicElements gets ignored for them when defines precise typing: eg. (props: SomeProps).
     * - However, IntrinsicAttributes then brings those to all (dom and components), so we provide here the three basic: "_key", "_ref" and "_disable".
     * - We leave "_signals" and "_contexts" to be found on the init props if looks in there. */
    interface IntrinsicAttributes extends MixDOMPreBaseProps {
    }
}

declare const MixDOMContent: MixDOMDefTarget;
declare const MixDOMContentCopy: MixDOMDefTarget;

declare function parseStyle(cssText: string): CSSProperties;
/** Returns a string to be used as class name (with no duplicates and optional nested TypeScript verification).
 * - Each item in the classNames can be:
 *     1. ValidName (single className string),
 *     2. Array<ValidName>,
 *     3. Record<ValidName, any>.
 *     + If you want to use the validation only for Arrays and Records but not Strings, add 2nd parameter `string` to the type: `classNames<ValidName, string>`
 * - Unfortunately, the name validation inputted here only works for Array and Record types, and single strings.
 * - To use concatenated class name strings (eg. "bold italic"), you should:
 *     1. Declare a validator by: `const classNames: ValidateNames<ValidName> = MixDOM.classNames;`
 *     2. Then use it like this: `const okName = classNames("bold italic", ["bold"], {"italic": false, "bold": true})`;
 */
declare function classNames<ValidNames extends string = string, SingleName extends string = ValidNames>(...classNames: Array<MixDOMPreClassName<ValidNames, SingleName> | "" | false | 0 | null | undefined>): string;

/** Create a rendering definition. Supports receive direct JSX compiled output. */
declare function newDef<DOMTag extends DOMTags>(domTag: DOMTag, origProps?: MixDOMPreDOMTagProps<DOMTag> | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
declare function newDef<Props extends Record<string, any>>(componentTag: MixDOMComponentTag<Props>, origProps?: (MixDOMPreComponentProps & Props) | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
declare function newDef<Props extends MixDOMPreDOMTagProps | MixDOMPreComponentProps>(tag: MixDOMPreTag, origProps?: Props | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
/** Create a new def from a html string. Returns a def for a single html element
 * - If a wrapInTag given will use it as a container.
 * - Otherwise, if the string refers to multiple, returns an element containing them (with settings.renderHTMLDefTag).
 * - Normally uses a container only as a fallback if has many children.
 */
declare function newDefHTML(innerHTML: string, wrapInTag?: DOMTags, props?: MixDOMPreDOMTagProps, key?: any): MixDOMDefTarget;
declare function newContentCopyDef(key?: any): MixDOMDefTarget;

/** Create a new context. */
declare const newContext: <Data extends Record<string, any> = {}, Signals extends SignalsRecord = SignalsRecord>(data?: Data | undefined, settings?: Partial<ContextSettings>) => Context<Data, Signals>;
/** Create multiple named contexts by giving data. */
declare const newContexts: <Contexts extends { [Name in keyof AllData & string]: Context<AllData[Name], {}>; }, AllData extends Record<string, Record<string, any>> = { [Name_1 in keyof Contexts & string]: Contexts[Name_1]["data"]; }>(contextsData: AllData, settings?: Partial<ContextSettings>) => Contexts;
declare const MixDOM: {
    /** Create a new render definition. Can feed JSX input. (It's like `React.createElement` but `MixDOM.def`). */
    def: typeof newDef;
    /** Create a new def from a HTML string. Returns a def for a single HTML element.
     * - If a wrapInTag given will use it as a container.
     * - Otherwise, if the string refers to multiple, returns an element containing them (with settings.renderHTMLDefTag).
     * - Normally uses a container only as a fallback if has many children. */
    defHTML: typeof newDefHTML;
    /** Generic def for passing content.
     * - Use this to include content (~ React's props.children) from the parent component.
     * - Note that in the case of multiple contentPasses the first one in tree order is the real one.
     *   .. If you deliberately want to play with which is the real one and which is a copy, use MixDOM.ContentCopy or MixDOM.copyContent(someKey) for the others. */
    Content: MixDOMDefTarget;
    /** A custom component (func) that can be used for conditional inserting.
     * - For example: `<WithContent><span class="title">{MixDOM.Content}</span></WithContent>`
     *      * Results in `<span class="title">...</span>`, where ... is the actual content passed (by parent).
     *      * However, if there was no actual content to pass (`null` or `undefined`), then results in `null`.
     *      * Note that if the parent passes {MixDOM.Content}, then it is something and will render with the wrapping (so does not work recursively).
     * - Note that if the component ever needs to "handle" the children, or be refreshed when they change, should put the related info as `props`.
     *      * For example, `{ props.children: MixDOMRenderOutput[]; }`. Or even better as: `{ props.items: MyItem[]; }` and then create the defs within from the MyItem info.
     *      * You can then also easily detect if there are any children/items and do conditional rendering accordingly.
     * - Note that prior to v3.1, this feature worked technically differently.
     *      * Now it's implemented in a much simpler way, only drawback being the lack of recursive support, but benefit being that parent won't have to re-render (and ~4kB less minified code).
     */
    WithContent: ComponentType<WithContentInfo>;
    /** A generic shortcut for a content copy.
     * .. We give it a unique key ({}), so that it can be widely moved around.
     * .. In the case you use multiple ContentCopy's, then reuses each widely by tree order. */
    ContentCopy: MixDOMDefTarget;
    /** Use this method to create a copy of the content that is not swappable with the original render content.
     * - This is very rarely useful, but in the case you want to display the passed content multiple times,
     *   this allows to distinguish from the real content pass: `{ MixDOM.Content }` vs. `{ MixDOM.copyContent("some-key") }` */
    copyContent: typeof newContentCopyDef;
    Component: typeof Component;
    ComponentMixin: mixin_types.AsMixin<ComponentType<{}>, any[]>;
    Host: typeof Host;
    Ref: typeof Ref;
    /** Fragment represent a list of render output instead of stuff under one root.
     * Usage example: `<MixDOM.Fragment><div/><div/></MixDOM.Fragment>` */
    Fragment: typeof PseudoFragment;
    /** Portal allows to insert the content into a foreign dom node.
     * Usage example: `<MixDOM.Portal container={myDOMElement}><div/></MixDOM.Portal>` */
    Portal: typeof PseudoPortal;
    /** This allows to use an existing dom element as if it was part of the system.
     * So you can modify its props and such. */
    Element: typeof PseudoElement;
    /** Empty dummy component that accepts any props, but always renders null. */
    Empty: typeof PseudoEmpty;
    /** This is an empty dummy remote class:
     * - Its purpose is to make writing render output easier (1. no empty checks, and 2. for typing):
     *     * For example: `const MyRemote = component.state.PopupRemote || MixDOM.EmptyRemote;`
     *     * You can then access the Content and ContentCopy members, and copyContent(key) and withContent(...contents) methods fluently.
     * - However, they will just return null, so won't have any effect on anything.
     *     * Note also that technically speaking this class extends PseudoEmpty.
     *     * And it only adds the 2 public members (Content and ContentCopy) and 2 public methods (copycontent and withContent).
     *     * Due to not actually being a remote, it will never be used as a remote. It's just a straw dog.
     * - If you need to distinguish between real and fake, use `isRemote()` method. The empty returns false.
     *     * For example, to set specific content listening needs, you can use a memo - run it on render or .onBeforeUpdate callback.
     *     * Memo onMount: `(NewRemote: ComponentRemoteType) => NewRemote.isRemote() && component.contentAPI.needsFor(NewRemote, true);`
     *     * MEmo onUnmount: `(OldRemote: ComponentRemoteType) => OldRemote.isRemote() && component.contentAPI.needsFor(OldRemote, null);`
     */
    EmptyRemote: ComponentRemoteType;
    /** Create a Host instance to orchestrate rendering. */
    newHost: <Contexts extends data_signals.ContextsAllType = {}>(content?: MixDOMRenderOutput, container?: HTMLElement | null | undefined, settings?: HostSettingsUpdate | null | undefined, contexts?: Contexts | undefined) => Host<Contexts>;
    /** Create a Ref instance. */
    newRef: <Type extends Node | ComponentTypeEither<{}> = Node | ComponentTypeEither<{}>>() => Ref<Type>;
    /** Create a Context instance. */
    newContext: <Data extends Record<string, any> = {}, Signals extends SignalsRecord = SignalsRecord>(data?: Data | undefined, settings?: Partial<ContextSettings>) => Context<Data, Signals>;
    /** Create multiple named Contexts as a dictionary. Useful for attaching them to a ContextAPI - and for getting the combined type for TypeScript purposes. */
    newContexts: <Contexts_1 extends { [Name in keyof AllData & string]: Context<AllData[Name], {}>; }, AllData extends Record<string, Record<string, any>> = { [Name_1 in keyof Contexts_1 & string]: Contexts_1[Name_1]["data"]; }>(contextsData: AllData, settings?: Partial<ContextSettings>) => Contexts_1;
    /** Alias for createComponent. Create a functional component. You get the component as the first parameter, and optionally contextAPI as the second if you define 2 args: (component, contextAPI). */
    component: typeof createComponent;
    /** Create a functional component with ContextAPI. The first initProps is omitted: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
    componentWith: <Info extends Partial<ComponentInfo<{}, {}, {}, {}, any, {}>> = {}>(func: (component: ComponentCtx<Info> & Info["class"], contextAPI: ComponentContextAPI<Info["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<Info["props"] & {}, Info["state"] & {}>, name?: string) => ComponentFuncCtx<Info>;
    /** Create a shadow component omitting the first initProps: (component). The contextAPI is if has 2 arguments (component, contextAPI).
     * - Shadow components are normal components, but they have a ShadowAPI attached as component.constructor.api.
     * - This allows the components to be tracked and managed by the parenting scope who creates the unique component class (whose instances are tracked).
    */
    shadow: typeof createShadow;
    /** Create a shadow component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
    shadowWith: <Info_1 extends Partial<ComponentInfo<{}, {}, {}, {}, any, {}>> = {}>(func: (component: ComponentShadow<Info_1>, contextAPI: ComponentContextAPI<Info_1["contexts"] & {}>) => MixDOMRenderOutput | MixDOMDoubleRenderer<NonNullable<Info_1["props"]>, NonNullable<Info_1["state"]>>, signals?: Partial<ComponentExternalSignalsFor<ComponentShadow<{}>, ComponentSignals<{}>>> | null | undefined, name?: string) => ComponentShadowFuncWith<Info_1>;
    /** Create a SpreadFunc - it's actually just a function with 0 or 1 arguments: (props?).
     * - It's the most performant way to render things (no lifecycle, just spread out with its own pairing scope).
     * - Note that this simply gives back the original function, unless it has more than 1 arguments, in which case an intermediary function is created.
     *      * This intermediary function actually supports feeding in more arguments - this works since a func with (props, ...args) actually has length = 1.
     *      * If you want to include the props and extra arguments typing into the resulting function use the MixDOM.spreadWith function instead (it also automatically reads the types).
     */
    spread: <Props extends Record<string, any> = {}>(func: (props: Props, ...args: any[]) => MixDOMRenderOutput) => SpreadFunc<Props>;
    /** Create a SpreadFunc by automatically reading the types for Props and ExtraArgs from the given function. See MixDOM.spread for details.
     * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
     */
    spreadWith: <Props_1 extends Record<string, any>, ExtraArgs extends any[]>(func: (props: Props_1, ...args: ExtraArgs) => MixDOMRenderOutput) => SpreadFuncWith<Props_1, ExtraArgs>;
    /** Create a ComponentRemote class for remote flow (in / out).
     * - For example, `export const MyRemote = MixDOM.createRemote();`.
     * - And then to feed content in a render method: `<MyRemote>Some content..</MyRemote>`.
     * - Finally insert it somewhere in a render method: `{MyRemote.Content}`.
    */
    remote: () => ComponentRemoteType;
    /** Creates an intermediary component (function) to help produce extra props to an inner component.
     *      * It receives its parent `props` normally, and then uses its `state` for the final props that will be passed to the inner component (as its `props`).
     * - About arguments:
     *      1. The optional Builder function builds the common external props for all wired instances. These are added to the component's natural props.
     *      2. The optional Mixer function builds unique props for each wired instance. If used, the common props are fed to it and the output of the mixer instead represents the final props to add.
     *      3. The only mandatory argument is the component to be used in rendering, can be a spread func, too. It's the one that receives the mixed props: from the tree flow and from the wiring source by handled by Mixer and Builder functions.
     *      4. Finally you can also define the name of the component (useful for debugging).
     * - Technically this method creates a component function (but could as well be a class extending Component).
     *      - The important thing is that it's a unique component func/class and it has `api` member that is of `WiredAPI` type (extending `ShadowAPI`).
     *      - When the component is instanced, its static class side contains the same `api` which serves as the connecting interface between the driver and all instances.
     *      - This class can then allow to set and refresh the common props, and trigger should-updates for all the instances and use signals.
     *      - The `WiredAPI` extension contains then features related to the automated mixing of parent props and custom data to produce final state -> inner component props.
     * - Note that when creates a stand alone wired component (not through Component component's .createWired method), you should drive the updates manually by .setProps.
     */
    wired: typeof createWired;
    /** This returns the original function (to create a mixin class) back but simply helps with typing.
     * - The idea of a mixin is this: `(Base) => class extends Base { ... }`. So it creates a new class that extends the provided base class.
     *     * In the context of Components the idea is that the Base is Component and then different features are added to it.
     *     * Optionally, when used with mixComponentMixins the flow also supports adding requirements (in addition to that the Base is a Component class).
     * - To use this method: `const MyMixin = MixDOM.mixin<RequiresInfo, MyMixinInfo>(Base => class _MyMixin extends Base { ... }`
     *     * Without the method: `const MyMixin = (Base: GetComponentTypeFrom<RequireInfo>) => class _MyMixin extends (Base as GetComponentTypeFrom<RequireInfo & MyMixinInfo>) { ... }`
     *     * So the trick of this method is simply that the returned function still includes `(Base: Required)`, but _inside_ the func it looks like `(Base: Required & Added)`.
    */
    mixin: typeof createMixin;
    /** This mixes many component functions together. Each should look like: `(initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer`.
     * - Note that this only "purely" mixes the components together (on the initial render call).
     *      * By default does not put a renderer function in the end but just passes last output (preferring funcs, tho). If you want make sure a renderer is in the end, put last param to true: `(...funcs, true)`
     *      * Compare this with `MixDOM.mixFuncsWith(..., composer)`, that always returns a renderer. (And its last argument is auto-typed based on all previous.)
     * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
     *      * Note that you should only use `ComponentFunc` or `ComponentFuncMixable`. Not supported for spread functions (makes no sense) nor component classes (not supported for this flow, see mixComponentClassFunc instead).
     *      * You should type each function most often with `ComponentFunc<Info>` type or `MixDOM.component<Info>()` method. If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
     * - This also supports handling contextual needs (by a func having 3 args) as well as attaching / merging ShadowAPI | WiredAPI.
     * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
     *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
     *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
     */
    mixFuncs: typeof mixComponentFuncs;
    /** This mixes many component functions together. Each should look like: (initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer.
     * - Unlike MixDOM.mixFuncs, the last argument is a mixable func that should compose all together, and its typing comes from all previous combined.
     *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
     *      * Alternatively you can add them to the 2nd last function with: `SomeMixFunc as ComponentFunc<ReadComponentInfo<typeof SomeMixFunc, ExtraInfo>>`.
     * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
     *      * Note that you should only use ComponentFunc or ComponentFuncMixable. Not supported for spread functions (makes no sense) nor component classes (not supported).
     *      * You should type each function most often with ComponentFunc<Info> or MixDOM.component<Info>(). If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
     * - This also supports handling contextual needs (by a func having 3 args) as well as attaching / merging ShadowAPI | WiredAPI.
     * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
     *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
     *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
     */
    mixFuncsWith: typeof mixComponentFuncsWith;
    /** This mixes together a Component class and one or many functions.
     * - By default, attaches the return of the last function as the renderer (if function type, otherwise an earlier one).
     * - Optionally as the 3rd arg, can provide a boolean to use the class renderer instead. */
    mixClassFuncs: typeof mixComponentClassFuncs;
    /** This mixes together a Component class and one or many functions with a composer function as the last function.
     * - The last function is always used as the renderer and its typing is automatic.
     *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
     */
    mixClassFuncsWith: typeof mixComponentClassFuncsWith;
    /** Mix many mixins together with a custom Component class as the basis to mix on: `(MyClass, MyMixin1, MyMixin2, ...)`.
     * - Note. The last mixin with a render method defined is used as the render method of the combined class.
     * - Note. If you don't want to define a custom component class as the base, you can use the `MixDOM.mixMixins` function instead (which uses the Component class). These two funcs are split to get better typing experience.
     * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
    */
    mixClassMixins: typeof mixComponentClassMixins;
    /** Mix many mixins together into using the basic Component class as the basis to mix on: `(MyMixin1, MyMixin2, ...)`.
     * - Note. The last mixin with a render method defined is used as the render method of the combined class.
     * - Note. If you want to define a custom base class (extending Component) you can use `MixDOM.mixClassMixins` method whose first argument is a base class.
     * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
     */
    mixMixins: typeof mixComponentMixins;
    /** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ..., ComposerMixin)`
     * - Note. The last mixin is assumed to be the one to do the rendering and its type is combined from all the previous + the optional extra info given as the very last argument.
     * - This is like MixDOM.mixFuncsWith but for mixins. On the javascript this function is teh same as MixDOM.mixMixins.
     */
    mixMixinsWith: typeof mixComponentMixinsWith;
    /** This creates a final component for a list of HOCs with a based component: `(Base, HOC1, HOC2, ... )`
     * - Note that conceptually HOCs are not very performant as they create extra intermediary components.
     * - Consider using mixFuncs or mixMixins concepts instead. They are like HOCs merged into one component with a dynamic base.
     */
    mixHOCs: typeof mixHOCs;
    findTreeNodesIn: (treeNode: MixDOMTreeNode, types?: SetLike<MixDOMTreeNodeType>, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined) => MixDOMTreeNode[];
    findComponentsIn: <Comp extends ComponentTypeAny<{}> = ComponentTypeAny<{}>>(treeNode: MixDOMTreeNode, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined) => Comp[];
    findElementsIn: <T extends Node = Node>(treeNode: MixDOMTreeNode, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: ((treeNode: MixDOMTreeNode) => any) | undefined) => T[];
    queryElementIn: <T_1 extends Element = Element>(treeNode: MixDOMTreeNode, selector: string, inNested?: boolean, overHosts?: boolean) => T_1 | null;
    queryElementsIn: <T_2 extends Element = Element>(treeNode: MixDOMTreeNode, selector: string, maxCount?: number, inNested?: boolean, overHosts?: boolean) => T_2[];
    /** Read html content as string from the given treeNode, component or boundary.
     * Typically used with Host having settings.disableRendering (and settings.renderTimeout = null). */
    readAsString: (from: MixDOMTreeNode | Component | MixDOMBoundary) => string;
    /** Returns a string to be used as class name (with no duplicates and optional nested TypeScript verification).
     * - Each item in the classNames can be:
     *     1. ValidName (single className string),
     *     2. Array<ValidName>,
     *     3. Record<ValidName, any>.
     *     + If you want to use the validation only for Arrays and Records but not Strings, add 2nd parameter `string` to the type: `CleanClassName<ValidName, string>`
     * - Unfortunately, the name validation inputted here only works for Array and Record types, and single strings.
     * - To use concatenated class name strings (eg. "bold italic"), you should:
     *     1. Declare a validator by: `const cleanNames: ValidateNames<ValidName> = MixDOM.classNames;`
     *     2. Then use it like this: `const okName = cleanNames("bold italic", ["bold"], {"italic": false, "bold": true})`;
     */
    classNames: typeof classNames;
    /** Convert a style cssText string into a dictionary with capitalized keys.
     * - For example: "background-color: #aaa" => { backgroundColor: "#aaa" }.
     * - The dictionary format is used for easy detection of changes.
     *   .. As we want to respect any external changes and just modify based on our own. (For style, class and any attributes.) */
    parseStyle: typeof parseStyle;
};

export { CSSNumericKeys, CSSProperties, Component, ComponentContextAPI, ComponentCtx, ComponentExternalSignals, ComponentExternalSignalsFor, ComponentFunc, ComponentFuncAny, ComponentFuncCtx, ComponentFuncMixable, ComponentFuncOf, ComponentFuncRequires, ComponentHOC, ComponentHOCBase, ComponentInfo, ComponentInfoEmpty, ComponentInfoInterpretable, ComponentInstanceType, ComponentMixin, ComponentMixinType, ComponentOf, ComponentRemote, ComponentRemoteProps, ComponentRemoteType, ComponentShadow, ComponentShadowAPI, ComponentShadowCtx, ComponentShadowFunc, ComponentShadowFuncWith, ComponentShadowFuncWithout, ComponentShadowSignals, ComponentShadowType, ComponentSignals, ComponentSpread, ComponentSpreadProps, ComponentType, ComponentTypeAny, ComponentTypeCtx, ComponentTypeEither, ComponentTypeOf, ComponentWired, ComponentWiredAPI, ComponentWiredFunc, ComponentWiredType, DOMElement, DOMTags, ExtendsComponent, ExtendsComponents, GetComponentFrom, GetComponentFuncFrom, GetComponentTypeFrom, HTMLAttributes, HTMLElementType, HTMLSVGAttributes, HTMLSVGAttributesBy, HTMLTags, Host, HostContextAPI, HostContextAPIType, HostSettings, HostSettingsUpdate, HostType, IntrinsicAttributesBy, JSX, ListenerAttributeNames, ListenerAttributes, ListenerAttributesAll, MixDOM, MixDOMBoundary, MixDOMChangeInfos, MixDOMCloneNodeBehaviour, MixDOMCommonDOMProps, MixDOMComponentTag, MixDOMComponentUpdates, MixDOMContent, MixDOMContentCopy, MixDOMContentNull, MixDOMContentSimple, MixDOMContentValue, MixDOMDOMDiffs, MixDOMDOMProps, MixDOMDefApplied, MixDOMDefAppliedBase, MixDOMDefAppliedPseudo, MixDOMDefBoundary, MixDOMDefContent, MixDOMDefContentInner, MixDOMDefDOM, MixDOMDefElement, MixDOMDefFragment, MixDOMDefHost, MixDOMDefKeyTag, MixDOMDefPass, MixDOMDefPortal, MixDOMDefTarget, MixDOMDefTargetBase, MixDOMDefTargetPseudo, MixDOMDefType, MixDOMDefTypesAll, MixDOMDoubleRenderer, MixDOMHydrationItem, MixDOMHydrationSuggester, MixDOMHydrationValidator, MixDOMPostTag, MixDOMPreBaseProps, MixDOMPreClassName, MixDOMPreComponentOnlyProps, MixDOMPreComponentProps, MixDOMPreDOMProps, MixDOMPreDOMTagProps, MixDOMPreProps, MixDOMPrePseudoProps, MixDOMPreTag, MixDOMProcessedDOMProps, MixDOMPseudoTag, MixDOMRenderInfo, MixDOMRenderOutput, MixDOMRenderOutputMulti, MixDOMRenderOutputSingle, MixDOMRenderTextContentCallback, MixDOMRenderTextTag, MixDOMRenderTextTagCallback, MixDOMSourceBoundaryChange, MixDOMSourceBoundaryChangeType, MixDOMSourceBoundaryId, MixDOMTreeNode, MixDOMTreeNodeBoundary, MixDOMTreeNodeDOM, MixDOMTreeNodeEmpty, MixDOMTreeNodeHost, MixDOMTreeNodePass, MixDOMTreeNodePortal, MixDOMTreeNodeRoot, MixDOMTreeNodeType, MixDOMUpdateCompareMode, MixDOMUpdateCompareModesBy, MixDOMWithContent, NameValidator, PseudoElement, PseudoElementProps, PseudoEmpty, PseudoEmptyProps, PseudoEmptyRemote, PseudoFragment, PseudoFragmentProps, PseudoPortal, PseudoPortalProps, ReadComponentInfo, ReadComponentInfoFromArgsReturn, ReadComponentInfos, ReadComponentRequiredInfo, Ref, RefBase, RefComponentSignals, RefDOMSignals, RefSignals, RefType, SVGAriaAttributes, SVGAttributes, SVGAttributesBy, SVGCoreAttributes, SVGElementType, SVGGeneralAttributes, SVGGlobalAttributes, SVGGraphicalEventAttributes, SVGNativeAttributes, SVGPresentationalAttributes, SVGStylingAttributes, SVGTags, SpreadFunc, SpreadFuncWith, ValidateNames, WithContentInfo, classNames, createComponent, createComponentCtx, createMixin, createRemote, createShadow, createShadowCtx, createSpread, createSpreadWith, createWired, mergeShadowWiredAPIs, mixComponentClassFuncs, mixComponentClassFuncsWith, mixComponentClassMixins, mixComponentFuncs, mixComponentFuncsWith, mixComponentMixins, mixComponentMixinsWith, mixHOCs, newContext, newContexts, newDef, newDefHTML, newHost, newRef, parseStyle };
