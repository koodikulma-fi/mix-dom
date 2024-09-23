## Note

This repo is for developing v4. Work in progress.

Current state:
- Finishing new REMOTE.
    * Just one case with TWO DIFFERENT HOSTS:
        - The first host won't refresh initially when the 2nd host adds to remote synchronously (on first run).
        - Otherwise seems to work in all sorts of cases..!
    * Verify the new special methods: filterContent, wrapContent, renderContent.
- Note. Tried changing Routines to static classes from direct export functions but fattened the MixDOM.module.js size from 61.4KB to 64.0KB. Changed back.

## QUICK TODO
- Refactor COMPONENT MIXIN usage base, according to "mixin-types" approach.
- The TYPE refines and FIXES.

## MixDOM

MixDOM is a state based DOM rendering library for JavaScript/TypeScript. It provides a flexible framework for building user interfaces all the way up to complex application with several laterally interrelated parts - using contexts with their data and signals from "data-signals". Get the most out of MixDOM by using a JSX compiler and TypeScript.

## Documentation

See docs, examples and more at: [mixdomjs.org](https://mixdomjs.org)

## NPM

The npm package can be found with: [mix-dom](https://www.npmjs.com/package/mix-dom)

## GitHub

Contribute in GitHub: [mixdomjs/mixdom.git](https://github.com/mixdomjs/mixdom.git)
