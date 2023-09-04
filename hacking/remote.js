import network from "./network/scan";
import sortBy from "./helpers/sortBy";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const servers = network(ns)
    .filter(server => server.hasAdminRights)
    .filter(server => server.maxRam != 0)
    .filter(server => server.moneyMax != 0)
    .filter(server => server.requiredHackingSkill <= ns.getHackingLevel())
    .filter(server => !server.hostname.startsWith("hacknet-"))
    .sort(sortBy("requiredHackingSkill"));

  for (const server of servers) {

    ns.scp(["grow.js","weaken.js","hack.js", "portReader.js"], server.hostname);

    ns.exec("portReader.js", server.hostname, 1, server.hostname);
  }
}