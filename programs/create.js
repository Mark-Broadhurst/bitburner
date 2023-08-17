/** 
 * @param {NS} ns 
 * @param {string} filename 
 * @param {number} reqHackLevel
 * */
async function createProgram(ns, fileName, reqHackLevel)
{
  const player = ns.getPlayer();
  if(!ns.fileExists(fileName) && reqHackLevel < (ns.getHackingLevel() + player.skills.intelligence))
  {
    ns.print(`Creating ${fileName}`)
    ns.singularity.createProgram(fileName);
    while(!ns.fileExists(fileName)){
      await ns.sleep(1000);
    }
  }

}

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("sleep");
  ns.clearLog();
  await createProgram(ns, "AutoLink.exe", 25);
  await createProgram(ns, "BruteSSH.exe", 50);
  await createProgram(ns, "DeepscanV1.exe", 75);
  await createProgram(ns, "ServerProfiler.exe", 75);
  await createProgram(ns, "FTPCrack.exe", 100);
  await createProgram(ns, "relaySMTP.exe", 250);
  await createProgram(ns, "DeepscanV2.exe", 400);
  await createProgram(ns, "HTTPWorm.exe", 500);
  await createProgram(ns, "SQLInject.exe", 750);
  await createProgram(ns, "Formulas.exe", 1000);
}