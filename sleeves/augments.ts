import { NS } from "@ns";
import { SleeveAugmentations } from "utils/augments";

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

  printSleeveAugStatus(ns);

  for(const aug of augList) {
    while(ns.getServerMoneyAvailable("home") < aug.cost) {
      ns.clearLog();
      printSleeveAugStatus(ns);
      await ns.sleep(1000);
    }
    ns.sleeve.purchaseSleeveAug(aug.sleeve, aug.name);
  }
}

function printSleeveAugStatus(ns:NS) {
  const augs = SleeveAugmentations;

  const sleeveAugs = [];
  for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
    const aug = ns.sleeve.getSleeveAugmentations(i);
    sleeveAugs.push(aug);
  } 

  ns.print(`║${"Augment🦾".padEnd(54)}║ 0║ 1║ 2║ 3║ 4║ 5║ 6║ 7║`);
  ns.print(`${"╠".padEnd(55, "═")}╬══╬══╬══╬══╬══╬══╬══╬══╣`);
  for(const aug of augs) {
    let line = `║${aug.padEnd(54)}`;
    for(let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
      const sleeve = sleeveAugs[i];

      if (sleeve.includes(aug)) {
        line += `║🟩`;
      } else if (ns.sleeve.getSleevePurchasableAugs(i).map(x=>x.name).includes(aug)) {
        line += `║🟨`;
      } else {
        line += `║🟥`;
      }
    }
    line += "║";
    ns.print(line);
  }
}
