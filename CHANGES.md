## v3.2.0

### Enhancements

- Added `component._lastState?` member and `component.getLastState()` callback to the **Component** class. They provide a way to get the state that was used during last render call - this is useful if you need to figure out things in relation to the *rendered* state (not the updated state that will trigger a new render).

### Tiny changes

- In relation to above, changed the lifecycle signals on the component from `prevUpdates, nextUpdates` to `prevProps, prevState`. At the moment of the calls, the props have been updated (and state earlier) so they are found as `component.props` (and `component.state`).
- Also removed the `extend = true` argument from the component's `setState(partialState, ...)` method - now always extends.
- Renamed **Effect** class (and methods related to it) to **Memo**, as it better describes it: it remembers the last input, and runs a callback on change. In relation to React terms, the actual functionality is somewhere in between React's useEffect, useMemo and useCallback.

## v3.1.2

### Tiny fix

- Fixed a special case bug in relation to using multiple **ComponentStreams**, where would sometimes add the content twice when stream source was refreshed (in very specific circumstances only - also in v3.0). Also refined that the current source with same importance is _always_ kept.

## v3.1.1

### Tiny fixes for v3.1

- Fixing two tiny refactoring bugs (in relation to that Host no longer uses SignalMan).
  1. Refreshing the source with multiple **ComponentStreams** sources was not functioning correctly. (Bug emerged in v3.1 due to refactoring code.)
  2. The one-shot calls made with `afterRefresh` and `afterRefreshCall` were not actually one-shots: the clearing part was missing (likewise due to refactoring).

### Enhancements

- Added `addRefreshCall(callback, renderSide = false)` method on the `Host` class. It's like `afterRefreshCall` but does _not_ trigger a refresh - simply adds a one-shot callback.

## v3.1.0 (into summer shape)

### A new minor version: v3.1

- Reducing the size of the library from 89.2kb to 74.9kb minified - dropping over 14kb (about 1/6). In total dropped about 24kb and then reimplemented similar feature set with about 10kb.

- The changes mainly reorganize a few features while solving some special cases. As a result, using the library is a bit clearer, while it's slimmer without losses in the overall feature set.

- 1. Dropping and partly reorganizing how **ContentAPI** related features work.
  2. Reorganizing how the data and signals are used for **Hosts**, and how **Contexts** relate to them.
  3. Reorganized how **Host** duplication works technically.

### How and why?

- Reorganized how data and signal sharing works for **Hosts** & **Contexts** (and in relation to host duplication).
  - In v3.0, there was a bit of doubling. Both **Contexts** and **Hosts** featured the same **DataSignalMan**, making contexts a bit useless. It was also a strange to have duplicatable hosts with host based data, as most often the data is assumed to be global-like. Finally, having **Contexts** cascading down the tree coupled with component specific **ContextAPIs** also required a lot of code handling (20kb minified in total).
  - Now in v3.1, **Host** no longer extends **DataSignalMan**, but instead has a `.contextAPI` member and the **Contexts** are attached to it. Accordingly the host related data and signal methods on the **Component** class are removed, while the class still features a `.contextAPI`. Instead of cascading contexts down the tree, they are now inherited from the host to the components, while the components can still assign local overrides.
  - From usage point of view, there is very little difference. Mostly that contexts do not cascade down (but are instead attachable to Hosts for inheritance) as well as some micro-timing special cases.
    - In relation to micro-timing logic: The data listener calls are no longer ordered by tree but instead called after the direct calls in the order of adding. Previously, they were delayed until the component would update. However it's redundant to order them (and weird to extra-delay them) - if uses `setState` during the call (as expected), the subsequent component updates will anyway be ordered in the update process.

- Dropping the features related to **ContentAPI** and getting children content and marking children needs - for parental and stream passing (in total they were about 4kb). The reason is that they are not needed, and in larger scale they are actually a bit confusing to have. This is because can always just use "props" instead on the component (eg. `props.items` or `props.children`), if needs to wrap or whatever - which is actually a better design (and no confusion with nested defs for content within content within...).
  - However, the related `MixDOM.withContent(...contents)` feature had to be reimplemented. It's now a `MixDOM.WithContent` component and used accordingly, for example: `<MixDOM.WithContent><span class="title">{MixDOM.Content}</span></MixDOM.WithContent>`. Together with recursive check support amounts to a bit less than 2kb minified (including the new useful `closure.chainedClosures?` mapping).
  - This component based design has the benefit of separating the content based refreshes from the parent scope (and helps to prevent accidentally forming long re-render chains using spreads). So now an interested parent does _not_ re-render when the content changes, but instead the `WithContent` component. And with **ComponentStreams** there's no longer a need to detect for cyclical cases.


