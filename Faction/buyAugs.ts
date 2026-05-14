import { NS, FactionName } from "@ns";

/**
 * Buys augmentations from one or more factions.
 *
 * Usage:  run Faction/buyAugs.js [--no-install] <faction> [faction2 ...]
 *
 * Algorithm:
 *  1. Collect every unowned aug from the given factions where the player has
 *     sufficient rep.  If multiple factions offer the same aug the first one
 *     with enough rep is used.
 *  2. Drop augs whose prerequisite chain cannot be fully satisfied (prereq
 *     neither already owned nor also in the buy list).  Runs to fixpoint so
 *     multi-level chains are handled correctly.
 *  3. Sort by current price, most expensive first — buying expensive augs
 *     before cheap ones minimises the compounding price-scaling penalty.
 *  4. Topological sort (DFS in price-descending order) so every prerequisite
 *     is always purchased before the aug that depends on it.
 *  5. Buy in order, re-reading price each iteration (it scales after each
 *     purchase).  Waits up to 60 s per aug for funds; skips if still
 *     unaffordable.
 */

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(800, 520);

    const args      = ns.args as string[];
    const noInstall = args.includes("--no-install");
    const factions  = args.filter(a => a !== "--no-install") as FactionName[];

    if (factions.length === 0) {
        ns.tprint("ERROR buyAugs: no factions specified");
        return;
    }

    const buyList = buildBuyList(ns, factions);

    ns.print(`Factions   : ${factions.join(", ")}`);
    ns.print(`Augs to buy: ${buyList.length}`);
    ns.print("─".repeat(78));
    for (const entry of buyList) {
        ns.print(`  ${entry.name.padEnd(52)} ${ns.format.number(entry.price).padEnd(12)} ${entry.faction}`);
    }
    ns.print("─".repeat(78));

    if (buyList.length === 0) {
        ns.print("Nothing to buy.");
        if (!noInstall) ns.singularity.installAugmentations("init.js");
        return;
    }

    let bought = 0;
    for (const entry of buyList) {
        const deadline = Date.now() + 60_000;
        let purchased  = false;

        while (!purchased) {
            if (ns.singularity.purchaseAugmentation(entry.faction, entry.name)) {
                purchased = true;
            } else if (Date.now() > deadline) {
                const price = ns.singularity.getAugmentationPrice(entry.name);
                ns.print(`⏭  Skip ${entry.name} — need ${ns.format.number(price)}, timed out`);
                break;
            } else {
                await ns.sleep(2_000);
            }
        }

        if (purchased) {
            bought++;
            ns.print(`✅ ${entry.name}`);
        }
    }

    ns.print("─".repeat(78));
    ns.print(`Bought ${bought} / ${buyList.length} augmentations.`);

    if (!noInstall) ns.singularity.installAugmentations("init.js");
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface AugEntry {
    name:    string;
    price:   number;
    faction: FactionName;
    prereqs: string[];
}

// ── Build the ordered buy list ────────────────────────────────────────────────

function buildBuyList(ns: NS, factions: FactionName[]): AugEntry[] {
    const owned = new Set(ns.singularity.getOwnedAugmentations(true));

    // ── Step 1: assign each buyable aug to the first faction with enough rep ──
    const augToFaction = new Map<string, FactionName>();
    for (const faction of factions) {
        const rep = ns.singularity.getFactionRep(faction);
        for (const aug of ns.singularity.getAugmentationsFromFaction(faction)) {
            if (aug === "NeuroFlux Governor") continue; // stacks infinitely, skip
            if (owned.has(aug))           continue;
            if (augToFaction.has(aug))    continue; // already assigned
            if (rep >= ns.singularity.getAugmentationRepReq(aug)) {
                augToFaction.set(aug, faction);
            }
        }
    }

    // ── Step 2: fixpoint prereq validation ───────────────────────────────────
    // Drop any aug whose prerequisites are neither already owned nor in our
    // buy list.  Repeat until no more removals occur (handles chains of any
    // depth, e.g. A→B→C where C also needs to be dropped).
    let changed = true;
    while (changed) {
        changed = false;
        for (const [name] of augToFaction) {
            const prereqs = ns.singularity.getAugmentationPrereq(name);
            if (prereqs.some(p => !owned.has(p) && !augToFaction.has(p))) {
                augToFaction.delete(name);
                changed = true;
            }
        }
    }

    // ── Step 3: sort by current price descending ──────────────────────────────
    const entries: AugEntry[] = [...augToFaction.entries()]
        .map(([name, faction]) => ({
            name,
            faction,
            price:   ns.singularity.getAugmentationPrice(name),
            prereqs: ns.singularity.getAugmentationPrereq(name),
        }))
        .sort((a, b) => b.price - a.price);

    // ── Step 4: topological sort (DFS, visiting in price-descending order) ────
    // When we encounter an aug whose prereq hasn't been emitted yet, we emit
    // the prereq first.  Within groups with no ordering constraint the most
    // expensive aug still appears first in the result.
    const entryMap = new Map(entries.map(e => [e.name, e]));
    const result:   AugEntry[] = [];
    const visited = new Set<string>();

    function visit(e: AugEntry): void {
        if (visited.has(e.name)) return;
        visited.add(e.name);
        for (const prereq of e.prereqs) {
            const prereqEntry = entryMap.get(prereq);
            if (prereqEntry) visit(prereqEntry);
        }
        result.push(e);
    }

    for (const entry of entries) visit(entry);

    return result;
}
