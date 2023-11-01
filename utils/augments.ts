import { NS } from "@ns";
import { RegularFactions } from "utils/factions";

export function getAugmentations(ns: NS): string[] {
    let augs = new Set<string>();
    for (const faction of RegularFactions) {
        const factionAugs = ns.singularity.getAugmentationsFromFaction(faction);
        for (const aug of factionAugs) {
            if (aug == "NeuroFlux Governor") continue;
            augs.add(aug);
        }
    }
    return [...augs];
}

export function getAugmentationsFromFaction(ns: NS, faction: string): string[] {
    return ns.singularity.getAugmentationsFromFaction(faction)
        .filter(x => x != "NeuroFlux Governor");
}

export function getAugmentationsFromFactionsExcludeOwned(ns: NS, faction: string): string[] {
    const augs = getAugmentationsFromFaction(ns, faction);
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    return augs.filter(aug => !ownedAugs.includes(aug));
}

export function getAugmentationsExcludeOwned(ns: NS): string[] {
    const augs = getAugmentations(ns);
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    return augs.filter(aug => !ownedAugs.includes(aug));
}

export function getAugmentationDetails (ns:NS) {
    const augs = getAugmentations(ns);
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    const augmentations = augs.map(aug => {
        const owned = ownedAugs.includes(aug);
        const cost = ns.singularity.getAugmentationBasePrice(aug);
        const rep = ns.singularity.getAugmentationRepReq(aug);
        const faction = ns.singularity.getAugmentationFactions(aug);
        return {
            name: aug,
            owned,
            cost,
            rep,
            faction,
        }
    });
    return augmentations;
}