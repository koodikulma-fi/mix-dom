
// - Imports - //

// Library.
import { ContextsAllType, SetLike } from "data-signals";
import { DOMTags } from "dom-types";
// Typing.
import {
    MixDOMTreeNode,
    MixDOMRenderInfo,
    MixDOMRenderOutput,
    MixDOMTreeNodeType,
    MixDOMTreeNodeDOM,
    MixDOMTreeNodeBoundary,
    MixDOMAssimilateSuggester,
    MixDOMAssimilateValidator,
    MixDOMUpdateCompareModesBy,
    MixDOMTreeNodeHost,
    MixDOMDefBoundary,
    MixDOMDefApplied,
    MixDOMDefTarget,
} from "../typing";
// Routines.
import { domElementByQuery, domElementsByQuery, newAppliedDef, rootDOMTreeNodes, treeNodesWithin } from "../static/index";
// Boundaries.
import { SourceBoundary } from "../boundaries/index";
// Local.
import { HostShadowAPI } from "./HostShadowAPI";
import { HostContextAPI } from "./HostContextAPI";
import { HostServices } from "./HostServices";
// Only typing (distant).
import { ComponentTypeAny } from "../components/typesVariants";
import { ComponentCtx } from "../components/ComponentContextAPI";
import { HostRender } from "./HostRender";


// - Typing - //

/** The basic dom node cloning modes - either deep or shallow: element.clone(mode === "deep").
 * - If in "always" then is deep, and will never use the original. */
export type MixDOMCloneNodeBehaviour = "deep" | "shallow" | "always";
export type MixDOMRenderTextTagCallback = (text: string | number) => Node | null;
export type MixDOMRenderTextContentCallback = (text: string | number) => string | number;
export type MixDOMRenderTextTag = DOMTags | "" | MixDOMRenderTextTagCallback;


// - Types - //

export interface HostType<Contexts extends ContextsAllType = {}> {
    /** Used for host based id's. To help with sorting fluently across hosts. */
    idCount: number;
    new (content?: MixDOMRenderOutput, domContainer?: Node | null, settings?: HostSettingsUpdate | null): Host<Contexts>;
    modifySettings(baseSettings: HostSettings, newSettings: HostSettingsUpdate): void;
    getDefaultSettings(): HostSettings;
}

export interface HostSettingsUpdate extends Partial<Omit<HostSettings, "updateComponentModes">> {
    updateComponentModes?: Partial<HostSettings["updateComponentModes"]>;
}

/** Settings for MixDOM behaviour for all inside a host instance.
 * The settings can be modified in real time: by host.updateSettings(someSettings) or manually, eg. host.settings.updateTimeout = null. */
export interface HostSettings {
    
	/** If is null, then is synchronous. Otherwise uses the given timeout in ms. Defaults to 0ms.
     * - This timeout delays the beginning of the update process.
     *   * After the timeout has elapsed, .render() is called on components and a new structure is received.
     *   * The structure is then applied to the component, and for any nested components similarly .render() is called and then the defs applied recursively.
     *   * Finally, the process outputs a list of render callbacks to apply the related dom changes. Executing the changes can be delayed with the 2nd timeout: settings.renderTimeout.
     * - Note. Generally this helps to combine multiple updates together and thus prevent unnecessary updates.
     *   * This is useful if (due to complex app setup) you sometimes end up calling update multiple times for the same component.
     *     .. Without this, the update procedure would go through each time (and if rendering set to null, it as well).
     *     .. But with this, the updates get clumped together. For example, updating immediately after startup will not result in onUpdate, but only one onMount.
     * - Recommended usage for updateTimeout & renderTimeout:
     *   * For most cases, use updateTimeout: 0 and renderTimeout: 0 or null. Your main code line will run first, and rendering runs after (sync or async).
     *   * If you want synchronous updates on your components, use updateTimeout: null, renderTimeout: 0 - so updates are done before your main code line continues, but dom rendering is done after.
     *     .. In this case also consider putting useImmediateCalls to true.
     *   * If you want everything to be synchronous (including the dom), put both to null. */
    updateTimeout: number | null;

    /** If is null, then is synchronous. Otherwise uses the given timeout in ms. Defaults to 0ms.
     * - This timeout delays the actual dom rendering part of the component update process.
     * - It's useful to have a tiny delay to save from unnecessary rendering, when update gets called multiple times - even 0ms can help.
     * - Only use null renderTimeout (= synchronous rendering after updateTimeout) if you really want rendering to happen immediately after update.
     *     * Typically, you then also want the updateTimeout to be null (synchronous), so you get access to your dom elements synchronously.
     * - Note that renderTimeout happens after updateTimeout, so they both affect how fast rendering happens - see settings.updateTimeout for details. */
    renderTimeout: number | null;

