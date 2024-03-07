import { NS } from "@ns";
import { Augmentation, getAugmentationDetails, AugmentationDetails } from "utils/augments";
import { Factions } from "/utils";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const factions = ns.args as Factions[];
    const list = getAugmentations(ns, factions);

    ns.print(`Augmentations to buy: ${list.length}`);
    for (const line of list) {
        if(line.faction[0] === undefined){
            ns.print(`${line.name.padEnd(47)}${"none".padEnd(27)}${ns.formatNumber(line.cost).padEnd(9)} ${ns.formatNumber(line.rep).padEnd(8)}`);

        } else {
        ns.print(`${line.name.padEnd(47)}${line.faction[0].padEnd(27)}${ns.formatNumber(line.cost).padEnd(9)} ${ns.formatNumber(line.rep).padEnd(8)}`);
        }
    }

    while (list.length) {
        const item = list.shift()!;
        const faction = item.faction[0];

        while (!ns.singularity.purchaseAugmentation(faction, item.name)) {
            await ns.sleep(1000);
        }

        await ns.sleep(100);
    }
    ns.singularity.installAugmentations("startup.js")
}

function getAugmentations(ns: NS, factions: Factions[]) {
    let list = getAugmentationDetails(ns)
        .filter(aug => !aug.owned)
        .filter(aug => {
            if (!factions.length) return true;
            for (const fac of aug.faction) {
                if (factions.includes(fac)) return true;
            }
            return false;
        })
        .map(aug => {
            aug.faction = aug.faction.filter(f =>
                ns.singularity.getFactionRep(f) >= aug.rep
                && !factions.length || factions.includes(f));
            return aug;
        })
        .sort((a, b) => b.cost - a.cost);

    let orderedList: AugmentationDetails[] = [];
    for (const item of list) {
        if (orderedList.includes(item)) continue;
        for (const preReq of item.preReq) {
            const preReqAug = list.find(aug => aug.name === preReq);
            if (preReqAug) {
                orderedList.push(preReqAug);
            }
        }
        orderedList.push(item);
    }
    return orderedList;
}