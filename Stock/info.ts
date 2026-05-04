import { NS } from "@ns";

const COMMISSION = 100_000;

/**
 * Read-only stock market display.
 * Shows all symbols sorted by forecast extremity so the best
 * long/short opportunities are always at the top.
 */
export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(720, 700);

    while (true) {
        ns.clearLog();

        const has4S   = ns.stock.has4SDataTIXAPI();
        const symbols = ns.stock.getSymbols();

        const stocks = symbols.map(sym => {
            const [longShares, longPrice, shortShares, shortPrice] = ns.stock.getPosition(sym);
            const ask        = ns.stock.getAskPrice(sym);
            const bid        = ns.stock.getBidPrice(sym);
            const spread     = ask - bid;
            const forecast   = has4S ? ns.stock.getForecast(sym)   : NaN;
            const volatility = has4S ? ns.stock.getVolatility(sym) : NaN;
            const maxShares  = ns.stock.getMaxShares(sym);

            const longPnL  = longShares  > 0 ? longShares  * (bid - longPrice)   - COMMISSION * 2 : 0;
            const shortPnL = shortShares > 0 ? shortShares * (shortPrice - ask)  - COMMISSION * 2 : 0;

            return { sym, ask, bid, spread, forecast, volatility, maxShares,
                     longShares, longPrice, shortShares, shortPrice, longPnL, shortPnL };
        }).sort((a, b) => {
            // Held positions first, then by forecast extremity
            const aHeld = (a.longShares > 0 || a.shortShares > 0) ? 1 : 0;
            const bHeld = (b.longShares > 0 || b.shortShares > 0) ? 1 : 0;
            if (aHeld !== bHeld) return bHeld - aHeld;
            const aExt = isNaN(a.forecast) ? 0 : Math.abs(a.forecast - 0.5);
            const bExt = isNaN(b.forecast) ? 0 : Math.abs(b.forecast - 0.5);
            return bExt - aExt;
        });

        // ── Header ─────────────────────────────────────────────────────────

        const held       = stocks.filter(s => s.longShares > 0 || s.shortShares > 0);
        const totalValue = held.reduce((sum, s) => sum + s.longShares * s.bid + s.shortShares * s.ask, 0);
        const totalPnL   = held.reduce((sum, s) => sum + s.longPnL + s.shortPnL, 0);

        ns.print(has4S ? "✅ 4S Market Data TIX API active" : "⚠  No 4S data — forecast unavailable");
        ns.print(`Positions: ${held.length}  Value: ${ns.format.number(totalValue)}  P&L: ${ns.format.number(totalPnL)}`);
        ns.print("─".repeat(74));
        ns.print("Sym   " + "Bid".padEnd(10) + "Fcst".padEnd(8) + "Volt".padEnd(8) + "Long".padEnd(14) + "Short".padEnd(14) + "P&L");
        ns.print("─".repeat(74));

        // ── Rows ────────────────────────────────────────────────────────────

        for (const s of stocks) {
            const fcst  = isNaN(s.forecast)   ? "N/A   " : `${(s.forecast   * 100).toFixed(1)}%`;
            const volt  = isNaN(s.volatility) ? ""       : `${(s.volatility * 100).toFixed(2)}%`;
            const lPos  = s.longShares  > 0 ? ns.format.number(s.longShares,  0, 1000, true) : "";
            const sPos  = s.shortShares > 0 ? ns.format.number(s.shortShares, 0, 1000, true) : "";
            const pnl   = s.longPnL + s.shortPnL;
            const pnlStr = pnl !== 0 ? ns.format.number(pnl) : "";

            ns.print(
                `${s.sym.padEnd(6)}` +
                `${ns.format.number(s.bid).padEnd(10)}` +
                `${fcst.padEnd(8)}` +
                `${volt.padEnd(8)}` +
                `${lPos.padEnd(14)}` +
                `${sPos.padEnd(14)}` +
                pnlStr
            );
        }

        ns.print("─".repeat(74));
        await ns.stock.nextUpdate();
    }
}
