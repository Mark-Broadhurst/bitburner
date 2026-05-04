# bitburner

Automated TypeScript scripts for completing all 15 bitnodes in [Bitburner](https://bitburner-official.github.io/).

## Setup

1. Install the [Bitburner VS Code extension](https://marketplace.visualstudio.com/items?itemName=bitburner.bitburner-vscode)
2. In-game, go to **Options → Remote API** and start the server
3. Open this repo in VS Code — the extension will sync `.js` files to the game automatically

## Entry point

Run `init.js` after each augmentation install or bitnode reset. It detects the current bitnode and level, then launches the appropriate strategy.

`installloop.js` drives the aug grind loop: it works through faction groups in order, buys augs, and calls `destroyW0r1dD43m0n` to reset into the next cycle.

## Structure

| Folder | Purpose |
|--------|---------|
| `Bladeburner/` | Bladeburner automation |
| `Cloud/` | Purchased server buying and upgrading |
| `CodingContract/` | Solvers for all contract types |
| `Corporation/` | Corporation management |
| `Gang/` | Gang member tasks, equipment, territory |
| `Grafting/` | Augmentation grafting |
| `Hacknet/` | Hacknet upgrades and hash spending |
| `Sleeve/` | Sleeve work assignment |
| `Stanek/` | Stanek's Gift fragment charging |
| `Stock/` | Stock market trading |
| `hacking/` | HWGW batch scheduler, nuke-all, target prep |
| `faction/` | Faction joins, rep grinding, aug purchasing |
| `job/` | Job applications and working |
| `utils/` | Shared helpers |

## Requirements

- Bitburner v3.0.0+
- Source-File 4 (The Singularity) unlocked for singularity API access