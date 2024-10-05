
// - Imports - //

// Libraries.
import { askListeners, callListeners } from "data-signals";
import { applyDOMProps, createDOMElement, readDOMProps, DOMTags, readDOMString } from "dom-types";
// Typing.
import {
    MixDOMTreeNode,
    MixDOMTreeNodeDOM,
    MixDOMTreeNodeType,
    MixDOMContentValue,
    MixDOMRenderInfo,
    MixDOMDefType,
    MixDOMAssimilateItem,
    MixDOMAssimilateValidator,
    MixDOMAssimilateSuggester,
    MixDOMRemountInfo,
    MixDOMReassimilateInfo,
} from "../typing";
// Routines.
import { rootDOMTreeNodes } from "../static/index";
// Common.
import { Ref } from "../common/index";
// Only typing (local).
import { HostSettings } from "./Host";


// - Types - //

// Settings.
export type HostRenderSettings = Pick<HostSettings,
    | "renderTextHandler"
    | "renderTextTag"
    | "renderHTMLDefTag"
    | "renderSVGNamespaceURI"
    | "renderDOMPropsOnSwap"
    | "noRenderValuesMode"
    | "disableRendering"
    | "duplicateDOMNodeHandler"
    | "duplicateDOMNodeBehaviour"
    | "devLogWarnings"
>;


// - Class - //

// This is exported as a class, so that can hold some members (like externalElements and settings).
export class HostRender {


    // - Static members - //

    /** These implies which type of tree nodes allow to "pass" the DOM element reference through them - ie. they are not strictly DOM related tree nodes. */
    static PASSING_TYPES: Partial<Record<MixDOMTreeNodeType | MixDOMDefType, true>> = { boundary: true, pass: true, host: true, fragment: true }; // Let's add fragment here for def side.


    // - Instanced members - //

    /** Detect if is running in browser or not. */
    public inBrowser: boolean;
    /** Root for pausing. */
    public assimilationRoot: MixDOMTreeNode | null;
    /** Pausing. When resumes, reassimilates. */
    public paused: boolean;
    /** When paused, if has any infos about removing elements, we store them - so that we can call unmount (otherwise the treeNode ref is lost). */
    public pausedPending?: MixDOMRenderInfo[];
    /** Collection of settings. */
    public settings: HostRenderSettings;
    /** To keep track of featured external dom elements. */
    public externalElements: Set<Node>;
    /** Temporary information for remount feature - can be set externally. When applyDOM is called, the feature is triggered to pre-modify the groundedTree. */
    public sourceRemount?: MixDOMRemountInfo;

    constructor(settings: HostRenderSettings, assimilationRoot?: MixDOMTreeNode) {
        this.assimilationRoot = assimilationRoot || null;
        this.paused = settings.disableRendering;
        this.settings = settings;
        this.externalElements = new Set();
        this.inBrowser = typeof document === "object";
    }


    // - Pause & resume - //

    /** Pause the renderer from receiving updates. */
    public pause(): void {
        this.paused = true;
    }

    /** Resume the renderer after pausing. Will reassimilate dom elements and reapply changes to them. 
     * Note that calling resume will unpause rendering even when settings.disableRendering is set to true. */
    public resume(): void {
        // Was not paused.
        if (!this.paused)
            return;
        // Resume - even if settings say disableRendering.
        this.paused = false;
        if (this.assimilationRoot)
            this.reassimilate(null, true);
    }


    // - Ressimilate DOM structure - //

    /** Reassimilates actual (unknown) dom elements into existing state of the Host (= its treeNode/def structure from the root down) without remounting.
     * - The method supports reusing custom DOM elements from within the given "container" element - it should be the _containing_ element. You should most often use the element that _contains_ the host.
     * - The method also resumes rendering if was paused - unless is disableRendering is set to true in Host's settings.
     * @param container Optionally define the container for assimilation. If none given, won't use most of the features in the other arguments.
     * @param readFromDOM Re-reads the current dom props from the existing ones as well. Defaults to false.
     * @param smuggleMode Allows to replace existing elements with better ones from the container (instead of reusing what components have) - otherwise only tries to fill missing ones. Defaults to false.
     * @param removeUnused Destroy the other unused elements found in the container. Defaults to false. Note. This can be a bit dangerous.
     * @param validator Can veto any DOM element from being used. Return true to accept, false to not accept.
     * @param suggester Can be used to suggest better DOM elements in a custom fashion. Should return a DOM Node, MixDOMAssimilateItem or null.
     */
    public reassimilate(container: Node | null = null, readFromDOM: boolean = false, smuggleMode: boolean = false, removeUnused: boolean = false, validator?: MixDOMAssimilateValidator | null, suggester?: MixDOMAssimilateSuggester | null): void {


        // Idea.
        // 0. Validate: Check prerequisites.
        // 1. Pre-map: Build a MixDOMAssimilateItem map from the container node, if given.
        // 2. Pre-apply: Loop over the treeNode structure (only targeting "dom" treeNode types), and
        //    * Fill any missing elements (and assign parent-children relations), creating new if has to. In smuggleMode try better alternatives for existing, too.
        //    * For any replaced elements, reapply the dom props (by reading, diffing changes and applying).
        //      .. If in readFromDOM, reapply them for existing ones, too (presumably after having being paused).
        //    * While we loop down, we iterate down the MixDOMAssimilateItem map by any matching hits.
        // 3. Destroy: Remove unused elements.
        // 4. Apply: Resume rendering and apply the info from part 2 into DOM.


        // - 0. Validate - //

        // Must have a assimilation root.
        const rootTreeNode = this.assimilationRoot;
        if (!rootTreeNode) {
            if (this.settings.devLogWarnings)
                console.warn("__HostRender.reassimilate: Warning: No assimilation root assigned. ", this);
            return;
        }


        // - 1. Pre build info by the container element - //

        // Create virtual mapping.
        const vInfo: MixDOMReassimilateInfo = container ? HostRender.createVirtualItemsFor(container) : {};

        // Add callbacks.
        vInfo.validator = validator;
        vInfo.suggester = suggester;

        // Prepare excluded.
        // .. Note. This excluded protection is sketchy. Could maybe use getApprovedNodeShould, and maybe protect from other hosts, too.
        // .. On the other hand, there's not much point about extensive protection against misuse. So...
        const excludedNodes = vInfo.reused = new Set(container ? [...this.externalElements, container] : this.externalElements);


        // - 2. Loop over the treeNode structure and get reassimilated info - //

        // Prepare looping.
        const toApply: MixDOMRenderInfo[] = [];
        for (const [treeNode, , newDomNode] of HostRender.getVirtualDomPairs(rootTreeNode, vInfo, false)) {
            // Fetch a suitable virtual item or dom node.
            let domNode = treeNode.domNode;
            // Update local reference.
            if (newDomNode && (!treeNode.domNode || smuggleMode))
                domNode = newDomNode;
            // Add to reused - for exclusion.
            if (domNode)
                excludedNodes.add(domNode);
            // Gather render infos.
            // .. Note that we're dealing with a "dom" type of treeNode, so the .domNode ref actually belongs to the treeNode.
            const renderInfo: MixDOMRenderInfo = { treeNode };
            let reapply = readFromDOM;
            // Create / Swap.
            if (domNode !== treeNode.domNode) {
                reapply = true;
                // Didn't have - create.
                if (!treeNode.domNode)
                    renderInfo.create = true;
                // Had already and has a new one - swap them.
                // .. We'll also check if should move. If so, it will be done first (with the old element) and then simply their kids are swapped.
                else if (domNode)
                    renderInfo.swap = domNode;
                // Otherwise had before but now doesn't - should perhaps remove.
                // .. However that shouldn't really happen here logically speaking (in small nor big scale).
            }
            // The node is the same (or will be swapped), add updates as for existing.
            if (!renderInfo.create && domNode) {
                // Move. Should move if the parent is not the same or nextSibling not same.
                const [ parent, nextSibling ] = HostRender.findInsertionNodes(treeNode);
                if (domNode.parentNode !== parent || domNode.nextSibling !== nextSibling)
                    renderInfo.move = true;
                // Update content for a simple node like TextNode.
                if (treeNode.def.MIX_DOM_DEF === "content")
                    renderInfo.content = true;
                // Update props.
                else {
                    // Read from dom.
                    if (reapply)
                        treeNode.domProps = readDOMProps(domNode);
                    // Add info.
                    renderInfo.update = true;
                }
            }
            // Should render.
            if (renderInfo.create || renderInfo.swap || renderInfo.move || renderInfo.update || renderInfo.content)
                toApply.push(renderInfo);
        }


        // - 3. Destroy unused (optional) - //

        // Destroy other nodes (directly).
        // .. Must be done before applying to dom, so that we won't have to pre-protect the newly created ones.
        if (removeUnused && container) {
            // If the container is the container of the host, then we shall destroy only within.
            let loopDom: Node[] = container === rootTreeNode.domNode ?
                rootDOMTreeNodes(rootTreeNode.children[0], true).map(tNode => tNode.domNode).filter(n => n) as Node[]
                : [...container.childNodes];
            // Loop all nodes recursively.
            let thisDomNode: Node | undefined;
            let i = 0;
            while (thisDomNode = loopDom[i]) {
                // Counter.
                i++;
                // Not found, so destroy.
                if (!excludedNodes.has(thisDomNode))
                    thisDomNode.parentNode?.removeChild(thisDomNode);
                // Otherwise add children to loop.
                else if (thisDomNode.childNodes[0]) {
                    loopDom = [...thisDomNode.childNodes, ...loopDom.slice(i)];
                    i = 0;
                }
            }
        }


        // - 4. Resume and apply - //

        // Mark that is no longer paused.
        if (!this.settings.disableRendering)
            this.paused = false;
        
        // Apply to dom.
        if (toApply[0])
            this.applyToDOM(toApply);
        
        // Flush any pending destructions.
        if (this.pausedPending) {
            const toRemove = this.pausedPending.filter(info => info.treeNode.domNode && !excludedNodes.has(info.treeNode.domNode));
            delete this.pausedPending;
            if (toRemove[0])
                this.applyToDOM(toRemove);
        }
    }


