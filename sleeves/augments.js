/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();  
  let numSleeves = ns.sleeve.getNumSleeves();
  while (true) {
    ns.clearLog();  
    for (let i = 0; i < numSleeves; i++) {
      
      let augs = ns.sleeve.getSleevePurchasableAugs(i);
      
      for(const aug of augs){
        ns.sleeve.purchaseSleeveAug(i, aug.name);
      }
    }
    await ns.sleep(1000);
  }
}