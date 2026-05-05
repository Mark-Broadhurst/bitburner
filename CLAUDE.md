# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

TypeScript scripts for the game [Bitburner](https://bitburner-official.github.io/). Scripts are written locally, then synced to the game and run inside it via the Bitburner Remote API. The game provides its own `NS` (Netscript) API; all scripts receive an `NS` instance as their sole argument.

There is no build system, test suite, or package manager. The `NetscriptDefinitions.d.ts` file in the root provides type definitions for the game API.

## Syncing to the game

After committing changes, mirror the source to the typescript-template project which handles compilation and upload:

```powershell
robocopy C:\code\bitburner C:\code\typescript-template\src /MIR /XD .git .claude node_modules /XF "*.md" ".gitignore" "NetscriptDefinitions.d.ts" "tsconfig.json"
```

## How scripts run in-game

Each `.ts` file compiles to a `.js` file that Bitburner executes. Scripts are launched with `ns.run("script.js", threads, ...args)` or `ns.exec(...)` and run as isolated processes. They communicate through shared game state — not through imports or message passing.

There are two distinct entry points:

- **`init.ts`** — the per-bitnode strategy script. Detects the current BitNode (`ns.getResetInfo()`) and dispatches to `bn1()`–`bn15()`. Only BN1/BN12 is fully implemented; BN2–BN15 are stubs. This is what `ns.singularity.destroyW0r1dD43m0n` or `ns.singularity.installAugmentations` are pointed at.
- **`startup.ts`** — restarts all daemons in a running game (kills everything, re-launches). Does not branch on BitNode.

`scriptManager.ts` is a sequential script runner: it runs scripts one at a time (waiting for each to finish), then `spawn`s the last one, passing control.

`installloop.ts` drives the augmentation install loop. It determines which faction group to work on next (based on the `factionGroups` tier list — first group with any unowned aug), then joins, grinds rep, buys augs, and calls `destroyW0r1dD43m0n`. **The `joinFaction`, `gainRep`, and `buyAugs` functions are currently stubs.**

## Architecture

### Folder naming

All folders are named after their NS TypeScript type (`ns.bladeburner: Bladeburner` → `Bladeburner/`, etc.). The exceptions are folders that use `ns.singularity` but are split by concern.

| Folder | NS namespace | Purpose |
|--------|-------------|---------|
| `Bladeburner/` | `ns.bladeburner` | Tasks, skills, action selection |
| `CodingContract/` | `ns.codingcontract` | `solve.ts` — scans all servers, solves all 27 contract types inline; `generate.ts` — creates a test contract on home |
| `Cloud/` | `ns.cloud` | Purchased server buying and upgrading |
| `Corporation/` | `ns.corporation` | Offices, warehouses, products |
| `Darknet/` | `ns.dnet` | Empty, ready to populate |
| `Faction/` | `ns.singularity` | Join, rep grinding, aug purchasing, bribery |
| `Gang/` | `ns.gang` | Member tasks, equipment, territory warfare |
| `Go/` | `ns.go` | Empty, ready to populate |
| `Grafting/` | `ns.grafting` | Augmentation grafting |
| `Hacknet/` | `ns.hacknet` | Node upgrades, hash spending |
| `Hacking/` | core `ns` | HWGW batch scheduler, backdoor, nuke-all, target prep |
| `Home/` | `ns.singularity` | Home server RAM/core upgrades |
| `Infiltration/` | `ns.infiltration` | Empty, ready to populate |
| `Job/` | `ns.singularity` | Job applications and working |
| `Programs/` | `ns.singularity` | Program buying/creation |
| `Sleeve/` | `ns.sleeve` | Sleeve work assignment |
| `Stanek/` | `ns.stanek` | Fragment charging |
| `Stock/` | `ns.stock` | Stock market trading |
| `Utils/` | — | Shared helpers (re-exported via `Utils/index.ts`) |

Supporting namespaces with no dedicated folder: `ns.formulas` (requires Formulas.exe), `ns.format`, `ns.ui`.

### Core utilities (`Utils/`)

- `Utils/network.ts` — server discovery: `getServerNames`, `getServers`, `getWorkerServers`, `getTargetServers`, `getTargetServer`, `getPlayerServers`
- `Utils/factions.ts` — `FactionsList`, `FactionWork`, `PlayerRegularFactions`, and filter helpers: `isSpecialFaction`, `isExclusiveFaction`, `isGangFaction`, `FactionsWithAugs`
- `Utils/hacking.ts` — `Work`, `WorkerServer`, `Command` types used by the HWGW scheduler
- `Utils/augments.ts`, `Utils/crime.ts`, `Utils/companies.ts` — domain helpers

### HWGW batch hacking (`Hacking/hackCommander.ts`)

The main hacking loop manages two pools:

- **farmPool** — purchased servers + hacked servers, used for HWGW batches against prepped targets
- **prepPool** — farmPool + home (64 GB reserved), used for weaken/grow against unprepped targets

Each loop iteration dispatches farm batches to fill RAM, then fills remaining capacity with prep work. `hack.js`, `grow.js`, and `weaken.js` are thin wrappers that accept `(target, additionalMsec)` and are `exec`'d directly onto worker servers.

### Faction progression (`installloop.ts`)

Factions are grouped into tiers (`factionGroups` array). The loop finds the first group with at least one unowned aug and works through it before advancing. City-exclusive factions are tracked in `isExclusiveFaction` in `Utils/factions.ts`.

## Script conventions

- Every script exports `async function main(ns: NS)` as its entry point.
- Scripts that support tab-completion export `function autocomplete(data, args)`.
- Looping scripts call `ns.disableLog("ALL")` and `ns.clearLog()` at the top, then print status to the tail window.
- Always import as `import { NS } from "@ns"` — the `@ns` alias maps to `NetscriptDefinitions.d.ts`.
- Use `template.ts` as the starting point for new scripts.
- Folders: PascalCase matching the NS type name. Files: camelCase.
