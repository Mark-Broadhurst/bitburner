import { NS } from "@ns";

export async function main(ns: NS) {
  //ns.disableLog("ALL");
  ns.clearLog();
  ns.killall();
  ns.run("scriptManager.js", 1,"programs/buy.js","servers/purchase.js", "servers/upgrade.js","hacknet/upgrade.js");
  ns.run("hacking/nuke-all.js");
  ns.run("hacking/backdoor.js");
  ns.run("home/upgrade.js");
  ns.run("hacknet/sellHashes.js");
  ns.run("hacknet/spendHashes.js");
  //ns.run("hacknet/improveServers.js");
  if (ns.gang.inGang()) {
    ns.run("gangs/equipment.js");
    ns.run("gangs/ascend.js", 1, 1.5);
    ns.run("gangs/recruit.js");
    ns.run("gangs/tasks.js");
  /*
    ns.run("gangs/territoryWarfare.js"); 
  */
  }
  ns.run("sleeves/augments.js");
  ns.run("faction/join.js", 1, true);
  ns.run("scriptManager.js", 1,"programs/create.js","job/workForFaction.js","job/workForPosition.js","faction/workForRep.js","faction/workForAugs.js","kill45.js")
  ns.run("hacknet/buyCompanyFavour.js");
  ns.run("faction/bribe.js");
  ns.run("scriptManager.js", 1,"hacking/prepTargets.js","hacking/hackCommander.js");
}