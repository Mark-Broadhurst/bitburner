import { NS, FactionName } from "@ns";

/**
 * Get all augmentations from a faction, excluding NeuroFlux Governor
 * (which stacks infinitely and is handled separately everywhere).
 */
export function getAugmentationsFromFaction(ns: NS, faction: FactionName): string[] {
    return ns.singularity.getAugmentationsFromFaction(faction)
        .filter(a => a !== "NeuroFlux Governor");
}

/**
 * Get all unowned augmentations from a faction, excluding NeuroFlux Governor.
 */
export function getUnownedAugmentationsFromFaction(ns: NS, faction: FactionName): string[] {
    const owned = new Set(ns.singularity.getOwnedAugmentations(true));
    return getAugmentationsFromFaction(ns, faction)
        .filter(a => !owned.has(a));
}
