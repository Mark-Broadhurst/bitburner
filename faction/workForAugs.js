/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  let list = [];
  do {
    ns.clearLog();
    list = getListOfAugments(ns);
    for (const item of list) {
      if (item.factionRep < item.augmentRep) {
        let field = getBestField(ns, item.faction);
        ns.singularity.workForFaction(item.faction, field);
        while (ns.singularity.getFactionRep(item.faction) < item.augmentRep) {
          ns.clearLog();
          printList(ns);
          ns.print(`Waiting for ${item.faction} rep to reach ${ns.formatNumber(item.augmentRep)}`);
          await ns.sleep(1000);
        }
      }
      while (ns.getServerMoneyAvailable("home") < item.price) {
        ns.clearLog();
        printList(ns);
        ns.print(`Waiting for money to reach ${ns.formatNumber(item.price)}`);
        await ns.sleep(1000);
      }
      ns.print(`Buying ${item.augment} from ${item.faction}`);
      ns.singularity.purchaseAugmentation(item.faction, item.augment);
    }
    await ns.sleep(100);
  }
  while (list.length);
}

/**
 * @param {NS} ns
 * @returns {AugmentItem[]}
 */
function getListOfAugments(ns) {

  let list = [];
  const ownedAugs = ns.singularity.getOwnedAugmentations(true);
  for (const faction of ns.getPlayer().factions) {
    if (faction == "Shadows of Anarchy") continue;
    if (faction == ns.gang.getGangInformation().faction) continue;
    const augments = ns.singularity.getAugmentationsFromFaction(faction);
    for (const augment of augments) {
      if (augment == "NeuroFlux Governor") continue;
      if (ownedAugs.includes(augment)) continue;
      list.push(new AugmentItem(ns, faction, augment));
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
  return list;
}


/**
 * @param {NS} ns
 * @param {string} faction
 * @returns {FactionWorkType}
 */
function getBestField(ns, faction) {
  const player = ns.getPlayer();
  const favour = ns.singularity.getFactionFavor(faction);
  let gains = [
    { name: ns.enums.FactionWorkType.hacking, gain: ns.formulas.work.factionGains(player, ns.enums.FactionWorkType.hacking, favour) },
    { name: ns.enums.FactionWorkType.security, gain: ns.formulas.work.factionGains(player, ns.enums.FactionWorkType.security, favour) },
    { name: ns.enums.FactionWorkType.field, gain: ns.formulas.work.factionGains(player, ns.enums.FactionWorkType.field, favour) },
  ]
    .reduce((a, b) => {
      if (a.gain.reputation > b.gain.reputation) {
        return a;
      }
      return b;
    })
  return gains.name;
}

/**
 * @param {NS} ns
 */
function printList(ns) {
  ns.print("Augment\t\t\t\t\t\tFaction\t\t\tRep\tRequried Rep");
  ns.print("--------------------------------------------------------------------------------------------");
  const list = getListOfAugments(ns);
  for (const item of list) {
    ns.print(`${item.augment.padEnd(40)}\t${item.faction.padEnd(20)}\t${ns.formatNumber(item.augmentRep,2)}\t${ns.formatNumber(item.requiredRep,2)}`);
  }
  ns.print("--------------------------------------------------------------------------------------------");
}

class AugmentItem {

  faction;
  factionRep;
  augment;
  augmentPrice;
  augmentRep;
  requiredRep;

  /**
   * @param {NS} ns
   * @param {string} faction
   * @param {string} augment
   */
  constructor(ns, faction, augment) {
    this.faction = faction;
    this.factionRep = ns.singularity.getFactionRep(faction);
    this.augment = augment;
    this.augmentPrice = ns.singularity.getAugmentationPrice(augment);
    this.augmentRep = ns.singularity.getAugmentationRepReq(augment);
    this.requiredRep = this.augmentRep - this.factionRep
    if (this.requiredRep < 0) {
      this.requiredRep = 0;
    }
  }
}