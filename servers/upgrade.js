import network from "./network/scan";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const targetRam = ns.args[0];

  const player = ns.getPlayer();

  let targets = network(ns)
    .filter(server => server.hasAdminRights && server.moneyMax != 0 && server.requiredHackingSkill <= player.skills.hacking)

  while (true) {
    const maxRam = targetRam ?? ns.getPurchasedServerMaxRam();
    const servers = ns.getPurchasedServers().map(server => {
      return {
        name: server,
        ram: () => ns.getServerMaxRam(server),
        upgrade: () => ns.getPurchasedServerUpgradeCost(server, ns.getServerMaxRam(server) * 2)
      };
    });
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
    let threads = Math.floor(newRam / 3.5 / targets.length);
    while (threads == 0) {
      targets = targets.slice(0, -1);
      threads = Math.floor(newRam / 3.5 / targets.length);
    }
    ns.scriptKill("hacking/hack.js", server.name);
    ns.scriptKill("hacking/simple.js", server.name);
    ns.scriptKill("hacking/grow.js", server.name);
    ns.scriptKill("hacking/weaken.js", server.name);

    ns.rm("hacking/hack.js", server.name);
    ns.rm("hacking/simple.js", server.name);
    ns.rm("hacking/grow.js", server.name);
    ns.rm("hacking/weaken.js", server.name);

    ns.scp(["hacking/grow.js", "hacking/weaken.js"], server.name);

    targets.forEach(target => {
      ns.print(server.name + " " + threads + " " + target.hostname);
      ns.exec("hacking/grow.js", server.name, threads, target.hostname);
      ns.exec("hacking/weaken.js", server.name, threads, target.hostname);
    });

  }
}