### Enhancements

- Enhanced the "multi" mode support in `sendSignalAs` method. Now it can always force the return to be in array mode - even when combining with "first", "last" or "first-true" modes.
- Optimized the processing of **Spread** functions - now they recognize inner spreads, which also helps with the two points below.
- Added recursive support for the **WithContent** feature for **Spreads** and **Components** using closure chains (detected while pairing defs).
- Technical enhancement: Added a useful mapping (as `closure.chainedClosures?`) from parent closures to first level child closures that have a content pass def for them - regardless of whether it'll be grounded or not. This allows to detect small content-pass-linked-chains (eg. useful for alarming about changes in the content chain recursively).

### Fixes

- Fixed collecting the return value in the "last" mode for `sendSignalAs` method.

### Lost of changes

- There is no more `.contentAPI` on the component. If the parent should pass something specific to the child component, it can simply use `props`.
- The feature for `MixDOM.withContent(...contents)` has been changed to `<MixDOM.WithContent>{...contents}</MixDOM.WithContent>`. It no longer requires the parent scope to re-render, and it now supports checking recursively up the envelope flow whether really has content or not (both within Spreads and Components).
- Likewise on the **ComponentStream** class and **PseudoEmptyStream**, the `MyStream.withContent(...contents)` has been changed to `<MyStream.WithContent>{...contents}</MyStream.WithContent>`.
- A few tiny changes on the **ContextAPI** class - now it's only tie to the outside is the attachable `afterRefresh` method. It no longer needs to know whether it's used by a component or a host or whatever. There's also a **ComponentContextAPI** and **HostContextAPI** classes with tiny mods: eg. tying the ContextAPI to the Host based refresh system and providing automatical inheritance from Host to Component contexts.
- Some methods and members on the **Context** class has been reorganized - however it still extends **DataSignalMan**, so most are the same.
- The `_contexts` still works the same, except now it calls `component.contextAPI.setContext(name, ctx)` method directly (there are just 2 levels for attaching contexts: Host and Component).
- The **Host** class no longer extends **DataManSignal** but instead provides the related features through its `.contextAPI` member.
- The last arguments for `MixDOM.newHost()` method have been changed. Now the args are: `(renderContent?, container?, settings?, contexts?)`. There is actually a 5th argument as well that is used internally when duplicating a Host `(, shadowAPI?)`.
- Added a method for `afterRefreshCall` on **Host** - like `afterRefresh` but instead first argument is a callback and does not return a promise (just `void`).
- Changed how the Host duplication system works. Now there's a **HostShadowAPI** class instance (on `host.shadowAPI`) that is shared between all duplicated - it doesn't matter who is the source. Accordingly the `sourceHost` and `ghostHosts` members are removed from **Host** class.
- Renamed **ShadowAPI** to **ComponentShadowAPI** and likewise **WiredAPI** to **ComponentWiredAPI** to avoid confusion with the new **HostShadowAPI**.
- Renamed ComponentWrapper (back to) **ComponentWired** for clarity of purpose. Accordingly named the WrappedAPI and `component.wrappers` respectively. (The fact that the concept works by creating a *wrapper* component is secondary to why it's used: to wire the component to an external source.)
- Renamed `enum MixDOMCompareDepthByMode` to just `enum MixDOMCompareDepth`. Likewise on the MixDOM object it's: `MixDOM.CompareDepth`.
- Dropped `enum ContextAttach` - there's now only direct ties, and for Components also ones inherited from the Host. (No need for a whole enum.)
- Dropped the `{ props, children }` extra info as `this` for **Spread** funcs - no real point.
- Dropped `host.settings.shouldUpdateWithNothing` - it's kind of weird to thing to control.
- Dropped `host.settings.devLogCleanUp` - it's only useful for internal development (for examining the core flow).
- Dropped `host.settings.welcomeContextsUpRoot` - now contexts work differently, they don't cascade down anymore.
- Dropped `host.settings.maxCyclicalUpdates` due to how the `WithContent` works now, there's no need for this as the parent won't re-render. (This would only be needed if actually purposefully made an infinite loop: by defining `MyStream`'s content within a `MyStream.WithContent` portion.)
- Some reorganization and renaming in the methods and members of internal classes.

## v3.0.1

### Tiny typing fixes
- Fixed a typing typo in relation to `contextAPI.listenTo` and `contextAPI.sendSignalAs` methods.
- Refined to work around a typing warning in the `MixDOM.module.d.ts`.

## v3.0.0

### New main version (and name)

- The library has gone through some major changes with a couple of important new features, such as:

- 1. Mixing components.
  2. Integrated signals system (with async support).
  3. Component streaming - define contents in one place, insert elsewhere (even up the flow, supporting wide keys moving).
  4. Flexible support for hydrating server side rendered (or other custom elements).
  5. Support to disable (and pause and resume) rendering and collect render output as an HTML string.
  6. Data listening and signals support on Host - with an easy access to it from the components part of the host.

- Major breaking changes:

- - Generally changed the name and naming from **UIDom** (ui-dom) to **MixDOM** (mix-dom) regarding framework and all classes and typing. Also refined naming all around, in methods, members and typing. This better describes what this library is about.
  - Reorganized "actions" concept as "signals", using the common basis now found in many classes, called **SignalMan**. Likewise there is **DataMan** related to data listening features.
  - Cleaned up component class and functional forms. Now there's just `Component` (both as a class and function) in addition to the `Spread` functional rendering. The basic Component class supports lifecycle callbacks, state, timers, wrapped components, streaming and can be hooked up to contexts.
  - Removed `local` from `Component`. Now can use `cApi.listenToData` and hook it up with setting the component `state`.
  - The components are now typed with an info dictionary, eg. `const Comp: ComponentFunc<Info> = (_, comp) => { ... }`. Also added `class` member for custom data for `Component` with typing support. This is very useful with **Refs** and component mixing to extend the component features.
  - Changes in the reserved keyword props - now they all start with an underline: `_key`, `_ref`, `_contexts` (and the new `_disable` and `_signals`). This is to distinguish them better from your normal props, and it also highlights two important things: 1. they have a special meaning in the `MixDOM` core, 2. they will not be passed to the component props - in other words, they are like "special commands".
  - Changes naming of all lifecycle signals to be simpler: `didMount`, `didMove`, `beforeUpdate`, `shouldUpdate`, `preUpdate`, `didUpdate` and `willUnmount` (and `didAttach` and `willDetach` for **Refs**).
  - Changes in the `Component`'s and `Ref`'s callbacks: now they all are based on the signals system, so can add multiple and thus reuse the same ref in many components fluently. For example: `ref.listenTo("didMount", (component) => { ... })`. Likewise Host's "update" and "render" listeners now work through the signals system.

### Features

- Component mixing: you can mix component functions together as well as build chains from mixins (all with full typing support - including specifying requirements for mixables).

- The signal system now uses a common base class - **SignalMan** - that is used in many classes. It also includes a flexible signal sending system supporting asynchronous signals. Also added `_signals` special prop that can be used with the signals system for dom elements or components (without Refs).

- Added distant content streaming - fully unleashing the powers of the content envelope system.

- - The component streaming concept allows to render content in one place and insert in another place. The stand alone streams can be driven by any rendering source: any component type or externally using an extra host: `host.updateRoot(<MyStream>Stuff here..!</MyStream>)`. The streams can also be shared by contexts (with named typing), so you can access them easily all around.
  - To use a stream, 1. create a new `ComponentStream` (by `MixDOM.stream()`), 2. render content into the stream: `<MyStream>Stuff..!</MyStream>`, and 3. insert the content somewhere by: `<div>{MyStream.Content}</div>`. You can insert streams (input or output) anywhere in the render scope.
  - The streaming also supports mixing from multiple sources (= by multiple instances of the same stream class) using `importance` prop - as well as automatically falling back to the next best source if the active streaming source dies.

- The server side support is composed of three things: 1. Allowing to disable rendering (and instead read the output as a html string), 2. On the client side, supporting hydrating components with custom DOM element structure. 3. Handling any browser-specific features (anything using `window` or `document` in global namespace), so that work in NodeJS environment or are ignored accordingly.

- - Note that the concepts of outputted html string and re-hydration from custom elements works for client-side usage as well - especially the rehydration callbacks allow you to customize how the elements get refilled, and even allow to hydrate without any virtual tree (just using callbacks), or mix both.

- Reorganized the component classes and functions. Now there are just two main components: `Component` and `SpreadFunc`.

- - `Component` replaces the old `UIMini` and `UILive` bringing lifecycle callbacks, timers, wrapped components, etc. They can be hooked up to context through their dedicated `ContextAPI`.
  - `SpreadFunc` is simply any *function* that has 1 or 0 args. Useful for short compositional needs (= purely static shortcuts).

- Hosts and Contexts now share a common base class - **DataSignalMan** - that provides features for sending and listening to signals as well as data.

- Added feature to disable any def by using `_disable={true}` prop - it collapses the def (including all contents inside) to `null`.

- - In terms of micro-performance it'd be better to use `someCondition ? <RenderStuff.../> : null` instead - that way you won't even create those render def that will anyway be disregarded. (However, if there's no child defs, makes no difference.)

- In similar fashion added `PseudoEmpty` component class that will also amount to `null`. It accepts any props and can serve special case usages (where you for some reason need to have a dummy component if real one not available). And specifically for streams `PseudoEmptySteram`.

- Provided `MixDOM.deepCopy` with custom depth to help with nested data special cases (eg. using state and complex server fetched data).

- Enhanced typing experience in many places - for example, in data listening and signals, there's now auto-suggestion (even for dotted strings), DataPicker/DataSelector typing is more flexible, providing various pieces of info with the `ComponentInfo` type, and so on.

### Fixes

- Fixed a bug in `_Find.rootDOMTreeNodes` that resulted in not supporting getting nested root dom nodes correctly. This caused DOM moving error in rare cases when using nested fragments or content passes with multiple children.
- Fixed a bug in relation to content passing and using the set needs for them. Also fixed that `MixDOM.withContent` also adds temporary "needs" for children - so that works correctly when the content changes.
- Fixed a rare special case related to DOM insertion and boundaries that render `null` (or otherwise have no `domNode` from their contents in the `treeNode`). Now correctly updates the chain if the first `treeNode` child of a parent deliberately has no `domNode`, and accordingly the DOM tree order is correct.
- Fixed including the `{ children }` in the `shouldUpdate` and other such update related info collections. (Now it also includes a new `{ streamed }` portion.)

### Other changes

- To support server side, made the `setTimeout` and `clearTimeout` use NodeJS's equivalent calls if not run in browser environment. Likewise handled a couple of cases using `document` to be functional without browser.

- Renamed `Host` setting `preEqualDOMProps` to `preCompareDOMProps`.

- Changed the common reserved keywords to have underline before: `_key`, `_ref`, `_disable`, `_signals` and `_contexts`.

- On `Ref`:

- - Removed the assignable callbacks - now everything uses the signals system instead.
  - Changed all callbacks related to `SourceBoundary` refer to `Component` instead.
  - Accordingly, changed `getRefBoundary` to `getComponent` and likewise the plural to `getComponents`, as they now deal with components, not boundaries - and likweise `getDomNode` to `getElement`.

- Added a new argument `extend: boolean = true` into `setState` of `Component`. Now the arguments are: `setState(newState, extend = true, forceUpdate = false, forceUpdateTimeout?, forceRenderTimeout?)`.

- On `Effect` mount & unmount callbacks:

- - Flipped the optional mount callback args the other way around: `(prevMem, newMem)` to `(newMem, prevMem)`. This makes it more convenient to use the new memory, which is what you typically want. The functionality also resembles `DataPicker` more this way. However on unmount the order is like it was, but arguments named better: `(currentMem, nextMem)`.
  - Also simplified the third parameter in the unmount callback - now it's called `cancelled` and type is `boolean`: `(currentMem, nextMem, cancelled)`.
  - Added a new argument to `cancel` method (as the second argument): `clearMemory: boolean = false`.
  - Clarified the timing, so that first old unmount is run, then memory changed, then new mount is run (before the memory was changed first).
  - Clarified that `memory` member can also be `undefined`, as this is true in some cases.

- Removed the `Host` setting `reusingSiblingTags`. Its implementational meaning was not actually what was intended - and implementing a feature to not reuse tags is really not that useful (at all).

- Converted the class for `ComponentWrapper` into a simple interface for typing, as it was not supposed to be used as without creating a new class for each new component - now `ComponentWrapper` only refers to the interface. Note that the important part is the static part: `ComponentWrapperType` interface and the `WrapperAPI` instance attached.

- Some minor changes in the internal classes.
