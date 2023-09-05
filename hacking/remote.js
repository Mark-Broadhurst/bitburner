import network from "./network/scan";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const servers = network(ns)
    .filter(server => server.hasAdminRights)
    .filter(server => server.maxRam != 0);

  for (const server of servers) {

    ns.scp(["grow.js","weaken.js","hack.js", "portReader.js"], server.hostname);
    ns.killall(server.hostname);

    ns.exec("portReader.js", server.hostname, 1, server.hostname);
  }
}