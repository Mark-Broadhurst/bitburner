/** @param {NS} ns */
export async function main(ns) {
  ns.clearLog();
  let gangCount = 0;
  
  while(true){
    while(ns.gang.canRecruitMember())
    {
      ns.gang.recruitMember("gang-" + gangCount);
      gangCount++;
    }
    await ns.sleep(1000);
  }
}