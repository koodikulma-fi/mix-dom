
// - Imports - //

// Typing.
import type { MixDOMTreeNode, MixDOMDefApplied } from "../typing";
// Only typing (local).
import type { ContentBoundary } from "./ContentBoundary";
// Only typing (distant).
import type { SourceBoundary, Component } from "../components";
import type { Host } from "../host";


// - Boundary - //

export class BaseBoundary {


    // - Defs - //

    /** The def that defined this boundary to be included. This also means it contains our last applied props. */
    public _outerDef: MixDOMDefApplied;
    /** The _innerDef is the root def for what the boundary renders inside - or passes inside for content boundaries.
     * - Note that the _innerDef is only null when the boundary renders null. For content boundaries it's never (they'll be destroyed instead). */
    public _innerDef: MixDOMDefApplied | null;


    // - host, treeNode and mounted - //

    /** The reference for containing host for many technical things as well as general settings. */
    public host: Host;
    /** Whether the boundary has mounted. Starts as `false`, set to `"pre"` after the pairing defs, and to `true` right before didMount is called and `null` after willUnmount. */
    public hasMounted: "pre" | boolean | null;
    /** The fixed treeNode of the boundary is a very important concept and reference for technical reasons.
     * - It allows to keep the separate portions of the GroundedTree structure together by tying parent and child boundary to each other.
     *   .. So, ultimately it allows us to keep a clear bookkeeping of the dom tree and makes it easy, flexible and performant to apply changes to it.
     * - The node is given by the host boundary (or host for root) and the reference always stays the same (even when mangling stuff around).
     *   1. The first host is the host instance: it creates the root treeNode and its first child, and passes the child for the first boundary.
     *   2. The boundary then simply adds add kids to this treeNode.
     *   3. If the boundary has a sub-boundary in it, it similarly gives it a treeNode to work with.
     *   4. When the boundary re-renders, it will reuse the applied defs and if did for any sub-boundary,
     *      will then reuse the same treeNode and just modify its parent accordingly. So the sub-boundary doesn't even need to know about it.
     */
    public treeNode: MixDOMTreeNode;


    // - Boundary refs - //

    /** The sourceBoundary refers to the original SourceBoundary who defined us.
     * - Due to content passing, it's not necessarily our .parentBoundary, who is the one who grounded us to the tree.
     * - For the rootBoundary of a host, there's no .sourceBoundary, but for all nested, there always is.
     * - Note that for source boundarries, the sourceBoundary should never change from what was given in the constructor.
     *   .. It's passed to the source boundary's content closure, and from there further on. Swapping it on the boundary is not supported (see ComponentRemote for swapping it on the closure).
     */
    public sourceBoundary: SourceBoundary | null;
    /** The parentBoundary ref is very useful for going quickly up the boundary tree - the opposite of .innerBoundaries. */
    public parentBoundary: SourceBoundary | ContentBoundary | null;
    /** Any source or content boundaries inside that we have directly grounded in tree order - updated during every update run (don't use during). */
    public innerBoundaries: (SourceBoundary | ContentBoundary)[];

    /** The component instance tied to this boundary - necessarily extends Component. */
    public component?: Component;


    constructor(host: Host, outerDef: MixDOMDefApplied, treeNode: MixDOMTreeNode) {
        // Init.
        this.host = host;
        this.treeNode = treeNode;
        this._outerDef = outerDef;
        this._innerDef = null;
        this.hasMounted = false;
        this.sourceBoundary = null;
        this.parentBoundary = null;
        this.innerBoundaries = [];
    }
}
