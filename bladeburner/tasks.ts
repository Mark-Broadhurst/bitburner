import { NS } from "@ns";
import { Type, Action, Contract } from "bladeburner/enums";

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  ns.disableLog("sleep");

  while (true) {
    const player = ns.getPlayer();
    if (player.hp.current < player.hp.max) {
      ns.print("Healing");
      ns.bladeburner.startAction(Type.General, Action.HyperbolicRegenerationChamber);
      await ns.sleep(1000);
    } else if (getStaminaPercentage(ns) > 0.5) {
      const contract = getContract(ns);
      ns.print(`Doing contract ${contract}`);
      const time = ns.bladeburner.getActionTime(Type.Contract, contract);
      ns.bladeburner.startAction(Type.Contract, contract);
      await ns.sleep(time);
    } else {
      ns.print("Training");
      const time = ns.bladeburner.getActionTime(Type.General, Action.Training);
      ns.bladeburner.startAction(Type.General, Action.Training);
      await ns.sleep(time);
    }
  }

}

function getContract(ns: NS): Contract {
  const contracts = [Contract.Tracking, Contract.BountyHunter, Contract.Retirement]
    .map(c => {
      const count = ns.bladeburner.getActionCountRemaining(Type.Contract, c);
      const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance(Type.Contract, c);
      return { contract: c, count, min, max };
    })
    .filter(c => c.count > 0)
    .sort((a, b) => b.max - a.max);
  return contracts[0].contract;
}

function getStaminaPercentage(ns: NS): number {
  const [current, max] = ns.bladeburner.getStamina();
  ns.print(`Stamina: ${current / max}`);
  return current / max;
}