import { NS } from "@ns";
import { FactionsList } from "utils/nsWrapper";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.tail();
    const allPlayerFactions = [...ns.getPlayer().factions, ...ns.singularity.checkFactionInvitations()];
    const missing = FactionsList.filter(x => !allPlayerFactions.includes(x));
    ns.print(missing.join("\n"));
}

