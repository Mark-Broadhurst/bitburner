/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  while (true) {
    ns.clearLog();
    let coreUpgrade = ns.singularity.getUpgradeHomeCoresCost();
    let ramUpgrade = ns.singularity.getUpgradeHomeRamCost();
    let money = ns.getServerMoneyAvailable("home");
    if (coreUpgrade < ramUpgrade) {
      ns.print(`Upgrading Cores for ${ns.formatNumber(coreUpgrade)} at ${ns.formatNumber(money)}`);
      while (coreUpgrade < money) {
        money = ns.getServerMoneyAvailable("home");
        await ns.sleep(1000);
      }
      ns.singularity.upgradeHomeCores();
    } else {
      ns.print(`Upgrading RAM for ${ns.formatNumber(ramUpgrade)} at ${ns.formatNumber(money)}`);
      while (ramUpgrade < money) {
        money = ns.getServerMoneyAvailable("home");
        await ns.sleep(1000);
      }
      ns.singularity.upgradeHomeRam();
    }
    await ns.sleep(1000);
  }
}