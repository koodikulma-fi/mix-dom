
// - About inheritance - //
//
// Note. Only the typing contains cyclical imports, the JS side not.
// Inheritance of JS imports by folders is as follows:
// 
// ./typing/
// ./static/
// ./common/
// ./boundaries/
// ./components/
// ./host/
// ./MixDOM.ts


// - Export public like - //

// All public typing.
export * from "./typing/MixDOMPublic";
// Deffing.
export { newDef, newDefHTML, GetPropsFor, hasContentInDefs } from "./static/routinesDefs";
// All from common (Ref, MixDOMContent and SpreadFunc).
export * from "./common/index";
// All public from components.
export * from "./components/index_public";
// Host and HostContextAPI from Host.
export * from "./host/HostContextAPI";
export * from "./host/Host";
// All from MixDOM collection.
export * from "./MixDOM";
