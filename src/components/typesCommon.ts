
// - Imports - //

// Libraries.
import type { IsAny } from "data-signals";


// - Utility types - //

/** If T is `any`, returns F, which defaults to `{}`, otherwise returns T. */
export type UnlessAny<T, F = {}> = IsAny<T> extends true ? F : T;
