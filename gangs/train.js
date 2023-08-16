/** @param {NS} ns */
export async function main(ns) {
  const member = ns.args[0];
  let memberInfo  = ns.gang.getMemberInformation(member);
  let target = 100;
  while (memberInfo.hack > target && memberInfo.str > target && memberInfo.def > target && memberInfo.dex > target && memberInfo.agi > target && memberInfo.cha > target){
      ns.gang.setMemberTask(member,"Train Combat");
      while(memberInfo.str > target && memberInfo.def > target && memberInfo.dex > target && memberInfo.agi > target)
      {
        await ns.sleep(60000);
        memberInfo  = ns.gang.getMemberInformation(member);
      }
      ns.gang.setMemberTask(member,"Train Hacking");
      while(memberInfo.hack > target)
      {
        await ns.sleep(60000);
        memberInfo  = ns.gang.getMemberInformation(member);
      }
      ns.gang.setMemberTask(member,"Train Charisma");
      while(memberInfo.hack > target)
      {
        await ns.sleep(60000);
        memberInfo  = ns.gang.getMemberInformation(member);
      }
    target = target + 100;
  }

}