    /** The lifecycle calls (onMount, onUpdate, ...) are collected (together with render infos) and called after the recursive update process has finished.
     * - This option controls whether the calls are made immediately after the update process or only after the (potentially delayed) rendering.
     * - Keep this as false, if you want the components to have their dom elements available upon onMount - like in React. (Defaults to false.)
     * - Put this to true, only if you really want the calls to be executed before the rendering happens.
     *     * If you combine this with updateTimeout: null, then you get synchronously updated state, with only rendering delayed.
     *     * However, you won't have dom elements on mount. To know when that happens should use refs or signals and .domDidMount and .domWillUnmount callbacks. */
    useImmediateCalls: boolean;

    /** Defines what components should look at when doing onShouldUpdate check for "props" and "state". */
    updateComponentModes: MixDOMUpdateCompareModesBy;

    /** Whether does a equalDOMProps check on the updating process.
     * - If true: Only adds render info (for updating dom props) if there's a need for it.
     * - If false: Always adds render info for updating dom elements. They will be diffed anyhow.
     * - If "if-needed": Then marks to be updated if had other rendering needs (move or content), if didn't then does equalDOMProps check. (So that if no need, don't mark render updates at all.)
     * Note that there is always a diffing check before applying dom changes, and the process only applies changes from last set.
     * .. In other words, this does not change at all what gets applied to the dom.
     * .. The only thing this changes, is whether includes an extra equalDOMProps -> boolean run during the update process.
     * .. In terms of assumed performance:
     * .... Even though equalDOMProps is an extra process, it's a bit faster to run than collecting diffs and in addition it can stop short - never add render info.
     * .... However, the only time it stops short is for not-equal, in which case it also means that we will anyway do the diff collection run later on.
     * .... In other words, it's in practice a matter of taste: if you want clean renderinfos (for debugging) use true. The default is "if-needed". */
    preCompareDOMProps: boolean | "if-needed";

    /** The maximum number of times a boundary is allowed to be render during an update due to update calls during the render func.
     * .. If negative, then there's no limit. If 0, then doesn't allow to re-render. The default is 1: allow to re-render once (so can render twice in a row).
     * .. If reaches the limit, stops re-rendering and logs a warning if devLogToConsole has .Warnings on. */
    maxReRenders: number;

    /** Which element (tag) to wrap texts (from props.children) into.
     * - By default, no wrapping is applied: treats texts as textNodes (instanceof Node).
     * - You can also pass in a callback to do custom rendering - should return a Node, or then falls back to textNode. */
    renderTextTag: MixDOMRenderTextTag;

    /** Tag to use for as a fallback when using the MixDOM.defHTML feature (that uses .innerHTML on a dummy element). Defaults to "span".
     * - It only has meaning, if the output contains multiple elements and didn't specifically define the container tag to use. */
    renderHTMLDefTag: DOMTags;

    /** If you want to process the simple content text, assign a callback here. */
    renderTextHandler: MixDOMRenderTextContentCallback | null;

    /** This defines how MixDOM will treat "simple content". The options are:
     *     1. When set to false (default), renders everything except null and undefined. (Other values are stringified.)
     *     2. When set to true, renders only values that doesn't amount to !!false. So skips: false and 0 as well.
     *     3. Third option is to give an array of values that should never be rendered.
     * Technical notes:
     *     - Regardless of the setting, MixDOM will always skip simple content of `null` and `undefined` (already at the static def creation level).
     *     - This setting applies as early as possible in the non-static side of process (in pairDefs routine).
     *     - How it works is that it will actually go and modify the target def by removing any unwanted child, before it would be paired.
     */
    noRenderValuesMode: boolean | any[];

    /** For svg content, the namespaceURI argument to be passed into createElementNS(namespaceURI, tag).
     * If empty, hard coded default is: "http://www.w3.org/2000/svg"
     */
    renderSVGNamespaceURI: string;

    /** When using MixDOM.Element to insert nodes, and swaps them, whether should apply (true), and if so whether should read first ("read").
     * Defaults to true, which means will apply based on scratch, but not read before it. */
    renderDOMPropsOnSwap: boolean | "read";

    /** This is useful for server side functionality. (Defaults to false, as most of the times you're using MixDOM on client side.)
     * - Put this to true, to disable the rendering aspects (will pause the dedicated HostRender instance). Instead use host.readDOMString() or MixDOM.readDOMString(treeNode) to get the html string.
     * - Note that you might want to consider putting settings.renderTimeout to null, so that the dom string is immediately renderable after the updates. */
    disableRendering: boolean;

    /** This is useful for nesting hosts.
     * - Put this to true to make nested but not currently grounded hosts be unmounted internally.
     * - When they are grounded again, they will mount and rebuild their internal structure from the rootBoundary up. */
    onlyRunInContainer: boolean;

    /** When pairing defs for reusing, any arrays are dealt as if their own key scope by default.
     * - By setting this to true, wide key pairing is allowed for arrays as well.
     * - Note that you can always use {...myArray} instead of {myArray} to avoid this behaviour (even wideKeysInArrays: false).
     *   .. In other words, if you do not want the keys in the array contents to mix widely, keep it as an array - don't spread it. */
    wideKeysInArrays: boolean;

