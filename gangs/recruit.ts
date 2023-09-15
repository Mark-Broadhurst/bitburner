import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    let gangCount = 0;
    while(ns.gang.getMemberNames().length < 12){
      ns.clearLog();
      ns.print("Recruiting members " + ns.gang.getMemberNames().length + "/12");
      while(ns.gang.canRecruitMember())
      {
        ns.gang.recruitMember("gang-" + gangCount);
        ns.run("gangs/train.js", 1, "gang-" + gangCount);
        gangCount++;
      }
      await ns.sleep(1000);
    }
}
