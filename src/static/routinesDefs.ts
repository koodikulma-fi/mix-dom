
// - Imports - //

// Typing.
import {
    MixDOMProcessedDOMProps,
    MixDOMDefTarget,
    MixDOMDefType,
    MixDOMDefApplied,
    MixDOMPreTag,
    MixDOMComponentTag,
    MixDOMRenderOutput,
    MixDOMContentValue,
    DOMTags,
    MixDOMPreComponentProps,
    MixDOMPreDOMTagProps,
    MixDOMPreBaseProps
} from "../typing";
// Routines.
import { cleanDOMProps } from "./routinesDOM";
// Only typing (distant).
import { Ref } from "../common/Ref";
import { ContentClosure } from "../boundaries/ContentClosure";
import { Host } from "../host/Host";
import { PseudoPortalProps, PseudoElementProps } from "../components/ComponentPseudos";
import { SpreadFunc, ComponentSpreadProps } from "../components/ComponentSpread";
import { ComponentRemoteType } from "../components/ComponentRemote";


// - Constant - //

/** A unique but common to all key for MixDOM.Content defs - used unless specifically given a key. */
const contentKey: {} = {};


// - Create def helpers - //

/** Create a rendering definition. Supports receive direct JSX compiled output. */
export function newDef<DOMTag extends DOMTags>(domTag: DOMTag, origProps?: MixDOMPreDOMTagProps<DOMTag> | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
export function newDef<Props extends Record<string, any>>(componentTag: MixDOMComponentTag<Props>, origProps?: (MixDOMPreComponentProps & Props) | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
export function newDef<Props extends MixDOMPreDOMTagProps | MixDOMPreComponentProps>(tag: MixDOMPreTag, origProps?: Props | null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null;
export function newDef(tagOrClass: MixDOMPreTag, origProps: Record<string, any> | null = null, ...contents: MixDOMRenderOutput[]): MixDOMDefTarget | null {
    // Get type.
    const defType = getMixDOMDefType(tagOrClass);
    if (!defType || origProps && (origProps as MixDOMPreBaseProps)._disable)
        return null;
    // Add childDefs to the def.
    const childDefs: MixDOMDefTarget[] = [];
    let wasText = false;
    let iContent = 0;
    for (const content of contents) {
        // Let's join adjacent string content together - there's no need to create a textNode for each.
        // .. This improves performance: 1. less dom operations, 2. less stuff (= less processing).
        let isText = typeof content === "string";
        if (content && isText && wasText) {
            childDefs[iContent-1].domContent += content as string;
            continue;
        }
        // Create def.
        const def = newDefFrom(content);
        if (def) {
            iContent = childDefs.push(def);
            wasText = isText;
        }
    }

    // Static, render immediately and return the def.
    if (defType === "spread")
        return unfoldSpread(tagOrClass as SpreadFunc, origProps || {}, childDefs);

    // Special case - return null, if the def is practically an empty fragment (has no simple content either).
    // .. Note that due to how the flow works, this functions like a "remove empty fragments recursively" feature.
    // .... This is because the flow goes up: first children defs are created, then they are fed to its parent def's creation as content, and so on.
    // .... So we don't need to do (multiple) recursions down, but instead do a single check in each scope, and the answer is ready when it's the parent's turn.
    if (defType === "fragment" && !childDefs[0])
        return null;

    // Create the basis for the def.
    const tag = defType === "dom" && tagOrClass as DOMTags || defType === "boundary" && tagOrClass as MixDOMComponentTag || defType === "element" && "_" || (defType === "content" ? "" : null);
    const targetDef = {
        MIX_DOM_DEF: defType,
        tag,
        childDefs
    } as MixDOMDefTarget;

    // Props.
    const needsProps = !!tag;
    if (targetDef.MIX_DOM_DEF === "fragment") {}
    else if (origProps) {
        // Copy.
        const { _key, _ref, _signals, _contexts, _disable, ...passProps } = origProps;
        if (_key != null)
            targetDef.key = _key;
        if (_ref) {
            const forwarded: Ref[] = [];
            if (_ref.constructor["MIX_DOM_CLASS"] === "Ref")
                forwarded.push(_ref as Ref);
            else {
                for (const f of (_ref as Ref[]))
                    if (f && f.constructor["MIX_DOM_CLASS"] === "Ref" && forwarded.indexOf(f) === -1)
                        forwarded.push(f);
            }
            targetDef.attachedRefs = forwarded;
        }
        if (_signals) // Note. These will only be handled for "boundary" and dom-like.
            targetDef.attachedSignals = { ..._signals };
        if (_contexts && defType === "boundary")
            targetDef.attachedContexts = { ..._contexts };
        if (needsProps)
            targetDef.props = typeof tag === "string" ? cleanDOMProps(passProps) : passProps as MixDOMProcessedDOMProps;
    }
    // Empty props.
    else if (needsProps)
        targetDef.props = {};

    // Specialities.
    switch(targetDef.MIX_DOM_DEF) {
        case "portal": {
            const props = (origProps || {}) as PseudoPortalProps;
            targetDef.domPortal = props.container || null;
            break;
        }
        case "element": {
            const props = (origProps || {}) as PseudoElementProps;
            targetDef.domElement = props.element || null;
            targetDef.domCloneMode = props.cloneMode != null ? (typeof props.cloneMode === "boolean" ? (props.cloneMode ? "deep" : "") : props.cloneMode) : null;
            delete targetDef.props["element"];
            delete targetDef.props["cloneMode"];
            break;
        }
    }
    // Return def.
    return targetDef;
}

/** Create a new def from a html string. Returns a def for a single html element
 * - If a wrapInTag given will use it as a container.
 * - Otherwise, if the string refers to multiple, returns an element containing them (with settings.renderHTMLDefTag).
 * - Normally uses a container only as a fallback if has many children.
 */
export function newDefHTML(innerHTML: string, wrapInTag?: DOMTags, props?: MixDOMPreDOMTagProps, key?: any): MixDOMDefTarget {
    // Create def.
    const def: MixDOMDefTarget = {
        MIX_DOM_DEF: "content",
        tag: wrapInTag || "",
        childDefs: [],
        domContent: innerHTML,
        domHTMLMode: true
    };
    // Attach props.
    if (wrapInTag && props)
        def.props = cleanDOMProps(props);
    // Attach key.
    if (key != null)
        def.key = key;
    // Return def.
    return def;
};

// Create a def out of the content.
export function newDefFrom(renderContent: MixDOMRenderOutput): MixDOMDefTarget | null {

    // Object type.
    if (renderContent && (typeof renderContent === "object")) {
        // Def - we check it first, because it's the most common. (Although typescript would prefer it below by neglating other options.)
        if (typeof renderContent["MIX_DOM_DEF"] === "string") {
            // We pass defs directly, as they contents have been cleaned already.
            // .. At least for practical performance reasons, we assume that - let's not account for external def hacks.
            return renderContent as MixDOMDefTarget;
        }
        // Dom node.
        if (renderContent instanceof Node) {
            return {
                MIX_DOM_DEF: "content",
                tag: "",
                childDefs: [],
                domContent: renderContent
            };
        }
        // Host.
        if (renderContent.constructor["MIX_DOM_CLASS"] === "Host") {
            return {
                MIX_DOM_DEF: "host",
                tag: null,
                host: renderContent as Host,
                key: renderContent, // Unique key, so does wide.
                childDefs: [],
            };
        }
        // Is an array or array like.
        if (Array.isArray(renderContent) || renderContent instanceof HTMLCollection || renderContent instanceof NodeList) {
            // Process array with localKeys support.
            const childDefs = [...renderContent].map(item => newDefFrom(item)).filter(def => def) as MixDOMDefTarget[];
            if (!childDefs.length)
                return null;
            // Create a single fragment item to hold the array and mark as array.
            return {
                MIX_DOM_DEF: "fragment",
                tag: null,
                isArray: true,
                childDefs
            };
        }
        // Otherwise it's unknown data, stringify it.
        renderContent = String(renderContent) as MixDOMContentValue;
    }
    // Is simple content as a string or number.
    if (renderContent != null)
        return {
            MIX_DOM_DEF: "content",
            tag: "",
            domContent: renderContent,
            childDefs: [],
        };
    // Is empty.
    return null;
}

/** Copies everything from targetDef that defines its type, but not any "updatable" properties (except key). */
export function newAppliedDef(targetDef: MixDOMDefTarget, contentClosure: ContentClosure | null): MixDOMDefApplied {
    // Basics.
    const aDef = {
        MIX_DOM_DEF: targetDef.MIX_DOM_DEF,
        tag: targetDef.tag,
        childDefs: [],
        action: "mounted"
    } as MixDOMDefApplied;
    if (targetDef.key != null)
        aDef.key = targetDef.key;
    // Other non-changing based on type.
    if (aDef.MIX_DOM_DEF === "fragment") {
        if (targetDef.isArray)
            aDef.isArray = true;
        if (targetDef.scopeType)
            aDef.scopeType = targetDef.scopeType;
    }
    // Content pass.
    else if (aDef.MIX_DOM_DEF === "pass") {
        if (targetDef.getRemote) {
            aDef.getRemote = targetDef.getRemote;
            aDef.contentPass = targetDef.contentPass || null;
        }
        else
            aDef.contentPass = targetDef.contentPass || contentClosure || null;
    }
    // Host.
    else if (targetDef.host)
        aDef.host = targetDef.host;
    // Return applied def ready to go.
    return aDef;
}

export function newContentPassDef(key?: any, isCopy? : boolean): MixDOMDefTarget {
    // Create basis.
    const def: MixDOMDefTarget = {
        MIX_DOM_DEF: "pass",
        tag: null,
        childDefs: [],
        contentPassType: isCopy ? "copy" : "pass",
    };
    // Apply key.
    if (key != null)
        def.key = key;
    // We always need to have a key for true content pass.
    // .. and it should be unique and common to all MixDOM.Content defs unless specifically given a key.
    else if (!isCopy)
        def.key = contentKey;
    // Return def.
    return def;
}

export function newContentCopyDef(key?: any): MixDOMDefTarget {
    return newContentPassDef(key, true);
}


// - Helpers - //

/** The method to call and unfold spread func's render defs. (This functionality is paired with other parts in _Apply.)
 * - The returned defs are wrapped in a fragment that provides scoping detection - unless returned null, then also returns null.
 * - The children fed here are the cleaned childDefs that should replace any content pass.
 * - Note that this renders the spread func and then goes over its targetDefs while also copying the new structure and modifying it. */
export function unfoldSpread<Props extends Record<string, any> = {}>(spreadFunc: SpreadFunc, origProps: ComponentSpreadProps & Props, children: MixDOMDefTarget[]): MixDOMDefTarget | null {
    // Render.
    const { _key, _disable, ...props } = origProps;
    let preDef = newDefFrom( spreadFunc(props) );
    if (!preDef)
        return null;
    // We wrap everything in a fragment def marked as its own spread scope.
    const spreadLinks: MixDOMDefTarget["spreadLinks"] & {} = { passes: [], withs: [] };
    const baseDef: MixDOMDefTarget = {
        MIX_DOM_DEF: "fragment",
        childDefs: [ { ...preDef } ],
        scopeType: "spread",
        spreadLinks,
        tag: null
    };
    if (_key != null)
        baseDef.key = _key;
    if (_disable != null)
        baseDef.disabled = _disable;
    // Prepare to loop.
    let toLoop: MixDOMDefTarget[] = [ baseDef ];
    let pDef: MixDOMDefTarget | undefined;
    let hasTruePass = false;
    let iMain = 0;
    const hasKids = !!children[0];
    // Loop defs.
    // .. And copy the new structure as we go.
    while (pDef = toLoop[iMain]) {
        // Next.
        iMain++;
        // No kids - just go to the next (the branch ends - already processed).
        if (!pDef.childDefs[0])
            continue;
        // Prepare to process kids.
        let newLoop: MixDOMDefTarget[] = [];
        const childDefs = pDef.childDefs;
        pDef.childDefs = [];
        // Loop kids.
        for (const thisDef of childDefs) {
            // Prepare.
            let newDef: MixDOMDefTarget & { props?: { hasContent?: boolean | null; }; }; // For easier typing below.

            // Already handled by an inner spread function.
            // .. There's no point in re-processing the same stuff, so we just continue where it left off.
            if (thisDef.spreadLinks) {
                // We reuse the spread's root def directly.
                newDef = thisDef as typeof newDef;
                // If it had any content passes (that were converted to a fragments), just add them to our loop.
                // .. We'll continue where the inner spread left off with the passes.
                newLoop = newLoop.concat(thisDef.spreadLinks.passes);
                // And we handle any WithContent usage with our better knowledge (from up the flow).
                // .. Note that the withs only contains infos for those WithContent components that are in "maybe" state.
                for (const [cDefs, withDef] of thisDef.spreadLinks.withs) {
                    // Update the props with our new value.
                    // .. It's already been copied once (see below), so we can just mutate the props.
                    const hasContent = cDefs && hasContentInDefs(cDefs, hasKids);
                    withDef.props.hasContent = !!hasContent;
                    // Add to be checked again by a further parent, if we have one.
                    // .. So we continue to do this up the spreads, until we get a definitive answer for a question nested within.
                    // .. Note that in the end, we should always get a definitive answer, ultimately from the parentmost spread.
                    // .... This is because any "pass" defs were changed to the actual children (right below). So the questions have been answered within.
                    if (hasContent === "maybe")
                        spreadLinks.withs.push([cDefs, withDef]);
                }
            }

            // Handle local content passing.
            else if (thisDef.MIX_DOM_DEF === "pass") {
                // Like below, we ignore handling Remotes, and handle them in the source boundary instead.
                // .. Note also that for content pass, we don't handle the children - we just insert our pass inside.
                if (!thisDef.getRemote) {
                    // Create new def about a fragment.
                    newDef = { MIX_DOM_DEF: "fragment", tag: null, childDefs: [...children] };
                    // Add key.
                    if (thisDef.key != null)
                        newDef.key = thisDef.key;
                    // Mark copy - or that has true pass now.
                    if (hasTruePass || thisDef.contentPassType === "copy") {
                        newDef.scopeType = "spread-copy";
                    }
                    else {
                        newDef.scopeType = "spread-pass";
                        hasTruePass = true;
                    }
                    // Add to spread bookkeeping.
                    spreadLinks.passes.push(newDef);
                }
                // Just reuse a remote content pass - won't be in the next loop, so no need to copy. 
                else
                    newDef = thisDef;
            }
            // Not content pass.
            else {
                // Copy the def basis.
                newDef = { ...thisDef };
                // Only add to the loop if is not a content pass.
                newLoop.push(newDef);
                // Handle conditional - however ignore remote instances, as we don't know anything about their kids.
                // .. To ignore on instance side we use .getRemote, for the static side .withContents on the tag.
                if (thisDef.MIX_DOM_DEF === "boundary" && thisDef.tag["_WithContent"] && !thisDef.tag["_WithContent"].getRemote && !(thisDef.tag as ComponentRemoteType["WithContent"]).withContents) {
                    // Skip if had been specifically set by the user.
                    // .. Note that in that case any parenting spreads won't recognize this either - see the skip-spreads optimization above.
                    if (newDef.props?.hasContent == null) {
                        // Override the props with our answer.
                        const hasContent = hasContentInDefs(children, hasKids);
                        newDef.props = { hasContent: !!hasContent, ...newDef.props };
                        // Add to our links if needs more processing.
                        if (hasContent === "maybe")
                            spreadLinks.withs.push([children, newDef as any]);
                    }
                }
            }
            // Add.
            pDef.childDefs.push(newDef);
        }
        // Add to the loop, and cut earlier off.
        toLoop = newLoop.concat(toLoop.slice(iMain));
        iMain = 0;
    }
    // Return target - we might have modified it.
    return baseDef;
}

/** Note that "content" and "host" defs are created from the ...contents[], while "pass" type comes already as a def.
 * .. This gives any other type. If there's no valid type, returns "". */
export function getMixDOMDefType(tag: MixDOMPreTag): MixDOMDefType | "spread" | "" {
    // Dom.
    if (typeof tag === "string")
        return "dom";
    // Functions.
    const mixDOMClass = tag["MIX_DOM_CLASS"];
    if (!mixDOMClass)
        return typeof tag === "function" ? (tag.length >= 2 ? "boundary" : "spread") : "";
    // Class/Mixin or pseudo class.
    switch(mixDOMClass) {
        // Boundaries.
        case "Component":
        case "Remote":
            return "boundary";
        // For others below, we return the lower case type as it fits MixDOMDefType.
        case "Fragment":
        case "Portal":
        case "Element":
        case "Host":
            return mixDOMClass.toLowerCase() as MixDOMDefType;
        // Empty or other.
        // case "Empty":
        default:
            return "";
    }
}

/** Check recursively from applied or target defs, whether there's actually stuff that amounts to a content.
 * - To handle interpreting content passes, feed the handlePass boolean answer (when used in spreads), or callback (when used non-statically to use parent content closure).
 * - Note that this returns `"maybe"` if handlePass was `true` (or callback and said "maybe") and it was the only one in the game.
 * - However if there's anything solid anywhere, will return `true`. Otherwise then `false`, if it's all clear.
 */
export function hasContentInDefs<Def extends MixDOMDefApplied | MixDOMDefTarget> (childDefs: Array<Def>, handlePass: ((def: Def) => boolean | "maybe") | boolean): boolean | "maybe" {
    // Loop each.
    let maybe: false | "maybe" = false;
    for (const def of childDefs) {
        // Nope.
        if (def.disabled)
            continue;
        // Get our value.
        const answer: boolean | "maybe" =
            // If is a fragment, check deeply in it.
            def.MIX_DOM_DEF === "fragment" ? hasContentInDefs(def.childDefs as Def[], handlePass) : 
            // If is a pass, use our predefiend answer or callback.
            def.MIX_DOM_DEF === "pass" ? typeof handlePass === "function" ? handlePass(def) : handlePass && "maybe" :
            // Otherwise, it's something else - so we regard it as content (on the static side).
            true;
        // Got a solid no.
        if (!answer)
            continue;
        // Got a solid yes.
        if (answer === true)
            return true;
        // Potentially.
        maybe = "maybe";
    }
    // Return false or then "maybe" if had any content passes (and is on the static side).
    return maybe;
}
