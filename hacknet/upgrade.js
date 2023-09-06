/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    let currentNode = 0;
    while (currentNode < ns.hacknet.maxNumNodes()) {
        currentNode = ns.hacknet.numNodes() - 1;
        let node = ns.hacknet.getNodeStats(currentNode);
        while (node.level < 20) {
            await upgradeNode(ns, currentNode, ns.hacknet.getLevelUpgradeCost, ns.hacknet.upgradeLevel, "Level");
            node = ns.hacknet.getNodeStats(currentNode);
        }
        while (node.cores < 5) {
            await upgradeNode(ns, currentNode, ns.hacknet.getCoreUpgradeCost, ns.hacknet.upgradeCore, "Core");
            node = ns.hacknet.getNodeStats(currentNode);
        }
        while (node.ram < 64) {
            await upgradeNode(ns, currentNode, ns.hacknet.getRamUpgradeCost, ns.hacknet.upgradeRam, "Ram");
            node = ns.hacknet.getNodeStats(currentNode);
        }
        while (node.cache < 1) {
            await upgradeNode(ns, currentNode, ns.hacknet.getCacheUpgradeCost, ns.hacknet.upgradeCache, "Cache");
            node = ns.hacknet.getNodeStats(currentNode);
        }
        if (ns.getServerMoneyAvailable("home") > ns.hacknet.getPurchaseNodeCost()) {
            ns.toast("Buying Hacknet Node");
            ns.hacknet.purchaseNode();
        }
        await ns.sleep(1000);
    }
}

/**
 * 
 * @param {NS} ns 
 * @param {Number} node 
 * @param {Function} costFunc 
 * @param {Function} upgradeFunc 
 * @param {String} type 
 */
async function upgradeNode(ns, node, costFunc, upgradeFunc, type) {
    ns.clearLog();
    let n = ns.hacknet.getNodeStats(node);
    ns.print(`hacknet-server-${node}`);
    ns.print(`Level :\t${n.level} / 60`);
    ns.print(`RAM :\t${n.ram} / 128`);
    ns.print(`Core :\t${n.cores} / 12`);
    ns.print(`Cache :\t${n.cache} / 3`);
    ns.print(`Upgrading ${type}`);
    while (ns.getServerMoneyAvailable("home") < costFunc(node)) {
        await ns.sleep(1000);
    }
    ns.toast(`Upgrading hacknet-server-${node} ${type}`);
    upgradeFunc(node);
}