
// - Imports - //

// Local.
import { ListenerAttributesAll } from "./ListenerTypes";
import { HTMLAttributes, HTMLAttributes_lowercase, HTMLAttributes_mixedCase, HTMLTags } from "./HTMLTypes";
import { SVGAttributes, SVGAttributes_lowercase, SVGAttributes_mixedCase, SVGTags } from "./SVGTypes";


// - DOM - //

// Listeners.
export type ListenerAttributeNames = keyof ListenerAttributesAll;
export type ListenerAttributes = { [Name in keyof ListenerAttributesAll]?: ListenerAttributesAll[Name] | null; };

// DOM types: combining HTML and SVG.
export type DOMTags = HTMLTags | SVGTags;
export type DOMElement = HTMLElement | SVGElement;
export type DOMAttributes<Tag extends DOMTags = DOMTags, Other = never> = [Tag] extends [HTMLTags] ? HTMLAttributes<Tag> : [Tag] extends [SVGTags] ? SVGAttributes<Tag> : Other;
export type DOMAttributes_lowercase<Tag extends DOMTags = DOMTags, Other = never> = [Tag] extends [HTMLTags] ? HTMLAttributes_lowercase<Tag> : [Tag] extends [SVGTags] ? SVGAttributes_lowercase<Tag> : Other;
export type DOMAttributes_mixedCase<Tag extends DOMTags = DOMTags, Other = never> = [Tag] extends [HTMLTags] ? HTMLAttributes_mixedCase<Tag> : [Tag] extends [SVGTags] ? SVGAttributes_mixedCase<Tag> : Other;
export type DOMAttributesBy = { [Tag in DOMTags]: DOMAttributes<Tag>; };
export type DOMAttributesBy_lowercase = { [Tag in DOMTags]: DOMAttributes_lowercase<Tag>; };
export type DOMAttributesBy_mixedCase = { [Tag in DOMTags]: DOMAttributes_mixedCase<Tag>; };
