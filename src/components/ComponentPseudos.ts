
// - Imports - //

// Libraries.
import { DOMTags } from "dom-types";
// Typing.
import { MixDOMPreDOMTagProps, MixDOMRenderOutput, MixDOMDefTarget } from "../typing";
// Host.
import { MixDOMCloneNodeBehaviour } from "../host/index";
// Only typing (local).
import { ComponentTypeEither } from "./typesVariants";
import { ComponentRemote, ComponentRemoteProps, ComponentRemoteType } from "./ComponentRemote";


// - Export pseudo classes - //
//
// These have props class member just for typescript TSX, as these classes will never be instanced (only their static side used).
// .. So even though they are used like: <MixDOM.Portal />, the MixDOM.Portal class is actually never instanced.
// .. Instead it's just turned into a target def describing portal (or other) functionality - as the features are handled directly (for better performance).

export interface MixDOMPrePseudoProps {
    /** Disable the def altogether - including all contents inside. (Technically makes the def amount to null.) */
    _disable?: boolean;
    /** Attach key for moving the def around. */
    _key?: any;
}


// - Fragment - //

export interface PseudoFragmentProps extends MixDOMPrePseudoProps { }
/** Fragment represent a list of render output instead of stuff under one root.
 * Usage example: `<MixDOM.Fragment><div/><div/></MixDOM.Fragment>` */
export class PseudoFragment<Props extends PseudoFragmentProps = PseudoFragmentProps> {
    public static MIX_DOM_CLASS = "Fragment";
    public readonly props: Props;
    constructor(_props: Props) {}
}


// - Portal - //

export interface PseudoPortalProps extends MixDOMPrePseudoProps {
    container: Node | null;
}
/** Portal allows to insert the content into a foreign dom node.
 * Usage example: `<MixDOM.Portal container={myDOMElement}><div/></MixDOM.Portal>` */
export class PseudoPortal<Props extends PseudoPortalProps = PseudoPortalProps> {
    public static MIX_DOM_CLASS = "Portal";
    public readonly props: Props;
    constructor(_props: Props) { }
}


// - Element - //

export type PseudoElementProps<Tag extends DOMTags = DOMTags> = MixDOMPreDOMTagProps<Tag> & {
    /** HTML or SVG element to smuggle in. */
    element: HTMLElement | SVGElement | null;
    /** Determines what happens when meeting duplicates.
     * - If == null, uses the Host based setting.
     * - If boolean, then is either "deep" or nothing. */
    cloneMode?: boolean | MixDOMCloneNodeBehaviour | null;
};
/** PseudoElement component class allows to use an existing dom element as if it was part of the system, so you can modify its props and insert content etc.
 * - Usage example: `<MixDOM.Element element={el} style="background: #ccc"><span>Some content</span></MixDOM.Element>`.
 */
export class PseudoElement<Tag extends DOMTags = DOMTags, Props extends PseudoElementProps<Tag> = PseudoElementProps<Tag>> {
    public static MIX_DOM_CLASS = "Element";
    public readonly props: Props;
    constructor(_props: Props) { }
}


// - Empty - //

/** Empty dummy component that accepts any props, but always renders null. */
export interface PseudoEmptyProps extends Record<string, any> {}
export class PseudoEmpty<Props extends PseudoEmptyProps = PseudoEmptyProps> {
    public static MIX_DOM_CLASS = "Empty";
    public readonly props: Props;
    constructor(_props: Props) { }
    render(): MixDOMRenderOutput { return null; }
}


// - EmptyRemote - //

/** This is an empty dummy remote class:
 * - Its purpose is to make writing render output easier (1. no empty checks, and 2. for typing):
 *     * For example: `const MyRemote = component.state.PopupRemote || MixDOM.EmptyRemote;`
 *     * You can then access the Content and ContentCopy members, and copyContent(key) and withContent(...contents) methods fluently.
 * - However, they will just return null, so won't have any effect on anything.
 *     * Note also that technically speaking this class extends PseudoEmpty.
 *     * And it only adds the 2 public members (Content and ContentCopy) and 2 public methods (copycontent and withContent).
 *     * Due to not actually being a remote, it will never be used as a remote. It's just a straw dog.
 * - If you need to distinguish between real and fake, use `isRemote()` method. The empty returns false.
 */
export const PseudoEmptyRemote = class PseudoEmptyRemote<CustomProps extends Record<string, any> = {}> extends PseudoEmpty<ComponentRemoteProps & CustomProps> {
    // Content passing.
    public static Content: MixDOMDefTarget | null = null;
    public static ContentCopy: MixDOMDefTarget | null = null;
    public static copyContent = (_key?: any): MixDOMDefTarget | null => null;
    public static filterContent = (_filterer: (remote: ComponentRemote, i: number) => boolean, _copyKey?: any): MixDOMDefTarget | null => null;
    public static wrapContent = (_wrapper: (remote: ComponentRemote, i: number) => MixDOMRenderOutput, _copyKey?: any): MixDOMDefTarget | null => null;
    public static renderContents = (_handler: (remotes: Array<ComponentRemote>) => MixDOMRenderOutput): MixDOMDefTarget | null => null;
    public static hasContent = (_filterer?: (remote: ComponentRemote, i: number) => boolean): boolean => false;
    public static WithContent: ComponentTypeEither<{props: { hasContent?: boolean; }}> = (_initProps, _comp) => null;
    // Helpers.
    public static isRemote(): boolean { return false; }
    // Other members.
    public static sources: ComponentRemote[] = [];
    // // Internal.
    // public static addSource(_remote: ComponentRemote, _order?: number | null | undefined): void {};
    // public static removeSource(_remote: ComponentRemote): MixDOMChangeInfos | null { return null };
} as unknown as ComponentRemoteType;
