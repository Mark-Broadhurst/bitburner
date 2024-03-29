import { NS, Server } from "@ns";

export function getServerNames(ns: NS): string[] {
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

export function getServers(ns: NS): Server[] {
  return getServerNames(ns)
    .map(hostname => ns.getServer(hostname));
}

export function getWorkerServers(ns: NS): Server[] {
  return getServers(ns)
    .filter(server => server.hasAdminRights)
    .filter(server => server.maxRam > 0);
}

export function getTargetServers(ns: NS): Server[] {
  const targets = ns.args as string[];

  if(targets.length){
    return targets.map(ns.getServer)
  }

  return getServers(ns)
    .filter(server => server.hostname != "fulcrumassets")
    .filter(server => server.moneyMax! > 0)
    .filter(server => server.hasAdminRights)
    .filter(server => server.requiredHackingSkill! <= ns.getHackingLevel())
    .sort((a, b) => a.requiredHackingSkill! - b.requiredHackingSkill!);
}

export function getTargetServer(ns: NS): Server {
  return getServers(ns)
    .filter(server => server.moneyMax! > 0)
    .filter(server => server.hasAdminRights)
    .filter(server => server.requiredHackingSkill! <= ns.getHackingLevel())
    .filter(server => ns.hackAnalyzeChance(server.hostname) == 1)
    .reduce((a, b) => {
      const aScore = a.moneyMax! / a.minDifficulty!;
      const bScore = b.moneyMax! / b.minDifficulty!;
      return aScore > bScore ? a : b;
    });
}

export function getPlayerServers(ns: NS): Server[] {
  return ns.getPurchasedServers()
    .map(hostname => ns.getServer(hostname));
}