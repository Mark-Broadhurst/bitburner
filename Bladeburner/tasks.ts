import { CityName, NS, BladeburnerActionName, BladeburnerActionType, BladeburnerContractName, BladeburnerOperationName } from "@ns";
import { BladeburnerAction } from "Bladeburner/enums";

const CITIES = (ns: NS): CityName[] => {
    const C = ns.enums.CityName;
    return [C.Sector12, C.Aevum, C.Volhaven, C.Chongqing, C.NewTokyo, C.Ishima];
};

const LOW_STAMINA  = 0.45; // enter rest below this
const HIGH_STAMINA = 0.55; // exit rest above this
const CHAOS_THRESHOLD = 50;

// An action is eligible only when BOTH bounds pass:
//   min (low estimate)  >= MIN_LOW  — we expect at least 80 % success
//   max (high estimate) >= MIN_HIGH — the upper bound has reached 100 %
const MIN_LOW  = 0.80;
const MIN_HIGH = 1.00;

type ActionSpec = [BladeburnerActionType, BladeburnerActionName];

let resting = false;

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(580, 560);

    while (true) {
        const player  = ns.getPlayer();
        const stamina = getStaminaPct(ns);

        if (!resting && stamina < LOW_STAMINA)  resting = true;
        if ( resting && stamina >= HIGH_STAMINA) resting = false;

        const hpLow  = player.hp.current < player.hp.max;
        const action = selectAction(ns, resting, hpLow);

        ns.clearLog();
        printStatus(ns, stamina, hpLow, action);

        await startAction(ns, action);
        await ns.sleep(100); // safety floor — prevents spinning if startAction returns early
    }
}

// ---------------------------------------------------------------------------
// Action selection
// Priority: HP recovery > Black Op > Operation > Contract > General
// When stamina is low we skip combat actions and fall through to General.
// ---------------------------------------------------------------------------

function selectAction(ns: NS, rest: boolean, hpLow: boolean): ActionSpec {
    // HP always wins — recover before anything else
    if (hpLow) return BladeburnerAction.HyperbolicRegenerationChamber;

    if (!rest) {
        return getBlackOp(ns)   ??
               getOperation(ns) ??
               getContract(ns)  ??
               selectFreeAction(ns);
    }
    // Stamina low — skip combat, do general tasks
    return selectFreeAction(ns);
}

function selectFreeAction(ns: NS): ActionSpec {
    const BB = ns.enums.BladeburnerActionType;
    let actionsLeft = 0;
    let eligibleLeft = 0;

    for (const name of ns.bladeburner.getContractNames()) {
        const count = ns.bladeburner.getActionCountRemaining(BB.Contract, name);
        actionsLeft += count;
        if (count > 0) {
            const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance(BB.Contract, name);
            if (min >= MIN_LOW && max >= MIN_HIGH) eligibleLeft += count;
        }
    }
    for (const name of ns.bladeburner.getOperationNames()) {
        const count = ns.bladeburner.getActionCountRemaining(BB.Operation, name);
        actionsLeft += count;
        if (count > 0) {
            const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance(BB.Operation, name);
            if (min >= MIN_LOW && max >= MIN_HIGH) eligibleLeft += count;
        }
    }

    // No uses remaining at all — generate more
    if (actionsLeft === 0) return BladeburnerAction.InciteViolence;

    // Actions exist but none are eligible — chaos is suppressing success rates.
    // Diplomacy lowers chaos which directly raises the low success estimate,
    // so always prefer it over Field Analysis when we're waiting on thresholds.
    const cities    = CITIES(ns);
    const worstCity = [...cities].sort((a, b) =>
        ns.bladeburner.getCityChaos(b) - ns.bladeburner.getCityChaos(a))[0];
    const worstChaos = ns.bladeburner.getCityChaos(worstCity);

    if (eligibleLeft === 0 && worstChaos > 0) return BladeburnerAction.Diplomacy;

    // Eligible actions exist — still do Diplomacy if chaos is very high,
    // otherwise Field Analysis to sharpen population estimates.
    if (worstChaos > CHAOS_THRESHOLD) return BladeburnerAction.Diplomacy;

    return BladeburnerAction.FieldAnalysis;
}

