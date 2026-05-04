import { NS } from "@ns";
import { getBestField } from "faction/factionWork";
import { PlayerRegularFactions } from "/utils/factions";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    while (true) {
        ns.clearLog();
        var factions = PlayerRegularFactions(ns)
            .filter(f => getFactionFavourTotal(ns, f) < 150)
            .sort((a, b) => {
                const ax = factionHasAugs(ns, a);
                const bx = factionHasAugs(ns, b);
                if(ax && !bx) {
                    return -1;
                }
                if(!ax && bx) {
                    return 1;
                }
                return 0;
            }
           );
        ns.print(`Factions: ${factions.join(", ")}`);
        for (let sleeveNumber = 0; sleeveNumber < ns.sleeve.getNumSleeves(); sleeveNumber++) {
            ns.sleeve.setToIdle(sleeveNumber);
        }
        for (let sleeveNumber = 0; sleeveNumber < ns.sleeve.getNumSleeves(); sleeveNumber++) {
            if (factions[sleeveNumber] != undefined) {
                const faction = factions[sleeveNumber];
        
                const work = getBestField(ns, faction, ns.sleeve.getSleeve(sleeveNumber));
                ns.print(`sleeve ${sleeveNumber} to ${faction} ${work} ${getFactionFavourTotal(ns, faction)}`);
                ns.sleeve.setToFactionWork(sleeveNumber, faction, work);
            }
            else {
                ns.print(`sleeve ${sleeveNumber} to idle`);
                ns.sleeve.setToIdle(sleeveNumber);
            }
        }
        if(factions.length == 0) {
            ns.print(`No factions to work for`);
            break;
        }
        await ns.sleep(1000);
    }
}

function getFactionFavourTotal(ns: NS, faction: string): number {
    return ns.singularity.getFactionFavor(faction) + ns.singularity.getFactionFavorGain(faction);
}

function factionHasAugs(ns: NS, faction: string): boolean {
    const augs = ns.singularity.getAugmentationsFromFaction(faction);
    const owned = ns.singularity.getOwnedAugmentations(true);
    return augs.filter(a => !owned.includes(a)).length > 0;
}