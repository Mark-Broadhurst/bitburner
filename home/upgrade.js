/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    let money = ns.getServerMoneyAvailable("home");
    let coreUpgrade = ns.singularity.getUpgradeHomeCoresCost();
    let ramUpgrade = ns.singularity.getUpgradeHomeRamCost();
    if (coreUpgrade > ramUpgrade) {
      while (coreUpgrade < money) {
        await ns.sleep(1000);
      }
      ns.singularity.upgradeHomeCores();
    } else {
      while (ramUpgrade < money) {
        await ns.sleep(1000);
      }
      ns.singularity.upgradeHomeRam();
    }
    await ns.sleep(100)
  }
}