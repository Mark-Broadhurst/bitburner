import network from "./network/scan";
import sortBy from "./helpers/sortBy";

/** @param {NS} ns */
export async function main(ns) {
  async function pathTo(hostname) {
    let path = [];
    let node = hostname;
    path.push(hostname);
    while (node != "home") {
      node = await ns.scan(node)[0];
      path.push(node);
    }
    return path.reverse();
  }

  ns.disableLog("ALL");
  ns.clearLog();
  var servers = network(ns)
    .filter(x=> x!="w0r1d_d43m0n")
    .sort(sortBy("requiredHackingSkill"))
    .sort(sortBy("numOpenPortsRequired"));
  ns.singularity.connect("home");
  for(let i = 0; i<servers.length; i++)
  {
    var server = servers[i];
    if(server.backdoorInstalled){
      continue;
    }
    while(!ns.hasRootAccess(server.hostname))
    {
      ns.print(`waiting for rootAccess to backdoor ${server.hostname}`);
      await ns.sleep(10000);
    }
    while(ns.getHackingLevel() < server.requiredHackingSkill)
    {
      ns.print(`waiting for hacklevel ${server.requiredHackingSkill} to backdoor ${server.hostname}`);
      await ns.sleep(60000);
    }
    var path = await pathTo(server.hostname);
    for(let j = 0; j<path.length; j++) {
      ns.singularity.connect(path[j]);
    }
    ns.print(`Installing backdoor for ${server.hostname}`);
    await ns.singularity.installBackdoor()
    .then(() => {
      ns.toast(`Backdoor installed on ${server.hostname}`);
    });
    
    ns.singularity.connect("home");

  }
}