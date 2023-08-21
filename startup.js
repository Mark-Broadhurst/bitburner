/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.run("programs/buy.js");
  ns.run("hacking/nuke-all.js");
  ns.run("hacking/backdoor.js");

  ns.run("servers/purchase.js");
  ns.run("home/upgrade.js");
  ns.run("sleeves/work.js");
  ns.run("sleeves/augments.js");
  if(ns.gang.inGang()){
    ns.run("gangs/equipment.js");
    ns.run("gangs/ascend.js", 1, 1.5);
    ns.run("gangs/recruit.js");
    //ns.run("./gangs/tasks.js");
  }
  await ns.sleep(5 * 1000);
  ns.run("hacking/refresh.js");
  ns.run("faction/join.js", 1, false);

  ns.print("Waiting for formulas")
  while (!ns.fileExists("Formulas.exe") && !ns.fileExists("SQLInject.exe")) {
    await ns.sleep(10 * 1000);
  }
  ns.run("job/apply.js");
  ns.run("servers/upgrade.js");
  ns.run("faction/bribe.js");
  ns.run("hacking/refresh.js");
  ns.run("scriptManager.js", 1,"train.js", "kill45.js", "job/workForFaction.js", "faction/workForRep.js", "job/workForPosition.js", "faction/workForAugs.js")
}