// ---------------------------------------------------------------------------
// Status display
// ---------------------------------------------------------------------------

function printStatus(ns: NS, stamina: number, hpLow: boolean, selected: ActionSpec): void {
    const player  = ns.getPlayer();
    const rank    = ns.bladeburner.getRank();
    const BB      = ns.enums.BladeburnerActionType;
    const [selType, selName] = selected;

    // Header
    const stBar = `${ns.format.percent(stamina)} ${resting ? "💤" : "⚔️ "}`;
    ns.print(`Stamina ${stBar}  HP ${player.hp.current}/${player.hp.max}${hpLow ? " 🩹" : ""}  Rank ${ns.format.number(rank)}`);
    ns.print(`→ ${selName}`);
    ns.print("─".repeat(60));

    // Black Op
    ns.print("BLACK OP");
    const nextOp = ns.bladeburner.getNextBlackOp();
    if (nextOp === null) {
        ns.print("  All Black Ops complete 🏆");
    } else {
        const curRank = ns.bladeburner.getRank();
        const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance(BB.BlackOp, nextOp.name);
        const rankOk    = curRank >= nextOp.rank;
        const chanceOk  = min >= MIN_LOW;
        const eligible  = rankOk && chanceOk;
        const marker    = selType === BB.BlackOp && selName === nextOp.name ? "▶" : " ";
        const rankStr   = rankOk ? "✅" : `⏳ need ${ns.format.number(nextOp.rank)}`;
        const chanceStr = `${ns.format.percent(min)}–${ns.format.percent(max)} ${chanceOk ? "✅" : "⏳"}`;
        const blocker   = eligible ? "" : !rankOk ? " (rank)" : " (chance)";
        ns.print(`${marker} ${nextOp.name.padEnd(34)} rank ${rankStr}  ${chanceStr}${blocker}`);
    }

    // Operations
    ns.print("OPERATIONS");
    for (const name of ns.bladeburner.getOperationNames()) {
        printAction(ns, BB.Operation, name, selType, selName);
    }

    // Contracts
    ns.print("CONTRACTS");
    for (const name of ns.bladeburner.getContractNames()) {
        printAction(ns, BB.Contract, name, selType, selName);
    }

    // Footer
    ns.print("─".repeat(60));
    let actionsLeft = 0;
    for (const c of ns.bladeburner.getContractNames())
        actionsLeft += ns.bladeburner.getActionCountRemaining(BB.Contract, c);
    for (const o of ns.bladeburner.getOperationNames())
        actionsLeft += ns.bladeburner.getActionCountRemaining(BB.Operation, o);
    const chaos = CITIES(ns).map(c => `${c.slice(0, 3)} ${ns.bladeburner.getCityChaos(c).toFixed(0)}`).join("  ");
    ns.print(`Actions left: ${actionsLeft}   Chaos: ${chaos}`);
}

function printAction(
    ns: NS,
    type: BladeburnerActionType,
    name: BladeburnerActionName,
    selType: BladeburnerActionType,
    selName: BladeburnerActionName,
): void {
    const count      = ns.bladeburner.getActionCountRemaining(type, name);
    const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance(type, name);
    const selected   = type === selType && name === selName;
    const eligible   = min >= MIN_LOW && max >= MIN_HIGH;
    const marker     = selected ? "▶" : " ";
    const countStr   = `×${count.toString().padStart(4)}`;
    const chanceStr  = `${ns.format.percent(min).padStart(4)}–${ns.format.percent(max).padStart(4)}`;
    const statusIcon = count === 0 ? "✖" : eligible ? "✅" : "⏳";
    ns.print(`${marker} ${name.padEnd(34)} ${countStr}  ${chanceStr} ${statusIcon}`);
}

