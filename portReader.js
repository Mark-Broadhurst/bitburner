/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const server = ns.args[0];
  while(true){
    ns.clearLog();
    const maxRam = ns.getServerMaxRam(server);
    const usedRam = ns.getServerUsedRam(server);
    const freeRam = maxRam - usedRam;
    ns.print(`Free Ram: ${freeRam}`);
    if(freeRam < 1.75) {
      await ns.sleep(100);
      continue;
    }
    let portData = ns.readPort(1);

    if(portData == "NULL PORT DATA") {
      await ns.sleep(100);
      continue;
    }

    let [command,target,threads] = portData.split(",");

    switch(command){
      case "weaken":
        ns.run("weaken.js",threads,target);
        break;
      case "grow":
        ns.run("grow.js",threads,target);
        break;
      case "hack":
        ns.run("hack.js",threads,target);
        break;
    }
    await ns.sleep(100);

  }
}