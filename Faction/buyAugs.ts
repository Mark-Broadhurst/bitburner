import { NS, FactionName } from "@ns";

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

interface AugEntry {
    name:    string;
    price:   number;
    faction: FactionName;
    prereqs: string[];
}

function buildBuyList(ns: NS, factions: FactionName[]): AugEntry[] {
    const owned = new Set(ns.singularity.getOwnedAugmentations(true));

    const augToFaction = new Map<string, FactionName>();
    for (const faction of factions) {
        const rep = ns.singularity.getFactionRep(faction);
        for (const aug of ns.singularity.getAugmentationsFromFaction(faction)) {
            if (aug === "NeuroFlux Governor") continue;
            if (owned.has(aug))           continue;
            if (augToFaction.has(aug))    continue;
            if (rep >= ns.singularity.getAugmentationRepReq(aug)) {
                augToFaction.set(aug, faction);
            }
        }
    }

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

    const entries: AugEntry[] = [...augToFaction.entries()]
        .map(([name, faction]) => ({
            name,
            faction,
            price:   ns.singularity.getAugmentationPrice(name),
            prereqs: ns.singularity.getAugmentationPrereq(name),
        }))
        .sort((a, b) => b.price - a.price);

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
