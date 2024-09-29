
// - Imports - //

// Typing.
import { MixDOMDefApplied } from "../typing";
// Routines.
import { hasContentInDefs } from "../static/index";
// Common.
import { MixDOMContent } from "../common/index";
// Boundaries.
import { ContentClosure } from "../boundaries/index";
// Local.
import { Component, ComponentType } from "./Component";


// - Helpers - //

const checkRecursively = (def: MixDOMDefApplied): boolean => !!(def.contentPass?.envelope && hasContentInDefs(def.contentPass.envelope.applied.childDefs, checkRecursively));


// - WithContent component - //

// Content.
export type WithContentInfo = {
    props: {
        /** If set to a boolean value (= not null nor undefined), skips checking whether actually has content and returns the value. */
        hasContent?: boolean | null;
    };
    class: {
        /** Internal method to check whether has content - checks recursively through the parental chain. */
        hasContent(): boolean;
    };
}
export const MixDOMWithContent = class WithContent extends Component<WithContentInfo> {
    /** Technical marker. Simply used to differentiate us from the passes of the Remote instances. Note that the _static_ WithContent of Remote does not actual have its own pass. */
    public static _WithContent = MixDOMContent;
    /** Internal method to check whether has content through the chain recursively. */
    public hasContent(): boolean {
        // Get our boundary's source boundary's closure. (As it's not about us, it's about our parent.)
        const closure: ContentClosure | null | undefined = this.boundary.sourceBoundary?.closure;
        // Check upstairs, recursively if needs to.
        return closure && closure.envelope && hasContentInDefs(closure.envelope.applied.childDefs, checkRecursively) as boolean || false;
    }
    public render() {
        return (this.props.hasContent ?? this.hasContent()) ? MixDOMContent : null;
    }
} as ComponentType<WithContentInfo>;
