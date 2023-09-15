import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const server = ns.args[0] as string;
    while (true) {
      ns.clearLog();
      const maxRam = ns.getServerMaxRam(server);
      const usedRam = ns.getServerUsedRam(server);
      const freeRam = maxRam - usedRam;
      ns.print(`Free Ram: ${freeRam}`);
      if (freeRam < 1.75) {
        await ns.sleep(10);
        continue;
      }
      let portData = ns.readPort(1) as string;
  
      if (portData == "NULL PORT DATA") {
        await ns.sleep(10);
        continue;
      }
  
      let [command, target, threads, wait] = portData.split(",");
  
      ns.print(`${command}ing ${target} ${threads}`);
      ns.run(`${command}.js`, parseInt(threads), target, wait);
  
      await ns.sleep(10);
    }
}
