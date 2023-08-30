/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    let targets = {};
    if(ns.args.length){
        targets.level = ns.args[0];
        targets.core = ns.args[1];
        targets.ram = ns.args[2];
        targets.cache = ns.args[3];

    } else {
        targets.level = 60;
        targets.core = 12;
        targets.ram = 128;
        targets.cache = 3;
    }

    for (let currentNode = 0; currentNode < ns.hacknet.numNodes(); currentNode++) {
        let node = ns.hacknet.getNodeStats(currentNode);
        while (node.level < targets.level) {
            await upgradeNode(ns, currentNode, ns.hacknet.getLevelUpgradeCost, ns.hacknet.upgradeLevel, targets ,"Level");
            node = ns.hacknet.getNodeStats(currentNode);
        }
        while (node.cores < targets.core) {
            await upgradeNode(ns, currentNode, ns.hacknet.getCoreUpgradeCost, ns.hacknet.upgradeCore, targets ,"Core");
            node = ns.hacknet.getNodeStats(currentNode);
        }
        while (node.ram < targets.ram) {
            await upgradeNode(ns, currentNode, ns.hacknet.getRamUpgradeCost, ns.hacknet.upgradeRam, targets ,"Ram");
            node = ns.hacknet.getNodeStats(currentNode);
        }
        while (node.cache < targets.cache) {
            await upgradeNode(ns, currentNode, ns.hacknet.getCacheUpgradeCost, ns.hacknet.upgradeCache, targets ,"Cache");
            node = ns.hacknet.getNodeStats(currentNode);
        }
    }
}

/**
 * 
 * @param {NS} ns 
 * @param {Number} node 
 * @param {Function} costFunc 
 * @param {Function} upgradeFunc 
 * @param {Object} targets
 * @param {String} type 
 */
async function upgradeNode(ns, node, costFunc, upgradeFunc, targets, type) {
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
    ns.toast(`Upgrading hacknet-server-${node} ${type}`);
    upgradeFunc(node);
}

