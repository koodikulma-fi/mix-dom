
// - Imports - //

// Libraries.
import { CompareDepthMode } from "data-memo";
import { SignalsRecord, Context } from "data-signals";
import { DOMCleanProps, DOMTags, DOMAttributesAny_native, DOMAttributes_native, DOMAttributesAny_camelCase, DOMAttributes_camelCase } from "dom-types";
// Only typing (local).
import { MixDOMDefTarget } from "./MixDOMDefs";
import { MixDOMTreeNode, MixDOMTreeNodeBoundary, MixDOMTreeNodeDOM, MixDOMTreeNodeHost, MixDOMTreeNodePass, MixDOMTreeNodePortal } from "./MixDOMTreeNode";
// Only typing (distant).
import { Ref, RefDOMSignals } from "../common/Ref";
import { ContentBoundary } from "../boundaries/ContentBoundary";
import { SourceBoundary } from "../boundaries/SourceBoundary";
import { ComponentSignals } from "../components/typesSignals";
import { ComponentFuncAny, ComponentType, ComponentTypeEither } from "../components/Component";
import { PseudoFragment, MixDOMPseudoTags } from "../components/ComponentPseudos";
import { Host } from "../host/Host";


// - Component & Boundary - //

export type MixDOMDoubleRenderer<Props extends Record<string, any> = {}, State extends Record<string, any> = {}> = (props: Props, state: State) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;
export type MixDOMBoundary = SourceBoundary | ContentBoundary;
export type MixDOMSourceBoundaryId = string;


// - Tags - //

/** Any known MixDOM component related tags, from spread funcs to component ctx funcs to component classes and pseudo elements. */
export type MixDOMComponentTags = ComponentType<any> | ComponentFuncAny<any> | MixDOMPseudoTags<Record<string, any>>;
export type MixDOMTags = "" | "_" | DOMTags;
export type MixDOMAnyTags = MixDOMComponentTags | MixDOMTags | null;
/** This tag conversion is used for internal tag based def mapping. The MixDOMDefTarget is the MixDOM.ContentPass.
 * The number type refers to the values of searchByTag in routinesPairing. */
export type MixDOMDefKeyTag = MixDOMAnyTags | MixDOMDefTarget | typeof PseudoFragment | Host | number;


// - Virtual dom for reassimilation - //

// Type for reassimilation mapping.
export type MixDOMAssimilateItem = {
    tag: DOMTags;
    node: Element | SVGElement | Node;
    parent: MixDOMAssimilateItem | null;
    children?: MixDOMAssimilateItem[];
    key?: any;
    /** Can be used externally to exclude. */
    used?: boolean;
};
/** Should return true like value to accept, false like to not accept. */
export type MixDOMAssimilateValidator = (item: MixDOMAssimilateItem | null, treeNode: MixDOMTreeNodeDOM, tag: DOMTags | "_" | "", key: any) => any;
/** Should return a Node or MixDOMAssimilateItem to suggest, or null otherwise. */
export type MixDOMAssimilateSuggester = (item: MixDOMAssimilateItem | null, treeNode: MixDOMTreeNodeDOM, tag: DOMTags | "_" | "", key: any) => Node | MixDOMAssimilateItem | null;
/** Used for reassimilation (and as a basis for remounting). */
export interface MixDOMReassimilateInfo {
    /** The virtual item root.*/
    vRoot?: MixDOMAssimilateItem;
    /** Helper for virtualization. */
    vKeyedByTags?: Partial<Record<DOMTags, MixDOMAssimilateItem[]>>;
    /** Used for exclusion purposes. */
    reused?: Set<Node>;
    /** External validator (always optional). */
    validator?: MixDOMAssimilateValidator | null;
    /** External suggester (always optional). */
    suggester?: MixDOMAssimilateSuggester | null;
}
/** Used for the remount feature. */
export interface MixDOMRemountInfo extends MixDOMReassimilateInfo {
    /** Whether should read the attributes and/or text content from DOM before updating.
     * - If false, then will leave any existing attributes and content in place.
     * - If "attributes" (or true) ends up removing any old attributes (by first pre-reading the situation from the DOM element).
     * - If "content" (or true) re-reads the text content from text nodes. Technically, reapplies the text content for them and removes any unused text nodes.
     * - If true, then functions like "attributes" and "content" together.
     */
    readFromDOM?: boolean | "attributes" | "content";
    /** Whether should remove unused DOM elements. Note that any elements that were "loosely" matched to be inside a HTML def (that would use innerHTML) won't be affected - only the ones that were truely non-matched. */
    removeUnused?: boolean;
    /** Will be updated by HostRenderer. Collects all newly created nodes. */
    created?: Set<Node>;
    /** Will be updated by HostRenderer. Collects all unused nodes. */
    unused?: Set<Node>;
}


