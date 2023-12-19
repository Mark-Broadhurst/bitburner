import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.bladeburner.joinBladeburnerDivision();
    ns.run("bladeburner/skills.js");
    ns.run("bladeburner/tasks.js");
}
