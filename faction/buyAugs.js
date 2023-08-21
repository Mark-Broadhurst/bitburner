/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    let list = [];
    do {
    ns.clearLog();
      list = [];
      let ownedAugs = ns.singularity.getOwnedAugmentations(true);
      for (const faction of ns.getPlayer().factions) {
        if (faction == "Shadows of Anarchy") continue;
        const factionRep = ns.singularity.getFactionRep(faction);
        const augments = ns.singularity.getAugmentationsFromFaction(faction);
        for (const augment of augments) {
          if (augment == "NeuroFlux Governor") continue;
          if (ownedAugs.includes(augment)) continue;
          const augmentPrice = ns.singularity.getAugmentationPrice(augment);
          const augmentRep = ns.singularity.getAugmentationRepReq(augment);
          list.push(new AugmentItem(faction,factionRep,augment,augmentPrice,augmentRep));
        }
      }
      list = list.sort((a, b) => {
        if (a.requiredRep > b.requiredRep) {
          return 1;
        }
        if (a.requiredRep < b.requiredRep) {
          return -1;
        }
        if (a.price > b.price) {
          return 1;
        }
        if (a.price < b.price) {
          return -1;
        }
        return 0;
      });
      for (const item of list) {
        ns.print(item);
        while (ns.getServerMoneyAvailable("home") < item.price &&
          ns.singularity.getFactionRep(faction.name) < item.augmentRep) {
          ns.print(`Waiting for money to reach ${ns.formatNumber(item.price)}`);
          ns.print(`Waiting for ${item.faction} rep to reach ${item.augmentRep}`);
          await ns.sleep(1000);
        }
        //ns.print(`Buying ${item.augment} from ${item.faction}`);
        //ns.singularity.purchaseAugmentation(item.faction, item.augment);
      }
      await ns.sleep(100);
    }
    while (list.length);
  }
  
  class AugmentItem {
    constructor(faction, factionRep, augment, augmentPrice, augmentRep)
    {
      this.faction = faction;
      this.factionRep = factionRep;
      this.augment = augment;
      this.augmentPrice = augmentPrice;
      this.augmentRep = augmentRep;
      this.requiredRep = augmentRep - factionRep
      if (this.requiredRep < 0)
      {
        this.requiredRep = 0;
      }
    }
  }