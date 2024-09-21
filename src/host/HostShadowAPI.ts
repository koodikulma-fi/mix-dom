
// - Imports - //

// Library.
import { ContextsAllType } from "data-signals";
// Only typing.
import { Host } from "./Host";


// - Class - //

/** This is simply a tiny class that is used to manage the host duplication features in a consistent way.
 * - Each Host has a `.shadowAPI`, but it's the very same class instance for all the hosts that are duplicated - the original and any duplicates have the same instance here.
 * - This way, it doesn't matter who is the original source (or if it dies away). As long as the shadowAPI instance lives, the originality lives.
 */
export class HostShadowAPI<Contexts extends ContextsAllType = {}> {
    /** These are the Host instances that share the common duplication basis. Note that only appear here once mounted (and disappear once cleaned up). */
    hosts: Set<Host<Contexts>> = new Set();
    /** These are the duplicatable contexts (by names). Any time a Host is duplicated, it will get these contexts automatically. */
    contexts: Partial<Contexts> = {};
}
