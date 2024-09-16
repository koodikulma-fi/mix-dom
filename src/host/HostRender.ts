
// - Imports - //

// Libraries.
import { askListeners, callListeners } from "data-signals";
// Typing.
import {
    HTMLTags,
    SVGTags,
    DOMTags,
    ListenerAttributeNames,
    MixDOMTreeNode,
    MixDOMTreeNodeDOM,
    MixDOMTreeNodeType,
    MixDOMDOMDiffs,
    MixDOMProcessedDOMProps,
    MixDOMContentValue,
    MixDOMRenderInfo,
    MixDOMDefType,
    MixDOMHydrationItem,
    MixDOMHydrationValidator,
    MixDOMHydrationSuggester,
} from "../typing";
// Routines.
import { cleanDOMStyle, getClassNameDiffs, getDictionaryDiffs, rootDOMTreeNodes } from "../static/index";
// Common.
import { Ref } from "../common/index";
// Only typing (local).
import { HostSettings } from "./Host";


// - Types - //

// Settings.
export type HostRenderSettings = Pick<HostSettings,
    "renderTextHandler" |
    "renderTextTag" |
    "renderHTMLDefTag" |
    "renderSVGNamespaceURI" |
    "renderDOMPropsOnSwap" |
    "noRenderValuesMode" |
    "disableRendering" |
    "duplicateDOMNodeHandler" |
    "duplicateDOMNodeBehaviour" |
    "devLogWarnings" |
    "devLogRenderInfos"
>;


// - Class - //

// This is exported as a class, so that can hold some members (like externalElements and settings).
export class HostRender {


    // - Instanced - //

    /** Detect if is running in browser or not. */
    public inBrowser: boolean;
    /** Root for pausing. */
    public hydrationRoot: MixDOMTreeNode | null;
    /** Pausing. When resumes, rehydrates. */
    public paused: boolean;
    /** When paused, if has any infos about removing elements, we store them - so that we can call unmount (otherwise the treeNode ref is lost). */
    public pausedPending?: MixDOMRenderInfo[];
    /** Collection of settings. */
    public settings: HostRenderSettings;
    /** To keep track of featured external dom elements. */
    public externalElements: Set<Node>;

