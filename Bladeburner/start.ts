import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.bladeburner.joinBladeburnerDivision();
    if (!ns.isRunning("Bladeburner/skills.js")) ns.run("Bladeburner/skills.js");
    if (!ns.isRunning("Bladeburner/tasks.js"))  ns.run("Bladeburner/tasks.js");
}