    // - Main method to apply changes - //

    /** The main method to apply renderInfos. Everything else in here serves this. 
     * - Note that all the infos in a single renderInfos array should be in tree order. (Happens automatically by the update order.)
     * - Except emptyMove's should be prepended to the start, and destructions appended to the end (<- happens automatically due to clean up being after).
     */
    public applyToDOM(renderInfos: MixDOMRenderInfo[]): void {

        // Remount feature.
        const rSource = this.sourceRemount;
        if (rSource && this.assimilationRoot)
            HostRender.onRemount(rSource, this.assimilationRoot);


        // - DEV-LOG - //
        //
        // This tiny log is super useful when debugging (especially with preCompareDOMProps = true). Also consider uncommenting DEV-LOG in __routinesApply.cleanUpDefs.
        // console.log("__HostRender.applyToDOM: Dev-log: Received rendering infos" + (this.paused ? " (while paused)" : "") + ": ", renderInfos.map(info => ({ ...info, treeNode: info.create ? info.treeNode : { ...info.treeNode, def: { ...info.treeNode.def } }})));


        // In disabled mode - just update bookkeeping.
        if (this.paused) {
            // Collect removals, otherwise the treeNode would be lost (structurally speaking), and we wouldn't ever call unmounting callbacks.
            const removals = renderInfos.filter(info => info.remove);
            if  (removals[0])
                this.pausedPending = (this.pausedPending || []).concat(removals);
            // Stop.
            return;
        }

        // Prepare.
        const settings = this.settings;
        /** Moving is done in reverse order, so we collect the movers here. */
        let toMove: Array<MixDOMRenderInfo> | null = null;
        /** This is used to skip unnecessary dom removals, in the case that the a parent in direct parent chain was just removed. */
        let newlyKilled: Array<Node> | null = null;
        /** For salvaging dom nodes. */
        let salvaged: Array<Node> | null = null;

        type ToCallInfo = [isMountCall: boolean, treeNode: MixDOMRenderInfo["treeNode"], domParent: Node | null, domSibling: Node | null];
        let toCallMove: ToCallInfo[] | null = null;

        // Loop each renderInfo.
        for (const renderInfo of renderInfos) {

            // Prepare common.
            const treeNode = renderInfo.treeNode;
            const signals = treeNode.def.attachedSignals;
            const attachedRefs = treeNode.def.attachedRefs;

            // Remove.
            if (renderInfo.remove) {
                // Normal case - refers to a dom tag.
                if (treeNode.type === "dom" && treeNode.domNode) {
                    // Prepare.
                    const domNode = treeNode.domNode;
                    const parentNode = domNode.parentNode;
                    // Handle ref.
                    let doSalvage: boolean | void | undefined = false;
                    // Remove forwarded ref.
                    if (signals?.domWillUnmount && signals.domWillUnmount(domNode))
                        doSalvage = true;
                    if (attachedRefs) {
                        for (const attachedRef of attachedRefs) {
                            if (attachedRef.signals.domWillUnmount && askListeners(attachedRef.signals.domWillUnmount, [domNode], ["no-false", "last"]))
                                doSalvage = true;
                            Ref.willDetachFrom(attachedRef, treeNode);
                        }
                    }
                    // Salvage.
                    if (doSalvage)
                        salvaged ? salvaged.push(domNode) : salvaged = [ domNode ];
                    // Remove from dom.
                    else if (parentNode && (!newlyKilled || newlyKilled.indexOf(parentNode) === -1) && (!salvaged || !salvaged.some(node => node.contains(domNode))))
                        parentNode.removeChild(domNode);
                    // Bookkeeping.
                    const isElement = treeNode.def.MIX_DOM_DEF === "element";
                    if (isElement || treeNode.def.MIX_DOM_DEF === "content")
                        this.externalElements.delete(domNode);
                    // .. Don't mark to newlyKilled if was "element" type. We want its contents to actually be removed.
                    if (!isElement)
                        (newlyKilled || (newlyKilled = [])).push(domNode);
                    treeNode.domNode = null;
                    HostRender.updateDOMChainBy(treeNode, null);
                }
                // We know there's nothing else.
                continue;
            }

            // Prepare.
            let doUpdate = false;
            /** 0: Not created.
             * 1: Created. 
             * 2: Created by smuggling. 
             * 3: Created by smuggling, and needs to re-apply text content if text node.
             */
            let didCreate: 0 | 1 | 2 | 3 = 0;

            // Refresh.
            if (renderInfo.refresh && treeNode.domNode && treeNode["domProps"]) {
                (treeNode as MixDOMTreeNodeDOM).domProps = renderInfo.refresh === "read" ? readDOMProps(treeNode.domNode) : {};
                doUpdate = true;
            }

            // Create.
            if (renderInfo.create) {
                // Already smuggled.
                if (treeNode.domNode)
                    didCreate = rSource && treeNode.domNode.nodeType === Node.TEXT_NODE && (rSource.readFromDOM === true || rSource.readFromDOM === "content") ? 3 : 2;
                // Handle.
                else {
                    switch(treeNode.type) {
                        // Normal case - refers to a dom tag.
                        case "dom":
                            // Create.
                            const domNode = this.createDOMNodeBy(treeNode);
                            if (domNode) {
                                // Update ref.
                                treeNode.domNode = domNode;
                                // Add to smart bookkeeping.
                                didCreate = 1;
                                // Add more infos.
                                rSource && rSource.created && rSource.created.add(domNode);
                            }
                            break;
                        // Portal - just define the domNode ref.
                        case "portal":
                            treeNode.domNode = treeNode.def.domPortal || null;
                            break;
                    }
                }
            }

            // Move (or finish create).
            if (didCreate || renderInfo.move) {
                // Host.
                if (treeNode.type === "host") {
                    // Call the host's refresh softly to trigger moving.
                    const host = treeNode.def.host || null;
                    if (host)
                        host.services.refreshRoot(false, null, null);
                    // Update bookkeeping.
                    treeNode.domNode = treeNode.parent && host && host.getRootElement() || null;
                    HostRender.updateDOMChainBy(treeNode, treeNode.domNode);
                }
                // Normal element.
                else if (treeNode.domNode) {
                    // Mark to be moved (done in reverse order below).
                    // .. Note that the actual moving / inserting process is done afterwards (below) - including calling updateDOMChainBy.
                    // .. Note that by design: if moved always mark to be moved, if created but already has a parentElement, then no need to move.
                    if (didCreate < 2 || !treeNode.domNode.parentElement)
                        (toMove || (toMove = [])).push(renderInfo);
                    // Otherwise. (Only used upon "remount" flow.)
                    else {
                        /// Add to mount calls.
                        if (treeNode.def.attachedRefs || treeNode.def.attachedSignals)
                            (toCallMove || (toCallMove = [])).push([true, renderInfo.treeNode, treeNode.domNode.parentElement, treeNode.domNode.nextSibling ]);
                        // Update DOM chain now.
                        HostRender.updateDOMChainBy(treeNode, treeNode.domNode);
                    }
                }
            }

            // Swap elements (for PseudoPortal, PseudoElement and assimilation).
            if (renderInfo.swap) {
                // Parse.
                const isCustom = renderInfo.swap !== true; // If not true, it's a Node to swap to.
                const oldEl = treeNode.domNode;
                let newEl: Node | null = isCustom ? renderInfo.swap as Node : (treeNode.type === "portal" ? treeNode.def.domPortal : treeNode.def.domElement) || null;
                // If had changed.
                if (oldEl !== newEl) {

                    // For PseudoPortal and assimilation (= isCustom), we just need to swap the children.
                    // .. So nothing to do at this point.

                    // For PseudoElement, the swapping is more thorough.
                    if (!isCustom && treeNode.type === "dom") {
                        const tNode = treeNode as MixDOMTreeNodeDOM;
                        const oldParent = oldEl && oldEl.parentNode;
                        if (newEl) {
                            newEl = this.getApprovedNode(newEl, tNode);
                            // Add.
                            if (newEl) {
                                let [parent, sibling] = oldParent ? [ oldParent, oldEl ] : HostRender.findInsertionNodes(treeNode);
                                if (parent)
                                    parent.insertBefore(newEl, sibling);
                            }
                        }
                        // Remove.
                        if (oldEl) {
                            // Remove from bookkeeping.
                            this.externalElements.delete(oldEl);
                            // Remove event listeners.
                            if (tNode.domProps?.listeners && oldEl instanceof Element) {
                                const listeners = tNode.domProps.listeners;
                                for (const prop in listeners)
                                    listeners[prop] && oldEl.removeEventListener(prop, listeners[prop]!);
                            }
                            // Remove from dom.
                            if (oldParent)
                                oldParent.removeChild(oldEl);
                        }
                        // Reapply.
                        if (tNode.domProps) {
                            tNode.domProps = newEl && (settings.renderDOMPropsOnSwap === "read") ? readDOMProps(newEl) : {};
                            doUpdate = true;
                        }
                    }

                    // Swap the kids.
                    for (const tNode of treeNode.children) {
                        const node = tNode.domNode;
                        if (node) {
                            if (node.parentNode)
                                node.parentNode.removeChild(node);
                            if (newEl)
                                newEl.appendChild(node);
                        }
                    }
                    // Update dom chain.
                    treeNode.domNode = newEl;
                    HostRender.updateDOMChainBy(treeNode, newEl);
                }
            }

            // Content.
            if (renderInfo.content || didCreate === 3) {
                if (treeNode.type === "dom" && treeNode.domNode) {
                    // Prepare.
                    const content = treeNode.def.domContent;
                    const nodeWas = treeNode.domNode;
                    let newNode : Node | null = nodeWas; // If null, then will be ignored and old one used. Shouldn't really happen unless .inBrowser is switched abruptly (which should be never).
                    // Text type content.
                    if (treeNode.def.MIX_DOM_DEF === "content") {
                        // Set innerHTML - if amounts to nothing, use an empty text node instead.
                        const htmlMode = treeNode.def.domHTMLMode;
                        if (htmlMode && content != null && content !== "") {
                            // Create a dom node.
                            newNode = HostRender.domNodeFrom(content.toString(), (treeNode.def.tag as DOMTags) || settings.renderHTMLDefTag, true);
                            // Clear the previously applied props (if any), and mark for re-update.
                            if (newNode && treeNode.domProps) {
                                doUpdate = true;
                                treeNode.domProps = {};
                            }
                        }
                        // Set / clear text content.
                        else {
                            // Get text.
                            const newText = content == null ? "" : (settings.renderTextHandler ? settings.renderTextHandler(content as MixDOMContentValue) : content).toString();
                            // If wasn't a Text node.
                            if (nodeWas.nodeType !== Node.TEXT_NODE && this.inBrowser)
                                newNode = document.createTextNode(newText);
                            // Modify Text node content.
                            else
                                nodeWas.textContent = newText;
                        }
                    }
                    // Replace with node.
                    else {
                        if (content instanceof Node) {
                            // Remove from where was.
                            const cParent = content.parentNode;
                            if (cParent)
                                cParent.removeChild(content);
                        }
                        else
                            nodeWas.textContent = "";
                    }
                    // Did change node.
                    if (newNode && nodeWas !== newNode) {
                        // Remove old and insert new.
                        const parent = nodeWas.parentNode;
                        if (parent) {
                            treeNode.domNode = newNode;
                            parent.insertBefore(newNode, nodeWas);
                            parent.removeChild(nodeWas);
                        }
                        // Update chain.
                        HostRender.updateDOMChainBy(treeNode, treeNode.domNode);
                    }
                    // Call.
                    if (signals?.domDidContent)
                        signals.domDidContent(treeNode.domNode, content != null ? content : null);
                    if (attachedRefs) {
                        for (const attachedRef of attachedRefs) {
                            if (attachedRef.signals.domDidContent)
                                callListeners(attachedRef.signals.domDidContent, [treeNode.domNode, content != null ? content : null]);
                        }
                    }
                }
            }

            // Update.
            if (didCreate || doUpdate || renderInfo.update) {
                // For dom nodes.
                if (treeNode.type === "dom") {
                    // Parse.
                    const domElement = treeNode.domNode instanceof Element ? treeNode.domNode : null;
                    const newProps = treeNode.def.props || {};
                    // Apply and assign new.
                    const diffs = applyDOMProps(treeNode.domNode instanceof Element ? treeNode.domNode : null, newProps, treeNode.domProps || {}, settings.devLogWarnings);
                    treeNode.domProps = newProps;
                    // Call update.
                    if (diffs && renderInfo.update) {
                        if (domElement) {
                            if (signals?.domDidUpdate)
                                signals.domDidUpdate(domElement, diffs);
                            if (attachedRefs) {
                                for (const attachedRef of attachedRefs) {
                                    if (attachedRef.signals.domDidUpdate)
                                        callListeners(attachedRef.signals.domDidUpdate, [domElement, diffs]);
                                }
                            }
                        }
                    }
                }
            }

            // This is only a technical update for bookkeeping.
            // .. It's needed whenever a first child was moved out of a parent.
            // .. They are typically pre-pended to the render infos.
            if (renderInfo.emptyMove)
                HostRender.updateDOMChainBy(treeNode, null, true);

        }

        // Handle moving and insertions.
        // - We must do it after the above processes.
        //      * It's also better performant-wise, as we do the modifications before attaching the dom nodes to the actual dom tree.
        // - The process in here is:
        //      1. First check things in reverse order and pre-remove.
        //          * Reverse order is needed for cases where siblings move together, and pre-removing for parent <-> child -like moves.
        //          * Our updateDOMChainBy calls are however more wasteful when done in reverse order (each will flow up on creation).
        //      2. Then insert in reverse order.
        //          * Needed to be done after step 1. above for parent <-> child -like moves.
        //          * Going in reverse order should be more performant (or same) for nested cases: as we do many inserts in a detached branch and then insert the branch.
        //      3. And call listeners (for domDidMount or domDidMove) in tree order.
        //          * It seems more useful and natural in tree order.
        // 
        if (toMove) {

            // Prepare.
            type ToInsertInfo = [domNode: Node, domParent: Node, domSibling: Node | null];
            const toInsert: ToInsertInfo[] = [];
            let iMove = toMove.length;
            // Loop each in reverse order and check if needs to be moved, and update dom chain.
            while (iMove--) {
                // Prepare.
                const rInfo = toMove[iMove];
                const thisTreeNode = rInfo.treeNode;
                const domNode = thisTreeNode.domNode;
                // Should always have a domNode here. But if there'd be none, there's nothing to do.
                if (domNode) {
                    // Get info.
                    const domParentWas = domNode.parentNode;
                    const domSiblingWas = domNode.nextSibling;
                    const [ domParent, domSibling ] = domNode ? HostRender.findInsertionNodes(thisTreeNode) : [ null, null ];
                    // If should actually be moved / inserted.
                    if (domParent !== domParentWas || domSibling !== domSiblingWas) {
                        // Add to the ones to be inserted. Should always have a parent here (at least non-roots).
                        if (domParent)
                            toInsert.push([domNode, domParent, domSibling]);
                        // Add to call bookkeeping. It's rarer, so we init the array only if needed.
                        if (thisTreeNode.def.attachedRefs || thisTreeNode.def.attachedSignals)
                            (toCallMove || (toCallMove = [])).push([!rInfo.move, rInfo.treeNode, domParentWas, domSiblingWas ]);
                        // Pre-remove movers from dom - but do not insert yet.
                        // .. This is needed to be done for all beforehands, so that can do parent-child swapping.
                        if (domParentWas)
                            domParentWas.removeChild(domNode);

                        // // For external bookkeeping.
                        // rSource && rSource.moved.add(domNode);

                    }
                    // 
                    // Dev. notes on the check above:
                    // .. Note that due to the reverse order next sibling checks work for us here.
                    // .. And for the parent it works, too, because if parent would be the same, it must have been the same parent treeNode as well.
                    // .... And if was combined with "swap" on the parent, it's already done beforehands and updated.
                }
                // Update bookkeeping in any case.
                HostRender.updateDOMChainBy(thisTreeNode, domNode);
            }

            // If needs to insert into dom.
            // .. Note that because the above loop was in reverse order, we'll loop toInsert in its natural order (to keep the reverse flow).
            if (toInsert[0])
                for (const myInfo of toInsert)
                    myInfo[1].insertBefore(myInfo[0], myInfo[2]);
        }

        // Call run - we must do it afterwards. (Otherwise might call domDidMount before parent is inserted into dom tree.)
        if (toCallMove) {
            // Loop in tree order - so it's the reverse of toCallMove as it was collected in reverse order.
            let iCall = toCallMove.length;
            while (iCall--) {
                // Prepare call.
                const [isMount, thisTreeNode, domParentWas, domSiblingWas] = toCallMove[iCall];
                const { attachedSignals, attachedRefs } = thisTreeNode.def;
                const domNode = thisTreeNode.domNode as Node;
                // Call for dom signals.
                if (attachedSignals) {
                    if (isMount) {
                        if (attachedSignals.domDidMount)
                            attachedSignals.domDidMount(domNode);
                    }
                    else if (attachedSignals.domDidMove)
                        attachedSignals.domDidMove(domNode, domParentWas, domSiblingWas);
                }
                // Call each ref.
                if (attachedRefs) {
                    for (const attachedRef of attachedRefs) {
                        if (isMount) {
                            Ref.didAttachOn(attachedRef, thisTreeNode);
                            if (attachedRef.signals.domDidMount)
                                callListeners(attachedRef.signals.domDidMount, [domNode]);
                        }
                        else {
                            if (attachedRef.signals.domDidMove)
                                callListeners(attachedRef.signals.domDidMove, [domNode, domParentWas, domSiblingWas]);
                        }
                    }
                }
            }
        }

    }


