# Hacknet Overview

## Scripts

| File | Purpose |
|------|---------|
| `spendHashes.ts` | Main loop — two-phase hash spending with overflow protection |
| `buyCompanyFavour.ts` | Spends hashes on Company Favor until all megacorp factions hit 150 |
| `improveServers.ts` | Legacy — alternates Reduce Security / Increase Money on hacking targets |
| `sellHashes.ts` | Legacy — sells hashes when near capacity |
| `hashLimit.ts` | Utility library — `getHashLimit`, `getHashProduction` |

`spendHashes.ts` is the primary script.  `improveServers.ts` and `sellHashes.ts` are
superseded by it but kept for reference.

---

## `spendHashes.ts` — Main Hash Loop

Runs every 200 ms.  Two phases based on available cash:

```
Phase 1 (home money < $5m):   sell hashes → money (bootstrap cash for early programs)
Phase 2 (home money ≥ $5m):   spend on cheapest available improvement action
```

Overflow protection runs every tick regardless of phase: if hashes are within 40 of
capacity, sells enough to absorb at least one full tick of production, preventing waste.

### Phase 2 action priority

Actions are collected dynamically; the **cheapest** one is executed each cycle:

| Action | Condition |
|--------|-----------|
| Improve Studying | Always |
| Improve Gym Training | Always |
| Reduce Minimum Security | Eligible hacking targets exist (`moneyMax ≤ 1e13`, `minDifficulty ≥ 1`) |
| Increase Maximum Money | Same eligibility filter |
| Exchange for Bladeburner Rank | Player is in Bladeburners faction |
| Exchange for Bladeburner SP | Player is in Bladeburners faction |
| Sell for Corporation Funds | Corporation exists |
| Exchange for Corporation Research | Corporation exists |

Server-targeted actions pick the **worst** server in that dimension (highest minDifficulty
for security reduction; highest moneyMax for money increase) so improvements always go
to the server that needs them most.

---

## `buyCompanyFavour.ts` — Company Favor via Hashes

Iterates `CompaniesWithFactions` and spends hashes on `"Company Favor"` until each
company reaches 150 favour (the donation threshold).  Useful early in a run when
hacking isn't producing enough rep to cross the threshold naturally.

---

## `hashLimit.ts` — Utility Library

Exported helpers used by the legacy scripts:

| Function | Returns |
|----------|---------|
| `getHashLimit(ns)` | Sum of `hashCapacity` across all hacknet servers |
| `getHashProduction(ns)` | Sum of current hash production rate across all servers |

`spendHashes.ts` reimplements these inline; `hashLimit.ts` is still imported by the
legacy scripts.

---

## Notes

- Hacknet **nodes** produce money directly; hacknet **servers** (BN9+) produce hashes.
  `getTotalHashCapacity` returns 0 for nodes (no `hashCapacity` field), so overflow
  protection is a no-op in node mode.
- The server filter `moneyMax ≤ 1e13` avoids wasting hashes on already-massive servers
  that would see negligible improvement.
- `buyCompanyFavour.ts` and `sellHashes.ts` both import from `Hacknet/hashLimit`; note
  the lowercase import path in `sellHashes.ts` vs the PascalCase folder — this works at
  runtime but is inconsistent with the rest of the codebase.
