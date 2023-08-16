/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.getPurchasedServers().forEach(host => {
    const ser = ns.getServer(host);
    var cost = ns.getPurchasedServerUpgradeCost(ser.hostname, ser.maxRam * 2);
    ns.tail();
    ns.print("Server: " + ser.hostname + ", RAM: " + ns.formatRam(ser.maxRam) + " Upgrade Cost: " + ns.formatNumber(cost, 2));
  });
}