    // - Private services - //

    /** Get a dom node with approval related to cloning dom nodes. Uses instanced settings.duplicateDOMNodeHandler and externalElements bookkeeping. */
    private getApprovedNode(newEl: Node, treeNode: MixDOMTreeNodeDOM): Node | null {
        let el : Node | null = newEl;
        const behaviour = treeNode.def.domCloneMode != null ? treeNode.def.domCloneMode : this.settings.duplicateDOMNodeBehaviour;
        if (behaviour === "always" || this.externalElements.has(newEl)) {
            if (this.settings.duplicateDOMNodeHandler)
                el = this.settings.duplicateDOMNodeHandler(newEl, treeNode);
            else {
                el = behaviour ? newEl.cloneNode(behaviour === "deep" || behaviour === "always") : null;
            }
        }
        if (el)
            this.externalElements.add(el);
        return el;
    }

    /** Core handler to create a single dom node based on a treeNode info. */
    private createDOMNodeBy(treeNode: MixDOMTreeNodeDOM): Node | null {

        
        // - Instanced part - //

        // Invalid.
        const origTag = treeNode.def.tag;
        if (typeof origTag !== "string")
            return null;
        // Pseudo.
        if (origTag === "_")
            return treeNode.def.domElement && this.getApprovedNode(treeNode.def.domElement, treeNode) || null;
        // Direct element pass.
        const simpleContent = treeNode.def.domContent;
        if (simpleContent instanceof Node) {
            // Handle multiple passes.
            // .. Note that they are not keyed. So will "remove" and "create" (<- insert) them.
            return this.getApprovedNode(simpleContent, treeNode);
        }
        // Get settings.
        const settings = this.settings;


        // - Static part - //

        // HTML string.
        const htmlMode = treeNode.def.domHTMLMode;
        if (htmlMode && simpleContent != null && simpleContent !== "")
            return HostRender.domNodeFrom(simpleContent.toString(), (origTag as DOMTags) || settings.renderHTMLDefTag, true);
        // HTML or SVG element.
        if (origTag)
            return !this.inBrowser ? null : createDOMElement(origTag, treeNode.parent?.domNode, settings.renderSVGNamespaceURI);

        // Tagless.
        // .. Note, that because there's always a def and treeNode for the simple content itself (with tag ""),
        // .. the only case where we insert text is for such treeNodes nodes. So the above cases can just return before this.

        // Text node.
        let domNode: Node | null = null;
        let tag = "";
        let text = "";
        // Get by setting.
        if (simpleContent != null) {
            // Get text by callback or stringify directly.
            text = (settings.renderTextHandler ? settings.renderTextHandler(simpleContent) : simpleContent).toString();
            // Get custom tag / node.
            const renderTextTag = settings.renderTextTag;
            if (renderTextTag) {
                // If is function.
                if (typeof renderTextTag === "string")
                    tag = renderTextTag;
                else if (typeof renderTextTag === "function") {
                    // Get by callback.
                    const output = renderTextTag(simpleContent);
                    // Use directly.
                    if (output instanceof Node)
                        domNode = output;
                }
            }
        }
        // Create new domNode.
        // .. Note, that we're creating it as HTML at this point of the flow. The common case was handled above with createDOMElement.
        if (!domNode) {
            // Cannot.
            if (!this.inBrowser)
                return null;
            // Create by document.
            domNode = tag ? document.createElement(tag) : document.createTextNode(text);
        }
        // Add text.
        if (tag && text)
            domNode.textContent = text;
        // Return.
        return domNode;
    }


