
// - Imports - //

// Typing.
import { MixDOMTreeNode, MixDOMDefApplied, MixDOMDefTarget } from "../typing";
// Boundaries.
import { ContentBoundary } from "./ContentBoundary";
// Only typing (local).
import { SourceBoundary } from "./SourceBoundary";
// Only typing (distant).
import { ComponentRemote } from "../components/ComponentRemote";


// - Extra typing - //

export interface MixDOMContentEnvelope {
    applied: MixDOMDefApplied;
    target: MixDOMDefTarget;
}


// - Content closure - //

/** This is a technically important class used in the update flow.
 * - Most of its members are managed by the "../host/routine.ts" handlers (due to getting rid of cyclical reference on JS side).
 */
export class ContentClosure {

    // - Members & init - //

    /** The boundary that is connected to this closure - we are its link upwards in the content chain. */
    public thruBoundary: SourceBoundary | null;
    /** The sourceBoundary is required to render anything - it defines to whom the content originally belongs.
     * If it would ever be switched (eg. by remote flow from multiple sources), should clear the envelope first, and then assign new. */
    public sourceBoundary: SourceBoundary | null;
    /** The sealed envelope that contains the content to pass: { applied, targetDef }. */
    public envelope: MixDOMContentEnvelope | null;
    /** If not null, then this is the grounding def that features a true pass. */
    public truePassDef: MixDOMDefApplied | null;
    /** Map where keys are the grounded defs (applied), and values are [boundary, treeNode, copyKey]. */
    public groundedDefs: Map<MixDOMDefApplied, [boundary: SourceBoundary | ContentBoundary, treeNode: MixDOMTreeNode, copyKey: any]>;
    /** The grounded defs that are pending refresh. If all should be refreshed, contains all the keys in the groundedDefs. */
    public pendingDefs: Set<MixDOMDefApplied>;
    /** This contains the boundaries from any WithContent components that refer to us.
     * - They will be re-updated every time our envelope changes. (Actually they would just care about null vs. non-null.) */
    public withContents?: Set<SourceBoundary>;
    /** Used to detect which closures are linked together through content passing.
     * - This is further more used for the withContents feature. (But could be used for more features.)
     * - Note that this kind of detection is not needed for remotes: as there's only the sources and target - nothing in between them.
     *      * Note that the static side of Remote's WithContent does not have its own content pass, but just checks all sources.
     */
    public chainedClosures?: Set<ContentClosure>;
    /** If this closure is linked to feed a remote, assign the remote instance here. */
    public remote?: ComponentRemote | null;

    constructor(thruBoundary?: SourceBoundary | null, sourceBoundary?: SourceBoundary | null) {
        this.thruBoundary = thruBoundary || null;
        this.sourceBoundary = sourceBoundary || null;
        this.envelope = null;
        this.truePassDef = null;
        this.groundedDefs = new Map();
        this.pendingDefs = new Set();
    }


    // - Needs - //

    /** Whether we have any actual content to pass. */
    public hasContent(): boolean {
        const aDef = this.envelope?.applied;
        return !(!aDef || aDef.disabled || (aDef.MIX_DOM_DEF === "fragment" && (!aDef.childDefs.length || aDef.childDefs[0].disabled && aDef.childDefs.length === 1)));

        //
        // return this.envelope && hasContentInDefs(this.envelope.applied.childDefs, checkRecursively) as boolean || false;
        //
        // <-- Should we be using this line instead..?
    }

    /** Get the content that we pass. */
    public readContent(shallowCopy: boolean = false): Readonly<MixDOMDefTarget[]> | null {
        if (!this.envelope)
            return null;
        const aDef = this.envelope.applied;
        const childDefs = aDef.childDefs;
        if (aDef.MIX_DOM_DEF === "fragment" && (!childDefs.length || childDefs[0].disabled && childDefs.length === 1))
            return null;
        const tDefs = this.envelope.target.childDefs;
        return shallowCopy ? tDefs.slice() : tDefs;
    }

}
