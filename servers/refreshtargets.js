import network from "./network/scan";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const player = ns.getPlayer();

  let targets = network(ns)
    .filter(server => server.hasAdminRights && server.moneyMax != 0 && server.requiredHackingSkill <= player.skills.hacking);

    for(const server of ns.getPurchasedServers()){
      const ram = ns.getServerMaxRam(server);
      
      let threads = Math.floor(ram / 3.5 / targets.length);

      while(threads == 0)
      {
        targets = targets.slice(0,-1);
        threads = Math.floor(ram / 3.5 / targets.length);
      }

      ns.scriptKill("hacking/hack.js", server);
      ns.scriptKill("hacking/simple.js", server);
      ns.scriptKill("hacking/grow.js", server);
      ns.scriptKill("hacking/weaken.js", server);

      ns.rm("hacking/hack.js", server);
      ns.rm("hacking/simple.js", server);
      ns.rm("hacking/grow.js", server);
      ns.rm("hacking/weaken.js", server);

      ns.scp(["hacking/grow.js", "hacking/weaken.js"], server);

      for(const target of targets){
        ns.print(server + " " + threads + " " + target.hostname);
        ns.exec("hacking/grow.js", server, threads, target.hostname);
        ns.exec("hacking/weaken.js", server, threads, target.hostname);
      }
    }
}

