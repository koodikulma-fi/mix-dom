# CHANGES

## v4.0.0

### Splitted library to `mix-dom` + `data-signals` + `mixin-types`
The `mix-dom` library now uses `data-signals` and `mixin-types` (also used by `data-signals`) to provide non-rendering related core features.
- The [mixin-types](https://www.npmjs.com/package/mixin-types) is simply used (in typing) by `data-signals` for the mixin base classes and joining them together for `Context` and `ContextAPI`.
  - At `mix-dom` layer, `mixin-types` is used in similar sense for the `Component` class - to allow creating component mixins easily.
  - The `mixin-types` library is a tiny typing library (with 2 tiny JS methods), and mostly consists of docs for guidelines and rules of thumb when using mixins.
- The [data-signals](https://www.npmjs.com/package/data-signals) library in turn contains many of the base classes and mixins that were previously in `mix-dom`:
  - The classes for `Context` and `ContextAPI` (and a new `RefreshCycle` used by `Context` and `HostServices`).
  - The mixin bases for `SignalBoy`, `SignalMan`, `DataBoy` and `DataMan`.
  - In addition, the purely data related core methods, like `areEqual` and `deepCopy`, now come from `data-signals`.
    * Accordingly the enum and type for `MixDOMCompareDepth` is now found as `CompareDataDepthEnum` and `CompareDataDepthMode` from `data-signals`.
    * The library also provides a few numeric array helpers previously available from `mix-dom` (with slightly different names): eg. `numberRange` and `cleanIndex`.
  - Finally, the data related helpers like `Memo` and `DataPicker` now come from `data-signals` with renames and/or reconceptualizations:
    - The old `Memo` concept is now `createDataTrigger` function, while `createDataMemo` is a new feature closer to React's useMemo (without the hook restrictions).
    - The old `createDataSelector` alternative is dropped and there is just `createDataSource` (used to be called `createDataPicker`).
    - In addition, there is a new `createCachedSource` method to help reuse the same data source for different source sets of data.
  - The classes and mixins themselves are essentially the same, but have enhancements in usage.
    - Functional changes:
      - One small change is that setting sub data automatically updates the parenting data dictionaries up to the root (performed from root down). This relfects what gets called for refresh.
      - Another change is that the extend argument defaults to `true` in all `setData`, `setInData` cases - but with a JS side support to check if should actually extend or just replace a value.
    - Tiny changes in related to data listening:
      - The fallback arguments in data listening (and getting) are already supported at the level of `Context`s, not just `ContextAPI`s.
      - In `ContextAPI` (and `Context`), there's never `null` fallback (for cases when context wasn't found), just `undefined` or custom.
      - There's also a new mode for listening to data by a _dictionary_ (in `Context` and `ContextAPI`): keys are dotted data keys, and values fallbacks.
    - Other minor changes:
      - There is some clean ups in relation to public and private methods in the classes and mixins of `data-signals`.
      - And some renaming in special features, or moving them to the static side (to not clutter public instance side API).

### Major changes
- The `ComponentStream` has been renamed to `ComponentRemote` (to avoid confusing connotations) and its usage diversified:
  - The concept of overriding a stream (by importance) is replaced by _allowing multiple streams_ to co-exist and land at the target.
    - Only once the source disconnects, that particular remote stream ends. (Or if the inserter unmounts the remote insertion pass.)
  - The reason is that the feature is simply so much more useful in practice this way.
    - As you rarely want to "cut" the other stream, and if you do, you can do it by external state managing.
  - In addition, new features are unlocked as you can now pick your remote feeds using typed props fed to the Remote source when feeding it.
    - Accordingly there are some new content insertion methods available at ComponentRemote static side.
      - For example: `.filterContent`, `.wrapContent` and `.renderContent` methods that are alternative ways to insert the content (with increasing level of customization).
    - And on the instance side (= an active remote source), each remote has its own unique content pass.
      - The content pass can be accessed through `remote.Content`, and has the usual content passing methods available.
      - The static side still has `Remote.Content` pass member, but it's actually a def for a component to render all feeds - not a real content pass.
      - Both sides (instanced and static) provide `WithContent` component and the common `ContentCopy`, `contentCopy`, `hasContent` and such.
  - Internally, this makes the feature more powerful while simplifies its core functionality (= less code needed).

### Minor changes / enhancements
- In Component class:
  - The `createWired` method has been dropped - so now it's only available as a static method (or eg. `MixDOM.createWired`).
    - Instead there is `addWired` and `removeWired` methods on the `Component` class that expect an already created wired class as the 1st arg.
    - This makes it easier to manage the wired hookups externally, while internally gets rid of the only cyclical JS import in source code.
  - Simplified component timers methods (from 5 methods to 3 methods) to not clutter the Component public instance API.
- Some types have been renamed, some types dropped and many complex types have been internally rewritten (to be cleaner and simpler).
  - Enhances typing and JS implementation of some special attributes.
  - There is now three sets of JSX declarations available.
    - JSX types:
      1. `JSX_camelCase`: that only supports _camelCase_ attributes for listeners, eg. `<div onClick={clickHandler}/>`.
      2. `JSX_lowercase`: that only supports _lowercase_ attributes for listeners, eg. `<div onclick={clickHandler}/>`.
      3. `JSX_mixedCase`: that combines `JSX_lowercase` and `JSX_camelCase` together. How things were earlier: `<div onclick={clickHandler} onClick={clickHandler} />`.
    - Recommendations:
      - For clarity, it's recommended to use `JSX_camelCase` (for most cases) or `JSX_lowercase` (for a more native DOM feel).
      - The JS side supports both in any case. The point is simply to help make typing suggestions cleaner.
      - Note that the `HTMLAttributes`, `SVGAttributes` and `DOMAttributes` types use camelCase, but have variants ending with `_lowercase` and `_mixedCase`.
    - Example:
```typescript
// Import.
import { JSX_camelCase } from "mix-dom";
// Declare this once in a TS file refered to in tsconfig.json ("include" part).
declare global {
  namespace JSX {
	  interface IntrinsicElements extends JSX_camelCase.IntrinsicElements {}
		interface IntrinsicAttributes extends JSX_camelCase.IntrinsicAttributes {}
	}
}
```

### Tiny refines / fixes
- Tiny refines in relation to content passing special cases in very specific circumstances.
- Fixing a special case in relation to parsing style from string (to only split by the first ":", not any further).

### Related libraries coming later (likely in late 2024)
- `data-signals-debug` to allow viewing `Context` signals & data changes in a UI in another window. (Rendered with MixDOM.)
- `mix-dom-debug` that extends `data-signals-debug` with the viewer for the `groundedTree` (of MixDOMTreeNodes) of connected `Host` instances.
