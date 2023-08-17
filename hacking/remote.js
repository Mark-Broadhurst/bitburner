import network from "./network/scan";
import sortBy from "./helpers/sortBy";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("scan");
  ns.clearLog();
  const servers = network(ns)
    .filter(server => server.hasAdminRights && server.maxRam != 0 && server.moneyMax != 0)
    .sort(sortBy("requiredHackingSkill"));

  for (const server of servers) {
      ns.print(server.hostname);
      ns.scp("hacking/grow.js", server.hostname);
      ns.scp("hacking/weaken.js", server.hostname);
      const threads = Math.floor(server.maxRam / 1.75 / 2);
      if (threads > 0) {
        ns.exec("hacking/grow.js", server.hostname, threads, server.hostname);
        ns.exec("hacking/weaken.js", server.hostname, threads, server.hostname);
      }
    }
}