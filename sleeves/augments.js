/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();  
  let numSleeves = ns.sleeve.getNumSleeves();
  while (true) {
    for (let i = 0; i < numSleeves; i++) {
      let augs = ns.sleeve.getSleevePurchasableAugs(i);
      ns.print(augs);
      //ns.sleeve.purchaseSleeveAug(i);
    }
    await ns.sleep(1000);
  }
}

