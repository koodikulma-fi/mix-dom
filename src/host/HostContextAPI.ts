
// - Imports - //

// Library.
import { AsClass } from "mixin-types";
import { ContextAPI, ContextsAllType, ContextAPIType } from "data-signals";
// Only typing.
import { Host } from "./Host";


// - HostContextAPI class - //

/** Class type for HostContextAPI. */
export interface HostContextAPIType<Contexts extends ContextsAllType = {}> extends AsClass<ContextAPIType<Contexts>, HostContextAPI<Contexts>, []> {
    /** Attached to provide automated context inheritance from host to components. */
    modifyContexts(contextAPI: HostContextAPI, contextMods: Partial<ContextsAllType>, callDataIfChanged: boolean, setAsInherited: boolean): string[];
}
/** The Host based ContextAPI simply adds an extra argument to the setContext and setContexts methods for handling which contexts are auto-assigned to duplicated hosts.
 * - It also has the afterRefresh method assign to the host's cycles.
 */
export interface HostContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {

    // Type the constructor as property.
    ["constructor"]: ContextAPIType<Contexts> & HostContextAPIType<Contexts>;

    /** The Host that this ContextAPI is attached to. Should be set manually after construction.
     * - It's used for two purposes: 1. Marking duplicatable contexts to the Host's shadowAPI, 2. syncing to the host refresh (with the afterRefresh method).
     * - It's assigned as a member to write HostContextAPI as a clean class.
     */
    host: Host<Contexts>;
    /** This triggers a refresh and returns a promise that is resolved when the Host's update / render cycle is completed.
     * - If there's nothing pending, then will resolve immediately. 
     * - This uses the signals system, so the listener is called among other listeners depending on the adding order.
     */
    afterRefresh(fullDelay?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void>;

    // Extends ContextAPI methods with changed 4th arg.
    /** Attach the context to this ContextAPI by name. Returns true if did attach, false if was already there.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     * - Note that this method is extended on the HostContextAPI to include markAsDuplicatable option (defaults to false).
     *      * If set to true, will also modify the host.shadowAPI.contexts: if has a context adds there, if null or undefined removes from there.
     *      * It's a dictionary used for auto-assigning contexts to a new duplicated host - requires `host.settings.duplicatableHost: true`.
     */
    setContext<Name extends keyof Contexts & string>(name: Name, context: Contexts[Name] | null | undefined, callDataIfChanged?: boolean, markAsDuplicatable?: boolean): boolean;
    /** Set multiple named contexts in one go. Returns true if did changes, false if didn't. This will only modify the given keys.
     * - Note that if the context is `null`, it will be kept in the bookkeeping. If it's `undefined`, it will be removed.
     *      * This only makes difference when uses one ContextAPI to inherit its contexts from another ContextAPI.
     * - Note that this method is extended on the HostContextAPI to include markAsDuplicatable option (defaults to false).
     *      * If set to true, will also modify the host.shadowAPI.contexts: if has a context adds there, if null or undefined removes from there.
     *      * It's a dictionary used for auto-assigning contexts to a new duplicated host - requires `host.settings.duplicatableHost: true`.
     */
    setContexts(contexts: Partial<{[CtxName in keyof Contexts & string]: Contexts[CtxName] | null | undefined; }>, callDataIfChanged?: boolean, markAsDuplicatable?: boolean): Array<string & keyof Contexts>;
}
export class HostContextAPI<Contexts extends ContextsAllType = {}> extends ContextAPI<Contexts> {


    // - Setting contexts - //

    public setContext<Name extends keyof Contexts & string>(name: Name, context: Contexts[Name] | null | undefined, callDataIfChanged: boolean = true, markAsDuplicatable: boolean = false): boolean { 
        // Handle local bookkeeping.
        if (markAsDuplicatable)
            context ? this.host.shadowAPI.contexts[name] = context : delete this.host.shadowAPI.contexts[name];
        // Basis.
        return this.constructor.modifyContexts(this, { [name]: context }, callDataIfChanged, false)[0] !== undefined;
    }
    public setContexts(contextMods: Partial<{[CtxName in keyof Contexts & string]: Contexts[CtxName] | null | undefined;}>, callDataIfChanged: boolean = true, markAsDuplicatable: boolean = false): Array<string & keyof Contexts> {
        // Handle local bookkeeping.
        if (markAsDuplicatable) {
            const dContexts = this.host.shadowAPI.contexts as Record<string, any>;
            for (const ctxName in contextMods)
                contextMods[ctxName] ? dContexts[ctxName] = contextMods[ctxName] : delete dContexts[ctxName];
        }
        // Basis.
        return this.constructor.modifyContexts(this, contextMods, callDataIfChanged, false);
    }


