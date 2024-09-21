
// - Helpers - //

export type InstanceTypeFrom<Anything> = Anything extends abstract new (...args: any[]) => infer Instance ? Instance : {};
