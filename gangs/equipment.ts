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
        .map(ns.gang.getMemberInformation)
        .reduce((prev, current) => ((prev.upgrades.length + prev.augmentations.length) < (current.upgrades.length + current.augmentations.length)) ? prev : current);
  
      const equipment = equipments.filter(x => !member.upgrades.includes(x) && !member.augmentations.includes(x))[0];
      if (equipment) {
        let result = ns.gang.purchaseEquipment(member.name, equipment);
        if (result) {
          const message = `Purchased ${equipment} for ${member.name} ($${ns.formatNumber(ns.gang.getEquipmentCost(equipment))})`;
          ns.print(message);
          ns.toast(message);
        }
        else {
          const message = `Waiting for ${equipment} for ${member.name} ($${ns.formatNumber(ns.gang.getEquipmentCost(equipment))})`;
          ns.print(message);
          await ns.sleep(1000);
        }
      } else {
        await ns.sleep(1000);
  
      }
    }
}
