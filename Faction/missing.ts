import { NS } from "@ns";
import { FactionsList } from "Utils/factions";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    const allPlayerFactions = [...ns.getPlayer().factions, ...ns.singularity.checkFactionInvitations()];
    const missing = FactionsList.filter(x => !allPlayerFactions.includes(x));
    ns.print(missing.join("\n"));
    await ns.sleep(10000);
    ns.ui.closeTail();
}

