/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const memberName = ns.args[0];
  let member = ns.gang.getMemberInformation(memberName);
  let gang = ns.gang.getGangInformation();
  let target = 300;
  while (member.hack < target || member.str < target || member.def < target || member.dex < target || member.agi < target || member.cha < target) {
    ns.clearLog();
    ns.gang.setMemberTask(memberName, "Train Combat");
    while (member.str < target || member.def < target || member.dex < target || member.agi < target) {
      await ns.sleep(1000);
      ns.print("Waiting for combat training");
      member = ns.gang.getMemberInformation(memberName);
    }
    ns.gang.setMemberTask(memberName, "Train Hacking");
    while (member.hack < target) {
      await ns.sleep(1000);
      ns.print("Waiting for hacking training");
      member = ns.gang.getMemberInformation(memberName);
    }
    ns.gang.setMemberTask(memberName, "Train Charisma");
    while (member.cha < target) {
      await ns.sleep(1000);
      ns.print("Waiting for charisma training");
      member = ns.gang.getMemberInformation(memberName);
    }
    member = ns.gang.getMemberInformation(memberName);
  }
  while(gang.respect < 2e6)
  {
    ns.clearLog();
    ns.print("Wanted: " + gang.wantedPenalty + "\nRespect: " + gang.respect);
    if(gang.wantedPenalty < 0.99 && gang.respect > 2000)
    {
      ns.gang.setMemberTask(memberName, "Vigilante Justice");
      ns.print("Reducing wanted level");
    }
    else
    {
      ns.gang.setMemberTask(memberName, "Terrorism");
      ns.print("Gaining Reputation");
    }
    gang = ns.gang.getGangInformation();
    await ns.sleep(1000);
  }
  ns.gang.setMemberTask(memberName, "Territory Warfare");

  while(gang.territory < 100)
  {
    ns.clearLog();
    if(gang.wantedPenalty < 0.999 && gang.respect > 2000)
    {
      ns.gang.setMemberTask(memberName, "Vigilante Justice");
      ns.print(`Reducing wanted level currently ${gang.wantedPenalty} / 0.99`);
    }
    else
    {
      ns.gang.setMemberTask(memberName, "Territory Warfare");
      ns.print(`Gaining Gang Power currently ${gang.power}`);
    }

    gang = ns.gang.getGangInformation();
    await ns.sleep(1000);
  }
}