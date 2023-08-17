/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    const minFavour = 150;
    const maxRep = 3_000_000;
    

    const factions = ns.getPlayer().factions
      .filter((faction) => ns.singularity.getFactionFavor(faction) > minFavour && 
        faction != "Shadows of Anarchy" && 
        ns.singularity.getFactionRep(faction) < maxRep);
    
    for(const faction of factions)
    {
      while(ns.singularity.getFactionRep(faction) < maxRep)
      {
        const money = ns.getServerMoneyAvailable("home");
        let donationAmount = 0;
        if(money > 1e15){
          donationAmount = 1e15;
        } else if(money > 1e14){
          donationAmount = 1e14;
        } else if(money > 1e13){
          donationAmount = 1e13;
        } else if(money > 1e12){
          donationAmount = 1e12;
        } else if(money > 1e11){
          donationAmount = 1e11;
        } else if(money > 1e10){
          donationAmount = 1e10;
        } else if(money > 1e9){
          donationAmount = 1e9;
        } else if(money > 1e6){
          donationAmount = 1e6;
        }
    

        ns.clearLog();
        printFactionReps(ns, factions);
        ns.print(`donating ${ns.formatNumber(donationAmount)} to ${faction}`);
        ns.singularity.donateToFaction(faction, donationAmount);
        await ns.sleep(100);
      }
    }

}

/** 
 * @param {NS} ns
 * @param {string[]} factions
 */
function printFactionReps(ns, factions)
{
  ns.print("Faction\t\t\t\tRep");
  for(const faction of factions)
  {
    ns.print(`${faction.padEnd(25)}\t${ns.formatNumber(ns.singularity.getFactionRep(faction))}`);
  }
}