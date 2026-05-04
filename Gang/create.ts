import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  if (!ns.gang.inGang()) {
    ns.print("waiting for karma to be high enough to create a gang");
    // @ts-ignore
    while (ns.heart!.break() > -54_000) {
      await ns.sleep(60_000);
    }
    ns.gang.createGang("Slum Snakes");

    ns.run("Gang/equipment.js");
    ns.run("Gang/territoryWarfare.js");
    ns.run("Gang/tasks.js");
  }
}