// ---------------------------------------------------------------------------
// Action runner
// ---------------------------------------------------------------------------

async function startAction(ns: NS, [type, action]: ActionSpec): Promise<void> {
    // Switch city for city-sensitive actions
    if (action === "Diplomacy") {
        const worst = [...CITIES(ns)].sort((a, b) =>
            ns.bladeburner.getCityChaos(b) - ns.bladeburner.getCityChaos(a))[0];
        ns.bladeburner.switchCity(worst);
    }
    if (action === "Field Analysis") {
        const best = [...CITIES(ns)].sort((a, b) =>
            ns.bladeburner.getCityCommunities(b) - ns.bladeburner.getCityCommunities(a))[0];
        ns.bladeburner.switchCity(best);
    }
    if (action === "Raid") {
        // Switch to the city with the most Synthoid communities — more = more effective,
        // but Raid still works (just less so) when communities are 0.
        const best = [...CITIES(ns)].sort((a, b) =>
            ns.bladeburner.getCityCommunities(b) - ns.bladeburner.getCityCommunities(a))[0];
        ns.bladeburner.switchCity(best);
    }

    const started = ns.bladeburner.startAction(type, action);
    if (!started) {
        // Action failed to start (count ran out, rank insufficient, etc.)
        await ns.sleep(1000);
        return;
    }
    // Poll until the action is no longer current. Using sleep-based polling
    // rather than nextUpdate() avoids any edge case where nextUpdate resolves
    // immediately (e.g. idle state, race condition) which would spin the loop.
    while (true) {
        await ns.sleep(250);
        const cur = ns.bladeburner.getCurrentAction();
        if (!cur || cur.type !== type || cur.name !== action) break;
    }
}

// ---------------------------------------------------------------------------
// Candidate finders — require min >= MIN_LOW and max >= MIN_HIGH
// Within a tier, pick the action with the highest min (most confident)
// ---------------------------------------------------------------------------

function getBlackOp(ns: NS): ActionSpec | null {
    const BB   = ns.enums.BladeburnerActionType;
    const next = ns.bladeburner.getNextBlackOp();
    if (!next) return null;
    // Each Black Op has exactly one use and must be done in order;
    // getNextBlackOp() already skips completed ones.
    if (ns.bladeburner.getRank() < next.rank) return null;
    // Black Ops are one-shot milestones — only require min >= MIN_LOW.
    // We do NOT require max >= MIN_HIGH because Black Op estimates rarely reach
    // 100%; using that check would silently suppress them even when rank is met.
    const [min] = ns.bladeburner.getActionEstimatedSuccessChance(BB.BlackOp, next.name);
    if (min < MIN_LOW) return null;
    return [BB.BlackOp, next.name];
}

function getOperation(ns: NS): ActionSpec | null {
    return getBestEligible(ns, ns.enums.BladeburnerActionType.Operation,
        ns.bladeburner.getOperationNames());
}

function getContract(ns: NS): ActionSpec | null {
    return getBestEligible(ns, ns.enums.BladeburnerActionType.Contract,
        ns.bladeburner.getContractNames());
}

function getBestEligible<T extends BladeburnerContractName | BladeburnerOperationName>(
    ns: NS, type: BladeburnerActionType, list: T[],
): [BladeburnerActionType, T] | null {
    const candidates = list
        .map(name => {
            const count      = ns.bladeburner.getActionCountRemaining(type, name);
            const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance(type, name);
            return { name, count, min, max };
        })
        .filter(c => c.count > 0 && c.min >= MIN_LOW && c.max >= MIN_HIGH)
        .sort((a, b) => a.min - b.min);   // lowest min first = hardest eligible action (more rank)
    return candidates.length > 0 ? [type, candidates[0].name] : null;
}

function getStaminaPct(ns: NS): number {
    const [cur, max] = ns.bladeburner.getStamina();
    return cur / max;
}
