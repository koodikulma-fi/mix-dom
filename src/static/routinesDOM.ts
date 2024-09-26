
// - Imports - //

// Libraries.
import { areEqual, CompareDataDepthEnum } from "data-signals";
// Typing.
import { CSSProperties, MixDOMProcessedDOMProps, MixDOMPreClassName, MixDOMUpdateCompareMode, MixDOMCommonDOMProps } from "../typing";


// - Local constants - //

const complexDomProps = {
    style: true,
    data: true
} as const;


// - Comparison helpers - //

export function getDictionaryDiffs<T extends Record<string, any>>(orig: Partial<T>, update: Partial<T>): Partial<T> | null {
    // Collect.
    const diffs: Partial<T> = {};
    let hasDiffs = false;
    // .. Deleted.
    for (const prop in orig) {
        const origValue = orig[prop];
        if (origValue !== undefined && update[prop] === undefined) {
            diffs[prop] = undefined;
            hasDiffs = true;
        }
    }
    // .. Added or changed.
    for (const prop in update) {
        const newValue = update[prop];
        if (orig[prop] !== newValue) {
            diffs[prop] = newValue;
            hasDiffs = true;
        }
    }
    return hasDiffs ? diffs : null;
}


/** Helper to compare a dictionary against another by a dictionary of update modes (only compares the propeties of this dictionary).
 * - Returns false if had differences. Note that in "always" mode even identical values are considered different, so returns true for any. 
 * - -2 always, -1 deep, 0 changed, 1 shallow, 2 double, ... See the MixDOMUpdateCompareMode type for details. */
export function equalDictionariesBy(from: Record<string, any> | null | undefined, to: Record<string, any> | null | undefined, compareBy: Record<string, MixDOMUpdateCompareMode | number | any>): boolean {
    // Loop each prop key in the compareBy dictionary.
    const eitherEmpty = !from || !to;
    for (const prop in compareBy) {
        // Prepare.
        const mode = compareBy[prop];
        const nMode = typeof mode === "number" ? mode : CompareDataDepthEnum[mode as string] as number ?? 0;
        // Never (-3) and always (-2) modes. The outcome is flipped as we're not asking about change but equality.
        if (nMode < -1) {
            if (nMode === -2)
                return false;
            continue;
        }
        // Always different - so never equal.
        if (nMode === -2)
            return false;
        // Special case. If either was empty, return true (= equal) if both were empty, false (= not equal) otherwise.
        if (eitherEmpty)
            return !from && !to;
        // Changed.
        if (nMode === 0) {
            if (from[prop] !== to[prop])
                return false;
        }
        // Otherwise use the library method.
        else if (!areEqual(from[prop], to[prop], nMode))
            return false;
    }
    // All that were checked were equal.
    return true;
}

/** Inlined comparison method specialized into domProps (attributes of a dom element). */
export function equalDOMProps(a: MixDOMProcessedDOMProps, b: MixDOMProcessedDOMProps): boolean {
    // Handle complex properties.
    for (const prop in complexDomProps) {
        // .. At least a has the complex prop.
        if (a[prop]) {
            // But b has no the complex prop.
            if (!b[prop])
                return false;
            // Compare complex data (as shallow dictionaries).
            const aData = a[prop];
            const bData = b[prop];
            // .. Added or changed.
            if (aData !== bData) {
                for (const prop in bData) {
                    if (aData[prop] !== bData[prop])
                        return false;
                }
                // .. Deleted.
                for (const prop in aData) {
                    if (bData[prop] === undefined && aData[prop] !== undefined)
                        return false;
                }
            }
        }
        // .. Only b has style.
        else if (b[prop])
            return false;
    }
    // All else.
    // .. Added or changed.
    for (const prop in b) {
        if (a[prop] !== b[prop] && !complexDomProps[prop])
            return false;
    }
    // .. Deleted.
    for (const prop in a) {
        if (b[prop] === undefined && a[prop] !== undefined && !complexDomProps[prop])
            return false;
    }
    return true;
}


// - HTML props - //

export function cleanDOMProps<Props extends Record<string, any> & Pick<MixDOMCommonDOMProps, "class" | "className" | "style"> = {}>(origProps: Props, copy?: boolean): MixDOMProcessedDOMProps & Props {
    // Copy.
    const props = copy ? { ...origProps } : origProps;
    // Class.
    if (props.class)
        props.className = props.className ? props.class + " " + props.className : props.class;
    delete props.class;
    // Style.
    if (typeof props.style === "string")
        props.style = parseStyle(props.style);
    // Return cleaned.
    return props as MixDOMProcessedDOMProps & Props;
}

