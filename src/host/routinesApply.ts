
// - Imports - //

// Libraries.
import { callListeners } from "data-signals";
// Typing.
import {
    MixDOMTreeNode,
    MixDOMTreeNodeDOM,
    MixDOMTreeNodeHost,
    MixDOMTreeNodePortal,
    MixDOMDefTarget,
    MixDOMDefApplied,
    MixDOMSourceBoundaryChange,
    MixDOMRenderInfo,
    MixDOMChangeInfos,
    MixDOMContentSimple,
    MixDOMDefKeyTag,
    MixDOMTreeNodeBoundary,
} from "../typing";
// Routines.
import { equalDOMProps, getDictionaryDiffs, newDefFrom, newAppliedDef, rootDOMTreeNodes, allDefsIn } from "../static/index";
// Common.
import { Ref, MixDOMContent } from "../common/index";
// Boundaries.
import { ContentBoundary, SourceBoundary, ContentClosure, MixDOMContentEnvelope } from "../boundaries/index";
// Local.
import { collectInterestedInClosure, mergeChanges, updatedInterestedInClosure } from "./routinesCommon";
import { assignTreeNodesForPass, pairDefs, buildDefMaps, ToApplyPair } from "./routinesPairing";
// Only typing (local).
import { Host } from "./Host";
// Only typing (distant).
import { ComponentType } from "../components/Component";
import { ComponentCtx } from "../components/ComponentContextAPI";
import { ComponentShadowType } from "../components/ComponentShadow";
import { ComponentRemote, ComponentRemoteType } from "../components/ComponentRemote";


// - Closure update process - //

// Visual analogy: ContentClosure as a SEALED ENVELOPE:
//
// - Think of the ContentClosure as a sealed envelope that gets passed from the original boundary to a sub-boundary in it.
//   * The contents of the envelope describe the contents that this particular sub-boundary has from its source boundary.
//   * The contents also contain a direct reference to the paired def branch of the original boundary (to update its treeNode assignments on grounding, or clear on ungrounding).
//
// - If the sub-boundary does not ground the content directly, but passes it to another sub-sub-boundary, then a new envelope is written for it.
//   * Again the envelope contains whatever the sub-boundary assigned to its sub-sub-boundary, which in case case includes the earlier envelope.
//   * In other words, the new envelope contains (amongst other content) another envelope from up the tree.
//
// - When the content is finally grounded (if at all), the last (freshest) envelope is opened.
//   - On grounding the closure also gets a treeNode reference that should be used similarly to boundary's treeNode.
//     * Otherwise the rendering wouldn't know where to insert the contents.
//   a) For a TRUE PASS:
//     1. After opening the envelope, the pairing process is finished (by attaching treeNodes) and an array of pairs to be grounded is formed.
//     2. The pairs are fed to a new grounding process, which grounds dom elements and mounts/updates sub-boundaries within collecting getting render infos.
//     3. If the newly grounded defs contained more envelopes, then they get opened similarly to this envelope and render infos from it are added to the flow.
//        .. Note that we only open the grounded envelopes - envelopes nested in sub-boundaries will be opened when they are grounded (if ever).
//   b) For a CONTENT COPY:
//     - It's basically the same routine as on boundary mount/update, but just done for closure via ContentBoundary instead of SourceBoundary.
//     - This is because, although sharing the same target defs, each copy is independent from the original render scope's applied defs - each copy has its own applied def root and should do its own pairing.
//
// - If the content gets ungrounded by a nested boundary that earlier grounded it:
//     * All its contents get destroyed, which includes destroying any nested sub-boundaries and envelopes - collecting infos for all this.
//     * For a TRUE PASS this means modifying the original applied defs treeNode assignments accordingly.
//       .. If the content later gets re-grounded, then it's like it was grounded for the first time.
//     * For a CONTENT COPY, it's simply the destruction - it also gets removed from the bookkeeping that maps copies.
//
// - When the original boundary re-renders:
//   * Any new sub-boundaries will trigger writing new envelopes for them, just like on the first render - collecting infos.
//   * Any sub-boundaries no longer present will be destroyed, which includes destroying all their envelopes and nested sub-boundaries as well - collecting infos.
//   * Any kept sub-boundaries (by def pairing) with sealed envelopes will get new envelopes in their place.
//     .. This causes a re-render of the contents for all the grounded passes and copies.
//   a) For a TRUE PASS:
//      - The situation is like on grounding, except that our def pairing has changed.
//         .. So likewise we start by finishing the pairing process: adding any missing treeNodes.
//      - Otherwise it's the same: the pairs are fed to a grounding process, and so on.
//   b) For a CONTENT COPY:
//      - It's simply the same routine as on boundary mount/update but for closures.
//
// 
// EXTRA OLD NOTES (before v3.1) - Using getChildren():
// - Using the getChildren method results in reading the child defs that are held inside the sealed envelope.
//   * In other words, it's like a spying technology that allows to read what's inside the envelope without opening it.
// - The boundary that does the spying also needs to be updated when contents have changed - to refresh the info, otherwise would have old info.
//   * This is marked into the closure, by using .getChildren() and/or .needsChildren(needs: boolean | null).
//     .. You can also just read the children without updating needs by .getChildren(false) - this is useful if you use it outside the render method.
//   * So whenever a new sealed copy (with same "id") is passed to replace the old one, the spying boundaries will also update.
//     .. The flow also takes care of that the spying boundaries won't be updated multiple times (because they are kids, might be updated anyway).


/**
 * For true ContentPass, the situation is very distinguished:
 *   - Because we are in a closure, our target defs have already been mapped to applied defs and new defs created when needed.
 *   - However, the treeNode part of the process was not handled for us. So we must do it now.
 *   - After having updated treeNodes and got our organized toApplyPairs, we can just feed them to applyDefPairs to get renderInfos and boundaryUpdates.
 */
export function runPassUpdate(contentBoundary: ContentBoundary, forceUpdate: boolean = false): MixDOMChangeInfos {

    // 1. Make a pre loop to assign groundable treeNodes.
    const [ toApplyPairs, toCleanUp, emptyMovers ] = assignTreeNodesForPass(contentBoundary);

    // 2. Apply the target defs recursively until each boundary starts (automatically limited by our toApplyPairs).
    // .. We update each def collecting render infos, and on boundaries create/update content closure and call mount/update.
    let [ renderInfos, boundaryChanges ] = applyDefPairs(contentBoundary, toApplyPairs, forceUpdate);

    // If we have custom clean ups.
    if (toCleanUp[0]) {
        // Go through the clean-uppable and collect.
        const unusedDefs: Set<MixDOMDefApplied> = new Set();
        for (const treeNode of toCleanUp) {
            // Was reused further inside.
            if (treeNode.sourceBoundary)
                continue;
            // Add to clean up.
            if (treeNode.def)
                unusedDefs.add(treeNode.def);
            // Just in case.
            treeNode.parent = null;
        }
        // Clean up any defs that were detected by custom clean up.
        if (unusedDefs.size) {
            const infos = cleanUpDefs(unusedDefs);
            // Add to the beginning.
            renderInfos = infos[0].concat(renderInfos);
            boundaryChanges = infos[1].concat(boundaryChanges);
        }
    }

    // Prepend empty movers.
    if (emptyMovers[0])
        renderInfos = emptyMovers.map(treeNode => ({ treeNode, emptyMove: true } as MixDOMRenderInfo)).concat(renderInfos);

    // Mark as having been activated. (We use this for the mount vs. update checks.)
    contentBoundary.isMounted = true;

    // 3. Return collected render infos.
    return [ renderInfos, boundaryChanges ];
}


