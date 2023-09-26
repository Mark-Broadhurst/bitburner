import { NS, Server } from "@ns";

export function getServerNames(ns: NS) : string[] {
    let hosts = ["home"];

    function add(item: string) {
        if (!hosts.includes(item) && !item.startsWith("pserv-") && !item.startsWith("hacknet-server-")) {
            hosts.push(item);
        }
    }

    for (const host of hosts) {
        ns.scan(host).forEach(add);
    }
    return hosts.slice(1);
}

export function getServers(ns: NS) : Server[] {
    return getServerNames(ns)
      .map(hostname => ns.getServer(hostname));
}

export function getWorkerServers(ns: NS) : Server[] {
    return getServers(ns)
      .filter(server => server.hasAdminRights)
      .filter(server => server.maxRam > 0);
}

export function getTargetServers(ns: NS) : Server[] {
    return getServers(ns)
      .filter(server => server.hostname != "fulcrumassets")
      .filter(server => server.moneyMax! > 0)
      .filter(server => server.hasAdminRights)
      .filter(server => server.requiredHackingSkill! <= ns.getHackingLevel());
}

export function getTargetServer(ns: NS) : Server {
    return getServers(ns)
      .filter(server => server.moneyMax! > 0)
      .filter(server => server.hasAdminRights)
      .filter(server => server.requiredHackingSkill! <= ns.getHackingLevel())
      .filter(server => ns.hackAnalyzeChance(server.hostname) == 1)
      .reduce((a, b) => {
        const aScore = a.moneyMax! / a.hackDifficulty!;
        const bScore = b.moneyMax! / b.hackDifficulty!;
        return aScore > bScore ? a : b;
      });
}

export function getPlayerServers(ns: NS) : Server[] {
    return ns.getPurchasedServers()
      .map(hostname => ns.getServer(hostname));
}