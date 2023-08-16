/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const factions = ns.getPlayer().factions
    .filter(x => x != "Shadows of Anarchy")
    .filter(x => (ns.singularity.getFactionFavor(x) + ns.singularity.getFactionFavorGain(x)) <= 150)
    .sort((a, b) => {
      const aFav = ns.singularity.getFactionFavor(a);
      const bFav = ns.singularity.getFactionFavor(b);
      if (aFav > bFav) {
        return -1;
      }
      if (aFav < bFav) {
        return 1;
      }
      return 0;
    });

  factions.forEach(faction=> {
    let rep = ns.formatNumber(ns.singularity.getFactionRep(faction));
    let fav = ns.formatNumber(ns.singularity.getFactionFavor(faction));
    ns.print(`${faction} ${fav} ${rep}`);
  });

  for (let i = 0; i < factions.length; i++) {
    let faction = factions[i];
    ns.singularity.workForFaction(faction, "hacking", false);
    ns.singularity.workForFaction(faction, "security", false);
    ns.print(`working for ${faction}`);
    const currentFav = ns.singularity.getFactionFavor(faction);
    let fav = currentFav + ns.singularity.getFactionFavorGain(faction);
    while (fav <= 150) {
      await ns.sleep(1000);
      ns.print(`waiting for Favour for ${faction} : ${ns.formatNumber(fav,0)}`);
      fav = ns.singularity.getFactionFavorGain(faction) + currentFav;
    }
  }

  ns.exec("faction/workForAugs.js", "home");
}