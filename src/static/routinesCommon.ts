
// - Imports - //

// Typing.
import type { MixDOMChangeInfos, MixDOMBoundary, MixDOMTreeNodeType, MixDOMDefType } from "../typing";
// Boundaries (only typing).
import type { ContentClosure } from "../boundaries";
// Components (only typing).
import type { SourceBoundary, ComponentRemote } from "../components";


// - Constants - //

/** These imply which type of tree nodes allow to "pass" the DOM element reference through them - ie. they are not strictly DOM related tree nodes. */
export const domPassingTypes: Partial<Record<MixDOMTreeNodeType | MixDOMDefType, true>> = { boundary: true, pass: true, host: true, fragment: true }; // Let's add fragment here for def side.


// - Merge changes - //

/** Merge MIXDOMChangeInfos together. Mutates the allChanges, but doesn't mutate the arrays inside (just concats new). */
export function mergeChangesTo(allChanges: MixDOMChangeInfos, ...moreInfos: (MixDOMChangeInfos | null)[]): void {
    for (const infos of moreInfos) {
        if (infos && infos[0][0])
            allChanges[0] = allChanges[0].concat(infos[0]);
        if (infos && infos[1][0])
            allChanges[1] = allChanges[1].concat(infos[1]);
    }
}


// - Sort boundaries - //

/** Sorting principles:
 * 1. We do it by collecting boundaryId parent chains (with ">" splitter, parent first).
 *    .. Note that any inner siblings will have the same key chain - we inner sort them by index.
 * 2. And then sort the boundaryId chains according to .startsWith() logic.
 * 3. Finally we reassign the updates - unraveling the nested order of same keys.
 * - Note. This implicitly supports sorting boundaries from different hosts, as the id's are in the form of: "h-number:b-number", eg. "h-0:b-47".
 * - So accordingly we might have a parent chain id like this: "h-0:b:0>h-0:b-15" which would mean has two parents: root boundary (b:0) > boundary (b:15) > self.
 */
export function sortBoundaries(boundaries: Set<SourceBoundary>): Array<SourceBoundary> {

    // 1. Collect boundaryId chains.
    const keysMap: Map<string, SourceBoundary[]> = new Map();
    for (const boundary of boundaries) {
        // Prepare.
        let key = boundary.bId;
        // Go up the parent chain.
        // .. If is a content boundary, just add an empty splitter.
        let pBoundary: MixDOMBoundary | null = boundary.parentBoundary;
        while (pBoundary) {
            key = (pBoundary.bId || "") + ">" + key;
            pBoundary = pBoundary.parentBoundary;
        }
        // Add amongst cousins - optimization to get better tree order even in not-so-important cases.
        // .. We find the correct spot by comparing index in innerBoundaries.
        const collected = keysMap.get(key);
        if (collected) {
            let iSub = 0;
            if (boundary.parentBoundary) {
                const inner = boundary.parentBoundary.innerBoundaries;
                const iMe = inner.indexOf(boundary);
                for (const kid of collected) {
                    if (iMe < inner.indexOf(kid))
                        break;
                    iSub++;
                }
            }
            collected.splice(iSub, 0, boundary);
        }
        // First one in the cousin family.
        else
            keysMap.set(key, [boundary]);
    }

    // 2. Sort by keys.
    // .. Note. We iterate of .keys(), but do not trigger anything during the iteration, only collect to sortedKeys.
    const sortedKeys: string[] = [];
    for (const thisKey of keysMap.keys()) {
        let iInsert = 0;
        let shouldBreak = false;
        for (const thatKey of sortedKeys) {
            // Is earlier.
            if (thatKey.startsWith(thisKey + ">"))
                break;
            // Is related, should break after.
            if (thisKey.startsWith(thatKey + ">"))
                shouldBreak = true;
            // Break now, relations have ended.
            else if (shouldBreak)
                break;
            // Next location.
            iInsert++;
        }
        sortedKeys.splice(iInsert, 0, thisKey);
    }

    // 3. Reassign in correct order.
    let i = 0;
    const bArr: SourceBoundary[] = [];
    for (const key of sortedKeys) {
        // Unravel any of the same cousin family.
        for (const boundary of keysMap.get(key) as SourceBoundary[])
            bArr[i++] = boundary;
    }
    return bArr;
}


// - Closure interests - //

/** Update the boundaries interested in the closure and collect change infos. */
export function updatedInterestedInClosure(bInterested: Set<SourceBoundary>, sortBefore: boolean = true): MixDOMChangeInfos {
    // Prepare return.
    let allChanges: MixDOMChangeInfos = [[], []];
    // Update each - if still needs to be updated (when the call comes).
    // .. Sort, if needs and has at least two entries.
    for (const thruBoundary of (sortBefore && bInterested.size > 1 ? sortBoundaries(bInterested) : bInterested)) {
        // Was already updated.
        if (!thruBoundary._forceUpdate && !thruBoundary.component.renderedState && thruBoundary.component.props === thruBoundary._outerDef.props)
            continue;
        // Update and collect.
        const uInfos = thruBoundary.host.services.updateBoundary(thruBoundary);
        if (uInfos)
            mergeChangesTo(allChanges, uInfos);
    }
    // Return infos.
    return allChanges;
}

/** Collect the interested boundaries.
 * - In practice these come from two places:
 *      1. The special WithContent components (either the MixDOM global one or from a ComponentRemote).
 *      2. For parental content passing, also the child closures that have reported to be fed by us.
 * - Because of this architectural decision, we actually don't anymore need a cyclical loop prevention (as of v3.1).
 *      * This is because, the parent no longer has to re-render - earlier had to using: .withContent(...contents). Instead only WithContent component updates.
 *      * Cyclical prevention would only be needed if deliberately formed one by defining render content for MyRemote within MyRemote.WithContent content pass.
 */
export function collectInterestedInClosure(closure: ContentClosure, byRemote?: ComponentRemote | null): Set<SourceBoundary> | null {
    // From Remote.
    if (byRemote) {
        // Collect direct.
        const boundaries: Set<SourceBoundary> = new Set();
        if (byRemote.closure.withContents) {
            for (const b of byRemote.closure.withContents)
                boundaries.add(b);
        }
        // Collect from the static side.
        for (const b of byRemote.constructor.WithContent.withContents)
            boundaries.add(b);
        // If didn't have any, return null.
        return boundaries.size ? boundaries : null;
    }
    // Doesn't have any direct interests, nor any child closures that we're feeding to.
    if (!closure.withContents && !closure.chainedClosures)
        return null;
    // Add direct interests.
    const interested = closure.withContents ? new Set(closure.withContents) : new Set<SourceBoundary>();
    if (closure.chainedClosures) {
        for (const subClosure of closure.chainedClosures) {
            const intr = collectInterestedInClosure(subClosure);
            if (intr)
                for (const b of intr)
                    interested.add(b);
        }
    }
    // Return interested.
    return interested.size ? interested : null;
}
