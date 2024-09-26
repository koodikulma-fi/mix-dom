
// - Imports - //

// Local.
import { SVGAttributesBy, SVGTags } from "./SVGTypes";
import { HTMLAttributes, HTMLTags, ListenerAttributesAll } from "./HTMLTypes";


// - HTML & SVG - //

export interface CSSProperties extends Partial<Omit<CSSStyleDeclaration, "item" | "getPropertyPriority" | "getPropertyValue" | "removeProperty" | "setProperty" | CSSNumericKeys> & Record<CSSNumericKeys, string | number>> {
    [index: number]: never;
};
/** Some commonly used CSS properties that can receive numeric input. */
export type CSSNumericKeys = 
    | "borderWidth"
    | "borderBottomWidth"
    | "borderLeftWidth"
    | "borderRightWidth"
    | "borderTopWidth"
    | "bottom"
    | "columnGap"
    | "flexGrow"
    | "flexShrink"
    | "fontWeight"
    | "gap"
    | "gridColumnEnd"
    | "gridColumnGap"
    | "gridColumnStart"
    | "gridRowEnd"
    | "gridRowGap"
    | "gridRowStart"
    | "height"
    | "inset"
    | "left"
    | "margin"
    | "marginBottom"
    | "marginLeft"
    | "marginRight"
    | "marginTop"
    | "maxWidth"
    | "maxHeight"
    | "minWidth"
    | "minHeight"
    | "offsetDistance"
    | "opacity"
    | "order"
    | "outlineWidth"
    | "padding"
    | "paddingTop"
    | "paddingBottom"
    | "paddingLeft"
    | "paddingRight"
    | "right"
    | "rowGap"
    | "scrollMargin"
    | "scrollMarginBlock"
    | "scrollMarginBlockEnd"
    | "scrollMarginBlockStart"
    | "scrollMarginBottom"
    | "scrollMarginInline"
    | "scrollMarginInlineEnd"
    | "scrollMarginInlineStart"
    | "scrollMarginLeft"
    | "scrollMarginRight"
    | "scrollMarginTop"
    | "scrollPadding"
    | "scrollPaddingBlock"
    | "scrollPaddingBlockEnd"
    | "scrollPaddingBlockStart"
    | "scrollPaddingBottom"
    | "scrollPaddingInline"
    | "scrollPaddingInlineEnd"
    | "scrollPaddingInlineStart"
    | "scrollPaddingLeft"
    | "scrollPaddingRight"
    | "scrollPaddingTop"
    | "stopOpacity"
    | "strokeWidth"
    | "strokeOpacity"
    | "tabIndex"
    | "tabSize"
    | "top"
    | "width"
    | "zIndex"
;

export type DOMTags = HTMLTags | SVGTags;
export type DOMElement = HTMLElement | SVGElement;
export type ListenerAttributeNames = keyof ListenerAttributesAll;
export type ListenerAttributes = { [Name in keyof ListenerAttributesAll]?: ListenerAttributesAll[Name] | null; };
export type SVGAttributes<Tag extends SVGTags = SVGTags> = Omit<SVGAttributesBy[Tag], "style" | "class" | "className"> & Partial<ListenerAttributesAll>;
export type HTMLSVGAttributes<Tag extends DOMTags = DOMTags, Other = never> = [Tag] extends [HTMLTags] ? HTMLAttributes<Tag> : [Tag] extends [SVGTags] ? SVGAttributes<Tag> : Other;
export type HTMLSVGAttributesBy = { [Tag in DOMTags]: HTMLSVGAttributes<Tag>; };

/** Combined type for `HTMLAttributes & SVGAttributes`. */
export type DOMAttributes = HTMLAttributes & SVGAttributes;
