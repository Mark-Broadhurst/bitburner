import { NS } from "@ns";
import { FactionsToJoin } from "/utils/factions";

export async function main(ns: NS): Promise<void> {
    const playerFactions = [...ns.getPlayer().factions, ...ns.singularity.checkFactionInvitations()];
    const factionsToJoin = FactionsToJoin.filter(x => !playerFactions.includes(x));
    ns.print(factionsToJoin);
}
