import { NS, FactionName, FactionWorkType } from "@ns";
import { getBestField } from "Faction/factionWork";
import { FactionWork, FactionsWithAugs } from "Utils/factions";

const NEUROFLUX = "NeuroFlux Governor";

type AugTarget = {
    aug:         string;
    faction:     FactionName;
    repRequired: number;
    repHave:     number;
    repNeeded:   number;
};

// ── Entry point ───────────────────────────────────────────────────────────────

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(700, 600);

    // Optional faction filter: run "workForAugs.js Faction1 Faction2" to limit scope
    const filterFactions: FactionName[] | null = ns.args.length > 0
        ? ns.args.map(a => a as FactionName)
        : null;

    while (true) {
        ns.clearLog();

        const targets = buildTargetList(ns, filterFactions);

        if (targets.length === 0) break;

        // Pick the aug that needs the least additional rep to unlock
        const next = targets.find(t => t.repNeeded > 0);
        if (!next) break; // All thresholds already met — just buy them

        const workType = pickWorkType(ns, next.faction);
        ns.singularity.workForFaction(next.faction, workType);

        // Wait until the faction rep crosses the threshold
        while (ns.singularity.getFactionRep(next.faction) < next.repRequired) {
            ns.clearLog();
            printStatus(ns, next, targets, workType);
            await ns.sleep(1000);
        }

        ns.print(`✅ Unlocked: ${next.aug} (${next.faction})`);
        await ns.sleep(200);
    }

    ns.singularity.stopAction();
    ns.tprint("✅ All faction augments unlocked.");
    ns.ui.closeTail();
}

// ── Core logic ────────────────────────────────────────────────────────────────

/**
 * Build the list of unowned augments across all eligible joined factions.
 * Each aug is assigned to the faction where the least extra rep is needed
 * (i.e. the one where the player already has the most rep), so we minimise
 * total grinding.  Sorted by repNeeded ascending so we always tackle the
 * cheapest unlock first.
 */
function buildTargetList(ns: NS, filterFactions: FactionName[] | null): AugTarget[] {
    const ownedAugs  = ns.singularity.getOwnedAugmentations(true);
    const candidates = FactionsWithAugs(ns);

    // aug name → best AugTarget seen so far (lowest repNeeded)
    const augMap = new Map<string, AugTarget>();

    for (const faction of candidates) {
        if (filterFactions && !filterFactions.includes(faction)) continue;

        const factionRep = ns.singularity.getFactionRep(faction);
        const augs       = ns.singularity.getAugmentationsFromFaction(faction)
            .filter(aug => aug !== NEUROFLUX && !ownedAugs.includes(aug));

        for (const aug of augs) {
            const repRequired = ns.singularity.getAugmentationRepReq(aug);
            const repNeeded   = Math.max(0, repRequired - factionRep);

            const existing = augMap.get(aug);
            // Prefer the faction that needs the least additional rep
            if (!existing || repNeeded < existing.repNeeded) {
                augMap.set(aug, { aug, faction, repRequired, repHave: factionRep, repNeeded });
            }
        }
    }

    return [...augMap.values()]
        .sort((a, b) => a.repNeeded - b.repNeeded || a.repRequired - b.repRequired);
}

/**
 * Pick the work type that produces the best rep gain for the faction.
 * Uses Formulas.exe when available; otherwise falls back to a priority order.
 */
function pickWorkType(ns: NS, faction: FactionName): FactionWorkType {
    const types = FactionWork(ns).find(fw => fw.faction === faction)?.work ?? [];
    if (types.length === 0) return ns.enums.FactionWorkType.hacking;

    if (ns.fileExists("Formulas.exe", "home")) {
        try {
            return getBestField(ns, faction, ns.getPlayer());
        } catch {
            // Fall through to priority fallback
        }
    }

    // Fallback priority: hacking > field > security
    const priority = [
        ns.enums.FactionWorkType.hacking,
        ns.enums.FactionWorkType.field,
        ns.enums.FactionWorkType.security,
    ];
    for (const p of priority) {
        if (types.includes(p)) return p;
    }
    return types[0];
}

// ── Display ───────────────────────────────────────────────────────────────────

function printStatus(
    ns:       NS,
    active:   AugTarget,
    all:      AugTarget[],
    workType: FactionWorkType,
): void {
    const rep     = ns.singularity.getFactionRep(active.faction);
    const repStr  = ns.format.number(rep);
    const needStr = ns.format.number(active.repRequired);
    const pct     = Math.min(100, (rep / active.repRequired) * 100).toFixed(1);

    ns.print(`Working:  ${active.faction}  [${workType}]`);
    ns.print(`Target:   ${active.aug}`);
    ns.print(`Rep:      ${repStr} / ${needStr}  (${pct}%)`);
    ns.print("─".repeat(68));
    ns.print("  " + "Faction".padEnd(26) + "Augment".padEnd(32) + "Rep needed");
    ns.print("─".repeat(68));

    for (const t of all) {
        const icon = t.repNeeded === 0 ? "✅" : "⏳";
        const fStr = t.faction.slice(0, 24).padEnd(26);
        const aStr = t.aug.slice(0, 30).padEnd(32);
        const rStr = t.repNeeded === 0 ? "unlocked" : ns.format.number(t.repNeeded);
        ns.print(`${icon} ${fStr}${aStr}${rStr}`);
    }

    ns.print("─".repeat(68));
    const unlocked = all.filter(t => t.repNeeded === 0).length;
    ns.print(`Unlocked: ${unlocked} / ${all.length}  |  Remaining: ${all.length - unlocked}`);
}
