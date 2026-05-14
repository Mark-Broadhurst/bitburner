# Job Overview

## Scripts

| File | Purpose |
|------|---------|
| `apply.ts` | One-shot: applies to every company in `CompaniesJobs` at all available fields |
| `workForFaction.ts` | Works at each company-faction until a faction invitation is received |
| `workForPosition.ts` | Works at all companies until max position, auto-promoting along the way |
| `workForSmallCompany.ts` | Works security at every company until 1M rep (utility script) |

Company and field data comes from `Utils/companies.ts` (`CompaniesJobs`, `CompaniesWithFactions`).

---

## `workForFaction.ts` — Unlock Company Factions

The main script for getting faction invitations from megacorp factions.

For each company in `CompaniesWithFactions`:
1. Skip if already in faction or have an invitation
2. Apply to every available field to land the highest starting position
3. Work in the best field for rep gain
4. Auto-promote when rep threshold is met
5. Exit that company once the faction invitation arrives

**Field selection priority** (fallback order when Formulas.exe unavailable):

```
software > IT > security > business > agent > software consultant > employee > waiter
```

With `Formulas.exe`: uses `ns.formulas.work.companyGains` to pick the field with
the best rep-per-tick for the current player stats and company favour.

**Special case**: Fulcrum Technologies maps to "Fulcrum Secret Technologies" for
the faction invitation check.

---

## `workForPosition.ts` — Max Position at All Companies

Works through every company until reaching the top of the job ladder.
Auto-promotes at each rep threshold, re-evaluates best field after each promotion.
Skips companies where the player is already at max position.

Useful for maximising the passive income and stat bonuses from high-level jobs.

---

## `workForSmallCompany.ts` — Utility Rep Grinder

Iterates every company in the game (all `ns.enums.CompanyName` values), applies in
security, and grinds until 1M rep or max position. Used to boost company rep broadly
without targeting specific factions.

---

## `apply.ts` — Bulk Application

One-shot: applies to all companies in `CompaniesJobs` at every configured field.
Useful after a reset to restore job positions quickly without grinding rep.

---

## Notes

- All `workFor*` scripts call `ns.singularity.stopAction()` when done.
- Applying in multiple fields simultaneously is valid — each successful application
  upgrades the position, so trying all fields lands the highest available starting role.
- `workForFaction.ts` re-applies and re-starts work if the player becomes unemployed
  mid-loop (can happen if another script changes the active action).
