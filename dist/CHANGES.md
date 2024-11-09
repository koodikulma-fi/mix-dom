# CHANGES

---

## v4.2.1 (2024-11-??)

### TO-DO:
- fix in RENDER MULTI FLUSH PROCESSING:
  * Fix handling of didMount signal in cases with multiple timed out render flushes (when using non-null renderTimeout), that contain elements that should be unmounted but haven't yet been mounted.
- fix in RENDER DOM HANDLING:
  * Fix the case of swapping between htmlDef and regular. Does not seem to work correctly - gets emptied.
- fix in UNMOUNTING:
  * Fix some PORTAL case where wasn't properly removed (related to MixDOM.WithContent).
- Changes:
  * Change REF typing to COMPONENT INSTANCE..!
  * Support feeding in NAME in mixing methods..!

### TO-DOCS:
- That added the `MixDOM.ref()`.


### Refined default settings

- Changed default render timeout to `null`, as it provides a bit more expectable behaviour in certain special cases.

### Refined behaviour of wired buildProps

- Dropped the special feature of not-updating wired component instances if the build props are identical to last run.
  - The feature was a bit surprising in practice, and partially redundant as can just define a component instead of a spread and control its updates, if needed.

### Tiny fixes

- Fixed handling of didMount signal in cases with multiple timed out render flushes (when using non-null renderTimeout), that contain elements that should be unmounted but haven't yet been mounted.
- Fixed that lastState is always cleared at the end of the update.
- Fixed args in shouldUpdate signal.

### Refined typing

- Changed the default typing (= without type args) in `Component`, `ComponentFunc` and such to `ComponentInfoAny`, which in turn has been converted to a partial interface.
- Refined `ComponentInstance` type to use `ComponentWith` type.

---

## v4.2.0 (2024-11-01)

### Added optional 2nd arg to `component.setState(state, extend = true)`

- The argument `extend` defaults to `true`, which results in extending the original state.
- By setting it to `false`, the feature allows to replace the whole state (with a shallow copy of the newState).

### Enhanced typing

- Enhanced `MixDOMProps` and `MixDOMPreProps` to suggest the known `DOMTags` while allowing any string input.
- Refined `MixDOMComponentTags` type and `newDef` method typing to be a bit looser.

### Internal and dependency refines

- Adjusted to `data-signals` v1.2.0 (and `mixin-types` v1.1.1).
  - Accordingly, optimized `HostContextAPI`s to use the new `inheritedContexts` flow (for sharing to `ComponentContextAPI`s).
  - The `"dataSetMode"` in `ContextSettings` has been renamed to `"dataMode"`, its default changed to `"immutable"` and modes renamed: `"immutable"` (earlier `"root"`), `"mutable"` (`"leaf"`) and `"existing"` (`"only"`).

---

## v4.1.1 (2024-10-16)

### Enhanced typing support

- Added support to automatically declare the global JSX namespace using imports `"mix-dom/native"` and `"mix-dom/camelCase"`.
  - So instead of manually declaring JSX namespace once (`declare global { namespace JSX { ... } }`), use one of the sub imports likewise once (per tsconfig.json).
  - This reflects importing from `"dom-types"` (v1.1): `import { HTMLAttributes } from "dom-types/camelCase"`.
- Accordingly refines the typing support in the def methods and couple of related helper types.
  - Added `nativeDef` and `camelCaseDef` aliases for `newDef`, which in turn uses the default "mixedCase" typing.
  - Added type arg to `newHTMLDef<DOMCase>(...)` method: `"native" | "camelCase" | "mixedCase" = "mixedCase"`.
  - Added 2nd type arg to `MixDOMProps<Tag, DOMCase>`, `MixDOMPreProps<Tag, DOMCase>` and `PseudoElementProps<Tag, DOMCase>`.

---

## v4.1.0 (2024-10-13)

### Minor JS changes
- In MixDOM.global.js renamed "DomTypes" global property to "DOMTypes".

### Added type support for `{ static }` component info
- The static info is supported for both: classes and functions, and it also works for the component mixing methods.
- Accordingly added to `MixDOM.component` and `MixDOM.componentCtx` shortcuts support for receiving a dictionary of static properties to add to a component function (as an optional 2nd arg), and likewise `MixDOM.shadow` and `MixDOM.shadowCtx`.
- Note that for component funcs, this ultimately results in creating a custom component class (before mounting) and adding the static properties to it. So they are available both: through `component.constructor` and directly on the function.

