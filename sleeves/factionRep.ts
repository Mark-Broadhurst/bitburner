import { NS } from "@ns";
import { getBestField } from "faction/factionWork";
import { Factions } from "/utils/factions";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    while (true) {
        ns.clearLog();
        var factions = ns.getPlayer().factions
            .filter(faction => faction != Factions.ShadowsOfAnarchy && faction != Factions.Bladeburners && faction != Factions.ChurchOfTheMachineGod)
            .filter(faction => {
                if(ns.gang.inGang()){
                    return  faction != ns.gang.getGangInformation().faction
                } else {
                    return true;
                }
            })
            .filter(faction => getFactionFavourTotal(ns, faction) < 150)
            .sort((a, b) => getFactionFavourTotal(ns, b) - getFactionFavourTotal(ns, a));
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

