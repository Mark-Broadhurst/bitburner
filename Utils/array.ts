/**
 * Generic array utilities.
 *
 * These are thin wrappers around Array.reduce that make call sites more
 * readable when finding the min or max element of an array by some numeric
 * property.  Both functions throw on empty arrays (same as bare .reduce()).
 */

/** Return the element of `arr` for which `fn` returns the smallest value. */
export function minBy<T>(arr: T[], fn: (item: T) => number): T {
    return arr.reduce((a, b) => fn(a) <= fn(b) ? a : b);
}

/** Return the element of `arr` for which `fn` returns the largest value. */
export function maxBy<T>(arr: T[], fn: (item: T) => number): T {
    return arr.reduce((a, b) => fn(a) >= fn(b) ? a : b);
}
