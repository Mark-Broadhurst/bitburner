import { NS } from "@ns";

const COMMISSION          = 100_000;
const BUY_LONG_MIN        = 0.60;
const BUY_LONG_MIN_PRE4S  = 0.60;
const SELL_LONG_MAX       = 0.50;
const BUY_SHORT_MAX       = 0.40;
const SELL_SHORT_MIN      = 0.50;
const MONEY_RESERVE       = 1e7;
const MIN_TRADE_VALUE     = 2_000_000;
const STOP_LOSS_PCT       = 0.15;
const MAX_POSITION_PCT    = 0.30;

const HISTORY_LEN  = 32;
const SELL_WINDOW  = 10;
const MIN_HISTORY  = 32;

const LOG_FILE       = "Stock/trade.txt";
const LOG_SNAP_TICKS = 10;

let tick       = 0;
let realizedPnL = 0;

function logLine(ns: NS, line: string): void {
    const t = new Date().toLocaleTimeString("en-GB", { hour12: false });
    ns.write(LOG_FILE, `[${t}] T${String(tick).padStart(4, "0")} ${line}\n`, "a");
}

function logBuy(ns: NS, sym: string, isLong: boolean, shares: number, price: number, fcst: number, topUp = false): void {
    const dir  = isLong ? "LONG " : "SHORT";
    const note = topUp ? " ↑top-up" : "";
    logLine(ns, `BUY  ${sym.padEnd(6)} ${dir}  +${ns.format.number(shares, 0, 1000, true).padStart(6)}sh  @ ${ns.format.number(price).padStart(9)}  fcst=${(fcst * 100).toFixed(1)}%${note}`);
}

function logSell(ns: NS, sym: string, isLong: boolean, shares: number, price: number, reason: string, pnl: number): void {
    realizedPnL += pnl;
    const dir       = isLong ? "LONG " : "SHORT";
    const pnlStr    = (pnl         >= 0 ? "+" : "") + ns.format.number(pnl);
    const totalStr  = (realizedPnL >= 0 ? "+" : "") + ns.format.number(realizedPnL);
    logLine(ns, `SELL ${sym.padEnd(6)} ${dir}  -${ns.format.number(shares, 0, 1000, true).padStart(6)}sh  @ ${ns.format.number(price).padStart(9)}  ${reason.padEnd(24)} pnl=${pnlStr.padStart(10)}  total=${totalStr}`);
}

