
// - Imports - //

// Libraries.
import { SignalListener, Context } from "data-signals";
import { DOMTags } from "dom-types";
// Local.
// Only typing (local).
import { MixDOMComponentTag, MixDOMContentSimple, MixDOMDefKeyTag, MixDOMPostTag, MixDOMProcessedDOMProps } from "./MixDOMTypes";
import { MixDOMTreeNode } from "./MixDOMTreeNode";
// Only typing (distant).
import { RefBase } from "../common/Ref";
import { ContentClosure } from "../boundaries/ContentClosure";
import { Host, MixDOMCloneNodeBehaviour } from "../host/Host";
import { ComponentRemote } from "../components/ComponentRemote";


// - Defs - //

/** Describes what kind of def it is.
 * - Compared to treeNode.type, we have extra: "content" | "element" | "fragment". But don't have "root" (or ""). */
export type MixDOMDefType = "dom" | "content" | "element" | "portal" | "boundary" | "pass" | "contexts" | "fragment" | "host";
type MixDOMSpreadLinks = {
    /** This contains any true and copy passes. It's the point where the inner spread stopped processing, and the parent spread can continue from it. */
    passes: MixDOMDefTarget[];
    /** This contains any MixDOM.WithContent components, if they were not sure whether they actually have content or not (due to only having "pass" defs without any solid stuff). 
     * - The structure is [ childDefs, withDef ], where childDefs are the children originally passed to the spread.
     */
    withs: [childDefs: MixDOMDefTarget[], withDef: MixDOMDefTarget & { props: { hasContent?: boolean; }; }][];
};

interface MixDOMDefBase<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> {

    // Mandatory.
    /** This is to distinguish from other objects as well as to define the type both in the same.
     * - That's why it's name so strangely (to distinguish from objects), but still somewhat sensibly to be readible.
     * - In earlier quick tests, it seemed (almost 2x) faster to use { _isDef: true} as opposed to creating a new class instance (without _isDef member). */
    MIX_DOM_DEF: MixDOMDefType;
    tag: MixDOMPostTag;
    childDefs: MixDOMDefApplied[] | MixDOMDefTarget[];

    // Internal.
    /** The def should be skipped - used internally.
     * - Currently only used for type "content" for settings.noRenderValuesMode and "fragment" for withContent() and spread usage. */
    disabled?: boolean;

    // Common optional.
    key?: any;
    attachedRefs?: RefBase[];
    attachedSignals?: Partial<Record<string, SignalListener[0]>>;
    attachedContexts?: Partial<Record<string, Context | null>>;

    // Common to types: "dom" | "element" | "boundary".
    props?: Props;

    // Others - only for specific types.
    // .. Fragment.
    isArray?: boolean;
    scopeType?: "spread" | "spread-pass" | "spread-copy";
    scopeMap?: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>;
    spreadLinks?: MixDOMSpreadLinks;
    // .. Content.
    domContent?: MixDOMContentSimple | null;
    domHTMLMode?: boolean;
    // .. Element.
    domElement?: HTMLElement | SVGElement | null;
    domCloneMode?: MixDOMCloneNodeBehaviour | "" | null;
    // .. Portal.
    domPortal?: Node | null;
    // .. Pass.
    contentPass?: ContentClosure | null;
    contentPassType?: "pass" | "copy";
    getRemote?: () => ComponentRemote;
    // .. Host.
    host?: Host;
    // .. Boundary.
    hasPassWithin?: true;

