/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    while (true) {
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            const cost = ns.hacknet.getCoreUpgradeCost(i);
            if (ns.getServerMoneyAvailable("home") > cost) {
                ns.toast(`Upgrading Cores Hacknet-${i} Node`);
                ns.hacknet.upgradeCore(i);
            }
        }
        await ns.sleep(1000);
    }
}