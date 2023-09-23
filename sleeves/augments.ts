import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    let numSleeves = ns.sleeve.getNumSleeves();
    while (true) {
      ns.clearLog();  
      for (let i = 0; i < numSleeves; i++) {
        
        let augs = ns.sleeve.getSleevePurchasableAugs(i);
        if(augs.length == 0) continue;
        let current = ns.sleeve.getSleeve(i);
        if (current.shock != 0) continue;
        for(const aug of augs){
          ns.sleeve.purchaseSleeveAug(i, aug.name);
        }
        await ns.sleep(30*1000);
      }
      await ns.sleep(1000);
    }
}