    // - Static helpers - //

    /** Using the bookkeeping logic, find the parent node and next sibling as html insertion targets.
     * 
     * ```
     * 
     * // Situation example:
     * //
     * //  <div>                               // domNode: <div/>
     * //      <Something>                     // domNode: <span/> #1
     * //          <Onething>                  // domNode: <span/> #1
     * //              <span>Stuff 1</span>    // domNode: <span/> #1
     * //          </Onething>                 //
     * //          <Onething>                  // domNode: <span/> #2
     * //              <span>Stuff 2</span>    // domNode: <span/> #2
     * //              <span>Stuff 3</span>    // domNode: <span/> #3
     * //          </Onething>                 //
     * //          <Onething>                  // domNode: <span/> #4
     * //              <span>Stuff 4</span>    // domNode: <span/> #4
     * //          </Onething>                 //
     * //      </Something>                    //
     * //      <Something>                     // domNode: <span/> #5
     * //          <Onething>                  // domNode: <span/> #5
     * //              <span>Stuff 5</span>    // domNode: <span/> #5
     * //              <span>Stuff 6</span>    // domNode: <span/> #6
     * //          </Onething>                 //
     * //          <Onething>                  // domNode: <span/> #7
     * //              <span>Stuff 7</span>    // domNode: <span/> #7
     * //          </Onething>                 //
     * //      </Something>                    //
     * //  </div>                              //
     * //
     * //
     * // LOGIC FOR INSERTION (moving and creation):
     * // 1. First find the domParent by simply going up until hits a treeNode with a dom tag.
     * //    * If none found, stop. We cannot insert the element. (Should never happen - except for swappable elements, when it's intended to "remove" them.)
     * //    * If the domParent was found in the newlyCreated smart bookkeeping, skip step 2 below (there are no next siblings yet).
     * //       - Actually newlyCreated info is no longer used.
     * // 2. Then find the next domSibling reference element.
     * //    * Go up and check your index.
     * //    * Loop your next siblings and see if any has .domNode. If has, stop, we've found it.
     * //    * If doesn't find any (or no next siblings), repeat the loop (go one up and check index). Until hits the domParent.
     * // 3. Insert the domElement into the domParent using the domSibling reference if found (otherwise null -> becomes the last one).
     * //
     * //
     * // CASE EXAMPLE FOR FINDING NEXT SIBLING - for <span/> #2 above:
     * // 1. We first go up to <Onething/> and see if we have next siblings.
     * //    * If <span /3> has .domNode, we are already finished.
     * // 2. There are no more siblings after it, so we go up to <Something/> and do the same.
     * //    * If the third <Onething/> has a .domNode, we are finished.
     * // 3. Otherwise we go up to <div> and look for siblings.
     * //    * If the second <Something/> has a .domNode, we are finished.
     * // 4. Otherwise we are finished as well, but without a .domNode. We will be inserted as the last child.
     * //
     * //
     * // BOOKKEEPING (see updateDOMChainBy() below):
     * // - The bookkeeping is done by whenever an element is moved / created:
     * //   * Goes to update domNode up the chain until is not the first child of parent or hits a dom tag.
     * //   * Actually, it's a tiny bit more complicated: even if we are, say, the 2nd child,
     * //     but 1st child has no domNode (eg. boundary rendered null), then we should still also update the chain.
     * // - In the case of removing, the procedure is a bit more complex:
     * //   * Goes up level by level until not the first child anymore or hits a dom tag.
     * //     - On each tries to find a next sibling, unless already did find earlier.
     * //     - Then applies that node to the current (boundary) treeNode.
     * // - So if <span/> #2 is inserted above, after creating the element (and before inserting it),
     * //   will go one up to update <Onething/>, but then is not anymore the first child (of <Something>), so stops.
     * 
     * ```
     * 
     */
    public static findInsertionNodes(treeNode: MixDOMTreeNode): [ Node, Node | null ] | [ null, null ] {

        // 1. First, find parent.
        let domParent: Node | null = null;
        let tParentNode = treeNode.parent;
        while (tParentNode) {
            // If is a fully passing type, allow to pass through.
            // .. If half passing referring to "root" type and it has a parent, allow to continue further up still - to support nested hosts.
            // .. Essentially we are then skipping the treeNode's .domNode (= the host's dom container's) existence, if there even was one.
            if (HostRender.PASSING_TYPES[tParentNode.type] || tParentNode.type === "root" && tParentNode.parent) {
                tParentNode = tParentNode.parent;
                continue;
            }
            // Not fully passing type - we should stop and take its domNode.
            // .. If there's none, then there shouldn't be any anywhere up the flow either.
            domParent = tParentNode.domNode;
            break;
        }
        // No parent.
        if (!domParent)
            return [ null, null ];

        // 2. Find sibling.
        let domSibling: Node | null = null;
        // Loop up.
        let tNode: MixDOMTreeNode | null = treeNode;
        while (tNode) {
            // Get parent.
            tParentNode = tNode.parent;
            if (!tParentNode)
                break;
            let iNext = tParentNode.children.indexOf(tNode) + 1;
            // Look for domNode in next siblings.
            let nextNode: MixDOMTreeNode | undefined;
            while (nextNode = tParentNode.children[iNext]) {
                // Found.
                if (nextNode.domNode && nextNode.type !== "portal") {
                    domSibling = nextNode.domNode;
                    break;
                }
                // Next sibling.
                iNext++;
            }
            // No more.
            if (domSibling || tParentNode.domNode === domParent)
                break;
            // Next parent up.
            tNode = tParentNode;
        }

        // 3. Return info for insertion.
        return [ domParent, domSibling ];
    }

