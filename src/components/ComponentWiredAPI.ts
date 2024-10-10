
// - Imports - //

// Typing.
import { MixDOMUpdateCompareModesBy } from "../typing";
// Routines.
import { newDef } from "../static/index";
// Helpers.
import { MixDOMContent } from "../common/index";
// Local.
import { ComponentTypeAny } from "./typesVariants";
import { Component } from "./Component";
import { ComponentShadowAPI } from "./ComponentShadowAPI";
// Only typing (local).
import { ComponentWired, ComponentWiredFunc } from "./ComponentWired";


// - Class - //

export class ComponentWiredAPI<
    ParentProps extends Record<string, any> = {},
    BuiltProps extends Record<string, any> = {},
    MixedProps extends Record<string, any> = {},
> extends ComponentShadowAPI<{ props: ParentProps; state: MixedProps; }> {


    // - Members - //

    /** The additional props created by the builder are stored here. */
    public builtProps: BuiltProps | null;

    // Override definition for updated comment.
    /** Default update modes. These will be used for each wired component instance.
     * - Note that we add `{ props: "never" }` as default in the constructor.
     * - This is because we want the update checks to skip props and use the `state` (that we pass as props to the inner component).
     */
    public updateModes?: Partial<MixDOMUpdateCompareModesBy>;

    constructor() {
        super();
        // We use our state for checks. Our props will auto-trigger building a new state.
        // .. If there are changes in state will then pass the state as props for the inner component.
        this.updateModes = { props: "never" };
        this.builtProps = null;
    }


    // - Methods - //

    // Prepare static side.
    /** This is used to get the new props by the builder. It's only used when manually called with .refresh() or when the wired source component (if any) updates. */
    public buildProps(): BuiltProps | null {
        return this.onBuildProps ? this.onBuildProps(this.builtProps) : this.builtProps as BuiltProps;
    }
    /** Get the final mixed props for a component instance of our wired class. */
    public getMixedProps(wired: Component): MixedProps {
        return this.onMixProps ? this.onMixProps(wired.props as ParentProps, this.builtProps as any, wired as any) : { ...wired.props, ...wired.state } as MixedProps;
    }

    /** Call this to manually update the wired part of props and force a refresh.
     * - This is most often called by the static refresh method above, with props coming from the builder / built props. */
    public setProps(builtProps: BuiltProps | null, forceUpdate?: boolean | "all" | "trigger", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
        // No change - but verify that is no forcing in anyhow.
        if (this.builtProps === builtProps && !forceUpdate && forceUpdateTimeout === undefined && forceRenderTimeout === undefined)
            return;
        // Set props to the static class.
        this.builtProps = builtProps;
        // Set state for all.
        this.update(forceUpdate === "trigger" ? false : forceUpdate, forceUpdateTimeout, forceRenderTimeout);
    }

    /** Call this to rebuild the wired part of props and trigger a refresh on the instances.
     * - If the props stay the same, you should set `forceUpdate = "trigger"`, or rather just call `update()` directly if you know there's no builder. */
    public refresh(forceUpdate?: boolean | "all" | "trigger", forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
        this.setProps(this.buildProps(), forceUpdate, forceUpdateTimeout, forceRenderTimeout);
    }

    /** Call this to trigger an update on the instanced components.
     * - This sets the state of each wired components using the getMixedProps method to produce the final mixed props (that will be passed to the renderer component as props). */
    // Note. This is overridden from the parent class implementation to use setState instead of update on the component.
    public update(update: boolean | "all" = true, forceUpdateTimeout?: number | null, forceRenderTimeout?: number | null): void {
        // Set state for all.
        for (const wired of this.components)
            wired.setState(this.getMixedProps(wired as any), update, forceUpdateTimeout, forceRenderTimeout);
    }


    // - Callbacks - //
    
    /** Optional callback to build the common props upon refresh start. These are then fed to the mixer as extra info. */
    public onBuildProps?(lastProps: BuiltProps | null): BuiltProps | null;
    /** Optional callback to build the common props upon refresh start. These are then fed to the mixer as extra info. */
    public onMixProps?(parentProps: ParentProps & {}, buildProps: [this["onBuildProps"]] extends [Function] ? BuiltProps : null, wired: Component<{ props?: ParentProps; }>): MixedProps;

}


// - Create helpers - //

