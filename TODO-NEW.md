# MixDOM - dev notes

---

## v4

### Main changes
- Externalized `data-signals` out of `mix-dom` to its own npm package and added as dependency for MixDOM.
  * All the data related features now come from data-signals.
    - Classes and mixins: SignalMan, DataMan, Context, ContextAPI.
      * One tiny change is that the extend argument defaults to true in all setData, setInData cases but supports checking if applicable on JS side.
    - Data helpers: MEMO/TRIGGER/SOURCE features. There's a few renames:
      * What was Memo class is done through "createDataTrigger".
      * Instead the Memo from data-signals is similar to the memo concept in React.
      * What was createDataPicker is "createDataSource" and the "selector" variant is dropped.
      * There's also "createCachedSource" in the same sense.
    - Data tools: areEqual and deepCopy.
  * Refines in data listening:
    - The fallback args are already supported at the level of contexts, not just contextAPIs.
    - Also in ContextAPI (and Context), there's never "null" fallback (for cases when context wasn't fuond), just undefined or custom.
    - There's also a new mode for listening to data by a dictionary: keys are dotted data keys, values are fallbacks. In Context and ContextAPI.
- Refined and cleaned up typing (and JS).
  * Reorganied typing in relation to component mixing and extending.
  * Tiny fixes and refines in relation dom style and attributes.
- Reorganized and renamed STREAM to REMOTE.
  * The new name is to avoid connotations with the word "stream" or "streaming" in web context.
    - Also, ComponentRemote describes the feature just as well: it's a component that inputs/outputs content distantly.
  * The feature is also reorganized.
    - Changed from "overriding a stream" (by importance) to simply _allowing multiple streams_ to co-exist and land at the target.
      * Only once the source disconnects, that particular remote stream ends. (Or the inserter unmounts the stream insertion point.)
    - The reason is that the feature is simply so much more useful in practice this way.
      * As you rarely want to "cut" the other stream, and if you do, you can do it by external state managing.
- Cleanups and refines:
  * Simplified component timers methods (from 5 methods to 3 methods).
- Coming later:
  - TODO: `data-signals-debug` to allow viewing Context signals & data changes in a UI in another window. (Rendered with MixDOM.)
  - TODO: `mix-dom-debug` that extends `data-signals-debug `with the viewer for the "grounded tree" (of MixDOMTreeNodes).
- Note. Tried changing Routines to static classes from direct export functions but fattened the MixDOM.module.js size from 61.4KB to 64.0KB. Changed back.

### CASES THAT DON'T SEEM TO EXIST ANYMORE:
- DONE?: `MixDOM.def("span", { "style": { colorFAIL: "#aac" } });` <-- colorFAIL won't fail.
  * <-- Maybe it was due to the sub-imports or type deep conflicts..?
- DONE?: Refine that eg. { width, height, left, right } as numbers get "px" on JS side.
  * They only get it in some situations. Eg. in mixdom docs could do { width: 5 } on JS side, but on another not..!
  * Also refine / verify typing all around this + maybe extra comments about number -> "px".

### FIXED
- DONE: Discrepancy in DICTIONARY vs. STRING format for STYLE:
  * TYPESCRIPT: Not systematic that "background-image" not okay key in dictionary form.
    - <-- It's correct, it should be "backgroundImage".
  * JAVASCRIPT: In styles, could not use _string format_ to define background-image with url. It just cut all after "https". Could use it in _dictionary form_.
    - <-- Fixed in parseStyle.

### TODO  

* ATTRIBUTE related refines:
  - TODO: In relation to "onclick" vs. "onClick".
    * <-- Solve it by allowing to select JSX or JSX_lowercase or JSX_camelCase. When declares the globals..!
  - TODO: SVG ATTRIBUTES typing.
    * Not detailed here, but there were some problems, it seems.
    * ... Don't remember where it was.. something very recent... or older..?
- VERIFY typing for ease of use for DOMAttributes: HTMLAttributes & SVGAttributes. That is sensible.

- Refactor COMPONENT MIXIN usage base, according to "mixin-types" approach.
- VERIFY THAT DIDN'T ACCIDENTLLAY MSS UP COMPONEN TMIXINS.. TYPING..
  - Is teh idea (Base) => Extends ... Or is it .. more like => RENDEROUTPUT..?


---

## v3.2

DONE:

- Renamed Effect class to Memo. Functionally, it's somewhere in between the two React terms, but Memo is more descriptive - as it memorizes the last args and runs if they have changed.
- Provided `component._lastState` which is the state during last render cycle. Only exists if state has changed.
- Provided `component.getLastState(): State`, which returns the state during last render call.
- Removed `extend = true` argument from `component.setState(partialState, extend, ...)`. Now always extends.
- Changed update related lifecycle signals for components to feature: `[prevProps, prevState]` instead of `[prevUpdates, nextUpdates]´`.

---

## V3.1


### TO VERIFY (small):

- Verify that shouldUpdate works.. Now with "first-true".
- VERIFY COMPONENT SIGNALS with _signals prop.
- Verify TYPING FOR mixComponentMixins with BASE CLASS. And mixin functionality.
- CONTENT PASSING:
  - VERIFY THAT CONTENT PASSING WITHOUT ANY TRUE PASS WORKS THE SAME STILL..!
    - Now removed the !truepass && envelope part from content closure. It's very likely unneeded.
    - Some earlier (unrelated) quick tests showed similar behaviour too... will get captured anyway..!

  - Verify CONTENT PASSING SPECIAL CASES again.. 
    - About nullify defs (for content pass only vs. for both). See the end of cleanUpBoundaryDefs..!
    - Verify the NESTED SPREAD flow with CONTENT insertion (true pass and copies).
      - --> Because now dropped inserting from flow to prevent that infinite loop. But maybe not 100% correct. <-- Verified logically it. It should be correct. It was in the comments said. And it looks like it in the implementation as well: the childDefs are added. And even the streaming case makes sense.
      - <-- So can re-run some old tests I guess..?
- STREAMING CASES:
  - Test EXTENRAL FEED by another uiHost.
  - Should be okay:
    - Verify support within SPREADS ..! <-- Also check the "spread-pass" and such..! scopeType..!
      - <-- I think this are all okay.. Spread doesn't handle them, but just passes them. The content pass of a stream is not processed there. So should be correct..!
    - Verify STREAM COMPLEX COPIES & PASSES. Should make no diff at all... Basic cases seem to work as expected. And even cyclical use and the infinite case is handled. And swapping seemed to work even nicely. .. Maybe tested even up stream swapping, but at least in same scope or below worked - so should conceptually speaking work up flow, too.
- HYDRATION:
  - The basic usage (upon mounting like). <-- Verified..! pause & resume.
  - The flexible usage: stealing from custom places.
  - The callback usage: using suggester to give custom elements.
- OTHERS:
  - VERIFY PORTALS.
    - there was a mixup in APPLY... case"portal" the other never run..!
    - <-- at least the 4 test cases in test.tsx seem to work fine...

## DOCS

### DOCS - TO DO - v3.1 (probably all done):

- Add note about origSetter(value) when mixing class with funcs..!
  - --> origSetter.call(comp, value);
  - Add to GOTCHAS..! when combining func with class..!
- Update the 1. CONTEXT, 2. CONTENT, 3. HOST DUPLICATION stuff.
- Also update the API changes (see CHANGES.md).


### LATER

- EXAMPLES.
  - Write one more EXAMPLE OF ITEMLIST.
    - One that uses CALLBACK WITH (component) ..! Instead of a callbacks object.
- Add SANDBOX
  - Info: https://codesandbox.io/docs/learn/getting-started/your-first-sandbox

