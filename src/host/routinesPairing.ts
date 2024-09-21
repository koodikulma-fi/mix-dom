
// - Imports - //

// Typing.
import {
    MixDOMTreeNode,
    MixDOMDefTarget,
    MixDOMDefApplied,
    MixDOMDefTargetPseudo,
    MixDOMDefAppliedPseudo,
    MixDOMDefKeyTag,
} from "../typing";
// Routines.
import { equalDictionariesBy, newAppliedDef } from "../static/index";
// Boundaries.
import { ContentBoundary, SourceBoundary } from "../boundaries/index";
// Local.
import { HostRender } from "./HostRender";


// - Typing helpers - //

export type ToApplyPair = [MixDOMDefTarget, MixDOMDefApplied, MixDOMTreeNode];


// - Local constants - //

/** For the special types, just anything unique other than string and function - and not !!false. */
const searchByTag = {
    "fragment": 1,
    "portal": 2,
    "pass": 3,
    "host": 4,
}; // satisfies Record<MixDOMDefType, number>;


// - Def & TreeNode sub routines - //

/** This does the pairing for the whole render output, and prepares structure for applying defs.
 * - Returns toApplyPairs array for feeding into applyDefPairs.
 *   .. This includes only the ones to be "grounded" - the others will be passed inside a closure.
 * - Reuses, modifies and creates appliedDefs on the go. (Modifies properties: parent, children, treeNode.)
 * - Also reuses, modifies and creates treeNodes on the go.
 */
