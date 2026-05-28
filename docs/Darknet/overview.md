# Darknet Overview

## Scripts

| File | Purpose |
|------|---------|
| `startup.ts` | Entry point — kills legacy scripts, launches daemons; waits for `DarkscapeNavigator.exe` |
| `crawler.ts` | Self-replicating cracker — probes, cracks, spreads, maintains passwords |
| `stasis.ts` | Mutation watch + stasis links + phishing on pinned servers |
| `crack.ts` | Interactive manual crack tool with tail window output |
| `phish.ts` | Phishing loop — runs **on** a darknet server, calls `phishingAttack` continuously |
| `pin.ts` | Runs on a darknet server to establish or remove its stasis link (kept separate from `phish.ts` to avoid paying the 12 GB RAM cost for `setStasisLink` on servers that don't need pinning) |
| `cleanup.ts` | Deletes all `Darknet/*.txt` files on home (event logs, probe results) |

---

## Daemon Architecture

Two long-running daemons started by `startup.ts`:

```
crawler.ts  — self-replicating; cracks and spreads across the network
stasis.ts   — mutation watch + stasis links + phishing on top-RAM servers
```

`startup.ts` also kills any stale scripts from old sessions before launching.

---

## Crawler (`crawler.ts`)

Runs on every server it has cracked. Each instance:

1. Runs `localMaintenance` (cache claiming + RAM freeing on the local server)
2. Calls `ns.dnet.probe()` to see adjacent servers
3. For each server with an active session → calls `spread()` to keep it seeded
4. For the first server without a session → attempts to crack it, then loops immediately to re-probe
5. When all adjacent servers are cracked → waits for `nextMutation()` and repeats

### Post-crack sequence (`spread()`)

Executed every time we have an active session on a server (fresh crack or re-visit after mutation):

1. **Open caches** — calls `openCache()` on every `.cache` file found on the server
2. **Free blocked RAM** — calls `memoryReallocation()` if any RAM is blocked
3. **Run exe files** — `exec()`s every `.exe` file found on the server (1 thread each)
4. **Harvest files** — SCPs non-crawler files back to home for inspection
5. **Deploy crawler** — SCPs and `exec`s `crawler.js` with `preventDuplicates: true` (no-op if already running)

### Local maintenance (`localMaintenance()`)

Runs at the top of every loop iteration on the server the crawler is currently on:

- Only runs if `isDarknetServer()` is true
- Frees any blocked RAM via `memoryReallocation()`
- Claims any `.cache` files via `openCache()` (logs karma cost on success)

### Interactive solver lock

Multiple crawlers on different servers can see the same target. For interactive
solvers (AccountsManager, DeepGreen, NIL, RateMyPix, The Labyrinth, Factori-Os)
a lock file is written to `Darknet/lock_<host>.txt` before solving. If another
crawler already holds the lock it backs off immediately. The lock is released
in a `finally` block so crashes don't leave stale locks.

---

## Cracking Strategy

Each server has a `modelId`. `buildCandidates()` dispatches to a model-specific
function and deduplicates the result. Unknown models throw — add them to the
`MODELS` dispatch map in `crawler.ts`.

### Candidate generators per model

| Model | Strategy |
|-------|---------|
| `ZeroLogon` | All-zeros or empty string |
| `FreshInstall_1.0` | Common default passwords (`admin`, `12345`, etc.) filtered by length |
| `DeskMemo_3.1` | Last word of the hint field |
| `CloudBlare(tm)` | Digits extracted from `data` field, trimmed to correct length |
| `Pr0verFl0` | Repeated `"a"` characters (buffer overflow — any repeated char works) |
| `BellaCuore` | Roman numeral in `data` or quoted in hint → decimal value, zero-padded |
| `OctantVoxel` | Base-conversion: hint `"the base N number X in base 10"` or `data` as `"base,value"` |
| `Factori-Os` | Divisibility: hint gives divisor; static candidates; also has interactive solver |
| `OpenWebAccessPoint` / `Openwebaccesspoint` | Empty password |
| `AccountsManager_4.2` | Interactive binary search — response is `"Higher"` / `"Lower"` |
| `KingOfTheHill` | Heartbleed log parsing — looks for `"I think N with N is key"` |
| `RateMyPix.Auth` | Interactive pool filter — response is 🌶️ × (count of correct-position digits) |
| `PHP 5.4` | Permutations of digits from hint or data |
| `Laika4` | Dog names; heartbleed hints bias ordering via letter frequency scoring |
| `(The Labyrinth)` | DFS maze solver using `labreport` + direction commands |
| `DeepGreen` | Mastermind solver (see below) |
| `NIL` | Yes/yesn't position feedback solver (see below) |

---

## Interactive Solvers

### AccountsManager_4.2 — Binary Search

Standard binary search over the numeric range. Feedback is parsed from
`r.data` and `r.message` concatenated: if it contains `"higher"` → `lo = mid + 1`;
`"lower"` → `hi = mid - 1`.

### DeepGreen — Mastermind / Bulls-and-Cows

**Phase 1** — probe each repeated-digit guess `"000…"` through `"999…"`.
The number of bulls from each tells you exactly how many of that digit appear
in the password. This builds the full digit multiset in ≤10 guesses.

**Phase 2** — try every unique permutation of that multiset. Pool is small
because the digit counts are fully known.

Feedback parsing handles: `"bulls,cows"` string, structured object with
various key names, and message regex patterns.

### NIL — Yes / Yesn't

Each guess receives per-position boolean feedback (`"yes"` = correct position,
`"yesn't"` = wrong). Pool is filtered after each guess to only candidates
that would produce the same per-position match pattern. Smart quotes are
normalised before parsing.

### RateMyPix.Auth — Chilli Count

Each guess receives a score: number of 🌶️ emojis = digits in the correct position.
Same pool-filter approach as NIL but using a count instead of per-digit booleans.
Falls back to `"X/N"` numeric pattern if emoji counting fails.

### Factori-Os — Divisibility Constraints

Uses small prime probes to split the pool by divisibility. The probe that
most evenly splits the remaining pool is chosen each round. Falls back to
`pool[0]` when no useful prime remains.

### (The Labyrinth) — DFS Maze

Calls `labreport()` for current position and available exits.
DFS explores all reachable cells; `authenticate(host, "go <direction>")` moves
and returns success if the exit is found. Backtracks with the reverse command.

---

## Stasis + Mutation Watch (`stasis.ts`)

Runs from home. Re-evaluates on startup and after every `nextMutation()`:

### Crawler re-seed

1. Restarts `crawler.js` on home if it died
2. For every server in `passwords.txt`: reconnects and re-execs `crawler.js`
   with `preventDuplicates: true` (no-op if already running)
3. Evicts stale passwords when `connectToSession` fails with a non-"Service Unavailable" error

### Stasis links

- Picks the top-N cracked online servers by usable RAM (`maxRam − blockedRam`)
  where N = `getStasisLinkLimit()`
- Pins those servers (SCPs and execs `pin.js` to establish the stasis link; frees
  blocked RAM first so `pin.js` has room to run)
- Unpins any that fell out of the top-N

Stasis links keep servers reachable through topology mutations so phishing
doesn't need to re-authenticate constantly.

### Phishing

Deploys `phish.js` to all currently pinned servers. `phish.js` runs a continuous
`phishingAttack()` loop on each server.

---

## Password Persistence

`Darknet/passwords.txt` is a JSON map of `{ hostname: password }`.
Written by `crawler.ts` after each successful crack; SCPd back to home so the
file is authoritative on home regardless of which server discovered the password.

Invalid entries are evicted in two places:
- `stasis.ts` — evicts hosts that throw when `getServerDetails` is called
- `stasis.ts` crawler re-seed — evicts when `connectToSession` fails (non-unavailable error)

---

## Heartbleed

Used by `KingOfTheHill` and `Laika4`. Requires player charisma ≥ the server's
`getServerRequiredCharismaLevel()`. Called with `{ peek: true, logsToCapture: 10 }`.
Returns early with an empty array if charisma is insufficient.
