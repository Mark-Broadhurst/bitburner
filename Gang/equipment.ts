import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const equipments = ns.gang.getEquipmentNames()
      .map(equipment => {
        const cost = ns.gang.getEquipmentCost(equipment);
        return { name: equipment, cost: cost }
      })
      .sort((a, b) => a.cost - b.cost)
      .map(x => x.name);
  
    while (true) {
      ns.clearLog();
  
      const member = ns.gang.getMemberNames()
        .map(m => ns.gang.getMemberInformation(m))
        .reduce((prev, current) => ((prev.upgrades.length + prev.augmentations.length) <= (current.upgrades.length + current.augmentations.length)) ? prev : current);
  
      const equipment = equipments.filter(x => !member.upgrades.includes(x) && !member.augmentations.includes(x))[0];
      if (equipment) {
        const cost      = ns.gang.getEquipmentCost(equipment);
        const homeMoney = ns.getServerMoneyAvailable("home");
        // Keep at least 2× the equipment cost on hand so we don't drain all
        // cash that might be needed for augments or other purchases.
        const minBuffer = Math.max(50e6, cost * 2);
        if (homeMoney < minBuffer) {
          ns.print(`Waiting for buffer: $${ns.format.number(homeMoney)} / $${ns.format.number(minBuffer)} (${equipment})`);
          await ns.sleep(1000);
        } else {
          let result = ns.gang.purchaseEquipment(member.name, equipment);
          if (result) {
            const message = `Purchased ${equipment} for ${member.name} ($${ns.format.number(cost)})`;
            ns.print(message);
            ns.tprint(message);
          } else {
            const message = `Waiting for ${equipment} for ${member.name} ($${ns.format.number(cost)})`;
            ns.print(message);
            await ns.sleep(1000);
          }
        }
      } else {
        await ns.sleep(1000);

      }
    }
}
