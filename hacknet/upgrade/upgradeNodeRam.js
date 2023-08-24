/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    while (true) {
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            const cost = ns.hacknet.getRamUpgradeCost(i);
            if (ns.getServerMoneyAvailable("home") > cost) {
                ns.toast(`Upgrading Ram Hacknet-${i} Node`);
                ns.hacknet.upgradeRam(i);
            }
        }
        await ns.sleep(1000);
    }
}