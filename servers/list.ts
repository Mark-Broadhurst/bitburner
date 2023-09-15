import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL")
    ns.clearLog();
    ns.tail();
    ns.resizeTail(400,700);
  
    ns.print("Server\t\tRAM\t\tCost");
    for (const host of ns.getPurchasedServers()) {
      const ser = ns.getServer(host);
      const cost = ns.getPurchasedServerUpgradeCost(ser.hostname, ser.maxRam * 2);
      ns.print(`${ser.hostname.padEnd(8)}\t${ns.formatRam(ser.maxRam).padEnd(9)}\t${ns.formatNumber(cost, 2)}\t${ser.cpuCores}`);
    }
}
