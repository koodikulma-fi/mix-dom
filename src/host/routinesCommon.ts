
// - Imports - //

// Typing.
import { MixDOMChangeInfos, MixDOMBoundary, MixDOMRenderInfo, MixDOMSourceBoundaryChange } from "../typing";
// Boundaries.
import { ContentClosure, SourceBoundary } from "../boundaries/index";
// Only typing (distant).
import { ComponentRemote } from "../components/index";


// - Merge changes - //

export function mergeChanges<T extends MixDOMChangeInfos | null>(firstInfo: T, ...moreInfos: (MixDOMChangeInfos | null)[]): T {
    let allInfos: T = firstInfo;
    for (const infos of moreInfos) {
        if (!infos)
            continue;
        if (allInfos) {
            allInfos[0] = allInfos[0].concat(infos[0]);
            allInfos[1] = allInfos[1].concat(infos[1]);
        }
        else
            allInfos = infos as T;
    }
    return allInfos;
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
export function sortBoundaries(boundaries: Iterable<SourceBoundary>): void {

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
    for (const key of sortedKeys) {
        // Unravel any of the same cousin family.
        for (const boundary of keysMap.get(key) as SourceBoundary[]) {
            boundaries[i] = boundary;
            i++;
        }
    }
}


// - Closure interests - //

export function updatedInterestedInClosure(bInterested: Set<SourceBoundary>, sortBefore: boolean = true): MixDOMChangeInfos {
    // Prepare return.
    let renderInfos: MixDOMRenderInfo[] = [];
    let boundaryChanges: MixDOMSourceBoundaryChange[] = [];
    // Sort, if needs and has at least two entries.
    if (sortBefore && bInterested.size > 1)
        sortBoundaries(bInterested);
    // Update each - if still needs to be updated (when the call comes).
    for (const thruBoundary of bInterested) {
        // Was already updated.
        if (!thruBoundary._forceUpdate && !thruBoundary.component._lastState && thruBoundary.component.props === thruBoundary._outerDef.props)
            continue;
        // Update and collect.
        const uInfos = thruBoundary.host.services.updateBoundary(thruBoundary);
        if (uInfos) {
            renderInfos = renderInfos.concat(uInfos[0]);
            boundaryChanges = boundaryChanges.concat(uInfos[1]);
        }
    }
    // Return infos.
    return [ renderInfos, boundaryChanges ];
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
    if (byRemote)
        return byRemote.constructor.closure?.withContents ? new Set(byRemote.constructor.closure.withContents) : null;
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
