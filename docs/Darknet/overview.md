# Darknet Overview

## Scripts

| File | Purpose |
|------|---------|
| `startup.ts` | Entry point — kills legacy scripts, launches the three daemon scripts |
| `crawler.ts` | Self-replicating cracker — probes, cracks, spreads, maintains passwords |
| `crack.ts` | Interactive manual crack tool with tail window output |
| `phish.ts` | Phishing loop — runs ON a darknet server, calls `phishingAttack` continuously |
| `stasis.ts` | Maintains stasis links on highest-RAM cracked servers; deploys phishing |
| `mutationWatch.ts` | Re-seeds crawler to all cracked servers after each topology mutation |
| `deploy.ts` | Redeploys `phish.js` to all cracked servers (uses `hopDeploy` for deep nodes) |
| `hopDeploy.ts` | Relay helper — exec'd on a parent node to deploy to an adjacent target |
| `pin.ts` | Runs on a darknet server to establish / remove its stasis link |
| `probe.ts` | One-shot topology probe and display |
| `autocrack.ts` | Legacy — superseded by `crawler.ts` |
| `cleanup.ts` | Maintenance utility |

Requires `DarkscapeNavigator.exe` — `startup.ts` waits until it exists before launching.

---

## Daemon Architecture

Three long-running daemons started by `startup.ts`:

```
crawler.ts      — self-replicating; cracks and spreads across the network
mutationWatch.ts — re-seeds crawler after topology mutations
stasis.ts       — maintains stasis links + phishing on top-RAM servers
```

---

## Crawler (`crawler.ts`)

Runs on every server it has cracked.  Each instance:

1. Calls `ns.dnet.probe()` to see adjacent servers
2. For each adjacent server:
   - If already has a session → re-spread crawler (keeps it alive)
   - If no session → attempt to crack
3. On success → save password to `Darknet/passwords.txt`, scp back to home, spread
4. Waits for `nextMutation()`, runs `localMaintenance`, repeats

**Local maintenance** (on startup and after each mutation):
- Frees any blocked RAM via `memoryReallocation`
- Claims any `.cache` files present on the current server

**Spreading**: copies `crawler.js` to the target and `exec`s with `preventDuplicates: true`
so it's a no-op if already running there.

---

## Cracking Strategy (candidate generation)

Both `crawler.ts` and `crack.ts` use the same multi-stage candidate pipeline:

| Priority | Strategy |
|----------|---------|
| 1 | Model-specific candidates (hardcoded patterns per `modelId`) |
| 2 | Empty password (if hint says "no password" or length = 0) |
| 3 | Model-specific hint extractions (DeskMemo last word, Pr0verFl0 overflow, BellaCuore Roman numeral) |
| 4 | Hint phrase matching ("remember to use X", "the password is X") |
| 5 | Range brute-force ("a number between X and Y") |
| 6 | Full numeric brute-force ("divisible by 1") |
| 7 | Base conversion (hint or data field contains "base N number M") |
| 8 | N-digit number extraction from data field |
| 9 | Heartbleed log parsing (crawler only, requires sufficient charisma) |
| 10 | Known passwords from other servers (reuse check) |
| 11 | Raw data / hint as last resort |

---

## Interactive Solvers

Two server models require interactive feedback loops rather than static candidates:

### DeepGreen — Mastermind / Bulls-and-Cows

Opening strategy: guess `"000...0"`, `"111...1"`, ... `"999...9"` first.
Each repeated-digit guess reveals exactly how many of that digit are in the code.
Once the digit multiset is known, the candidate pool is tiny.
Remaining guesses use pool[0] and filter by `(bulls, cows)` match.

Feedback parsing handles: `"bulls,cows"` string, structured object, and message regex.

### NIL — Exact-position yes / yesn't

Each guess receives per-position feedback: `"yes"` (digit matches) or `"yesn't"` (doesn't).
Filters the candidate pool on exact position matches after each guess.

---

## Known Server Models

| Model | Pattern |
|-------|---------|
| `ZeroLogon` | Password is all zeros (or empty) |
| `FreshInstall_1.0` | "12345" or similar default |
| `DeskMemo_3.1` | Password is last word of hint |
| `Pr0verFl0` | Any repeated character of correct length passes |
| `BellaCuore` | Data/hint contains a Roman numeral; password is its decimal value |
| `OctantVoxel` | Base-conversion (caught by base-match regex) |
| `Laika4` | Dog name; heartbleed leaks letter hints used to reorder candidates |
| `DeepGreen` | Mastermind interactive solver |
| `NIL` | Yes/yesn't position feedback solver |
| `Factori-Os` | Variable hint patterns — falls through to hint-based logic |
| `CloudBlare(tm)` | Pattern not yet identified |
| `OpenWebAccessPoint` | Password leaked as N-digit number in data field |

---

## Stasis Links (`stasis.ts`)

- Picks the top-N cracked online servers by usable RAM (`maxRam − blockedRam`)
  where N = `getStasisLinkLimit()`
- Pins those servers (runs `pin.js` on them to establish the stasis link)
- Unpins any that fell out of the top-N
- Deploys `phish.js` to all currently pinned servers
- Re-evaluates after every `nextMutation()`

Stasis links keep servers reachable through topology mutations so phishing
doesn't need to re-authenticate constantly.

---

## Mutation Watch (`mutationWatch.ts`)

After each `nextMutation()`:
1. Restarts `crawler.js` on home if it died
2. For every server in `passwords.txt`:
   - Reconnects (evicts stale passwords if connection fails with non-"Service Unavailable" error)
   - Re-execs `crawler.js` with `preventDuplicates: true`

---

## Password Persistence

`Darknet/passwords.txt` is a JSON map of `{ hostname: password }`.
Every crawler instance scps it back to home after writing, so the file stays
authoritative on home regardless of which server discovered the password.
Invalid entries (non-darknet hosts, gone servers) are evicted by `stasis.ts`
and `mutationWatch.ts`.
