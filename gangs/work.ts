import { NS, GangMemberInfo } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  for (const member of ns.gang.getMemberNames()) {
    await AssignTask(ns, member);
  };
}

async function AssignTask(ns: NS, memberName: string): Promise<void> {
  await TrainGang(ns, 30, memberName, 0);
  await GainRepToGetMembers(ns, memberName, 6);
  await TrainGang(ns, 100, memberName, 125);
  await GainRepToGetMembers(ns, memberName, 8);
  await TrainGang(ns, 300, memberName, 2000);
  await GainRepToGetMembers(ns, memberName, 12);
  await GainRep(ns, memberName, 5e6);
  ns.gang.setMemberTask(memberName, "Territory Warfare");
  await EngageInTerritoryWar(ns, memberName);
  await TrainGang(ns, 2_000, memberName);
  makeMoney(ns, memberName);
}

async function TrainGang(ns: NS, target: number, memberName: string, minRespect = 125) {
  let member = ns.gang.getMemberInformation(memberName);
  while (member.hack < target || member.str < target || member.def < target || member.dex < target || member.agi < target || member.cha < target) {
    let gang = ns.gang.getGangInformation();
    let bestTask = getBestRepTask(ns, member);
    ns.clearLog();
    if (gang.wantedPenalty < 0.99 && gang.respect > 2000) {
      ns.gang.setMemberTask(memberName, "Vigilante Justice");
      ns.print("Reducing wanted level");
    } else if (gang.respect < minRespect) {
      ns.gang.setMemberTask(memberName, bestTask);
      ns.print(`Gaining Reputation ${bestTask} currently ${gang.respect}\\${minRespect}`);
    } else if (member.str < target || member.def < target || member.dex < target || member.agi < target) {
      ns.gang.setMemberTask(memberName, "Train Combat");
      ns.print("Waiting for combat training target: " + target);
    } else if (member.hack < target) {
      ns.gang.setMemberTask(memberName, "Train Hacking");
      ns.print("Waiting for hacking training target: " + target);
    } else if (member.cha < target) {
      ns.gang.setMemberTask(memberName, "Train Charisma");
      ns.print("Waiting for charisma training target: " + target);
    }
    await ns.sleep(1000);
    member = ns.gang.getMemberInformation(memberName);
  }
}

async function GainRep(ns: NS, memberName: string, rep: number) {
  let gang = ns.gang.getGangInformation();
  while (gang.respect < rep) {
    let memberInfo = ns.gang.getMemberInformation(memberName);
    let bestTask = getBestRepTask(ns, memberInfo);
    ns.clearLog();
    ns.print(`Wanted: ${gang.wantedPenalty} \nRespect: ${gang.respect}`);
    if (gang.wantedPenalty < 0.99 && gang.respect > 2000) {
      ns.gang.setMemberTask(memberName, "Vigilante Justice");
      ns.print("Reducing wanted level");
    }
    else {
      ns.gang.setMemberTask(memberName, bestTask);
      ns.print(`Gaining Reputation ${bestTask} currently ${ns.formatNumber(gang.respect)}\\${ns.formatNumber(rep)}`);
    }
    gang = ns.gang.getGangInformation();
    await ns.sleep(1000);
  }
}

async function GainRepToGetMembers(ns: NS, memberName: string, memberCount: number) {
  let gang = ns.gang.getGangInformation();
  while (ns.gang.getMemberNames().length < memberCount) {
    let memberInfo = ns.gang.getMemberInformation(memberName);
    let bestTask = getBestRepTask(ns, memberInfo);
    ns.clearLog();
    ns.print(`Wanted: ${gang.wantedPenalty} \nRespect: ${gang.respect}`);
    if (gang.wantedPenalty < 0.99 && gang.respect > 2000) {
      ns.gang.setMemberTask(memberName, "Vigilante Justice");
      ns.print("Reducing wanted level");
    }
    else {
      ns.gang.setMemberTask(memberName, bestTask);
      ns.print(`Gaining Reputation ${bestTask} currently ${ns.gang.getMemberNames().length}\\${memberCount}`);
    }
    gang = ns.gang.getGangInformation();
    await ns.sleep(1000);
  }
}

function makeMoney(ns: NS, memberName: string) {
  const memberInfo = ns.gang.getMemberInformation(memberName);
  const bestTask = getBestMoneyTask(ns, memberInfo);
  ns.gang.setMemberTask(memberName, bestTask);
}

async function EngageInTerritoryWar(ns: NS, memberName: string) {
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

  while (gang.territory < 1 && gang.power < (otherGangs[mostPowerfulGang].power * 10)) {
    ns.clearLog();
    if (gang.wantedPenalty < 0.999 && gang.respect > 2000) {
      ns.gang.setMemberTask(memberName, "Vigilante Justice");
      ns.print(`Reducing wanted level currently ${gang.wantedPenalty} / 0.99`);
    }
    else {
      ns.gang.setMemberTask(memberName, "Territory Warfare");
      ns.print(`Gaining Gang Power currently ${gang.power}\\${otherGangs[mostPowerfulGang].power * 10} ${mostPowerfulGang}`);
    }
    gang = ns.gang.getGangInformation();
    await ns.sleep(1000);
  }
}

function getBestRepTask(ns: NS, memberInfo: GangMemberInfo): string {
  const gang = ns.gang.getGangInformation();
  const tasks = ns.gang.getTaskNames().map((task) => ns.gang.getTaskStats(task));
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