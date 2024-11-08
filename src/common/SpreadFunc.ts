
// - Imports - //

// Typing.
import type { MixDOMInternalBaseProps, MixDOMRenderOutput } from "../typing";


// - Helper types - //

/** Typing for a SpreadFunc: It's like a Component, except it's spread out immediately on the parent render scope when defined. */
export type SpreadFunc<Props extends Record<string, any> = {}> = (props: SpreadFuncProps & Props) => MixDOMRenderOutput;
/** Typing for a SpreadFunc with extra arguments. Note that it's important to define the JS side as (props, ...args) so that the func.length === 1. 
 * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
 */
export type SpreadFuncWith<Props extends Record<string, any> = {}, ExtraArgs extends any[] = any[]> = (props: SpreadFuncProps & Props, ...args: ExtraArgs) => MixDOMRenderOutput;
/** Check whether the type is a SpreadFunc.
 * ```
 * type TestSpreads = [
 * 
 *      // - Simple cases - //
 * 
 *      // Not a spread.
 *      IsSpreadFunc<Component>,                            // false
 *      IsSpreadFunc<typeof Component>,                     // false
 *      IsSpreadFunc<ComponentFunc>,                        // false
 *      IsSpreadFunc<(props: false) => null>,               // false
 *      // Is a spread.
 *      IsSpreadFunc<SpreadFunc>,                           // true
 *      IsSpreadFunc<() => null>,                           // true
 *      IsSpreadFunc<(props: {}) => null>,                  // true
 * 
 * 
 *      // - Complex cases - //
 * 
 *      // Not a spread.
 *      IsSpreadFunc<(props: {}, test: any) => null>,       // false
 *      IsSpreadFunc<(props: {}, test?: any) => null>,      // false
 *      IsSpreadFunc<(props?: {}, test?: any) => null>,     // false
 *      IsSpreadFunc<(props: {}, test: any, ...more: any[]) => null>,   // false
 *      IsSpreadFunc<(props?: {}, test?: any, ...more: any[]) => null>, // false
 *      // Is a spread.
 *      // .. Note that on the JS side the arguments length is 1.
 *      IsSpreadFunc<(props: {}, ...test: any[]) => null>,  // true
 * ];
 * ```
 */
export type IsSpreadFunc<Anything> =
    // Is spread function like.
    Anything extends (props?: Record<string, any>, ...args: any[]) => MixDOMRenderOutput ?
        // Verify that has only 0 or 1 args on the JS side (func.length).
        Parameters<Anything>["length"] extends 0 | 1 ? true :
        // If is using spread args, allow - we've already verified the basic form above.
        number extends Parameters<Anything>["length"] ?
            // Check that rest of params look like `...any[]`, otherwise don't accept.
            Parameters<Anything> extends [any, ...infer Rest] ?
                // If the rest look like `...any[]`, it's fine.
                any[] extends Rest ? true :
                // No, not pure enough rest args for us.
                false :
            // Could not infer Rest, shouldn't happen.
            false :
        // Not a spread func - could be a component func or something else entirely.
        false :
    // Not spread like at all - potentially not even a function.
    false;


// - Spread component virtual type - //

/** The spread function props including the internal props `_disable` and `_key`. */
export interface SpreadFuncProps extends MixDOMInternalBaseProps {}


// - Functionality - //

/** Create a SpreadFunc - it's actually just a function with 0 or 1 arguments: (props?).
 * - It's the most performant way to render things (no lifecycle, just spread out with its own pairing scope).
 * - Note that this simply gives back the original function, unless it has more than 1 arguments, in which case an intermediary function is created.
 *      * This intermediary function actually supports feeding in more arguments - this works since a func with (props, ...args) actually has length = 1.
 *      * If you want to include the props and extra arguments typing into the resulting function use the createSpreadWith function instead (it also automatically reads the types).
 */
export const createSpread = <Props extends Record<string, any> = {}>(func: (props: Props, ...args: any[]) => MixDOMRenderOutput): SpreadFunc<Props> =>
    func.length > 1 ? function (props: Props, ...args: any[]) { return func(props, ...args); } : func;
/** Create a SpreadFunc by automatically reading the types for Props and ExtraArgs from the given function. See createSpread for details.
 * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
 */
export const createSpreadWith = <Props extends Record<string, any>, ExtraArgs extends any[]>(func: (props: Props, ...args: ExtraArgs) => MixDOMRenderOutput): SpreadFuncWith<Props, ExtraArgs> =>
    func.length > 1 ? function (props: Props, ...args: ExtraArgs) { return func(props, ...args); } : func;
