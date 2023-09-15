import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL")
    ns.clearLog();
    const ram = 8;
    ns.print(`Max Servers: ${ns.getPurchasedServerLimit()}`);
    let i = ns.getPurchasedServers().length;
    while (i < ns.getPurchasedServerLimit()) {
      if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
        ns.print(`Purchasing server ${i} : ${ns.formatNumber(ns.getPurchasedServerCost(ram))}`);
        let hostname = ns.purchaseServer("pserv-" + i, ram);
        ns.scp(["grow.js","weaken.js", "hack.js"], hostname);
        ++i;
      }
      await ns.sleep(1000);
    }

}
