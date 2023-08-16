/** @param {NS} ns */
export async function main(ns) {
  let playerFactions = ns.getPlayer().factions;
  playerFactions.push(ns.singularity.checkFactionInvitations());
  let factionsToJoin = factions.filter(x=> !playerFactions.includes(x));

  ns.print(factionsToJoin);


}

const factions = [
  "CyberSec",
  "Tian Di Hui",
  "Netburners",
  "NiteSec",
  "The Black Hand",
  "BitRunners",
  "Slum Snakes",
  "Tetrads",
  "The Syndicate",
  "Speakers for the Dead",
  "The Dark Army",
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
  "Silhouette",
  "Sector-12",
  "Aevum",
  "Volhaven",
  "Chongqing",
  "New Tokyo",
  "Ishima",
  "Illuminati",
  "Daedalus",
  "The Covenant",
  "Shadows of Anarchy"
]