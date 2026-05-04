import { NS } from "@ns";

const POLL_INTERVAL = 1000; // ms to wait when funds are short

// ── Types ─────────────────────────────────────────────────────────────────────

type UpgradeType   = "level" | "ram" | "cores" | "cache" | "node";
type UpgradeOption = { node: number; type: UpgradeType; cost: number };

// ── Entry point ───────────────────────────────────────────────────────────────

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(580, 440);

    while (true) {
        ns.clearLog();

        // Buy the very first node if none exist yet
        if (ns.hacknet.numNodes() === 0) {
            const cost = ns.hacknet.getPurchaseNodeCost();
            ns.print(`Waiting to buy first node: $${ns.format.number(cost)}`);
            while (ns.getServerMoneyAvailable("home") < cost) {
                await ns.sleep(POLL_INTERVAL);
            }
            ns.hacknet.purchaseNode();
            continue;
        }

        const best = findBestUpgrade(ns);

        // Poll until we can afford the next upgrade, refreshing the display each tick
        while (ns.getServerMoneyAvailable("home") < best.cost) {
            ns.clearLog();
            printStatus(ns, best);
            await ns.sleep(POLL_INTERVAL);
        }

        ns.clearLog();
        printStatus(ns, best);
        performUpgrade(ns, best);
        await ns.sleep(200);
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** True when nodes are hacknet servers (produce hashes) rather than basic nodes. */
function isHacknetServer(ns: NS): boolean {
    if (ns.hacknet.numNodes() === 0) return false;
    return (ns.hacknet.getNodeStats(0) as any).hashCapacity !== undefined;
}

/**
 * Find the cheapest available upgrade across all nodes.
 * Cache upgrades are only included for hacknet servers (returns Infinity on nodes).
 * A new-node purchase is always included as a candidate.
 */
function findBestUpgrade(ns: NS): UpgradeOption {
    const server  = isHacknetServer(ns);
    const options: UpgradeOption[] = [];

    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        options.push({ node: i, type: "level", cost: ns.hacknet.getLevelUpgradeCost(i) });
        options.push({ node: i, type: "ram",   cost: ns.hacknet.getRamUpgradeCost(i) });
        options.push({ node: i, type: "cores", cost: ns.hacknet.getCoreUpgradeCost(i) });
        if (server) {
            options.push({ node: i, type: "cache", cost: ns.hacknet.getCacheUpgradeCost(i) });
        }
    }
    // Always offer buying a new node as an option
    options.push({ node: -1, type: "node", cost: ns.hacknet.getPurchaseNodeCost() });

    return options
        .filter(o => isFinite(o.cost))
        .reduce((a, b) => a.cost <= b.cost ? a : b);
}

/** Execute the chosen upgrade. */
function performUpgrade(ns: NS, opt: UpgradeOption): void {
    switch (opt.type) {
        case "level":  ns.hacknet.upgradeLevel(opt.node); break;
        case "ram":    ns.hacknet.upgradeRam(opt.node);   break;
        case "cores":  ns.hacknet.upgradeCore(opt.node);  break;
        case "cache":  ns.hacknet.upgradeCache(opt.node); break;
        case "node":   ns.hacknet.purchaseNode();         break;
    }
}

/** Print a status table showing all nodes and the next planned upgrade. */
function printStatus(ns: NS, next: UpgradeOption): void {
    const count  = ns.hacknet.numNodes();
    const server = isHacknetServer(ns);
    const label  = server ? "Hacknet Servers" : "Hacknet Nodes";

    ns.print(`${label}: ${count}`);
    ns.print("─".repeat(60));

    if (server) {
        ns.print(
            "Node              ".padEnd(20) +
            "Lvl".padEnd(5) +
            "RAM".padEnd(8) +
            "Cores".padEnd(7) +
            "Prod/s".padEnd(10) +
            "Capacity"
        );
    } else {
        ns.print(
            "Node              ".padEnd(20) +
            "Lvl".padEnd(5) +
            "RAM".padEnd(8) +
            "Cores".padEnd(7) +
            "$/s"
        );
    }
    ns.print("─".repeat(60));

    let totalProd = 0;
    let totalCap  = 0;

    for (let i = 0; i < count; i++) {
        const stats    = ns.hacknet.getNodeStats(i) as any;
        const cap: number = stats.hashCapacity ?? 0;
        totalProd += stats.production;
        totalCap  += cap;

        const ramStr  = `${stats.ram}GB`;
        const prodStr = ns.format.number(stats.production, 3);

        if (server) {
            ns.print(
                stats.name.padEnd(20) +
                String(stats.level).padEnd(5) +
                ramStr.padEnd(8) +
                String(stats.cores).padEnd(7) +
                (prodStr + "/s").padEnd(10) +
                ns.format.number(cap)
            );
        } else {
            ns.print(
                stats.name.padEnd(20) +
                String(stats.level).padEnd(5) +
                ramStr.padEnd(8) +
                String(stats.cores).padEnd(7) +
                "$" + prodStr + "/s"
            );
        }
    }

    ns.print("─".repeat(60));
    if (server) {
        ns.print(
            `Total: ${ns.format.number(totalProd, 3)}/s` +
            `  |  Capacity: ${ns.format.number(totalCap)}`
        );
    } else {
        ns.print(`Total: $${ns.format.number(totalProd, 3)}/s`);
    }

    const nodeLabel = next.node >= 0
        ? `hacknet-${server ? "server" : "node"}-${next.node}`
        : "new node";
    ns.print(`Next: ${nodeLabel} ${next.type} — $${ns.format.number(next.cost)}`);
    ns.print("─".repeat(60));
}

export function autocomplete(data: any, args: any) {
    return [];
}
