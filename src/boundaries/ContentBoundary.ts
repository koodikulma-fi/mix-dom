
// - Imports - //

// Typing.
import type { MixDOMDefApplied, MixDOMDefTarget, MixDOMTreeNode } from "../typing";
// Routines.
import { newAppliedDef } from "../static/index";
// Base class.
import { BaseBoundary } from "./BaseBoundary";
// Only typing (distant).
import type { SourceBoundary } from "../components";


// - Class - //

export class ContentBoundary extends BaseBoundary {


    // - Additions - //

    /** The def whose children define our content - we are a fragment-like container. */
    public targetDef: MixDOMDefTarget;

    // - Redefinitions - //

    /** Redefine that we always have it. It's based on the targetDef. */
    public _innerDef: MixDOMDefApplied;
    /** Redefine that we always have a host for content boundaries - for us, it's the original source of our rendering.
     * - Note that the content might get passed through many boundaries, but now we have landed it.
     */
    public sourceBoundary: SourceBoundary;
    /** Redefine that we always have a boundary that grounded us to the tree - we are alive because of it.
     * - Note that it gets assigned (externally) immediately after constructor is called.
     * - The parentBoundary ref is very useful for going quickly up the boundary tree - the opposite of .innerBoundaries.
     */
    public parentBoundary: SourceBoundary | ContentBoundary;


    // - For TypeScript - //

    /** Content boundaries will never feature component. So can be used for checks to know if is a source or content boundary. */
    public component?: never;
    /** Content boundaries will never feature bId. So can be used for checks to know if is a source or content boundary. */
    public bId?: never;


    // This is the moment we open up our personal copy of the envelop. It has been just opened and reclosed with treeNode appropriate for us.
    // .. Note. We use the basis of BaseBoundary, so we can use the same routinesApply methods for SourceBoundary and ContentBoundary.
    //
    constructor(outerDef: MixDOMDefApplied, targetDef: MixDOMDefTarget, treeNode: MixDOMTreeNode, sourceBoundary: SourceBoundary) {
        // Base boundary.
        super(sourceBoundary.host, outerDef, treeNode);
        // Assign.
        this.sourceBoundary = sourceBoundary;
        this.targetDef = targetDef;
        this._innerDef = newAppliedDef(targetDef, sourceBoundary.closure);
    }

    /** Apply a targetDef from the new envelope. Simply sets the defs accordingly. */
    updateEnvelope(targetDef: MixDOMDefTarget, truePassDef?: MixDOMDefApplied | null): void {
        this.targetDef = targetDef;
        if (truePassDef)
            this._innerDef.childDefs = truePassDef.childDefs;
    }

}