    constructor(settings: HostRenderSettings, hydrationRoot?: MixDOMTreeNode) {
        this.hydrationRoot = hydrationRoot || null;
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

    /** Resume the renderer after pausing. Will rehydrate dom elements and reapply changes to them. 
     * Note that calling resume will unpause rendering even when settings.disableRendering is set to true. */
    public resume(): void {
        // Was not paused.
        if (!this.paused)
            return;
        // Resume - even if settings say disableRendering.
        this.paused = false;
        if (this.hydrationRoot)
            this.rehydrate(null, true);
    }


    // - Hydrate - //

    /** This rehydrates the rendered defs with actual dom elements.
     * - It supports reusing custom html elements from within the given "container" element - it should be the _containing_ element. You should most often use the host's container element.
     * - In smuggleMode will replace the existing elements with better ones from "from" - otherwise only tries to fill missing ones.
     * - In destroyOthersMode will destroy the unused elements found in the container.
     * - In readAllMode will re-read the current dom props from the existing ones as well.
     * - This also resumes rendering if was paused - unless is disableRendering is set to true in host settings.
     */
    public rehydrate(container: Node | null = null, readAllMode: boolean = false, smuggleMode: boolean = false, destroyOthersMode: boolean = false, validator?: MixDOMHydrationValidator | null, suggester?: MixDOMHydrationSuggester | null): void {

        // Must have a hydration root.
        const rootTreeNode = this.hydrationRoot;
        if (!rootTreeNode) {
            if (this.settings.devLogWarnings)
                console.warn("__HostRender.rehydrate: Warning: No hydration root assigned. ", this);
            return;
        }

        // Idea.
        // 1. Pre-map: Build a MixDOMHydrationItem map from the container node, if given.
        // 2. Apply: Loop over the treeNode structure (only targeting "dom" treeNode types), and
        //    * Fill any missing elements (and assign parent-children relations), creating new if has to. In smuggleMode try better alternatives for existing, too.
        //    * For any replaced elements, reapply the dom props (by reading, diffing changes and applying).
        //      .. If in readAllMode, reapply them for existing ones, too (presumably after having being paused).
        //    * While we loop down, we iterate down the MixDOMHydrationItem map by any matching hits.


        // - 1. Pre build info by the container element - //

        // Prepare.
        let vDom: MixDOMHydrationItem | null = null;
        const vKeyedByTags: Partial<Record<DOMTags, MixDOMHydrationItem[]>> = {};

        // Get info if element provided.
        if (container) {
            // Create virtual item root.
            vDom = {
                tag: (container as Element).tagName?.toLowerCase() as DOMTags || "",
                node: container,
                parent: null,
                used: true  // We mark it as used, as it's assumed to be the container - not an actual match for local structure.
                            // .. Note. We could drop it now that we use excludedNodes extensively.
            };
            // Add kids recursively.
            if (container.childNodes[0]) {
                // Prepare loop.
                let loopPairs: [elements: Node[], parent: MixDOMHydrationItem][] = [[ [...container.childNodes], vDom ]];
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
                        const item: MixDOMHydrationItem = {
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
        }


        // - 2. Loop over the treeNode structure and rehydrate - //

        // Prepare excluded.
        // .. Note. This excluded protection is sketchy. Could maybe use getApprovedNodeShould, and maybe protect from other hosts, too.
        // .. On the other hand, there's not much point about extensive protection against misuse. So...
        const excludedNodes = new Set(this.externalElements);
        if (container)
            excludedNodes.add(container);
        // Prepare looping.
        type LoopTreeItem = [ treeNode: MixDOMTreeNode, vItem: MixDOMHydrationItem | null ];
        let loopTree: LoopTreeItem[] = [[ rootTreeNode, vDom ]];
        let loopItem: LoopTreeItem | undefined;
        let i = 0;
        const toApply: MixDOMRenderInfo[] = [];
        // Loop recursively.
        while (loopItem = loopTree[i]) {
            
            // Prepare.
            i++;
            let [treeNode, vItem] = loopItem;
            
            // Very importantly, we only target dom types - others are just intermediary steps in the tree for us.
            if (treeNode.type === "dom") {

                // Fetch a suitable virtual item or dom node.
                let domNode = treeNode.domNode;
                const vNewItem = HostRender.getTreeNodeMatch(treeNode, vItem, vKeyedByTags, excludedNodes, validator, suggester);
                // Override.
                if (vNewItem) {
                    let newDomNode: Node | null = null;
                    // Node.
                    if (vNewItem instanceof Node)
                        newDomNode = vNewItem;
                    // Virtual item.
                    else {
                        vItem = vNewItem;
                        vItem.used = true;
                        newDomNode = vItem.node;
                    }
                    // Update local reference.
                    if (newDomNode && (!treeNode.domNode || smuggleMode))
                        domNode = newDomNode;
                }
                if (domNode)
                    excludedNodes.add(domNode);

                // Gather render infos.
                // .. Note that we're dealing with a "dom" type of treeNode, so the .domNode ref actually belongs to the treeNode.
                const renderInfo: MixDOMRenderInfo = { treeNode };
                let reapply = readAllMode;
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
                            treeNode.domProps = HostRender.readFromDOM(domNode);
                        // Add info.
                        renderInfo.update = true;
                    }
                }
                // Should render.
                if (renderInfo.create || renderInfo.swap || renderInfo.move || renderInfo.update || renderInfo.content)
                    toApply.push(renderInfo);
            }

            // Add to loop.
            if (treeNode.children[0]) {
                loopTree = treeNode.children.map(tNode => [ tNode, vItem ] as LoopTreeItem).concat(loopTree.slice(i));
                i = 0;
            }
        }

        // Mark that is no longer paused.
        if (!this.settings.disableRendering)
            this.paused = false;
        
        // Destroy other nodes (directly).
        // .. Must be done before applying to dom, so that we won't have to pre-protect the newly created ones.
        if (destroyOthersMode && container) {
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

        // Shortcuts.
        const settings = this.settings;

        // - DEVLOG - //
        // This tiny log is super useful when debugging (especially with preCompareDOMProps = true).
        if (settings.devLogRenderInfos)
            console.log("__HostRender.applyToDOM: Dev-log: Received rendering infos" + (this.paused ? " (while paused)" : "") + ": ", renderInfos);

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
        /** Moving is done in reverse order, so we collect the movers here. */
        let toMove: Array<MixDOMRenderInfo> | null = null;
        /** This is used to skip unnecessary dom removals, in the case that the a parent in direct parent chain was just removed. */
        let newlyKilled: Array<Node> | null = null;
        /** For salvaging dom nodes. */
        let salvaged: Array<Node> | null = null;

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
            let didCreate = false;

            // Refresh.
            if (renderInfo.refresh && treeNode.domNode && treeNode["domProps"]) {
                (treeNode as MixDOMTreeNodeDOM).domProps = renderInfo.refresh === "read" ? HostRender.readFromDOM(treeNode.domNode) : {};
                doUpdate = true;
            }

            // Create.
            if (renderInfo.create) {
                switch(treeNode.type) {
                    // Normal case - refers to a dom tag.
                    case "dom":
                        // Create.
                        const domNode = this.createDOMNodeBy(treeNode);
                        if (domNode) {
                            // Update ref.
                            treeNode.domNode = domNode;
                            // Add to smart bookkeeping.
                            didCreate = true;
                            // newlyCreated.push(domNode);
                        }
                        break;
                    // QPortal - just define the domNode ref.
                    case "portal":
                        treeNode.domNode = treeNode.def.domPortal || null;
                        break;
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
                // Normal case.
                else {
                    // Mark to be moved (done in reverse order below).
                    // .. Note that the actual moving / inserting process is done afterwards (below) - including calling updateDOMChainBy.
                    if (treeNode.domNode)
                        (toMove || (toMove = [])).push(renderInfo);
                }
            }

            // Swap elements (for PseudoPortal, PseudoElement and hydration).
            if (renderInfo.swap) {
                // Parse.
                const isCustom = renderInfo.swap !== true; // If not true, it's a Node to swap to.
                const oldEl = treeNode.domNode;
                let newEl: Node | null = isCustom ? renderInfo.swap as Node : (treeNode.type === "portal" ? treeNode.def.domPortal : treeNode.def.domElement) || null;
                // If had changed.
                if (oldEl !== newEl) {

                    // For PseudoPortal and hydration (= isCustom), we just need to swap the children.
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
                            if (tNode.domProps && oldEl instanceof Element) {
                                for (const prop in tNode.domProps) {
                                    const listenerProp = HostRender.LISTENER_PROPS[prop];
                                    if (listenerProp)
                                        oldEl.removeEventListener(listenerProp, tNode.domProps[prop]);
                                }
                            }
                            // Remove from dom.
                            if (oldParent)
                                oldParent.removeChild(oldEl);
                        }
                        // Reapply.
                        if (tNode.domProps) {
                            tNode.domProps = newEl && (settings.renderDOMPropsOnSwap === "read") ? HostRender.readFromDOM(newEl) : {};
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
            if (renderInfo.content) {
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
                            if (nodeWas.nodeType !== 3 && this.inBrowser)
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
                    // Modify dom props.
                    const [ appliedProps, domElement, diffs ] = HostRender.domApplyProps(treeNode, settings.devLogWarnings);
                    treeNode.domProps = appliedProps;
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
            type ToCallInfo = [isMountCall: boolean, treeNode: MixDOMRenderInfo["treeNode"], domParent: Node | null, domSibling: Node | null];
            const toInsert: ToInsertInfo[] = [];
            let toCall: ToCallInfo[] | null = null;
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
                            (toCall || (toCall = [])).push([!rInfo.move, rInfo.treeNode, domParentWas, domSiblingWas ]);
                        // Pre-remove movers from dom - but do not insert yet.
                        // .. This is needed to be done for all beforehands, so that can do parent-child swapping.
                        if (domParentWas)
                            domParentWas.removeChild(domNode);
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

            // Call run - we must do it afterwards. (Otherwise might call domDidMount before parent is inserted into dom tree.)
            if (toCall) {
                // Loop in tree order - so it's the reverse of toCall as it was collected in reverse order.
                let iCall = toCall.length;
                while (iCall--) {
                    // Prepare call.
                    const [isMount, thisTreeNode, domParentWas, domSiblingWas] = toCall[iCall];
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
    }


    // - Private services - //

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

        // - Static part (after getting settings) - //

        // HTML string.
        const settings = this.settings;
        const htmlMode = treeNode.def.domHTMLMode;
        if (htmlMode && simpleContent != null && simpleContent !== "")
            return HostRender.domNodeFrom(simpleContent.toString(), (origTag as DOMTags) || settings.renderHTMLDefTag, true);
        // HTML or SVG element.
        if (origTag)
            return !this.inBrowser ? null : origTag === "svg" || treeNode.parent && treeNode.parent.domNode && treeNode.parent.domNode["ownerSVGElement"] !== undefined ?
                document.createElementNS(settings.renderSVGNamespaceURI || "http://www.w3.org/2000/svg", origTag as SVGTags) :
                document.createElement(origTag as HTMLTags);

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


    // - Static - //

    static SIMPLE_TAGS: string[] = ["img"];
    static SPECIAL_PROPS: Record<string, "other" | "render" | undefined> = { innerHTML: "render", outerHTML: "render", textContent: "render", innerText: "render", outerText: "render", style: "other", data: "other", className: "other" };
    static PASSING_TYPES: Partial<Record<MixDOMTreeNodeType | MixDOMDefType, true>> = { boundary: true, pass: true, host: true, fragment: true }; // Let's add fragment here for def side.
    static LISTENER_PROPS = [
    "Abort","Activate","AnimationCancel","AnimationEnd","AnimationIteration","AnimationStart","AuxClick","Blur","CanPlay","CanPlayThrough","Change","Click","Close","ContextMenu","CueChange","DblClick","Drag","DragEnd","DragEnter","DragLeave","DragOver","DragStart","Drop","DurationChange","Emptied","Ended","Error","Focus","FocusIn","FocusOut","GotPointerCapture","Input","Invalid","KeyDown","KeyPress","KeyUp","Load","LoadedData","LoadedMetaData","LoadStart","LostPointerCapture","MouseDown","MouseEnter","MouseLeave","MouseMove","MouseOut","MouseOver","MouseUp","Pause","Play","Playing","PointerCancel","PointerDown","PointerEnter","PointerLeave","PointerMove","PointerOut","PointerOver","PointerUp","Progress","RateChange","Reset","Resize","Scroll","SecurityPolicyViolation","Seeked","Seeking","Select","Stalled","Submit","Suspend","TimeUpdate","Toggle","TouchCancel","TouchEnd","TouchMove","TouchStart","TransitionCancel","TransitionEnd","TransitionRun","TransitionStart","VolumeChange","Waiting","Wheel"].reduce((acc,curr) => (acc["on" + curr]=curr.toLowerCase(),acc), {}) as Record<ListenerAttributeNames, (e: Event) => void>;

    /** Using the bookkeeping logic, find the parent node and next sibling as html insertion targets. */
    public static findInsertionNodes(treeNode: MixDOMTreeNode): [ Node, Node | null ] | [ null, null ] {

        // Situation example:
        //
        //  <div>                               // domNode: <div/>
        //      <Something>                     // domNode: <span/> #1
        //          <Onething>                  // domNode: <span/> #1
        //              <span>Stuff 1</span>    // domNode: <span/> #1
        //          </Onething>                 //
        //          <Onething>                  // domNode: <span/> #2
        //              <span>Stuff 2</span>    // domNode: <span/> #2
        //              <span>Stuff 3</span>    // domNode: <span/> #3
        //          </Onething>                 //
        //          <Onething>                  // domNode: <span/> #4
        //              <span>Stuff 4</span>    // domNode: <span/> #4
        //          </Onething>                 //
        //      </Something>                    //
        //      <Something>                     // domNode: <span/> #5
        //          <Onething>                  // domNode: <span/> #5
        //              <span>Stuff 5</span>    // domNode: <span/> #5
        //              <span>Stuff 6</span>    // domNode: <span/> #6
        //          </Onething>                 //
        //          <Onething>                  // domNode: <span/> #7
        //              <span>Stuff 7</span>    // domNode: <span/> #7
        //          </Onething>                 //
        //      </Something>                    //
        //  </div>                              //
        //
        // LOGIC FOR INSERTION (moving and creation):
        // 1. First find the domParent by simply going up until hits a treeNode with a dom tag.
        //    * If none found, stop. We cannot insert the element. (Should never happen - except for swappable elements, when it's intended to "remove" them.)
        //    * If the domParent was found in the newlyCreated smart bookkeeping, skip step 2 below (there are no next siblings yet).
        // 2. Then find the next domSibling reference element.
        //    * Go up and check your index.
        //    * Loop your next siblings and see if any has .domNode. If has, stop, we've found it.
        //    * If doesn't find any (or no next siblings), repeat the loop (go one up and check index). Until hits the domParent.
        // 3. Insert the domElement into the domParent using the domSibling reference if found (otherwise null -> becomes the last one).
        //
        // CASE EXAMPLE FOR FINDING NEXT SIBLING - for <span/> #2 above:
        // 1. We first go up to <Onething/> and see if we have next siblings.
        //    * If <span /3> has .domNode, we are already finished.
        // 2. There are no more siblings after it, so we go up to <Something/> and do the same.
        //    * If the third <Onething/> has a .domNode, we are finished.
        // 3. Otherwise we go up to <div> and look for siblings.
        //    * If the second <Something/> has a .domNode, we are finished.
        // 4. Otherwise we are finished as well, but without a .domNode. We will be inserted as the last child.
        //
        // BOOKKEEPING (see updateDOMChainBy() below):
        // - The bookkeeping is done by whenever an element is moved / created:
        //   * Goes to update domNode up the chain until is not the first child of parent or hits a dom tag.
        //   * Actually, it's a tiny bit more complicated: even if we are, say, the 2nd child,
        //     but 1st child has no domNode (eg. boundary rendered null), then we should still also update the chain.
        // - In the case of removing, the procedure is a bit more complex:
        //   * Goes up level by level until not the first child anymore or hits a dom tag.
        //     - On each tries to find a next sibling, unless already did find earlier.
        //     - Then applies that node to the current (boundary) treeNode.
        // - So if <span/> #2 is inserted above, after creating the element (and before inserting it),
        //   will go one up to update <Onething/>, but then is not anymore the first child (of <Something>), so stops.
        //


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
     *   .. In dom sense, we can skip these "would move to the same point" before actual dom moving, but renderInfos should be created - as they are automatically by the basic flow. */
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

    /** This reads the domProps (for MixDOMTreeNodeDOM) from a domNode. Skips listeners, but supports class, style and data. */
    public static readFromDOM(domNode: HTMLElement | SVGElement | Node): MixDOMProcessedDOMProps {
        // Prepare.
        const domProps: MixDOMProcessedDOMProps = {};
        if (!(domNode instanceof Element))
            return domProps;
        // Attributes.
        // .. This includes className as class, but we convert it back to className for fluidity with our flow.
        for (const prop of domNode.getAttributeNames())
            domProps[prop === "class" ? "className" : prop] = domNode.getAttribute(prop);
        // Style.
        const cssText = (domNode as HTMLElement | SVGElement).style.cssText;
        if (cssText)
            domProps.style = cleanDOMStyle(cssText);
        // Data.
        const data = (domNode as HTMLElement).dataset;
        if (data && Object.keys(data).length) {
            domProps.data = {};
            for (const prop in data)
                domProps.data[prop] = data[prop];
        }
        // Return collected.
        return domProps;
    }

    /** Returns a single html element.
     * - In case, the string refers to multiple, returns a fallback element containing them - even if has no content. */
    public static domNodeFrom (innerHTML: string, fallbackTagOrEl: DOMTags | HTMLElement = "div", keepTag: boolean = false): Node | null {
        const dummy = fallbackTagOrEl instanceof Element ? fallbackTagOrEl : typeof document === "object" ? document.createElement(fallbackTagOrEl) : null;
        if (!dummy)
            return null;
        dummy.innerHTML = innerHTML;
        return keepTag ? dummy : dummy.children[1] ? dummy : dummy.children[0];
    }

    // /** Returns a list of html elements. */
    // static domNodesFrom (innerHTML: string): Node[] {
    //     const dummy = document.createElement("div");
    //     dummy.innerHTML = innerHTML;
    //     return [...dummy.children];
    // }
    // <-- Unused.

    /** Apply properties to dom elements for the given treeNode. Returns [ appliedProps, domElement, diffs? ]. */
    public static domApplyProps(treeNode: MixDOMTreeNodeDOM, logWarnings: boolean = false): [ MixDOMProcessedDOMProps, Element | SVGElement | null, MixDOMDOMDiffs? ] {

        // Parse.
        const domElement = treeNode.domNode instanceof Element ? treeNode.domNode : null;
        const appliedProps: MixDOMProcessedDOMProps = {};

        // Collect all.
        const oldProps = treeNode.domProps || {};
        const nextProps = treeNode.def.props || {};
        const allDiffs = getDictionaryDiffs(oldProps, nextProps);
        if (!allDiffs)
            return [ nextProps, domElement ];

        // Loop all.
        const diffs: MixDOMDOMDiffs = {};
        for (const prop in allDiffs) {

            // Special cases.
            const specialProp = HostRender.SPECIAL_PROPS[prop];
            if (specialProp) {
                // Not renderable.
                if (specialProp === "render") {
                    if (logWarnings)
                        console.warn("__HostRender.domApplyProps: Warning: Is using an ignored dom prop: ", prop, " for treeNode: ", treeNode);
                }
                // Specialities: className, style and data.
                else {
                    // Classname.
                    if (prop === "className") {
                        const classDiffs = getClassNameDiffs(oldProps.className, nextProps.className);
                        if (classDiffs) {
                            // Diffs.
                            diffs.classNames = classDiffs;
                            // Apply.
                            if (domElement)
                                for (const name in classDiffs)
                                    domElement.classList[classDiffs[name] ? "add" : "remove"](name);
                            // Bookkeeping.
                            nextProps.className ? appliedProps.className = nextProps.className : delete appliedProps.className;
                        }
                    }
                    // The prop is "style" or "data".
                    else {
                        // Get diffs.
                        const nextVal = nextProps[prop];
                        const subDiffs = getDictionaryDiffs(oldProps[prop] || {}, nextVal || {});
                        if (subDiffs) {
                            // Diffs.
                            diffs[prop] = subDiffs;
                            // Apply.
                            if (domElement) {
                                if (prop === "data") {
                                    const dMap: DOMStringMap | undefined = (domElement as HTMLElement).dataset;
                                    if (dMap)
                                        for (const subProp in subDiffs)
                                            subDiffs[subProp] !== undefined ? dMap[subProp] = subDiffs[subProp] : delete dMap[subProp];
                                }
                                // For styles, we use the very flexible element.style[prop] = value. If value is null, then will remove.
                                // .. This way, we support both ways to input styles: "backgroundColor" and "background-color".
                                else {
                                    const s: CSSStyleDeclaration | undefined = (domElement as HTMLElement).style;
                                    if (s)
                                        for (const subProp in subDiffs)
                                            s[subProp] = subDiffs[subProp] != null ? subDiffs[subProp] : null;
                                }
                            }
                            // Bookkeeping.
                            nextVal ? appliedProps[prop] = nextVal : delete appliedProps[prop];
                        }
                    }
                }
                // Skip in any case.
                continue;
            }
            // Prepare.
            const val = allDiffs[prop];
            const hasValue = val !== undefined;
            const listenerProp = HostRender.LISTENER_PROPS[prop];
            // Listener.
            if (listenerProp) {
                // Diffs.
                if (!diffs.listeners)
                    diffs.listeners = {};
                diffs.listeners[prop] = val;
                // Apply.
                if (domElement) {
                    // Remove old, if had.
                    const oldListener = oldProps[prop];
                    if (oldListener)
                        domElement.removeEventListener(listenerProp, oldListener);
                    // Add new.
                    if (hasValue)
                        domElement.addEventListener(listenerProp, val);
                }
            }
            // Normal case - set/remove attribute.
            // .. Note, the value will be stringified automatically.
            else {
                // Diffs.
                if (!diffs.attributes)
                    diffs.attributes = {};
                diffs.attributes[prop] = val;
                // Apply.
                if (domElement)
                    hasValue ? domElement.setAttribute(prop, val) : domElement.removeAttribute(prop);
            }
            // Bookkeeping.
            hasValue ? appliedProps[prop] = val : delete appliedProps[prop];
        }

        // Return info for the actually applied situation as well as diffs for each type.
        for (const _prop in diffs)
            return [ appliedProps, domElement, diffs ];
        // No diffs.
        return [ appliedProps, domElement];
    }


    // - Server side rendering specialities - //

    // Thanks to: https://stackoverflow.com/questions/24758284/how-to-change-camelcase-to-slug-case-or-kabob-case-via-regex-in-javascript
    /**
     * - With "-" as replaceBy, functions like this: "testProp" => "test-prop", and "TestProp" => "-test-prop".
     * - This behaviour mirrors how element.dataset[prop] = value works. For example: data.TestProp = true   =>   <div data--test-prop="true" />
     */
    public static decapitalizeString(str: string, replaceBy: string = ""): string {
        return str.replace(/([A-Z])/g, replaceBy + "$1").toLowerCase();
    }

    /** This returns the content inside a root tree node as a html string. */
    public static readAsString(treeNode: MixDOMTreeNode): string {

        // Get def.
        const def = treeNode.def;
        if (!def)
            return "";

        // Read content.
        let tag = def.tag;
        let dom = "";
        // Not dom type - just return the contents inside.
        if (typeof tag !== "string") {
            for (const tNode of treeNode.children)
                dom += HostRender.readAsString(tNode);
            return dom;
        }

        // Prepare dom type.
        let element: Node | null = null;
        // Tagless - text node.
        if (!tag) {
            const content = def.domContent;
            if (content)
                content instanceof Node ? element = content : dom += content.toString();
        }
        // PseudoElement - get the tag.
        else if (tag === "_")
            element = def.domElement || null;
        // Not valid - or was simple. Not that in the case of simple, there should be no innerDom (it's the same with real dom elements).
        if (!tag && !element)
            return dom;

        // Read from element.
        let domProps = (treeNode as MixDOMTreeNodeDOM).domProps;
        if (element) {
            if (element instanceof Element)
                tag = element.tagName.toLowerCase() as DOMTags || "";
            if (!tag)
                return element.textContent || "";
            // Read props from element.
            const elDomProps = HostRender.readFromDOM(def.domElement as Element);
            // Merge the props together - for conflicts use higher preference for what was just read from dom.
            const { className, style, data, ...attributes } = elDomProps;
            if (className)
                domProps.className = domProps.className ? domProps.className + " " + className : className;
            if (style) {
                domProps.style = domProps.style || {};
                for (const prop in style)
                    domProps.style[prop] = style[prop];
            }
            if (data) {
                domProps.data = domProps.data || {};
                for (const prop in data)
                    domProps.data[prop] = data[prop];
            }
            for (const prop in attributes)
                domProps[prop] = attributes[prop];
        }
        // Start tag.
        const { className, style, data, ...attributes } = domProps;
        dom += "<" + tag;
        // Add props.
        // .. Class.
        if (className)
            dom += ' class="' + className + '"';
        // .. Style.
        if (style) {
            let s = "";
            for (const prop in style)
                s += prop + ": " + style[prop] + ";";
            if (s)
                dom += ' style="' + s + '"';
        }
        // .. Data.
        if (data) {
            for (const prop in data)
                dom += ' data-' + HostRender.decapitalizeString(prop, "-") + '="' + data[prop].toString() + '"';
        }
        // .. Other attributes - skipping listeners and special.
        for (const prop in attributes)
            if (!HostRender.LISTENER_PROPS[prop] && !HostRender.SPECIAL_PROPS[prop])
                dom += ' ' + prop + '="' + attributes[prop].toString() + '"';

        // Close the tag.
        if (HostRender.SIMPLE_TAGS[tag])
            dom += "/>";
        else {
            // Close the initial tag.
            dom += ">";
            // Add contents.
            for (const tNode of treeNode.children)
                dom += HostRender.readAsString(tNode);
            // Close the tag.
            dom += '</' + tag + '>';
        }

        return dom;
    }

    /** This returns a suitable virtual item from the structure.
     * - Tries the given vItem, or if used its children.
     * - Can use an optional suggester that can suggest some other virtual item or a direct dom node. 
     *   * Any suggestions (by the callback or our tree structure) must always have matching tag and other some requirements.
     *   * If suggests a virtual item it must fit the structure. If suggests a dom node, it can be from anywhere basically - don't steal from another host.
     * - Can also use an optional validator that should return true to accept, false to not accept. It's the last one in the chain that can say no.
     * - DEV. NOTE. This is a bit SKETCHY.
     */
    public static getTreeNodeMatch(treeNode: MixDOMTreeNodeDOM, vItem: MixDOMHydrationItem | null, vKeyedByTags?: Partial<Record<DOMTags, MixDOMHydrationItem[]>>, excludedNodes?: Set<Node> | null, validator?: MixDOMHydrationValidator | null, suggester?: MixDOMHydrationSuggester | null): MixDOMHydrationItem | Node | null {

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
            for (const item of vItem.used ? vItem.children || [] : [ vItem ] as MixDOMHydrationItem[])
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

    private static isVirtualItemOk(treeNode: MixDOMTreeNodeDOM, item: MixDOMHydrationItem, baseItem: MixDOMHydrationItem | null, validator?: MixDOMHydrationValidator | null): boolean {
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
