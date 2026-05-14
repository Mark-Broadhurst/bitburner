# Stock Overview

## Scripts

| File | Purpose |
|------|---------|
| `trade.ts` | Main trader — buys/sells long and short positions each tick |
| `manipulateStocks.ts` | Writes `Stock/positions.txt` so `hackCommander` can manipulate linked servers |
| `info.ts` | Read-only display of all symbols sorted by forecast extremity |

---

## Core Concept: Forecast

Every stock has a hidden `forecast` (0–1) — the probability its price moves up each tick.
Forecasts occasionally **flip** (cross 0.5) roughly every 75 ticks.

```
forecast > 0.5  →  stock trends up   →  buy long
forecast < 0.5  →  stock trends down →  buy short (requires BN8 or SF-8 ≥ level 2)
```

With **4S TIX API** the forecast is read directly.  Without it, `trade.ts` estimates
the forecast by counting up-moves in recent price history (Maximum Likelihood Estimate).

---

## Trade Constants

| Constant | Value | Meaning |
|----------|-------|---------|
| `COMMISSION` | $100k | Flat fee per trade (both entry and exit) |
| `BUY_LONG_MIN` | 0.60 | Minimum forecast to enter a long |
| `SELL_LONG_MAX` | 0.50 | Exit long when forecast drops below this |
| `BUY_SHORT_MAX` | 0.40 | Maximum forecast to enter a short |
| `SELL_SHORT_MIN` | 0.50 | Exit short when forecast rises above this |
| `MONEY_RESERVE` | $1B | Always kept liquid — never invested |
| `MIN_TRADE_VALUE` | $2M | Minimum spend per trade — below this commission dominates |

---

## History Windows (pre-4S)

| Constant | Value | Purpose |
|----------|-------|---------|
| `HISTORY_LEN` | 32 ticks | Buy decisions — longer window reduces noise |
| `SELL_WINDOW` | 10 ticks | Sell decisions — shorter window detects forecast flips faster |
| `MIN_HISTORY` | 16 ticks | Must collect this many ticks before trading starts |

Two separate forecast estimates are maintained per symbol — one for buy decisions
(`HISTORY_LEN`), one for sell decisions (`SELL_WINDOW`).  This asymmetry means:
- **Entries** are taken only on confirmed trends (less noise)
- **Exits** happen quickly when a trend reverses (limits losses on flips)

With 4S, both `buyForecast` and `sellForecast` are the same value from the API.

---

## Position Sizing

Cash is allocated proportionally across all current opportunities by expected return:

```
weight = edge × volatility    (with 4S)
weight = edge                 (pre-4S, volatility unavailable)

where edge = |forecast − 0.5|
```

Concentrates capital in positions with the highest expected return per tick.

---

## Tick Loop (`trade.ts`)

```
1. Update price history for all symbols
2. Sell any positions whose sell-forecast has crossed 0.5
3. Refresh position data
4. Identify new long / short opportunities
5. Allocate available cash (cash − MONEY_RESERVE) by weight
6. Buy positions above MIN_TRADE_VALUE
7. Display status
8. await ns.stock.nextUpdate()
```

---

## Stock Manipulation (`manipulateStocks.ts`)

Hacking and growing a server influences the forecast of the stock linked to that server.
This script bridges the stock trader and the hacking scheduler:

```
Long  position held → server added to "grow" list  → hackCommander grows  the server
Short position held → server added to "hack" list  → hackCommander hacks  the server
```

The lists are written to `Stock/positions.txt` as JSON each tick.
`hackCommander.ts` reads this file at the start of each loop and passes `stock=true`
to the corresponding `grow.js` / `hack.js` dispatches.

### Symbol → server mapping

All 33 symbols are mapped in `manipulateStocks.ts`.  `WDS` has no linked server
(`null`) and is skipped.

---

## Short Selling

Short positions are only opened when:
- Currently in **BN8** (Stock Market bitnode), OR
- **SF-8 level 2** or higher is owned

Checked via `ns.getResetInfo()` each tick.

---

## Notes

- `trade.ts` waits for TIX API access on startup (purchased by `upgrade.js`).
  It never exits — the moment TIX API is available it starts trading automatically.
- `info.ts` is read-only and safe to run alongside `trade.ts` at any time.
- The $1B money reserve ensures other scripts (augment purchases, corp, etc.) always
  have working capital even when most cash is deployed in stocks.
