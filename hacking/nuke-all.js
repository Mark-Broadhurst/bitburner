import openPorts from "./hacking/nuke";
import network from "./network/scan";
import sortBy from "./helpers/sortBy";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const servers = network(ns)
    .filter(server => !server.hasAdminRights)
    .sort(sortBy("requiredHackingSkill"))
    .sort(sortBy("numOpenPortsRequired"));
  for (const server of servers) {
    await openPorts(ns, server);
    ns.toast(`Admin access gained for ${server.hostname}`)
  }
}