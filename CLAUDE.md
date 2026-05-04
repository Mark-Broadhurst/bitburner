# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

TypeScript scripts for the game [Bitburner](https://bitburner-official.github.io/). Scripts are written locally, then synced to the game and run inside it via the Bitburner Remote API. The game provides its own `NS` (Netscript) API; all scripts receive an `NS` instance as their sole argument.

There is no build system, test suite, or package manager. The `NetscriptDefinitions.d.ts` file in the root provides type definitions for the game API.

## How scripts run in-game

Each `.ts` file compiles to a `.js` file that Bitburner executes. Scripts are launched with `ns.run("script.js", threads, ...args)` or `ns.exec(...)` and run as isolated processes. They communicate through the shared game state (servers, player stats, etc.) — not through imports or message passing.

The entry point for a new game cycle is `startup.ts`, which kills everything and restarts all long-running daemon scripts. `scriptManager.ts` is a sequential script runner: it runs scripts one at a time (waiting for each to finish), then `spawn`s the last one, passing control.

`installloop.ts` drives the augmentation install loop: it determines which faction group to work on next (based on which augs are still missing), joins those factions, grinds rep, buys augs, and calls `ns.singularity.destroyW0r1dD43m0n` to reset into a new cycle.

## Architecture

### Script categories

Folders named after their NS TypeScript type (`ns.bladeburner: Bladeburner` → `Bladeburner/`, etc.).

| Folder | NS namespace | Purpose |
|--------|-------------|---------|
| `Bladeburner/` | `ns.bladeburner` | Bladeburner automation — tasks, skills, action selection |
| `CodingContract/` | `ns.codingcontract` | Solvers for all coding contract types |
| `Cloud/` | `ns.cloud` | Purchased server buying and upgrading |
| `Corporation/` | `ns.corporation` | Corporation management — offices, warehouses, products |
| `Darknet/` | `ns.dnet` | Darknet scripts (empty, ready to populate) |
| `Gang/` | `ns.gang` | Gang management — member tasks, equipment, territory warfare |
| `Go/` | `ns.go` | IPvGO automation (empty, ready to populate) |
| `Grafting/` | `ns.grafting` | Augmentation grafting |
| `Hacknet/` | `ns.hacknet` | Hacknet node upgrades and hash spending |
| `Infiltration/` | `ns.infiltration` | Infiltration automation (empty, ready to populate) |
| `Sleeve/` | `ns.sleeve` | Sleeve work assignment |
| `Stanek/` | `ns.stanek` | Stanek's Gift fragment charging |
| `Stock/` | `ns.stock` | Stock market trading |
| `hacking/` | core `ns.hack/grow/weaken` | HWGW batch scheduler, backdoor, nuke-all, target prep |
| `faction/` | `ns.singularity` | Faction joins, rep grinding, aug purchasing, bribery |
| `job/` | `ns.singularity` | Job applications and working |
| `programs/` | `ns.singularity` | Program buying/creation |
| `home/` | `ns.singularity` | Home server RAM/core upgrades |
| `utils/` | — | Shared helpers (re-exported via `utils/index.ts`) |

Supporting utility namespaces (no dedicated folder — used within other scripts): `ns.singularity` (requires SF4), `ns.formulas` (requires Formulas.exe), `ns.format`, `ns.ui`.

### Core utilities (`utils/`)

- `utils/network.ts` — server discovery (`getServerNames`, `getServers`, `getWorkerServers`, `getTargetServers`, `getTargetServer`, `getPlayerServers`)
- `utils/hacking.ts` — `Work`, `WorkerServer`, `Command` types used by the HWGW scheduler
- `utils/factions.ts` — `FactionsList`, `FactionWork`, faction filter helpers (`isSpecialFaction`, `isExclusiveFaction`, `isGangFaction`, `FactionsWithAugs`)
- `utils/augments.ts`, `utils/crime.ts`, `utils/companies.ts` — domain helpers

### HWGW batch hacking (`hacking/hackCommander.ts`)

The main hacking loop runs continuously and manages two pools:

- **farmPool** — purchased servers + hacked servers, used for HWGW batches against prepped targets
- **prepPool** — farmPool + home (64 GB reserved), used for weaken/grow against unprepped targets

Each loop iteration dispatches farm batches to fill RAM, then fills remaining capacity with prep work. `hack.js`, `grow.js`, and `weaken.js` are thin wrappers that accept `(target, additionalMsec)` and are `exec`'d directly onto worker servers.

### Faction progression (`installloop.ts`)

Factions are grouped into tiers (`factionGroups` array). The loop finds the first group that still has unowned augs and works through that group before advancing. City-exclusive factions (`Sector-12`, `Aevum`, etc.) are tracked in `isExclusiveFaction`.

## Script conventions

- Every script exports `async function main(ns: NS)` as its entry point.
- Scripts that support tab-completion export `function autocomplete(data, args)`.
- Scripts that loop use `ns.disableLog("ALL")` and `ns.clearLog()` at the top, then print status to the tail window.
- The `@ns` module alias maps to `NetscriptDefinitions.d.ts`; always import as `import { NS } from "@ns"`.
- Use `template.ts` as the starting point for new scripts.
