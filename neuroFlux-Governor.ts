import { NS } from "@ns";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();

    const augName      = "NeuroFlux Governor";
    const requiredRep  = ns.singularity.getAugmentationRepReq(augName);

    const factions = ns.getPlayer().factions
        .filter(f => ns.singularity.getAugmentationsFromFaction(f).includes(augName))
        .filter(f => ns.singularity.getFactionRep(f) >= requiredRep);

    if (factions.length === 0) {
        ns.tprint("ERROR: No faction with sufficient rep for NeuroFlux Governor.");
        return;
    }

    const faction = factions.reduce((a, b) =>
        ns.singularity.getFactionRep(a) >= ns.singularity.getFactionRep(b) ? a : b
    );

    ns.print(`Buying NeuroFlux Governor from ${faction}`);

    while (ns.getServerMoneyAvailable("home") >= ns.singularity.getAugmentationPrice(augName)) {
        const cost = ns.singularity.getAugmentationPrice(augName);
        ns.singularity.purchaseAugmentation(faction, augName);
        ns.print(`Purchased for $${ns.format.number(cost)}`);
    }

    ns.tprint(`Done — bought as many NeuroFlux Governors as affordable.`);
}
