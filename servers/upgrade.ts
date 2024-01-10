import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL")
  ns.clearLog();

  const targetRam = ns.args[0] as number ?? ns.getPurchasedServerMaxRam();

  ns.print(`Upgrading servers to ${ns.formatRam(targetRam)}`);
  while (true) {
    const servers = ns.getPurchasedServers().map(x=>ns.getServer(x)); 
    printServerList(ns, servers);

    if (!servers.length) {
      return;
    }
    const server = servers.reduce((prev, current) => (prev.maxRam <= current.maxRam) ? prev : current)
    const newRam = server.maxRam * 2;
    if (targetRam < newRam) {
      break;
    }
    while (ns.getServerMoneyAvailable("home") < ns.getPurchasedServerUpgradeCost(server.hostname, server.maxRam * 2)) {
      await ns.sleep(1000);
    }
    ns.upgradePurchasedServer(server.hostname, newRam);
  }
}

function printServerList(ns: NS, servers: Server[]) {
  ns.clearLog();
  ns.print(`| Server   | RAM       | Cost    |`);
  ns.print(`|----------|-----------|---------|`);
  for (const server of servers) {
    const cost = ns.getPurchasedServerUpgradeCost(server.hostname, server.maxRam * 2);
    ns.print(`| ${server.hostname.padEnd(8)} | ${ns.formatRam(server.maxRam).padEnd(9)} | ${ns.formatNumber(cost, 2).padEnd(7)} |`);
  }
}