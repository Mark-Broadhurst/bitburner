# Hacking Overview

## Scripts

| File | Purpose |
|------|---------|
| `hackCommander.ts` | Main HWGW batch scheduler — runs continuously |
| `prepTargets.ts` | One-shot prep script — brings all targets to min security / max money, then exits |
| `nuke-all.ts` | Roots every server reachable with current port tools, copies worker scripts |
| `backdoor.ts` | BFS-based backdoor installer — works through all servers in order of port requirement |

---

## HWGW Batch Model (`hackCommander.ts`)

Each batch fires four operations timed to land in sequence against a prepped target:

```
dispatch all at t=0 ───────────────────────────────────────────→ time
                                                           │
  hack.js    ─────────────────────────────────────────► lands at weakenTime + 0×SPACING
  weaken1.js ──────────────────────────────────────────────────► lands at weakenTime + 1×SPACING
  grow.js    ──────────────────────────────────────────────────────────► lands at weakenTime + 2×SPACING
  weaken2.js ──────────────────────────────────────────────────────────────────► lands at weakenTime + 3×SPACING
```

- **hack** steals `HACK_PERCENT` (50%) of max money
- **weaken1** counters the security increase from hack (each thread reduces security by 0.05)
- **grow** restores money from 50% back to 100%
- **weaken2** counters the security increase from grow
- Successive batches are offset by `4 × SPACING` so ops from different batches never interleave

---

## Key Constants

| Constant | Value | Meaning |
|----------|-------|---------|
| `HACK_PERCENT` | 0.5 | Fraction of max money stolen per hack |
| `SPACING` | 200 ms | Gap between each op landing |
| `MAX_WEAKEN` | 5 min | Skip targets whose weaken time exceeds this |
| `HOME_RESERVED_RAM` | 64 GB | Kept free on home for management scripts |
| Worker script RAM | 1.75 GB | Each of `hack.js`, `grow.js`, `weaken.js` |

---

## Server Pools

Both passes draw from one shared pool, so prep allocations are immediately visible to the
farm pass — no threads are double-counted.

```
farmPool  = purchased servers + hacked servers + home (HOME_RESERVED_RAM held back)
prepPool  = same array as farmPool
```

Home is appended last so dedicated purchased servers fill first.

---

## Target Selection

Targets are scored as `moneyMax / minDifficulty` — rewards high money, low security.  
Sorted highest score first so RAM fills with the best servers when capacity is limited.  
Servers with `weakenTime > MAX_WEAKEN` or `hackChance == 0` are excluded.

**Prepped** = `hackDifficulty ≤ minDifficulty + 1` AND `moneyAvailable ≥ moneyMax × 0.99`

---

## Loop Order Each Tick

1. **Read stock signals** from `Stock/positions.txt` (written by `manipulateStocks.ts`)
2. **Prep pass** — for each non-prepped target, calculate and dispatch weaken/grow work
3. **Farm pass** — for each prepped target, dispatch as many HWGW batches as RAM allows
4. Sleep `SPACING` ms, repeat

Prep runs first so desynced servers can always claim RAM to recover before farm batches fill the pool.

---

## Prep Logic (`prepTargets.ts` and inline in `hackCommander.ts`)

```
if security > minSecurity + 1:
    dispatch weaken only (threads = securityDiff / 0.05)
else:
    dispatch grow + weaken pair
    grow delay  = weakenTime - growTime   (so grow lands at weakenTime)
    weaken delay = SPACING                (lands SPACING ms after grow)
```

`hackCommander.ts` passes `home.cpuCores` to `growthAnalyze` so multi-core home needs
fewer grow threads and doesn't over-allocate.

---

## Stock Manipulation Integration

`manipulateStocks.ts` writes `Stock/positions.txt` each tick with the set of servers
linked to held long/short positions.  `hackCommander.ts` reads this and passes
`stock=true` to the corresponding `grow.js` / `hack.js` dispatches, which causes
those operations to also influence the linked stock's forecast.

- **Long position** → `grow` the linked server → pushes forecast up
- **Short position** → `hack` the linked server → pushes forecast down

---

## nuke-all / backdoor

**`nuke-all.ts`** — one-shot: opens ports with available tools, nukes, copies worker files
(`grow.js`, `weaken.js`, `hack.js`, `share.js`, `charge.js`) onto each newly rooted server.

**`backdoor.ts`** — continuous: BFS-finds the path to each server, connects hop-by-hop, and
installs a backdoor. Waits if hacking level or root access is not yet sufficient.
Skips `w0r1d_d43m0n`.
