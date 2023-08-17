/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  for (const host of ns.getPurchasedServers()) {
    const ser = ns.getServer(host);
    const cost = ns.getPurchasedServerUpgradeCost(ser.hostname, ser.maxRam * 2);
    ns.tail();
    ns.print("Server: " + ser.hostname + ", RAM: " + ns.formatRam(ser.maxRam) + " Upgrade Cost: " + ns.formatNumber(cost, 2));
  }
}