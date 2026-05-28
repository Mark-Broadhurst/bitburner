import { NS, BladeburnerSkillName } from "@ns";

const SKILLS: BladeburnerSkillName[] = [
    "Blade's Intuition",
    "Overclock",
    "Cloak",
    "Short-Circuit",
    "Digital Observer",
    "Evasive System",
    "Tracer",
    "Reaper",
    "Datamancer",
    "Cyber's Edge",
    "Hands of Midas",
    "Hyperdrive",
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

function selectSkill(ns: NS, sp: number, overclockMaxed: boolean): BladeburnerSkillName | null {
    if (!overclockMaxed) {
        const ocCost = ns.bladeburner.getSkillUpgradeCost("Overclock");
        if (sp >= ocCost) return "Overclock";
        const biCost = ns.bladeburner.getSkillUpgradeCost("Blade's Intuition");
        if (sp >= biCost) return "Blade's Intuition";
        return null;
    }

    const candidates = SKILLS
        .filter(s => s !== "Overclock")
        .map(s => ({
            s,
            level: ns.bladeburner.getSkillLevel(s),
            cost:  ns.bladeburner.getSkillUpgradeCost(s),
        }))
        .filter(c => sp >= c.cost)
        .sort((a, b) => a.level - b.level);

    return candidates[0]?.s ?? null;
}

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
            marker = "▶";
        } else if (capped) {
            marker = "✔";
        } else if (!overclockMaxed) {
            if (skill === "Overclock") marker = "⏳";
            else if (skill === "Blade's Intuition") marker = "•";
            else marker = " ";
        } else {
            marker = " ";
        }

        const costStr = capped ? "    MAX   " : `${String(cost).padStart(7)} SP`;
        const afford  = !capped && cost <= sp ? "✅" : "  ";
        ns.print(`${marker} ${skill.padEnd(26)} ${String(level).padStart(4)}  ${costStr}  ${afford}`);
    }
}
