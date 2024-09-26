
// - Imports - //

// Local.
import { DOMElement } from "./DOMTypes";
// Only typing (local).
import { MixDOMDefApplied } from "./MixDOMDefs";
import { MixDOMBoundary, MixDOMProcessedDOMProps } from "./MixDOMTypes";
// Only typing (distant).
import { ContentBoundary, SourceBoundary } from "../boundaries/index";


// - Grounded tree - //

export type MixDOMTreeNodeType = "dom" | "portal" | "boundary" | "pass" | "contexts" | "host" | "root";
interface MixDOMTreeNodeBase {

    // - Mandatory - //

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

    // - Optional - //

    /** If refers to a boundary - either a custom class / functino or then a content passing boundary. */
    boundary?: MixDOMBoundary | null;
    /** The def tied to this particular treeNode. */
    def?: MixDOMDefApplied;

};
interface MixDOMTreeNodeBaseWithDef extends MixDOMTreeNodeBase {
    def: MixDOMDefApplied;
}
export interface MixDOMTreeNodeEmpty extends MixDOMTreeNodeBase {
    type: "";
};
export interface MixDOMTreeNodeRoot extends MixDOMTreeNodeBase {
    type: "root";
    def?: never;
};
export interface MixDOMTreeNodeDOM extends MixDOMTreeNodeBaseWithDef {
    type: "dom";
    /** This exists only for treeNodes referring to dom elements (typeof appliedDef.tag === "string").
     * To avoid ever missing diffs, it's best to hold a memory for the props that were actually applied to a dom element.
     * Note. Like React, we do not want to read the state of the dom element due to 2 reasons:
     *   1. Reading from dom element is relatively slow (in comparison to reading property of an object).
     *   2. It's actually better for outside purposes that we only take care of our own changes to dom - not forcing things there (except create / destroy our own). */
    domProps: MixDOMProcessedDOMProps;
};
export interface MixDOMTreeNodePortal extends MixDOMTreeNodeBaseWithDef {
    type: "portal";
    /** For portals, the domNode refers to the external container. */
    domNode: MixDOMTreeNodeBase["domNode"];
};
export interface MixDOMTreeNodeBoundary extends MixDOMTreeNodeBaseWithDef {
    type: "boundary";
    /** This will be set to the treeNode right after instancing the source boundary. */
    boundary: SourceBoundary;
};
export interface MixDOMTreeNodePass extends MixDOMTreeNodeBaseWithDef {
    type: "pass";
    /** This will be set to the treeNode right after instancing the content boundary.
     * - It's null only if there's no content, otherwise there's a content boundary.*/
    boundary: ContentBoundary | null;
};
export interface MixDOMTreeNodeHost extends MixDOMTreeNodeBaseWithDef {
    type: "host";
};
export type MixDOMTreeNode = MixDOMTreeNodeEmpty | MixDOMTreeNodeDOM | MixDOMTreeNodePortal | MixDOMTreeNodeBoundary | MixDOMTreeNodePass | MixDOMTreeNodeHost | MixDOMTreeNodeRoot;
