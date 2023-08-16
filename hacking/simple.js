/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const targetHackLvl = ns.getServerRequiredHackingLevel(target);
  while (targetHackLvl > await ns.getHackingLevel()){
    ns.print("Waiting for hack level");
    await ns.sleep(60000);
  }
  const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
  const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      await ns.grow(target, {stock:true});
    } else {
      await ns.hack(target);
    }
  }
}