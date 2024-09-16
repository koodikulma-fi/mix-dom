
// - Imports - //

// Libraries.
import { SignalsRecord, Context } from "data-signals";
// Local.
import { SVGAttributesBy, SVGTags } from "./SVGTypes";
import { HTMLAttributes, HTMLTags, ListenerAttributesAll } from "./HTMLTypes";
// Only typing (local).
import { MixDOMTreeNode, MixDOMTreeNodeBoundary, MixDOMTreeNodeDOM, MixDOMTreeNodeHost, MixDOMTreeNodePass, MixDOMTreeNodePortal } from "./MixDOMTreeNode";
import { MixDOMDefTarget } from "./MixDOMDefs";
// Only typing (distant).
import { RefBase, RefDOMSignals } from "../common/Ref";
import { ContentBoundary } from "../boundaries/ContentBoundary";
import { SourceBoundary } from "../boundaries/SourceBoundary";
import { Host } from "../host/Host";
import { ComponentTypeAny } from "../components/typesVariants";
import { ComponentSignals } from "../components/typesSignals";
import { PseudoElement, PseudoElementProps, PseudoFragment, PseudoFragmentProps, PseudoPortal, PseudoPortalProps, PseudoEmpty, PseudoEmptyProps } from "../components/ComponentPseudos";


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


// // - Node JS - //
//
// export interface NodeJSTimeout {
//     ref(): this;
//     unref(): this;
//     hasRef(): boolean;
//     refresh(): this;
//     [Symbol.toPrimitive](): number;
// }


// - Component & Boundary - //

export type MixDOMDoubleRenderer<Props extends Record<string, any> = {}, State extends Record<string, any> = {}> = (props: Props, state: State) => MixDOMRenderOutput | MixDOMDoubleRenderer<Props, State>;
export type MixDOMBoundary = SourceBoundary | ContentBoundary;
export type MixDOMSourceBoundaryId = string;


// - Tags - //

export type MixDOMPseudoTag<Props extends Record<string, any> = {}> =
    | ([Props] extends [PseudoFragmentProps] ? typeof PseudoFragment<Props> : never)
    | ([Props] extends [PseudoElementProps] ? typeof PseudoElement<HTMLTags | SVGTags, Props> : never)
    | ([Props] extends [PseudoPortalProps] ? typeof PseudoPortal<Props> : never)
    | ([Props] extends [PseudoEmptyProps] ? typeof PseudoEmpty<Props> : never)
;
export type MixDOMComponentTag<Props extends Record<string, any> = {}> = ComponentTypeAny<Props> | MixDOMPseudoTag<Props>;
// export type MixDOMPreTag = DOMTags | MixDOMPseudoTag | typeof PseudoEmpty | MixDOMComponentTag;
export type MixDOMPreTag = DOMTags | MixDOMPseudoTag | MixDOMComponentTag;
export type MixDOMPostTag = "" | "_" | DOMTags | MixDOMComponentTag | null;
/** This tag conversion is used for internal tag based def mapping. The MixDOMDefTarget is the MixDOM.ContentPass.
 * The number type refers to the values of searchTagByType in routinesPairing. */
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
export type MixDOMPreDOMTagProps<Tag extends DOMTags = DOMTags> = MixDOMPreDOMProps & HTMLSVGAttributes<Tag, {}> & ListenerAttributes & MixDOMCommonDOMProps;


// - POST Props - //

export interface MixDOMCommonDOMProps { 
    class?: string;
    className?: string;
    style?: CSSProperties | string;
    data?: Record<string, any>;
}
/** These are any DOM props excluding internal props (like _key, _ref, ...), but also including HTML and SVG attributes (including listeners) by inputting Tag. */
export type MixDOMDOMProps<Tag extends DOMTags = DOMTags> = HTMLSVGAttributes<Tag, {}> & ListenerAttributes & MixDOMCommonDOMProps;

/** Post props don't contain key, ref. In addition className and class have been merged, and style processed to a dictionary. */
export type MixDOMProcessedDOMProps = { className?: string; style?: CSSProperties; data?: Record<string, any>; };


// - JSX - Intrinsic attributes - //

/** Meant for JSX.
 * - Generic support for "_key", "_ref" and "_disable" props (by catch phrase).
 *      * Note that for components, the "_signals" prop is component specific, so uses the initial props on constructor or func.
 *      * This means, each component should be typed with shortcuts (eg. `ComponentFunc<Info>`). To do it manually initProps should have MixDOMPreComponentProps included.
 * - For each dom tag (= HTML & SVG tags), adds their attributes including listeners.
 *      * In addition, for each dom tag adds support for "_signals" related to dom changes.
 */
export type IntrinsicAttributesBy = { [CompOrEl: string]: MixDOMPreProps | MixDOMPreComponentProps; } & {[Tag in keyof HTMLSVGAttributesBy]: MixDOMPreDOMProps & MixDOMCommonDOMProps; } & HTMLSVGAttributesBy;


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

/** Defines how often components should render after updates (how onShouldUpdate works).
 * - "always" means they will always re-render. You should use this only for debugging.
 * - "changed" means they will render if the reference has changed.
 * - "shallow" means they will render if any prop (of an object/array) has changed. This is the default for most.
 * - "double" is like "shallow" but any prop value that is object or array will do a further shallow comparison to determine if it has changed.
 * - "deep" compares all the way down recursively. Only use this if you it's really what you want - never use it with recursive objects (= with direct or indirect self references).
 */
export type MixDOMUpdateCompareMode = "never" | "always" | "changed" | "shallow" | "double" | "deep";
/** Defines how often components should update for each updatable type: props, state, context.
 * - If type not defined, uses the default value for it.
 * - Note that the pure checks only check those types that have just been changed.
 */
export interface MixDOMUpdateCompareModesBy {
    props: MixDOMUpdateCompareMode | number;
    state: MixDOMUpdateCompareMode | number;
}


// - DOM diffs - //

/** Differences made to a dom element. Note that this never includes tag changes, because it requires creating a new element. */
export interface MixDOMDOMDiffs {
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
export type MixDOMChangeInfos = [ MixDOMRenderInfo[], MixDOMSourceBoundaryChange[] ];



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