    /** This should be called (after the dom action) for each renderInfo that has action: "create" / "move" / "remove" / "swap" (and on "content" if changed node).
     * - The respective action is defined by whether gives a domNode or null. If null, it's remove, otherwise it's like moving (for creation too).
     * - In either case, it goes and updates the bookkeeping so that each affected boundary always has a .domNode reference that points to its first element.
     * - This information is essential (and as minimal as possible) to know where to insert new domNodes in a performant manner. (See above findInsertionNodes().)
     * - Note that if the whole boundary unmounts, this is not called. Instead the one that was "moved" to be the first one is called to replace this.
     *      * In dom sense, we can skip these "would move to the same point" before actual dom moving, but renderInfos should be created - as they are automatically by the basic flow.
     */
    public static updateDOMChainBy(fromTreeNode: MixDOMTreeNode, domNode: Node | null, fromSelf: boolean = false) {
        // Note, in the simple case that we have a domNode, the next sibling part is simply skipped. See the logic above in findInsertionNodes.
        let tNode: MixDOMTreeNode | null = fromTreeNode;
        let tParent: MixDOMTreeNode | null = fromSelf ? fromTreeNode : fromTreeNode.parent;
        let newDomNode: Node | null = domNode;
        // Go up level by level until we're not the first child.
        // .. Note that even if the tParent.domNode === newDomNode, we must still go further. For example to account for: dom > boundary > boundary > dom.
        while (tParent) {
            // We've hit a non-passing tag (eg. a "dom" tag).
            // .. However, on fromSelf mode, let's continue if this was the first one, in which case tParent === tNode.
            if (!HostRender.PASSING_TYPES[tParent.type] && tParent !== tNode)
                break;
            // If we are not the first one anymore, we should (usually) stop too - and likewise exception with fromSelf mode.
            if (tParent.children[0] !== tNode && tParent !== tNode) {
                // We must actually check a bit more deeply here.
                // .. For example, say, way are the 2nd child, but the first child's dom node is null (eg. boundary rendered null).
                // .. In that case, we should go towards the first child and only break if any older child has domNode already - if not, we should not break.
                // .. Note that this part is not run for the first one if the fromSelf is true (when tParent === tNode).
                let shouldBreak = false;
                let iPrev = tParent.children.indexOf(tNode) - 1;
                while (iPrev >= 0) {
                    if (tParent.children[iPrev].domNode) {
                        shouldBreak = true;
                        break;
                    }
                    iPrev--;
                }
                // Nothing to update - there's an older child with domNode already.
                if (shouldBreak)
                    break;
            }
            // Upon removing, try to get the next sibling, unless we already have one.
            // .. We'll use it to replace the reference up the parent chain.
            // .. Note that at this point we're the first child or no earlier child had domNode.
            if (!newDomNode) {
                // Check in next siblings if finds a domNode.
                // .. Note that if tParent === tNode (<-- fromSelf = true), this works to give us the desired index 0.
                let iNext = tParent.children.indexOf(tNode) + 1;
                let nextNode: MixDOMTreeNode | undefined;
                while (nextNode = tParent.children[iNext]) {
                    // Found.
                    if (nextNode.domNode && nextNode.type !== "portal") {
                        newDomNode = nextNode.domNode;
                        break;
                    }
                    // Next.
                    iNext++;
                }
                // Break if no change.
                if (newDomNode && tParent.domNode === newDomNode)
                    break;
            }
            // Update.
            tParent.domNode = newDomNode;
            // Next.
            tNode = tParent;
            tParent = tParent.parent;
        }
    }

