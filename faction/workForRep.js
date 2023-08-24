/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.tail();
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

  for (const faction of factions) {
    ns.hacknet.purchaseNode()
    const workType = factionGainWork(ns,faction);
    ns.singularity.workForFaction(faction, "hacking", false);
    ns.singularity.workForFaction(faction, "field", false);
    ns.singularity.workForFaction(faction, "security", false);
    ns.singularity.workForFaction(faction, workType, false);
    ns.print(`working for ${faction} as ${workType}`);
    const currentFav = ns.singularity.getFactionFavor(faction);
    let fav = currentFav + ns.singularity.getFactionFavorGain(faction);
    while (fav <= 150) {
      ns.clearLog();
      printFactions(ns, factions);
      ns.print(`waiting for Favour for ${faction}: ${workType} : ${ns.formatNumber(fav,0)} / 150`);
      await ns.sleep(1000);
      fav = ns.singularity.getFactionFavorGain(faction) + currentFav;
    }
  }
  ns.run("faction/workForAugs.js");
}

/** 
 * @param {NS} ns
 * @param {string[]} factions */
function printFactions(ns, factions){
  ns.print("Faction\t\t\t\tFavour\tRep");
  for (const faction of factions) {
    let rep = ns.formatNumber(ns.singularity.getFactionRep(faction));
    let fav = ns.formatNumber(ns.singularity.getFactionFavor(faction));
    ns.print(`${faction.padEnd(25)}\t${fav}\t${rep}`);
  };
}

/** 
 * @param {NS} ns
 * @param {string} faction
 */
function factionGainWork(ns, faction){
  const player = ns.getPlayer();
  const favour = ns.singularity.getFactionFavor(faction);
  const result = ["hacking","field","security"]
  .map(factionWorkType=>{
    return {name: factionWorkType, gain:ns.formulas.work.factionGains(player,factionWorkType, favour) };
  })
  .reduce((a,b) =>{
    if(a.gain < b.gain)
    {
      return a;
    }
    return b;
  });
  return result.name;
}