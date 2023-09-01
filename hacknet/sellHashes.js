import { getHashLimit, getHashProduction } from "/hacknet/hashLimit.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    let toggle = true;
    while(true){
      ns.clearLog();
      const hashCount = Math.floor(getHashProduction(ns) / 4);
      const hashLimit = getHashLimit(ns);
      const hashes = ns.hacknet.numHashes();
      ns.print(`Hashes: ${hashes} / ${hashLimit}`);
      
      if(hashes >= (hashLimit - 40)){
        if(ns.getServerMoneyAvailable("home") > 2e9 && !ns.isRunning("hacknet/upgrade.js") && !ns.isRunning("hacknet/levelUp.js"))
        {
          if(toggle){
            ns.hacknet.spendHashes("Improve Studying", "home", 1);
            ns.print("Improve Studying");
          } else {
            ns.hacknet.spendHashes("Improve Gym Training", "home", 1);
            ns.print("Improve Gym Training");
          }
          toggle = !toggle;

        } else {
          ns.hacknet.spendHashes("Sell for Money", "home", hashCount + 1);
          ns.print(`Sold ${(hashCount + 1) * 4} hashes`);
        }
      }
      await ns.sleep(1000);
    }
}