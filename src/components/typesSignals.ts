
// - Imports - //

// Only typing (local).
import { ComponentInfo } from "./typesInfo";
import { Component } from "./Component";
import { GetComponentFrom } from "./typesVariants";


// - Component signals - //

export type ComponentSignals<Info extends Partial<ComponentInfo> = {}> = {
    /** Special call - called right after constructing. */
    preMount: () => void;
    /** Callback that is fired after the initial rendering has been done and elements are in the dom. After any further updates onUpdate (and onPreUpdate and onShouldUpdate) are called. */
    didMount: () => void;
    /** This is a callback that will always be called when the component is checked for updates.
     * - Note that this is not called on mount, but will be called everytime on update when it's time to check whether should update or not - regardless of whether will actually update.
     * - This is the perfect place to use Memos to, as you can modify the state immediately and the mods will be included in the current update run. Access the new values in component.props and component.state (new props are set right before, and state read right after).
     *   .. Note that you can also use Memos on the render scope. The only difference is that the render method will be called again immediately after (but likewise included in the same update run). */
    beforeUpdate: () => void;
    /** Callback to determine whether should update or not.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     * - If returns true, component will update. If false, will not.
     * - If returns null (or no onShouldUpdate method assigned), will use the rendering settings to determine.
     * - Note that this is not called every time necessarily (never on mount, and not if was forced).
     * - Note that this is called right before onPreUpdate and the actual update (if that happens).
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before.
     * - Note that due to handling return value, emitting this particular signal is handled a bit differently. If any says true, will update, otherwise will not. */
    shouldUpdate: (
        prevProps: Info["props"] | undefined,
        prevState: Info["state"] | undefined,
    ) => boolean | null;
    /** This is a callback that will always be called when the component is checked for updates. Useful to get a snapshot of the situation.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     * - Note that this is not called on mount, but will be called everytime on update, even if will not actually update (use the 3rd param).
     * - Note that this will be called right after onShouldUpdate (if that is called) and right before the update happens.
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before. */
    preUpdate: (
        prevProps: Info["props"] | undefined,
        prevState: Info["state"] | undefined,
        willUpdate: boolean
    ) => void;
    /** Called after the component has updated and changes been rendered into the dom.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it. */
    didUpdate: (
        prevProps: Info["props"] | undefined,
        prevState: Info["state"] | undefined,
    ) => void;
    /** Called when the component has moved in the tree structure. */
    didMove: () => void;
    /** Called when the component is about to be ungrounded: removed from the tree and dom elements destroyed. */
    willUnmount: () => void;
};

export type ComponentExternalSignalsFrom<
    Info extends Partial<ComponentInfo> = Partial<ComponentInfo>,
    Comp extends Component<any> = Component<Info>,
    CompSignals extends Record<string, (...args: any[]) => any | void> = ComponentSignals<Info> & Info["signals"]
> =
    { [SignalName in keyof CompSignals]: (comp: Comp & Info["class"], ...params: Parameters<CompSignals[SignalName]>) => ReturnType<CompSignals[SignalName]> };

export type ComponentExternalSignals<Comp extends Component = Component> = {
    /** Special call - called right after constructing the component instance. */
    preMount: (component: Comp) => void;
    /** Callback that is fired after the initial rendering has been done and elements are in the dom. After any further updates onUpdate (and onPreUpdate and onShouldUpdate) are called. */
    didMount: (component: Comp) => void;
    /** This is a callback that will always be called when the component is checked for updates.
     * - Note that this is not called on mount, but will be called everytime on update when it's time to check whether should update or not - regardless of whether will actually update.
     * - This is the perfect place to use Memos to, as you can modify the state immediately and the mods will be included in the current update run. Access the new values in component.props and component.state.
     *   .. Note that you can also use Memos on the render scope. The only difference is that the render method will be called again immediately after (but likewise included in the same update run). */
    beforeUpdate: (component: Comp) => void;
    /** Callback to determine whether should update or not.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     * - If returns true, component will update. If false, will not.
     * - If returns null (or no onShouldUpdate method assigned), will use the rendering settings to determine.
     * - Note that this is not called every time necessarily (never on mount, and not if was forced).
     * - Note that this is called right before onPreUpdate and the actual update (if that happens).
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before.
     * - Note that due to handling return value, emitting this particular signal is handled a bit differently. If any says true, will update, otherwise will not. */
    shouldUpdate: (component: Comp,
        prevProps: (Comp["constructor"]["_Info"] & {props?: {}})["props"],
        prevState: (Comp["constructor"]["_Info"] & {state?: {}})["state"]
    ) => boolean | null;
    /** This is a callback that will always be called when the component is checked for updates. Useful to get a snapshot of the situation.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     * - Note that this is not called on mount, but will be called everytime on update, even if will not actually update (use the 3rd param).
     * - Note that this will be called right after onShouldUpdate (if that is called) and right before the update happens.
     * - Note that by this time all the data has been updated already. So use preUpdates to get what it was before. */
    preUpdate: (component: Comp,
        prevProps: (Comp["constructor"]["_Info"] & {props?: {}})["props"],
        prevState: (Comp["constructor"]["_Info"] & {state?: {}})["state"],
        willUpdate: boolean
    ) => void;
    /** Called after the component has updated and changes been rendered into the dom.
     * - If there were no change in props, prevProps is undefined. Likewise prevState is undefined without changes in it.
     */
    didUpdate: (component: Comp,
        prevProps: (Comp["constructor"]["_Info"] & {props?: {}})["props"],
        prevState: (Comp["constructor"]["_Info"] & {state?: {}})["state"],
    ) => void;
    /** Called when the component has moved in the tree structure. */
    didMove: (component: Comp) => void;
    /** Called when the component is about to be ungrounded: removed from the tree and dom elements destroyed. */
    willUnmount: (component: Comp) => void;
};