/** Creates a wired component.
 * - The wired component is an intermediary component to help produce extra props to an inner component.
 *      * It receives its parent props normally, and then uses its `state` for the final props that will be passed to the inner component (as its `props`).
 * - About arguments:
 *      1. The optional Builder function builds the common external props for all wired instances. These are added to the component's natural props.
 *      2. The optional Mixer function builds unique props for each wired instance. If used, the common props are fed to it and the output of the mixer instead represents the final props to add.
 *      3. The only mandatory argument is the component to be used in rendering, can be a spread func, too. It's the one that receives the mixed props: from the tree flow and from the wiring source by handled by Mixer and Builder functions.
 *      4. Finally you can also define the name of the component (useful for debugging).
 * - Technically this method creates a component function (but could as well be a class extending Component).
 *      - The important thing is that it's a unique component func/class and it has `api` member that is of `WiredAPI` type (extending `ComponentShadowAPI`).
 *      - When the component is instanced, its static class side contains the same `api` which serves as the connecting interface between the driver and all instances.
 *      - This class can then allow to set and refresh the common props, and trigger should-updates for all the instances and use signals.
 *      - The `WiredAPI` extension contains then features related to the automated mixing of parent props and custom data to produce final state -> inner component props.
 * - Note that when creates a stand alone wired component (not through Component component's .createWired method), you should drive the updates manually by .setProps.
 * - Note. To hook up the new wired component (class/func) to the updates of another component use: `component.addWired(Wired)` and remove with `component.removeWired(Wired)`.
 */
export function createWired<
    ParentProps extends Record<string, any> = {},
    BuiltProps extends Record<string, any> = {},
    MixedProps extends Record<string, any> = ParentProps & BuiltProps,
>(mixer: null, renderer: ComponentTypeAny<{ props: MixedProps; }>, name?: string): ComponentWiredFunc<ParentProps, BuiltProps, MixedProps>;
export function createWired<
    ParentProps extends Record<string, any> = {},
    BuiltProps extends Record<string, any> = {},
    MixedProps extends Record<string, any> = ParentProps & BuiltProps,
    Mixer extends
        (parentProps: ParentProps, buildProps: null, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps =
        (parentProps: ParentProps, buildProps: null, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps
>(mixer: Mixer, renderer: ComponentTypeAny<{ props: MixedProps; }>, name?: string): ComponentWiredFunc<ParentProps, BuiltProps, MixedProps>;
export function createWired<
    ParentProps extends Record<string, any> = {},
    BuiltProps extends Record<string, any> = {},
    MixedProps extends Record<string, any> = ParentProps & BuiltProps,
    Mixer extends
        (parentProps: ParentProps, buildProps: null, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps =
        (parentProps: ParentProps, buildProps: null, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps
>(builder: null, mixer: Mixer, renderer: ComponentTypeAny<{ props: MixedProps; }>, name?: string): ComponentWiredFunc<ParentProps, BuiltProps, MixedProps>;
export function createWired<
    ParentProps extends Record<string, any> = {},
    BuiltProps extends Record<string, any> = {},
    MixedProps extends Record<string, any> = ParentProps & BuiltProps,
    Builder extends (lastProps: BuiltProps | null) => BuiltProps = (lastProps: BuiltProps | null) => BuiltProps,
    Mixer extends
        (parentProps: ParentProps, buildProps: BuiltProps, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps =
        (parentProps: ParentProps, buildProps: BuiltProps, wired: Component<{ props: ParentProps; state: MixedProps; }>) => MixedProps
>(builder: Builder | BuiltProps, mixer: Mixer | null, renderer: ComponentTypeAny<{ props: MixedProps; }>, name?: string): ComponentWiredFunc<ParentProps, BuiltProps, MixedProps>;
export function createWired(...args: any[]): ComponentWiredFunc { 
    // Parse.
    const nArgs = args.length;
    const nameOffset = typeof args[nArgs-1] === "string" ? -1 : 0;
    const builderOrProps = args[nArgs - 3 + nameOffset];
    const mixer = args[nArgs - 2 + nameOffset] || null;
    const renderer = args[nArgs - 1 + nameOffset] as ComponentTypeAny;
    const name = nameOffset ? args[nArgs-1] : renderer.name;
    // Create a component with a custom renderer - it will always use the given renderer as a tag - can be a spread func, component func, component class. (Technically could be any tag, but for purpose and typing.)
    // const Wired = { [name]: class extends Component { render() { return newDef(renderer, { ...this.state }, MixDOMContent); } } }[name] as unknown as ComponentWiredType;
    const Wired = { [name]: function (_initProps: Record<string, any>, wired: ComponentWired) { return newDef(renderer as any, { ...wired.state }, MixDOMContent); } }[name] as ComponentWiredFunc;
    // Set up.
    Wired.api = new ComponentWiredAPI();
    if (builderOrProps) {
        if (typeof builderOrProps === "object")
            Wired.api.builtProps = builderOrProps;
        else if (nArgs > 2 && typeof builderOrProps === "function")
            Wired.api.onBuildProps = builderOrProps;
    }
    if (mixer)
        Wired.api.onMixProps = mixer;
    // Return the wired func.
    return Wired;
}