export function pairDefs(byBoundary: SourceBoundary | ContentBoundary, preDef: MixDOMDefTarget, newAppliedDef: MixDOMDefApplied, defsByTags: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>, unusedDefs: Set<MixDOMDefApplied>, toCleanUpDefs?: MixDOMDefApplied[], emptyMovers?: MixDOMTreeNode[] | null): ToApplyPair[] {
    // Typescript.
    type DefLoopPair = [
        toDef: MixDOMDefTargetPseudo | MixDOMDefTarget,
        aDef: MixDOMDefAppliedPseudo | MixDOMDefApplied,
        pTreeNode: MixDOMTreeNode | null,
        toDefIsFragment: boolean,
        /** This is used to add to a first gen. child boundary def .hasPassWithin. */
        pBoundaryDef: MixDOMDefApplied | null,
        subDefsByTags?: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>
    ];
    // Prepare.
    const settings = byBoundary.host.settings;
    const noValuesMode = settings.noRenderValuesMode;
    const wideArrKeys = settings.wideKeysInArrays;
    const toApplyPairs: [MixDOMDefTarget, MixDOMDefApplied, MixDOMTreeNode][] = [];
    const sourceBoundary = byBoundary.bId ? byBoundary as SourceBoundary : byBoundary.sourceBoundary;
    let defPairs: DefLoopPair[] = [[ { childDefs: [ preDef ] as MixDOMDefTarget[] }, { childDefs: [ newAppliedDef ] as MixDOMDefApplied[] }, byBoundary.treeNode, false, null ]];
    let defPair: DefLoopPair | undefined;
    let i = 0;
    // Start looping the target defs.
    while (defPair = defPairs[i]) {
        // Next.
        i++;
        // Parse.
        const [toDef, aDef, pTreeNode, toDefIsFragment ] = defPair;
        // Get scoped subDefsByTags mapping.
        // .. However, if the def refers to a true content pass within a spread, unravel back to our scope.
        const subDefsByTags = aDef.scopeType === "spread-pass" ? undefined : aDef.scopeMap || defPair[5];

        // Nothing to pair.
        if (!toDef.childDefs[0]) {
            aDef.childDefs = [];
        }
        // Pair children and assign tree nodes for them.
        else {

            // Find correct applied defs - with null for any unfound.
            const appliedChildDefs = findAppliedDefsFor(aDef, toDef, subDefsByTags || defsByTags, unusedDefs, sourceBoundary, wideArrKeys);
            // Set children.
            aDef.childDefs = appliedChildDefs;

            // Extra routine, remove unwanted defs.
            for (let ii=0, toChildDef: MixDOMDefTarget; toChildDef=toDef.childDefs[ii]; ii++) {
                // Handle by type.
                if (toChildDef.MIX_DOM_DEF === "content") {
                    const aDefChild = aDef.childDefs[ii];
                    // If the simple content should be skipped.
                    if (noValuesMode && (noValuesMode === true ? !toChildDef.domContent : noValuesMode.indexOf(toChildDef.domContent) !== -1))
                        aDefChild.disabled = true
                    else
                        delete aDefChild.disabled;
                }
            }

            // Update our first generation boundary ref - it's used to link up chained closures (-> for WithContent).
            // .. Note that once we have one, we won't update it.
            // .. This is because we feed content only into our first gen. child boundaries - not directly to the ones inside.
            const isBoundary = toDef.MIX_DOM_DEF === "boundary";
            const bDef = defPair[4] || isBoundary && aDef as MixDOMDefApplied;
            // In any case, delete hasPassWithin from all boundaries for clarity (eg. maybe a child became a grand-child) tho won't make diff in practice.
            // .. Will be updated below, if really will have content passes this time around.
            if (isBoundary)
                delete aDef.hasPassWithin;

            // Get tree nodes for kids.
            // .. For pseudo elements, we only ground if there's an element defined.
            const treeNodes = pTreeNode && !isBoundary && (toDef.MIX_DOM_DEF !== "element" || toDef.domElement) ?
                assignTreeNodesFor(appliedChildDefs, pTreeNode, toDefIsFragment, sourceBoundary, emptyMovers) : [];

            // Loop each kid to add to loop, and collect extra clean up.
            const newDefPairs: DefLoopPair[] = [];
            for (let ii=0, toChildDef: MixDOMDefTarget; toChildDef=toDef.childDefs[ii]; ii++) {
                // Get.
                const tNode = treeNodes[ii] || null;
                const aChildDef = appliedChildDefs[ii];
                // Check if should be removed.
                if (!tNode && aChildDef.treeNode) {
                    // Mark as pre-cleaneable, if doesn't get sourceBoundary back, should be cleaned away.
                    aChildDef.treeNode.sourceBoundary = null;
                    if (toCleanUpDefs)
                        toCleanUpDefs.push(aChildDef);
                }
                // Add to our content pass optimization detection.
                // .. It's so convenient to do the "whether a first gen. boundary will have content passes" -check in here (though costing an array slot).
                // .. An alternative would be in contentClosure.preRefresh(), but then would have to go through all the defs again.
                if (bDef && toChildDef.MIX_DOM_DEF === "pass")
                    bDef.hasPassWithin = true;
                
                // Add to loop.
                const newPair: DefLoopPair = [toChildDef, aChildDef, tNode, toChildDef.MIX_DOM_DEF === "fragment", bDef || toChildDef.MIX_DOM_DEF === "boundary" && aChildDef || null ];
                newDefPairs.push(newPair);
                // .. Handle spread content passing speciality.
                if (subDefsByTags)
                    newPair[5] = subDefsByTags;
            }
            // Add new generation to the start of the loop.
            defPairs = newDefPairs.concat(defPairs.slice(i));
            i = 0;
        }

        // Add for phase II loop - unless was a pseudo-def or skipped.
        if (pTreeNode && toDef.MIX_DOM_DEF && aDef.MIX_DOM_DEF)
            toApplyPairs.push([toDef, aDef, pTreeNode]);

    }
    // Return ready to apply pairs.
    return toApplyPairs;
}

/** This assigns treeNodes to an array of applied child defs.
 * Functionality:
 * - It tries to reuse the treeNode from the def if had, otherwise creates a new.
 *      * In either case assigns the treeNode parent-children relations for the main node.
 * - It modifies the appliedDef.treeNode accordingly and finally returns an array of treeNodes matching the given aChilds.
 * - It also knows how to handle fragments, so if the nodeIsFragment is true, it will treat the given workingTreeNode as a placeholder.
 * - Note that this procedure assumes that there are no (nestedly) empty fragments in the flow. (This is already handled in the defs creation flow.)
 *      * This makes it easy for us to know that whenever there's a child, it should have a node. So we can safely create new ones for all in the list (if cannot reuse).
 *      * Of course, fragments are not actually worth tree nodes, but we use them as placeholders in the flow. (But because of above, we know there will be something to replace them.)
 */