    /** Returns a single html element.
     * - In case, the string refers to multiple, returns a fallback element containing them - even if has no content.
     */
    public static domNodeFrom (innerHTML: string, fallbackTagOrEl: DOMTags | HTMLElement = "div", keepTag: boolean = false): Node | null {
        const dummy = fallbackTagOrEl instanceof Element ? fallbackTagOrEl : typeof document === "object" ? document.createElement(fallbackTagOrEl) : null;
        if (!dummy)
            return null;
        dummy.innerHTML = innerHTML;
        return keepTag ? dummy : dummy.children[1] ? dummy : dummy.children[0];
    }


    // - Static reader helper - //

    /** Read the content inside a (root) tree node as a html string. Useful for server side or static rendering.
     * @param treeNode An abstract info object. At "dom-types", the DOMTreeNode is a simple type only used for the purpose of this method.
     * @param onlyClosedTagsFor Define how to deal with closed / open tags per tag name. Defaults to ["img"].
     *      - If an array, only uses a single closed tag (`<div />`) for elements with matching tag (if they have no kids), for others forces start and end tags.
     *      - If it's null | undefined, then uses closed tags based on whether has children or not (= only if no children).
     */
    public static readDOMString(treeNode: MixDOMTreeNode, onlyClosedTagsFor: string[] | null | undefined = ["img"]): string {

        // Get def.
        const def = treeNode.def;
        if (!def)
            return "";

        // Read content.
        let tag = def.tag;
        let dom = "";
        // Not dom type - just return the contents inside.
        if (typeof tag !== "string") {
            if (treeNode.children)
                for (const tNode of treeNode.children)
                    dom += HostRender.readDOMString(tNode, onlyClosedTagsFor);
            return dom;
        }

        // Get element for special reads.
        let element: Node | null = null;
        // .. Tagless - text node.
        if (!tag) {
            const content = def.domContent;
            if (content)
                content instanceof Node ? element = content : dom += content.toString();
        }
        // .. PseudoElement - get the tag.
        else if (tag === "_") {
            tag = "";
            element = def.domElement || null;
        }
        // Not valid - or was simple. Not that in the case of simple, there should be no innerDom (it's the same with real dom elements).
        if (!tag && !element)
            return dom;

        // Read as a string, and any kids recursively inside first (referring to HostRender.readDOMString).
        // .. Note that this method comes from the "dom-types" library. Our HostRender method is named similarly.
        dom += readDOMString(
            // Tag (string).
            tag,
            // Cleaned dom props.
            (treeNode as MixDOMTreeNodeDOM).domProps,
            // Content inside: string or `true` (to force opened tags).
            (
                (def.domContent != null ?
                    def.domContent instanceof Node ? readDOMString("", null, null, def.domContent) : 
                    def.domContent.toString() :
                "") +
                (treeNode.children ? treeNode.children.reduce((str, kidNode) => str += HostRender.readDOMString(kidNode, onlyClosedTagsFor), "") : "")
            ) || onlyClosedTagsFor && !onlyClosedTagsFor.includes(tag),
            // Element for reading further info.
            element || (def?.domContent instanceof Node ? def.domContent : null)
        );

        // Return the combined string.
        return dom;
    }


