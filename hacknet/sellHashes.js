import { getHashLimit, getHashProduction } from "/hacknet/hashLimit.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    while(true){
      ns.clearLog();
      const hashCount = Math.round(getHashProduction(ns) / 4);
      const hashLimit = getHashLimit(ns) - 40;
      const hashes = ns.hacknet.numHashes();
      ns.print(`Hashes: ${hashes} / ${hashLimit}`);
      if(hashes >= hashLimit){
        ns.hacknet.spendHashes("Sell for Money", "home", hashCount);
      }
      await ns.sleep(100);
    }
}