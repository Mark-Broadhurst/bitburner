import { NS, HacknetServerHashUpgrade } from "@ns";
import { getTargetServers } from "Utils/network";

const MONEY_THRESHOLD  = 5_000_000; // $5m — sell hashes for cash below this
const OVERFLOW_BUFFER  = 40;        // sell if within this many hashes of capacity
const MAX_SERVER_MONEY = 1e13;      // don't waste hashes on already-massive servers

// ── Types ─────────────────────────────────────────────────────────────────────

type HashAction = {
    name:    HacknetServerHashUpgrade;
    target?: string;             // hostname for server-targeted upgrades
    cost:    number;             // current hash cost for one purchase
};

// ── Entry point ───────────────────────────────────────────────────────────────

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(540, 380);

    while (true) {
        ns.clearLog();

        // Always prevent hash overflow regardless of phase
        handleOverflow(ns);

        const homeMoney = ns.getServerMoneyAvailable("home");

        if (homeMoney < MONEY_THRESHOLD) {
            // ── Phase 1: sell hashes for cash until $5m ───────────────────
            const cost = ns.hacknet.hashCost("Sell for Money");
            ns.print(`💰 Bootstrap — $${ns.format.number(homeMoney)} / $${ns.format.number(MONEY_THRESHOLD)}`);
            ns.print(`   Hashes: ${Math.floor(ns.hacknet.numHashes())} / ${getTotalHashCapacity(ns)}`);
            if (ns.hacknet.numHashes() >= cost) {
                ns.hacknet.spendHashes("Sell for Money");
            }
        } else {
            // ── Phase 2: spend on improvements as hashes accumulate ───────
            const actions = buildActions(ns);
            if (actions.length === 0) {
                ns.print("⚠ No hash actions available.");
            } else {
                const best = actions.reduce((a, b) => a.cost <= b.cost ? a : b);
                printStatus(ns, actions, best);
                if (ns.hacknet.numHashes() >= best.cost) {
                    ns.hacknet.spendHashes(best.name, best.target ?? "home");
                }
            }
        }

        await ns.sleep(200);
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build the list of available spend actions based on current game state.
 * The cheapest action will be executed each cycle — ordering within equal cost
 * doesn't matter since they'll each get their turn naturally.
 */
function buildActions(ns: NS): HashAction[] {
    const actions: HashAction[] = [];

    // 1. Studying + gym — always available
    actions.push({ name: "Improve Studying",     cost: ns.hacknet.hashCost("Improve Studying") });
    actions.push({ name: "Improve Gym Training", cost: ns.hacknet.hashCost("Improve Gym Training") });

    // 2. Server improvements — boost best hacking targets
    const servers = getTargetServers(ns)
        .filter(s => s.moneyMax!       <= MAX_SERVER_MONEY)
        .filter(s => s.minDifficulty!  >= 1);

    if (servers.length > 0) {
        // Reduce security on the server with the highest minimum difficulty
        const secTarget = [...servers]
            .sort((a, b) => b.minDifficulty! - a.minDifficulty!)[0];
        actions.push({
            name:   "Reduce Minimum Security",
            target: secTarget.hostname,
            cost:   ns.hacknet.hashCost("Reduce Minimum Security"),
        });

        // Raise max money on the highest-value target
        const moneyTarget = [...servers]
            .sort((a, b) => b.moneyMax! - a.moneyMax!)[0];
        actions.push({
            name:   "Increase Maximum Money",
            target: moneyTarget.hostname,
            cost:   ns.hacknet.hashCost("Increase Maximum Money"),
        });
    }

    // 3. Bladeburners — rank and skill points
    if (ns.getPlayer().factions.includes("Bladeburners")) {
        actions.push({ name: "Exchange for Bladeburner Rank", cost: ns.hacknet.hashCost("Exchange for Bladeburner Rank") });
        actions.push({ name: "Exchange for Bladeburner SP",   cost: ns.hacknet.hashCost("Exchange for Bladeburner SP") });
    }

    // 4. Corporation — funds and research
    if (ns.corporation.hasCorporation()) {
        actions.push({ name: "Sell for Corporation Funds",        cost: ns.hacknet.hashCost("Sell for Corporation Funds") });
        actions.push({ name: "Exchange for Corporation Research",  cost: ns.hacknet.hashCost("Exchange for Corporation Research") });
    }

    return actions;
}

/**
 * Sell hashes when we're close to capacity so nothing is wasted.
 * Sells enough to absorb at least one full tick of production.
 * No-op for hacknet nodes (they produce money, not hashes).
 */
function handleOverflow(ns: NS): void {
    const capacity = getTotalHashCapacity(ns);
    if (capacity === 0) return;
    if (ns.hacknet.numHashes() >= capacity - OVERFLOW_BUFFER) {
        const production = getTotalHashProduction(ns);
        const sellCount  = Math.max(1, Math.floor(production / 4) + 1);
        ns.hacknet.spendHashes("Sell for Money", "home", sellCount);
    }
}

/** Sum of hashCapacity across all hacknet servers (0 for hacknet nodes). */
function getTotalHashCapacity(ns: NS): number {
    let total = 0;
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        total += (ns.hacknet.getNodeStats(i) as any).hashCapacity ?? 0;
    }
    return total;
}

/** Sum of hash production per second across all hacknet servers. */
function getTotalHashProduction(ns: NS): number {
    let total = 0;
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        total += ns.hacknet.getNodeStats(i).production;
    }
    return total;
}

/** Print status table: current hashes, all actions and their costs. */
function printStatus(ns: NS, actions: HashAction[], next: HashAction): void {
    const hashes   = Math.floor(ns.hacknet.numHashes());
    const capacity = getTotalHashCapacity(ns);
    const prodRate = getTotalHashProduction(ns);

    ns.print(`Hashes: ${hashes} / ${capacity}  (+${ns.format.number(prodRate, 2)}/s)`);
    ns.print("─".repeat(56));

    for (const a of actions) {
        const isNext    = a === next;
        const canAfford = hashes >= a.cost;
        const marker    = isNext ? "▶" : " ";
        const icon      = canAfford ? "✅" : "⏳";
        const label     = a.target ? `${a.name} → ${a.target}` : a.name;
        ns.print(`${marker} ${icon} ${label.padEnd(40)} ${a.cost}`);
    }

    ns.print("─".repeat(56));
}

export function autocomplete(data: any, args: any) {
    return [];
}