function logSnap(ns: NS, stocks: StockData[], cash: number): void {
    const held       = stocks.filter(s => s.longShares > 0 || s.shortShares > 0);
    const portValue  = held.reduce((sum, s) => sum + s.longShares * s.bid + s.shortShares * s.ask, 0);
    const unrealized = held.reduce((sum, s) => sum + s.longPnL + s.shortPnL, 0);
    const totalStr   = (realizedPnL >= 0 ? "+" : "") + ns.format.number(realizedPnL);
    logLine(ns, `SNAP  cash=${ns.format.number(cash).padStart(9)}  port=${ns.format.number(portValue).padStart(9)}  unreal=${ns.format.number(unrealized).padStart(9)}  realized=${totalStr.padStart(10)}  [${held.length} pos]`);
}

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(720, 620);

    while (!ns.stock.hasTixApiAccess()) {
        ns.clearLog();
        ns.print("⏳ Waiting for TIX API access...");
        await ns.sleep(10_000);
    }

    const { currentNode } = ns.getResetInfo();
    logLine(ns, `=== trade.js START  BN${currentNode}  cash=${ns.format.number(ns.getServerMoneyAvailable("home"))}  4S=${ns.stock.has4SDataTixApi()} ===`);

    const priceHistory = new Map<string, number[]>();

    while (true) {
        tick++;
        ns.clearLog();

        purchaseUpgrades(ns);

        const has4S   = ns.stock.has4SDataTixApi();
        const symbols = ns.stock.getSymbols();

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

        const { currentNode, ownedSF } = ns.getResetInfo();
        const shortsEnabled = currentNode === 8 || (ownedSF.get(8) ?? 0) >= 2;

        let stocks = symbols.map(s => readStock(ns, s, has4S, priceHistory));

        for (const s of stocks) {
            const exitForecast  = has4S ? s.sellForecast : s.buyForecast;
            const longStopLoss  = s.longShares  > 0 && s.longPnL  < -(s.longShares  * s.longPrice  * STOP_LOSS_PCT);
            const shortStopLoss = s.shortShares > 0 && s.shortPnL < -(s.shortShares * s.shortPrice * STOP_LOSS_PCT);

            if (s.longShares > 0 && (exitForecast <= SELL_LONG_MAX || longStopLoss)) {
                ns.stock.sellStock(s.symbol, s.longShares);
                const reason = longStopLoss
                    ? `SL(${((s.longPnL / (s.longShares * s.longPrice)) * 100).toFixed(1)}%)`
                    : `signal(${(exitForecast * 100).toFixed(1)}%≤${(SELL_LONG_MAX * 100).toFixed(0)}%)`;
                logSell(ns, s.symbol, true, s.longShares, s.bid, reason, s.longPnL);
            }
            if (shortsEnabled && s.shortShares > 0 && (exitForecast >= SELL_SHORT_MIN || shortStopLoss)) {
                ns.stock.sellShort(s.symbol, s.shortShares);
                const reason = shortStopLoss
                    ? `SL(${((s.shortPnL / (s.shortShares * s.shortPrice)) * 100).toFixed(1)}%)`
                    : `signal(${(exitForecast * 100).toFixed(1)}%≥${(SELL_SHORT_MIN * 100).toFixed(0)}%)`;
                logSell(ns, s.symbol, false, s.shortShares, s.ask, reason, s.shortPnL);
            }
        }

        stocks = symbols.map(s => readStock(ns, s, has4S, priceHistory));

        const cash      = ns.getServerMoneyAvailable("home");
        const available = Math.max(0, cash - MONEY_RESERVE);

        const longThreshold = has4S ? BUY_LONG_MIN : BUY_LONG_MIN_PRE4S;
        const longOpps  = stocks.filter(s => s.buyForecast >= longThreshold && s.shortShares === 0);
        const shortOpps = (shortsEnabled && has4S)
            ? stocks.filter(s => s.buyForecast <= BUY_SHORT_MAX && s.longShares === 0)
            : [];
        const allOpps   = [...longOpps, ...shortOpps];

        if (allOpps.length > 0 && available >= MIN_TRADE_VALUE) {
            const weights = allOpps.map(s => {
                const edge = Math.abs(s.buyForecast - 0.5);
                return has4S ? edge * (s.volatility || 0.01) : edge;
            });
            const totalWeight = weights.reduce((a, b) => a + b, 0);

            for (let i = 0; i < allOpps.length; i++) {
                const s      = allOpps[i];
                const isLong = s.buyForecast >= longThreshold;
                const held   = isLong ? s.longShares : s.shortShares;

                const propAlloc   = available * (weights[i] / totalWeight);
                const targetAlloc = Math.min(propAlloc, available * MAX_POSITION_PCT);

                const currentValue    = held * s.ask;
                const additionalAlloc = Math.max(0, targetAlloc - currentValue);
                const shares = Math.floor(Math.min(additionalAlloc / s.ask, s.maxShares - held));

                if (shares > 0 && shares * s.ask >= MIN_TRADE_VALUE) {
                    const topUp = held > 0;
                    if (isLong) { ns.stock.buyStock(s.symbol, shares);  logBuy(ns, s.symbol, true,  shares, s.ask, s.buyForecast, topUp); }
                    else        { ns.stock.buyShort(s.symbol, shares); logBuy(ns, s.symbol, false, shares, s.ask, s.buyForecast, topUp); }
                }
            }
        }

        stocks = symbols.map(s => readStock(ns, s, has4S, priceHistory));
        printStatus(ns, stocks, cash, has4S);
        if (tick % LOG_SNAP_TICKS === 0) logSnap(ns, stocks, ns.getServerMoneyAvailable("home"));

        await ns.stock.nextUpdate();
    }
}

