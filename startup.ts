import { NS } from "@ns";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.killall();
  ns.run("scriptManager.js", 1, "Programs/buy.js", "Cloud/purchase.js", "Faction/bribe.js");
  ns.run("Hacking/nuke-all.js");
  ns.run("Hacking/backdoor.js");
  ns.run("upgrade.js");
  //ns.run("Hacknet/sellHashes.js");
  ns.run("Hacknet/spendHashes.js");
  //ns.run("Hacknet/buyCompanyFavour.js");
  //ns.run("hacking/targetStatus.js");
  if (ns.gang.inGang()) {
    ns.run("Gang/equipment.js");
    ns.run("Gang/tasks.js");
  }
  if (ns.corporation.hasCorporation()) {
    ns.run("Corporation/products.js");
    ns.run("Corporation/officeManagement.js");
    //ns.run("Corporation/warehouseManagement.js");
  }
  if (ns.bladeburner.inBladeburner()) {
    ns.run("Bladeburner/tasks.js");
    ns.run("Bladeburner/skills.js");
    //ns.run("Sleeve/diplomacy.js");
  }
  //ns.run("Sleeve/augments.js");
  ns.run("Faction/join.js", 1, false);
  ns.run("scriptManager.js", 1, "Programs/create.js", "kill30.js", "Job/workForFaction.js", "Job/workForPosition.js", "Faction/workForRep.js", "Faction/workForAugs.js")
  ns.run("Stanek/charge.js");
  await ns.sleep(1000);
  ns.run("scriptManager.js", 1, "Hacking/prepTargets.js", "Hacking/hackCommander.js");
}