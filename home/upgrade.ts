import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  while (true) {
    ns.clearLog();
    const home = ns.getServer("home");
    const cores = home.cpuCores;
    const ram = home.maxRam;
    ns.print(`Cores: ${cores}\nRAM: ${ns.formatRam(ram)}`); 
    let coreUpgrade = ns.singularity.getUpgradeHomeCoresCost();
    let ramUpgrade = ns.singularity.getUpgradeHomeRamCost();
    if(cores === 8) {
      coreUpgrade = Infinity;
    }
    if(ram === 536_870_912) {
      ramUpgrade = Infinity;
    }
    let money = ns.getServerMoneyAvailable("home");
    if (coreUpgrade < ramUpgrade) {
      ns.print(`Upgrading Cores for ${ns.formatNumber(coreUpgrade)}`);
      while (coreUpgrade > money) {
        money = ns.getServerMoneyAvailable("home");
        await ns.sleep(1000);
      }
      ns.singularity.upgradeHomeCores();
    } else {
      ns.print(`Upgrading RAM for ${ns.formatNumber(ramUpgrade)}`);
      while (ramUpgrade > money) {
        money = ns.getServerMoneyAvailable("home");
        await ns.sleep(1000);
      }
      ns.singularity.upgradeHomeRam();
    }
    await ns.sleep(1000);
  }
}
