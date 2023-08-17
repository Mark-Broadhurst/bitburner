import network from "./network/scan";
import sortBy from "./helpers/sortBy";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const hackingLevel = ns.getHackingLevel();
  const scriptRam = ns.getScriptRam("hacking/simple.js");
  const serverRam = ns.getServerMaxRam("home");

  const servers = network(ns)
    .filter(server => server.moneyMax != 0)
    .filter(server => server.hasAdminRights)
    .filter(server => hackingLevel >= server.requiredHackingSkill)
    .sort(sortBy("moneyMax"));

  const threads = Math.floor(serverRam / scriptRam / servers.length);
  servers.forEach(server => {
    ns.print(`Name: ${server.hostname} ${server.moneyAvailable} thread:${threads}`);
    ns.exec("hacking/simple.js", "home", threads, server.hostname);
  });
}