// - Boundary update process - //

/** The main method to update the boundary.
 *
 * - MAIN IDEA - //
 *
 * PHASE I - pre-map reusability - "PRE-MANGLING LOOP":
 * 1. Handle boundary type: either render the SourceBoundary to get preDef tree or reuse it from existing ContentBoundary (copy!).
 * 2. Collect keys and contentPasses from already appliedDefs for reusing them.
 * 3. Go over the preDef tree and assign appliedDef to each targetDef.
 *    - We update our appliedDef tree (half-separately from old appliedDefs) as we go, and try to reuse as much as we can.
 *    - We also create / reuse treeNodes on the go.
 *    - The finding reusables also includes handling MixDOM.Content's.
 *      .. For any (generic or keyed) MixDOM.Content found, convert them into a contentPassDef and assign the closure given by our hostBoundary to it (if any).
 *      .. Like with normal defs, try to look for a fitting contentPass (from the earlier applied contentPasses) with keys and order.
 *    - As an output, we collect toApplyPairs for the next step below.
 *
 * PHASE II - apply defs and collect render infos - "GROUNDING LOOP":
 * 4. Start applying defs down the targetDef tree by given toApplyPairs and collect render infos.
 *    - a) For any fragment, we just continue to next (the kids will be there in the loop).
 *    - b) For any domtag def, collect render info (the kids will be in the loop).
 *    - c) For any sub-boundary, apply the def to the sub-boundary (with targetDefs with our appliedDefs attached) collecting its render info.
 *       * .. Note. Kids will not be in the loop - we need not go any further here. (This is pre-handled in toApplyPairs.)
 *       * .. Note that this will prevent from any MixDOM.Content within from being detected in our scope - note that they were already converted to closures above.
 *       * .... This is how it should be, because these closures will not be grounded by us - maybe by the nested boundary, maybe not.
 *    - d) For any contentPassDef, ground them - as they are now in direct contact with the dom tag chain.
 *       * .. This means, triggering the closure found in them (originally created by our host boundary, and might go way back).
 *       * .. So we won't go further, but we will trigger the process to go further down from here (by the closure).
 * 5. Clean up old defs and their content: destroy old dom content and unused boundaries with their closures and collect render infos for all the related destruction.
 * 6. Return the render infos.
 *
 */
export function runBoundaryUpdate(byBoundary: SourceBoundary | ContentBoundary, forceUpdate: boolean = false): MixDOMChangeInfos {


    // - 1. Handle source boundary vs. content boundary. - //


    // Prepare.
    let preDef : MixDOMDefTarget | null = null;
    let appliedDef: MixDOMDefApplied | null = byBoundary._innerDef;
    let renderInfos: MixDOMRenderInfo[];
    let boundaryChanges: MixDOMSourceBoundaryChange[];

    // If source boundary, render it to get the preDef tree.
    if (byBoundary.bId) {
        // Render.
        preDef = newDefFrom(byBoundary.render());
        // Make sure has appliedDef for a preDef.
        if (preDef && !appliedDef)
            appliedDef = newAppliedDef(preDef, byBoundary.closure);
    }
    // For content boundary, just get the already rendered def tree.
    else
        preDef = (byBoundary as ContentBoundary).targetDef;

    // - 2. Collect a map of current tags and applied defs - //
    // .. These maps will be used for wide pairing as well as for clean up.
    // .. Note that we should always build the map, even on boundary mount.
    // .... This is because in that case we were given a newly created appliedDef in runBoundaryUpdate, and it needs to be reusable, too.
    // .... Note that it will only be created if there wasn't an appliedDef and there is a preDef - for null -> null, this is not called.

    // Prepare.
    const [ defsByTags, unusedDefs ] = !appliedDef ? [ new Map<MixDOMDefKeyTag, MixDOMDefApplied[]>(), new Set<MixDOMDefApplied>() ] : buildDefMaps(appliedDef);
    const emptyMovers: MixDOMTreeNode[] = [];
    // Normal case.
    if (preDef) {

        // - 3. Go over the preDef tree and assign appliedDef to each targetDef (including smart assigning for multiple MixDOM.Contentes). - //
        // .. We collect the new appliedDef tree as we go - as a separate copy from the original.
        // .. We also collect toApplyPairs already for a future phase of the process.

        const toCleanUpDefs: MixDOMDefApplied[] = [];
        const toApplyPairs = pairDefs(byBoundary, preDef, appliedDef as MixDOMDefApplied, defsByTags, unusedDefs, toCleanUpDefs, emptyMovers);

        // Update the _innerDef.
        // .. There is always a pair, if there was a preDef.
        // .. Note that we can't rely on that it's still the appliedDef - due to that root might have been swapped.
        byBoundary._innerDef = toApplyPairs[0][1];

        // - 4. Apply the target defs recursively until each boundary starts (automatically limited by our toApplyPairs). - //
        // .. We update each def collecting render infos, and on boundaries create/update content closure and call mount/update.
        [ renderInfos, boundaryChanges ] = applyDefPairs(byBoundary, toApplyPairs, forceUpdate);


        // - 5a. Extra clean ups - //

        // The toCleanUpDefs are defs that might need clean up.
        // .. Now that all the grounding has been done, we can check if they really should be cleaned up.
        if (toCleanUpDefs[0]) {
            for (const def of toCleanUpDefs) {
                // Only for the ones that really were not landed after all.
                const treeNode = def.treeNode;
                if (!treeNode || (treeNode.sourceBoundary !== null))
                    continue;
                unusedDefs.add(def);
            }
        }

    }
    // Go to null / stay at null.
    else {
        // Define.
        renderInfos = [];
        boundaryChanges = [];
        // Go to null.
        // .. Note. Previously empty move was added every time at null - but don't think it's necessary, so now behind this if clause.
        if (appliedDef || !byBoundary.isMounted)
            // Let's add in an emptyMove. Let's add it in even if was not mounted yet.
            // .. Not sure if is needed, but certainly can't hurt - maybe is even required (if appeared as a first child).
            emptyMovers.push(byBoundary.treeNode);
        // Nullify and cut.
        // .. The innerBoundaries are normally reassigned on .applyDefPairs.
        byBoundary.innerBoundaries = [];
        // .. Note. The cutting would normally be done in the processing in .assignTreeNodesFor (part of .pairDefs).
        byBoundary.treeNode.children = [];
        // .. Note that the appliedDef will never be null for content boundary. Otherwise it wouldn't have gotten here.
        byBoundary._innerDef = null;
    }

    // - 5b. Main clean up - handle removing unused applied defs. - //
    // .. Note, we put here all the render infos for destruction at the start of the array.

    // Clean up any defs that were unused by the pairing process.
    if (unusedDefs.size) {
        const infos = cleanUpDefs(unusedDefs);
        // Add to the beginning.
        renderInfos = infos[0].concat(renderInfos);
        boundaryChanges = infos[1].concat(boundaryChanges);
    }

    // Prepend empty movers.
    if (emptyMovers[0])
        renderInfos = emptyMovers.map(treeNode => ({ treeNode, emptyMove: true } as MixDOMRenderInfo)).concat(renderInfos);

    // Mark as having been activated.
    if (!byBoundary.isMounted)
        byBoundary.isMounted = true;

    
    // - 6. Return collected render infos. - //

    return [ renderInfos, boundaryChanges ];

}


