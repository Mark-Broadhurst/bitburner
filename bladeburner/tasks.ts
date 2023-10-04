import { CityName, NS } from "@ns";
import { Type, Action, Contract, Operation, BlackOp, BladeburnerAction } from "bladeburner/enums";

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  ns.disableLog("ALL");

  while (true) {
    const player = ns.getPlayer();
    if (player.hp.current < player.hp.max) {
      ns.print("Healing");
      await startAction(ns, BladeburnerAction.HyperbolicRegenerationChamber)
    } else if (getStaminaPercentage(ns) > 0.5) {
      await startStaminaAction(ns);
    } else {
      await startFreeAction(ns);
    }
  }
}

async function startStaminaAction(ns: NS) {
  const blackOp = getBlackOp(ns);
  const operation = getOperation(ns);
  const contract = getContract(ns);
  if (blackOp) {
    await startAction(ns, blackOp);
  } else if (operation) {
    await startAction(ns, operation);
  } else if (contract) {
    await startAction(ns, contract);
  } else {
    await startFreeAction(ns);
  }
}

function lowChaosCity(ns: NS): CityName {
  const CityName = ns.enums.CityName;
  return [CityName.Sector12, CityName.Aevum, CityName.Volhaven, CityName.Chongqing, CityName.NewTokyo, CityName.Ishima]
    .reduce((acc, city) => {
      const aChaos = ns.bladeburner.getCityChaos(acc);
      const bChaos = ns.bladeburner.getCityChaos(city);
      return aChaos < bChaos ? acc : city;
    });

}

function highChaosCity(ns: NS): CityName {
  const CityName = ns.enums.CityName;
  return [CityName.Sector12, CityName.Aevum, CityName.Volhaven, CityName.Chongqing, CityName.NewTokyo, CityName.Ishima]
    .reduce((acc, city) => {
      const aChaos = ns.bladeburner.getCityChaos(acc);
      const bChaos = ns.bladeburner.getCityChaos(city);
      return aChaos > bChaos ? acc : city;
    });
}


async function startFreeAction(ns: NS) {
  const high = highChaosCity(ns);
  const low = lowChaosCity(ns);
  if (high === low) {
    await startFieldAnalysis(ns);
  } else {
    ns.bladeburner.switchCity(high);
    await startAction(ns, BladeburnerAction.Diplomacy);
  }

}

async function startFieldAnalysis(ns: NS) {
  switchCity(ns);
  await startAction(ns, BladeburnerAction.FieldAnalysis);
}

function getStaminaPercentage(ns: NS): number {
  const [current, max] = ns.bladeburner.getStamina();
  ns.print(`Stamina: ${ns.formatPercent(current / max)}`);
  return current / max;
}

function switchCity(ns: NS) {
  switch (ns.bladeburner.getCity()) {
    case ns.enums.CityName.Sector12:
      ns.bladeburner.switchCity(ns.enums.CityName.Aevum)
      break;
    case ns.enums.CityName.Aevum:
      ns.bladeburner.switchCity(ns.enums.CityName.Volhaven)
      break;
    case ns.enums.CityName.Volhaven:
      ns.bladeburner.switchCity(ns.enums.CityName.Chongqing)
      break;
    case ns.enums.CityName.Chongqing:
      ns.bladeburner.switchCity(ns.enums.CityName.NewTokyo)
      break;
    case ns.enums.CityName.NewTokyo:
      ns.bladeburner.switchCity(ns.enums.CityName.Ishima)
      break;
    case ns.enums.CityName.Ishima:
      ns.bladeburner.switchCity(ns.enums.CityName.Sector12)
      break;
  }
}

async function startAction(ns: NS, [type, action]: [Type, Action | Contract | Operation | BlackOp]): Promise<void> {
  ns.print(`Starting ${type} ${action}`);

  let time = ns.bladeburner.getActionTime(type, action);
  if (ns.bladeburner.getBonusTime() > 5000) {
    time = time * 0.2
  }
  ns.bladeburner.startAction(type, action);
  await ns.sleep(time);
}

function getContract(ns: NS): [Type, Contract] | null {
  const contracts = [
    Contract.BountyHunter,
    Contract.Retirement,
    Contract.Tracking,
  ]
    .map(c => {
      const count = ns.bladeburner.getActionCountRemaining(Type.Contract, c);
      const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance(Type.Contract, c);
      return { contract: c, count, min, max };
    })
    .filter(c => c.count > 0)
    .filter(c => c.min >= 0.8)
    .filter(c => c.max >= 1)
    .sort((a, b) => b.min - a.min);
  if (contracts.length === 0) {
    return null;
  }
  return [Type.Contract, contracts[0].contract];
}


function getOperation(ns: NS): [Type, Operation] | null {
  const operations = [
    Operation.Assassination,
    Operation.Investigation,
    Operation.Raid,
    Operation.StealthRetirementOperation,
    Operation.StingOperation,
    Operation.UndercoverOperation,
  ]
    .map(op => {
      const count = ns.bladeburner.getActionCountRemaining(Type.Operation, op);
      const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance(Type.Operation, op);
      return { operation: op, count, min, max };
    })
    .filter(c => c.count > 0)
    .filter(c => c.min >= 0.8)
    .filter(c => c.max >= 1)
    .sort((a, b) => b.min - a.min);
  if (operations.length === 0) {
    return null;
  }
  return [Type.Operation, operations[0].operation];
}

function getBlackOp(ns: NS): [Type, BlackOp] | null {
  const blackOps = [
    BlackOp.Typhoon,
    BlackOp.Zero,
    BlackOp.X,
    BlackOp.Titan,
    BlackOp.Ares,
    BlackOp.Archangel,
    BlackOp.Juggernaut,
    BlackOp.Red,
    BlackOp.K,
    BlackOp.Deckard,
    BlackOp.Tyrell,
    BlackOp.Wallace,
    BlackOp.Shoulder,
    BlackOp.Hyron,
    BlackOp.Morpheus,
    BlackOp.Ion,
    BlackOp.Annihilus,
    BlackOp.Ultron,
    BlackOp.Centurion,
    BlackOp.Vindictus,
    BlackOp.Daedalus,
  ]
    .map(bo => {
      const count = ns.bladeburner.getActionCountRemaining(Type.BlackOp, bo);
      const rank = ns.bladeburner.getBlackOpRank(bo);
      const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance(Type.BlackOp, bo);
      return { blackOp: bo, count, rank, min, max };
    })
    .filter(c => c.min >= 0.8)
    .filter(c => c.max >= 1)
    .filter(c => c.count > 0)
    .filter(c => c.rank <= ns.bladeburner.getRank())
    .sort((a, b) => {
      if (a.rank > b.rank) {
        return 1;
      } else if (a.rank < b.rank) {
        return -1;
      } else {
        return 0;
      }
    });

  if (blackOps.length === 0) {
    return null;
  }
  return [Type.BlackOp, blackOps[0].blackOp];
}
