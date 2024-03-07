import { NS } from "@ns";


const fees = 100_000;
export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    let maxUps = 0;
    let maxDowns = 0;

    const stocks = ns.stock.getSymbols()
        .map((s) => new Stock(ns, s))

    while (true) {
        ns.clearLog();
        for (const stock of stocks) {
            stock.updatePrice(ns);
        }
        for (const stock of stocks.sort((a, b) => Math.abs(b.gains) - Math.abs(a.gains))) {
            const formatter = (x: number) => {
                if (x > 0) {
                    return `\u001b[32m${ns.formatNumber(x, 2)}\u001b[0m`.padEnd(16);
                } else if (x < 0) {
                    return `\u001b[31m${ns.formatNumber(x, 2)}\u001b[0m`.padEnd(16);
                }
                return x;
            };
            maxUps = Math.max(maxUps, stock.ups);
            maxDowns = Math.max(maxDowns, stock.downs);
            ns.print(`${stock.symbol.padEnd(5)} ${ns.formatNumber(stock.longShares, 0, 1000, true).padEnd(5)}${ns.formatNumber(stock.shortShares, 0, 1000, true).padEnd(5)}${stock.ups} ${stock.downs} ${ns.formatNumber(stock.gains)} ${stock.diffs.slice(-20).map(formatter).join(" ")}`);
        }
        ns.print(`Max ups: ${maxUps} Max downs: ${maxDowns}`);

        await ns.stock.nextUpdate();
    }
}

class Stock {
    symbol: string;
    ask: number;
    bid: number;
    price: number;
    history: number[] = [];
    diffs: number[] = [];

    longShares: number;
    longPrice: number;
    shortShares: number;
    shortPrice: number;
    maxShares: number;
    ups: number = 0;
    downs: number = 0;
    gains: number = 0;
    constructor(ns: NS, symbol: string) {
        this.symbol = symbol;
        this.ask = ns.stock.getAskPrice(symbol);
        this.bid = ns.stock.getBidPrice(symbol);
        this.price = ns.stock.getPrice(symbol);
        [this.longShares, this.longPrice, this.shortShares, this.shortPrice] = ns.stock.getPosition(symbol);
        this.maxShares = ns.stock.getMaxShares(symbol);
    }
    updatePrice(ns: NS): void {
        this.price = ns.stock.getPrice(this.symbol);
        this.ask = ns.stock.getAskPrice(this.symbol);
        this.bid = ns.stock.getBidPrice(this.symbol);
        this.maxShares = ns.stock.getMaxShares(this.symbol);
        [this.longShares, this.longPrice, this.shortShares, this.shortPrice] = ns.stock.getPosition(this.symbol);

        if (this.history.length > 1) {
            this.diffs.push(this.price - this.history[this.history.length - 1]);
            if (this.diffs.length > 50) {
                this.diffs.shift();
            }
        }

        if (this.diffs.length >= 10) {

            const spend = ns.getServerMoneyAvailable("home") / 10;

            if (this.diffs.slice(-20).filter((price) => price > 0).length >= 12 && this.gains > 1000) {
                const buyAmount = Math.min(spend / this.ask, this.maxShares - this.longShares);
                const value = ns.stock.buyStock(this.symbol, buyAmount);
                if (value !== 0) {
                    ns.tprint(`Buying long ${buyAmount} of ${this.symbol} at ${this.ask}`);
                }
            }

            if (this.diffs.slice(-20).filter((price) => price < 0).length >= 12 && this.gains < -1000) {
                const buyAmount = Math.min(spend / this.ask, this.maxShares - this.shortShares);
                const value = ns.stock.buyShort(this.symbol, buyAmount);
                if (value !== 0) {
                    ns.tprint(`Buying short ${buyAmount} of ${this.symbol} at ${this.ask}`);
                }
            }

            if (this.longShares != 0 && (this.diffs.slice(-5).filter((price) => price < 0).length >= 5 || this.gains < 100)) {
                const value = ns.stock.sellStock(this.symbol, this.longShares);
                if (value !== 0) {
                    ns.tprint(`Selling long ${this.longShares} of ${this.symbol} at ${this.bid}`);
                }
            }
            if (this.shortShares != 0 && (this.diffs.slice(-5).filter((price) => price > 0).length >= 5 || this.gains > -100)) {
                const value = ns.stock.sellShort(this.symbol, this.shortShares);
                if (value !== 0) {
                    ns.tprint(`Selling short ${this.shortShares} of ${this.symbol} at ${this.bid}`);
                }
            }
        }

        this.history.push(this.price);
        if (this.history.length > 20) {
            this.history.shift();
        }
        this.gains = this.diffs.slice(-20).reduce((a, b) => a + b, 0);
        this.ups = this.diffs.slice(-20).filter((price) => price > 0).length;
        this.downs = this.diffs.slice(-20).filter((price) => price < 0).length;
    }
    print(ns: NS): void {
        const arr = [
            this.symbol.padEnd(6),
            ns.formatNumber(this.ask).padEnd(8),
            ns.formatNumber(this.bid).padEnd(8),
            ns.formatNumber(this.price).padEnd(8),
            this.longShares,
            ns.formatNumber(this.longPrice).padEnd(8),
            this.shortShares,
            ns.formatNumber(this.shortPrice).padEnd(8),
        ]
        ns.print(arr.join("\t"));
    }
}