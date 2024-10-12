
// - Imports - //

// Libraries.
import { callListeners, SignalListener, SignalListenerFlags, SignalBoy, SignalBoyType } from "data-signals";
import { DOMDiffProps } from "dom-types";
// Typing.
import { MixDOMTreeNode, MixDOMContentSimple } from "../typing";
// Routines.
import { rootDOMTreeNodes } from "../static/index";
// Only typing (distant).
import { ContentBoundary } from "../boundaries/ContentBoundary";
import { ComponentExternalSignalsFrom } from "../components/typesSignals";
import { Component, ComponentInstance, ComponentTypeEither } from "../components/Component";
import { ReadComponentInfo } from "../components";


// - Types - //

export type RefDOMSignals<Type extends Node = Node> = {
    /** Called when a ref is about to be attached to a dom element. */
    domDidAttach: (domNode: Type) => void;
    /** Called when a ref is about to be detached from a dom element. */
    domWillDetach: (domNode: Type) => void;
    /** Called when a reffed dom element has been mounted: rendered into the dom for the first time. */
    domDidMount: (domNode: Type) => void;
    /** Called when a reffed dom element updates (not on the mount run). */
    domDidUpdate: (domNode: Type, diffs: DOMDiffProps) => void;
    /** Called when the html content of a dom element has changed. */
    domDidContent: (domNode: Type, simpleContent: MixDOMContentSimple | null) => void;
    /** Called when a reffed dom element has been moved in the tree. */
    domDidMove: (domNode: Type, fromContainer: Node | null, fromNextSibling: Node | null) => void;
    /** Return true to salvage the element: won't be removed from dom.
     * This is only useful for fade out animations, when the parenting elements also stay in the dom (and respective children). */
    domWillUnmount: (domNode: Type) => boolean | void;
};
export type RefComponentSignals<Type extends ComponentTypeEither = ComponentTypeEither, Instance extends ComponentInstance<Type> = ComponentInstance<Type>> = {
    /** Called when a ref is about to be attached to a component. */
    didAttach: (component: Type) => void;
    /** Called when a ref is about to be detached from a component. */
    willDetach: (component: Type | ContentBoundary) => void;
} & ([Instance] extends [Component] ? ComponentExternalSignalsFrom<ReadComponentInfo<Instance>> : {});
export type RefSignals<Type extends Node | ComponentTypeEither = Node | ComponentTypeEither> = [Type] extends [Node] ? RefDOMSignals<Type> : [Type] extends [ComponentTypeEither] ? RefComponentSignals<Type> : RefDOMSignals<Type & Node> & RefComponentSignals<Type & ComponentTypeEither>;

export interface RefBase {
    signals: Partial<Record<string, SignalListener[]>>;
    treeNodes: Set<MixDOMTreeNode>;
    getTreeNode(): MixDOMTreeNode | null;
    getTreeNodes(): MixDOMTreeNode[];
    getElement(onlyForDOMRefs?: boolean): Node | null;
    getElements(onlyForDOMRefs?: boolean): Node[];
    getComponent(): Component | null;
    getComponents(): Component[];
}
export interface RefType<Type extends Node | ComponentTypeEither = Node | ComponentTypeEither> extends SignalBoyType<RefSignals<Type>> {
    new (): Ref<Type>;
    MIX_DOM_CLASS: string; // "Ref";
    /** Internal call tracker. */
    onListener(instance: RefBase & SignalBoy<RefSignals<Type>>, name: string, index: number, wasAdded: boolean): void;
    /** Internal flow helper to call after attaching the ref. Static to keep the class clean. */
    didAttachOn(ref: RefBase, treeNode: MixDOMTreeNode): void;
    /** Internal flow helper to call right before detaching the ref. Static to keep the class clean. */
    willDetachFrom(ref: RefBase, treeNode: MixDOMTreeNode): void;
}


// - Class - //

/** Class to help keep track of components or DOM elements in the state based tree. */
export class Ref<Type extends Node | ComponentTypeEither = Node | ComponentTypeEither> extends SignalBoy<RefSignals<Type>> {


    // - Static - //

    public static MIX_DOM_CLASS = "Ref";


    // - Members & Init - //

    /** The collection (for clarity) of tree nodes where is attached to.
     * It's not needed internally but might be useful for custom needs. */
    public treeNodes: Set<MixDOMTreeNode>;

    constructor(...args: any[]) {
        // Parent.
        super(...args);
        // Init.
        this.treeNodes = new Set();
    }


    // - Getters - //

