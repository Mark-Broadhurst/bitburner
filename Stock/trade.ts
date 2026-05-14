import { NS } from "@ns";

/**
 * Stock market trader.
 *
 * Signal: every stock has a hidden `forecast` (0–1), the probability its price
 * goes up this tick.  forecast > 0.5 → buy long; < 0.5 → buy short.
 * The 4S TIX API reveals it directly.  Without 4S we estimate it by counting
 * up-moves in recent price history — the observed up-rate IS the forecast.
 *
 * Forecasts occasionally "flip" (swap sides of 0.5) every ~75 ticks.
 * We use a short window (SELL_WINDOW ticks) for sell decisions so flips are
 * detected quickly, and the full window (HISTORY_LEN) for buy decisions to
 * avoid noise-triggered entries.
 *
 * Position sizing: allocate more cash to stocks with higher expected return
 * (edge × volatility).  Without volatility data (pre-4S) we weight by edge
 * alone.  This concentrates capital where it earns the most per tick.
 */

const COMMISSION      = 100_000;   // flat fee per trade
const BUY_LONG_MIN    = 0.60;      // buy forecast  ≥ this → long
const SELL_LONG_MAX   = 0.50;      // sell forecast <  this → exit long
const BUY_SHORT_MAX   = 0.40;      // buy forecast  ≤ this → short
const SELL_SHORT_MIN  = 0.50;      // sell forecast >  this → exit short
const MONEY_RESERVE   = 1e9;       // always keep $1 B liquid
const MIN_TRADE_VALUE = 2_000_000;       // minimum spend per trade — below this commission dominates

// Pre-4S history tracking
const HISTORY_LEN  = 32;   // ticks retained (buy decisions — more data = lower noise)
const SELL_WINDOW  = 10;   // shorter window for sell decisions (catches flips faster)
const MIN_HISTORY  = 16;   // ticks required before we start trading without 4S

// ── Entry point ───────────────────────────────────────────────────────────────

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(720, 620);

    // Wait for TIX API access (purchased automatically by upgrade.js).
    // We don't exit so that this script is always running from init — the moment
    // upgrade.js buys TIX API we start trading without needing a restart.
    while (!ns.stock.hasTixApiAccess()) {
        ns.clearLog();
        ns.print("⏳ Waiting for TIX API access (upgrade.js will purchase it)...");
        await ns.sleep(10_000);
    }

    // symbol → price per tick, oldest first
    const priceHistory = new Map<string, number[]>();

    while (true) {
        ns.clearLog();

        const has4S   = ns.stock.has4SDataTixApi();
        const symbols = ns.stock.getSymbols();

        // ── Update history ─────────────────────────────────────────────────
        for (const sym of symbols) {
            const price = ns.stock.getAskPrice(sym);
            const h = priceHistory.get(sym) ?? [];
            h.push(price);
            if (h.length > HISTORY_LEN + 1) h.shift();
            priceHistory.set(sym, h);
        }

        const histLen   = priceHistory.get(symbols[0])?.length ?? 0;
        const histReady = has4S || histLen >= MIN_HISTORY;

        if (!histReady) {
            ns.print(`⏳ Building price history: ${histLen} / ${MIN_HISTORY} ticks — no trades yet`);
            await ns.stock.nextUpdate();
            continue;
        }

        // Short selling requires BN8 or SF-8 Level 2
        const { currentNode, ownedSF } = ns.getResetInfo();
        const shortsEnabled = currentNode === 8 || (ownedSF.get(8) ?? 0) >= 2;

        let stocks = symbols.map(s => readStock(ns, s, has4S, priceHistory));

        // ── 1. Sell positions whose sell-forecast has turned ───────────────
        // Sell window is shorter than buy window so forecast flips trigger
        // exits quickly, limiting losses when a trend reverses.
        for (const s of stocks) {
            if (s.longShares  > 0 && s.sellForecast < SELL_LONG_MAX)  ns.stock.sellStock(s.symbol, s.longShares);
            if (shortsEnabled && s.shortShares > 0 && s.sellForecast > SELL_SHORT_MIN) ns.stock.sellShort(s.symbol, s.shortShares);
        }

        // ── 2. Refresh after sells ─────────────────────────────────────────
        stocks = symbols.map(s => readStock(ns, s, has4S, priceHistory));

        // ── 3. Buy new positions ───────────────────────────────────────────
        const cash      = ns.getServerMoneyAvailable("home");
        const available = Math.max(0, cash - MONEY_RESERVE);

        const longOpps  = stocks.filter(s => s.buyForecast >= BUY_LONG_MIN  && s.longShares  === 0);
        const shortOpps = shortsEnabled
            ? stocks.filter(s => s.buyForecast <= BUY_SHORT_MAX && s.shortShares === 0)
            : [];
        const allOpps   = [...longOpps, ...shortOpps];

        if (allOpps.length > 0 && available >= MIN_TRADE_VALUE) {
            // Weight allocation by expected return = edge × volatility.
            // Without 4S volatility is unavailable so we weight by edge alone.
            const weights = allOpps.map(s => {
                const edge = Math.abs(s.buyForecast - 0.5);
                return has4S ? edge * (s.volatility || 0.01) : edge;
            });
            const totalWeight = weights.reduce((a, b) => a + b, 0);

            for (let i = 0; i < allOpps.length; i++) {
                const s      = allOpps[i];
                const isLong = s.buyForecast >= BUY_LONG_MIN;
                const alloc  = available * (weights[i] / totalWeight);
                const held   = isLong ? s.longShares : s.shortShares;
                const shares = Math.floor(Math.min(alloc / s.ask, s.maxShares - held));

                if (shares > 0 && shares * s.ask >= MIN_TRADE_VALUE) {
                    if (isLong) ns.stock.buyStock(s.symbol, shares);
                    else        ns.stock.buyShort(s.symbol, shares);
                }
            }
        }

        // ── 4. Display ─────────────────────────────────────────────────────
        stocks = symbols.map(s => readStock(ns, s, has4S, priceHistory));
        printStatus(ns, stocks, cash, has4S);

        await ns.stock.nextUpdate();
    }
}