// - Props - //

/** Basis for the pre processed props. */
export interface MixDOMInternalBaseProps {
    /** Disable the def altogether - including all contents inside. (Technically makes the def amount to null.)
     * - Note that "_disable" is a special prop only available _outside_ - for components, it's not actually part of its props.
     */
    _disable?: boolean;
    /** Attach key for moving the def around.
     * - Note that "_key" is a special prop only available _outside_ - for components, it's not actually part of its props.
     */
    _key?: any;
}
/** All the 5 internal special props for components with typing: `{ _key, _disable, _ref, _signals, _contexts }`.
 * - As of v4.1, the main rule of thumb is consistency and clarity.
 *      * The JSX basis only contains `_key` and `_disable`, and thus only directly supports SpreadFuncs.
 *      * For components, should use ComponentProps for the initProps (1st arg) or the 1st constructor arg for classes.
 *      * For DOM, gets them by intrinsic tag based attributes.
 * - Accordingly, when uses ComponentProps gets the all the 5 special props: (`_disable`, `_key`, `_ref`, `_signals`, `_contexts`).
 *      * This is for clarity and consistency. It's more confusing to just get the 2 or 3 props that require typing and leave 2 or 3 others out.
 *      * It's also for better support for manually typed component funcs - eg. when uses generic props.
 * - For spreads can also specifically get the 2 (`_key` and `_disable`) with SpreadFuncProps. (The DOM types have 4: no `_contexts`.)
 */
export interface MixDOMInternalCompProps<Signals extends SignalsRecord = {}> extends MixDOMInternalBaseProps {

    // Re-commented from MixDOMInternalBaseProps.
    /** Disable the def altogether - including all contents inside. (Technically makes the def amount to null.)
     * - Note that "_disable" is a special prop only available _outside_ the component - it's not actually part of props.
     */
    _disable?: boolean;
    /** Attach key for moving the def around.
     * - Note that "_key" is a special prop only available _outside_ the component - it's not actually part of props.
     */
    _key?: any;

    // Component special props.
    /** Attach one or many refs. (Not available for SpreadFuncs.)
     * - Note that "_ref" is a special prop only available _outside_ the component - it's not actually part of props.
     */
    _ref?: Ref<ComponentTypeEither<any>> | Ref<ComponentTypeEither<any>>[]; // RefBase | RefBase[];
    /** Attach signals to a child component directly through props. (Not available for SpreadFuncs.)
     * - Note that "_signals" is a special prop only available _outside_ the component - it's not actually part of props.
     */
    _signals?: Partial<ComponentSignals & Signals> | null;
    /** Attach named contexts on a child component. Any changes call component.contextAPI.setContext() accordingly. (Not available for SpreadFuncs.)
     * - Note that "_contexts" is a special prop only available _outside_ the component - it's not actually part of props.
     */
    _contexts?: Partial<Record<string, Context | null>> | null;
}

/** This combines all the 4 internal DOM related special props together: "_key", "_ref", "_disable" and "_signals" with its DOM specific listeners. */
export interface MixDOMInternalDOMProps extends MixDOMInternalBaseProps {

    // Re-commented from MixDOMInternalBaseProps.
    /** Disable the DOM node altogether - including all contents inside. (Technically makes the def amount to null.) */
    _disable?: boolean;
    /** Attach key for moving the DOM node around. */
    _key?: any;

    /** Attach one or many refs to keep track of the DOM nodes.
     * - Note that "_ref" is a special prop that will not be applied as an attribute, but instead it implements the Ref feature.
     */
    _ref?: Ref<Node> | Ref<Node>[]; // RefBase | RefBase[];
    /** The common DOM signals are the same as with Refs: "domDidAttach", "domWillDetach", "domDidMount", "domDidUpdate", "domDidContent", "domDidMove" and "domWillUnmount".
     * - Note that "_signals" is a special prop that will not be applied as an attribute, but instead it implements the direct signal listening feature.
     */
    _signals?: Partial<RefDOMSignals> | null;
}

// Dom props.
/** The spelling modes available for DOM attributes. Default is "mixedCase". Used in MixDOMPreProps, MixDOMProps, PseudoElementProps and GetPropsFor type helpers (and related JS methods for deffing). */
export type MixDOMCase = "native" | "camelCase" | "mixedCase";
/** Contains tag based DOM attributes including internal DOM props (_key, _ref, _disabled, _signals).
 * - The DOM attributes contain the common attributes (class, className, style, data, ...) and any specific for the given DOM tag.
 * - To define the "native" vs. "camelCase" spelling for DOM attributes, define the 2nd argument. Defaults to "mixedCase", so allows both.
 */
