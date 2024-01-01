import { NS } from "@ns";
import { Factions, isExclusiveFaction } from "/utils/factions";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const withAugs = ns.args[0] ?? false;
    const augs = ns.singularity.getOwnedAugmentations();
    while (true) {
      let factions = ns.singularity.checkFactionInvitations()
        .map(faction => faction as Factions)
        .filter(f => !isExclusiveFaction(f));
      if (withAugs) {
        factions = factions.filter(faction => ns.singularity.getAugmentationsFromFaction(faction)
          .filter(x => !augs.includes(x)).length);
      }
      for(const faction of factions){
        ns.singularity.joinFaction(faction);
        ns.print(`joined ${faction} faction`);
        ns.toast(`joined ${faction} faction`);
      }
  
      await ns.sleep(10000);
    }
}