    // Other.
    treeNode?: MixDOMTreeNode;

}
export interface MixDOMDefDOM<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "dom";
    tag: DOMTags;
    props: Props;
    attachedRefs?: RefBase[];
}
export interface MixDOMDefContent extends MixDOMDefBase {
    MIX_DOM_DEF: "content";
    tag: "" | DOMTags;
    domContent: MixDOMContentSimple;
    domHTMLMode?: false;
    props?: never;
}
export interface MixDOMDefContentInner<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase {
    MIX_DOM_DEF: "content";
    tag: "" | DOMTags;
    domContent: MixDOMContentSimple;
    /** If true, sets the content as innerHTML. */
    domHTMLMode: true;
    props?: Props;
}
export interface MixDOMDefElement<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "element";
    tag: "_";
    props: Props;
    domElement: HTMLElement | SVGElement | null;
    domCloneMode?: MixDOMCloneNodeBehaviour | "" | null;
}
export interface MixDOMDefPortal<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
    MIX_DOM_DEF: "portal";
    tag: null;
    domPortal: Node | null;
    props?: never;
}
export interface MixDOMDefBoundary<Props extends MixDOMProcessedDOMProps = MixDOMProcessedDOMProps> extends MixDOMDefBase<Props> {
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
export interface MixDOMDefFragment extends MixDOMDefBase {
    MIX_DOM_DEF: "fragment";
    tag: null;
    isArray?: boolean;
    scopeType?: MixDOMDefBase["scopeType"];
    /** This helps to optimize nested spread processing, as well as handle WithContent recursively for spreads. */
    spreadLinks?: MixDOMDefBase["spreadLinks"];
    /** Scope map is used only on the applied def side.
     * - This is used to isolate the scopes for the pairing process.
     * - For example, any spread function outputs, and any content pass copies in them, should be isolated.
     * - This means, that when the root of the isolation is paired with a new target, the inner pairing will use this scope only - and nothing else can use it.
     */
    scopeMap?: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>;
}
export interface MixDOMDefPass extends MixDOMDefBase {
    MIX_DOM_DEF: "pass";
    tag: null;
    contentPass?: ContentClosure | null;
    contentPassType?: "pass" | "copy";
    /** If is about a remote source, this is assigned and gets the remote source instance. */
    getRemote?: () => ComponentRemote;
    props?: never;
}
export interface MixDOMDefHost extends MixDOMDefBase {
    MIX_DOM_DEF: "host";
    tag: null;
    host: Host;
    props?: never;
}
export type MixDOMDefTypesAll = MixDOMDefDOM | MixDOMDefContent | MixDOMDefContentInner | MixDOMDefElement | MixDOMDefPortal | MixDOMDefBoundary | MixDOMDefPass | MixDOMDefFragment | MixDOMDefHost;

export interface MixDOMDefAppliedBase extends MixDOMDefBase {
    childDefs: MixDOMDefApplied[];
    action: "mounted" | "moved" | "updated";
    treeNode?: MixDOMTreeNode;
    /** Used internally for special case detections.
     * - Only applied when is performing a _wide move_ - to the mover and all defs inside. The updateId value {} comes from hostServices and is renewed on every update cycle
     * - The updateId is used in a case where moves contents out of a content pass while destroying an intermediary boundary (that holds the pass) simultaneously.
     *      * If had already paired some defs (impying they were moved out by the sourceBoundary), then shouldn't clean up those defs.
     *      * The detection is done by: `def.updateId && def.updateId === def.treeNode?.sourceBoundary?.host.services._whileUpdating`.
     *      * The updateId is cleaned away from the def on next pairing - to avoid cluttering old info (it's just confusing and serves no purpose as information).
     */
    updateId?: {};
}
export interface MixDOMDefTargetBase extends MixDOMDefBase {
    childDefs: MixDOMDefTarget[];
    treeNode?: never;
    action?: never;
}

export type MixDOMDefApplied = MixDOMDefAppliedBase & MixDOMDefTypesAll;
export type MixDOMDefTarget = MixDOMDefTargetBase & MixDOMDefTypesAll;


// - Pseudo - //

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
export interface MixDOMDefTargetPseudo extends DefPseudo { childDefs: MixDOMDefTarget[]; scopeType?: MixDOMDefFragment["scopeType"]; scopeMap?: MixDOMDefFragment["scopeMap"]; }; // withContent?: boolean | (() => ComponentRemoteType); };
export interface MixDOMDefAppliedPseudo extends DefPseudo { childDefs: MixDOMDefApplied[]; scopeType?: MixDOMDefFragment["scopeType"]; scopeMap?: MixDOMDefFragment["scopeMap"]; action?: MixDOMDefAppliedBase["action"]; hasPassWithin?: true; };