    // - Static virtual item helpers - //

    /** Modifies the groundedTree by smuggling in already existing DOM nodes. */
    public static onRemount(remountSource: MixDOMRemountInfo, groundedTree: MixDOMTreeNode): void {
        // Parse.
        let { reused, readFromDOM } = remountSource;
        if (!reused)
            reused = new Set();
        // Make sure root is marked as used - so that it won't be used.
        groundedTree.domNode && reused.add(groundedTree.domNode);
        // Loop the matched pairs.
        for (const [treeNode, vItem, node] of HostRender.getVirtualDomPairs(groundedTree, remountSource, true)) {
            // Read.
            if (readFromDOM === true || readFromDOM === "attributes")
                treeNode.domProps = readDOMProps(node);


            // if ((node.nodeType === Node.TEXT_NODE) && (readFromDOM === true || readFromDOM === "content")) {

            //     // node.textContent = ""; // <-- Is it too much.
            // }
            // Bookkeeping.
            treeNode.domNode = node;
            reused.add(node);
            // Protect all inside blindly.
            if (treeNode.def.domHTMLMode && vItem) {
                for (const item of HostRender.flattenVirtualItems(vItem))
                    reused.add(item.node);
            }
            // Remove from DOM, unless parent already fine.
            if (node.parentElement) {
                // Check that parent matches.
                let p: MixDOMTreeNode | null = treeNode;
                while (p = p.parent) {
                    // Go further.
                    if (p.type !== "dom")
                        continue;
                    // Remove parent.
                    // .. It will also indicate that the smuggle-created node must be moved.
                    // .. By default, the smuggle-created ones won't be moved.
                    if (node.parentElement !== p.domNode)
                        node.parentElement.removeChild(node);
                    break;
                }
            }
        }
        // Remove unused.
        if (remountSource.vRoot) {
            for (const vItem of HostRender.flattenVirtualItems(remountSource.vRoot)) {
                if (reused.has(vItem.node))
                    continue;
                const node = vItem.node;
                remountSource.unused && remountSource.unused.add(node);
                if (remountSource.removeUnused && node.parentElement)
                    node.parentElement.removeChild(node);
            }
        }
    }
    
    /** Create virtual items mapping from the given container node. */
    public static createVirtualItemsFor(container: Node): { vRoot: MixDOMAssimilateItem; vKeyedByTags: Partial<Record<DOMTags, MixDOMAssimilateItem[]>>; } {

        // Prepare.
        let vRoot: MixDOMAssimilateItem | null = null;
        const vKeyedByTags: Partial<Record<DOMTags, MixDOMAssimilateItem[]>> = {};

        // Create virtual item root.
        vRoot = {
            tag: (container as Element).tagName?.toLowerCase() as DOMTags || "",
            node: container,
            parent: null,
            // used: true  // Could mark it here, but this is reserved for external use only.
        };
        // Add kids recursively.
        if (container.childNodes[0]) {
            // Prepare loop.
            let loopPairs: [elements: Node[], parent: MixDOMAssimilateItem][] = [[ [...container.childNodes], vRoot ]];
            let info: typeof loopPairs[number];
            let i = 0;
            // Loop kids recursively.
            while (info = loopPairs[i]) {
                // Prepare.
                i++;
                const [nodes, parent] = info;
                if (!parent.children)
                    parent.children = [];
                // Loop kids.
                let newLoopPairs: typeof loopPairs = [];
                for (const node of nodes) {
                    // Create item.
                    const item: MixDOMAssimilateItem = {
                        tag: (node as Element).tagName?.toLowerCase() as DOMTags || "",
                        node,
                        parent
                    };
                    // Handle keyed.
                    const key = node instanceof Element ? node.getAttribute("_key") : null;
                    if (key != null) {
                        // Define key.
                        item.key = key;
                        // Add to keyed items collection (organized by tags).
                        (vKeyedByTags[item.tag] || (vKeyedByTags[item.tag] = [])).push(item);
                    }
                    // Add item to virtual dom.
                    parent.children.push(item);
                    // Add kids.
                    if (node.childNodes[0])
                        newLoopPairs.push( [ [...node.childNodes], item ]);
                }
                // Add to loop nodes.
                if (newLoopPairs[0]) {
                    loopPairs = newLoopPairs.concat(loopPairs.slice(i));
                    i = 0;
                }
            }
        }

        return { vRoot, vKeyedByTags };
    }
    
    /** Flattens the virtual item tree structure into an array.
     * @param vRoot The root virtual item to flatten by its children. The root is included in the returned array.
     * @returns The flattened array of virtual items containing all the items in tree order.
     */
    public static flattenVirtualItems(vRoot: MixDOMAssimilateItem): MixDOMAssimilateItem[] {
        // Prepare.
        let vItems: MixDOMAssimilateItem[] = [vRoot];
        let vItem: MixDOMAssimilateItem | undefined;
        let iItem = 0;
        // Loop recursively in tree order.
        while (vItem = vItems[iItem++]) {
            // Has kids.
            if (vItem.children && vItem.children[0])
                // Add kids to the front of the queue, while keeping the iItem pointer.
                vItems = vItems.slice(0, iItem).concat(vItem.children.concat(vItems.slice(iItem)));
        }
        return vItems;
    }

