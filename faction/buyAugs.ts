import { NS } from "@ns";
import { getAugmentationsExcludeOwned, getAugmentationsFromFactionsExcludeOwned } from "/utils/augments";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const faction = ns.args[0] as string | null;
    let list = getAugmentList(ns, faction);
    /*
    for (const item of list) {
        ns.print(item);
        const rep = ns.singularity.getAugmentationRepReq(item);
        const price = ns.singularity.getAugmentationPrice(item);
        while (ns.getServerMoneyAvailable("home") < price)
            await ns.sleep(1000);
        }
        //ns.print(`Buying ${item.augment} from ${item.faction}`);
        //ns.singularity.purchaseAugmentation(item.faction, item.augment);
        await ns.sleep(100);
    }
    */
}

function getAugmentList(ns: NS, faction: string | null) {
    if (faction) {
        return getAugmentationsFromFactionsExcludeOwned(ns, faction);
    }
    return getAugmentationsExcludeOwned(ns);
}