import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    while (true) {
        if (ns.hacknet.numNodes() == 0) {
            while (ns.getServerMoneyAvailable("home") < ns.hacknet.getPurchaseNodeCost()) {
                await ns.sleep(1000);
            }
            ns.hacknet.purchaseNode();
        }
        const node = getWeakestNode(ns);
        const stat = getWeakestStat(ns, node);
        ns.print(`Upgrading hacknet-server-${node} ${stat.type} ${ns.formatNumber(stat.cost)}`);
        while (ns.getServerMoneyAvailable("home") < stat.cost) {
            await ns.sleep(1000);
        }
        switch (stat.type) {
            case "level":
                ns.hacknet.upgradeLevel(node);
                break;
            case "ram":
                ns.hacknet.upgradeRam(node);
                break;
            case "cores":
                ns.hacknet.upgradeCore(node);
                break;
            case "cache":
                ns.hacknet.upgradeCache(node);
                break;
            case "node":
                ns.hacknet.purchaseNode();
                break;
        }
    }
}

function getWeakestNode(ns: NS): number {

    const nodeName = Array.from({ length: ns.hacknet.numNodes() }, (_, i) => i)
        .map(i => ns.hacknet.getNodeStats(i))
        .reduce((a, b) => a.production < b.production ? a : b).name
        .replace("hacknet-node-", "")
        .replace("hacknet-server-", "");
    return parseInt(nodeName);
}

function getWeakestStat(ns: NS, node: number): { type: string, cost: number } {
    const costs = [
        { type: "level", cost: ns.hacknet.getLevelUpgradeCost(node) },
        { type: "ram", cost: ns.hacknet.getRamUpgradeCost(node) },
        { type: "cores", cost: ns.hacknet.getCoreUpgradeCost(node) },
        { type: "cache", cost: ns.hacknet.getCacheUpgradeCost(node) },
        { type: "node", cost: ns.hacknet.getPurchaseNodeCost() }
    ].reduce((a, b) => a.cost <= b.cost ? a : b);
    return costs;
}