export function assignTreeNodesFor(aChilds: MixDOMDefApplied[], workingTreeNode: MixDOMTreeNode, nodeIsFragment?: boolean, sourceBoundary?: SourceBoundary | null, emptyMovers?: MixDOMTreeNode[] | null): (MixDOMTreeNode | null)[] {

    // A preassumption of using this function is that it's called flowing down the tree structure.
    // .. Due to this, we will always clear the kids of the workingTreeNode, and reassign them afterwards below.
    if (workingTreeNode.children[0])
        workingTreeNode.children = [];

    // Quick exit.
    const count = aChilds.length;
    if (!count)
        return [];

    // Prepare.
    const treeNodes: (MixDOMTreeNode | null)[] = [];
    let iAddPoint = 0;
    let firstAvailable: MixDOMTreeNode | null = null;
    let pTreeNode: MixDOMTreeNode = workingTreeNode;

    // Prepare functionality for when is inside a fragment.
    // .. We need to get the parentTreeNode's child position for adding siblings next to it.
    if (nodeIsFragment) {
        // No parent node.
        // .. Just return an empty array - things would be messed up anyway.
        if (!workingTreeNode.parent)
            return [];
        // Reassign.
        pTreeNode = workingTreeNode.parent;
        firstAvailable = workingTreeNode;
        iAddPoint = pTreeNode.children.indexOf(workingTreeNode);
        // The child node is not a child of the parent.
        // .. Just return an empty array - things would be messed up anyway.
        if (iAddPoint === -1)
            return [];
    }

    // Loop target defs.
    for (let i=0; i<count; i++) {
        // Prepare.
        const aChild = aChilds[i];
        if (aChild.disabled) {
            // Modify the iAddPoint (instead of i and count), so that adds correctly - we are skipped.
            iAddPoint--;
            treeNodes.push(null);
            continue;
        }
        let myTreeNode: MixDOMTreeNode | null = null;
        // Had an existing treeNode, reuse it.
        if (aChild.treeNode)
            myTreeNode = aChild.treeNode;
        // Otherwise mark as mounted.
        // .. Unless is a fragment: we don't know it by checking .treeNode, as they never have treeNodes.
        else if (aChild.MIX_DOM_DEF !== "fragment")
            aChild.action = "mounted";
        // If has firstAvailable, handle it now.
        if (firstAvailable) {
            // If has myTreeNode, always reuse it.
            // .. In that remove firstAvailable, it will be forgotten. (We don't need to correct its parent.)
            if (myTreeNode)
                pTreeNode.children.splice(iAddPoint, 1);
            else
                myTreeNode = firstAvailable;
            // Clear, it's only for the first time.
            firstAvailable = null;
        }
        // Correct type.
        const aType = aChild.MIX_DOM_DEF;
        const type = aType === "content" || aType === "element" ? "dom" : (aType === "fragment" ? "" : aType as MixDOMTreeNode["type"]);
        // No tree node.
        if (!myTreeNode) {
            // Create.
            myTreeNode = {
                type,
                parent: pTreeNode,
                children: [],
                sourceBoundary: sourceBoundary || null,
                domNode: null,
            } as MixDOMTreeNode;
            // Add domProps.
            if (myTreeNode.type === "dom")
                myTreeNode.domProps = {};
        }
        // Update changes to existing.
        else {

            // Note that we must never clear away children from the child treeNodes here (unlike we do for the parent above).
            // .. This is because we don't know where they were from originally.
            // .... Specifically when they were previously nested inside a boundary within us (the source boundary),
            // .... and that sub boundary does not get updated due to "should"-smartness,
            // .... then we would end up messing the unupdated tree structure by clearing children away from here n there..!
            // .. For the same reason, it's actually okay to clear them for the parent (and should do so): as it's currently being processed (= updated).
            // .... Note also that it's impossible that the treeNode we reuse would have already been processed earlier in the flow.
            // .... This is because 1. we only reuse from aChild.treeNode, 2. each def has its unique treeNode (if any), 3. and def pairing process never double-uses defs.

            // Dislogde from parent in any case - the child will be (re-) added below.
            if (myTreeNode.parent) {
                // Get index.
                const iMe = myTreeNode.parent.children.indexOf(myTreeNode);
                // Detect empty movers.
                // .. We need this to update bookkeeping when something moves away from being a first child.
                if (iMe === 0 && myTreeNode.parent !== pTreeNode && HostRender.PASSING_TYPES[myTreeNode.parent.type] === true && emptyMovers) {
                    if (emptyMovers.indexOf(myTreeNode.parent) === -1)
                        emptyMovers.push(myTreeNode.parent);
                }
                // Remove.
                if (iMe !== -1)
                    myTreeNode.parent.children.splice(iMe, 1);
            }
            // Set parent and source.
            myTreeNode.parent = pTreeNode;
            myTreeNode.sourceBoundary = sourceBoundary || null;

            // We set the type in case was just created before fed to us.
            // .. The type should in practice stay the same - because treeNodes are tied to def's, execpt when doing swapping.
            myTreeNode.type = type;

        }

        // Pair with the def.
        if (aChild.MIX_DOM_DEF !== "fragment") {
            myTreeNode.def = aChild;
            aChild.treeNode = myTreeNode;
        }

        // Add to tree node's children at the right spot, and to our return collection.
        pTreeNode.children.splice(iAddPoint + i, 0, myTreeNode);
        treeNodes.push(myTreeNode);
    }
    // Return the treeNodes matching the given aChilds.
    return treeNodes;
}

