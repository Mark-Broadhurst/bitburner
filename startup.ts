import { NS } from "@ns";

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.killall();
  ns.run("scriptManager.js", 1, "programs/buy.js", "servers/purchase.js", "servers/upgrade.js", "faction/bribe.js", "hacknet/upgrade.js");
  ns.run("hacking/nuke-all.js");
  ns.run("hacking/backdoor.js");
  ns.run("home/upgrade.js");
  //ns.run("hacknet/sellHashes.js");
  ns.run("hacknet/spendHashes.js");
  ns.run("hacknet/improveServers.js");
  //ns.run("hacknet/buyCompanyFavour.js");
  //ns.run("hacking/targetStatus.js");
  if (ns.gang.inGang()) {
    ns.run("gangs/equipment.js");
    ns.run("gangs/tasks.js");
  }
  if (ns.corporation.hasCorporation()) {
    ns.run("corp/products.js");
    ns.run("corp/officeManagement.js");
    //ns.run("corp/warehouseManagement.js");
  }
  if (ns.bladeburner.inBladeburner()) {
    ns.run("bladeburner/tasks.js");
    ns.run("bladeburner/skills.js");
    //ns.run("sleeves/diplomacy.js");
  }
  //ns.run("sleeves/augments.js");
  ns.run("faction/join.js", 1, false);
  ns.run("scriptManager.js", 1, "programs/create.js", "kill30.js", "job/workForFaction.js", "job/workForPosition.js", "faction/workForRep.js", "faction/workForAugs.js")
  ns.run("stanek/charge.js");
  await ns.sleep(1000);
  ns.run("scriptManager.js", 1, "hacking/prepTargets.js", "hacking/hackCommander.js");
}