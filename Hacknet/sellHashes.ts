import { NS } from "@ns";
import { getHashLimit, getHashProduction } from "/hacknet/hashLimit";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  while (true) {
    ns.clearLog();
    const hashCount = Math.floor(getHashProduction(ns) / 4);
    const hashLimit = getHashLimit(ns);
    const hashes = ns.hacknet.numHashes();
    ns.print(`Hashes: ${hashes} / ${hashLimit}`);

    if (hashes >= (hashLimit - 40)) {
      ns.hacknet.spendHashes("Sell for Money", "home", hashCount + 1);
      ns.print(`Sold ${(hashCount + 1) * 4} hashes`);
    }
    await ns.sleep(1000);
  }
}