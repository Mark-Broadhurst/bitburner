/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.exec("./programs/buy.js", "home");
  ns.exec("./hacking/nuke-all.js", "home");
  ns.exec("./hacking/backdoor.js", "home");
  //ns.exec("train.js", "home");
  ns.exec("./servers/purchase.js", "home");
  ns.exec("./home/upgrade.js", "home");
  ns.exec("./sleeves/work.js", "home");
  ns.exec("./sleeves/augments.js", "home");
  if(ns.gang.inGang()){
    ns.exec("./gangs/equipment.js", "home");
    ns.exec("./gangs/ascend.js", "home");
    ns.exec("./gangs/recruit.js", "home");
    //ns.exec("./gangs/tasks.js", "home");
  }
  await ns.sleep(5 * 1000);
  ns.exec("./hacking/local.js", "home");
  ns.exec("./hacking/remote.js", "home");
  ns.exec("./faction/join.js", "home", 1, false);

  ns.print("Waiting for formulas")
  while (!ns.fileExists("Formulas.exe") && !ns.fileExists("SQLInject.exe")) {
    await ns.sleep(10 * 1000);
  }
  ns.exec("./servers/upgrade.js", "home");
}