    // - Handling refresh - //

    awaitDelay(): Promise<void> {
        return this.host.services.renderCycle.promise;
    }

    public afterRefresh(fullDelay?: boolean, updateTimeout?: number | null, renderTimeout?: number | null): Promise<void> {
        // Trigger refresh.
        this.host.services.triggerRefresh(updateTimeout, renderTimeout);
        // Return promise.
        return fullDelay ? this.awaitDelay() : this.host.services.updateCycle.promise;
    }


    // - Getting / Calling indirect (component) listeners - //

    // Hook up the feature.
    public static modifyContexts(contextAPI: HostContextAPI, contextMods: Partial<ContextsAllType>, callDataIfChanged: boolean, setAsInherited: boolean): string[] {
        // Basis.
        const changed = super.modifyContexts(contextAPI, contextMods, callDataIfChanged, setAsInherited);
        // Set as inherited for components.
        for (const component of contextAPI.host.contextComponents)
            component.contextAPI.setContexts(contextMods, callDataIfChanged, true);
        // Return changed.
        return changed;
    }

    // public static getListenersFor(contextAPI: HostContextAPI<ContextsAllType>, ctxName: string, signalName?: string): SignalListener[] | undefined {
    //     // All within a context.
    //     const ctxSignalName = ctxName + "." + (signalName || "");
    //     const ctxComponents = [...contextAPI.host.contextComponents];
    //     if (!signalName) {
    //         // Add all our own matching signals.
    //         let listeners: SignalListener[] = [];
    //         for (const sName in contextAPI.signals) {
    //             // If matches the context name + ".", then get the listeners.
    //             if (sName.startsWith(ctxSignalName))
    //                 listeners = listeners.concat(contextAPI.signals[sName]!);
    //         }
    //         // Likewise, add from all the components.
    //         return listeners.concat(
    //             // Check all contextual components, and all signals in them.
    //             ctxComponents.reduce((cum, comp) => {
    //                 // Only allow from those components that do _not_ have direct overrides for the given context name - as they would be collected directly if related.
    //                 if (comp.contextAPI.contexts[ctxName] !== undefined)
    //                     return cum;
    //                 // Check for match.
    //                 const signals = comp.contextAPI.signals;
    //                 for (const sName in signals) {
    //                     // If matches the context name + ".", then get the listeners.
    //                     if (sName.startsWith(ctxSignalName))
    //                         cum = cum.concat(signals[sName]!);
    //                 }
    //                 return cum;
    //             }, [] as SignalListener[])
    //         );
    //     }
    //     // All directly matching - the normal case.
    //     const listeners = (contextAPI.signals[ctxSignalName] || []).concat(
    //         // Components.
    //         ctxComponents
    //         // Only allow those that match and are _not_ on components that have direct overrides for the given context name - as they would be collected directly if related. (If unrelated, then nothing to do.)
    //         .filter(comp => comp.contextAPI.signals[ctxSignalName] && (comp.contextAPI.contexts[ctxName] === undefined))
    //         // Convert to the listeners and reduce the double structure away.
    //         .map(comp => comp.contextAPI.signals[ctxSignalName]!).reduce((a, c) => a.concat(c), [])
    //     );
    //     return listeners[0] && listeners;
    // }
    //
    // // Hook up the feature.
    // public static callDataListenersFor(contextAPI: HostContextAPI, ctxDataKeys: true | string[] = true): void {
    //     // Call the direct. (That's what would happen without the presence of this method.)
    //     contextAPI.callDataBy(ctxDataKeys as any, true); // Skip calling back here.
    //     // Call indirect - but only the ones who has not overridden the given context names locally.
    //     // .. If has overridden locally, will be refreshed directly if related.
    //     if (contextAPI.host.contextComponents.size) {
    //         // Read context names.
    //         const ctxNames = ContextAPI.readContextNamesFrom(ctxDataKeys === true ? Object.keys(contextAPI.contexts) : ctxDataKeys);
    //         // Loop contextual components.
    //         for (const comp of contextAPI.host.contextComponents) {
    //             // If the context is not overridden by any of the names (typically only 1), then refresh.
    //             if (ctxNames.some(ctxName => comp.contextAPI.contexts[ctxName] === undefined))
    //                 comp.contextAPI.callDataBy(ctxDataKeys as never);
    //         }
    //     }
    // }

}
