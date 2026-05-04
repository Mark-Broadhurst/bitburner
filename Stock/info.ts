import { NS } from "@ns";

const fees = 100_000;

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  while (true) {
    ns.clearLog();
    buyStock(ns);
    sellStock(ns);
    await ns.sleep(1000);
  }
}

function buyStock(ns: NS): void {
  const stocks = ns.stock.getSymbols()
    .map((s) => new Stock(ns, s))
    .filter((s) => s.longShares === 0 && s.shortShares === 0)
    .filter((s) => s.forcast > 0.6);
  ns.print("Buy:");
  for (const stock of stocks) {
    ns.print(`buy ${stock.symbol} ${stock.maxShares}`);
    ns.stock.buyStock(stock.symbol, stock.maxShares);
  }
}

function sellStock(ns: NS): void {
  const stocks = ns.stock.getSymbols()
    .map((s) => new Stock(ns, s))
    .filter((s) => s.longShares > 0 || s.shortShares > 0)

  ns.print("Sell:");

  for (const stock of stocks) {
    ns.print(`${stock.symbol.padEnd(5)} ${ns.formatNumber(stock.longProfit).padEnd(8)} ${ns.formatPercent(stock.forcast)}`);
    if (stock.forcast <= 0.5 && stock.longProfit > 0) {
      const profit = ns.stock.sellStock(stock.symbol, stock.longShares);
      ns.print(`sell ${stock.symbol} ${ns.formatNumber(profit)}`);
    }
  }
}


type Position = "long" | "short"

class Stock {
  symbol: string;
  ask: number;
  bid: number;
  price: number;
  volt: number;
  forcast: number;
  longShares: number;
  longPrice: number;
  shortShares: number;
  shortPrice: number;
  maxShares: number;
  longProfit: number;
  shortProfit: number;
  constructor(ns: NS, symbol: string) {
    this.symbol = symbol;
    this.ask = ns.stock.getAskPrice(symbol);
    this.bid = ns.stock.getBidPrice(symbol);
    this.price = ns.stock.getPrice(symbol);
    this.volt = ns.stock.getVolatility(symbol);
    this.forcast = ns.stock.getForecast(symbol);
    [this.longShares, this.longPrice, this.shortShares, this.shortPrice] = ns.stock.getPosition(symbol);
    this.maxShares = ns.stock.getMaxShares(symbol);
    this.longProfit = this.longShares * (this.bid - this.longPrice) - fees;
    this.shortProfit = this.shortShares * (this.shortPrice - this.ask) - fees;
  }
  print(ns: NS): void {
    const arr = [
      this.symbol,
      ns.formatNumber(this.ask),
      ns.formatNumber(this.bid),
      ns.formatNumber(this.price),
      ns.formatPercent(this.volt),
      ns.formatPercent(this.forcast),
      this.longShares,
      ns.formatNumber(this.longPrice),
      this.shortShares,
      ns.formatNumber(this.shortPrice),
    ]
    ns.print(arr.join("\t"));
  }
}