### Added type helpers for component funcs with generic args
- Now can use `ComponentWith<Info>`, `ComponentCtxWith<Info>`, `ComponentProps<Info>`, `ComponentFuncArgs<Info>`, `ComponentFuncCtxArgs<Info>` and `ComponentFuncReturn<Info>` type helpers.
- Always use `ComponentProps<Info>` type for manually typing a component func or class for its initial props (1st arg in constructor).
- Example for a functional component with generic args:
  - ```typescript 
      // Imports.
      import {
        MixDOM,
        ComponentProps,
        ComponentWith,
        ComponentFuncReturn,
        ComponentCtxFuncArgs
      } from "mix-dom";

      // Info interface with generic args.
      interface MyItemInfo<Id extends number | string = any> {
        props: { id: Id; };
        state: { lastId: Id | null; }
      }

      // Component func with generic args.
      // .. The 2nd arg could also be Component<MyItemInfo<Id>>.
      // .. However using ComponentWith enforces the "class" and "static" sides on the type.
      const MyItem = <Id extends number | string = any> (
        _props: ComponentProps<MyItemInfo<Id>>,
        component: ComponentWith<MyItemInfo<Id>>
      ): ComponentFuncReturn<MyItemInfo> => {
        // Do some inits - just to showcase.
        component.state = { lastId: null };
        // Use ComponentFuncReturn<Info> for the render to type (props, state) and the return.
        return (props, state) => { return <div class="my-item"></div>; }
      };

      // Alternative with prepared args (and return typed later), and using contextAPI.
      const MyItemAlt = <Id extends number | string = any, Args extends any[] =
        // On JS side should always define args one by one, not as ...args, as it affects func.length.
        ComponentCtxFuncArgs<MyItemInfo<Id>>> (_props: Args[0], component: Args[1], cApi: Args[2]) =>
      {
        // Otherwise the same + can use cApi.
        component.state = { lastId: null };
        // Let's type the return here for this example.
        return (
          (props, state) => { return <div class="my-item"></div>; }
        ) as ComponentFuncReturn<MyItemInfo<Id>>;
      };

      // Test usage from outside.
      const TestGenerics = () => <MyItem<number> id={5} />;			// Requires number id.
      const TestGenericsAlt = () => <MyItemAlt<string> id="test" />; 	// Requires string id.
    ```

### Cleaned up typing
- Refined typing for `newDef` method (for non-TSX use), and refined `ReadComponentInfo` to be more robust.
- Removed some types, made some internal (= not exported) and renamed a couple of public.
- In relation to the Component related definitions:
  - Changed the order of the `ComponentOf`, `ComponentTypeOf` and `ComponentFuncOf` type args to: `[Props, State, Signals, Class, Static, Timers, Contexts]`.
  - Renamed `ComponentContextApiType` to `ComponentContextAPIType` (with capital "API").
  - Renamed `ComponentFuncCtx` to `ComponentCtxFunc` (to be more consistent).
- The new tag related types are:
  - `MixDOMTags` for DOM tags. The special `"_"` tag refers to PseudoElement (used internally), while `""` to text nodes.
  - `MixDOMComponentTags` for the class and functional component tags. This includes `MixDOMPseudoTags`.
  - `MixDOMAnyTags` for any valid tags.
- The types related to props:
  - `MixDOMProps` for DOM properties _without_ internal special props.
  - `MixDOMPreProps` like `MixDOMProps` but also includes the special props: `_disable`, `_key`, `_ref`, `_signals`.
  - `SpreadFuncProps<Props>` refers to props for spread functions including their internal special props: `_disable` and `_key`.
    - However, the types for `_key` and `_disabled` are anyway supported through the intrinsic attributes / newDef method.
  -  `ComponentProps<Info>` refers to the initial props for component funcs and classes and includes all special props: `_disable`, `_key`, `_ref`, `_signals` and `_contexts`.
    - If ever needing to define the initProps specifically (or use the constructor), then should use `ComponentProps<Info>`.
    - Note that the special props are never present on the JS side (nor in the render method props) - they are for TSX only.

---

## v4.0.0 (2024-10-11)

### Splitted library to 5 modules

- The `mix-dom` library is now dependent on the `mixin-types`, `data-signals`, `data-memo` and `dom-types` libraries.
  - `dom-types` provides typing for DOM and JS helpers especially suited for state based rendering flow.
  - `mixin-types` provides typing for class mixin related features (used by Component and `data-signals`).
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
  - The earlier enum `MixDOMCompareDepth` is now `CompareDepthEnum` and type `CompareDepthMode`.
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
      - For example: `.filterContent`, `.wrapContent` and `.renderContents` methods that are alternative ways to insert the content (with increasing level of customization).
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
  - The `_lastState` member has been renamed to `lastState`.
  - Typing for `mixinComponent` function has been changed to reflect the principles in `mixin-types` module.

- In `MixDOM` shortcut object:

  - The shortcuts referring to ContextAPI has now "Ctx" ending (not "With"): `MixDOM.componentCtx` and `MixDOM.shadowCtx`.
  - Some methods are now found from sub modules instead, like `MixDOM.range` -> `numberRange` from `data-memo`.
  - Removed the "newHost", "newRef", "newContext" and "newContexts" shortcuts.

- Type changes and JSX declarations:

  - Some types have been renamed, some dropped and many complex internally rewritten (to be cleaner and simpler).

  - There is now three sets of JSX declarations available (originally coming from `"dom-types"` module).

    1. `JSX_native`: only supports _native_ attributes, eg. `<div onclick={clickHandler}/>`.
    2. `JSX_camelCase`: only supports _camelCase_ attributes, eg. `<div onClick={clickHandler}/>`.
    3. `JSX_mixedCase`: combines `JSX_native` and `JSX_camelCase` together: `<div onclick={clickHandler} onClick={clickHandler}/>`.

  - Recommendations:

    - It's recommended to use either `JSX_camelCase` (for most cases) or `JSX_native` (for a more native DOM feel).
    - The JS side supports both in any case. The point is simply to help make typing suggestions cleaner.
    - The `HTMLAttributes`, `SVGAttributes` and `DOMAttributes` use camelCase but have variants for `_native`.

  - Example:

    - ```typescript
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
