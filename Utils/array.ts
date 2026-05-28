export function minBy<T>(arr: T[], fn: (item: T) => number): T {
    return arr.reduce((a, b) => fn(a) <= fn(b) ? a : b);
}

export function maxBy<T>(arr: T[], fn: (item: T) => number): T {
    return arr.reduce((a, b) => fn(a) >= fn(b) ? a : b);
}