// - Apply def pairs core method - //

/** This is the core method for actually applying the meaning of defs into reality.
 * - The process includes applying dom tags into dom elements (not rendering yet) and instancing/updating sub boundaries.
 * - The array of toApplyPairs to be fed here should only include the "groundable" ones and in tree order (use .pairDefs method).
 *   .. All the other content (= not included in toApplyPairs) gets passed on as a closure by creating/updating it from .childDefs.
 * - Each item in the toApplyPairs is [toDef, aDef, treeNode ]
 * - Importantly this collects and returns ordered renderInfos and boundaryCalls, which can be later executed.
 */
export function applyDefPairs(byBoundary: SourceBoundary | ContentBoundary, toApplyPairs: ToApplyPair[], forceUpdate: boolean = false): MixDOMChangeInfos {

    // Main idea:
    // - Start applying defs down the targetDef tree by given toApplyPairs and collect render infos.
    //    a) For any fragment, we just continue to next (the kids will be there in the loop).
    //    b) For any domtag def, collect render info (the kids will be in the loop).
    //    c) For any sub-boundary, apply the def to the sub-boundary (with targetDefs with our appliedDefs attached) collecting its render info.
    //       .. Note. Kids will not be in the loop - we need not go any further here. (This is pre-handled in toApplyPairs.)
    //       .. Note that this will prevent from any MixDOM.Content within from being detected in our scope - note that they were already converted to closures above.
    //       .... This is how it should be, because these closures will not be grounded by us - maybe by the nested boundary, maybe not.
    //    d) For any contentPassDef, ground them - as they are now in direct contact with the dom tag chain.
    //       .. This means, triggering the closure found in them (originally created by our host boundary, and might go way back).
    //       .. So we won't go further, but we will trigger the process to go further down from here (by the closure).

    // Apply the target defs recursively until each boundary starts (automatically limited by our toApplyPairs).
    // .. We update each def collecting render infos, and on boundaries create/update content closure and call mount/update.

    // Prepare.
    const sourceBoundary = (byBoundary.bId ? byBoundary : byBoundary.sourceBoundary) as SourceBoundary;
    const movedNodes: MixDOMTreeNode[] = [];
    const domPreCheckType = byBoundary.host.settings.preCompareDOMProps;

    // Clear innerBoundaries and innerPasses, they will be added again below.
    byBoundary.innerBoundaries = [];

    // Loop all toApplyPairs.
    let allChanges: MixDOMChangeInfos = [ [], [] ];
    for (const defPair of toApplyPairs) {

        // Prepare.
        const [ toDef, aDef, treeNode ] = defPair;
        const mountRun = aDef.action === "mounted";

        // Detect move. (For dom tags, boundaries and passes handled separately.)
        if (!mountRun && aDef.action === "moved") {
            switch (aDef.MIX_DOM_DEF) {

                // For clarity and robustness, boundary's move is not handled here but in .updateBoundary in HostServices.
                // case "boundary":

                // Pass is handlded in contentGrounded, so it's not handled here to not double.
                // case "pass":

                case "fragment":
                    // Move roots.
                    for (const node of rootDOMTreeNodes(treeNode, true, true)) { // <-- We use includeEmpty because maybe not all domNodes are not mounted yet.
                        if (movedNodes.indexOf(node) !== -1)
                            continue;
                        movedNodes.push(node);
                        allChanges[0].push({ treeNode: node, move: true });
                    }
                    break;
                case "host":
                    // Verify that the host is dedicated to us (might be stolen).
                    if (aDef.host && aDef.host.groundedTree.parent === treeNode)
                        allChanges[0].push({ treeNode, move: true } as MixDOMRenderInfo);
                    break;
            }
        }

        // For fragments, there's nothing else.
        // .. Note that the remote need updates are handled in pairDefs process - to support auto-disabling at the same while.
        if (aDef.MIX_DOM_DEF === "fragment")
            continue;


        // - Special case: content passing - //

        // If the treeNode refers to a pass, let's handle it here and stop.
        if (treeNode.type === "pass") {

            // If it's not an actual pass, but a def related to the same treeNode, we can just skip.
            // .. It's then actually a fragment - either a real one or the one at the root of the content boundary (by design).
            // .. We only want to run the procedures below once for every pass.
            // .. Note. Actually, we don't need this check anymore - fragments have been cut out above - but just in case / for completion.
            if (aDef.MIX_DOM_DEF !== "pass")
                continue;

            // Remote.
            let contentPass = aDef.contentPass;
            let contentKey = MixDOMContent.key;
            if (aDef.getRemote) {
                // Get fresh remote.
                const Remote = aDef.getRemote() as ComponentRemoteType;
                // Update key - it's used to detect true pass.
                contentKey = Remote.Content?.key;
                // Changed - only happens for contextual components, except for initial assigning (without the unground part).
                const newClosure: ContentClosure | null = Remote.closure || null;
                if (contentPass !== newClosure) {
                    // Unground.
                    if (contentPass)
                        mergeChanges( allChanges, ungroundClosureContent(contentPass, aDef) );
                    // Assign new - will be grounded below.
                    aDef.contentPass = newClosure;
                    contentPass = newClosure;
                }
            }

            // Ground and collect changes.
            // .. Note that we always have contentPass here, but for typescript put an if clause.
            // .... The reason for this is that targetDef's have .contentPassType and appliedDef's have .contentPass.
            // .... In the typing, it's just defined commonly for both, so both are optional types.
            if (contentPass)
                mergeChanges( allChanges, groundClosureContent(contentPass, aDef, byBoundary, treeNode, aDef.key !== contentKey ? aDef.key : null) );

            // Add content boundary to collection.
            if (treeNode.boundary)
                byBoundary.innerBoundaries.push(treeNode.boundary);

            // Nothing more to do.
            // .. Note that all around below, there's no case for "pass" - it's been completely handled here.
            continue;
        }


        // - Normal case: detect & update changes - //

        // Collect.
        const propsWere = aDef.props;
        let contentChanged = false;

        // Props.
        // .. They are for types: "element", "dom" and "boundary".
        // .. Also for "content" if has .domHTMLMode = true.
        if (toDef.props) {
            if (aDef.props !== toDef.props) {
                // Add to pre-updates.
                if (treeNode.boundary)
                    treeNode.boundary._outerDef.props = toDef.props;
                // Update.
                aDef.props = toDef.props || {};
            }
        }

        // Apply special properties and detect swaps.
        let isDomType = false;
        switch(aDef.MIX_DOM_DEF) {

            // Case: Fragment - nothing to do.
            // Case: ContentPass - nothing to do. And actually not even in here - cut out above.

            // Content.
            case "content":
                isDomType = true;
                // Detect.
                const htmlMode = toDef.domHTMLMode;
                contentChanged = aDef.domContent !== toDef.domContent || htmlMode !== toDef.domHTMLMode;
                // Update.
                if (contentChanged) {
                    aDef.domContent = toDef.domContent as MixDOMContentSimple;
                    htmlMode !== undefined ? aDef.domHTMLMode = htmlMode : delete aDef.domHTMLMode;
                }
                break;

            // Element: swapping, .element, .cloneMode and .props.
            case "element":
                isDomType = true;
                if (aDef.domElement !== toDef.domElement) {
                    // Element swap.
                    if (!mountRun)
                        allChanges[0].push({ treeNode: treeNode as MixDOMTreeNodeDOM, swap: true });
                    // Apply.
                    aDef.domElement = toDef.domElement || null;
                }
                // Note. There's no real time mode change support - other than this.
                aDef.domCloneMode = toDef.domCloneMode != null ? toDef.domCloneMode : null;
                break;

            case "dom":
                isDomType = true;
                break;

            // Portal: swapping and .domPortal.
            case "portal":
                if (aDef.domPortal !== toDef.domPortal) {
                    // Portal mount or swap.
                    allChanges[0].push({ treeNode: treeNode as MixDOMTreeNodePortal, [mountRun ? "create" : "swap"]: true });
                    // Apply.
                    aDef.domPortal = toDef.domPortal || null;
                }
                break;

            // Case: Sub boundary.
            // .. We only create it here, updating it is handled below.
            case "boundary":
                if (mountRun) {
                    // Pre-attach the contexts.
                    if (toDef.attachedContexts)
                        aDef.attachedContexts = toDef.attachedContexts;
                    // Create new boundary.
                    const boundary = new SourceBoundary(byBoundary.host, aDef, treeNode, sourceBoundary);
                    boundary.parentBoundary = byBoundary;
                    treeNode.boundary = boundary;
                }
                break;

            // Case: Host.
            case "host":
                // Note that the .host is already assigned on deffing to the toDef (so we'll have it on aDef too).
                if (aDef.host) {
                    // Prepare.
                    const origHost = aDef.host;
                    let host = origHost;
                    // Upon mounting.
                    if (aDef.action === "mounted") {
                        // If was not updating an existing one and is already in use, we should try to duplicate.
                        if (origHost.groundedTree.parent) {
                            // See if can duplicate.
                            const duplicatable = host.settings.duplicatableHost;
                            if (typeof duplicatable === "function") {
                                const talkback = duplicatable(aDef.host, treeNode as MixDOMTreeNodeHost);
                                if (!talkback)
                                    break;
                                if (typeof talkback === "object") {
                                    // Was given a custom - make sure it's not taken.
                                    if (talkback.groundedTree.parent)
                                        break;
                                    host = talkback;
                                }
                            }
                            // Cannot duplicate.
                            else if (!duplicatable)
                                break;
                            // Got thru - create a new host (unless provided a new one).
                            const shadowAPI = origHost.shadowAPI;
                            if (host === origHost)
                                host = new (origHost.constructor as typeof Host)( origHost.services.getRootDef(true), null, origHost.settings, null, shadowAPI);
                            // If gave a custom Host, then swap ShadowAPI and update instances manually.
                            else if (host.shadowAPI !== origHost.shadowAPI) {
                                host.shadowAPI.hosts.delete(host);
                                host.shadowAPI = origHost.shadowAPI;
                            }
                            // Copy context assignments.
                            for (const ctxName in shadowAPI.contexts) {
                                const ctx = shadowAPI.contexts[ctxName];
                                if (ctx)
                                    host.contextAPI.setContext(ctxName as never, ctx as never, false);
                            }
                            // Set into the def.
                            aDef.host = host;
                        }
                        // In any case make sure is found in the shadowAPI hosts.
                        origHost.shadowAPI.hosts.add(host);
                    }

                    // Handle reassigning (duplicated or not).
                    // .. Reassign.
                    host.groundedTree.parent = treeNode;
                    treeNode.children = [ host.groundedTree ];
                    // .. Render infos.
                    allChanges[0].push( { treeNode: treeNode as MixDOMTreeNodeHost, move: true } );
                    break;
                }
        }

        // Case: Dom tags. Collect render info (the kids will be in the loop).
        if (isDomType) {
            // Create.
            if (mountRun)
                allChanges[0].push( {
                    treeNode: treeNode as MixDOMTreeNodeDOM,
                    create: true,
                } );
            // Prop updates to existing dom element.
            else {
                // Check if should.
                const move = aDef.action === "moved" && (movedNodes.indexOf(treeNode) === -1);
                // .. Note that simpleContent never has props, so if aDef.tag === "" we never need to update (nor move, just content).
                const update = aDef.tag ?
                        !domPreCheckType
                        || ((domPreCheckType === "if-needed") && (contentChanged || move))
                        || !equalDOMProps(propsWere || {}, toDef.props || {})
                    : false;
                // Add to rendering.
                if (update || contentChanged || move) {
                    const info: MixDOMRenderInfo = { treeNode: treeNode as MixDOMTreeNodeDOM };
                    if (update)
                        info.update = true;
                    if (contentChanged)
                        info.content = true;
                    if (move) {
                        info.move = true;
                        movedNodes.push(treeNode);
                    }
                    allChanges[0].push( info );
                }
            }
            // Attach signals - we just pass the dictionary like object.
            // .. It will be used directly at the appropriate moment as a source for extra calls.
            if (aDef.attachedSignals !== toDef.attachedSignals)
                toDef.attachedSignals ? aDef.attachedSignals = toDef.attachedSignals : delete aDef.attachedSignals;
        }


        // - Special case: Updating a source boundary - //

        // Handle source boundary - upon creation or updating.
        // .. For any sub-boundary, apply the def to the sub-boundary (with targetDefs with our appliedDefs attached) collecting its render info.
        // .... Note. Kids will not be in the loop - we need not go any further here. (This is pre-handled in toApplyPairs.)
        // .... Note that this will prevent from any MixDOM.Content within from being detected in our scope - note that they were already converted to closures above.
        // ...... This is how it should be, because these closures will not be grounded by us - maybe by the nested boundary, maybe not.
        if (treeNode.boundary) {

            // - Before updating - //

            // Shortcut.
            // .. Note that we already cut the "pass" type above, so this here will always be a source boundary - not content passing boundary.
            const boundary = treeNode.boundary as SourceBoundary;

            // Add source or content boundary to collection.
            byBoundary.innerBoundaries.push(boundary);

            // Finish the constructing only now.
            // .. This way the process is similar to functional and class, and we need no special handling.
            if (mountRun) {
                if (aDef.tag && aDef.tag["_WithContent"]) { 
                    const withDef = aDef.tag["_WithContent"] as MixDOMDefTarget;
                    const sClosure: ContentClosure = withDef.getRemote ? withDef.getRemote().closure : sourceBoundary.closure;
                    (sClosure.withContents || (sClosure.withContents = new Set())).add(boundary);
                }
                boundary.reattach();
            }

            // Attach signals by props, before updating the boundary (but after creating it, if mountRun).
            const component = boundary.component;
            if (aDef.attachedSignals !== toDef.attachedSignals) {
                // Changes.
                const diffs = getDictionaryDiffs(aDef.attachedSignals || {}, toDef.attachedSignals || {});
                if (diffs) {
                    for (const key in diffs)
                        diffs[key] ? component.listenTo(key as any, diffs[key]) : component.unlistenTo(key as any, (aDef.attachedSignals as any)[key]);
                }
                // In any case, assign the new ones to the applied def.
                aDef.attachedSignals = toDef.attachedSignals;
            }

            // Attach contexts by props, before updating the boundary.
            if (aDef.attachedContexts !== toDef.attachedContexts) {
                // Note that on the mountRun these have already been assigned above.
                // .. The prodecude is finished then on the initContextAPI().
                if (component.contextAPI) {
                    // Handle diffs.
                    const diffs = getDictionaryDiffs(aDef.attachedSignals || {}, toDef.attachedSignals || {});
                    if (diffs) {
                        // Loop each.
                        for (const ctxName in diffs)
                            diffs[ctxName] ? component.contextAPI.setContext(ctxName as never, diffs[ctxName] as any) : component.contextAPI.setContext(ctxName as never, null);
                        // Call data listeners.
                        // .. Note that on the mount run, there can only be component.contextAPI at this point in class form.
                        // .. In functional form, it will be detected on the first render and called right after assigning the new renderer and calling again.
                        // .. If not on the mount run, then we can just call them now. It's just about to go the update process below in any case.
                        component.contextAPI.callDataBy(mountRun || Object.keys(diffs) as any);
                    }
                }
                // In any case, assign the new ones to the applied def.
                aDef.attachedContexts = toDef.attachedContexts;
            }


            // - Content passing (before update, after contexts) - //

            // Collect a new envelope for the content.
            // .. Note, there will not be a situation that toDef is a boundary and also has simple content - so always has childDefs.
            let newEnvelope: MixDOMContentEnvelope | null = null;
            const oldEnvelope = boundary.closure.envelope;
            if (toDef.childDefs[0]) {
                // Create new fragment to hold the childDefs, and keep the reference for aDef.childDefs (needed for true content pass)..!
                if (!oldEnvelope) {
                    newEnvelope = {
                        applied: { tag: null, MIX_DOM_DEF: "fragment", childDefs: aDef.childDefs, action: "mounted" },
                        target: { tag: null, MIX_DOM_DEF: "fragment", childDefs: toDef.childDefs }
                    };
                }
                // Just create a new envelope based on existing.
                else {
                    newEnvelope = {
                        applied: { ...oldEnvelope.applied, childDefs: aDef.childDefs, action: aDef.action },
                        target: { ...oldEnvelope.target, childDefs: toDef.childDefs },
                    };
                }
            }

            // Refresh source connection and collect infos from it.
            if (component.constructor.MIX_DOM_CLASS === "Remote")
                allChanges = mergeChanges( allChanges, (component as ComponentRemote).reattachSource() );
                //
                // <-- Do we strictly speaking need this? Doesn't host.services.updateBoundary's refreshRemote do the trick more fully?
                // ... However, this does work with direct infos (unlike .refreshRemote), which is preferable. But this does not include selecting best source, so we can't only have this.
                // ... Let's just keep it as it is. Maybe it's important for cases where would simultaneously put higher importance and move an element in to that remote.


            // Pre-refresh and collect interested.
            /** The closure of this boundary.
             * - If `null`, then there's no need to use it because content was empty and will be empty. 
             * - We use this simply to skip having a skipContent variable and for better minified shortcutting. */
            const bClosure = oldEnvelope || newEnvelope ? boundary.closure : null;
            let bInterested: Set<SourceBoundary> | null = null;
            if (bClosure) {
                // Do a "pre-refresh" to update the info for the update runs below.
                // .. But we will not yet apply the content to grounded - maybe they will not be there anymore, or maybe there'll be more.
                bInterested = preRefreshClosure(bClosure, newEnvelope);
                // Update the chainedClosures chaining.
                const sClosure = sourceBoundary.closure;
                aDef.hasPassWithin ? (sClosure.chainedClosures || (sClosure.chainedClosures = new Set())).add(bClosure) : sClosure.chainedClosures?.delete(bClosure);
            }


            // - Run updates - //

            // Run updates. It's done with an if-should check, but in either case it will clear the pending updates.
            // .. We tell that our bInterested are ordered, because they came from the content passing process (if we had any).
            // .. Actually no: they are not ordered - the sub branches are, but the insertion points might not be (they might move).

            // Run.
            allChanges = mergeChanges( allChanges, byBoundary.host.services.updateBoundary(boundary, forceUpdate, movedNodes, bInterested) );

            
            // - After updating - //

            // Finally, apply the content to the groundable spots inside.
            // .. As can be seen, we will first let their do their updates.
            // .... That is why we pre-refreshed them, so they have fresh info.
            // .... So that if any grounds, they can ground immediately.
            // .. But now is time to apply to any "still existing oldies" (excluding dead and newly grounded).
            if (bClosure)
                allChanges = mergeChanges( allChanges, applyClosureRefresh(bClosure, forceUpdate) );

        }


        // - Finish updating - //

        // Detach / attach ref.
        if (aDef.attachedRefs || toDef.attachedRefs) {
            // Detach.
            const aRefs = aDef.attachedRefs;
            const toRefs = toDef.attachedRefs;
            if (aRefs) {
                for (const ref of aRefs) {
                    if (!toRefs || !toRefs.includes(ref))
                        Ref.willDetachFrom(ref, treeNode);
                }
            }
            // Attach refs. When we are landing forwarded refs from host boundaries.
            if (toRefs) {
                for (const ref of toRefs)
                    if (!aRefs || !aRefs.includes(ref))
                        Ref.didAttachOn(ref, treeNode);
            }
            // Update.
            aDef.attachedRefs = toRefs;
        }

    }

    return allChanges;
}


