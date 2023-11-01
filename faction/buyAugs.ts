import { NS } from "@ns";
import { getAugmentationDetails } from "utils/augments";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const faction = ns.args[0] as string | null;
    let list = getAugmentationDetails(ns)
    ns.print(`Augmentations to buy: ${list.length}`);
    while(list.length)
    {
        const item = list.shift()!;
        ns.print(`Buying ${item.name} from ${item.faction}`);
        for(const faction of item.faction)
        {
            ns.singularity.purchaseAugmentation(faction, item.name);
        }
        
        await ns.sleep(100);
    }
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
