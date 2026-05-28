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

function getAllSleeveAugNames(ns: NS): string[] {
  const all = new Set<string>();
  for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
    for (const name of ns.sleeve.getSleeveAugmentations(i))
      all.add(name);
    for (const { name } of ns.sleeve.getSleevePurchasableAugs(i))
      all.add(name);
  }
  return [...all].sort();
}

function printSleeveAugStatus(ns: NS) {
  const augs      = getAllSleeveAugNames(ns);
  const numSleeves = ns.sleeve.getNumSleeves();

  const sleeveAugs = Array.from({ length: numSleeves }, (_, i) =>
    ns.sleeve.getSleeveAugmentations(i)
  );
  const purchasable = Array.from({ length: numSleeves }, (_, i) =>
    new Set(ns.sleeve.getSleevePurchasableAugs(i).map(a => a.name))
  );

  ns.print(`║${"Augment🦾".padEnd(54)}║ 0║ 1║ 2║ 3║ 4║ 5║ 6║ 7║`);
  ns.print(`${"╠".padEnd(55, "═")}╬══╬══╬══╬══╬══╬══╬══╬══╣`);
  for (const aug of augs) {
    let line = `║${aug.padEnd(54)}`;
    for (let i = 0; i < numSleeves; i++) {
      if      (sleeveAugs[i].includes(aug)) line += `║🟩`;
      else if (purchasable[i].has(aug))     line += `║🟨`;
      else                                  line += `║🟥`;
    }
    line += "║";
    ns.print(line);
  }
}
