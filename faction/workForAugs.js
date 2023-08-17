/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();

  let ownedAugs = ns.singularity.getOwnedAugmentations();
  let factionsWithAugs = ns.getPlayer().factions
    .filter(x=> x != "Shadows of Anarchy")
    .map(faction => {
      let factionAugs = ns.singularity.getAugmentationsFromFaction(faction)
        .filter(x => !ownedAugs.includes(x) && x != "NeuroFlux Governor")
        .map(x => { return { name: x, rep: ns.singularity.getAugmentationRepReq(x) } });
      return { name: faction, augs: factionAugs };
    })
    .filter(x => x.augs.length)
    .sort((a, b) => {
      if (a.augs[0].rep > b.augs[0].rep) {
        return 1;
      }
      if (a.augs[0].rep < b.augs[0].rep) {
        return -1;
      }
      return 0;
    });
  
  for (const faction of factionsWithAugs) {
    for (const aug of faction.augs) {
      ns.singularity.workForFaction(faction.name, "hacking", false);
      ns.singularity.workForFaction(faction.name, "security", false);
      ns.print(`working for ${faction.name}`);
      let rep = ns.singularity.getFactionRep(faction.name);
      while (rep < aug.rep) {
        await ns.sleep(1000);
        ns.print(`waiting for rep ${aug.rep} for ${aug.name}`)
        rep = ns.singularity.getFactionRep(faction.name);
      }
      let price = ns.singularity.getAugmentationPrice(aug.name);
      while (ns.getServerMoneyAvailable("home") < price) {
        ns.print(`waiting for rep ${price} for ${aug.name}`)
        await ns.sleep(1000);
      }
      ns.singularity.purchaseAugmentation(faction.name, aug.name);
    }
  }
}

const factions = [
  "Illuminati",
  "Daedalus",
  "The Covenant",
  "ECorp",
  "MegaCorp",
  "Bachman & Associates",
  "Blade Industries",
  "NWO",
  "Clarke Incorporated",
  "OmniTek Incorporated",
  "Four Sigma",
  "KuaiGong International",
  "Fulcrum Secret Technologies",
  "BitRunners",
  "The Black Hand",
  "NiteSec",
  "Volhaven",
  "Speakers for the Dead",
  "The Syndicate",
  "Tetrads",
  "Slum Snakes",
  "Netburners",
  "Tian Di Hui",
  "CyberSec",
  "Silhouette"
]