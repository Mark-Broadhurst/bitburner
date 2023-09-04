import network from "./network/scan";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const targetRam = ns.args[0];

  while (true) {
    const maxRam = targetRam ?? ns.getPurchasedServerMaxRam();
    const servers = ns.getPurchasedServers().map(server => {
      return {
        name: server,
        ram: () => ns.getServerMaxRam(server),
        upgrade: () => ns.getPurchasedServerUpgradeCost(server, ns.getServerMaxRam(server) * 2)
      };
    });
    if(!servers.length){
      return;
    }
    const server = servers.reduce((prev, current) => (prev.ram() < current.ram()) ? prev : current)
    const newRam = server.ram() * 2;
    if (maxRam < newRam) {
      break;
    }
    while (ns.getServerMoneyAvailable("home") < server.upgrade()) {
      await ns.sleep(1000);
    }
    ns.toast(`Upgrading server ${server.name} new ram : ${ns.formatRam(newRam)}`);
    ns.upgradePurchasedServer(server.name, newRam);
  }
}

