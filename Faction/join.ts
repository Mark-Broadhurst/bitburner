import { NS } from "@ns";
import { Factions, isExclusiveFaction } from "/Utils/factions";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    while (true) {
        const owned = ns.singularity.getOwnedAugmentations(true);
        const factions = ns.singularity.checkFactionInvitations()
            .map(f => f as Factions)
            .filter(f => !isExclusiveFaction(f))
            .filter(f => ns.singularity.getAugmentationsFromFaction(f).some(a => !owned.includes(a)));
        for (const faction of factions) {
            ns.singularity.joinFaction(faction);
            ns.print(`joined ${faction}`);
            ns.tprint(`joined ${faction}`);
        }
        await ns.sleep(10000);
    }
}
