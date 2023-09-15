import { NS } from "@ns";
import { getBestField } from "faction/factionWork";
import AugmentItem from "faction/AugmentItem";
import { Factions } from "/utils/factions";
 
export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    let list = [];
    do {
        ns.clearLog();
        list = getListOfAugments(ns);
        for (const item of list) {
            if (item.factionRep < item.augmentRep) {
                let field = getBestField(ns, item.faction);
                ns.singularity.workForFaction(item.faction, field);
                while (ns.singularity.getFactionRep(item.faction) < item.augmentRep) {
                    ns.clearLog();
                    printList(ns);
                    ns.print(`Waiting for ${item.faction} rep to reach ${ns.formatNumber(item.augmentRep)}`);
                    await ns.sleep(1000);
                }
            }
            while (ns.getServerMoneyAvailable("home") < item.augmentPrice) {
                ns.clearLog();
                printList(ns);
                ns.print(`Waiting for money to reach ${ns.formatNumber(item.augmentPrice)}`);
                await ns.sleep(1000);
            }
            ns.print(`Buying ${item.augment} from ${item.faction}`);
            ns.singularity.purchaseAugmentation(item.faction, item.augment);
        }
        await ns.sleep(100);
    }
    while (list.length);
}

function getListOfAugments(ns: NS) : AugmentItem[] {

    let list = [];
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    for (const faction of ns.getPlayer().factions) {
        if (faction == Factions.ShadowsOfAnarchy) continue;
        if (ns.gang.inGang() && faction == ns.gang.getGangInformation().faction) continue;
        const augments = ns.singularity.getAugmentationsFromFaction(faction);
        for (const augment of augments) {
            if (augment == "NeuroFlux Governor") continue;
            if (ownedAugs.includes(augment)) continue;
            if (ns.singularity.getAugmentationRepReq(augment) > 500_000) continue;
            list.push(new AugmentItem(ns, faction, augment));
        }
    }
    list = list.sort((a, b) => {
        if (a.requiredRep > b.requiredRep) {
            return 1;
        }
        if (a.requiredRep < b.requiredRep) {
            return -1;
        }
        if (a.augmentPrice > b.augmentPrice) {
            return 1;
        }
        if (a.augmentPrice < b.augmentPrice) {
            return -1;
        }
        return 0;
    });
    return list;
}

function printList(ns: NS) {
    ns.print("Augment\t\t\t\t\t\tFaction\t\t\tRep\tRequried Rep");
    ns.print("--------------------------------------------------------------------------------------------");
    const list = getListOfAugments(ns);
    for (const item of list) {
        ns.print(`${item.augment.padEnd(40)}\t${item.faction.padEnd(20)}\t${ns.formatNumber(item.augmentRep, 2)}\t${ns.formatNumber(item.requiredRep, 2)}`);
    }
    ns.print("--------------------------------------------------------------------------------------------");
}

