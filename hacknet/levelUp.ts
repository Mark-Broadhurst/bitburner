import { NS } from "@ns";
import { GoalNode } from "/hacknet/GoalNode";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    let targets = new GoalNode();
    if (ns.args.length) {
        targets.level = ns.args[0] as number;
        targets.core = ns.args[1] as number;
        targets.ram = ns.args[2] as number;
        targets.cache = ns.args[3] as number;

    } else {
        targets.level = 60;
        targets.core = 12;
        targets.ram = 128;
        targets.cache = 3;
    }

    for (let currentNode = 0; currentNode < ns.hacknet.numNodes(); currentNode++) {
        let node = ns.hacknet.getNodeStats(currentNode);
        while (node.level < targets.level) {
            await upgradeNode(ns, currentNode, ns.hacknet.getLevelUpgradeCost, ns.hacknet.upgradeLevel, targets, "Level");
            node = ns.hacknet.getNodeStats(currentNode);
        }
        while (node.cores < targets.core) {
            await upgradeNode(ns, currentNode, ns.hacknet.getCoreUpgradeCost, ns.hacknet.upgradeCore, targets, "Core");
            node = ns.hacknet.getNodeStats(currentNode);
        }
        while (node.ram < targets.ram) {
            await upgradeNode(ns, currentNode, ns.hacknet.getRamUpgradeCost, ns.hacknet.upgradeRam, targets, "Ram");
            node = ns.hacknet.getNodeStats(currentNode);
        }
        while (node.cache === undefined || node.cache < targets.cache) {
            await upgradeNode(ns, currentNode, ns.hacknet.getCacheUpgradeCost, ns.hacknet.upgradeCache, targets, "Cache");
            node = ns.hacknet.getNodeStats(currentNode);
        }
    }
}

async function upgradeNode(ns: NS, node: number, costFunc: (index: number) => number, upgradeFunc: (index: number) => boolean, targets: GoalNode, type: string) {
    ns.clearLog();
    let n = ns.hacknet.getNodeStats(node);
    ns.print(`hacknet-server-${node}`);
    ns.print(`Level :\t${n.level} / ${targets.level}`);
    ns.print(`RAM :\t${n.ram} / ${targets.ram}`);
    ns.print(`Core :\t${n.cores} / ${targets.core}`);
    ns.print(`Cache :\t${n.cache} / ${targets.cache}`);
    ns.print(`Upgrading ${type}`);
    while (ns.getServerMoneyAvailable("home") < costFunc(node)) {
        await ns.sleep(1000);
    }
    //ns.toast(`Upgrading hacknet-server-${node} ${type}`);
    upgradeFunc(node);
}
