import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.bladeburner.joinBladeburnerDivision();
    ns.run("Bladeburner/skills.js");
    ns.run("Bladeburner/tasks.js");
}
