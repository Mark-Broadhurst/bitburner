import { NS } from "@ns";
import { getBestField } from "faction/factionWork";
import AugmentItem from "faction/AugmentItem";
import { Augmentations } from "/utils/augments";
import { Factions } from "/utils";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const player = ns.getPlayer();
    let list = [];
    const factions = ns.args as Factions[];
    do {
        ns.clearLog();
        list = getListOfAugments(ns,factions);
        for (const item of list) {
            if (item.factionRep < item.augmentRep) {
                let field = getBestField(ns, item.faction, player);
                ns.singularity.workForFaction(item.faction, field);
                while (ns.singularity.getFactionRep(item.faction) < item.augmentRep) {
                    ns.clearLog();
                    printList(ns, factions);
                    ns.print(`Waiting for ${item.faction} rep to reach ${ns.formatNumber(item.augmentRep)}`);
                    await ns.sleep(1000);
                }
            }
        }
        await ns.sleep(100);
    }
    while (list.length);
    ns.singularity.stopAction();
}

function getListOfAugments(ns: NS, factions: Factions[]): AugmentItem[] {
    let list : AugmentItem[] = [];
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    for (const aug of Augmentations) {
        if (ownedAugs.includes(aug)) continue;
        for (const faction of ns.singularity.getAugmentationFactions(aug) as Factions[]) {
            if(!ns.getPlayer().factions.includes(faction)) continue;
            if(factions.length && !factions.includes(faction)) continue;
            if(list.find(x => x.augment === aug)) continue;
            list.push(new AugmentItem(ns, faction, aug));
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

function printList(ns: NS, factions: Factions[] = []) {
    ns.print("🦾".padEnd(56) + "Faction".padEnd(23) + "🙇‍♂️".padEnd(9) + "Req");
    ns.print("-".repeat(100));
    const list = getListOfAugments(ns, factions);
    for (const item of list) {
        ns.print(`${item.augment.padEnd(56)}${item.faction.padEnd(28)}${ns.formatNumber(item.augmentRep, 2).padEnd(9)}${ns.formatNumber(item.requiredRep, 2).padEnd(9)}`);
    }
    ns.print("-".repeat(100));
}
