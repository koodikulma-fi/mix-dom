
// - About inheritance - //
//
// Note. Only the typing contains cyclical imports, the JS side not.
// Inheritance of JS imports by folders is as follows:
// 
// ./typing/
// ./static/
// ./common/
// ./boundaries/
// ./host/
// ./components/
// ./MixDOM.ts


// - Export public like - //

// All public typing.
export * from "./typing/MixDOMPublic";
// SourceBoundary for constructor args.
export { SourceBoundary } from "./boundaries/SourceBoundary";
// All from common (Ref and MixDOMContent).
export * from "./common/index";
// Host and HostContextAPI from Host.
export * from "./host/HostContextAPI";
export * from "./host/Host";
// All from components.
export * from "./components/index";
// All from MixDOM collection.
export * from "./MixDOM";
