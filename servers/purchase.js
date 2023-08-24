/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const ram = 8;
  ns.print(`Max Servers: ${ns.getPurchasedServerLimit()}`);
  let i = ns.getPurchasedServers().length;
  while (i < ns.getPurchasedServerLimit()) {
    ns.print(`Purchasing server ${i} : ${ns.getPurchasedServerCost(ram)}`);
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
      let hostname = ns.purchaseServer("pserv-" + i, ram);
      ns.scp(["hacking/grow.js","hacking/weaken.js"], hostname);
      ns.exec("hacking/grow.js", hostname, 4, "n00dles");
      ns.exec("hacking/weaken.js", hostname, 4, "n00dles");
      ++i;
    }
    await ns.sleep(1000);
  }
}