/** This is a specific handler for true content pass.
 * - It needs this procedure because its defs have already been paired.
 * - In here we assign treeNodes to them if they are grounded.
 * - For those that are not used, we mark .sourceBoundary = null and collect to cleanUp (that we return). */
export function assignTreeNodesForPass(contentBoundary: ContentBoundary): [ToApplyPair[], MixDOMTreeNode[], MixDOMTreeNode[]] {
    // Prepare.
    const appliedDef = contentBoundary._innerDef;
    const sourceBoundary = contentBoundary.sourceBoundary;
    const targetDef = contentBoundary.targetDef;
    const toCleanUp: MixDOMTreeNode[] = [];
    const emptyMovers: MixDOMTreeNode[] = [];
    // Prepare loop.
    type DefLoopPair = [MixDOMDefTarget, MixDOMDefApplied, MixDOMTreeNode | null, boolean ];
    const toApplyPairs: ToApplyPair[] = [];
    let defPairs: DefLoopPair[] = [[ targetDef, appliedDef, contentBoundary.treeNode, false ]];
    let defPair: DefLoopPair | undefined;
    let i = 0;
    // Start looping the target defs.
    while (defPair = defPairs[i]) {
        // Next.
        i++;
        // Parse.
        const [toDef, aDefNew, pTreeNode, toDefIsFragment ] = defPair;
        // Explore, if has children and is not a boundary def (in that case, our grounding branch ends to it).
        if (aDefNew.childDefs[0]) {
            // Get tree nodes for kids.
            // .. For <MixDOM.Element>'s, we only ground if there's an element defined.
            const treeNodes = pTreeNode && toDef.MIX_DOM_DEF !== "boundary" && (toDef.MIX_DOM_DEF !== "element" || toDef.domElement) ?
                assignTreeNodesFor(aDefNew.childDefs, pTreeNode, toDefIsFragment, sourceBoundary, emptyMovers) : [];
            // After clean up.
            let iKid = 0;
            const newDefPairs: DefLoopPair[] = [];
            for (const aChildDef of aDefNew.childDefs) {
                // Add to pre-clean up - they might get reused later, so we just mark sourceBoundary null and collect.
                // .. If upon final clean up they still have sourceBoundary null, it means they were not used.
                // .. Note that we must not here do an actual clean up yet - this is because there might be nested true pass content boundaries within us.
                const tNode: MixDOMTreeNode | null = treeNodes[iKid] || null;
                if (!tNode && aChildDef.treeNode) {
                    toCleanUp.push(aChildDef.treeNode);
                    aChildDef.treeNode.sourceBoundary = null;
                }
                // Add to loop.
                newDefPairs.push([toDef.childDefs[iKid], aChildDef as MixDOMDefApplied, tNode, aChildDef.MIX_DOM_DEF === "fragment" ]);
                // Next.
                iKid++;
            }
            // Add new generation to the start of the loop.
            defPairs = newDefPairs.concat(defPairs.slice(i));
            i = 0;
        }
        // Add for phase II loop.
        if (pTreeNode && !aDefNew.disabled)
            toApplyPairs.push([toDef, aDefNew, pTreeNode]);
    }
    // Return pairs.
    return [ toApplyPairs, toCleanUp, emptyMovers ];
}


// - Def helpers - //

