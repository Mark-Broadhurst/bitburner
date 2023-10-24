import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  const ram = 8;
  ns.print(`Max Servers: ${ns.getPurchasedServerLimit()} at ${ns.formatNumber(ns.getPurchasedServerCost(ram))}`);
  for (let i = ns.getPurchasedServers().length; i < ns.getPurchasedServerLimit(); i++) {
    while (ns.getServerMoneyAvailable("home") < ns.getPurchasedServerCost(ram)) {
      await ns.sleep(1000);
    }
    ns.print(`Purchasing server ${i} : ${ns.formatNumber(ns.getPurchasedServerCost(ram))}`);
    let hostname = ns.purchaseServer("pserv-" + i, ram);
    ns.scp(["grow.js", "weaken.js", "hack.js", "share.js"], hostname);
  }
}