// Help from: https://stackoverflow.com/questions/8987550/convert-css-text-to-javascript-object
export function parseStyle(cssText: string): CSSProperties {
    // Clean extra empty chars.
    const text = cssText.replace(/\/\*(.|\s)*?\*\//g, " ").replace(/\s+/g, " ").trim();
    if (!text)
        return {};
    // Parse into statements by ";", and convert each to a tuple: [prop: string, val?: string].
    const pairs = text.split(";").map(o => {
        const i = o.indexOf(":");
        return i === -1 ? [o.trim()] : [o.slice(0, i).trim(), o.slice(i + 1).trim()];
    });
    // Loop the pairs to create a dictionary with camelCase keys.
    const style: CSSProperties = {};
    for (const [prop, val] of pairs)
        if (prop)
            style[prop.replace(/\W+\w/g, match => match.slice(-1).toUpperCase())] = val; // Convert key to camelCase, value is a string or undefined.
    return style;
}

/** Returns a string to be used as class name (with no duplicates and optional nested TypeScript verification).
 * - Each item in the classNames can be:
 *     1. ValidName (single className string),
 *     2. Array<ValidName>,
 *     3. Record<ValidName, any>.
 *     + If you want to use the validation only for Arrays and Records but not Strings, add 2nd parameter `string` to the type: `classNames<ValidName, string>`
 * - Unfortunately, the name validation inputted here only works for Array and Record types, and single strings.
 * - To use concatenated class name strings (eg. "bold italic"), you should:
 *     1. Declare a validator by: `const classNames: ValidateNames<ValidName> = MixDOM.classNames;`
 *     2. Then use it like this: `const okName = classNames("bold italic", ["bold"], {"italic": false, "bold": true})`;
 */
export function classNames<ValidNames extends string = string, SingleName extends string = ValidNames>(...classNames: Array<MixDOMPreClassName<ValidNames, SingleName> | "" | false | 0 | null | undefined>): string {
    // Collect all to a dictionary.
    const record: Record<string, true> = {};
    for (const name of classNames)
        if (name)
            collectNamesTo(name, record, " ");
    // Return the valid keys joined by space - the collectNamesTo makes sure there's no duplicates nor empties.
    return Object.keys(record).join(" ");
}


// - Class names - //

/** Collects unique names as dictionary keys with value `true` for each found.
 * The names are assumed to be:
 * 1. String (use stringSplitter),
 * 2. Iterable of string names, or an iterable of this type itself (recursively).
 * 3. Record where names are keys, values tells whether to include or not.
 */
export function collectNamesTo(names: MixDOMPreClassName, record: Record<string, true>, stringSplitter: string = ""): void {
    // Note, this assumes names is not empty (especially not null or "").
    switch(typeof names) {
        // String, split by empty spaces.
        case "string": {
            if (stringSplitter) {
                for (const name of names.split(stringSplitter))
                    if (name)
                        record[name] = true;
            }
            else
                record[names] = true;
            break;
        }
        case "object": {
            // Dictionary like.
            if (names.constructor === Object) {
                for (const name in names as Record<string, any>)
                    if (name && names[name])
                        record[name] = true;
            }
            // Array like.
            else {
                // It's just a simple array - not recursive anymore, because the typing didn't work that nicely with deep stuff / recursion.
                // .. So we just iterate each, split by " " and collect.
                for (const cName of names as Iterable<string>) {
                    if (cName && typeof cName === "string") {
                        if (stringSplitter) {
                            for (const name of cName.split(stringSplitter))
                                if (name)
                                    record[name] = true;
                        }
                        else
                            record[cName] = true;
                    }
                }
                // for (const preName of names as Iterable<MixDOMPreClassName>)
                //     if (preName)
                //         collectNamesTo(preName, record, stringSplitter);
            }
            break;
        }
    }
}

/** Get diffs in class names in the form of: Record<string, boolean>, where true means added, false removed, otherwise not included.
 * - Note. This process only checks for changes - it ignores changes in order completely. */
export function getClassNameDiffs(origName?: string, newName?: string): Record<string, boolean> | null {
    // Quick check.
    origName = origName || "";
    newName = newName || "";
    if (origName === newName)
        return null;
    // Prepare outcome.
    const origNames = origName.split(" ");
    const newNames = newName.split(" ");
    const diffs = {};
    // Removed.
    let did: null | boolean = null;
    if (origNames)
        for (const name of origNames) {
            if (name && (!newNames || newNames.indexOf(name) === -1))
                diffs[name] = did = false;
        }
    // Added.
    if (newNames)
        for (const name of newNames) {
            if (name && (!origNames || origNames.indexOf(name) === -1))
                diffs[name] = did = true;
        }
    // Return diffs if has any.
    return did !== null ? diffs : null;
}
