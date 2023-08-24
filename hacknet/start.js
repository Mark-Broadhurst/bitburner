/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.run("hacknet/sellHashes.js");
    ns.run("hacknet/buyNodes.js");
    ns.run("hacknet/upgrade/upgradeNodeLevel.js");
    ns.run("hacknet/upgrade/upgradeNodeRam.js");
    ns.run("hacknet/upgrade/upgradeNodeCores.js");    
    ns.run("hacknet/upgrade/upgradeNodeCache.js");    
}