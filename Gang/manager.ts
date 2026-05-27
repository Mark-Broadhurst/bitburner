import { GangGenInfo, GangMemberInfo, GangMemberAscension, NS, GangTaskStats, FactionName } from "@ns";
import { minBy, maxBy } from "Utils/array";

/**
 * Combined gang manager: recruiting, ascension, task assignment,
 * equipment purchases, and territory warfare — all in one nextUpdate() loop.
 */

const MAX_MEMBERS = 12;

const ALL_GANG_NAMES: FactionName[] = [
    "Slum Snakes", "Tetrads", "The Syndicate", "The Dark Army",
    "Speakers for the Dead", "NiteSec", "The Black Hand",
];

// Minimum combat skill before a member does rep/money tasks.
// Kept low while recruiting so members spend most time generating respect.
// Once at max members the higher index kicks in for the warfare phase.
const skillSteps = [0, 0, 0, 25, 25, 50, 50, 75, 75, 100, 100, 150, 500, 1000];

// Minimum charisma required throughout all phases so Vigilante Justice
// is effective at reducing wanted level.
const MIN_CHARISMA = 50;

// Power advantage multiplier before we stop using the Territory Warfare task
// and let members earn money/respect while the clash toggle keeps fighting.
const DOMINATE_THRESHOLD = 1.5;

// Once respect hits this value the equipment discount is saturated enough
// that further respect adds little value — switch everyone to money tasks.
const RESPECT_CAP = 150_000_000;

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(520, 400);

    const ascThreshold = ns.args[0] as number ?? 1.5;

    // Sort equipment by cost once — cheapest first so we equip bottom-up
    const equipmentNames = ns.gang.getEquipmentNames()
        .map(e => ({ name: e, cost: ns.gang.getEquipmentCost(e) }))
        .sort((a, b) => a.cost - b.cost)
        .map(x => x.name);

    while (true) {
        await ns.gang.nextUpdate();
        ns.clearLog();

        const gang    = ns.gang.getGangInformation();
        const members = ns.gang.getMemberNames();

        // ── Recruit ──────────────────────────────────────────────────────────
        if (ns.gang.canRecruitMember()) {
            const name = "gang-" + members.length;
            ns.gang.recruitMember(name);
            members.push(name);
        }

        // Compute strongest enemy once — shared by task selection and warfare toggle.
        const strongest = getStrongestEnemy(ns, gang);

        // Domination: full roster, territory not yet won, and our power is
        // >50% greater than the strongest remaining enemy. Once dominant,
        // members switch to money/respect; the clash toggle keeps fighting.
        const dominates =
            members.length >= MAX_MEMBERS &&
            gang.territory < 1 &&
            (strongest === null || gang.power > strongest.power * DOMINATE_THRESHOLD);

        // ── Status ───────────────────────────────────────────────────────────
        const phase = getPhaseLabel(members.length, gang, dominates);
        ns.print(`Phase: ${phase}   Skill goal: ${skillSteps[Math.min(members.length, skillSteps.length - 1)]}`);
        const ratio = gang.wantedLevel > 0 ? (gang.respect / gang.wantedLevel).toFixed(0) : "∞";
        ns.print(`Respect: ${ns.format.number(gang.respect)}   Wanted: ${ns.format.number(gang.wantedLevel)}   Ratio: ${ratio}x`);

        // ── Ascend / Tasks ────────────────────────────────────────────────────
        for (const name of members) {
            const info = ns.gang.getMemberInformation(name);
            const asc  = ns.gang.getAscensionResult(name) as GangMemberAscension;
            if (asc && (asc.agi > ascThreshold || asc.cha > ascThreshold ||
                        asc.def > ascThreshold || asc.hack > ascThreshold ||
                        asc.str > ascThreshold)) {
                ns.gang.ascendMember(name);
                ns.tprint(`Gang: ascended ${name}`);
            }

            const idx = members.indexOf(name);
            ns.gang.setMemberTask(name, chooseTask(ns, gang, info, members.length, idx, dominates));
        }

        // ── Equipment ─────────────────────────────────────────────────────────
        if (members.length > 0) {
            buyNextEquipment(ns, members, equipmentNames);
        }

        // ── Territory warfare ─────────────────────────────────────────────────
        updateTerritoryWarfare(ns, gang, strongest);

        // ── Footer ───────────────────────────────────────────────────────────
        ns.print(`Territory: ${(gang.territory * 100).toFixed(1)}%   Warfare: ${gang.territoryWarfareEngaged}`);
    }
}

