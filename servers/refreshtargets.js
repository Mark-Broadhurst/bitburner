import network from "./network/scan";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();

  for (const server of ns.getPurchasedServers()) {
    ns.scp(["grow.js", "weaken.js", "hack.js", "portReader.js"], server);
    ns.kill("portReader.js", server, server);
    ns.exec("portReader.js", server, 1, server);
  }
}