/** This finds the applied children non-recursively for given appliedParentDef and targetParentDef.
 *
 * 1. The logic is primarily based on matching tags.
 *    - To reuse an applied def, must have `===` same tag.
 *    - Accordingly for scope-wide key reusing, we get a map of `Map<QTag, MixDOMDefApplied[]>`.
 *
 * 2. The process is categorized followingly:
 *    - Arrays (very much like in React).
 *       A) Item with key:
 *          1. Look for matching tag & key from the equivalent array set.
 *             * If not found, look no further: clearly there's no match this time.
 *       B) Item with no key:
 *          1. Look for matching tag from the equivalent array set, but only ones that (likewise) have no key defined.
 *       C) Array with non-array: no matches.
 *    - Non-arrays.
 *       A) Item with key:
 *          1. Look for matching tag & key from siblings.
 *          2. If not found, look for matching tag & key from the whole scope (by the given tag based map).
 *          3. If not found, don't look further.
 *             * We had a key defined, and now there's clearly no match - let's not force one.
 *       B) Item with no key:
 *          1. Look from siblings with same tag based on order, but only the ones that (likewise) have no key defined.
 *       C) Non-array with array: no matches.
 *
 * 3. Further notes.
 *    - In version 3.0.0 a `constantProps` feature was added to the Component. It can disallow pairing if the defined props have changed.
 *    - Note that for render scope wide matching, there's a unusedDefs set given.
 *      * If a def has already been used, it's not found in the set, and we should not allow it - so it's skipped and the process continues.
 *      * However, when we reuse a def, if modifyBookKeeping is true, we remove it from the set and defsByTags.
 *      * This list is further used for knowing what defs were not reused - to remove them.
 *    - However, everytime finds a match (that is not vetoed by not found in unusedDefs), it's just accepted and the process stops.
 *      * So there's no post-processing to find the best of multiple fitting matches - we don't even continue to find more fitting matches.
 *      * In the context of sibling matches, this is actually desired behaviour, because it mixes in a secondary ordered based matching.
 *        .. However, for wide matching the order is non-important, but it's still consistent and reasonable: it's the tree-order for each tag.
 *    - Note. The logical outcome for the function is as described above, but it's instead organized below into a more flowing form.
 */
export function findAppliedDefsFor(parentAppliedDef: MixDOMDefApplied | MixDOMDefAppliedPseudo | null, parentDef: MixDOMDefTarget | MixDOMDefTargetPseudo, defsByTags: Map<MixDOMDefKeyTag, MixDOMDefApplied[]>, unusedDefs: Set<MixDOMDefApplied>, sourceBoundary?: SourceBoundary | null, wideArrKeys?: boolean): MixDOMDefApplied[] {
    // Handle trivial special case - no children asked for.
    let nChildDefs = parentDef.childDefs.length;
    if (!nChildDefs)
        return [];
    // Not compatible - shouldn't find matches.
    const allowWide = wideArrKeys || !parentDef.isArray;
    if (!wideArrKeys && (parentDef.isArray != (parentAppliedDef && parentAppliedDef.isArray)))
        return parentDef.childDefs.map(def => newAppliedDef(def, sourceBoundary && sourceBoundary.closure || null));

    // Loop children and collect defs.
    const siblingDefs = parentAppliedDef && parentAppliedDef.childDefs || null;
    const childAppliedDefs: MixDOMDefApplied[] = [];
    for (let i=0; i<nChildDefs; i++) {

        // Prepare.
        const childDef = parentDef.childDefs[i];
        const hasKey = childDef.key != null;
        const defType = childDef.MIX_DOM_DEF;
        const sTag = childDef.getRemote || searchByTag[defType] || childDef.tag;
        /** Whether did move for sure. If not sure, don't put to true. */
        let wideMove = false;
        let aDef: MixDOMDefApplied | null = null;

        // Look for matching tag (& key) from siblings.
        // .. Note that we don't slice & splice the siblingDefs - we just loop it over again.
        if (siblingDefs) {
            for (const def of siblingDefs) {
                // Prepare.
                // Not matching by: 1. key vs. non-key, 2. wrong tag, 3. already used.
                if ((hasKey ? def.key !== childDef.key : def.key != null) || sTag !== (def.getRemote || searchByTag[def.MIX_DOM_DEF] || def.tag) || !unusedDefs.has(def))
                    continue;
                // Not matching by constant props.
                if (defType === "boundary" && def.treeNode?.boundary?.component?.constantProps &&
                    !equalDictionariesBy(childDef.props, def.props, def.treeNode.boundary.component.constantProps))
                    continue;
                // Accepted.
                aDef = def;
                unusedDefs.delete(def);
                // Note. Might have still moved, but we don't mark didMove - we check for moving below.
                break;
            }
        }
        // If not found, look for matching tag & key from the whole scope (by the given tag based map).
        if (!aDef && hasKey && allowWide) {
            // Note that cousinDefs is one time used and not used for clean up. It's okay to splice or not splice from it.
            const cousinDefs = defsByTags && defsByTags.get(sTag);
            if (cousinDefs) {
                for (const def of cousinDefs) {
                    // Not matching.
                    if (def.key !== childDef.key || !unusedDefs.has(def))
                        continue;
                    // Not matching by constant props.
                    if (defType === "boundary" && def.treeNode?.boundary?.component?.constantProps &&
                        !equalDictionariesBy(childDef.props, def.props, def.treeNode.boundary.component.constantProps))
                        continue;
                    // Accepted.
                    aDef = def;
                    unusedDefs.delete(def);
                    // cousinDefs.splice(ii, 1); // We shall skip splicing, can just loop again.
                    wideMove = true;
                    break;
                }
            }
        }
        // Create.
        if (!aDef)
            aDef = newAppliedDef(childDef, sourceBoundary && sourceBoundary.closure || null);
        // Mark whether was moved or just updated.
        else
            aDef.action =
                // Moved by wide keys.
                wideMove ||
                // Moved by not had having a parent def.
                !parentAppliedDef ||
                // Moved by not having the same index as last time.
                parentAppliedDef.childDefs[i] !== aDef
                // Note that detection for being moved due to a passing parent (fragments, content passes, etc.) having moved is not done here.
                // .. It's instead handled in routinesApply.applyDefPairs and with contentGrounded method for passes (ContentClosure instances).
                ? "moved" : "updated";
        //
        // <-- Should we also check for the previous if its next sibling had moved - do we need it logically ?
        // ... Anyway, if needed, could be done right here in the loop by storing prevDef. (But don't think it's needed.)

        // Add to collection in the children order.
        childAppliedDefs.push(aDef);
    }

    return childAppliedDefs;
}