// ---------------------------------------------------------------------------
// Phase label
// ---------------------------------------------------------------------------

function getPhaseLabel(memberCount: number, gang: GangGenInfo, dominates: boolean): string {
    if (memberCount < MAX_MEMBERS)      return `recruiting (${memberCount}/${MAX_MEMBERS})`;
    if (gang.territory >= 1) {
        return gang.respect >= RESPECT_CAP ? "territory won — full money 💵" : "territory won";
    }
    if (dominates)                      return "dominating — earning 💰";
    return "building power ⚔️";
}

// ---------------------------------------------------------------------------
// Task selection
// ---------------------------------------------------------------------------

function chooseTask(
    ns: NS,
    gang: GangGenInfo,
    info: GangMemberInfo,
    memberCount: number,
    idx: number,
    dominates: boolean,
): string {
    const goal       = skillSteps[Math.min(memberCount, skillSteps.length - 1)];
    const recruiting = memberCount < MAX_MEMBERS;

    // Combat training always takes priority
    if (info.str < goal || info.def < goal || info.dex < goal || info.agi < goal)
        return "Train Combat";

    // Minimum charisma floor throughout all phases — needed for Vigilante Justice
    if (info.cha < MIN_CHARISMA)
        return "Train Charisma";

    // Hacking and full charisma training only after territory is fully won
    if (gang.territory >= 1) {
        if (info.hack < goal) return "Train Hacking";
        if (info.cha  < goal) return "Train Charisma";
    }

    // Vigilante Justice when respect/wanted ratio drops below threshold
    if (gang.wantedLevel > 1 && gang.respect / gang.wantedLevel < 50)
        return "Vigilante Justice";

    // ── Recruiting phase: grind respect to unlock the next member slot ────────
    if (recruiting)
        return getBestTask(ns, info, reduceRespect);

    // ── Warfare phase ─────────────────────────────────────────────────────────
    if (gang.territory < 1) {
        // Keep building power until we have a >50% advantage.
        // The clash toggle (setTerritoryWarfare) is managed separately and only
        // enables actual fights once we outpower the strongest enemy.
        if (!dominates) return "Territory Warfare";
        // Dominating: fall through to the money/respect split below so members
        // generate income while the clan keeps fighting in the background.
    }

    // Above the respect cap the equipment discount is saturated — pure money.
    // Below it: 2/3 respect (cheaper equipment), 1/3 money.
    const respectCapped = gang.respect >= RESPECT_CAP;
    return getBestTask(ns, info, respectCapped || idx % 3 === 0 ? reduceMoney : reduceRespect);
}

class TaskData {
    name: string; respect: number; wanted: number; money: number;
    constructor(ns: NS, gang: GangGenInfo, member: GangMemberInfo, task: GangTaskStats) {
        this.name    = task.name;
        this.respect = ns.formulas.gang.respectGain(gang, member, task);
        this.wanted  = ns.formulas.gang.wantedLevelGain(gang, member, task);
        this.money   = ns.formulas.gang.moneyGain(gang, member, task);
    }
}

type ReduceFn = (a: TaskData, b: TaskData) => TaskData;

function getBestTask(ns: NS, info: GangMemberInfo, reduce: ReduceFn): string {
    const gang  = ns.gang.getGangInformation();
    const tasks = ns.gang.getTaskNames()
        .map(t => new TaskData(ns, gang, info, ns.gang.getTaskStats(t)))
        .filter(t => t.wanted <= 0 || (t.respect / t.wanted) > 50);
    if (tasks.length === 0) return "Train Combat";
    return tasks.reduce(reduce).name;
}