    /** Default behaviour for handling duplicated instances of dom nodes.
     * - The duplication can happen due to manually inserting many, or due to multiple content passes, copies.
     * - The detection is host based and simply based on whether the element to create was already grounded or not.
     */
    duplicateDOMNodeBehaviour: MixDOMCloneNodeBehaviour | "";
    /** Custom handler for the duplicateDOMNodeBehaviour. */
    duplicateDOMNodeHandler: ((domNode: Node, treeNode: MixDOMTreeNodeDOM) => Node | null) | null;
    /** Whether this host can be auto-duplicated when included dynamically multiple times. Defaults to false.
     * - Can also be a callback that returns a boolean (true to include, false to not), or a new host.
     * - Note that if uses a custom Host class, the new duplicate will be made from the normal Host class. Use the callback to provide manually.
     * - The treeNode in the arguments defines where would be inserted. */
    duplicatableHost: boolean | ((host: Host, treeNode: MixDOMTreeNodeHost) => Host | boolean | null);

    /** For weird behaviour. */
    devLogWarnings: boolean;

}


// - Class - //

/** The main class to orchestrate and start rendering in MixDOM. */
export class Host<Contexts extends ContextsAllType = {}> {

    
    // - Static - //
    
    public static MIX_DOM_CLASS = "Host";
    public static idCount = 0;

    ["constructor"]: HostType<Contexts>;

    
    // - Members - //

    /** This represents abstractly what the final outcome looks like in dom. */
    public groundedTree: MixDOMTreeNode;
    /** The root boundary that renders whatever is fed to the host on .update or initial creation. */
    public rootBoundary: SourceBoundary;
    /** The general settings for this host instance.
     * - Do not modify directly, use the .modifySettings method instead.
     * - Otherwise rendering might have old settings, or setting.onlyRunInContainer might be uncaptured. */
    public settings: HostSettings;
    /** Internal services to keep the whole thing together and synchronized.
     * They are the semi-private internal part of Host, so separated into its own class. */
    services: HostServices;

    /** This is used for duplicating hosts. It's the very same instance for all duplicated (and their source, which can be a duplicated one as well). */
    public shadowAPI: HostShadowAPI<Contexts>;
    /** This provides the data and signal features for this Host and all the Components that are part of it.
     * - You can use .contextAPI directly for external usage.
     * - When using from within components, it's best to use their dedicated methods (for auto-disconnection features). */
    public contextAPI: HostContextAPI<Contexts>;
    /** This contains all the components that have a contextAPI assigned. Automatically updated, used internally. The info can be used for custom purposes (just don't modify). */
    public contextComponents: Set<ComponentCtx>;


    // - Init - //

    constructor(content?: MixDOMRenderOutput, domContainer?: Element | null, settings?: HostSettingsUpdate | null, contexts?: Contexts | null, shadowAPI?: HostShadowAPI | null) {


        // - Initialize - //

        // Static.
        this.constructor.idCount++;

        // Initialize.
        // .. ShadowAPI.
        this.shadowAPI = shadowAPI || new HostShadowAPI();
        this.contextComponents = new Set();
        // .. ContextAPI.
        this.contextAPI = new HostContextAPI();
        this.contextAPI.host = this;
        if (contexts)
            this.contextAPI.setContexts(contexts as any, false, true); // Don't call, but mark the initial ones as permanent.
        
        // .. And groundedTree.
        this.groundedTree = {
            type: "root",
            parent: null,
            children: [],
            domNode: domContainer || null,
            sourceBoundary: null
        };

        // .. And then settings.
        this.settings = Host.getDefaultSettings();
        if (settings)
            Host.modifySettings(this.settings, settings);

        // .. And then services - to initialize HostRender class with proper refs.
        this.services = new HostServices(this);


        // - Start up - //

        // Create root component with the first content.
        const Root = this.services.createRoot(content);
        // Create base tree node for the root boundary.
        const sourceDef = newAppliedDef({ MIX_DOM_DEF: "boundary", tag: Root as any, props: {}, childDefs: [] }, null) as MixDOMDefApplied & MixDOMDefBoundary;
        const treeNode: MixDOMTreeNodeBoundary = {
            type: "boundary",
            def: sourceDef,
            sourceBoundary: null,
            // For type clarity, we define (for typescript) that treeNode always has a boundary.
            // .. However, we always instance it with the treeNode, so it's impossible.
            // .. But it will be set right after instancing (here and in _Apply). Hence, the weird typescripting here.
            boundary: null as unknown as SourceBoundary,
            parent: this.groundedTree,
            children: [],
            domNode: null
        };
        this.groundedTree.children.push(treeNode);
        // Create boundary.
        this.rootBoundary = new SourceBoundary(this, sourceDef, treeNode);
        treeNode.boundary = this.rootBoundary;
        this.rootBoundary.reattach();
        // Run updates.
        this.services.absorbUpdates(this.rootBoundary, {});
    }


