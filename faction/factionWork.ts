import { NS, FactionWorkType, Person } from "@ns";


export function getBestField(ns : NS, faction :string, person:Person) : FactionWorkType {
    let FactionWorkType = ns.enums.FactionWorkType;
    const favour = ns.singularity.getFactionFavor(faction);
    let gains = [
      { name: FactionWorkType.hacking, gain: ns.formulas.work.factionGains(person, FactionWorkType.hacking, favour) },
      { name: FactionWorkType.security, gain: ns.formulas.work.factionGains(person, FactionWorkType.security, favour) },
      { name: FactionWorkType.field, gain: ns.formulas.work.factionGains(person, FactionWorkType.field, favour) },
    ]
      .reduce((a, b) => {
        if (a.gain.reputation > b.gain.reputation) {
          return a;
        }
        return b;
      })
    return gains.name;
  }
  