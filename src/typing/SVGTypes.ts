
// - Imports - //

// Local.
import { ListenerAttributesAll } from "./ListenerTypes";


// - Exports - //

// Tags and element.
export type SVGTags = keyof SVGElementTagNameMap;
export type SVGElementType<Tag extends SVGTags = SVGTags> = SVGElementTagNameMap[Tag] & SVGGlobalAttributes & (Tag extends keyof SVGManualAttributes ? SVGManualAttributes[Tag] : {});

// SVG attributes.
/** SVG element attributes by tag name with camelCase listener and aria attributes. */
export type SVGAttributes<Tag extends SVGTags = SVGTags> = Partial<Omit<SVGElementType<Tag>, CustomTypedAttributes | keyof GlobalEventHandlers>> & Partial<ListenerAttributesAll>;
/** SVG element attributes by tag name with lowercase listener and aria attributes. */
export type SVGAttributes_lowercase<Tag extends SVGTags = SVGTags> = Partial<Omit<SVGElementType<Tag>, CustomTypedAttributes | keyof ARIAMixin> & SVGAriaAttributes>;
/** SVG element attributes by tag name with both lowercase and camelCase listener and aria attributes. */
export type SVGAttributes_mixedCase<Tag extends SVGTags = SVGTags> = SVGAttributes_lowercase<Tag> & Partial<ListenerAttributesAll & ARIAMixin>;


// - Local typing - //

// Helper.
type CustomTypedAttributes = "style" | "class" | "className";

// Global attributes.
// type SVGGlobalAttributes = Partial<SVGCoreAttributes> & Partial<SVGPresentationalAttributes> & Partial<SVGStylingAttributes> & Partial<SVGCoreAttributes> & Partial<SVGGraphicalEventAttributes>;
type SVGGlobalAttributes = Partial<SVGPresentationalAttributes> & Partial<SVGStylingAttributes> & Partial<SVGNativeAttributes> & Partial<SVGGraphicalEventAttributes>;

// Manual additions.
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
    };
    circle: {
        "cx"?: SVGNativeAttributes["cx"];
        "cy"?: SVGNativeAttributes["cy"];
        "r"?: SVGNativeAttributes["r"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    };
    ellipse: {
        "cx"?: SVGNativeAttributes["cx"];
        "cy"?: SVGNativeAttributes["cy"];
        "rx"?: SVGNativeAttributes["rx"];
        "ry"?: SVGNativeAttributes["ry"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    };
    g: {};
    image: {
        "x"?: SVGNativeAttributes["x"];
        "y"?: SVGNativeAttributes["y"];
        "width"?: SVGNativeAttributes["width"];
        "height"?: SVGNativeAttributes["height"];
        "href"?: HTMLAnchorElement["href"];
        "xlink:href"?: SVGNativeAttributes["xlink:href"];
        "preserveAspectRatio"?: SVGNativeAttributes["preserveAspectRatio"];
        "crossorigin"?: SVGNativeAttributes["crossorigin"];
    };
    line: {
        "x1"?: SVGNativeAttributes["x1"];
        "y1"?: SVGNativeAttributes["y1"];
        "x2"?: SVGNativeAttributes["x2"];
        "y2"?: SVGNativeAttributes["y2"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    };
    path: {
        "d"?: SVGNativeAttributes["d"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    };
    polyline: {
        "points"?: SVGNativeAttributes["points"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    };
    polygon: {
        "points"?: SVGNativeAttributes["points"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    };
    rect: {
        "x"?: SVGNativeAttributes["x"];
        "y"?: SVGNativeAttributes["y"];
        "width"?: SVGNativeAttributes["width"];
        "height"?: SVGNativeAttributes["height"];
        "rx"?: SVGNativeAttributes["rx"];
        "ry"?: SVGNativeAttributes["ry"];
        "pathLength"?: SVGNativeAttributes["pathLength"];
    };
    use: {
        "href"?: HTMLAnchorElement["href"];
        "xlink:href"?: SVGNativeAttributes["xlink:href"];
        "x"?: SVGNativeAttributes["x"];
        "y"?: SVGNativeAttributes["y"];
        "width"?: SVGNativeAttributes["width"];
        "height"?: SVGNativeAttributes["height"];
    };
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

// Assuming these are all strings - didn't check.
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
