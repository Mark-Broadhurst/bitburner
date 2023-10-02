import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  const numSleeves = ns.sleeve.getNumSleeves();

  let augList = [];
  for (let i = 0; i < numSleeves; i++) {
    let augs = ns.sleeve.getSleevePurchasableAugs(i).sort((a, b) => a.cost - b.cost);
    if (augs.length == 0) continue;
    let current = ns.sleeve.getSleeve(i);
    if (current.shock != 0) continue;
    for (const aug of augs) {
      augList.push({ sleeve: i, name: aug.name, cost: aug.cost });
    }
  }

  augList.sort((a, b) => a.cost - b.cost);
  
  ns.print(`sleeve\taug\tcost`);
  for(const aug of augList) {
    ns.print(`${aug.sleeve}\t${aug.name.padEnd(38)}\t${ns.formatNumber(aug.cost)}`);
  }

  for(const aug of augList) {
    ns.print(`Buying ${aug.name} for ${ns.formatNumber(aug.cost)} for sleeve ${aug.sleeve}`);
    while(ns.getServerMoneyAvailable("home") < aug.cost) {
      await ns.sleep(1000);
    }
    ns.sleeve.purchaseSleeveAug(aug.sleeve, aug.name);
  }
}