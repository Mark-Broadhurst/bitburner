import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.sleeve.setToBladeburnerAction(0, "Diplomacy");
    ns.sleeve.setToBladeburnerAction(1, "Diplomacy");
    ns.sleeve.setToBladeburnerAction(2, "Diplomacy");
    ns.sleeve.setToBladeburnerAction(3, "Field Analysis");
    ns.sleeve.setToBladeburnerAction(4, "Take on contracts", "Tracking");
    ns.sleeve.setToBladeburnerAction(5, "Take on contracts", "Bounty Hunter");
    ns.sleeve.setToBladeburnerAction(6, "Take on contracts", "Retirement");
    ns.sleeve.setToBladeburnerAction(7, "Infiltrate Synthoids");
}
