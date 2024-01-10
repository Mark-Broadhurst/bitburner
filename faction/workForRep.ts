import { NS } from "@ns";
import { PlayerRegularFactions } from "utils/factions";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();
    const factions = PlayerRegularFactions(ns)
        .filter(x => (ns.singularity.getFactionFavor(x) + ns.singularity.getFactionFavorGain(x)) <= 150)
        /*
        .filter(x => {
            const augs = ns.singularity.getAugmentationsFromFaction(x);
            const owned = ns.singularity.getOwnedAugmentations(true);
            return augs.filter(a => !owned.includes(a)).length > 0;
        })
        */;
    ns.print(factions);
    for (const faction of factions) {
        ns.singularity.workForFaction(faction, "hacking", false);
        ns.singularity.workForFaction(faction, "security", false);
        ns.print(`working for ${faction}`);
        const currentFav = ns.singularity.getFactionFavor(faction);
        let fav = currentFav + ns.singularity.getFactionFavorGain(faction);
        while (fav <= 150) {
            ns.clearLog();
            printFactions(ns, factions);
            ns.print(`waiting for Favour for ${faction} : ${ns.formatNumber(fav, 0)} / 150`);
            await ns.sleep(1000);
            fav = ns.singularity.getFactionFavorGain(faction) + currentFav;
        }
    }
    ns.singularity.stopAction();
}

function printFactions(ns: NS, factions: string[]) {
    ns.print("Faction\t\t\t\tFavour\tRep");
    for (const faction of factions) {
        let rep = ns.singularity.getFactionRep(faction);
        let fav = ns.singularity.getFactionFavor(faction);
        let gain = ns.singularity.getFactionFavorGain(faction);
        ns.print(`${faction.padEnd(25)}\t${ns.formatNumber(fav + gain)}\t${ns.formatNumber(rep)}`);
    };
}