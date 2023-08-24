import getHashLimit from "/hacknet/hashLimit.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    while(true){
      const hashLimit = getHashLimit(ns) - 40;
      const hashes = ns.hacknet.numHashes();
      if(hashes >= hashLimit){
        ns.hacknet.spendHashes("Sell for Money", "home");
      }
      await ns.sleep(100);
    }
}