import { NS } from "@ns";

/**
 * Priority-ordered Bladeburner skill loop.
 *
 * Always buys one level of the highest-priority skill we can currently afford.
 * Priority ordering is chosen for early-game efficiency:
 *   - Blade's Intuition raises success chance on everything
 *   - Overclock cuts action time (max level 90)
 *   - Combat/operation skills before money/utility skills
 */

const PRIORITY: string[] = [
    "Blade's Intuition",  // success chance on all actions — highest ROI
    "Overclock",          // -2% action time per level, max 90 — huge efficiency
    "Cloak",              // reduces stamina cost
    "Short-Circuit",      // boosts contract success
    "Digital Observer",   // boosts operation success
    "Evasive System",     // reduces chaos gain rate
    "Tracer",             // tracking / detection bonus
    "Reaper",             // combat stat multiplier
    "Datamancer",         // sharpens population estimates
    "Cyber's Edge",       // HP and stat boosts
    "Hands of Midas",     // money gain — useful once combat is solid
    "Hyperdrive",         // all-around multiplier — best when others are high
];

// Overclock caps at level 90 — don't waste SP on it after that.
const OVERCLOCK_MAX = 90;

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(480, 360);

    while (true) {
        await ns.bladeburner.nextUpdate();
        ns.clearLog();

        const sp = ns.bladeburner.getSkillPoints();

        // Build priority list, filtering out capped skills
        const available = PRIORITY.filter(skill => {
            if (skill === "Overclock" && ns.bladeburner.getSkillLevel("Overclock") >= OVERCLOCK_MAX)
                return false;
            return true;
        });

        // Find the highest-priority skill we can afford
        const target = available.find(skill =>
            sp >= ns.bladeburner.getSkillUpgradeCost(skill)
        );

        if (target) {
            const cost = ns.bladeburner.getSkillUpgradeCost(target);
            ns.bladeburner.upgradeSkill(target);
            const level = ns.bladeburner.getSkillLevel(target);
            ns.tprint(`BB skills: ${target} → ${level} (${cost} SP)`);
        }

        // Status table
        // Marker logic:
        //   ▶  = will be bought next (highest-priority affordable skill)
        //   •  = higher-priority than ▶ but not yet affordable (saving towards)
        //   ⏳  = highest-priority overall when nothing is affordable (saving towards this)
        //   (space) = lower priority, or capped
        const targetIdx = target ? available.indexOf(target) : -1;
        // When nothing is affordable, mark the highest-priority available skill with ⏳
        const savingFor = target == null ? available[0] ?? null : null;

        ns.print(`SP: ${sp}`);
        ns.print("─".repeat(50));
        ns.print(`${"Skill".padEnd(26)} ${"Lvl".padStart(4)}  ${"Next cost".padStart(10)}  `);
        ns.print("─".repeat(50));
        for (const skill of PRIORITY) {
            const level  = ns.bladeburner.getSkillLevel(skill);
            const cost   = ns.bladeburner.getSkillUpgradeCost(skill);
            const capped = skill === "Overclock" && level >= OVERCLOCK_MAX;
            const idx    = available.indexOf(skill);

            let marker: string;
            if (capped) {
                marker = " ";
            } else if (skill === target) {
                marker = "▶";
            } else if (savingFor !== null && skill === savingFor) {
                marker = "⏳";
            } else if (target !== null && idx !== -1 && idx < targetIdx) {
                // Higher priority than current target but can't afford yet
                marker = "•";
            } else {
                marker = " ";
            }

            const costStr = capped ? "    MAX   " : `${String(cost).padStart(7)} SP`;
            const afford  = !capped && cost <= sp ? "✅" : "  ";
            ns.print(`${marker} ${skill.padEnd(26)} ${String(level).padStart(4)}  ${costStr}  ${afford}`);
        }
    }
}
