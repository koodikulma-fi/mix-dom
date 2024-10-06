
// rollup.config.js
//
// See terser options here: https://github.com/terser/terser#minify-options

import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';
// import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';

// const devMode = (process.env.NODE_ENV === 'development');
// console.log(`${ devMode ? 'development' : 'production' } mode bundle`);

export default [

    // - Declarations (+ delete dts folder) - //

    {
        input: 'dist/dts/index.d.ts',
        output: {
          file: 'dist/MixDOM.d.ts',
          format: 'es',
        },
        plugins: [
            dts(),
            del({ targets: 'dist/dts*', hook: 'buildEnd' }),
        ],
    },

    // - ES Module - //

    {
        // external: ['mixin-types', 'data-signals', 'data-memo', 'dom-types],
        input: 'dist/modules/index.js',
        output: {
            file: 'dist/MixDOM.module.js',
            format: 'es',
        },
        plugins: [
            terser({
                ecma: 2015,
                mangle: {
                    // module: true,
                    keep_fnames: true,
                    keep_classnames: true,
                },
                compress: {
                    module: true,
                    keep_fnames: true,
                    keep_fargs: true,
                    keep_classnames: true,
                    // unsafe_arrows: true,
                },
                output: { quote_style: 1 }
            }),
        ],
    },


    // - CJS - //

    {
        // external: ['mixin-types', 'data-signals', 'data-memo', 'dom-types],
        input: 'dist/modules/index.cjs.js',
        output: {
            file: 'dist/MixDOM.js',
            format: 'cjs',
            exports: "auto"
        },
        plugins: [
            terser({
                ecma: 2015,
                mangle: {
                    // module: true,
                    keep_fnames: true,
                    keep_classnames: true,
                },
                compress: {
                    module: true,
                    keep_fnames: true,
                    keep_fargs: true,
                    keep_classnames: true,
                    // unsafe_arrows: true,
                },
                output: { quote_style: 1 }
            }),
            del({ targets: 'dist/modules*', hook: 'buildEnd' })
        ],
    },


    // - Global (= window.MixDom) - //

    {
        input: 'dist/global/index.global.js',
        output: {
          file: 'dist/MixDOM.global.js',
          format: 'cjs',
        },
        plugins: [
            resolve(),
            terser({
                ecma: 2015,
                enclose: true,
                mangle: {
                    // module: true,
                    keep_fnames: true,
                    keep_classnames: true,
                },
                compress: {
                    module: true,
                    keep_fnames: true,
                    keep_fargs: true,
                    keep_classnames: true,
                    // unsafe_arrows: true,
                },

                // // mangle: false,
                // // sourceMap: true,
                // enclose: true,
                // compress: {
                //     module: true,
                //     toplevel: true,
                //     unsafe_arrows: true,
                //     drop_debugger: true
                //     // drop_console: !devMode,
                //     // drop_debugger: !devMode
                // },
                output: { quote_style: 1 },
            }),


            // - Delete - //

            del({ targets: 'dist/global*', hook: 'buildEnd' })

        ]
    },


    // // - Copy & delete - //
    //
    // // Copy for direct es module use (cannot use .mjs, instead the d.ts and .js must have same path).
    // {
    //     input: 'dist/MixDOM.module.js',
    //     plugins: [
    //         // copy({ targets: [ { src: 'dist/MixDOM.d.ts', dest: 'dist', rename: 'MixDOM.module.d.ts' } ] }),
    //         // copy({ targets: [ { src: 'dist/MixDOM.mjs', dest: 'dist', rename: 'MixDOM.module.js' } ] }),
    //         del({ targets: 'dist/modules*', hook: 'buildEnd' })
    //     ]
    // },

    

    // // - - - JSX RUNTIME - - - //

    // // - ES Module - //

    // {
    //     input: 'jsx-runtime/src/index.js',
    //     output: {
    //         file: 'jsx-runtime/dist/jsxRuntime.mjs',
    //         format: 'es',
    //     },
    //     plugins: [
    //         terser({
    //             ecma: 2015,
    //             // sourceMap: true,
    //             compress: {
    //                 module: true,
    //                 toplevel: true,
    //                 unsafe_arrows: true,
    //                 drop_debugger: true
    //                 // drop_console: !devMode,
    //                 // drop_debugger: !devMode
    //             },
    //             output: { quote_style: 1 }
    //         }),
    //     ],
    // },

    // // - CJS - //

    // {
    //     input: 'jsx-runtime/src/index.js',
    //     output: {
    //         file: 'jsx-runtime/dist/jsxRuntime.js',
    //         format: 'cjs',
    //         exports: "auto"
    //     },
    //     plugins: [
    //         terser({
    //             ecma: 2015,
    //             // sourceMap: true,
    //             compress: {
    //                 // toplevel: true,
    //                 module: true,
    //                 unsafe_arrows: true,
    //                 drop_debugger: true
    //                 // drop_console: !devMode,
    //                 // drop_debugger: !devMode
    //             },
    //             output: { quote_style: 1 }
    //         }),
    //     ],
    // },

    // // - Copy - //

    // // Copy for direct es module use (cannot use .mjs, instead the d.ts and .js must have same path).
    // {
    //     input: 'jsx-runtime/dist/jsxRuntime.mjs',
    //     plugins: [
    //         copy({ targets: [ { src: 'jsx-runtime/dist/jsxRuntime.d.ts', dest: 'dist', rename: 'jsxRuntime.module.d.ts' } ] }),
    //         copy({ targets: [ { src: 'jsx-runtime/dist/jsxRuntime.mjs', dest: 'dist', rename: 'jsxRuntime.module.js' } ] }),
    //     ]
    // },

];
