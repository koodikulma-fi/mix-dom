## v4.0.0 

### Splitted library to 5 modules

- The `mix-dom` library is now dependent on the `mixin-types`, `data-signals`, `data-memo` and `dom-types` libraries.
  - `dom-types` provides typing for DOM and JS helpers especially suited for state based rendering flow.
  - `mixin-types` provides typing for class mixin related features (used by Component).
  - `data-signals` provides the signal and data listening mixins (for Component and Ref) and classes: `Context` and `ContextAPI`.
  - `data-memo` provides shallow comparison and data-reuse helpers, also useful for external use.

### Features moved

- Accordingly some of the public features have moved to the sub modules and might be renamed or slightly different from v3.
- `dom-types` contains:
  - For external use the `classNames` and `cleanNames` methods.
  - Many DOM related JS features and the JSX typing are used internally by MixDOM.
- `mixin-types` contains:
  - Typing related to mixins used by `data-signals` but also by MixDOM for `mixinComponent` method.
  - Two JS methods to combine mixins (with typing support): `mixins` and `mixinsWith`.
- `data-signals` contains:
  - The classes for `Context` and `ContextAPI`, and mixin bases for `SignalBoy`, `SignalMan`, `DataBoy` and `DataMan`.
  - Functional changes:
    - The new `dataSetMode` setting in Context settings controls whether automatically shallow copies parenting data dictionaries from the root down when setting deep data. By default, does not copy.
    - The extend argument defaults to `true` in all `setData`, `setInData` methods and cases - but with a JS side support to check if should actually extend or just replace a value.
  - Tiny changes in related to data listening:
    - The fallback arguments in data listening (and getting) are already supported at `Context`s, not just `ContextAPI`s.
    - In `ContextAPI` (and `Context`), there's never `null` fallback (for when context is not found), just `undefined` or custom.
    - Can also listen by a _dictionary_ (in `Context` and `ContextAPI`): keys are dotted data keys, and values fallbacks.
  - Other minor changes:
    - There is some clean ups in relation to public and private methods in the classes and mixins of `data-signals`.
    - And some renaming in special features, or moving them to the static side (to not clutter public instance side API).
- `data-memo` contains:
  - The deep data (`areEqual` and `deepCopy`) and numeric array helpers (like `numberRange` and `cleanIndex`).
  - The earlier enum `MixDOMCompareDepth` is now `CompareDataDepthEnum` and type `CompareDataDepthMode`.
  - The data reuse helpers like `Memo` and `DataPicker` are also moved here and reconceptualized:
    - The earlier `Memo` concept is now `createDataTrigger` function.
    - The `createDataMemo` is a new feature closer to React's useMemo (without the hook restrictions).
    - The earlier `createDataSelector` alternative is dropped. Instead use `createDataSource` (earlier `createDataPicker`).
    - In addition, new `createCachedSource` method helps to reuse the same data source for different source data sets.

### Major changes

- The `ComponentStream` has been renamed to `ComponentRemote` (to avoid confusing connotations) and its usage diversified:
  - The concept of *overriding a stream* (by importance) is replaced by *multiple co-existing streams*.
    - A remote stream ends only once the source disconnects (or if the remote insertion pass is unmounted).
  - This also unlocks new features as you can pick the remote feeds using typed props fed to the Remote source.
    - Accordingly there are some new content insertion methods available at ComponentRemote static side.
      - For example: `.filterContent`, `.wrapContent` and `.renderContent` methods that are alternative ways to insert the content (with increasing level of customization).
    - On the instance side (= an active remote source), each remote has its own unique content pass.
      - The content pass can be accessed through `remote.Content`, and has the usual content methods available.
      - The static side still has `Remote.Content` pass member, but it's actually a def for a component to render all feeds - not a real content pass.
      - Both sides (instanced and static) provide `WithContent` component and the common `ContentCopy`, `contentCopy`, `hasContent` and such methods.
  - Internally the change makes the feature more powerful while simplifies its core functionality (= less core code needed).
- Renamed the earlier `rehydrate` concept to `reassimilate`, while adding new `remount` and `remountWith` methods.
  - The `remount` method has similar args to `reassimilate` but remounts the app root while assimilating new DOM structure.
    - The `remountWith` method is equivalent to React's `hydrateRoot` (though with the first 2 args in flipped order).
  - The somewhat related `readAsString` method has been renamed to `readDOMString` (to emphasize what is read).

### Minor changes, enhancements & renames

- In `Component` class:

  - The `createWired` method has been dropped - it's only available as a static function (`createWired` or `MixDOM.wired`).
    - The component now has `addWired` and `removeWired` methods that expect a wired class (as the 1st arg).
    - This makes it easier to manage the wired hookups externally (and internally drops the only cyclical JS import in source code).
  - Simplified component timers methods (from 5 methods to 3 methods) to not clutter the Component public instance API.
  - Typing for `mixinComponent` function has been changed to reflect the principles in `mixin-types` module.
  - Renamed the component mixing related methods starting with "mixComponent" to just "mix" (to systemize and shorten naming), eg. `mixComponentClassFuncsWith` is now `mixClassFuncsWith`.

- In `MixDOM` shortcut object

  - The shortcuts referring to ContextAPI has now "Ctx" ending (not "With"): `MixDOM.componentCtx` and `MixDOM.shadowCtx`.
  - Some methods are now found from sub modules instead, like `MixDOM.range` -> `numberRange` from `data-memo`.

- Type changes and JSX declarations:

  - Some types have been renamed, some dropped and many complex internally rewritten (to be cleaner and simpler).

  - There is now three sets of JSX declarations available.

    1. `JSX_native`: only supports _native_ attributes, eg. `<div onclick={clickHandler}/>`.
    2. `JSX_camelCase`: only supports _camelCase_ attributes, eg. `<div onClick={clickHandler}/>`.
    3. `JSX_mixedCase`: combines `JSX_native` and `JSX_camelCase` together: `<div onclick={clickHandler} onClick={clickHandler}/>`.

  - Recommendations:

    - It's recommended to use either `JSX_camelCase` (for most cases) or `JSX_native` (for a more native DOM feel).
    - The JS side supports both in any case. The point is simply to help make typing suggestions cleaner.
    - The `HTMLAttributes`, `SVGAttributes` and `DOMAttributes` use camelCase but have variants for `_native`.

  - Example:

    - ```
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

### Tiny fixes & refines

- Tiny refines in relation to content passing special cases in very specific circumstances.
- Fixing a special case in relation to parsing style from string (to only split by the first ":", not any further).

### Related libraries coming later

- `data-signals-debug` to allow viewing `Context` signals & data changes in a UI in another window. (Rendered with MixDOM.)
- `mix-dom-debug` that extends `data-signals-debug` with the viewer for the `groundedTree` of connected `Host` instances.