// - Clean up routines - //

export function cleanUpDefs(unusedDefs: Iterable<MixDOMDefApplied>, nullifyDefs: boolean = true, destroyAllDOM: boolean = true): MixDOMChangeInfos {
    
    // // - DEVLOG - //
    // // Log.
    // if (devLog)
    //     console.log("__routinesApply.cleanUpDefs: Dev-log: Clean up unused defs: ", [...unusedDefs]);

    // Loop each and destroy accordingly.
    let allChanges: MixDOMChangeInfos = [ [], [] ];
    for (const aDef of unusedDefs) {
        // Nothing to do.
        const treeNode = aDef.treeNode;
        if (!treeNode)
            continue;

        // Remove.
        switch(aDef.MIX_DOM_DEF) {

            // The ones that will handle refs by themselves - use break.
            case "dom":
            case "element":
            case "content":
                if (destroyAllDOM)
                    allChanges[0].push( { treeNode: treeNode as MixDOMTreeNodeDOM, remove: true });
                break;
            case "boundary":
                // Note that we must not nullifyDefs.
                // .. Otherwise, we cannot swap away stuff from the to-be-destroyed boundary's content pass (defined by us).
                // .. Note that destroyBoundary will call back here recursively.
                if (treeNode.boundary)
                    allChanges = mergeChanges(allChanges, destroyBoundary(treeNode.boundary, false, destroyAllDOM));
                break;

            // Don't break for the below one - we want to generally detach attachedRefs from all of them.

            case "pass":
                // Content pass - by parent chain or remote flow.
                if (aDef.contentPass)
                    allChanges = mergeChanges(allChanges, ungroundClosureContent(aDef.contentPass, aDef));

            case "host": {
                const host = aDef.host;
                if (host && host.groundedTree.parent === treeNode) {
                    // Reassign.
                    host.groundedTree.parent = null;
                    treeNode.children = [];
                    // Render.
                    allChanges[0].push( { treeNode: treeNode as MixDOMTreeNodeHost, move: true });
                    // Clear from duplicatable hosts, and from contextual linking.
                    host.shadowAPI.hosts.delete(host);
                    const cAPI = host.contextAPI;
                    for (const ctxName in cAPI.contexts)
                        cAPI.contexts[ctxName]?.contextAPIs.delete(cAPI);
                }
            }

            default:
                if (aDef.attachedRefs && aDef.MIX_DOM_DEF)
                    for (const attachedRef of aDef.attachedRefs)
                        Ref.willDetachFrom(attachedRef, treeNode);
                break;

        }
        // Nullify.
        if (nullifyDefs) {
            treeNode.parent = null;
            treeNode.sourceBoundary = null;
            delete aDef.treeNode;
        }
        //
        //
        // <-- Verify here that still works in all cases. Was before behind a check that verified that is within content boundary.

    }
    return allChanges;
}


