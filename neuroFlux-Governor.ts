import { NS } from "@ns";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();
    const augName = "NeuroFlux Governor";
    const requiredRep = ns.singularity.getAugmentationRepReq(augName);
    const faction = ns.getPlayer().factions
      .filter(faction => ns.singularity.getAugmentationsFromFaction(faction).includes(augName))
      .filter(faction => ns.singularity.getFactionRep(faction) > requiredRep)
      .reduce((a, b) => {
        const aRep = ns.singularity.getFactionRep(a);
        const bRep = ns.singularity.getFactionRep(b);
        if (aRep > bRep) {
          return a;
        }
        return b;
      });
  
    ns.print(faction);
  
    let money = ns.getServerMoneyAvailable("home");
  
    while (money > 0) {
      const cost = ns.singularity.getAugmentationPrice(augName);
      money = money - cost;
      ns.singularity.purchaseAugmentation(faction, augName);
    }
  
}