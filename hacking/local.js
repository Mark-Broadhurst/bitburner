import network from "./network/scan";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const scriptName = "hacking/simple.js";
  const host = "home";
  const hackingLevel = ns.getHackingLevel();
  const scriptRam = ns.getScriptRam(scriptName);
  const serverRam = ns.getServerMaxRam(host);

  const servers = network(ns)
    .filter(server => server.moneyMax != 0)
    .filter(server => server.hasAdminRights)
    .filter(server => hackingLevel >= server.requiredHackingSkill)
    .sort((a, b) => {
      if (a.moneyMax < b.moneyMax) {
        return 1;
      }
      if (a.moneyMax > b.moneyMax) {
        return -1;
      }
      return 0;
    });

  const threads = Math.floor(serverRam / scriptRam / servers.length);
  ns.print("Hostname\t\t\tMoney\t\tThreads");
  for (const server of servers) {
    ns.print(`${server.hostname.padEnd(25)}\t${ns.formatNumber(server.moneyAvailable).padEnd(8)}\t${threads}`);
    ns.exec(scriptName, host, threads, server.hostname);
  }
}