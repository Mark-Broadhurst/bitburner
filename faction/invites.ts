import { NS } from "@ns";
import {  RegularFactions, isExclusiveFaction } from "/utils/factions";

export async function main(ns: NS): Promise<void> {
    const playerFactions = [...ns.getPlayer().factions, ...ns.singularity.checkFactionInvitations()];
    const factionsToJoin = RegularFactions(ns)
        .filter(x => !isExclusiveFaction(x))
        .filter(x => !playerFactions.includes(x));
    ns.print(factionsToJoin);
}
