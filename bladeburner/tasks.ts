import { CityName, NS } from "@ns";
import { Type, Action, Contract, Operation, BlackOp, BladeburnerAction, contracts, operations, blackOps } from "bladeburner/enums";

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
  contracts
    .map(c => {
      const count = ns.bladeburner.getActionCountRemaining("contract", c);
      const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance("contract", c);
      return { contract: c, count, min, max };
    })
    .filter(c => c.count > 0)
    .filter(c => c.min >= 0.8)
    .filter(c => c.max >= 1)
    .sort((a, b) => b.min - a.min);
  if (contracts.length === 0) {
    return null;
  }
  return ["contract", contracts[0]];
}


function getOperation(ns: NS): [Type, Operation] | null {
  operations
    .map(op => {
      const count = ns.bladeburner.getActionCountRemaining("op", op);
      const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance("op", op);
      return { operation: op, count, min, max };
    })
    .filter(c => c.count > 0)
    .filter(c => c.min >= 0.8)
    .filter(c => c.max >= 1)
    .sort((a, b) => b.min - a.min);
  if (operations.length === 0) {
    return null;
  }
  return ["op", operations[0]];
}

function getBlackOp(ns: NS): [Type, BlackOp] | null {
  blackOps
    .map(bo => {
      const count = ns.bladeburner.getActionCountRemaining("blackop", bo);
      const rank = ns.bladeburner.getBlackOpRank(bo);
      const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance("blackop", bo);
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
  return ["blackop", blackOps[0]];
}
