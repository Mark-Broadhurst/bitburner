import { NS, FactionName } from "@ns";

export function getAugmentationsFromFaction(ns: NS, faction: FactionName): string[] {
    return ns.singularity.getAugmentationsFromFaction(faction)
        .filter(a => a !== "NeuroFlux Governor");
}

export function getUnownedAugmentationsFromFaction(ns: NS, faction: FactionName): string[] {
    const owned = new Set(ns.singularity.getOwnedAugmentations(true));
    return getAugmentationsFromFaction(ns, faction)
        .filter(a => !owned.has(a));
}
