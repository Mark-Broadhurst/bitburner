import { NS } from "@ns";
import AugmentItem from "faction/AugmentItem";
import { Factions } from "/utils/factions";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    let list = [];
    do {
        ns.clearLog();
        list = [];
        let ownedAugs = ns.singularity.getOwnedAugmentations(true);
        for (const faction of ns.getPlayer().factions) {
            if (faction == Factions.ShadowsOfAnarchy) continue;
            const augments = ns.singularity.getAugmentationsFromFaction(faction);
            for (const augment of augments) {
                if (augment == "NeuroFlux Governor") continue;
                if (ownedAugs.includes(augment)) continue;
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
        for (const item of list) {
            ns.print(item);
            while (ns.getServerMoneyAvailable("home") < item.augmentPrice &&
                ns.singularity.getFactionRep(item.faction) < item.augmentRep) {
                ns.print(`Waiting for money to reach ${ns.formatNumber(item.augmentPrice)}`);
                ns.print(`Waiting for ${item.faction} rep to reach ${item.augmentRep}`);
                await ns.sleep(1000);
            }
            //ns.print(`Buying ${item.augment} from ${item.faction}`);
            //ns.singularity.purchaseAugmentation(item.faction, item.augment);
        }
        await ns.sleep(100);
    }
    while (list.length);
}