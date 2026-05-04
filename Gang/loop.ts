import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.run("Sleeve/crime.js");
    ns.run("Hacking/nuke-all.js");
    ns.run("Hacking/backdoor.js");
    ns.run("Programs/create.js");
    ns.run("Hacking/hackCommander.js", 1, "n00dles");
    const gangFaction = ns.gang.getGangInformation().faction;
    const avalibleAugs = ns.singularity.getAugmentationsFromFaction(gangFaction);
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    const augsToBuy = avalibleAugs
        .filter(aug => !ownedAugs.includes(aug))
        .filter(aug => ns.singularity.getAugmentationBasePrice(aug) < 1e12)
        .sort((a, b) => ns.singularity.getAugmentationBasePrice(a) - ns.singularity.getAugmentationBasePrice(b));
    if (augsToBuy.length > 0) {
        const aug = augsToBuy[0];

        const members = ns.gang.getMemberNames()
        for (const member of members) {
            ns.gang.setMemberTask(member, "Human Trafficking");
        }

        while (ns.getServerMoneyAvailable("home") < ns.singularity.getAugmentationBasePrice(aug)) {
            ns.print(`waiting to buy ${aug} for ${ns.format.number(ns.singularity.getAugmentationBasePrice(aug))}`);
            await ns.gang.nextUpdate();
        }
        for (const member of members) {
            ns.gang.setMemberTask(member, "Terrorism");
        }

        while(ns.singularity.getFactionRep(gangFaction) < ns.singularity.getAugmentationRepReq(aug)) {
            ns.print(`waiting for rep ${ns.format.number(ns.singularity.getFactionRep(gangFaction))} / ${ns.format.number(ns.singularity.getAugmentationRepReq(aug))}`)
            await ns.gang.nextUpdate();
        }
        ns.tprint(`buying ${aug} for ${ns.format.number(ns.singularity.getAugmentationBasePrice(aug))}`);
        ns.singularity.purchaseAugmentation(gangFaction, aug);
        ns.singularity.installAugmentations("Gang/loop.js");
    }
    ns.killall("home",true);
    ns.run("startup.js");
} 