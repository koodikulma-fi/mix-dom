
// - Imports - //

// Libraries.
import { CompareDataDepthMode } from "data-memo";
import { SignalsRecord, Context } from "data-signals";
import { DOMCleanProps, DOMTags, DOMAttributes, CSSProperties } from "dom-types";
// Only typing (local).
import { MixDOMDefTarget } from "./MixDOMDefs";
import { MixDOMTreeNode, MixDOMTreeNodeBoundary, MixDOMTreeNodeDOM, MixDOMTreeNodeHost, MixDOMTreeNodePass, MixDOMTreeNodePortal } from "./MixDOMTreeNode";
// Only typing (distant).
import { RefBase, RefDOMSignals } from "../common/Ref";
import { ContentBoundary } from "../boundaries/ContentBoundary";
import { SourceBoundary } from "../boundaries/SourceBoundary";
import { Host } from "../host/Host";
import { ComponentTypeAny } from "../components/typesVariants";
import { ComponentSignals } from "../components/typesSignals";
import { PseudoElement, PseudoElementProps, PseudoFragment, PseudoFragmentProps, PseudoPortal, PseudoPortalProps, PseudoEmpty, PseudoEmptyProps } from "../components/ComponentPseudos";


// - Component & Boundary - //

export type MixDOMDoubleRenderer<Props extends Record<string, any> = {}, State extends Record<string, any> = {}> = (props: Props, state: State) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;
export type MixDOMBoundary = SourceBoundary | ContentBoundary;
export type MixDOMSourceBoundaryId = string;


// - Tags - //

export type MixDOMPseudoTag<Props extends Record<string, any> = {}> =
    | ([Props] extends [PseudoFragmentProps] ? typeof PseudoFragment<Props> : never)
    | ([Props] extends [PseudoElementProps] ? typeof PseudoElement<DOMTags, Props> : never)
    | ([Props] extends [PseudoPortalProps] ? typeof PseudoPortal<Props> : never)
    | ([Props] extends [PseudoEmptyProps] ? typeof PseudoEmpty<Props> : never)
;
export type MixDOMComponentTag<Props extends Record<string, any> = {}> = ComponentTypeAny<{ props: Props; }> | MixDOMPseudoTag<Props>;
// export type MixDOMPreTag = DOMTags | MixDOMPseudoTag | typeof PseudoEmpty | MixDOMComponentTag;
export type MixDOMPreTag = DOMTags | MixDOMPseudoTag | MixDOMComponentTag;
export type MixDOMPostTag = "" | "_" | DOMTags | MixDOMComponentTag | null;
/** This tag conversion is used for internal tag based def mapping. The MixDOMDefTarget is the MixDOM.ContentPass.
 * The number type refers to the values of searchByTag in routinesPairing. */
export type MixDOMDefKeyTag = MixDOMPostTag | MixDOMDefTarget | typeof PseudoFragment | Host | number;


// - Virtual dom for hydration - //

// Type for hydration mapping.
export type MixDOMHydrationItem = {
    tag: DOMTags;
    node: Element | SVGElement | Node;
    parent: MixDOMHydrationItem | null;
    children?: MixDOMHydrationItem[];
    key?: any;
    used?: boolean;
};
/** Should return true like value to accept, false like to not accept. */
export type MixDOMHydrationValidator = (item: MixDOMHydrationItem | null, treeNode: MixDOMTreeNodeDOM, tag: DOMTags | "_" | "", key: any) => any;
/** Should return a Node or MixDOMHydrationItem to suggest, or null otherwise. */
export type MixDOMHydrationSuggester = (item: MixDOMHydrationItem | null, treeNode: MixDOMTreeNodeDOM, tag: DOMTags | "_" | "", key: any) => Node | MixDOMHydrationItem | null;


// - PRE Props - //

export interface MixDOMPreBaseProps {
    /** Disable the def altogether - including all contents inside. (Technically makes the def amount to null.) */
    _disable?: boolean;
    /** Attach key for moving the def around. */
    _key?: any;
    /** Attach one or many refs. */
    _ref?: RefBase | RefBase[];
}
export interface MixDOMPreProps<Signals extends SignalsRecord = {}> extends MixDOMPreBaseProps {
    /** Attach signals. */
    _signals?: Partial<Signals> | null;
    /** Attach named contexts on a child component. Any changes in these will call component.contextAPI.setContext() accordingly. */
    _contexts?: Partial<Record<string, Context | null>> | null;
}
/** Dev. note. The current decision is to rely on JSX global declaration and not include MixDOMPreComponentProps into each Component type (including funcs) or constructor(props).
 * - However, the _signals are reliant on having more typed info to be used nicely. So that's why we have this type specifically. The _signals will not be there during the render cycle, tho. 
 * - Note that above decision relies mainly on two things: 1. The JSX intrinsic declaration is anyway needed for DOM elements, 2. It's very confusing to have _key and _disable appearing in the type inside render method / func.
 */
export type MixDOMPreComponentOnlyProps<Signals extends SignalsRecord = {}> = {
    /** Attach signals to component. Exceptionally the _signals prop is exposed even tho it will not be there during the render cycle. It's exposed due to getting better typing experience when using it in TSX. */
    _signals?: Partial<ComponentSignals & Signals> | null;
    /** Attach named contexts on a child component. Any changes in these will call component.contextAPI.setContext() accordingly. */
    _contexts?: Partial<Record<string, Context | null>> | null;
}
export type MixDOMPreComponentProps<Signals extends SignalsRecord = {}> = MixDOMPreBaseProps & MixDOMPreComponentOnlyProps<Signals>;

/** This combines all the internal dom props together: "_key", "_ref", "_disable" and _"signals" with its dom specific listeners. */
export interface MixDOMPreDOMProps extends MixDOMPreBaseProps {
    /** The common DOM signals are the same as with Refs: "domDidAttach", "domWillDetach", "domDidMount", "domDidUpdate", "domDidContent", "domDidMove" and "domWillUnmount". */
    _signals?: Partial<RefDOMSignals> | null;
}
/** This includes all the internal dom props (_key, _ref, ...) as well as common attributes (class, className, style, data, ...) and any specific for the given DOM tag. */
export type MixDOMPreDOMTagProps<Tag extends string = DOMTags> = MixDOMPreDOMProps & DOMAttributes<Tag>;


// - POST Props - //

/** These are any DOM props excluding internal props (like _key, _ref, ...), but also including HTML and SVG attributes (including listeners) by inputting Tag. */
export type MixDOMDOMProps<Tag extends string = DOMTags> = DOMAttributes<Tag>;

/** Post props don't contain key, ref. In addition className and class have been merged, and style processed to a dictionary.
 * - For DOM related, the type is equal to DOMCleanTypes { className, style, data, listeners, attributes }, whereas for others, it's simply Record<string, any>.
 * - So, for DOM related, the rest of the props are found in { attributes }, while for non-DOM related the props are directly there.
 */
export type MixDOMProcessedDOMProps = DOMCleanProps;


// - Render output types - //

export type MixDOMContentNull = null | undefined;
export type MixDOMContentValue = string | number;
export type MixDOMContentSimple = MixDOMContentValue | Node;
export type MixDOMRenderOutputSingle = MixDOMDefTarget | MixDOMContentSimple | MixDOMContentNull | Host;
export interface MixDOMRenderOutputMulti extends Array<MixDOMRenderOutputSingle | MixDOMRenderOutputMulti> {} // This is a recursive type, might be nested array.
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
    props: CompareDataDepthMode | number;
    state: CompareDataDepthMode | number;
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

