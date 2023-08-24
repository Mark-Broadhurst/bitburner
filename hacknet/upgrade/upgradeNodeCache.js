/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    while (true) {
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            const cost = ns.hacknet.getCacheUpgradeCost(i);
            if (ns.getServerMoneyAvailable("home") > cost) {
                ns.toast(`Upgrading Cache Hacknet-${i} Node`);
                ns.hacknet.upgradeCache(i);
            }
        }
        await ns.sleep(1000);
    }
}