type StockData = {
    symbol:      string;
    ask:         number;
    bid:         number;
    buyForecast:  number;
    sellForecast: number;
    volatility:   number;
    histLen:      number;
    longShares:   number;
    longPrice:    number;
    shortShares:  number;
    shortPrice:   number;
    maxShares:    number;
    longPnL:      number;
    shortPnL:     number;
};

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

const UPGRADE_BUFFER = 250_000_000;

function purchaseUpgrades(ns: NS): void {
    const cash = ns.getServerMoneyAvailable("home");

    if (!ns.stock.has4SData()) {
        const cost = 1_000_000_000;
        if (cash - cost >= UPGRADE_BUFFER) {
            ns.stock.purchase4SMarketData();
            ns.tprint("✅ Purchased 4S Market Data");
        }
        return;
    }

    if (!ns.stock.has4SDataTixApi()) {
        const cost = 25_000_000_000;
        if (cash - cost >= UPGRADE_BUFFER) {
            ns.stock.purchase4SMarketDataTixApi();
            ns.tprint("✅ Purchased 4S TIX API");
        }
    }
}

function printStatus(ns: NS, stocks: StockData[], cash: number, has4S: boolean): void {
    const held       = stocks.filter(s => s.longShares > 0 || s.shortShares > 0);
    const totalValue = held.reduce((sum, s) => sum + s.longShares * s.bid + s.shortShares * s.ask, 0);
    const totalPnL   = held.reduce((sum, s) => sum + s.longPnL + s.shortPnL, 0);

    ns.print(has4S ? "✅ 4S" : `📈 Pre-4S (${stocks[0]?.histLen ?? 0} ticks) — longs only, exits on 32-tick forecast`);
    ns.print(`Cash: ${ns.format.number(cash)}  Portfolio: ${ns.format.number(totalValue)}  P&L: ${ns.format.number(totalPnL)}`);
    ns.print("─".repeat(72));
    ns.print("Sym   BuyFcst ExitFcst Volt  " + "Long".padEnd(20) + "Short".padEnd(14) + "P&L");
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

        const exitFcst = has4S ? s.sellForecast : s.buyForecast;
        const bFcst = `${(s.buyForecast * 100).toFixed(1)}%`;
        const sFcst = `${(exitFcst      * 100).toFixed(1)}%`;
        const volt  = s.volatility ? `${(s.volatility * 100).toFixed(2)}%` : "-    ";
        const lPos  = s.longShares  > 0
            ? `${ns.format.number(s.longShares,  0, 1000, true)}@${ns.format.number(s.longPrice)}`  : "-";
        const sPos  = s.shortShares > 0
            ? `${ns.format.number(s.shortShares, 0, 1000, true)}@${ns.format.number(s.shortPrice)}` : "-";
        const pnl          = s.longPnL + s.shortPnL;
        const longSL       = s.longShares  > 0 && s.longPnL  < -(s.longShares  * s.longPrice  * STOP_LOSS_PCT);
        const shortSL      = s.shortShares > 0 && s.shortPnL < -(s.shortShares * s.shortPrice * STOP_LOSS_PCT);
        const stopLossFlag = longSL || shortSL ? " ⚠SL" : "";
        const pnlStr       = pnl !== 0 ? ns.format.number(pnl) + stopLossFlag : "";

        ns.print(`${s.symbol.padEnd(6)}${bFcst.padEnd(8)}${sFcst.padEnd(9)}${volt.padEnd(6)}${lPos.padEnd(20)}${sPos.padEnd(14)}${pnlStr}`);
    }

    ns.print("─".repeat(72));
}
