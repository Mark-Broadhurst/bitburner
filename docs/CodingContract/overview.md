# CodingContract Overview

## Scripts

| File | Purpose |
|------|---------|
| `solve.ts` | Scans every server, solves all `.cct` files found, reports results |
| `generate.ts` | Creates dummy contracts on home for testing solvers |

---

## `solve.ts`

Iterates all servers (home first, then the full network), finds every `.cct` file,
dispatches to the appropriate solver, and submits.  Reports ✅ / ❌ / SKIP per contract.

All 28 contract types are implemented inline.  Unknown types return `null` and are
reported as SKIP — they do not consume an attempt.

---

## `generate.ts`

Clears existing `.cct` files on home, then creates dummy contracts for testing.

- `run generate.js <type>` — creates one contract of the given type
- `run generate.js` — creates one of every contract type

`autocomplete` lists the trickier contract types for tab-completion convenience.

---

## Solver Reference

All 28 contract types and the algorithm used for each:

| Contract | Algorithm |
|----------|-----------|
| Find Largest Prime Factor | Trial division |
| Subarray with Maximum Sum | Kadane's algorithm |
| Total Ways to Sum | Partition DP (coins = 1…n−1) |
| Total Ways to Sum II | Coin change DP with given denominations |
| Spiralize Matrix | Four-pointer spiral traversal |
| Array Jumping Game | Greedy reach tracking — returns 1/0 |
| Array Jumping Game II | Greedy BFS layers — returns min jumps |
| Merge Overlapping Intervals | Sort by start, merge on overlap |
| Generate IP Addresses | Brute-force all 1–3 digit splits, validate each octet |
| Algorithmic Stock Trader I | One trade max; single-pass min/max |
| Algorithmic Stock Trader II | Unlimited trades; sum all up-moves |
| Algorithmic Stock Trader III | Exactly 2 trades; delegates to Trader IV with k=2 |
| Algorithmic Stock Trader IV | k trades max; DP with `best` running max |
| Minimum Path Sum in a Triangle | Bottom-up DP on triangle rows |
| Unique Paths in a Grid I | DP — no obstacles |
| Unique Paths in a Grid II | DP — with obstacles |
| Shortest Path in a Grid | BFS from top-left to bottom-right; returns UDLR string |
| Sanitize Parentheses in Expression | BFS by removal level until valid strings found |
| Find All Valid Math Expressions | DFS with +/−/× operators; tracks `last` for multiply undo |
| HammingCodes: Integer to Encoded Binary | Build extended Hamming code with overall parity bit |
| HammingCodes: Encoded Binary to Integer | Detect and correct single-bit error, extract data bits |
| Proper 2-Coloring of a Graph | BFS graph coloring; returns `[]` if not bipartite |
| Compression I: RLE Compression | Run-length encoding, max run 9 |
| Compression II: LZ Decompression | Alternating literal / backreference chunks |
| Compression III: LZ Compression | DP over positions × state (type-1 or type-2), minimises output length |
| Encryption I: Caesar Cipher | Shift each uppercase letter left by N mod 26 |
| Encryption II: Vigenère Cipher | Shift each letter by the corresponding key character |
| Square Root | BigInt Newton's method (integer square root) |
| Total Number of Primes | Segmented sieve of Eratosthenes over range [a, b] |
| Largest Rectangle in a Matrix | Histogram + monotonic stack per row; returns `[[r1,c1],[r2,c2]]` |

---

## Notes

- **LZ Compression** (`lzCompress`) is the most complex solver — it uses a full DP
  over `(position, chunk-type)` states, tracking the shortest encoded string to each
  position.  Type-1 chunks are literal sequences; type-2 chunks are backreferences
  with length and distance digits.

- **Hamming encode** produces `overallParity + parityBits + dataBits` (extended Hamming).
  Data bits sit at non-power-of-2 positions (1-indexed); parity bits at powers of 2.

- **Stock Trader IV** subsumes I, II, and III: Trader I is k=1 with unlimited fallback,
  Trader II is the unlimited case (`k ≥ n/2`), Trader III calls IV with k=2.

- **Sanitize Parentheses** generates all strings at each removal depth using a `Set`
  to deduplicate, returning as soon as any valid strings are found at a given level.

- **Square Root** handles arbitrarily large `bigint` inputs using Newton's method;
  corrects for the one-step overshoot that can occur on perfect squares.
