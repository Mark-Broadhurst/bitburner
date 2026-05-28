import { NS, Server } from "@ns";
import { minBy } from "Utils/array";

const POLL_MS        = 100;
const DISPLAY_MS     = 1_000;
const MAX_HOME_CORES = 8;
const MAX_HOME_RAM   = 536_870_912;

type UpgradeDomain = "home-cores" | "home-ram" | "cloud" | "hn-level" | "hn-ram" | "hn-cores" | "hn-cache" | "hn-node"
                  | "stock-wse" | "stock-tix" | "stock-4s" | "stock-4s-tix";

interface Upgrade {
    domain: UpgradeDomain;
    label:  string;
    cost:   number;
    node?:  number;
    host?:  string;
    ram?:   number;
}

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(640, 520);

    while (true) {
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

        const best = minBy(candidates, u => u.cost);

        let lastDisplay = 0;
        while (ns.getServerMoneyAvailable("home") < best.cost) {
            const now = Date.now();
            if (now - lastDisplay >= DISPLAY_MS) {
                ns.clearLog();
                printStatus(ns, best);
                lastDisplay = now;
            }
            await ns.sleep(POLL_MS);
        }

        ns.clearLog();
        printStatus(ns, best);
        perform(ns, best);
    }
}

function buildCandidates(ns: NS): Upgrade[] {
    const upgrades: Upgrade[] = [];
    const home = ns.getServer("home") as Server;

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

    if (!ns.stock.hasWseAccount())
        upgrades.push({ domain: "stock-wse",    label: "WSE Account",        cost:   200_000_000 });
    else if (!ns.stock.hasTixApiAccess())
        upgrades.push({ domain: "stock-tix",    label: "TIX API",            cost: 5_000_000_000 });
    else if (!ns.stock.has4SData())
        upgrades.push({ domain: "stock-4s",     label: "4S Market Data",     cost: 1_000_000_000 });
    else if (!ns.stock.has4SDataTixApi())
        upgrades.push({ domain: "stock-4s-tix", label: "4S Market Data TIX", cost: 25_000_000_000 });

    if (upgrades.some(u => u.domain === "cloud")) {
        return upgrades.filter(u => !u.domain.startsWith("hn-"));
    }

    return upgrades;
}

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
        case "stock-wse":    ns.stock.purchaseWseAccount();         break;
        case "stock-tix":    ns.stock.purchaseTixApi();             break;
        case "stock-4s":     ns.stock.purchase4SMarketData();       break;
        case "stock-4s-tix": ns.stock.purchase4SMarketDataTixApi(); break;
    }
}

function printStatus(ns: NS, next: Upgrade): void {
    const home     = ns.getServer("home") as Server;
    const money    = ns.getServerMoneyAvailable("home");
    const isServer = isHacknetServer(ns);

    ns.print("── Home ──────────────────────────────────────────────────────");
    ns.print(`  Cores: ${home.cpuCores}/8   RAM: ${ns.format.ram(home.maxRam)}/512TB`);

    const cloudHosts = ns.cloud.getServerNames();
    if (cloudHosts.length > 0) {
        ns.print("── Cloud Servers ─────────────────────────────────────────────");
        for (const host of cloudHosts) {
            const srv  = ns.getServer(host) as Server;
            const cost = ns.cloud.getServerUpgradeCost(host, srv.maxRam * 2);
            ns.print(`  ${host.padEnd(14)} ${ns.format.ram(srv.maxRam).padEnd(10)} next: ${ns.format.number(cost)}`);
        }
    }

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

    const wse  = ns.stock.hasWseAccount()    ? "✅" : "⬜";
    const tix  = ns.stock.hasTixApiAccess()  ? "✅" : "⬜";
    const s4s  = ns.stock.has4SData()        ? "✅" : "⬜";
    const s4st = ns.stock.has4SDataTixApi()  ? "✅" : "⬜";
    ns.print("── Stock Market ──────────────────────────────────────────────");
    ns.print(`  WSE ${wse}  TIX API ${tix}  4S Data ${s4s}  4S TIX API ${s4st}`);

    ns.print("─────────────────────────────────────────────────────────────");
    const afford = money >= next.cost ? "✅" : "⏳";
    ns.print(`${afford} Next: ${next.label}`);
    ns.print(`   Cost: ${ns.format.number(next.cost)}   Have: ${ns.format.number(money)}`);
}

function isHacknetServer(ns: NS): boolean {
    if (ns.hacknet.numNodes() === 0) return false;
    return (ns.hacknet.getNodeStats(0) as any).hashCapacity !== undefined;
}