/** This destroys a given boundary and cleans up everything in it recursively. */
export function destroyBoundary(boundary: SourceBoundary | ContentBoundary, nullifyDefs: boolean = true, destroyAllDOM: boolean = true): MixDOMChangeInfos {
    // Prepare.
    let allChanges: MixDOMChangeInfos = [ [], [] ];

    // We destroy each in tree order - using routinesApply.destroyBoundary and routinesApply.cleanUpDefs as a recursive pair.
    // .. Note. In a way, it'd be more natural to do it in reverse tree order.
    // .. However, we want to do the ref unmounting in tree order, in order to allow "salvaging" to work more effectively.
    // .... And we don't want component.willUnmount to run in reverse tree order while ref.onDomUnmount runs in tree order.
    // .. So as a result, we do the unmounting process in tree order as well.
    // .... If needed later, can be changed - just should handle salvaging in coherence with this.
    // .... However, it's not anymore that easy to change back - if does, should again switch to (pre v3) way of collecting all inside and looping them here.

    // Already destroyed.
    if (boundary.isMounted === null)
        return allChanges;
    // Source boundary.
    const sBoundary = boundary.bId ? boundary : null;
    if (sBoundary) {
        const component = sBoundary.component;
        const Comp = component.constructor as ComponentType | ComponentShadowType | ComponentRemoteType;
        // Call.
        if (component.signals.willUnmount)
            callListeners(component.signals.willUnmount);
        // Detach attached refs.
        const outerDef = sBoundary._outerDef;
        if (outerDef.attachedRefs) {
            for (const attachedRef of outerDef.attachedRefs)
                Ref.willDetachFrom(attachedRef, sBoundary.treeNode);
        }
        // Remove from closure chaining.
        sBoundary.sourceBoundary?.closure.chainedClosures?.delete(sBoundary.closure);
        // Remove contextual connections.
        const cAPI = component.contextAPI;
        if (cAPI) {
            // Clear from direct connections to contexts.
            for (const ctxName in cAPI.contexts)
                cAPI.contexts[ctxName]?.contextAPIs.delete(cAPI);
            cAPI.contexts = {};
            // Clear from indirect through host.
            sBoundary.host.contextComponents.delete(component as ComponentCtx);
        }
        // Remove from shadow bookkeeping and clear their signals.
        if (Comp.api) {
            Comp.api.components.delete(component as any); // Some typing thing here. Things should have RemoteProps.
            if (Comp.api.signals)
                Comp.api.signals = {};
        }
        // Remote.
        if (Comp.MIX_DOM_CLASS === "Remote")
            // Remove source, and add the destructional changes. (There's likely to be some, unless was using multiple remotes or had empty content.)
            // .. The other changes will be bound to a host listener and run after, this includes triggering any interested ones.
            allChanges = mergeChanges(allChanges, (Comp as ComponentRemoteType).removeSource(component as ComponentRemote));

        // Remove from content closure tracking of the parent boundary that rendered us.
        if (outerDef.tag["_WithContent"]) {
            // Parental vs. remote.
            const withDef = outerDef.tag["_WithContent"] as MixDOMDefTarget;
            const sClosure = withDef.getRemote ? withDef.getRemote().closure : sBoundary.sourceBoundary?.closure;
            // Remove from bookkeeping.
            if (sClosure?.withContents) {
                sClosure.withContents.delete(sBoundary);
                if (!sClosure.withContents.size)
                    delete sClosure.withContents;
            }
        }

        // Clear signals. We just reset them.
        if (component.signals)
            component.signals = {};

        // Clear timers.
        if (component.timers)
            component.clearTimers();

    }

    // Add root removals for rendering info - note that we find the root nodes recursively thru nested boundaries.
    // .. We collect them in tree order for correct salvaging behaviour.
    if (destroyAllDOM)
        allChanges[0] = allChanges[0].concat(rootDOMTreeNodes(boundary.treeNode, true).map(treeNode => ({ treeNode: treeNode as (MixDOMTreeNodeDOM | MixDOMTreeNodeBoundary), remove: true } as MixDOMRenderInfo)));

    // Get all defs and send to cleanUpDefs - we also pass the nullifyDefs down, but do not pass destroyAllDOM as we already captured the root nodes above recursively.
    // .. Note that if our inner def contains boundaries within (or is a boundary def itself), it will call here recursively down the structure (with destroyAllDOM set to false).
    if (boundary._innerDef)
        allChanges = mergeChanges(allChanges,
            cleanUpDefs(allDefsIn(boundary._innerDef), nullifyDefs, false)
        );

    // Remove from updates, if was there.
    if (sBoundary)
        sBoundary.host.services.cancelUpdates(sBoundary);

    // Mark as destroyed.
    boundary.isMounted = null;
    return allChanges;
}


