import { CityName, NS, BladeburnerActionName, BladeburnerActionType, BladeburnerContractName, BladeburnerOperationName, BladeburnerBlackOpName } from "@ns";
import { BladeburnerAction } from "Bladeburner/enums";

// All six playable cities — used for chaos/community queries throughout this file.
// Defined once here to avoid repeating the array in every function.
const CITIES = (ns: NS): CityName[] => {
    const C = ns.enums.CityName;
    return [C.Sector12, C.Aevum, C.Volhaven, C.Chongqing, C.NewTokyo, C.Ishima];
};

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  ns.disableLog("ALL");

  while (true) {
    ns.clearLog();
    const player = ns.getPlayer();
    if (player.hp.current < player.hp.max) {
      ns.print("Healing");
      await startAction(ns, BladeburnerAction.HyperbolicRegenerationChamber);
    } else if (getStaminaPercentage(ns) > 0.5) {
      await startStaminaAction(ns);
    } else {
      await startFreeAction(ns);
    }
    await ns.bladeburner.nextUpdate();
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

function travelToCityWithCommunities(ns: NS) {
  const city = CITIES(ns)
    .reduce((acc, city) => {
      const aCommunities = ns.bladeburner.getCityCommunities(acc);
      const bCommunities = ns.bladeburner.getCityCommunities(city);
      return aCommunities < bCommunities ? acc : city;
    });
  ns.print(`Switching to ${city}`);
  ns.bladeburner.switchCity(city);
}

function lowChaosCity(ns: NS): CityName {
  return CITIES(ns)
    .reduce((acc, city) => {
      const aChaos = ns.bladeburner.getCityChaos(acc);
      const bChaos = ns.bladeburner.getCityChaos(city);
      return aChaos < bChaos ? acc : city;
    });
}

function highChaosCity(ns: NS): CityName {
  return CITIES(ns)
    .reduce((acc, city) => {
      const aChaos = ns.bladeburner.getCityChaos(acc);
      const bChaos = ns.bladeburner.getCityChaos(city);
      return aChaos > bChaos ? acc : city;
    });
}

async function startFreeAction(ns: NS) {
  const high = highChaosCity(ns);
  const low = lowChaosCity(ns);
  if (usedAllActions(ns)) {
    await startAction(ns, BladeburnerAction.InciteViolence);
  } else if (high === low) {
    await startFieldAnalysis(ns);
  } else {
    await startAction(ns, BladeburnerAction.Diplomacy);
  }
}

function usedAllActions(ns: NS): boolean {
  const BB = ns.enums.BladeburnerActionType;
  const communities = CITIES(ns)
    .reduce((acc, city) => {
      acc += ns.bladeburner.getCityCommunities(city);
      return acc;
    }, 0);

  let actionTotal = 0;
  ns.bladeburner.getContractNames().forEach(c => actionTotal += ns.bladeburner.getActionCountRemaining(BB.Contract, c));
  ns.bladeburner.getOperationNames().forEach(c => actionTotal += ns.bladeburner.getActionCountRemaining(BB.Operation, c));

  ns.print(`Actions remaining: ${actionTotal} / ${communities}`);
  return (communities >= actionTotal);
}

async function startFieldAnalysis(ns: NS) {
  switchCity(ns);
  await startAction(ns, BladeburnerAction.FieldAnalysis);
}

function getStaminaPercentage(ns: NS): number {
  const [current, max] = ns.bladeburner.getStamina();
  ns.print(`Stamina: ${ns.format.percent(current / max)}`);
  return current / max;
}

function switchCity(ns: NS) {
  const CityName = ns.enums.CityName;
  switch (ns.bladeburner.getCity()) {
    case CityName.Sector12:   ns.bladeburner.switchCity(CityName.Aevum);    break;
    case CityName.Aevum:      ns.bladeburner.switchCity(CityName.Volhaven); break;
    case CityName.Volhaven:   ns.bladeburner.switchCity(CityName.Chongqing);break;
    case CityName.Chongqing:  ns.bladeburner.switchCity(CityName.NewTokyo); break;
    case CityName.NewTokyo:   ns.bladeburner.switchCity(CityName.Ishima);   break;
    case CityName.Ishima:     ns.bladeburner.switchCity(CityName.Sector12); break;
  }
}

async function startAction(ns: NS, [type, action]: [BladeburnerActionType, BladeburnerActionName]): Promise<void> {
  ns.print(`Starting ${type} ${action}`);

  let time = ns.bladeburner.getActionTime(type, action);
  if (ns.bladeburner.getBonusTime() > 5000) {
    time = time * 0.2;
  }
  ns.bladeburner.startAction(type, action);
  await ns.sleep(time);
}

function getNext<T extends BladeburnerContractName | BladeburnerOperationName>(
  ns: NS,
  type: BladeburnerActionType,
  list: T[],
): [BladeburnerActionType, T] | null {
  const actions = list
    .map(c => {
      const count = ns.bladeburner.getActionCountRemaining(type, c);
      const [min, max] = ns.bladeburner.getActionEstimatedSuccessChance(type, c);
      ns.print(`${c.padEnd(29)} ${count} ${ns.format.percent(min)} ${ns.format.percent(max)}`);
      return { contract: c, count, min, max };
    })
    .filter(c => c.count !== 0)
    .filter(c => c.min >= 0.8)
    .filter(c => c.max >= 1)
    .sort((a, b) => b.min - a.min)
    .map(c => c.contract);
  ns.print(actions);
  if (actions.length === 0) {
    return null;
  }
  return [type, actions[0]];
}

function getContract(ns: NS): [BladeburnerActionType, BladeburnerContractName] | null {
  return getNext(ns, ns.enums.BladeburnerActionType.Contract, ns.bladeburner.getContractNames());
}

function getOperation(ns: NS): [BladeburnerActionType, BladeburnerOperationName] | null {
  return getNext(ns, ns.enums.BladeburnerActionType.Operation, ns.bladeburner.getOperationNames());
}

function getBlackOp(ns: NS): [BladeburnerActionType, BladeburnerBlackOpName] | null {
  const next = ns.bladeburner.getNextBlackOp();
  const rank = ns.bladeburner.getRank();

  if (next == null || rank < next.rank) {
    return null;
  }
  return [ns.enums.BladeburnerActionType.BlackOp, next.name];
}
