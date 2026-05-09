import { NS } from "@ns";
import { FactionsList, isSpecialFaction, isGangFaction, Factions } from "Utils/factions";

/**
 * Route-aware faction progression loop.
 *
 * Determines whether the current BitNode favours a hacking or physical route,
 * scores all joined factions by how much the route-relevant augment multipliers
 * they still have to offer, and processes them one at a time:
 *   1. Grind rep until every aug from the faction is unlocked
 *   2. Buy all affordable augs (without installing)
 *
 * After exhausting all scored factions, installs everything queued up and
 * returns to init.js via the post-install callback.
 */

type Route = "hacking" | "physical";

// BitNodes where physical (combat) stats are the primary progression path.
const PHYSICAL_BITNODES = new Set([2, 6, 7]);

const HACKING_STATS  = ["hacking", "hacking_exp", "hacking_chance", "hacking_speed", "hacking_money", "hacking_grow"];
const PHYSICAL_STATS = ["strength", "strength_exp", "defense", "defense_exp",
                        "dexterity", "dexterity_exp", "agility", "agility_exp"];

// ── Entry point ───────────────────────────────────────────────────────────────

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(720, 460);

    const { currentNode } = ns.getResetInfo();
    const route   = PHYSICAL_BITNODES.has(currentNode) ? "physical" : "hacking";
    const ordered = getOrderedFactions(ns, route);

    // Stop any background workForAugs daemon — we'll run it per-faction below.
    ns.scriptKill("Faction/workForAugs.js", "home");

    ns.print(`BitNode ${currentNode}  |  Route: ${route.toUpperCase()}`);
    ns.print("─".repeat(60));
    if (ordered.length === 0) {
        ns.print("No joined factions with relevant unowned augments.");
    } else {
        ns.print("Faction order:");
        const ownedAugs = ns.singularity.getOwnedAugmentations(true);
        for (const f of ordered) {
            const score = scoreFaction(ns, f, route, ownedAugs);
            ns.print(`  ${f.padEnd(32)} score: ${score.toFixed(3)}`);
        }
    }
    ns.print("─".repeat(60));

    for (const faction of ordered) {
        ns.print(`\n▶ ${faction}`);

        // Phase 1 — grind rep until all this faction's augs are unlocked
        ns.print("  Grinding rep...");
        const repPid = ns.run("Faction/workForAugs.js", 1, faction);
        if (repPid > 0) {
            while (ns.isRunning(repPid)) await ns.sleep(5_000);
            ns.print("  ✅ Rep targets met");
        } else {
            ns.print("  WARN: could not start workForAugs.js (already running or no RAM?)");
        }

        // Phase 2 — buy all affordable augs from this faction, hold the install
        ns.print("  Buying augs...");
        const buyPid = ns.run("Faction/buyAugs.js", 1, "--no-install", faction);
        if (buyPid > 0) {
            while (ns.isRunning(buyPid)) await ns.sleep(1_000);
            ns.print("  ✅ Augs purchased");
        } else {
            ns.print("  WARN: could not start buyAugs.js");
        }
    }

    ns.print("\n─".repeat(60));
    ns.print("All factions processed — installing augmentations...");
    ns.singularity.installAugmentations("init.js");
}

// ── Faction ordering ──────────────────────────────────────────────────────────

/**
 * Returns the player's joined factions sorted by route score (highest first).
 * Factions scoring 0 (no relevant unowned augments) are excluded.
 */
function getOrderedFactions(ns: NS, route: Route): Factions[] {
    const playerFactions = ns.getPlayer().factions;
    const ownedAugs      = ns.singularity.getOwnedAugmentations(true);

    return (FactionsList as Factions[])
        .filter(f => playerFactions.includes(f))
        .filter(f => !isSpecialFaction(f) && !isGangFaction(ns, f))
        .map(f => ({ faction: f, score: scoreFaction(ns, f, route, ownedAugs) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(x => x.faction);
}

/**
 * Score a faction by summing the route-relevant multiplier bonuses
 * across all its unowned augments (excluding NeuroFlux Governor).
 * Each multiplier is 1.x, so (value - 1) gives the actual bonus.
 */
function scoreFaction(ns: NS, faction: string, route: Route, ownedAugs: string[]): number {
    const keys = route === "hacking" ? HACKING_STATS : PHYSICAL_STATS;

    return ns.singularity.getAugmentationsFromFaction(faction)
        .filter(a => a !== "NeuroFlux Governor" && !ownedAugs.includes(a))
        .reduce((total, aug) => {
            const stats = ns.singularity.getAugmentationStats(aug) as Record<string, number>;
            return total + keys.reduce((s, k) => s + ((stats[k] ?? 1) - 1), 0);
        }, 0);
}