    /** Returns a DOM matched [treeNode, virtualItem, node] pairings. If onlyMatched is true and vRoot provided, only returns the ones matched with the virtual structure. Otherwise just all by "dom" type treeNode - paired or not. */
    public static getVirtualDomPairs(rootNode: MixDOMTreeNode, vInfo: MixDOMReassimilateInfo, onlyMatched: true): [ treeNode: MixDOMTreeNodeDOM, vItem: MixDOMAssimilateItem | null, node: Node ][];
    public static getVirtualDomPairs(rootNode: MixDOMTreeNode, vInfo: MixDOMReassimilateInfo, onlyMatched?: boolean): [ treeNode: MixDOMTreeNodeDOM, vItem: MixDOMAssimilateItem | null, node: Node | null ][];
    public static getVirtualDomPairs(rootNode: MixDOMTreeNode, vInfo: MixDOMReassimilateInfo, onlyMatched?: boolean): [ treeNode: MixDOMTreeNodeDOM, vItem: MixDOMAssimilateItem | null, node: Node | null ][] {
        // Prepare.
        const { vRoot, vKeyedByTags, validator, suggester } = vInfo;
        const excluded = vInfo.reused || new Set();
        type LoopTreeItem = [ treeNode: MixDOMTreeNode, vItem: MixDOMAssimilateItem | null ];
        let domPairs: [ treeNode: MixDOMTreeNodeDOM, vItem: MixDOMAssimilateItem | null, node: Node | null ][] = []; 
        let loopTree: LoopTreeItem[] = [[ rootNode, vRoot || null ]];
        let loopItem: LoopTreeItem | undefined;
        let iItem = 0;
        // Loop recursively.
        while (loopItem = loopTree[iItem++]) {
            // Prepare.
            let [treeNode, vItem] = loopItem;
            // Very importantly, we only target dom types - others are just intermediary steps in the tree for us.
            if (treeNode.type === "dom") {
                // Fetch a suitable virtual item or dom node.
                const vNewItem = HostRender.getTreeNodeMatch(treeNode, vItem, vKeyedByTags, excluded, validator, suggester);
                // Override.
                if (vNewItem) {
                    // Node.
                    let node: Node;
                    if (vNewItem instanceof Node) {
                        node = vNewItem;
                        domPairs.push([treeNode, null, vNewItem]);
                    }
                    // Virtual item.
                    else {
                        vItem = vNewItem;
                        node = vItem.node;
                    }
                    // Add.
                    domPairs.push([treeNode, vNewItem === node ? null : vNewItem as MixDOMAssimilateItem, node]);
                    excluded.add(node);
                }
                else {
                    // Add anyway.
                    if (!onlyMatched)
                        domPairs.push([treeNode, vItem, null]);
                    // Add the treeNode's domNode to excluded.
                    // .. Note that during remount (vs. reassimilation), they'll never be a domNoe here yet.
                    if (treeNode.domNode)
                        excluded.add(treeNode.domNode);
                }
            }
            // Add to loop after the already processed, but before any further ones - we'll loop the kids next.
            if (treeNode.children[0]) {
                loopTree = treeNode.children.map(tNode => [ tNode, vItem ] as LoopTreeItem).concat(loopTree.slice(iItem));
                iItem = 0;
            }
        }
        // Return.
        return domPairs;
    }

    /** Find a suitable virtual item from the structure.
     * - Tries the given vItem, or if used its children.
     * - Can use an optional suggester that can suggest some other virtual item or a direct dom node. 
     *      * Any suggestions (by the callback or our tree structure) must always have matching tag and other some requirements.
     *      * If suggests a virtual item it must fit the structure. If suggests a dom node, it can be from anywhere basically - don't steal from another host.
     * - Can also use an optional validator that should return true to accept, false to not accept. It's the last one in the chain that can say no.
     * - DEV. NOTE. This is a bit SKETCHY.
     */
    public static getTreeNodeMatch(treeNode: MixDOMTreeNodeDOM, vItem: MixDOMAssimilateItem | null, vKeyedByTags?: Partial<Record<DOMTags, MixDOMAssimilateItem[]>> | null, excludedNodes?: Set<Node> | null, validator?: MixDOMAssimilateValidator | null, suggester?: MixDOMAssimilateSuggester | null): MixDOMAssimilateItem | Node | null {

        // Parse.
        const tag = treeNode.def.tag as DOMTags | "_" | "";
        const itemKey = treeNode.def.key;

        // Ask suggester.
        if (suggester) {
            // Get suggestion.
            const suggested = suggester(vItem, treeNode, tag, itemKey);
            // If had a suggestion, process it.
            // .. If dom node accept directly, otherwise check by virtual location.
            // .. In addition, verify that tag name is okay.
            if (suggested) {
                const sTag = suggested instanceof Element ? suggested.tagName.toLowerCase() : "";
                if (sTag === tag && (suggested instanceof Node ? !excludedNodes?.has(suggested) : !excludedNodes?.has(suggested.node) && HostRender.isVirtualItemOk(treeNode, suggested, vItem, validator)))
                    return suggested;
            }
        }

        // Try by local structure.
        const hasKey = itemKey != null;
        if (vItem) {
            // Check the given or then its kids.
            // .. Return the first one that's 1. not used, 2. matches by tag, 3. who has / has not key similarly, 4. is okay by location and validator.
            for (const item of vItem.children ? [ vItem, ...vItem.children ] : [vItem])
                if (!item.used && item.tag === tag && (hasKey ? item.key === itemKey : item.key == null) && !excludedNodes?.has(item.node) && (!validator || validator(item, treeNode, tag, itemKey)))
                    return item;
        }

        // Check by key.
        if (vKeyedByTags && hasKey) {
            // Get keyed for the same tag.
            const byTag = vKeyedByTags[tag as DOMTags];
            if (byTag) {
                // Return the first one that's 1. not used, 2. whose key matches, 3. is okay by location and validator.
                for (const item of byTag)
                    if (!item.used && item.key === itemKey && !excludedNodes?.has(item.node) && HostRender.isVirtualItemOk(treeNode, item, vItem, validator))
                        return item;
            }
        }

        // None found.
        return null;
    }

    /** Internal helper for getTreeNodeMatch. Checks if the virtual item is acceptable for the treeNode. Returns true if it is, false if not. */
    private static isVirtualItemOk(treeNode: MixDOMTreeNodeDOM, item: MixDOMAssimilateItem, baseItem: MixDOMAssimilateItem | null, validator?: MixDOMAssimilateValidator | null): boolean {
        // Must always have the identical tag.
        if (item.tag !== treeNode.def.tag)
            return false;
        // No vItem, accept directly.
        const def = treeNode.def;
        if (!baseItem) {
            if (!validator || validator(item, treeNode, def.tag as DOMTags, def.key))
                return true;
        }
        // Verify that is within the vItem (if given).
        else {
            let it: typeof item | null = item;
            while (it) {
                // If is inside, accept it.
                if (it === baseItem)
                    return !validator || validator(item, treeNode, def.tag as DOMTags, def.key);
                it = it.parent;
            }
        }
        // Not valid.
        return false;
    }
    
}
