/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const memberName = ns.args[0];
  await TrainGang(ns, 300, memberName);
  await GainRepToGetMembers(ns, memberName);
  ns.gang.setMemberTask(memberName, "Territory Warfare");
  await EngageInTerritoryWar(ns, memberName);
  ns.gang.setMemberTask(memberName, "Human Trafficking");
  await TrainGang(ns, 2_000, memberName);
  ns.gang.setMemberTask(memberName, "Human Trafficking");
}

/** 
 * @param {NS} ns 
 * @param {Number} target
 * @param {String} memberName
 **/
async function TrainGang(ns, target, memberName) {
  let member = ns.gang.getMemberInformation(memberName);
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

}

/** @param {NS} ns */
async function GainRepToGetMembers(ns, memberName) {
  let gang = ns.gang.getGangInformation();
  while (gang.respect < 2e6) {
    ns.clearLog();
    ns.print("Wanted: " + gang.wantedPenalty + "\nRespect: " + gang.respect);
    if (gang.wantedPenalty < 0.99 && gang.respect > 2000) {
      ns.gang.setMemberTask(memberName, "Vigilante Justice");
      ns.print("Reducing wanted level");
    }
    else {
      ns.gang.setMemberTask(memberName, "Terrorism");
      ns.print("Gaining Reputation");
    }
    gang = ns.gang.getGangInformation();
    await ns.sleep(1000);
  }
}

/** @param {NS} ns */
async function EngageInTerritoryWar(ns, memberName) {
  let gang = ns.gang.getGangInformation();
  if (gang.territory == 1) {
    return;
  }
  let otherGangs = ns.gang.getOtherGangInformation();

  const mostPowerfulGang = [
    "Slum Snakes",
    "Tetrads",
    "The Syndicate",
    "The Dark Army",
    "Speakers for the Dead",
    "NiteSec",
    "The Black Hand"
  ].filter(x => x != gang.faction)
    .filter(x => otherGangs[x].territory)
    .reduce((a, b) => {
      if (otherGangs[a].power > otherGangs[b].power) {
        return a;
      }
      return b;
    });

  while (gang.territory < 1 || gang.power < (mostPowerfulGang.power * 10)) {
    ns.clearLog();
    if (gang.wantedPenalty < 0.999 && gang.respect > 2000) {
      ns.gang.setMemberTask(memberName, "Vigilante Justice");
      ns.print(`Reducing wanted level currently ${gang.wantedPenalty} / 0.99`);
    }
    else {
      ns.gang.setMemberTask(memberName, "Territory Warfare");
      ns.print(`Gaining Gang Power currently ${gang.power}\\${otherGangs[mostPowerfulGang].power} ${mostPowerfulGang} ${gang.territory < 1} ${gang.power} > ${mostPowerfulGang.power * 10}`);
    }
    gang = ns.gang.getGangInformation();
    await ns.sleep(1000);
  }
}
