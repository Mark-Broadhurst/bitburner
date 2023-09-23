import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const gangFaction = ns.gang.getGangInformation().faction;
    const avalibleAugs = ns.singularity.getAugmentationsFromFaction(gangFaction);
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    const augsToBuy = avalibleAugs
        .filter(aug => !ownedAugs.includes(aug))
        .sort((a, b) => ns.singularity.getAugmentationBasePrice(a) - ns.singularity.getAugmentationBasePrice(b));
    if (augsToBuy.length > 0) {
        const aug = augsToBuy[0];

        while (ns.getServerMoneyAvailable("home") < ns.singularity.getAugmentationBasePrice(aug)) {
            ns.print(`waiting to buy ${aug} for ${ns.formatNumber(ns.singularity.getAugmentationBasePrice(aug))}`);
            await ns.sleep(1000);
        }
        while(ns.singularity.getFactionRep(gangFaction) < ns.singularity.getAugmentationRepReq(aug)) {
            ns.print(`waiting for rep ${ns.singularity.getFactionRep(gangFaction)} / ${ns.singularity.getAugmentationRepReq(aug)}`)
            await ns.sleep(1000);
        }
        ns.toast(`buying ${aug} for ${ns.formatNumber(ns.singularity.getAugmentationBasePrice(aug))}`);
        ns.singularity.purchaseAugmentation(gangFaction, aug);
        ns.singularity.installAugmentations("loop.js");
    }
    ns.singularity.installAugmentations("startup.js");
}
