# MixDOM - dev notes

## v4 - TODO

### CODES / TYPING
- COMPONENT MIXINS:
  * Refactor COMPONENT MIXIN usage base, according to "mixin-types" approach.
  * VERIFY THAT DIDN'T ACCIDENTLLAY MSS UP COMPONEN TMIXINS.. TYPING..
    - Is the idea (Base) => Extends ... Or is it .. more like => RENDEROUTPUT..?

### DOCS

- UPDATE DOCS...!!!

### LATER

- Add SANDBOX
  - Info: https://codesandbox.io/docs/learn/getting-started/your-first-sandbox


## v4 - DONE RECENTLY

### DONE: CASES THAT DON'T SEEM TO EXIST ANYMORE:
- DONE?: `MixDOM.def("span", { "style": { colorFAIL: "#aac" } });` <-- colorFAIL won't fail.
  - <-- Actually it now fails, at least when using TSX. Which is the important one.
  - <-- Maybe it was due to the sub-imports or type deep conflicts, in testing..? (Possible.)
- DONE?: Refine that eg. `{ width, height, left, right }` as numbers get "px" on JS side.
  - They only get it in some situations. Eg. in mixdom docs could do { width: 5 } on JS side, but on another not..!
  - Also refine / verify typing all around this + maybe extra comments about number -> "px".
  - <-- Simply, it seems to work in Chrome and FF. No problem at all. Even on string: style="width:5" works in both. It goes down to style.setProperty.

### DONE: FIXED
- DONE: Discrepancy in DICTIONARY vs. STRING format for STYLE:
  - TYPESCRIPT: Not systematic that "background-image" not okay key in dictionary form.
    - <-- It's correct, it should be "backgroundImage".
  - JAVASCRIPT: In styles, could not use _string format_ to define background-image with url. It just cut all after "https". Could use it in _dictionary form_.
    - <-- Fixed in parseStyle.
- DONE: ATTRIBUTE related refines:
  - Listeners: In relation to "onclick" vs. "onClick".
    - <-- Solve it by allowing to select JSX or JSX_lowercase or JSX_camelCase. When declares the globals..!
  - SVG ATTRIBUTES typing.
    - Not detailed here, but there were some problems, it seems.
    - ... Don't remember where it was.. something very recent... or older..?
    - <-- Did some refines. If needs more specific, needs more details.
  - Verified typing for ease of use for DOMAttributes: HTMLAttributes & SVGAttributes. That is sensible.