// - Grounding / Ungrounding closure - //

/** Should be called when a treeNode is grounding us to the grounded tree.
 * - If was grounded for the first time, updates the internals and returns render infos and boundary updates for the content.
 * - If was already grounded, returns [] for infos.
 */
export function groundClosureContent(closure: ContentClosure, groundingDef: MixDOMDefApplied, gBoundary: SourceBoundary | ContentBoundary, treeNode: MixDOMTreeNode, copyKey?: any): MixDOMChangeInfos {

    // Note that we don't collect listener boundaries.
    // .. Instead it's handled by downward flow (as content is rarely passed super far away).
    // .. To make it easier to handle not calling update on boundary many times, we just return a list of interested boundaries on .preRefresh().
    // .. The rest is then handled externally by the applyDefPairs process (after this function has returned).

    // Already grounded.
    // .. There's no changes upon retouching the ground - it was the parent that rendered, we don't care and nor does it.
    // .. However, we must still detect moving, and add according renderInfos (for all our dom roots) if needed.
    const info = closure.groundedDefs.get(groundingDef);
    if (info) {
        // Check if should move the content.
        if (groundingDef.action === "moved" && treeNode.boundary) {
            // If so, it's just a simple move by collecting all root nodes inside.
            return [
                rootDOMTreeNodes(treeNode.boundary.treeNode, true, true).map( // <-- We use includeEmpty because maybe not all domNodes are not mounted yet. Similarly as in applyDefPairs.
                    treeNode => ({ treeNode, move: true }) as MixDOMRenderInfo ),
                []
            ];
        }
        // Nothing to do.
        return [[], []];
    }

    // Update mapping.
    closure.groundedDefs.set(groundingDef, [gBoundary, treeNode, copyKey]);

    // Update now and return the infos to the flow - we do this only upon grounding for the first time.
    // .. Otherwise, our content is updated on .applyRefresh(), which will be called after.
    return applyContentDefs(closure, [groundingDef]);

}

