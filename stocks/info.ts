import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  const stocks = ns.stock.getSymbols()
    .map((s) => new Stock(ns, s))
    .filter((s) => s.forcast > 0.6)
    .filter((s) => s.volt < 0.01)
    .sort((a, b) => b.forcast - a.forcast);
  for (const stock of stocks) {
    stock.print(ns);
  }

  const [longShares, longPrice, shortShares, shortPrice] = ns.stock.getPosition());
}

class Stock {
  symbol: string;
  ask: number;
  bid: number;
  price: number;
  volt: number;
  forcast: number;
  constructor(ns: NS, symbol: string) {
    this.symbol = symbol;
    this.ask = ns.stock.getAskPrice(symbol);
    this.bid = ns.stock.getBidPrice(symbol);
    this.price = ns.stock.getPrice(symbol);
    this.volt = ns.stock.getVolatility(symbol);
    this.forcast = ns.stock.getForecast(symbol);
  }
  print(ns: NS): void {
    const arr = [
      this.symbol,
      ns.formatNumber(this.ask),
      ns.formatNumber(this.bid),
      ns.formatNumber(this.price),
      ns.formatPercent(this.volt),
      ns.formatPercent(this.forcast)
    ]
    ns.print(arr.join("\t"));
  }
}