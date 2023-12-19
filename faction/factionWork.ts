import { NS, FactionWorkType, Person } from "@ns";
import { FactionWork } from "utils/factions";

export function getBestField(ns: NS, faction: string, person: Person): FactionWorkType {
  const favour = ns.singularity.getFactionFavor(faction);
  const workTypes = FactionWork(ns)
    .find(fw => fw.faction == faction)
    ?.work ?? [];
  let gains = workTypes.map(workType => {
    return { name: workType, gain: ns.formulas.work.factionGains(person, workType, favour) };
  })
    .reduce((a, b) => {
      if (a.gain.reputation > b.gain.reputation) {
        return a;
      }
      return b;
    })
  return gains.name;
}