/** Should be called when a treeNode that had grounded our content into the grounded tree is being cleaned up. */
export function ungroundClosureContent(closure: ContentClosure, groundingDef: MixDOMDefApplied): [MixDOMRenderInfo[], MixDOMSourceBoundaryChange[]] {
    // Not ours - don't touch.
    const info = closure.groundedDefs.get(groundingDef);
    if (!info)
        return [[], []];
    // Was the real pass - free it up.
    if (closure.truePassDef === groundingDef)
        closure.truePassDef = null;
    // Remove from groundDefs and put its childDefs back to empty.
    closure.groundedDefs.delete(groundingDef);
    closure.pendingDefs.delete(groundingDef);
    // Destroy the content boundary (attached to the treeNode in our info).
    // .. We must nullify the defs too.
    const boundary = info[1].boundary;
    return boundary ? destroyBoundary(boundary) : [[], []];
}


// - Refresh content closures - //

/** Internal helper to apply a new envelope and update any interested inside, returning the infos. */
export function applyClosureEnvelope(closure: ContentClosure, newEnvelope: MixDOMContentEnvelope | null): MixDOMChangeInfos {
    // Update interested.
    const interested = preRefreshClosure(closure, newEnvelope);
    const extraInfos: MixDOMChangeInfos | null = interested && updatedInterestedInClosure(interested);
    // Apply and get infos.
    const ourInfos = applyClosureRefresh(closure);
    return extraInfos ? [ extraInfos[0].concat(ourInfos[0]), extraInfos[1].concat(ourInfos[1]) ] : ourInfos;
}

/** Sets the new envelope so the flow can be pre-smart, but does not apply it yet. Returns the interested sub boundaries. */
export function preRefreshClosure(closure: ContentClosure, newEnvelope: MixDOMContentEnvelope | null, byRemote?: ComponentRemote | null): Set<SourceBoundary> | null {

    // Notes about remote flow:
    // 1. The normal content passing happens for the Remote source's closure by its parent.
    // 2. Then it hits the closure.remote check below, and if active remote it goes through it - if not the flow is routed here (where it will never have grounding spots, so will die).
    // 3. The preRefreshClosure flow for remote will then call the connected output closure for preRefreshClosure(closure, newEnvelope, remote) giving the byRemote arg.
    // 4. Finally, the flow hits back here (in another closure) with byRemote provided and with there being no .remote as it's the output part of the remote.
    // 5. And then the part below with collectInterestedInClosure(closure, byRemote) is triggered using the byRemote gotten from step 3.

    // If part of remote, our grounders are in the remote closure.
    if (closure.remote && closure.remote.canRefresh()) {
        closure.envelope = newEnvelope;
        return closure.remote.preRefresh(newEnvelope);
    }
    // Special quick exit: already at nothing.
    if (!closure.envelope && !newEnvelope)
        return null;
    
    // // Alternative detection for whether our new envelope contains a content pass or not.
    // // .. If it does, we'll update the chainedClosures bookkeeping.
    // // .. Note that this feature is now detected in defPairs without this extra run using def.hasPassWithin and used in routinesApply.
    // const sClosure = closure.sourceBoundary?.closure;
    // if (sClosure) {
    //     let hasPass = false;
    //     if (newEnvelope) {
    //         let defs = newEnvelope.applied.childDefs;
    //         while (defs[0]) {
    //             let nextDefs: MixDOMDefApplied[] = [];
    //             for (const def of defs) {
    //                 if (def.MIX_DOM_DEF === "pass") {
    //                     hasPass = true;
    //                     break;
    //                 }
    //                 if (def.childDefs[0])
    //                     nextDefs = nextDefs.concat(def.childDefs);
    //             }
    //             if (hasPass)
    //                 break;
    //             defs = nextDefs;
    //         }
    //     }
    //     if (hasPass)
    //         (sClosure.chainedClosures || (sClosure.chainedClosures = new Set())).add(closure);
    //     else
    //         sClosure.chainedClosures?.delete(closure);
    // }

    // Collect interested.
    const interested = collectInterestedInClosure(closure, byRemote);
    // Mark that they have updates.
    if (interested)
        for (const b of interested)
            b._forceUpdate = b._forceUpdate || true;
    // Set envelope.
    closure.envelope = newEnvelope;
    // Mark all as pending.
    closure.pendingDefs = new Set(closure.groundedDefs.keys());
    // Return the interested one or then nothing.
    return interested;
}

