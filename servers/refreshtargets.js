
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const flags = ns.flags([
    ['force', false],
  ]);

  for (const server of ns.getPurchasedServers()) {
    ns.scp(["grow.js", "weaken.js", "hack.js", "portReader.js"], server);
    ns.kill("portReader.js", server, server);
    if(flags.force){
      ns.scriptKill("grow.js", server);
      ns.scriptKill("hack.js", server);
      ns.scriptKill("weaken.js", server);
    }
    ns.exec("portReader.js", server, 1, server);
  }
}

