/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();

    let ownedAugs = ns.singularity.getOwnedAugmentations();
    let factionsWithAugs = ns.getPlayer().factions
        .filter(x => x != "Shadows of Anarchy")
        .map(faction => {
            const factionRep = ns.singularity.getFactionRep(faction);
            let factionAugs = ns.singularity.getAugmentationsFromFaction(faction)
                .filter(x => !ownedAugs.includes(x) && x != "NeuroFlux Governor")
                .map(x => { return { name: x, rep: ns.singularity.getAugmentationRepReq(x) - factionRep } });
            return { name: faction, augs: factionAugs };
        })
        .filter(x => x.augs.length)
        .sort((a, b) => {
            if (a.augs[0].rep > b.augs[0].rep) {
                return 1;
            }
            if (a.augs[0].rep < b.augs[0].rep) {
                return -1;
            }
            return 0;
        });
    ns.print(JSON.stringify(factionsWithAugs, null, 1));
    for (const faction of factionsWithAugs) {
        for (const aug of faction.augs) {
            if (ns.getServerMoneyAvailable("home") < ns.singularity.getAugmentationPrice(aug.name) &&
                ns.singularity.getFactionRep(faction.name) < aug.rep) {
                ns.singularity.purchaseAugmentation(faction.name, aug.name);
            }
        }
    }
}
