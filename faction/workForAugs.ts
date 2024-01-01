import { NS } from "@ns";
import { getBestField } from "faction/factionWork";
import AugmentItem from "faction/AugmentItem";
import { PlayerRegularFactions } from "/utils/factions";
 
export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const player = ns.getPlayer();
    let list = [];
    do {
        ns.clearLog();
        list = getListOfAugments(ns);
        for (const item of list) {
            if (item.factionRep < item.augmentRep) {
                let field = getBestField(ns, item.faction, player);
                ns.singularity.workForFaction(item.faction, field);
                while (ns.singularity.getFactionRep(item.faction) < item.augmentRep) {
                    ns.clearLog();
                    printList(ns);
                    ns.print(`Waiting for ${item.faction} rep to reach ${ns.formatNumber(item.augmentRep)}`);
                    await ns.sleep(1000);
                }
            }
            /*
            while (ns.getServerMoneyAvailable("home") < item.augmentPrice) {
                ns.clearLog();
                printList(ns);
                ns.print(`Waiting for money to reach ${ns.formatNumber(item.augmentPrice)}`);
                await ns.sleep(1000);
            }
            ns.print(`Buying ${item.augment} from ${item.faction}`);
            ns.singularity.purchaseAugmentation(item.faction, item.augment);
            */
        }
        await ns.sleep(100);
    }
    while (list.length);
    ns.singularity.stopAction();
}

function getListOfAugments(ns: NS) : AugmentItem[] {
    let list = [];
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    for (const faction of PlayerRegularFactions(ns)) {
        const augments = ns.singularity.getAugmentationsFromFaction(faction);
        for (const augment of augments) {
            if (augment == "NeuroFlux Governor") continue;
            if (ownedAugs.includes(augment)) continue;
            //if (ns.singularity.getAugmentationRepReq(augment) > 500_000) continue;
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
    ns.print("🦾".padEnd(56) + "Faction".padEnd(23) + "🙇‍♂️".padEnd(9) + "Req");
    ns.print("-".repeat(100));
    const list = getListOfAugments(ns);
    for (const item of list) {
        ns.print(`${item.augment.padEnd(56)}${item.faction.padEnd(23)}${ns.formatNumber(item.augmentRep, 2).padEnd(9)}${ns.formatNumber(item.requiredRep, 2).padEnd(9)}`);
    }
    ns.print("-".repeat(100));
}

