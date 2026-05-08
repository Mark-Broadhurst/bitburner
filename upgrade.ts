import { NS, Server } from "@ns";

/**
 * Unified upgrade daemon — home cores/RAM, cloud server RAM, and hacknet nodes/servers.
 *
 * Runs a single greedy loop: every iteration finds the cheapest available upgrade
 * across all three domains and buys it. Home and cloud candidates drop out naturally
 * once they hit their respective limits; hacknet keeps going indefinitely.
 */

const POLL_MS        = 1000;
const MAX_HOME_CORES = 8;
const MAX_HOME_RAM   = 536_870_912; // 512 TB in GB

type UpgradeDomain = "home-cores" | "home-ram" | "cloud" | "hn-level" | "hn-ram" | "hn-cores" | "hn-cache" | "hn-node";

interface Upgrade {
    domain: UpgradeDomain;
    label:  string;
    cost:   number;
    node?:  number;  // hacknet node index
    host?:  string;  // cloud server hostname
    ram?:   number;  // target RAM for cloud upgrade
}

// ── Entry point ───────────────────────────────────────────────────────────────

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(640, 520);

    while (true) {
        // Buy first hacknet node before the main loop so findBestUpgrade never
        // reduces over an empty array.
        if (ns.hacknet.numNodes() === 0) {
            const cost = ns.hacknet.getPurchaseNodeCost();
            ns.clearLog();
            ns.print(`Waiting to buy first hacknet node: ${ns.format.number(cost)}`);
            while (ns.getServerMoneyAvailable("home") < cost) {
                await ns.sleep(POLL_MS);
            }
            ns.hacknet.purchaseNode();
            continue;
        }

        const candidates = buildCandidates(ns);

        if (candidates.length === 0) {
            ns.clearLog();
            ns.print("✅ All upgrades complete.");
            await ns.sleep(10_000);
            continue;
        }

        const best = candidates.reduce((a, b) => a.cost <= b.cost ? a : b);

        while (ns.getServerMoneyAvailable("home") < best.cost) {
            ns.clearLog();
            printStatus(ns, best);
            await ns.sleep(POLL_MS);
        }

        ns.clearLog();
        printStatus(ns, best);
        perform(ns, best);
        await ns.sleep(200);
    }
}

// ── Candidate collection ──────────────────────────────────────────────────────

function buildCandidates(ns: NS): Upgrade[] {
    const upgrades: Upgrade[] = [];
    const home = ns.getServer("home") as Server;

    // Home server cores and RAM
    if (home.cpuCores < MAX_HOME_CORES) {
        upgrades.push({
            domain: "home-cores",
            label:  `Home cores (${home.cpuCores} → ${home.cpuCores + 1})`,
            cost:   ns.singularity.getUpgradeHomeCoresCost(),
        });
    }
    if (home.maxRam < MAX_HOME_RAM) {
        upgrades.push({
            domain: "home-ram",
            label:  `Home RAM (${ns.format.ram(home.maxRam)} → ${ns.format.ram(home.maxRam * 2)})`,
            cost:   ns.singularity.getUpgradeHomeRamCost(),
        });
    }

    // Cloud servers — always upgrade the cheapest (lowest current RAM) first
    const ramLimit = ns.cloud.getRamLimit();
    for (const host of ns.cloud.getServerNames()) {
        const srv    = ns.getServer(host) as Server;
        const newRam = srv.maxRam * 2;
        if (newRam > ramLimit) continue;
        upgrades.push({
            domain: "cloud",
            label:  `${host} RAM (${ns.format.ram(srv.maxRam)} → ${ns.format.ram(newRam)})`,
            cost:   ns.cloud.getServerUpgradeCost(host, newRam),
            host,
            ram:    newRam,
        });
    }

    // Hacknet nodes / servers
    const isServer = isHacknetServer(ns);
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        const stats     = ns.hacknet.getNodeStats(i) as any;
        const lvlCost   = ns.hacknet.getLevelUpgradeCost(i);
        const ramCost   = ns.hacknet.getRamUpgradeCost(i);
        const coreCost  = ns.hacknet.getCoreUpgradeCost(i);

        if (isFinite(lvlCost))  upgrades.push({ domain: "hn-level",  label: `${stats.name} level`,  cost: lvlCost,  node: i });
        if (isFinite(ramCost))  upgrades.push({ domain: "hn-ram",    label: `${stats.name} RAM`,    cost: ramCost,  node: i });
        if (isFinite(coreCost)) upgrades.push({ domain: "hn-cores",  label: `${stats.name} cores`,  cost: coreCost, node: i });

        if (isServer) {
            const cacheCost = ns.hacknet.getCacheUpgradeCost(i);
            if (isFinite(cacheCost)) upgrades.push({ domain: "hn-cache", label: `${stats.name} cache`, cost: cacheCost, node: i });
        }
    }
    const nodeCost = ns.hacknet.getPurchaseNodeCost();
    if (isFinite(nodeCost)) upgrades.push({ domain: "hn-node", label: "new hacknet node", cost: nodeCost });

    return upgrades;
}

