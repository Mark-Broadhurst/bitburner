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

  ns.print(`Server\t\t\tThreads`);
  for (const server of servers) {

    ns.scriptKill("hacking/grow.js", server.hostname);
    ns.scriptKill("hacking/weaken.js", server.hostname);

    ns.scp(["hacking/grow.js","hacking/weaken.js"], server.hostname);
    const threads = Math.floor(server.maxRam / 1.75 / 2);

    ns.print(`${server.hostname.padEnd(25)}\t${threads}`);

    if (threads > 0) {
      ns.exec("hacking/grow.js", server.hostname, threads, server.hostname);
      ns.exec("hacking/weaken.js", server.hostname, threads, server.hostname);
    }
  }
}