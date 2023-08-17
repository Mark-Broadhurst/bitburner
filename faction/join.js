/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const withAugs = ns.args[0] ?? false;
  const augs = ns.singularity.getOwnedAugmentations();
  while (true) {
    let factions = ns.singularity.checkFactionInvitations()
      .filter(faction => faction != "Sector-12" && faction != "Aevum" & faction != "Volhaven" && faction != "Chongqing" && faction != "New Tokyo" && faction != "Ishima");
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