
// - Imports - //

// Libraries.
import { SetLike } from "data-signals";
// Typing.
import { MixDOMTreeNode, MixDOMTreeNodeType, MixDOMBoundary } from "./typing/index";
// Routines.
import { domElementByQuery, domElementsByQuery, newContentCopyDef, newDef, newDefHTML, treeNodesWithin } from "./static/index";
// Common.
import { MixDOMContent, MixDOMContentCopy, Ref, createSpread, createSpreadWith } from "./common/index";
// Host.
import { Host, HostRender } from "./host/index";
// Components.
import {
    // Pseudos.
    PseudoFragment,
    PseudoPortal,
    PseudoElement,
    PseudoEmpty,
    PseudoEmptyRemote,
    // Component.
    createComponent,
    Component,
    mixinComponent,
    ComponentTypeAny,
    createComponentCtx,
    // Shadow.
    createShadow,
    createShadowCtx,
    // Wired.
    createWired,
    // Remote.
    createRemote,
    // WithContent.
    MixDOMWithContent,
    // Mixing.
    createMixin,
    mixFuncs,
    mixFuncsWith,
    mixMixins,
    mixClassMixins,
    mixClassFuncs,
    mixClassFuncsWith,
    mixHOCs,
    mixMixinsWith,
} from "./components/index";
import { domSelfClosingTags } from "dom-types";


// - Export shortcuts - //

