import { NS } from "@ns";

const COMMISSION      = 100_000;  // flat fee per trade
const BUY_LONG_MIN    = 0.55;     // forecast >= this  → buy long
const SELL_LONG_MAX   = 0.50;     // forecast <  this  → exit long
const BUY_SHORT_MAX   = 0.45;     // forecast <= this  → buy short
const SELL_SHORT_MIN  = 0.50;     // forecast >  this  → exit short
const MONEY_RESERVE   = 1e9;      // always keep $1b liquid
const MIN_TRADE_VALUE = COMMISSION * 4; // minimum spend per trade to beat fees

// ── Entry point ───────────────────────────────────────────────────────────────

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(720, 600);

    if (!ns.stock.hasTIXAPIAccess()) {
        ns.print("❌ No TIX API access — purchase WSE account first.");
        return;
    }

    if (!ns.stock.has4SDataTIXAPI()) {
        ns.print("⚠  No 4S TIX data — forecast signals unavailable.");
        ns.print("   Trading paused until 4S data is purchased.");
    }

    while (true) {
        ns.clearLog();

        const has4S   = ns.stock.has4SDataTIXAPI();
        const symbols = ns.stock.getSymbols();
        let   stocks  = symbols.map(s => readStock(ns, s, has4S));

        if (!has4S) {
            ns.print("⚠  Waiting for 4S Market Data TIX API...");
            await ns.stock.nextUpdate();
            continue;
        }

        // ── 1. Sell positions that have turned ─────────────────────────────

        for (const s of stocks) {
            if (s.longShares > 0 && s.forecast < SELL_LONG_MAX) {
                ns.stock.sellStock(s.symbol, s.longShares);
            }
            if (s.shortShares > 0 && s.forecast > SELL_SHORT_MIN) {
                ns.stock.sellShort(s.symbol, s.shortShares);
            }
        }

        // ── 2. Refresh data after sells ─────────────────────────────────────

        stocks = symbols.map(s => readStock(ns, s, has4S));

        // ── 3. Buy new positions ────────────────────────────────────────────

        const cash      = ns.getServerMoneyAvailable("home");
        const available = Math.max(0, cash - MONEY_RESERVE);

        const longOpps  = stocks.filter(s => s.forecast >= BUY_LONG_MIN  && s.longShares  === 0)
                                .sort((a, b) => b.forecast - a.forecast);
        const shortOpps = stocks.filter(s => s.forecast <= BUY_SHORT_MAX && s.shortShares === 0)
                                .sort((a, b) => a.forecast - b.forecast);

        const numOpps = longOpps.length + shortOpps.length;

        if (numOpps > 0 && available >= MIN_TRADE_VALUE) {
            const perStock = available / numOpps;

            for (const s of longOpps) {
                const shares = Math.floor(Math.min(perStock / s.ask, s.maxShares - s.longShares));
                if (shares > 0 && shares * s.ask >= MIN_TRADE_VALUE) {
                    ns.stock.buyStock(s.symbol, shares);
                }
            }

            for (const s of shortOpps) {
                const shares = Math.floor(Math.min(perStock / s.ask, s.maxShares - s.shortShares));
                if (shares > 0 && shares * s.ask >= MIN_TRADE_VALUE) {
                    ns.stock.buyShort(s.symbol, shares);
                }
            }
        }

        // ── 4. Display ──────────────────────────────────────────────────────

        stocks = symbols.map(s => readStock(ns, s, has4S));
        printStatus(ns, stocks, cash);

        await ns.stock.nextUpdate();
    }
}

// ── Data ──────────────────────────────────────────────────────────────────────

type StockData = {
    symbol:      string;
    ask:         number;
    bid:         number;
    forecast:    number;
    volatility:  number;
    longShares:  number;
    longPrice:   number;
    shortShares: number;
    shortPrice:  number;
    maxShares:   number;
    longPnL:     number;
    shortPnL:    number;
};

function readStock(ns: NS, symbol: string, has4S: boolean): StockData {
    const [longShares, longPrice, shortShares, shortPrice] = ns.stock.getPosition(symbol);
    const ask        = ns.stock.getAskPrice(symbol);
    const bid        = ns.stock.getBidPrice(symbol);
    const forecast   = has4S ? ns.stock.getForecast(symbol)   : 0.5;
    const volatility = has4S ? ns.stock.getVolatility(symbol) : 0;
    const maxShares  = ns.stock.getMaxShares(symbol);

    // Unrealised P&L, subtracting both entry and exit commission
    const longPnL  = longShares  > 0 ? longShares  * (bid - longPrice)   - COMMISSION * 2 : 0;
    const shortPnL = shortShares > 0 ? shortShares * (shortPrice - ask)  - COMMISSION * 2 : 0;

    return { symbol, ask, bid, forecast, volatility, longShares, longPrice,
             shortShares, shortPrice, maxShares, longPnL, shortPnL };
}

// ── Display ───────────────────────────────────────────────────────────────────

function printStatus(ns: NS, stocks: StockData[], cash: number): void {
    const held         = stocks.filter(s => s.longShares > 0 || s.shortShares > 0);
    const totalValue   = held.reduce((sum, s) => sum + s.longShares * s.bid + s.shortShares * s.ask, 0);
    const totalPnL     = held.reduce((sum, s) => sum + s.longPnL + s.shortPnL, 0);

    ns.print(`Cash: ${ns.format.number(cash)}  Portfolio: ${ns.format.number(totalValue)}  P&L: ${ns.format.number(totalPnL)}`);
    ns.print("─".repeat(72));
    ns.print("Sym   Fcst   Volt  " + "Long".padEnd(20) + "Short".padEnd(20) + "P&L");
    ns.print("─".repeat(72));

    const sorted = [...stocks].sort((a, b) => {
        // Held first, then sorted by forecast extremity
        const aHeld = (a.longShares > 0 || a.shortShares > 0) ? 1 : 0;
        const bHeld = (b.longShares > 0 || b.shortShares > 0) ? 1 : 0;
        if (aHeld !== bHeld) return bHeld - aHeld;
        return Math.abs(b.forecast - 0.5) - Math.abs(a.forecast - 0.5);
    });

    for (const s of sorted) {
        const isHeld   = s.longShares > 0 || s.shortShares > 0;
        const nearFlat = Math.abs(s.forecast - 0.5) < 0.03;
        if (!isHeld && nearFlat) continue; // skip boring mid-range unheld stocks

        const fcst  = `${(s.forecast   * 100).toFixed(1)}%`;
        const volt  = `${(s.volatility * 100).toFixed(2)}%`;
        const lPos  = s.longShares  > 0
            ? `${ns.format.number(s.longShares,  0, 1000, true)}@${ns.format.number(s.longPrice)}`  : "-";
        const sPos  = s.shortShares > 0
            ? `${ns.format.number(s.shortShares, 0, 1000, true)}@${ns.format.number(s.shortPrice)}` : "-";
        const pnl   = s.longPnL + s.shortPnL;
        const pnlStr = pnl !== 0 ? ns.format.number(pnl) : "";

        ns.print(`${s.symbol.padEnd(6)}${fcst.padEnd(7)}${volt.padEnd(6)}${lPos.padEnd(20)}${sPos.padEnd(20)}${pnlStr}`);
    }

    ns.print("─".repeat(72));
}
