# Gang Overview

## Scripts

| File | Purpose |
|------|---------|
| `create.ts` | Waits for karma threshold, creates gang, launches the three daemon scripts |
| `loop.ts` | Bootstrap loop — buys the cheapest unowned gang aug, installs, and respawns |
| `tasks.ts` | Per-tick task assignment: train → vigilante → respect → territory → money |
| `equipment.ts` | Buys cheapest missing equipment for the least-equipped member |
| `territoryWarfare.ts` | Hysteresis-based territory warfare controller |

---

## Gang Creation (`create.ts`)

- Waits until karma ≤ −54,000 (the threshold to form a gang in BN2+)
- Creates the gang under **"Slum Snakes"** (criminal faction)
- Immediately starts `equipment.js`, `territoryWarfare.js`, and `tasks.js`

---

## Bootstrap Loop (`loop.ts`)

Run once after each augmentation install to get the gang producing money quickly:

```
1. Start Sleeve/crime, nuke-all, backdoor, hackCommander (targeting n00dles)
2. Find cheapest unowned gang aug with base price < $1T
3. If found:
   a. Set all members to "Human Trafficking" (money task)
   b. Wait until home has enough cash
   c. Set all members to "Terrorism" (respect task)
   d. Wait until faction rep meets the aug's rep requirement
   e. Buy and install the aug → respawn loop.js
4. If no cheap aug remains, kill all and run startup.js
```

---

## Task Assignment (`tasks.ts`)

Runs every gang tick. Decision tree per member (in priority order):

```
1. Recruit a new member if possible (named "gang-0", "gang-1", ...)
2. Ascend if any stat multiplier > threshold (default 1.5)
3. Train Combat  — if str / def / dex / agi < skillSteps[memberCount]
4. Train Hacking — if hack < skillSteps[memberCount]
5. Train Charisma — if cha < skillSteps[memberCount]
6. Vigilante Justice — if respect < wantedLevel × 50 AND wantedLevel ≥ 5
7. Best respect task — if gang respect < 5,000,000
8. Territory Warfare — if territory < 100% AND territoryWarfareEngaged
9. Best money task   — default
```

### Skill step thresholds (indexed by member count)

| Members | Skill goal |
|---------|-----------|
| 0–2 | 0 (train nothing — earn immediately) |
| 3 | 30 |
| 4 | 50 |
| 5 | 100 |
| 6 | 150 |
| 7 | 200 |
| 8 | 300 |
| 9 | 500 |
| 10 | 1 000 |
| 11 | 1 500 |
| 12 | 3 000 |
| 13 | 5 000 |

### Task scoring

Best respect / best money tasks are selected with `ns.formulas.gang` functions.
Tasks with `respect / wantedLevel < 50` are filtered out to avoid excessive wanted
level growth.  Ties break on the other metric (wanted level, then money / respect).

---

## Equipment (`equipment.ts`)

- Picks the member with the fewest total equipment + augmentations
- Finds the cheapest piece of equipment that member is missing
- Waits until home has `max($50M, cost × 2)` liquid before buying
- Loops continuously so all members are gradually equipped in round-robin order

---

## Territory Warfare (`territoryWarfare.ts`)

Uses hysteresis to avoid rapid toggling near the threshold:

| Condition | Action |
|-----------|--------|
| Win chance vs weakest enemy > **55%** | Enable territory warfare |
| Win chance vs weakest enemy < **45%** | Disable territory warfare |

- Always targets the **weakest** enemy gang (lowest power), not the strongest
- Win chance = `ourPower / (ourPower + enemyPower)`
- Exits the loop (warfare complete) when `territory ≥ 100%`

Members are assigned to "Territory Warfare" task by `tasks.ts` when
`gang.territoryWarfareEngaged` is true — `territoryWarfare.ts` owns the flag,
`tasks.ts` reads it.

---

## Notes

- `Gang/loop.ts` only buys augs with **base price < $1T** — very expensive late-game
  augs are handled by the main faction aug buying flow instead.
- Ascension multiplier threshold defaults to 1.5 but can be passed as an arg:
  `run Gang/tasks.js 2.0`