// ── Data ──────────────────────────────────────────────────────────────────────

type StockData = {
    symbol:      string;
    ask:         number;
    bid:         number;
    /** Forecast used for buy decisions (full history window — lower noise). */
    buyForecast:  number;
    /** Forecast used for sell decisions (short history window — faster flip detection). */
    sellForecast: number;
    volatility:   number;   // 0 if no 4S data
    histLen:      number;   // ticks of history available
    longShares:   number;
    longPrice:    number;
    shortShares:  number;
    shortPrice:   number;
    maxShares:    number;
    longPnL:      number;
    shortPnL:     number;
};

/**
 * Estimate forecast from recent price movements.
 * In Bitburner each tick the price moves up or down with probability = forecast.
 * Counting observed up-moves gives a Maximum Likelihood Estimate of forecast.
 */
function estimateForecast(history: number[], window: number): number {
    const h = history.slice(-(window + 1));
    if (h.length < 2) return 0.5;
    let ups = 0;
    for (let i = 1; i < h.length; i++) {
        if (h[i] > h[i - 1]) ups++;
    }
    return ups / (h.length - 1);
}

function readStock(
    ns:           NS,
    symbol:       string,
    has4S:        boolean,
    priceHistory: Map<string, number[]>,
): StockData {
    const [longShares, longPrice, shortShares, shortPrice] = ns.stock.getPosition(symbol);
    const ask       = ns.stock.getAskPrice(symbol);
    const bid       = ns.stock.getBidPrice(symbol);
    const maxShares = ns.stock.getMaxShares(symbol);
    const history   = priceHistory.get(symbol) ?? [];

    let buyForecast: number;
    let sellForecast: number;
    let volatility: number;

    if (has4S) {
        buyForecast  = ns.stock.getForecast(symbol);
        sellForecast = buyForecast;
        volatility   = ns.stock.getVolatility(symbol);
    } else {
        buyForecast  = estimateForecast(history, HISTORY_LEN);
        sellForecast = estimateForecast(history, SELL_WINDOW);
        volatility   = 0;
    }

    const longPnL  = longShares  > 0 ? longShares  * (bid - longPrice)   - COMMISSION * 2 : 0;
    const shortPnL = shortShares > 0 ? shortShares * (shortPrice - ask)  - COMMISSION * 2 : 0;

    return {
        symbol, ask, bid, buyForecast, sellForecast, volatility,
        histLen: history.length,
        longShares, longPrice, shortShares, shortPrice, maxShares, longPnL, shortPnL,
    };
}

// ── Display ───────────────────────────────────────────────────────────────────

function printStatus(ns: NS, stocks: StockData[], cash: number, has4S: boolean): void {
    const held       = stocks.filter(s => s.longShares > 0 || s.shortShares > 0);
    const totalValue = held.reduce((sum, s) => sum + s.longShares * s.bid + s.shortShares * s.ask, 0);
    const totalPnL   = held.reduce((sum, s) => sum + s.longPnL + s.shortPnL, 0);

    ns.print(has4S ? "✅ 4S" : `📈 Pre-4S (${stocks[0]?.histLen ?? 0} ticks)`);
    ns.print(`Cash: ${ns.format.number(cash)}  Portfolio: ${ns.format.number(totalValue)}  P&L: ${ns.format.number(totalPnL)}`);
    ns.print("─".repeat(72));
    ns.print("Sym   BuyFcst SellFcst Volt  " + "Long".padEnd(20) + "Short".padEnd(14) + "P&L");
    ns.print("─".repeat(72));

    const sorted = [...stocks].sort((a, b) => {
        const aHeld = (a.longShares > 0 || a.shortShares > 0) ? 1 : 0;
        const bHeld = (b.longShares > 0 || b.shortShares > 0) ? 1 : 0;
        if (aHeld !== bHeld) return bHeld - aHeld;
        return Math.abs(b.buyForecast - 0.5) - Math.abs(a.buyForecast - 0.5);
    });

    for (const s of sorted) {
        const isHeld   = s.longShares > 0 || s.shortShares > 0;
        const nearFlat = Math.abs(s.buyForecast - 0.5) < 0.03;
        if (!isHeld && nearFlat) continue;

        const bFcst = `${(s.buyForecast  * 100).toFixed(1)}%`;
        const sFcst = `${(s.sellForecast * 100).toFixed(1)}%`;
        const volt  = s.volatility ? `${(s.volatility * 100).toFixed(2)}%` : "-    ";
        const lPos  = s.longShares  > 0
            ? `${ns.format.number(s.longShares,  0, 1000, true)}@${ns.format.number(s.longPrice)}`  : "-";
        const sPos  = s.shortShares > 0
            ? `${ns.format.number(s.shortShares, 0, 1000, true)}@${ns.format.number(s.shortPrice)}` : "-";
        const pnl     = s.longPnL + s.shortPnL;
        const pnlStr  = pnl !== 0 ? ns.format.number(pnl) : "";

        ns.print(`${s.symbol.padEnd(6)}${bFcst.padEnd(8)}${sFcst.padEnd(9)}${volt.padEnd(6)}${lPos.padEnd(20)}${sPos.padEnd(14)}${pnlStr}`);
    }

    ns.print("─".repeat(72));
}
