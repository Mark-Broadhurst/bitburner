import { NS, GangMemberAscension } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const threshold = ns.args[0] as number ?? 1.1;
    while(true){
      ns.clearLog();
      for(const memberName of ns.gang.getMemberNames()){
        const result = ns.gang.getAscensionResult(memberName) as GangMemberAscension;
  
        if(result){
          ns.print(memberName + " " + JSON.stringify(result));
          if(result.agi > threshold || 
            result.cha > threshold || 
            result.def > threshold || 
            result.hack > threshold || 
            result.str > threshold)
          {
              ns.gang.ascendMember(memberName);
              ns.kill("gangs/train.js", "home", memberName);
              ns.run("gangs/train.js", 1, memberName);
              ns.toast(`Ascended ${memberName}`);
          }
        }
      }
      await ns.sleep(1000);
    }
}
