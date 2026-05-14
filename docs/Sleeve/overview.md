# Sleeve Overview

## Scripts

| File | Purpose |
|------|---------|
| `work.ts` | Full decision-tree loop — assigns each sleeve the most useful task |
| `train.ts` | Fixed assignment — combat stats on sleeves 0–3, university on 4–5 |
| `crime.ts` | One-shot — assigns all sleeves to their best crime |
| `augments.ts` | Buys all purchasable sleeve augmentations cheapest first |
| `factionRep.ts` | Assigns sleeves round-robin to factions below 150 favour |
| `job.ts` | Assigns sleeves round-robin to companies the player is employed at |
| `diplomacy.ts` | Fixed Bladeburner assignments for use during active Bladeburner runs |

---

## `work.ts` — Main Decision Tree

Loops every 100 ms. Each sleeve is evaluated independently.

```
Priority order per sleeve:

1. sync < 100         → Synchronize
2. shock > 0          → Shock Recovery
3. hack < 100 or hack exp < 10k    → Algorithms (university, Sector-12)
4. cha < 100 or cha exp < 10k      → Leadership (university, Sector-12)
5. str < 120 or str exp < 30k      → Strength (gym, Sector-12)
6. def < 100 or def exp < 30k      → Defense (gym, Sector-12)
7. dex < 100 or dex exp < 30k      → Dexterity (gym, Sector-12)
8. agi < 100 or agi exp < 30k      → Agility (gym, Sector-12)
9. kills < 45 AND karma > -54,000 AND not in gang  → Homicide (10s sleep)
10. default                         → Idle
```

Sleeves travel to Sector-12 automatically if needed for gym/university.
University uses the closest university to the sleeve's current city.

---

## `train.ts` — Fixed Combat/Study Assignment

Used early in a run to quickly boost sleeve combat stats for crime/gang tasks.

| Sleeve | Task |
|--------|------|
| 0 | Strength — Powerhouse Gym (Sector-12) |
| 1 | Defense — Powerhouse Gym (Sector-12) |
| 2 | Dexterity — Powerhouse Gym (Sector-12) |
| 3 | Agility — Powerhouse Gym (Sector-12) |
| 4 | Algorithms — ZB Institute of Technology (Volhaven) |
| 5 | Leadership — ZB Institute of Technology (Volhaven) |

Sleeves with `shock > 0` are sent to Shock Recovery first.

---

## `crime.ts` — Best Crime (One-shot)

Calls `findBestCrime` from `Utils/crime.ts` for each sleeve and assigns it.
Best crime is determined by money/time or karma/time depending on what the
sleeve needs most (logic lives in `Utils/crime.ts`).

---

## `augments.ts` — Sleeve Augmentations

Collects all purchasable augs across all sleeves, sorts by cost ascending, and
buys them in order — waiting for funds if needed.

Only buys for sleeves with `shock === 0` (shocked sleeves can't install augs).

Displays a grid showing install status per sleeve:
- 🟩 installed
- 🟨 purchasable
- 🟥 not available

---

## `factionRep.ts` — Parallel Faction Rep Grinding

Assigns sleeves to factions that haven't yet reached 150 favour (the donation threshold).
Factions with unowned augmentations are prioritised.

- Assigns one sleeve per faction, round-robin up to sleeve count
- Uses `getBestField` (same formula-aware logic as `workForAugs.ts`)
- Loops every second and re-evaluates as favour thresholds are crossed
- Exits when all factions are at 150 favour

---

## `job.ts` — Company Rep via Sleeves

Assigns sleeves round-robin to companies the player is currently employed at.
Useful for building company rep in parallel while the player does something else.
Exits if no companies are active.

---

## `diplomacy.ts` — Bladeburner Support

Fixed assignment for Bladeburner runs (not dynamic):

| Sleeve | Task |
|--------|------|
| 0–2 | Diplomacy (reduces city chaos) |
| 3 | Field Analysis (improves action success estimates) |
| 4 | Tracking contracts |
| 5 | Bounty Hunter contracts |
| 6 | Retirement contracts |
| 7 | Infiltrate Synthoids |

---

## Notes

- `work.ts` guards against the Sleeve API being unavailable (SF10 not owned) and
  exits silently if `getNumSleeves()` throws or returns 0.
- The karma threshold in `work.ts` (`-54,000`) matches `Gang/create.ts` —
  sleeves stop doing Homicide once the gang is formed.
- `factionRep.ts` uses `getFactionFavor + getFactionFavorGain` as the favour
  total (same approach as `Faction/workForRep.ts`) so it correctly accounts for
  the favour that will be granted at the next reset.