    // - Root methods - //

    /** Clear whatever has been previously rendered - destroys all boundaries inside the rootBoundary. */
    public clearRoot(update: boolean = true, updateTimeout?: number | null, renderTimeout?: number | null): void {
        // Clear.
        this.services.clearRoot(true);
        // Update.
        if (update)
            this.rootBoundary.update(true, updateTimeout, renderTimeout);
    }
    /** Move the host root into another dom container. */
    public moveRoot(newParent: Node | null, renderTimeout?: number | null): void {
        // Already there.
        if (this.groundedTree.domNode === newParent)
            return;
        // Update.
        this.groundedTree.domNode = newParent;
        // Create render infos.
        const renderInfos = rootDOMTreeNodes(this.rootBoundary.treeNode, true).map(treeNode => ({ treeNode, move: true }) as MixDOMRenderInfo);
        // Trigger render.
        if (renderInfos[0] || (renderTimeout !== undefined))
            this.services.absorbChanges(renderInfos, null, renderTimeout);
    }
    /** Update the previously render content with new render output definitions. */
    public updateRoot(content: MixDOMRenderOutput, updateTimeout?: number | null, renderTimeout?: number | null): void {
        this.services.updateRoot(content, updateTimeout, renderTimeout);
    }
    /** Triggers an update on the host root, optionally forcing it. This is useful for refreshing the container. */
    public refreshRoot(forceUpdate: boolean = false, updateTimeout?: number | null, renderTimeout?: number | null): void {
        this.services.refreshRoot(forceUpdate, updateTimeout, renderTimeout);
    }


    // - Refreshing - //

    /** Triggers a process that refreshes the dom nodes based on the current state.
     * - In case forceDOMRead is on will actually read from dom to look for real changes to be done.
     * - Otherwise just reapplies the situation - as if some updates had not been done.
     * - Note. This is a partly experimental feature - it's not assumed to be used in normal usage. */
    public refreshDOM(forceDOMRead: boolean = false, renderTimeout?: number | null): void {
        // Go through the MixDOMTreeNode structure and refresh each.
        const refresh = forceDOMRead ? "read" : true;
        const renderInfos: MixDOMRenderInfo[] = [];
        let nextNodes = [...this.groundedTree.children] as MixDOMTreeNodeDOM[];
        let treeNode: MixDOMTreeNodeDOM | undefined;
        let i = 0;
        while (treeNode = nextNodes[i]) {
            // Next.
            i += 1;
            // If describes a dom node.
            if (treeNode.domProps) {
                treeNode
                renderInfos.push({
                    treeNode,
                    refresh,
                });
            }
            // Add to loop.
            if (treeNode.children[0]) {
                nextNodes = treeNode.children.concat(nextNodes.slice(i)) as MixDOMTreeNodeDOM[];
                i = 0;
            }
        }
        // Render.
        this.services.absorbChanges(renderInfos, null, renderTimeout);
    }
    
