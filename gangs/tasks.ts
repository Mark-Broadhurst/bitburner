import { GangGenInfo, GangMemberInfo, NS } from "@ns";

const skillSteps = [30, 100, 300, 2000, 5000];
const repSteps = [625, 8, 2e6, 5e6];
const currentStep = 0;


export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();

  while (true) {
    await ns.gang.nextUpdate();

    const gang = ns.gang.getGangInformation();
    for (const member of ns.gang.getMemberNames()) {
      const memberInfo = ns.gang.getMemberInformation(member);
      if (memberInfo.str < skillSteps[currentStep] || memberInfo.def < skillSteps[currentStep] || memberInfo.dex < skillSteps[currentStep] || memberInfo.agi < skillSteps[currentStep]) {
        ns.gang.setMemberTask(member, "Train Combat");
      }
      else if (memberInfo.hack < skillSteps[currentStep]) {
        ns.gang.setMemberTask(member, "Train Hacking");
      }
      else if (memberInfo.cha < skillSteps[currentStep]) {
        ns.gang.setMemberTask(member, "Train Charisma");
      }
      else if (gang.respect < (gang.wantedLevel * 50)) {
        ns.gang.setMemberTask(member, "Vigilante Justice");
      }
      else if (gang.respect < repSteps[currentStep]) {
        ns.gang.setMemberTask(member, getBestRepTask(ns, memberInfo));
      }
      else if (EngageInTerritoryWar(ns, gang)) {
        ns.gang.setMemberTask(member, "Territory Warfare");
      }
      else {
        ns.gang.setMemberTask(member, getBestMoneyTask(ns, memberInfo));
      }
    }
  }
}

function getBestRepTask(ns: NS, memberInfo: GangMemberInfo): string {
  const gang = ns.gang.getGangInformation();
  const tasks = ns.gang.getTaskNames().map((task) => ns.gang.getTaskStats(task)).filter((task) => task.baseMoney > 0);
  let taskData = [];
  for (const task of tasks) {
    taskData.push({ name: task.name, respect: ns.formulas.gang.respectGain(gang, memberInfo, task) });
  }
  return taskData.reduce((prev, current) => (prev.respect > current.respect) ? prev : current).name;
}

function getBestMoneyTask(ns: NS, memberInfo: GangMemberInfo): string {
  const gang = ns.gang.getGangInformation();
  const tasks = ns.gang.getTaskNames().map((task) => ns.gang.getTaskStats(task));
  let taskData = [];
  for (const task of tasks) {
    taskData.push({ name: task.name, respect: ns.formulas.gang.moneyGain(gang, memberInfo, task) });
  }
  return taskData.reduce((prev, current) => (prev.respect > current.respect) ? prev : current).name;
}



function EngageInTerritoryWar(ns: NS, gang: GangGenInfo) : boolean {
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

  return gang.territory < 1 && gang.power < (otherGangs[mostPowerfulGang].power * 10)
}