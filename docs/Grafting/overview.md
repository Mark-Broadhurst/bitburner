# Grafting Overview

## Scripts

| File | Purpose |
|------|---------|
| `begin.ts` | Grafts augmentations in priority order, filtered to the hacking/physical path |
| `list.ts` | Prints all graftable augmentations with price and graft time |

---

## Entropy Virus

Each grafted augmentation applies one stack of the Entropy Virus — a 1% multiplicative
reduction across all stat multipliers. The **Violet Congruity Implant** cures all
accumulated stacks and is always grafted last.

---

## Path Filter (`begin.ts`)

Only augmentations that give a **> 1% boost** to a hacking or physical stat are grafted,
ensuring each aug overcomes its marginal Entropy stack. All other augs (charisma,
hacknet, etc.) are skipped.

Relevant stat groups:

| Group | Multipliers checked |
|-------|-------------------|
| Hacking | `hacking`, `hacking_exp`, `hacking_chance`, `hacking_speed`, `hacking_money`, `hacking_grow` |
| Physical | `strength`, `strength_exp`, `defense`, `defense_exp`, `agility`, `agility_exp`, `dexterity`, `dexterity_exp` |

The Violet Congruity Implant bypasses the stat check — it is always included.

---

## Aug Priority Order

```
1. starterAugs   — CashRoot, PCMatrix, ECorp HVMind, nickofolas Congruity
2. skillAugs     — Neurotrainer I–III, Power Recirculation Core, nextSENS, Xanipher
3. hackAugs      — Synaptic Enhancement → QLink (26 augs, ascending power)
4. combatAugs    — Wired Reflexes → Hydroflame Left Arm (39 augs)
5. bladeBurnerAugs — Blade's Simulacrum → BLADE-51b IPU Upgrade (16 augs)
6. Violet Congruity Implant — cures all Entropy stacks
```

Augs already owned or not currently graftable are skipped automatically.
