/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const threshold = ns.args[0] ?? 1.5;
  while(true){
    ns.clearLog();
    for(const memberName of ns.gang.getMemberNames()){
      const result = ns.gang.getAscensionResult(memberName);

      if(result){
        ns.print(memberName + " " + JSON.stringify(result));
        if(result.agi > threshold || 
          result.cha > threshold || 
          result.def > threshold || 
          result.hack > threshold || 
          result.str > threshold)
        {
            ns.gang.ascendMember(memberName);
            ns.toast(`Ascended ${memberName}`);
        }
      }
    }
    await ns.sleep(1000);
  }
}