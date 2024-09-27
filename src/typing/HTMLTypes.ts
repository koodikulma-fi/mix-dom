
// - Imports - //

// Local.
import { ListenerAttributesAll } from "./ListenerTypes";


// - HTML related typing - //

// Tags and element.
/** All known HTML tag names. */
export type HTMLTags = keyof HTMLElementTagNameMap;
/** The native HTML element type by tag name. */
export type HTMLElementType<Tag extends HTMLTags = HTMLTags> = HTMLElementTagNameMap[Tag];

// HTML attributes.
/** HTML element attributes by tag name with camelCase listener and aria attributes. */
export type HTMLAttributes<Tag extends HTMLTags = HTMLTags> = Partial<Omit<HTMLElementType<Tag>, CustomTypedAttributes | keyof GlobalEventHandlers>> & Partial<ListenerAttributesAll>;
/** HTML element attributes by tag name with lowercase listener and aria attributes. */
export type HTMLAttributes_lowercase<Tag extends HTMLTags = HTMLTags> = Partial<Omit<HTMLElementType<Tag>, CustomTypedAttributes | keyof ARIAMixin> & HTMLAriaAttributes_lowercase>;
/** HTML element attributes by tag name with both lowercase and camelCase listener keys. */
export type HTMLAttributes_mixedCase<Tag extends HTMLTags = HTMLTags> = HTMLAttributes_lowercase<Tag> & Partial<ListenerAttributesAll & ARIAMixin>;


// - Local typing - //

// Helper.
type CustomTypedAttributes = "style" | "class" | "className" | "textContent" | "innerHTML" | "outerHTML" | "outerText" | "innerText";

// Assuming these are all strings - didn't check. From https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes.
interface HTMLAriaAttributes_lowercase {
    // Role.
    "role": string;
    // Aria (alphabetically).
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
    "aria-description": string;
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
}
