# Bladeburner Overview

## Scripts

| File | Purpose |
|------|---------|
| `start.ts` | Joins Bladeburner division, launches `skills.js` and `tasks.js` |
| `tasks.ts` | Main action loop — selects the best action each tick |
| `skills.ts` | Skill upgrade loop — keeps skills balanced with a phase-1 bootstrap |

---

## Action Loop (`tasks.ts`)

Runs every `nextUpdate()` tick.  Priority order:

```
1. HP < max          → Hyperbolic Regeneration Chamber (always heals first)
2. Stamina ≥ 50%     → stamina action (see below)
3. Stamina < 50%     → free action (see below)
```

### Stamina actions (priority)

```
1. Black Op available (rank sufficient) → execute next Black Op
2. Operation available                  → best eligible operation
3. Contract available                   → best eligible contract
4. (none eligible)                      → free action
```

### Free actions

```
if total remaining actions ≤ total communities across all cities:
    Incite Violence  (replenishes action counts)
else if all cities have equal chaos:
    Field Analysis   (rotates through cities round-robin)
else:
    Diplomacy        (reduces chaos in the highest-chaos city)
```

---

## Action Eligibility Filter

For both contracts and operations:

```
count remaining > 0
AND estimated min success chance ≥ 80%
AND estimated max success chance = 100%
```

Sorted by `min` descending — take the most-certain action first.

Operations priority list (highest to lowest): Raid, Assassination, Stealth Retirement,
Sting Operation, Undercover Operation, Investigation.

---

## Bonus Time

When `getBonusTime() > 5000 ms`, action sleep is multiplied by 0.2 (5× speed)
to burn through accumulated bonus time.

---

## Black Ops

Black Ops are run in sequential order via `ns.bladeburner.getNextBlackOp()`.
Requires player rank ≥ the op's required rank.
Final Black Op is "Operation Daedalus" — completing it ends the run.

---

## Skill Upgrades (`skills.ts`)

### Phase 1 — Bootstrap

Alternate between **Overclock** and **Hyperdrive** until Overclock reaches level 90.
(Overclock caps at 90; upgrading beyond that is blocked in the filter.)

### Phase 2 — Balance

Keep all 12 skills at equal levels by always upgrading whichever has the lowest level.
Waits for sufficient skill points before each upgrade.

### Full skill list

Blade's Intuition, Cloak, Short-Circuit, Digital Observer, Tracer, Overclock,
Reaper, Evasive System, Datamancer, Cyber's Edge, Hands of Midas, Hyperdrive

---

## Action Type Constants

Action specs are inline tuples `[ns.enums.BladeburnerActionType, name]` using the
built-in `BladeburnerActionType` / `BladeburnerActionName` types from `@ns`.
No separate enum file is needed.