export type MixDOMPreProps<Tag extends string = any, DOMCase extends MixDOMCase = "mixedCase"> = MixDOMInternalDOMProps & MixDOMProps<Tag, DOMCase>;

/** Contains tag based DOM attributes _without_ the internal DOM props (_key, _ref, _disabled, _signals).
 * - This is the same as DOMAttributes from the "dom-types" library, but can define DOMCase as the 2nd type arg: "native" | "camelCase" | "mixedCase". Defaults to "mixedCase".
 */
export type MixDOMProps<Tag extends string = any, DOMCase extends MixDOMCase = "mixedCase"> =
    DOMCase extends "camelCase" ? DOMTags extends Tag ? DOMAttributesAny_camelCase : DOMAttributes_camelCase<Tag> :
    DOMCase extends "native" ? DOMTags extends Tag ? DOMAttributesAny_native : DOMAttributes_native<Tag> :
    DOMTags extends Tag ? DOMAttributesAny_camelCase & DOMAttributesAny_native : DOMAttributes_camelCase<Tag> & DOMAttributes_native<Tag>;

/** Post props don't contain key, ref. In addition className and class have been merged, and style processed to a dictionary.
 * - For DOM related, the type is equal to DOMCleanTypes { className, style, data, listeners, attributes }, whereas for others, it's simply Record<string, any>.
 * - So, for DOM related, the rest of the props are found in { attributes }, while for non-DOM related the props are directly there.
 */
export type MixDOMProcessedDOMProps = DOMCleanProps;


// - Render output types - //

type MixDOMContentNull = null | undefined;
export type MixDOMContentSimple = string | number | Node;
type MixDOMRenderOutputSingle = MixDOMDefTarget | MixDOMContentSimple | Host | MixDOMContentNull;
interface MixDOMRenderOutputMulti extends Array<MixDOMRenderOutputSingle | MixDOMRenderOutputMulti> {} // This is a recursive type, might be nested array.
export type MixDOMRenderOutput = MixDOMRenderOutputSingle | MixDOMRenderOutputMulti;


// - Update related - //

export interface MixDOMComponentUpdates<Props extends Record<string, any> = {}, State = {}> {
    props?: Props;
    state?: State;
    force?: boolean | "all";
}

/** Defines how often components should update for each updatable type: props, state, context.
 * - If type not defined, uses the default value for it.
 * - Note that the pure checks only check those types that have just been changed.
 */
export interface MixDOMUpdateCompareModesBy {
    props: CompareDepthMode | number;
    state: CompareDepthMode | number;
}


// - Change & render infos - //

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
export type MixDOMRenderInfo = MixDOMRenderInfoBoundary | MixDOMRenderInfoDOMLike | MixDOMRenderInfoHost;

/** This only includes the calls that can be made after the fact: onUnmount is called before (so not here). */
export type MixDOMSourceBoundaryChangeType = "mounted" | "updated" | "moved";
export type MixDOMSourceBoundaryChange = [ boundary: SourceBoundary, changeType: MixDOMSourceBoundaryChangeType, prevProps?: Record<string, any>, prevState?: Record<string, any> ];
export type MixDOMChangeInfos = [ renderInfos: MixDOMRenderInfo[], boundaryChanges: MixDOMSourceBoundaryChange[] ];



// - - - - - - - //
// - Algoritms - //
// - - - - - - - //


// // - Merge classes - //

// /** Helper to merge classes. This is used for the related functionality for extendClass and mergeClasses methods. */
// export type MergeClasses<
//     A extends ClassType = ClassType,
//     B extends ClassType = ClassType,
//     C extends ClassType = ClassType,
//     D extends ClassType = ClassType,
//     E extends ClassType = ClassType,
//     F extends ClassType = ClassType,
//     G extends ClassType = ClassType,
//     H extends ClassType = ClassType,
//     I extends ClassType = ClassType,
//     J extends ClassType = ClassType,
//     Instance extends Object = InstanceType<A> & InstanceType<B> & InstanceType<C> & InstanceType<D> & InstanceType<E> & InstanceType<F> & InstanceType<G> & InstanceType<H> & InstanceType<I> & InstanceType<J>
// > = Omit<A & B & C & D & E & F & G & H & I & J, "new"> & { new (...args: any[]): Instance; };

