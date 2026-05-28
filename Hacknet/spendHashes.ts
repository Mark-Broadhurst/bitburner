import { NS, HacknetServerHashUpgrade, CompanyName } from "@ns";
import { minBy } from "Utils/array";
import { getTargetServers } from "Utils/network";

const MONEY_THRESHOLD  = 5_000_000;
const OVERFLOW_BUFFER  = 40;
const MAX_SERVER_MONEY = 1e13;
const FAVOR_CAP = 150;

type HashAction = {
    name:    HacknetServerHashUpgrade;
    target?: string;
    cost:    number;
};

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(540, 380);

    while (true) {
        ns.clearLog();

        handleOverflow(ns);

        const homeMoney = ns.getServerMoneyAvailable("home");

        if (homeMoney < MONEY_THRESHOLD) {
            const cost = ns.hacknet.hashCost("Sell for Money");
            ns.print(`💰 Bootstrap — $${ns.format.number(homeMoney)} / $${ns.format.number(MONEY_THRESHOLD)}`);
            ns.print(`   Hashes: ${Math.floor(ns.hacknet.numHashes())} / ${getTotalHashCapacity(ns)}`);
            if (ns.hacknet.numHashes() >= cost) {
                ns.hacknet.spendHashes("Sell for Money");
            }
        } else {
            const actions = buildActions(ns);
            if (actions.length === 0) {
                ns.print("⚠ No hash actions available.");
            } else {
                const best     = minBy(actions, a => a.cost);
                const capacity = getTotalHashCapacity(ns);
                printStatus(ns, actions, best);

                if (ns.hacknet.numHashes() >= best.cost) {
                    ns.hacknet.spendHashes(best.name, best.target ?? "home");
                    if (best.name === "Generate Coding Contract") {
                        await ns.sleep(500);
                        ns.run("CodingContract/solve.js");
                    }
                } else if (capacity > 0 && best.cost > capacity) {
                    ns.hacknet.spendHashes("Sell for Money");
                }
            }
        }

        await ns.sleep(200);
    }
}

function buildActions(ns: NS): HashAction[] {
    const actions: HashAction[] = [];

    actions.push({ name: "Improve Studying",        cost: ns.hacknet.hashCost("Improve Studying") });
    actions.push({ name: "Improve Gym Training",    cost: ns.hacknet.hashCost("Improve Gym Training") });
    actions.push({ name: "Generate Coding Contract", cost: ns.hacknet.hashCost("Generate Coding Contract") });

    const companyTarget = (Object.values(ns.enums.CompanyName) as CompanyName[])
        .map(c => ({ name: c, favor: ns.singularity.getCompanyFavor(c) }))
        .filter(c => c.favor > 0 && c.favor < FAVOR_CAP)
        .sort((a, b) => b.favor - a.favor)[0];
    if (companyTarget)
        actions.push({ name: "Company Favor", target: companyTarget.name, cost: ns.hacknet.hashCost("Company Favor") });

    const servers = getTargetServers(ns)
        .filter(s => s.moneyMax!       <= MAX_SERVER_MONEY)
        .filter(s => s.minDifficulty!  >= 1);

    if (servers.length > 0) {
        const secTarget = [...servers]
            .sort((a, b) => b.minDifficulty! - a.minDifficulty!)[0];
        actions.push({
            name:   "Reduce Minimum Security",
            target: secTarget.hostname,
            cost:   ns.hacknet.hashCost("Reduce Minimum Security"),
        });

        const moneyTarget = [...servers]
            .sort((a, b) => b.moneyMax! - a.moneyMax!)[0];
        actions.push({
            name:   "Increase Maximum Money",
            target: moneyTarget.hostname,
            cost:   ns.hacknet.hashCost("Increase Maximum Money"),
        });
    }

    if (ns.getPlayer().factions.includes("Bladeburners")) {
        actions.push({ name: "Exchange for Bladeburner Rank", cost: ns.hacknet.hashCost("Exchange for Bladeburner Rank") });
        actions.push({ name: "Exchange for Bladeburner SP",   cost: ns.hacknet.hashCost("Exchange for Bladeburner SP") });
    }

    if (ns.corporation.hasCorporation()) {
        actions.push({ name: "Sell for Corporation Funds",        cost: ns.hacknet.hashCost("Sell for Corporation Funds") });
        actions.push({ name: "Exchange for Corporation Research",  cost: ns.hacknet.hashCost("Exchange for Corporation Research") });
    }

    return actions;
}

function handleOverflow(ns: NS): void {
    const capacity = getTotalHashCapacity(ns);
    if (capacity === 0) return;
    if (ns.hacknet.numHashes() >= capacity - OVERFLOW_BUFFER) {
        const production = getTotalHashProduction(ns);
        const sellCount  = Math.max(1, Math.floor(production / 4) + 1);
        ns.hacknet.spendHashes("Sell for Money", "home", sellCount);
    }
}

function getTotalHashCapacity(ns: NS): number {
    let total = 0;
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        total += (ns.hacknet.getNodeStats(i) as any).hashCapacity ?? 0;
    }
    return total;
}

function getTotalHashProduction(ns: NS): number {
    let total = 0;
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        total += ns.hacknet.getNodeStats(i).production;
    }
    return total;
}

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