// ── Execution ─────────────────────────────────────────────────────────────────

function perform(ns: NS, u: Upgrade): void {
    switch (u.domain) {
        case "home-cores": ns.singularity.upgradeHomeCores();           break;
        case "home-ram":   ns.singularity.upgradeHomeRam();             break;
        case "cloud":      ns.cloud.upgradeServer(u.host!, u.ram!);     break;
        case "hn-level":   ns.hacknet.upgradeLevel(u.node!);            break;
        case "hn-ram":     ns.hacknet.upgradeRam(u.node!);              break;
        case "hn-cores":   ns.hacknet.upgradeCore(u.node!);             break;
        case "hn-cache":   ns.hacknet.upgradeCache(u.node!);            break;
        case "hn-node":    ns.hacknet.purchaseNode();                   break;
    }
}

// ── Display ───────────────────────────────────────────────────────────────────

function printStatus(ns: NS, next: Upgrade): void {
    const home     = ns.getServer("home") as Server;
    const money    = ns.getServerMoneyAvailable("home");
    const isServer = isHacknetServer(ns);

    // Home
    ns.print("── Home ──────────────────────────────────────────────────────");
    ns.print(`  Cores: ${home.cpuCores}/8   RAM: ${ns.format.ram(home.maxRam)}/512TB`);

    // Cloud servers
    const cloudHosts = ns.cloud.getServerNames();
    if (cloudHosts.length > 0) {
        ns.print("── Cloud Servers ─────────────────────────────────────────────");
        for (const host of cloudHosts) {
            const srv  = ns.getServer(host) as Server;
            const cost = ns.cloud.getServerUpgradeCost(host, srv.maxRam * 2);
            ns.print(`  ${host.padEnd(14)} ${ns.format.ram(srv.maxRam).padEnd(10)} next: ${ns.format.number(cost)}`);
        }
    }

    // Hacknet
    const count = ns.hacknet.numNodes();
    ns.print(`── Hacknet ${isServer ? "Servers" : "Nodes"} (${count}) ──────────────────────────────────`);
    let totalProd = 0;
    let totalCap  = 0;
    for (let i = 0; i < count; i++) {
        const s = ns.hacknet.getNodeStats(i) as any;
        totalProd += s.production;
        totalCap  += s.hashCapacity ?? 0;
        const capStr = isServer ? `  cap:${ns.format.number(s.hashCapacity)}` : "";
        ns.print(`  ${s.name.padEnd(22)} lvl:${String(s.level).padEnd(4)} ram:${String(s.ram).padEnd(6)} cores:${s.cores}${capStr}`);
    }
    if (isServer) {
        ns.print(`  Total: ${ns.format.number(totalProd, 3)}/s  Capacity: ${ns.format.number(totalCap)}`);
    } else {
        ns.print(`  Total: $${ns.format.number(totalProd, 3)}/s`);
    }

    // Next upgrade
    ns.print("─────────────────────────────────────────────────────────────");
    const afford = money >= next.cost ? "✅" : "⏳";
    ns.print(`${afford} Next: ${next.label}`);
    ns.print(`   Cost: ${ns.format.number(next.cost)}   Have: ${ns.format.number(money)}`);
}

function isHacknetServer(ns: NS): boolean {
    if (ns.hacknet.numNodes() === 0) return false;
    return (ns.hacknet.getNodeStats(0) as any).hashCapacity !== undefined;
}
