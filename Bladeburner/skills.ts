import { NS, BladeburnerSkillName } from "@ns";

/**
 * Two-phase Bladeburner skill loop:
 *
 * Phase 1 — Overclock is not maxed (cap 90):
 *   Buy Overclock whenever we can afford it.
 *   While saving for Overclock, spend spare SP on Blade's Intuition
 *   to keep success chances healthy.
 *
 * Phase 2 — Overclock maxed:
 *   Equal allocation — always buy the skill with the lowest current level
 *   that we can afford, so all skills rise together.
 */

const SKILLS: BladeburnerSkillName[] = [
    "Blade's Intuition",  // success chance on all actions
    "Overclock",          // -2% action time per level, max 90
    "Cloak",              // stamina cost reduction
    "Short-Circuit",      // contract success
    "Digital Observer",   // operation success
    "Evasive System",     // chaos gain rate reduction
    "Tracer",             // tracking bonus
    "Reaper",             // combat stat multiplier
    "Datamancer",         // population estimate accuracy
    "Cyber's Edge",       // HP and stat boosts
    "Hands of Midas",     // money gain
    "Hyperdrive",         // all-around multiplier
];

const OVERCLOCK_MAX = 90;

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(500, 420);

    while (true) {
        await ns.bladeburner.nextUpdate();
        ns.clearLog();

        const sp             = ns.bladeburner.getSkillPoints();
        const overclockLevel = ns.bladeburner.getSkillLevel("Overclock");
        const overclockMaxed = overclockLevel >= OVERCLOCK_MAX;

        const target = selectSkill(ns, sp, overclockMaxed);

        if (target) {
            const cost = ns.bladeburner.getSkillUpgradeCost(target);
            ns.bladeburner.upgradeSkill(target);
            const level = ns.bladeburner.getSkillLevel(target);
            ns.tprint(`BB skills: ${target} → ${level} (${cost} SP)`);
        }

        printStatus(ns, sp, overclockMaxed, target);
    }
}

// ---------------------------------------------------------------------------
// Skill selection
// ---------------------------------------------------------------------------

function selectSkill(ns: NS, sp: number, overclockMaxed: boolean): BladeburnerSkillName | null {
    if (!overclockMaxed) {
        // Phase 1: Overclock is the priority
        const ocCost = ns.bladeburner.getSkillUpgradeCost("Overclock");
        if (sp >= ocCost) return "Overclock";
        // Can't afford Overclock — top up Blade's Intuition in the meantime
        const biCost = ns.bladeburner.getSkillUpgradeCost("Blade's Intuition");
        if (sp >= biCost) return "Blade's Intuition";
        return null;
    }

    // Phase 2: equal allocation — lowest-level affordable skill wins
    const candidates = SKILLS
        .filter(s => s !== "Overclock")          // already capped
        .map(s => ({
            s,
            level: ns.bladeburner.getSkillLevel(s),
            cost:  ns.bladeburner.getSkillUpgradeCost(s),
        }))
        .filter(c => sp >= c.cost)
        .sort((a, b) => a.level - b.level);      // lowest level first

    return candidates[0]?.s ?? null;
}

// ---------------------------------------------------------------------------
// Status display
// ---------------------------------------------------------------------------

function printStatus(
    ns: NS,
    sp: number,
    overclockMaxed: boolean,
    target: BladeburnerSkillName | null,
): void {
    const phase = overclockMaxed ? "Phase 2: equal allocation" : "Phase 1: maxing Overclock";
    ns.print(`SP: ${sp}   [${phase}]`);
    ns.print("─".repeat(54));
    ns.print(`${"Skill".padEnd(26)} ${"Lvl".padStart(4)}  ${"Next cost".padStart(10)}  `);
    ns.print("─".repeat(54));

    for (const skill of SKILLS) {
        const level  = ns.bladeburner.getSkillLevel(skill);
        const cost   = ns.bladeburner.getSkillUpgradeCost(skill);
        const capped = skill === "Overclock" && level >= OVERCLOCK_MAX;

        let marker: string;
        if (skill === target) {
            marker = "▶";                          // buying this tick
        } else if (capped) {
            marker = "✔";                          // done
        } else if (!overclockMaxed) {
            // Phase 1: highlight what we're saving for
            if (skill === "Overclock") marker = "⏳";           // primary goal
            else if (skill === "Blade's Intuition") marker = "•"; // secondary
            else marker = " ";
        } else {
            // Phase 2: all active skills show equal priority
            marker = " ";
        }

        const costStr = capped ? "    MAX   " : `${String(cost).padStart(7)} SP`;
        const afford  = !capped && cost <= sp ? "✅" : "  ";
        ns.print(`${marker} ${skill.padEnd(26)} ${String(level).padStart(4)}  ${costStr}  ${afford}`);
    }
}