function reduceRespect(a: TaskData, b: TaskData): TaskData {
    if (a.respect !== b.respect) return a.respect > b.respect ? a : b;
    if (a.wanted  !== b.wanted)  return a.wanted  < b.wanted  ? a : b;
    return a.money > b.money ? a : b;
}

function reduceMoney(a: TaskData, b: TaskData): TaskData {
    if (a.money   !== b.money)   return a.money   > b.money   ? a : b;
    if (a.respect !== b.respect) return a.respect > b.respect ? a : b;
    return a.wanted < b.wanted ? a : b;
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

function buyNextEquipment(ns: NS, members: string[], equipmentNames: string[]): void {
    // For each member find their cheapest missing item (first in the startup-cost-sorted
    // list that they don't own yet), then pick the globally cheapest across all members.
    // This prevents getting stuck waiting for one member's expensive next item while
    // other members still need cheap items.
    interface Candidate { memberName: string; item: string; cost: number }

    const candidates: Candidate[] = members.flatMap(memberName => {
        const info = ns.gang.getMemberInformation(memberName);
        const next = equipmentNames.find(
            e => !info.upgrades.includes(e) && !info.augmentations.includes(e)
        );
        if (!next) return [];
        return [{ memberName, item: next, cost: ns.gang.getEquipmentCost(next) }];
    });

    if (candidates.length === 0) return;

    const best      = minBy(candidates, c => c.cost);
    const homeMoney = ns.getServerMoneyAvailable("home");
    const minBuffer = Math.max(50e6, best.cost * 2);

    if (homeMoney >= minBuffer) {
        if (ns.gang.purchaseEquipment(best.memberName, best.item)) {
            ns.tprint(`Gang: purchased ${best.item} for ${best.memberName} ($${ns.format.number(best.cost)})`);
        }
    } else {
        ns.print(`Equipment: saving for ${best.item} ($${ns.format.number(best.cost)}) — have $${ns.format.number(homeMoney)} / need $${ns.format.number(minBuffer)}`);
    }
}

// ---------------------------------------------------------------------------
// Territory warfare
// ---------------------------------------------------------------------------

/** Returns the strongest gang with remaining territory, or null if none. */
function getStrongestEnemy(ns: NS, gang: GangGenInfo): { name: string; power: number } | null {
    const otherInfo = ns.gang.getAllGangInformation();
    const enemies   = ALL_GANG_NAMES
        .filter(n => n !== gang.faction && (otherInfo[n]?.territory ?? 0) > 0)
        .map(n => ({ name: n, power: otherInfo[n].power }));
    return enemies.length > 0 ? maxBy(enemies, e => e.power) : null;
}

function updateTerritoryWarfare(
    ns: NS,
    gang: GangGenInfo,
    strongest: { name: string; power: number } | null,
): void {
    // Only engage territory warfare once we have a full roster
    if (gang.territory >= 1 || ns.gang.getMemberNames().length < MAX_MEMBERS) {
        if (gang.territoryWarfareEngaged) ns.gang.setTerritoryWarfare(false);
        return;
    }

    if (strongest === null) {
        if (gang.territoryWarfareEngaged) ns.gang.setTerritoryWarfare(false);
        return;
    }

    const winChance    = gang.power / (gang.power + strongest.power);
    const shouldEngage = gang.power > strongest.power;

    ns.print(`Warfare vs ${strongest.name} (power ${ns.format.number(strongest.power)}): us ${ns.format.number(gang.power)} — ${(winChance * 100).toFixed(1)}% win`);

    if (shouldEngage !== gang.territoryWarfareEngaged) {
        ns.gang.setTerritoryWarfare(shouldEngage);
        ns.tprint(`Gang: territory warfare ${shouldEngage ? "▶ started" : "⏸ paused"} (our power ${ns.format.number(gang.power)} vs ${ns.format.number(strongest.power)})`);
    }
}
