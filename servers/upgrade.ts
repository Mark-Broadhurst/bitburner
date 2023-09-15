import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL")
    ns.clearLog();

    const targetRam = ns.args[0] as number ?? ns.getPurchasedServerMaxRam();

    const ram = 8;
    ns.print(`Max Servers: ${ns.getPurchasedServerLimit()}`);
    let i = ns.getPurchasedServers().length;
    while (i < ns.getPurchasedServerLimit()) {
      ns.print(`Purchasing server ${i} : ${ns.getPurchasedServerCost(ram)}`);
      if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
        let hostname = ns.purchaseServer("pserv-" + i, ram);
        ns.scp(["grow.js","weaken.js", "hack.js"], hostname);
        ++i;
      }
      await ns.sleep(1000);
    }

    while (true) {
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
        const server = servers.reduce((prev, current) => (prev.ram() <= current.ram()) ? prev : current)
        const newRam = server.ram() * 2;
        if (targetRam < newRam) {
          break;
        }
        while (ns.getServerMoneyAvailable("home") < server.upgrade()) {
          await ns.sleep(1000);
        }
        ns.toast(`Upgrading server ${server.name} new ram : ${ns.formatRam(newRam)}`);
        ns.upgradePurchasedServer(server.name, newRam);
      }
    
}