    /** This returns the last reffed treeNode, or null if none.
     * - The MixDOMTreeNode is a descriptive object attached to a location in the grounded tree. Any tree node can be targeted by refs.
     * - The method works as if the behaviour was to always override with the last one.
     * - Except that if the last one is removed, falls back to earlier existing. */
    public getTreeNode(): MixDOMTreeNode | null {
        return [...this.treeNodes][this.treeNodes.size - 1] || null;
    }
    /** This returns all the currently reffed tree nodes (in the order added). */
    public getTreeNodes(): MixDOMTreeNode[] {
        return [...this.treeNodes];
    }
    /** This returns the last reffed domNode, or null if none.
     * - The method works as if the behaviour was to always override with the last one.
     * - Except that if the last one is removed, falls back to earlier existing. */
    public getElement(onlyForDOMRefs: boolean = false): [Type] extends [Node] ? Type | null : Node | null {
        let i = this.treeNodes.size - 1;
        const treeNodes = [...this.treeNodes];
        while (i >= 0) {
            const treeNode = treeNodes[i];
            if (treeNode.domNode && (!onlyForDOMRefs || treeNode.type === "dom"))
                return treeNode.domNode as Type & Node;
        }
        return null;
    }
    /** This returns all the currently reffed dom nodes (in the order added). */
    public getElements(onlyForDOMRefs: boolean = false): [Type] extends [Node] ? Type[] : Node[] {
        let nodes: Array<Type & Node> = [];
        for (const treeNode of this.treeNodes) {
            if (!treeNode.domNode)
                continue;
            if (treeNode.type === "dom")
                nodes.push(treeNode.domNode as (Type & Node));
            else if (!onlyForDOMRefs)
                nodes = nodes.concat(rootDOMTreeNodes(treeNode, true).map(tNode => tNode.domNode as (Type & Node)));
        }
        return nodes;
    }
    /** This returns the last reffed component, or null if none.
     * - The method works as if the behaviour was to always override with the last one.
     * - Except that if the last one is removed, falls back to earlier existing. */
    public getComponent(): [Type] extends [Node] ? Component | null : [Type] extends [ComponentTypeEither] ? ComponentInstance<Type> : Component | null {
        const lastRef = [...this.treeNodes][this.treeNodes.size - 1];
        return (lastRef && lastRef.type === "boundary" && lastRef.boundary?.component as Component || null) as any;
    }
    /** This returns all the currently reffed components (in the order added). */
    public getComponents(): [Type] extends [Node] ? Component[] : [Type] extends [ComponentTypeEither] ? ComponentInstance<Type>[] : Component[] {
        const components: Component[] = [];
        for (const treeNode of this.treeNodes)
            if (treeNode.type === "boundary" && treeNode.boundary?.component)
                components.push(treeNode.boundary.component);
        return components as any[];
    }


    // - Static extension (pass listeners to components) - //
    
    /** The onListener callback is required by Ref's functionality for connecting signals to components fluently. */
    public static onListener(ref: RefBase & SignalBoy<RefSignals>, name: string & keyof RefSignals, index: number, wasAdded: boolean): void {
        // Add our only listener, using the callback as the key.
        if (ref.treeNodes.size && ref.signals[name]) {
            const listener: SignalListener = ref.signals[name]![index];
            const callback = listener[0];
            // Add our only listener, using the callback as the key.
            if (wasAdded)
                for (const component of ref.getComponents())
                    (component as Component).listenTo(name as any, (...args: any[]) => listener[1] ? callback(component, ...args, ...listener[1]) : callback(component, ...args), null, listener[2], callback);
            // Remove our listener, using the callback as the groupId.
            else
                for (const component of ref.getComponents())
                    component.unlistenTo(name as any, callback);
        }
    }


    // - Static ref helpers - //

    /** Internal flow helper to call after attaching the ref. Static to keep the class clean. */
    public static didAttachOn(ref: RefBase, treeNode: MixDOMTreeNode): void {
        // Already mounted.
        if (ref.treeNodes.has(treeNode))
            return;
        // Add.
        ref.treeNodes.add(treeNode);
        // Call.
        if (treeNode.type === "boundary") {
            // Add listeners.
            const component = treeNode.boundary?.component;
            for (const name in ref.signals) {
                for (const listener of ref.signals[name]!) {
                    const [callback, extraArgs, flags] = listener as [callback: (...args: any[]) => any, extraArgs: any[] | null, flags: SignalListenerFlags, groupId: any | null, origListeners?: SignalListener[] ];
                    component.listenTo(name as any, (...args: any[]) => extraArgs ? callback(component, ...args, ...extraArgs) : callback(component, ...args), null, flags, callback);
                }
            }
            // Call.
            if (component && ref.signals.didAttach)
                callListeners(ref.signals.didAttach, [component]);
        }
        else if (treeNode.type === "dom" && treeNode.domNode) {
            if (ref.signals.domDidAttach)
                callListeners(ref.signals.domDidAttach, [treeNode.domNode]);
        }
    }

    /** Internal flow helper to call right before detaching the ref. Static to keep the class clean. */
    public static willDetachFrom(ref: RefBase, treeNode: MixDOMTreeNode): void {
        // Call, if was mounted.
        if (ref.treeNodes.has(treeNode)) {
            // Component.
            if (treeNode.type === "boundary") {
                const component = treeNode.boundary?.component;
                if (component) {
                    // Call.
                    if (ref.signals.willDetach)
                        callListeners(ref.signals.willDetach, [component]);
                    // Remove listeners by using the original callback as the groupId.
                    for (const name in ref.signals)
                        for (const listener of ref.signals[name]!)
                            component.unlistenTo(name as any, listener[0]);
                }
            }
            // Dom.
            else if (treeNode.type === "dom" && treeNode.domNode) {
                if (ref.signals.domWillDetach)
                    callListeners(ref.signals.domWillDetach, [treeNode.domNode]);
            }
        }
        // Remove.
        ref.treeNodes.delete(treeNode);
    }

}