/** Helper to build tag based def map for wide key pairing. */
export function buildDefMaps(appliedDef: MixDOMDefApplied, ignoreSelf: boolean = false, unusedDefs: Set<MixDOMDefApplied> = new Set(), collectPass?: MixDOMDefApplied[]): [Map<MixDOMDefKeyTag, MixDOMDefApplied[]>, Set<MixDOMDefApplied> ] {
    // Prepare.
    const defsByTags = new Map<MixDOMDefKeyTag, MixDOMDefApplied[]>();
    let defsToSearch: MixDOMDefApplied[] = ignoreSelf ? appliedDef.childDefs.slice() : [appliedDef];
    let searchDef: MixDOMDefApplied | undefined;
    let i = 0;
    // Loop the appliedDef and its childDefs recursively (in tree order).
    while (searchDef = defsToSearch[i]) {
        // Next.
        i++;
        // Add to the base collection.
        unusedDefs.add(searchDef);
        // Add to defsByTags.
        const sTag = searchDef.getRemote || searchByTag[searchDef.MIX_DOM_DEF] || searchDef.tag;
        const byTags = defsByTags.get(sTag);
        byTags ? byTags.push(searchDef) : defsByTags.set(sTag, [ searchDef ]);
        // Isolate if has scope type - eg. spread and content pass copies within spread.
        if (searchDef.scopeType) {
            // Unravel back to the parent scope, if is true pass within a spread (there's only one or none per spread).
            if (searchDef.scopeType === "spread-pass") {
                if (collectPass)
                    collectPass.push(searchDef);
            }
            // Otherwise process the sub scope.
            else {
                // Do the scoping and collect a nested true pass (into an array).
                const collect: MixDOMDefApplied[] = [];
                searchDef.scopeMap = buildDefMaps(searchDef, true, unusedDefs, collect)[0];
                // Add the kids of true pass to processing back in our scope - it belongs to us, even though went through the spread.
                // .. Note, we do it by adding the kids using collect[0], because logically there's only 0 or 1 items in the array.
                // .. This is because there's only one true pass (or none at all) - others are / become copies.
                // .. So we just use the array as a reference, an extra return value that is not returned but given as an extra arg.
                if (collect[0]) {
                    defsToSearch = collect[0].childDefs.concat(defsToSearch.slice(i));
                    i = 0;
                }
            }
        }
        // Otherwise addd child defs to top of queue.
        else if (searchDef.childDefs[0]) {
            defsToSearch = searchDef.childDefs.concat(defsToSearch.slice(i));
            i = 0;
        }
        // Note. We don't search within nested boundaries, they have their own key scope.
        // .. The same for spreads except when they have a true content pass, then we take it back (handled above).
    }
    return [ defsByTags, unusedDefs ];
}
