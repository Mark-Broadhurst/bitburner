/** @param {NS} ns */
export async function main(ns) {
  const ram = 8;
  const scriptCost = 1.75;
  let i = ns.getPurchasedServers().length;
  while (i < ns.getPurchasedServerLimit()) {
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
      let hostname = ns.purchaseServer("pserv-" + i, ram);
      ns.scp("hacking/grow.js", hostname);
      ns.scp("hacking/weaken.js", hostname);
      ns.exec("hacking/grow.js", hostname, 4, "n00dles");
      ns.exec("hacking/weaken.js", hostname, 4, "n00dles");
      ++i;
    }
    await ns.sleep(1000);
  }
}