    // Overridden.
    /** This triggers a refresh and returns a promise that is resolved when the update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately. 
     * - Note that this uses the signals system, so the listener is called among other listeners depending on the adding order.
     */
    public afterRefresh(renderSide: boolean = false, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void> {
        return new Promise<void>(resolve => this.afterRefreshCall(resolve, renderSide, updateTimeout, renderTimeout));
    }

    /** Update the refresh times without triggering update. Not however that if updates updateTimeout to `null`, will trigger the update cycle instantly if was pending. */
    public updateRefreshTimes(updateTimeout?: number | null, renderTimeout?: number | null): void {
        this.services.updateRefreshTimes(updateTimeout, renderTimeout);
    }

    /** This is like afterRefresh but works with a callback, given as the first arg. (This is the core method for the feature.)
     * - Triggers a refresh and calls the callback once the update / render cycle is completed.
     * - If there's nothing pending, then will call immediately. 
     * - Note that this uses the signals system, so the listener is called among other listeners depending on the adding order.
     */
    public afterRefreshCall(callback: () => void, renderSide: boolean = false, updateTimeout?: number | null, renderTimeout?: number | null): void {
        // No pending - call immediately.
        if (!this.services.hasPending(true, renderSide))
            callback();
        // Add a listener and trigger refresh.
        else {
            // Add to refresh wait.
            this.addRefreshCall(callback, renderSide);
            // Trigger updates.
            this.services.triggerRefresh(updateTimeout, renderTimeout);
        }
    }

    /** This adds a one-shot callback to the refresh cycle (update / render) - without triggering refresh. (So like afterRefreshCall but without refreshing.) */
    public addRefreshCall(callback: () => void, renderSide: boolean = false): void {
        // Add to the promise.
        this.services.addRefreshCall(callback, renderSide);
    }
    
    /** Trigger refreshing the host's pending updates and render changes. */
    public triggerRefresh(updateTimeout?: number | null, renderTimeout?: number | null): void {
        this.services.triggerRefresh(updateTimeout, renderTimeout);
    }


    // - Pausing & reassimilation - //

    /** Pause the rendering. Resume it by calling resume(), reassimilate() or reassimilateWith(). */
    public pause(): void {
        this.services.renderer.pause();
    }
    /** Resume rendering - triggers reassimilation. */
    public resume(): void {
        this.services.renderer.resume();
    }
    /** Tells whether the rendering is currently paused or not. */
    public isPaused(): boolean {
        return this.services.renderer.paused;
    }
    /** Reassimilates actual (unknown) dom elements into existing state of the Host (= its treeNode/def structure from the root down) without remounting.
     * - The method supports reusing custom DOM elements from within the given "container" element - it should be the element that _contains_ the Host's root element. (Defaults to the Host's container element.)
     * - The method also resumes rendering if was paused - unless is disableRendering is set to true in host settings.
     *      * Works internally by: 1. pause, 2. update, 3. resume & reassimilate.
     *      * Note that this is different from the `remount` flow, even though both use the same core methods (and has thus very similar arguments).
     * @param container Optionally define the container for assimilation. If none given defaults to the `host.groundedTree.domNode`.
     * @param readFromDOM Re-reads the current dom props from the existing ones as well. Defaults to false.
     *      - Note that unlike in `remount` flow, any text content will always be re-updated - so readFromDOM only affects pre-reading attributes here.
     * @param smuggleMode Allows to replace existing elements with better ones from the container (instead of reusing what components have) - otherwise only tries to fill missing ones. Defaults to false.
     * @param removeUnused Remove the other unused DOM elements found in the container. Defaults to false. Note. This can be a bit dangerous.
     * @param validator Can veto any DOM element from being used. Return true to accept, false to not accept.
     * @param suggester Can be used to suggest better DOM elements in a custom fashion. Should return a DOM Node, MixDOMAssimilateItem or null.
     * 
     * 
     * ```
     * 
     * // - Example to showcase the core feature (not practical) - //
     * 
     * // Get container and read DOM output as a string.
     * const elContainer = host.getContainerElement();
     * 
     * // After the line below, the DOM is gone. (Assuming the host had a container element.)
     * // .. However, our host and components are still alive, though unaware of this external destruction.
     * if (elContainer)
     *     elContainer.innerHTML = "";
     * 
     * // After the line below, the DOM has been recreated - or actually only the root element moved back.
     * // .. The other elements are also evaluated for updates, but likely nothing needed.
     * // .. Note that the component life cycles remain unaffected, though of course Ref calls and such are triggered.
     * host.reassimilate(); // Could also feed (elContainer) here. Same as default 1st arg.
     * 
     * // We could actually put some DOM elements in and call `host.reassimilate(elContainer, true, true)`.
     * // .. This would try to smuggle the DOM elements (2nd true), and read info from them (1st true).
     *
     * ```
     */
    public reassimilate(container: Node | null = null, readFromDOM: boolean = false, smuggleMode: boolean = false, removeUnused: boolean = false, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): void {
        // Reassimilate (and resume).
        this.services.renderer.reassimilate(container || this.groundedTree.domNode, readFromDOM, smuggleMode, removeUnused, validator, suggester);
    }
    /** This accepts new render content to update the groundedTree first and then reassimilates accordingly.
     * - Functions synchronously, so applies all updates and rendering immediately, and resumes paused rendering.
     * - See `reassimilate` method for more information.
     * @param content Define the new render content to update the groundedTree with.
     * @param container Optionally define the container for assimilation. If none given defaults to the `host.groundedTree.domNode`.
     * @param readFromDOM Re-reads the current dom props from the existing ones as well. Defaults to false.
     *      - Note that unlike in `remount` flow, any text content will always be re-updated - so readFromDOM only affects pre-reading attributes here.
     * @param smuggleMode Allows to replace existing elements with better ones from the container (instead of reusing what components have) - otherwise only tries to fill missing ones. Defaults to false.
     * @param removeUnused Remove the other unused DOM elements found in the container. Defaults to false. Note. This can be a bit dangerous.
     * @param validator Can veto any DOM element from being used. Return true to accept, false to not accept.
     * @param suggester Can be used to suggest better DOM elements in a custom fashion. Should return a DOM Node, MixDOMAssimilateItem or null.
     */
    public reassimilateWith(content: MixDOMRenderOutput, container: Node | null = null, readFromDOM: boolean = false, smuggleMode: boolean = false, removeUnused: boolean = false, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): void {
        // Pause rendering.
        this.pause();
        // Update immediately.
        this.updateRoot(content, null, null);
        // Resume by reassimilation.
        this.services.renderer.reassimilate(container || this.groundedTree.domNode, readFromDOM, smuggleMode, removeUnused, validator, suggester);
    }

    /** Remounts the whole Host, optionally assimilating the DOM structure found inside the given container element.
     * - The assimilation part comes in when mounting the DOM elements, as can reuse/smuggle/assimilate the DOM nodes from the container.
     * - Extra notes:
     *      * If you're using data in Contexts to drive your app state, you will likely end up with the same main state for the app. Of course any local state and DOM state (like scrolling position and focus) are lost.
     *      * This method is similar to React's `hydrateRoot` in its core functioning, though without defining content. (Use `remountWith` for that instead.)
     *      * Unlike in `reassimilate` flow, there's no default `container` and `removeUnused` defaults to `true`, as otherwise any mismatches would leave the DOM tree in a messy state.
     *          - The flow is also different in that `remount` performs a full remount on the components (vs. partial smuggling of DOM elements to existing state).
     * @param container Optionally define the container for DOM reassimilation while mounting. If null, won't try to reuse DOM elements. If given, should often be equivalent to `host.getContainerElement()`.
     * @param readFromDOM Whether re-reads the current dom props ("attributes") and/or text content ("content") from the reused DOM elements. Defaults to false. If true, reads both.
     *      - Note. If some text contents were not correctly re-rendered (after remounting with DOM reassimilation), try setting readFromDOM to "content" (or true).
     * @param removeUnused Remove the other unused DOM elements found in the container. Defaults to true in remounting.
     * @param validator Can veto any DOM element from being used. Return true to accept, false to not accept.
     * @param suggester Can be used to suggest better DOM elements in a custom fashion. Should return a DOM Node, MixDOMAssimilateItem or null.
     * 
     * ```
     * 
     * // - Example to showcase the core feature (not practical) - //
     * 
     * // Get container and read DOM output as a string.
     * const elContainer = host.getContainerElement();
     * const htmlStr = host.readDOMString();
     * 
     * // After the line below, the DOM looks the same, but nothing JS related works.
     * // .. Of course, assuming the host has a container - most often has on the client side.
     * if (elContainer)
     *     elContainer.innerHTML = htmlStr;
     * 
     * // After the line below, the component structure in the host has been remounted, and DOM reassimilated.
     * // .. Before executing the line below, you can go and modify the DOM and see how the mods are retained (if could match).
     * host.remount(elContainer);
     *
     * // Notes about the above line.
     * // .. If the state is somewhat similar to what it was, the process has likely has reused many if not all nodes.
     * // .... Most likely places of inconsistencies are related to text nodes: eg. whether two simple adjacent texts were joined as 1 or left as 2.
     * // .... To account for text content inconsistencies, set readFromDOM to "content" (or true).
     * // .. If container given, the method actually outputs info about usage `Record<"created" | "reused" | "unused", Set<Node>>`, otherwise `null`.
     * // .... This is useful for debugging, in case things don't look right while the new app state is similar to old.

     * ```
     */
    public remount(container: Node, readFromDOM?: boolean | "attributes" | "content", removeUnused?: boolean, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): { created: Set<Node>; reused: Set<Node>; unused: Set<Node>; };
    public remount(container?: Node | null, readFromDOM?: boolean | "attributes" | "content", removeUnused?: boolean, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): null;
    public remount(container: Node | null = null, readFromDOM: boolean | "attributes" | "content" = false, removeUnused: boolean = true, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): { created: Set<Node>; reused: Set<Node>; unused: Set<Node>; } | null {
        return this.remountWith(this.services.getRootDef(true), container, readFromDOM, removeUnused, validator, suggester);
    }

    /** Remounts the whole Host, optionally assimilating into given DOM structure (found inside the container, if given).
     * - The assimilation part comes in when mounting the DOM elements, as can reuse/smuggle/assimilate the DOM nodes from the container.
     * - See `remount` method for more information.
     * @param content Optionally define new render content. If null|undefined, then reuses the current root def as the content.
     * @param container Optionally define the container for DOM reassimilation while mounting. If null, won't try to reuse DOM elements. If given, should often be equivalent to `host.getContainerElement()`.
     * @param readFromDOM Whether re-reads the current dom props ("attributes") and/or text content ("content") from the reused DOM elements. Defaults to false. If true, reads both.
     *      - Note. If some text contents were not correctly re-rendered (after remounting with DOM reassimilation), try setting readFromDOM to "content" (or true).
     * @param removeUnused Remove the other unused DOM elements found in the container. Defaults to true in remounting.
     * @param validator Can veto any DOM element from being used. Return true to accept, false to not accept.
     * @param suggester Can be used to suggest better DOM elements in a custom fashion. Should return a DOM Node, MixDOMAssimilateItem or null.
     * 
     * ```
     * 
     * // - Showcasing `remountWith` for hydration purposes - //
     * 
     * // As a quick example of usage for DOM hydration purposes:
     * const container = document.querySelector("#app-root");
     * const host = new Host(null, container);          // Don't render content yet.
     * host.remountWith(contentFromSrv, container);     // Rehydrate the DOM.
     * 
     * // Note. The `contentFromSrv` is likely a simple def like: `<App />`.
     * // .. It comes from the server side rendering.
     * // .. To dummy-test the feature on a living app, get the container and contentFromSrv like this:
     * const container = host.getContainerElement();    // Current container element.
     * const contentFromSrv = host.getRootDef();        // Current root def (copy).
     * 
     * // You could then clear the DOM and try to rehydrating it.
     * const domString = host.readDOMString();          // Current DOM structure as a string.
     * container.innerHTML = domString;                 // Apply new DOM from string.
     * host.remountWith(contentFromSrv, container);     // Rehydrate the DOM.
     * 
     * ```
     * 
     */
    public remountWith(content: MixDOMRenderOutput, container: Node, readFromDOM?: boolean | "attributes" | "content", removeUnused?: boolean, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): { created: Set<Node>; reused: Set<Node>; unused: Set<Node>; };
    public remountWith(content: MixDOMRenderOutput, container?: Node | null, readFromDOM?: boolean | "attributes" | "content", removeUnused?: boolean, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): null;
    public remountWith(content: MixDOMRenderOutput, container: Node | null = null, readFromDOM: boolean | "attributes" | "content" = false, removeUnused: boolean = true, validator?: MixDOMAssimilateValidator, suggester?: MixDOMAssimilateSuggester): { created: Set<Node>; reused: Set<Node>; unused: Set<Node>; } | null {
    
        // Idea.
        // 1. Pre-map: Build a MixDOMAssimilateItem map from the container node, if given.
        // 2. Unmount: Unmount everything.
        // 3. Set as sourceRemount from the assimilation info.
        // 4. Run a full re-mount on the whole tree.
        //      * Upon receiving `{ create }` infos, the renderer tries to reuse the elements if sourceRemount exists.
        //      * While looping down the received create infos, it iterates down the MixDOMAssimilateItem map by any matching hits.
        //      * Upon finding a match (for `{ create }`) it uses the existing DOM element and by readFromDOM (defaults to true) reads the attributes.
        //      * The process also includes removing unused removeUnused set to true.
        // 5. Delete the sourceRemount info.

        // 0. Handle argument defaults.
        if (content == null)
            content = this.services.getRootDef(true);

        // 1. Pre-map.
        const vInfo = container && HostRender.createVirtualItemsFor(container);
    
        // 2. Unmount everything.
        this.clearRoot(true, null, null);
    
        // 3. Set sourceRemount.
        const renderer = this.services.renderer;
        const created = new Set<Node>();
        const reused = new Set<Node>();
        const unused = new Set<Node>();
        const sRemount = renderer.sourceRemount = vInfo ? {
            ...vInfo,
            reused,
            created,
            unused,
            readFromDOM,
            removeUnused,
            validator,
            suggester,
        } : undefined;
    
        // 4. Run a re-mount.
        this.services.updateRoot(content, null, null); // We actually feed the old rootDef, not render info - but it will be recognized.
    
        // 5. Delete sourceRemount info.
        delete renderer.sourceRemount;

        // Return.
        return sRemount ? { created: sRemount.created!, reused: sRemount.reused!, unused: sRemount.unused! } : null;
    }
    
    
    // - Getters - //

    /** Read the whole rendered contents as a html string. Typically used with settings.disableRendering (and settings.renderTimeout = null). */
    public readDOMString(): string {
        return HostRender.readDOMString(this.rootBoundary.treeNode);
    }
    /** Get a (shallow) copy of the root def. Use this only for technical special cases and only as _readonly_ - do not mutate the def. Should not be needed in normal circumstances. */
    public getRootDef(): MixDOMDefTarget | null {
        return this.services.getRootDef(true);
    }
    /** Get the element that contains the Host. */
    public getContainerElement(): Node | null {
        return this.groundedTree.domNode;
    }
    /** Get the root dom node (ours or by a nested boundary) - if has many, the first one (useful for insertion). */
    public getRootElement(): Node | null {
        return this.rootBoundary && this.rootBoundary.treeNode.domNode;
    }
    /** Get all the root dom nodes - might be many if used with a fragment.
     * - Optionally define whether to search in nested boundaries or not (by default does). */
    public getRootElements(inNestedBoundaries?: boolean): Node[] {
        return this.rootBoundary ? rootDOMTreeNodes(this.rootBoundary.treeNode, inNestedBoundaries, false).map(treeNode => treeNode.domNode) as Node[] : [];
    }
    /** Get the first dom element by a selectors within the host (like document.querySelector). Should rarely be used, but it's here if needed. */
    public queryElement<T extends Element = Element>(selectors: string, overHosts: boolean = false): T | null {
        return domElementByQuery<T>(this.groundedTree, selectors, true, overHosts);
    }
    /** Get dom elements by a selectors within the host (like document.querySelectorAll). Should rarely be used, but it's here if needed. */
    public queryElements<T extends Element = Element>(selectors: string, maxCount: number = 0, overHosts: boolean = false): T[] {
        return domElementsByQuery<T>(this.groundedTree, selectors, maxCount, true, overHosts);
    }
    /** Find all dom nodes by an optional validator. */
    public findElements<T extends Node = Node>(maxCount: number = 0, overHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): T[] {
        return treeNodesWithin(this.groundedTree, new Set(["dom"]), maxCount, true, overHosts, validator).map(tNode => tNode.domNode) as T[];
    }
    /** Find all components by an optional validator. */
    public findComponents<Comp extends ComponentTypeAny = ComponentTypeAny>(maxCount: number = 0, overHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): Comp[] {
        return treeNodesWithin(this.groundedTree, new Set(["boundary"]), maxCount, true, overHosts, validator).map(t => (t.boundary && t.boundary.component) as unknown as Comp);
    }
    /** Find all treeNodes by given types and an optional validator. */
    public findTreeNodes(types: SetLike<MixDOMTreeNodeType>, maxCount: number = 0, overHosts: boolean = false, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[] {
        const okTypes = types.constructor === Set ? types : types.constructor === Array ? new Set(types) : new Set(Object.keys(types));
        return treeNodesWithin(this.groundedTree, okTypes as Set<MixDOMTreeNodeType | "">, maxCount, true, overHosts, validator);
    }


    // - Settings - //
    
    /** Modify previously given settings with partial settings.
     * - Note that if any value in the dictionary is `undefined` uses the default setting.
     * - Supports handling the related special cases:
     *      * `onlyRunInContainer`: Refreshes whether is visible or not (might destroy all / create all, if needed).
     */
    public modifySettings(settings: HostSettingsUpdate, passToDuplicated: boolean = true): void {
        // Collect state before.
        const onlyRunWas = this.settings.onlyRunInContainer;
        // Update each values.
        Host.modifySettings(this.settings, settings);
        // Detect special changes.
        // .. Run the update immediately.
        if (settings.onlyRunInContainer !== undefined && settings.onlyRunInContainer !== onlyRunWas)
            this.refreshRoot(false, null, null);
        // Update duplicated hosts.
        if (passToDuplicated)
            for (const host of this.shadowAPI.hosts)
                if (host !== this)
                    host.modifySettings(settings, false);
    }


    // - Static helpers - //

    public static modifySettings(base: HostSettings, newSettings: HostSettingsUpdate, useDefaults = false): void {
        // Prepare.
        let defaults: HostSettings | null = null;
        // Pre-handle special cases: an object like setting value.
        if (newSettings.updateComponentModes) {
            const newUpdModes = newSettings.updateComponentModes;
            const updModes: Partial<HostSettings["updateComponentModes"]> = {};
            for (const type in newUpdModes)
                updModes[type] = newUpdModes[type] ?? (defaults || (defaults = Host.getDefaultSettings())).updateComponentModes[type];
            newSettings = {...newSettings, updateComponentModes: updModes };
        }
        // Handle all.
        for (const prop in newSettings)
            if (newSettings[prop] !== undefined)
                base[prop] = newSettings[prop];
            else if (useDefaults)
                base[prop] = (defaults || (defaults = Host.getDefaultSettings()))[prop];
    }

    public static getDefaultSettings(): HostSettings {
        // Default.
        const dSettings: HostSettings = {
            // Timing.
            updateTimeout: 0,
            renderTimeout: 0,
            // Calling.
            useImmediateCalls: false,
            // Updating.
            updateComponentModes: {
                props: "shallow",
                state: "shallow",
            },
            preCompareDOMProps: "if-needed",
            // Behaviour.
            wideKeysInArrays: false,
            noRenderValuesMode: false,
            onlyRunInContainer: false,
            // Rendering.
            disableRendering: false,
            duplicateDOMNodeBehaviour: "deep",
            duplicateDOMNodeHandler: null,
            duplicatableHost: false,
            maxReRenders: 1,
            renderTextTag: "",
            renderHTMLDefTag: "span",
            renderTextHandler: null,
            renderSVGNamespaceURI: "http://www.w3.org/2000/svg",
            renderDOMPropsOnSwap: true,
            // - DEV-LOG - //
            // Dev log.
            devLogWarnings: false,
        };
        // Return combined.
        return dSettings;
    }

}


// - Shortcut - //

/** Create a new host and start rendering into it. */
export function newHost<Contexts extends ContextsAllType = {}>(
    content?: MixDOMRenderOutput,
    container?: Element | null,
    settings?: HostSettingsUpdate | null,
    contexts?: Contexts,
    // shadowAPI?: HostShadowAPI | null
): Host<Contexts> { return new Host<Contexts>(content, container, settings, contexts); } //, shadowAPI);
