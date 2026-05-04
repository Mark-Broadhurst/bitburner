import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  const ram = 8;
  ns.print(`Max Servers: ${ns.cloud.getServerLimit()} at ${ns.format.number(ns.cloud.getServerCost(ram))}`);
  for (let i = ns.cloud.getServerNames().length; i < ns.cloud.getServerLimit(); i++) {
    while (ns.getServerMoneyAvailable("home") < ns.cloud.getServerCost(ram)) {
      await ns.sleep(1000);
    }
    ns.print(`Purchasing server ${i} : ${ns.format.number(ns.cloud.getServerCost(ram))}`);
    let hostname = ns.cloud.purchaseServer(`pserv-${String(i).padStart(2,'0')}`, ram);
    ns.scp(["grow.js", "weaken.js", "hack.js", "share.js", "charge.js"], hostname);
  }
}