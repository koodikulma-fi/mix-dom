
// - Imports - //

// Typing.
import { MixDOMPreBaseProps, MixDOMRenderOutput } from "../typing";


// - Helper types - //

/** Typing for a SpreadFunc: It's like a Component, except it's spread out immediately on the parent render scope when defined. */
export type SpreadFunc<Props extends Record<string, any> = {}> = (props: Props) => MixDOMRenderOutput;
/** Typing for a SpreadFunc with extra arguments. Note that it's important to define the JS side as (props, ...args) so that the func.length === 1. 
 * - The idea is to use the same spread function outside of normal render flow: as a static helper function to produce render defs (utilizing the extra args).
 */
export type SpreadFuncWith<Props extends Record<string, any> = {}, ExtraArgs extends any[] = any[]> = (props: Props, ...args: ExtraArgs) => MixDOMRenderOutput;


// - Spread component virtual type - //

/** The spread component props. */
export interface ComponentSpreadProps extends Pick<MixDOMPreBaseProps, "_disable" | "_key"> {}
/** There is no actual class for ComponentSpread. It's not even a real component, but only spreads out the defs instantly on the static side. */
export interface ComponentSpread<Props extends Record<string, any> = {}> extends SpreadFunc<Props> { }


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
