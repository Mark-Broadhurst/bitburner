# Stanek Overview

## Scripts

| File | Purpose |
|------|---------|
| `charge.ts` | Accepts the Stanek gift, then launches `charge.js` threads across all active fragments |

The root-level `charge.ts` (outside this folder) is the per-fragment worker that
`Stanek/charge.ts` spawns.  The two scripts work together: `Stanek/charge.ts` is the
orchestrator, `charge.ts` is the RAM-burning loop.

---

## `charge.ts` — Fragment Charger Orchestrator

Run once to (re)start fragment charging.  Steps:

1. Calls `ns.stanek.acceptGift()` — no-op if the gift is already accepted; exits if it
   returns false (Stanek not available).
2. Kills any currently running `charge.js` instances (one per fragment coordinate) to
   avoid double-charging.
3. Reads available home RAM: `maxRam − ramUsed + cost of this script` (adds back its
   own footprint since it's about to `spawn` and exit).
4. Collects active fragments with `id < 100` — this excludes **booster fragments**
   (id ≥ 100), which cannot be charged.
5. Divides available RAM equally: `threads = floor(ram / 2 / fragmentCount)`.
   The `/2` is the cost of `charge.js` per thread.
6. Launches `charge.js` on each fragment at `(x, y)` with the calculated thread count.
   The last fragment uses `ns.spawn` so `Stanek/charge.ts` exits cleanly; all earlier
   ones use `ns.run`.

---

## Notes

- More threads = more charge per tick = faster fragment levelling.  The script
  maximises threads by consuming all available home RAM at launch time.
- Fragment charging provides passive stat multipliers that compound with augmentations.
  Higher fragment level → stronger multiplier.
- Booster fragments (id ≥ 100) amplify adjacent fragment charge rates; they level
  themselves passively and do not need to be charged directly.
- Re-running `Stanek/charge.ts` after gaining more home RAM or after other scripts free
  RAM will restart charging with more threads.
