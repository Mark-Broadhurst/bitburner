import { NS, FactionWorkType } from "@ns";


export function getBestField(ns : NS, faction :string) : FactionWorkType {
    let FactionWorkType = ns.enums.FactionWorkType;
    const player = ns.getPlayer();
    const favour = ns.singularity.getFactionFavor(faction);
    let gains = [
      { name: FactionWorkType.hacking, gain: ns.formulas.work.factionGains(player, FactionWorkType.hacking, favour) },
      { name: FactionWorkType.security, gain: ns.formulas.work.factionGains(player, FactionWorkType.security, favour) },
      { name: FactionWorkType.field, gain: ns.formulas.work.factionGains(player, FactionWorkType.field, favour) },
    ]
      .reduce((a, b) => {
        if (a.gain.reputation > b.gain.reputation) {
          return a;
        }
        return b;
      })
    return gains.name;
  }
  