
// - Imports - //

// Typing.
import { MixDOMTreeNode, MixDOMTreeNodeDOM, MixDOMTreeNodeType, MixDOMDefApplied } from "../typing";


// - Finders - //

/** Finds treeNodes of given types within the given rootTreeNode (including it).
 * - If includeNested is true, searches recursively inside sub boundaries - not just within the render scope. (Normally stops after meets a source or content boundary.)
 * - If includeInHosts is true, extends the search to inside nested hosts as well. (Not recommended.)
 * - If includeInInactive is true, extends the search to include inactive boundaries and treeNodes inside them. */
export function treeNodesWithin(rootTreeNode: MixDOMTreeNode, okTypes?: Set<MixDOMTreeNodeType | "">, maxCount: number = 0, includeNested: boolean = false, includeInHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[] {
    // Prepare.
    const list: MixDOMTreeNode[] = [];
    let treeNodesLeft : MixDOMTreeNode[] = [rootTreeNode];
    let treeNode : MixDOMTreeNode | undefined;
    let i = 0;
    const origBoundary = rootTreeNode.boundary;
    // Loop recursively in tree order.
    while (treeNode = treeNodesLeft[i]) {
        // Next.
        i++;
        // Skip inactive.
        if (treeNode.boundary && treeNode.boundary.isMounted === null)
            continue;
        // Accepted.
        if (!okTypes || okTypes.has(treeNode.type)) {
            if (!validator || validator(treeNode)) {
                const count = list.push(treeNode);
                if (maxCount && count >= maxCount)
                    return list;
            }
        }
        // Skip going further.
        if (treeNode.boundary && !includeNested && treeNode.boundary !== origBoundary)
            continue;
        else if (treeNode.type === "host" && !includeInHosts)
            continue;
        // Add child defs to top of queue.
        if (treeNode.children[0]) {
            treeNodesLeft = treeNode.children.concat(treeNodesLeft.slice(i));
            i = 0;
        }
    }
    return list
}

export function rootDOMTreeNodes(rootNode: MixDOMTreeNode, inNestedBoundaries: boolean = false, includeEmpty: boolean = false, maxCount: number = 0): MixDOMTreeNodeDOM[] {
    // Loop each root node.
    let collected: MixDOMTreeNodeDOM[] = [];
    for (const treeNode of rootNode.children) {
        // Skip - doesn't have any.
        if (!treeNode.domNode && !includeEmpty)
            continue;
        // Handle by type.
        switch(treeNode.type) {
            // Collect.
            case "dom":
                collected.push(treeNode);
                if (maxCount && collected.length >= maxCount)
                    return collected;
                break;
            // If does not want nested boundaries (including nested hosts), skip.
            // .. Otherwise continue to collect root nodes (below).
            case "boundary":
            case "pass":
            case "host":
                if (!inNestedBoundaries)
                    break;
            // Collect root nodes inside.
            case "root":
                collected = collected.concat(rootDOMTreeNodes(treeNode, inNestedBoundaries, includeEmpty, maxCount && (maxCount - collected.length)));
                if (maxCount && collected.length >= maxCount)
                    return collected.slice(0, maxCount);
                break;
        }
    }
    // Return collection.
    return collected;
}

/** Get all defs (including the given one) in tree order traversing down from the given one.
 * - The search is automatically limited to inside the render scope, as defs are.
 * - If ignoreByUpdateId is set to true, then skips the defs that have already been updated during this cycle (useful for clean up collection).
 *      * The detection is done by checking if def.updateId exists and is same as its source boundary's host's - if so skip.
 */
export function allDefsIn(rootDef: MixDOMDefApplied, ignoreByUpdateId: boolean = false): MixDOMDefApplied[] {
    // Prepare.
    const allDefs: MixDOMDefApplied[] = [];
    let defs: MixDOMDefApplied[] = [ rootDef ];
    let def: MixDOMDefApplied | undefined;
    let i = 0;
    // Loop each.
    while (def = defs[i++]) {
        // Add.
        if (!def.updateId || !ignoreByUpdateId || def.updateId !== def.treeNode?.sourceBoundary?.host.services._whileUpdating)
            allDefs.push(def);
        // Add kids to the front of the queue.
        if (def.childDefs[0]) {
            defs = def.childDefs.concat(defs.slice(i));
            i = 0;
        }
    }
    // Return collected.
    return allDefs;
}

// /** This is a very quick way to find all boundaries within and including the given one - recursively if includeNested is true.
//  * - Note that this stays inside the scope of the host (as .innerBoundaries never contains the root boundary of another host).
//  */
// boundariesWithin(origBoundary: SourceBoundary, includeNested: boolean = true): SourceBoundary[] {
//     // Prepare.
//     const list: SourceBoundary[] = [];
// 	let bLeft : (SourceBoundary | ContentBoundary)[] = [origBoundary];
// 	let boundary : SourceBoundary | ContentBoundary | undefined;
//     let i = 0;
//     // Loop recursively in tree order.
// 	while (boundary = bLeft[i]) {
//         // Next.
//         i++;
//         // Skip content boundaries, and all within them.
//         if (!boundary.bId)
//             continue;
//         // Skip inactive.
//         if (boundary.isMounted === null)
//             continue;
//         // Accepted.
//         list.push(boundary);
//         // Skip going further.
//         if (!includeNested && origBoundary !== boundary)
//             continue;
// 		// Add child defs to top of queue.
// 		if (boundary.innerBoundaries[0]) {
// 		    bLeft = boundary.innerBoundaries.concat(bLeft.slice(i));
//             i = 0;
//         }
// 	}
//     return list;
// }


// - Shortcuts - //

export function domElementByQuery<T extends Element = Element>(treeNode: MixDOMTreeNode, selectors: string, allowWithinBoundaries: boolean = false, allowOverHosts: boolean = false): T | null {
    const validator = (tNode: MixDOMTreeNode) => tNode.domNode && tNode.domNode instanceof Element && tNode.domNode.matches(selectors);
    const foundNode = treeNodesWithin(treeNode, new Set(["dom"]), 1, allowWithinBoundaries, allowOverHosts, validator)[0];
    return foundNode && foundNode.domNode as T || null;
}

export function domElementsByQuery<T extends Element = Element>(treeNode: MixDOMTreeNode, selectors: string, maxCount: number = 0, allowWithinBoundaries: boolean = false, allowOverHosts: boolean = false): T[] {
    const validator = (tNode: MixDOMTreeNode) => tNode.domNode && tNode.domNode instanceof Element && tNode.domNode.matches(selectors);
    return treeNodesWithin(treeNode, new Set(["dom"]), maxCount, allowWithinBoundaries, allowOverHosts, validator).map(tNode => tNode.domNode as T);
}

// export function treeNodesIn(treeNode: TreeNode, types: RecordableType<MixDOMTreeNodeType>, maxCount: number = 0, allowWithinBoundaries: boolean = false, allowOverHosts: boolean = false, validator?: (treeNode: TreeNode) => any): TreeNode[] {
//     return treeNodesWithin(treeNode, MixDOMLib.buildRecordable<MixDOMTreeNodeType>(types), maxCount, allowWithinBoundaries, allowOverHosts, validator);
// }
//
// export function componentsIn<Comp extends Component = Component>(treeNode: TreeNode, maxCount: number = 0, allowWithinBoundaries: boolean = false, allowOverHosts: boolean = false, validator?: (treeNode: TreeNode) => any): Comp[] {
//     return treeNodesWithin(treeNode, { boundary: true }, maxCount, allowWithinBoundaries, allowOverHosts, validator).map(t => (t.boundary && (t.boundary.live || t.boundary.mini)) as unknown as Comp);
// }