// Collected shortcuts and static methods.
/** Shortcut dictionary to contain all the main features of MixDOM library. */
export const MixDOM = {

    
    // - Def shortcuts - //

    /** Create a new render definition. Can feed JSX input. (It's like `React.createElement` but `MixDOM.def`). */
    def: newDef,

    /** Create a new def from a HTML string. Returns a def for a single HTML element.
     * - If a wrapInTag given will use it as a container.
     * - Otherwise, if the string refers to multiple, returns an element containing them (with settings.renderHTMLDefTag).
     * - Normally uses a container only as a fallback if has many children. */
    defHTML: newDefHTML,


    // - Content passing - //

    /** Generic def for passing content.
     * - Use this to include content (~ React's props.children) from the parent component.
     * - Note that in the case of multiple contentPasses the first one in tree order is the real one.
     *   .. If you deliberately want to play with which is the real one and which is a copy, use MixDOM.ContentCopy or MixDOM.copyContent(someKey) for the others. */
    Content: MixDOMContent,
    /** A custom component (func) that can be used for conditional inserting.
     * - For example: `<WithContent><span class="title">{MixDOM.Content}</span></WithContent>`
     *      * Results in `<span class="title">...</span>`, where ... is the actual content passed (by parent).
     *      * However, if there was no actual content to pass (`null` or `undefined`), then results in `null`.
     *      * Note that if the parent passes {MixDOM.Content}, then it is something and will render with the wrapping (so does not work recursively).
     * - Note that if the component ever needs to "handle" the children, or be refreshed when they change, should put the related info as `props`.
     *      * For example, `{ props.children: MixDOMRenderOutput[]; }`. Or even better as: `{ props.items: MyItem[]; }` and then create the defs within from the MyItem info.
     *      * You can then also easily detect if there are any children/items and do conditional rendering accordingly.
     * - Note that prior to v3.1, this feature worked technically differently.
     *      * Now it's implemented in a much simpler way, only drawback being the lack of recursive support, but benefit being that parent won't have to re-render (and ~4kB less minified code).
     */
    WithContent: MixDOMWithContent,
    /** A generic shortcut for a content copy.
     * .. We give it a unique key ({}), so that it can be widely moved around.
     * .. In the case you use multiple ContentCopy's, then reuses each widely by tree order. */
    ContentCopy: MixDOMContentCopy,
    /** Use this method to create a copy of the content that is not swappable with the original render content.
     * - This is very rarely useful, but in the case you want to display the passed content multiple times,
     *   this allows to distinguish from the real content pass: `{ MixDOM.Content }` vs. `{ MixDOM.copyContent("some-key") }` */
    copyContent: newContentCopyDef,


    // - Class shortcuts - //

    // Main classes.
    /** Standalone Component class.
     * - Provides the basic features for rendering into the MixDOM system, orchestrator by the containing Host.
     * - Use the `render(props, state)` method to render the contents - the method is called automatically by the flow (calling it manually has no meaning).
     */
    Component,
    /** The main class to orchestrate and start rendering in MixDOM. */
    Host,
    /** Class to help keep track of components or DOM elements in the state based tree. */
    Ref,


    // - Pseudo classes - //

    /** Fragment represent a list of render output instead of stuff under one root.
     * - Usage example: `<MixDOM.Fragment><div/><div/></MixDOM.Fragment>`, or just `<><div/><div/></>`.
     */
    Fragment: PseudoFragment,
    /** Portal allows to insert the content into a foreign dom node.
     * - Usage example: `<MixDOM.Portal container={myDOMElement}><div/></MixDOM.Portal>`
     */
    Portal: PseudoPortal,
    /** Element allows to use an existing dom element as if it was part of the system, so you can modify its props and insert content etc.
     * - Usage example: `<MixDOM.Element element={el} style="background: #ccc"><span>Some content</span></MixDOM.Element>`.
     */
    Element: PseudoElement,
    /** Empty dummy component that accepts any props, but always renders null. */
    Empty: PseudoEmpty,
    /** This is an empty dummy ComponentRemote class:
     * - Its purpose is to make writing render output easier (1. no empty checks, and 2. for typing):
     *     * For example: `const MyRemote = component.state.PopupRemote || MixDOM.EmptyRemote;`
     *     * You can then access the Content and ContentCopy members, and copyContent(key) and withContent(...contents) methods fluently.
     * - However, they will just return null, so won't have any effect on anything.
     *     * Note also that technically speaking this class extends PseudoEmpty.
     *     * And it only adds the 2 public members (Content and ContentCopy) and 2 public methods (copycontent and withContent).
     *     * Due to not actually being a remote, it will never be used as a remote. It's just a straw dog.
     * - If you need to distinguish between real and fake, use `isRemote()` method. The empty returns false.
     */
    EmptyRemote: PseudoEmptyRemote,


    // - Create components - //

    /** Alias for createComponent. Create a functional component. You get the component as the first parameter, and optionally contextAPI as the second if you define 2 args: (component, contextAPI). You can also give a dictionary of static properties to assign (as the 2nd arg to MixDOM.component). */
    component: createComponent,
    /** Create a functional component with ContextAPI. The first initProps is omitted: (component, contextAPI). The contextAPI is instanced regardless of argument count. You can also give a dictionary of static properties to assign (as the 2nd arg to MixDOM.componentCtx). */
    componentCtx: createComponentCtx,
    /** Create a shadow component omitting the first initProps: (component). The contextAPI is if has 2 arguments (component, contextAPI).
     * - Shadow components are normal components, but they have a ShadowAPI attached as component.constructor.api.
     * - This allows the components to be tracked and managed by the parenting scope who creates the unique component class (whose instances are tracked).
    */
    shadow: createShadow,
    /** Create a shadow component with ContextAPI by func and omitting the first initProps: (component, contextAPI). The contextAPI is instanced regardless of argument count. */
    shadowCtx: createShadowCtx,
    /** Create a SpreadFunc - it's actually just a function with 0 or 1 arguments: (props?).
     * - It's the most performant way to render things (no lifecycle, just spread out with its own pairing scope).
     * - Note that this simply gives back the original function, unless it has more than 1 arguments, in which case an intermediary function is created.
     *      * This intermediary function actually supports feeding in more arguments - this works since a func with (props, ...args) actually has length = 1.
     *      * If you want to include the props and extra arguments typing into the resulting function use the MixDOM.spreadWith function instead (it also automatically reads the types).
     */
    spread: createSpread,
    /** Create a SpreadFunc by automatically reading the types for Props and ExtraArgs from the given function. See MixDOM.spread for details.
     * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
     */
    spreadWith: createSpreadWith,
    /** Create a ComponentRemote class for remote flow (in / out).
     * - For example, `export const MyRemote = MixDOM.createRemote();`.
     * - And then to feed content in a render method: `<MyRemote>Some content..</MyRemote>`.
     * - Finally insert it somewhere in a render method: `{MyRemote.Content}`.
    */
    remote: createRemote,
    /** Creates an intermediary component (function) to help produce extra props to an inner component.
     *      * It receives its parent `props` normally, and then uses its `state` for the final props that will be passed to the inner component (as its `props`).
     * - About arguments:
     *      1. The optional Builder function builds the common external props for all wired instances. These are added to the component's natural props.
     *      2. The optional Mixer function builds unique props for each wired instance. If used, the common props are fed to it and the output of the mixer instead represents the final props to add.
     *      3. The only mandatory argument is the component to be used in rendering, can be a spread func, too. It's the one that receives the mixed props: from the tree flow and from the wiring source by handled by Mixer and Builder functions.
     *      4. Finally you can also define the name of the component (useful for debugging).
     * - Technically this method creates a component function (but could as well be a class extending Component).
     *      - The important thing is that it's a unique component func/class and it has `api` member that is of `WiredAPI` type (extending `ShadowAPI`).
     *      - When the component is instanced, its static class side contains the same `api` which serves as the connecting interface between the driver and all instances.
     *      - This class can then allow to set and refresh the common props, and trigger should-updates for all the instances and use signals.
     *      - The `WiredAPI` extension contains then features related to the automated mixing of parent props and custom data to produce final state -> inner component props.
     * - Note that when creates a stand alone wired component (not through Component component's .createWired method), you should drive the updates manually by .setProps.
     * - Note. To hook up the new wired component (class/func) to the updates of another component use: `component.addWired(Wired)` and remove with `component.removeWired(Wired)`.
     */
    wired: createWired,
    /** Function that on JS side returns the original function back (to create a mixin class) but simply helps with typing. 
     * - The idea of a mixin is this: `(Base) => class extends Base { ... }`. So it creates a new class that extends the provided base class.
     *     * In the context of Components the idea is that the Base is Component and then different features are added to it.
     *     * Optionally, when used with mixMixins the flow also supports adding requirements (in addition to that the Base is a Component class).
     * - To use this method: `const MyMixin = MixDOM.mixin<RequiresInfo, MyMixinInfo>(Base => class _MyMixin extends Base { ... }`
     *     * Without the method: `const MyMixin = (Base: GetComponentTypeFrom<RequireInfo>) => class _MyMixin extends (Base as GetComponentTypeFrom<RequireInfo & MyMixinInfo>) { ... }`
     *     * So the trick of this method is simply that the returned function still includes `(Base: Required)`, but _inside_ the func it looks like `(Base: Required & Added)`.
    */
    mixin: createMixin,

    // Mixins.
    /** Add Component features to a custom class. Provide the BaseClass type specifically as the 2nd type argument.
     * - For examples of how to use mixins, see: [mixin-types README](https://www.npmjs.com/package/mixin-types).
     * - To read typing of the base class use one of the below:
     *      1. Provide it manually using `typeof BaseClass`. For example: `mixinComponent<Info, typeof BaseClass>(BaseClass)`.
     *      2. Use `AsMixin` to auto-read the typing from the BaseClass. For example: `mixinComponent as AsMixin<Component<Info>>(BaseClass)`.
     * - Note that this feature can be used for the concept of Component mixing in the class form.
     *      * However, you can also mix components in the functional form. See more at MixDOM.mixin, MixDOM.mixFuncs and other related methods.
     * 
     * ```
     * 
     * // - Basic typed example - //
     * 
     * // Base class with static type.
     * interface MyBaseType extends ClassType<MyBase> {
     *     SOME_STATIC: boolean;
     * }
     * class MyBase { something: boolean = false; static SOME_STATIC: boolean = false; }
     * 
     * // Create some mixed components. (Should define render method, too.)
     * // .. Typing.
     * type MyInfo = { props: { test: boolean; }; };
     * // .. Without base class.
     * const MyComponent = mixinComponent<MyInfo>(Object);
     * class MyComponentClass extends mixinComponent<MyInfo>(Object) {}
     * // .. With typed base class.
     * const MyComponentWith1 = mixinComponent<MyInfo, typeof MyBase>(MyBase);
     * const MyComponentWith2 = mixinComponent<MyInfo, MyBaseType>(MyBase);
     * const MyComponentWith3 = (mixinComponent as AsMixin<Component<MyInfo>>)(MyBase);
     * const MyComponentWith4 = (mixinComponent as ReMixin<ComponentType<MyInfo>>)(MyBase);
     * 
     * // Test static typing. (All found as expected.)
     * MyComponent.MIX_DOM_CLASS
     * MyComponentClass.MIX_DOM_CLASS
     * MyComponentWith1.MIX_DOM_CLASS
     * MyComponentWith1.SOME_STATIC
     * MyComponentWith2.MIX_DOM_CLASS
     * MyComponentWith2.SOME_STATIC
     * MyComponentWith3.MIX_DOM_CLASS
     * MyComponentWith3.SOME_STATIC
     * MyComponentWith4.MIX_DOM_CLASS
     * MyComponentWith4.SOME_STATIC
     * 
     * // Test props.
     * const Test: SpreadFunc = () =>
     *     <>
     *         <MyComponent test={false} />
     *         <MyComponentClass test={false} />
     *         <MyComponentWith1 test={false} />
     *         <MyComponentWith2 test={false} />
     *         <MyComponentWith3 test={false} />
     *         <MyComponentWith4 test={false} />
     *     </>;
     * 
     * 
     * // - Advanced typed example - //
     * //
     * // Note. For advanced examples and guidelines, see `mixin-types` documentation:
     * // https://www.npmjs.com/package/mixin-types
     * 
     * // To use generics (mixed with custom info).
     * // .. 
     * type MyGenInfo = { state: { enabled: boolean; }; props: { more?: boolean; }; };
     * interface MyGenComponentType<Info extends ComponentInfoPartial = {}>
     * 	    extends ComponentType<Info & MyGenInfo> {}
     * interface MyGenComponent<Info extends ComponentInfoPartial = {}>
     * 	    extends Component<Info & MyGenInfo>, MyBase {}
     * class MyGenComponent<Info = {}> extends
     *      (mixinComponent as any as ReMixin<MyGenComponentType<any>>)(MyBase) {
     * 		
     *      // Can add here things, they'll be auto-typed to MyGenComponent interface.
     * 		myThing?: Info;
     * 		constructor(props: ComponentProps<Info & MyGenInfo>, boundary?: SourceBoundary, ...args: any[]) {
     * 			super(props, boundary, ...args);
     * 			this.state = {
     * 				enabled: false,
     * 			};
     * 		}
     * 		test(): void {
     * 			// Recognized correctly.
     * 			this.something = false;
     * 			this.constructor.MIX_DOM_CLASS;
     * 			// The base class needs some help here.
     * 			(this.constructor as MyGenComponentType & MyBaseType).SOME_STATIC;
     * 		}
     * 		render() {		
     * 			return <div>{this.state.enabled ? "yes" : "no"}</div>;
     * 		}
     * 	}
     * 
     * // Test static typing. (All found as expected.)
     * MyGenComponent.MIX_DOM_CLASS
     * MyGenComponent.SOME_STATIC
     * 
     * // Test interface typing - automated from what's inside the class declaration.
     * type TestMyThing = MyGenComponent<MyInfo>["myThing"]; // MyInfo | undefined
     * 
     * // Test props.
     * const TestMore: SpreadFunc = () =>
     *     <>
     *         <MyGenComponent<MyInfo> test={false} more={true} />
     *     </>;
     * 
     * ```
     * 
     */
    mixinComponent,


    // - Component mixing - //

    /** This mixes many component functions together. Each should look like: `(initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer`.
     * - Note that this only "purely" mixes the components together (on the initial render call).
     *      * By default does not put a renderer function in the end but just passes last output (preferring funcs, tho). If you want make sure a renderer is in the end, put last param to true: `(...funcs, true)`
     *      * Compare this with `MixDOM.mixFuncsWith(..., composer)`, that always returns a renderer. (And its last argument is auto-typed based on all previous.)
     * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
     *      * Note that you should only use `ComponentFunc` or `ComponentFuncMixable`. Not supported for spread functions (makes no sense) nor component classes (not supported for this flow, see mixClassFunc instead).
     *      * You should type each function most often with `ComponentFunc<Info>` type or `MixDOM.component<Info>()` method. If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
     * - This also supports handling contextual needs (by a func having 3 args) as well as attaching / merging ShadowAPI | WiredAPI.
     * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
     *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
     *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
     */
    mixFuncs: mixFuncs,
    /** This mixes many component functions together. Each should look like: (initProps, component, cApi?) => MixDOMRenderOutput | MixDOMDoubleRenderer.
     * - Unlike MixDOM.mixFuncs, the last argument is a mixable func that should compose all together, and its typing comes from all previous combined.
     *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
     *      * Alternatively you can add them to the 2nd last function with: `SomeMixFunc as ComponentFunc<ReadComponentInfo<typeof SomeMixFunc, ExtraInfo>>`.
     * - Each mixable func can also have pre-requirements if typed with `ComponentFuncMixable<RequiredFunc, OwnInfo>` - the typing supports up to 8 funcs and requirements can be filled by any func before.
     *      * Note that you should only use ComponentFunc or ComponentFuncMixable. Not supported for spread functions (makes no sense) nor component classes (not supported).
     *      * You should type each function most often with ComponentFunc<Info> or MixDOM.component<Info>(). If you leave a function and its params totally untyped, it will break the typing flow. But next one can correct it (at least partially).
     * - This also supports handling contextual needs (by a func having 3 args) as well as attaching / merging ShadowAPI | WiredAPI.
     * - Note that this does not wrap components one after another (like HOCs). Instead only their initializing closure is used, and the last active renderer.
     *      * Often the purpose is to extend props, state and/or class - especially class data becomes useful to hold info from different closures. Even partial renderers.
     *      * Note that each component func can still override state with: `component.state = { ...myStuff }`. The process detects changes and combines the states together if changed.
     */
    mixFuncsWith: mixFuncsWith,
    /** This mixes together a Component class and one or many functions. 
     * - By default, attaches the return of the last function as the renderer (if function type, otherwise an earlier one). 
     * - Optionally as the 3rd arg, can provide a boolean to use the class renderer instead. */
    mixClassFuncs: mixClassFuncs,
    /** This mixes together a Component class and one or many functions with a composer function as the last function.
     * - The last function is always used as the renderer and its typing is automatic.
     *      * If you want to add extra props to the auto typed composer you can add them as an extra last argument: `{} as { props: { someStuff: boolean; } }`.
     */
    mixClassFuncsWith: mixClassFuncsWith,
    /** Mix many mixins together with a custom Component class as the basis to mix on: `(MyClass, MyMixin1, MyMixin2, ...)`.
     * - Note. The last mixin with a render method defined is used as the render method of the combined class.
     * - Note. If you don't want to define a custom component class as the base, you can use the `MixDOM.mixMixins` function instead (which uses the Component class). These two funcs are split to get better typing experience.
     * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
    */
    mixClassMixins: mixClassMixins,
    /** Mix many mixins together into using the basic Component class as the basis to mix on: `(MyMixin1, MyMixin2, ...)`.
     * - Note. The last mixin with a render method defined is used as the render method of the combined class.
     * - Note. If you want to define a custom base class (extending Component) you can use `MixDOM.mixClassMixins` method whose first argument is a base class.
     * - For best typing experience, these two functions are split apart into two different functions. However, technically both use the exact same base.
     */
    mixMixins: mixMixins,
    /** Mix many mixins together into using a Component class as the basis to mix on: `(MyMixin1, MyMixin2, ..., ComposerMixin)`
     * - Note. The last mixin is assumed to be the one to do the rendering and its type is combined from all the previous + the optional extra info given as the very last argument.
     * - This is like MixDOM.mixFuncsWith but for mixins. On the javascript this function is teh same as MixDOM.mixMixins.
     */
    mixMixinsWith: mixMixinsWith,
    /** This creates a final component for a list of HOCs with a based component: `(Base, HOC1, HOC2, ... )`
     * - Note that conceptually HOCs are not very performant as they create extra intermediary components.
     * - Consider using mixFuncs or mixMixins concepts instead. They are like HOCs merged into one component with a dynamic base.
     */
    mixHOCs: mixHOCs,
    

    // - Finding stuff - //

    /** Find tree nodes within a treeNode. */
    findTreeNodesIn: (treeNode: MixDOMTreeNode, types?: SetLike<MixDOMTreeNodeType>, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): MixDOMTreeNode[] => {
        const okTypes = types ? types.constructor === Set ? types : types.constructor === Array ? new Set(types) : new Set(Object.keys(types)) : undefined;
        return treeNodesWithin(treeNode, okTypes as Set<MixDOMTreeNodeType> | undefined, maxCount, inNested, overHosts, validator);
    },
    /** Get all components within a treeNode. */
    findComponentsIn: <Comp extends ComponentTypeAny = ComponentTypeAny>(treeNode: MixDOMTreeNode, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): Comp[] =>
        treeNodesWithin(treeNode, new Set(["boundary"]), maxCount, inNested, overHosts, validator).map(t => (t.boundary && t.boundary.component) as unknown as Comp),
    /** Get all elements within a treeNode. */
    findElementsIn: <T extends Node = Node>(treeNode: MixDOMTreeNode, maxCount?: number, inNested?: boolean, overHosts?: boolean, validator?: (treeNode: MixDOMTreeNode) => any): T[] =>
        treeNodesWithin(treeNode, new Set(["dom"]), maxCount, inNested, overHosts, validator).map(tNode => tNode.domNode) as T[],
    /** Find the first matching element within a treeNode using a selector. */
    queryElementIn: <T extends Element = Element>(treeNode: MixDOMTreeNode, selector: string, inNested?: boolean, overHosts?: boolean): T | null =>
        domElementByQuery<T>(treeNode, selector, inNested, overHosts),
    /** Find the matching elements within a treeNode using a selector. */
    queryElementsIn: <T extends Element = Element>(treeNode: MixDOMTreeNode, selector: string, maxCount?: number, inNested?: boolean, overHosts?: boolean): T[] =>
        domElementsByQuery<T>(treeNode, selector, maxCount, inNested, overHosts),


    // - HTML helpers - //

    /** Read html content as string from the given treeNode, component or boundary.
     * - Typically used with Host having settings.disableRendering (and settings.renderTimeout = null).
     * @param treeNode An abstract info object: MixDOMTreeNode. Contains all the necessary info and linking and implies tree structure.
     * @param onlyClosedTagsFor Define how to deal with closed / open tags per tag name. Defaults to `domSelfClosingTags` (from "dom-types").
     *      - If an array, only uses a single closed tag (`<div />`) for elements with matching tag (if they have no kids), for others forces start and end tags.
     *      - If it's null | undefined, then uses closed tags based on whether has children or not (= only if no children).
     */
    readDOMString: (from: MixDOMTreeNode | Component | MixDOMBoundary, onlyClosedTagsFor: readonly string[] | string[] | null | undefined = domSelfClosingTags): string => {
        const treeNode = from && (from.constructor["MIX_DOM_CLASS"] ? (from as Component).boundary.treeNode : (from as MixDOMBoundary).treeNode || typeof from["type"] === "string" && from as MixDOMTreeNode);
        return treeNode ? HostRender.readDOMString(treeNode, onlyClosedTagsFor) : "";
    },

};