/** Call this after preRefresh to do the actual update process. Returns infos for boundary calls and render changes. */
export function applyClosureRefresh(closure: ContentClosure, forceUpdate: boolean = false): MixDOMChangeInfos {

    // If part of remote, our grounders are in the remote closure.
    if (closure.remote && closure.remote.canRefresh())
        return closure.remote.applyRefresh(forceUpdate);

    // Prepare outcome.
    let renderInfos: MixDOMRenderInfo[] = [];
    let boundaryChanges: MixDOMSourceBoundaryChange[] = [];

    // Apply closure content to all pending and still existing grounders.
    // .. Note that the only time there's a grounder that's not pending is that when it was just grounded.
    // .. In that case its render info was returned in that part of flow.
    if (closure.pendingDefs.size)
        [ renderInfos, boundaryChanges ] = applyContentDefs(closure, closure.pendingDefs, forceUpdate);

    // // There's no true pass def at all - clean up all inside in relation to original defs.
    // if (!closure.truePassDef && closure.envelope) {
    //     const devLog = closure.sourceBoundary && closure.sourceBoundary.host.settings.devLogCleanUp || false;
    //     for (const def of closure.envelope.applied.childDefs) {
    //         // Nothing to clean up.
    //         const treeNode = def.treeNode;
    //         if (!treeNode)
    //             continue;
    //         // - DEVLOG - //
    //         // Log.
    //         if (devLog)
    //             console.log("__ContentClosure.applyRefresh dev-log - clean up treeNode (no true pass): ", treeNode);
    //         // Dom node.
    //         if (treeNode.type === "dom")
    //             renderInfos.push({treeNode, remove: true });
    //         // Boundary.
    //         else if (treeNode.boundary) {
    //             const [ rInfos, bUpdates ] = destroyBoundary(treeNode.boundary);
    //             renderInfos = renderInfos.concat(rInfos);
    //             boundaryChanges = boundaryChanges.concat(bUpdates);
    //         }
    //         // Remove.
    //         treeNode.parent = null;
    //         treeNode.sourceBoundary = null;
    //         delete def.treeNode;
    //     }
    // }
    // //
    // // <-- While this here works (and does get triggered correctly), don't think it's actually needed.
    // // ... This is because - for true pass - the situation captured here is essentially the same as having no grounding defs.
    // // ... So, they'll get cleaned up anyway.


    // All had been updated already.
    return [renderInfos, boundaryChanges];
}

/** This is the method that makes stuff inside content closures concrete.
 * - For true ContentPass (see copies below), the situation is very distinguished:
 *   1. Because we are in a closure, our target defs have already been mapped to applied defs and new defs created when needed.
 *   2. However, the treeNode part of the process was not handled for us. So we must do it now.
 *   3. After having updated treeNodes and got our organized toApplyPairs, we can just feed them to applyDefPairs to get renderInfos and boundaryUpdates.
 * - Behaviour on MixDOM.ContentCopy (and multi MixDOM.ContentPass).
 *   1. The situation is very different from ContentPass, because we don't have a set of pre-mangled applied defs.
 *   2. Instead we do actually do a very similar process to runBoundaryUpdate, but without boundary and without rendering.
 *   3. For future updates, we can reuse the appliedDef for each copy - the copies can also be keyed.
 */
export function applyContentDefs(closure: ContentClosure, groundedDefKeys: Iterable<MixDOMDefApplied>, forceUpdate: boolean = false): MixDOMChangeInfos {

    // Collect rendering infos basis once.
    // .. They are the same for all copies, except that the appliedDef is different for each.
    if (!groundedDefKeys)
        groundedDefKeys = closure.groundedDefs.keys();

    // Loop each given groundedDef.
    let renderInfos: MixDOMRenderInfo[] = [];
    let boundaryChanges: MixDOMSourceBoundaryChange[] = [];
    for (const groundingDef of groundedDefKeys) {
        // Mark as non-pending in any case.
        closure.pendingDefs.delete(groundingDef);
        // Get.
        const info = closure.groundedDefs.get(groundingDef);
        if (info === undefined)
            continue;
        let [gBoundary, treeNode, copyKey] = info;
        let contentBoundary = treeNode.boundary as ContentBoundary | null;
        // Remove.
        if (!closure.envelope || !closure.sourceBoundary) {
            // Destroy.
            if (contentBoundary) {

                // Note that we must call destroyBoundary with nullifyDefs=false (for true pass at least).
                // .. The reason is that otherwise we might be messing up with treeNodes that maybe were reused in original render scope.
                // .... It was verified earlier that there was a recursively adding bug because of nullifying defs.
                // .. Note that alternatively we can just do: contentBoundary._innerDef.childDefs = []. This will essentially make nullifyDefs not run on the boundary.
                // .... However, doing this sounds a bit wrong in case there are nested passes inside - because we should not nullify their defs either.

                // Destroy and collect render infos - do not nullify defs (see above why).
                const infos = destroyBoundary(contentBoundary, false);
                renderInfos = renderInfos.concat(infos[0]);
                boundaryChanges = boundaryChanges.concat(infos[1]);

                // We are the ones doing bookkeeping for the treeNode.boundary when it's a content boundary.
                treeNode.boundary = null;
            }
        }
        // Create / update.
        else {
            let isTruePass = true;
            const envelope = closure.envelope;
            // Create.
            if (!contentBoundary) {
                // Create a new content boundary.
                contentBoundary = new ContentBoundary(groundingDef, envelope.target, treeNode, closure.sourceBoundary);
                // Create basis for content copy - forces copy if already has a grounded def for truePass.
                // .. Each copy grounding starts from an empty applied def, so we don't need to do anything else.
                // .. For true pass we assign the childDefs directly to the innerDef's childDefs - the innerDef is a fragment.
                isTruePass = copyKey == null && (!closure.truePassDef || closure.truePassDef === groundingDef);
                if (isTruePass) {
                    contentBoundary._innerDef.childDefs = envelope.applied.childDefs;
                    closure.truePassDef = groundingDef;
                }
                // Assign common stuff.
                contentBoundary.parentBoundary = gBoundary;
                treeNode.boundary = contentBoundary;
            }
            // Update existing content boundary.
            else {
                isTruePass = closure.truePassDef === groundingDef;
                contentBoundary.updateEnvelope(envelope.target, isTruePass ? envelope.applied : null);
            }
            // Apply defs to pass/copy.
            const [rInfos, bChanges] = isTruePass ?
                runPassUpdate(contentBoundary, forceUpdate) :
                runBoundaryUpdate(contentBoundary, forceUpdate);
            // Collect infos.
            renderInfos = renderInfos.concat(rInfos);
            boundaryChanges = boundaryChanges.concat(bChanges);
        }

    }
    // Return infos.
    return [renderInfos, boundaryChanges];

}
