# Faction Overview

## Scripts

| File | Purpose |
|------|---------|
| `invites.ts` | Polls for invitations; auto-accepts pending invites; shows unmet join requirements and tries to meet them |
| `join.ts` | Simpler join loop — accepts non-exclusive invitations that still have unowned augs |
| `missing.ts` | One-shot display of factions not yet joined or invited |
| `workForRep.ts` | Grinds rep until the projected favor at next reset will reach 150 |
| `workForAugs.ts` | Works for faction rep until every unowned aug threshold is met |
| `bribe.ts` | Donates money to factions that already have ≥ 150 favor to reach max aug rep instantly |
| `bribeMax.ts` | Donates to the highest-favor faction to buy NeuroFlux Governor; soft-resets every 10 queued augs |
| `buyAugs.ts` | Buys all affordable augmentations from specified factions in the correct order |

---

## Favor Threshold (150)

At 150 favor a faction unlocks the `donateToFaction` API.  Donation converts money
directly to rep at a fixed rate (via `ns.formulas.reputation.repFromDonation`), so once
150 favor is reached there is no need to grind rep by working.

**Workflow per reset:**
1. `workForRep.ts` — grind until `currentFavor + favorGain ≥ 150` for each faction
   (does NOT wait for all augs, just enough to unlock donation next reset)
2. After reset, factions with ≥ 150 favor use `bribe.ts` to instantly reach aug rep
3. `workForAugs.ts` handles factions that haven't hit 150 yet

---

## Faction Groups and Exclusivity

Defined in `Utils/factions.ts`:

**Special factions** (excluded from all rep grinding — no usable work type):
- Bladeburners, Church of the Machine God, Shadows of Anarchy

**City-exclusive factions** (not auto-joined — joining one blocks the others):
- Sector-12, Aevum, Chongqing, Ishima, New Tokyo, Volhaven

**Gang faction** — whichever faction the gang belongs to — is excluded from normal
rep grinding because rep comes from gang activities instead.

---

## Work Type Priority

`workForAugs.ts` selects the best work type per faction:
1. If `Formulas.exe` is present: use formula-based calculation (`getBestField`)
2. Otherwise: `hacking > field > security` from the faction's allowed types

Work types per faction are hardcoded in `Utils/factions.ts` (`FactionWork`).

---

## `buyAugs.ts` Algorithm

Buys all affordable unowned augs from one or more specified factions.  Run once rep
thresholds are met.

```
1. Assign each buyable aug to the first faction with sufficient rep
   (NeuroFlux Governor skipped — handled separately by bribeMax.ts)

2. Fixpoint prereq validation — drop any aug whose prerequisite chain can't
   be satisfied, repeat until stable (handles multi-level chains)

3. Sort by current price descending — buying expensive augs first minimises
   the per-purchase price-scaling penalty

4. Topological sort (DFS in price-descending order) — ensures every
   prerequisite is purchased before the aug that depends on it

5. Buy in order, retrying for up to 60 s per aug while waiting for funds
```

Run with `--no-install` to skip `installAugmentations` at the end.

---

## `bribeMax.ts` — NeuroFlux Governor Loop

- Picks the faction with the highest current favor (best donation efficiency)
- Donates until rep is sufficient for NeuroFlux Governor
- Buys one level of NeuroFlux Governor (via `neuroFlux-Governor.js`)
- Soft-resets to `startup.js` every time 10 augments are queued
- Intended as a late-game loop to stack NeuroFlux Governor levels between resets

---

## `invites.ts` — Requirement Handling

Handles all `PlayerRequirement` types returned by `getFactionInviteRequirements`:

| Requirement | Auto-handled |
|-------------|-------------|
| city | Yes — `travelToCity` |
| employedBy | Yes — applies to company in all job fields |
| companyReputation | Yes — works for company |
| backdoorInstalled | Yes — BFS path + installBackdoor |
| someCondition | Yes — meets first unmet sub-condition |
| everyCondition | Yes — meets all sub-conditions |
| money / skills / karma / augmentations / hacknet | Display only |

---

## `FactionsList` Order

Factions in `Utils/factions.ts` are ordered from easiest to hardest to join.  
`workForRep.ts` and `PlayerRegularFactions` use this ordering to determine priority.
