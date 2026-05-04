import { GangGenInfo, GangMemberInfo, GangMemberAscension, NS, Gang, GangTaskStats } from "@ns";

const skillSteps = [0, 0, 0, 30, 50, 100, 150, 200, 300, 500, 1000, 1500, 3000, 5000];

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  const threshold = ns.args[0] as number ?? 1.5;

  while (true) {
    await ns.gang.nextUpdate();
    ns.clearLog();

    const gang = ns.gang.getGangInformation();
    const members = ns.gang.getMemberNames()
    const numberOfMembers = members.length;

    if (ns.gang.canRecruitMember()) {
      ns.gang.recruitMember("gang-" + numberOfMembers);
    }

    ns.print("Skill Goals: " + skillSteps[numberOfMembers]);

    for (const member of members) {
      const memberInfo = ns.gang.getMemberInformation(member);

      const asc = ns.gang.getAscensionResult(member) as GangMemberAscension;

      if (asc) {
        //ns.print(`${member} ${ns.formatNumber(asc.hack)},${ns.formatNumber(asc.str)}, ${ns.formatNumber(asc.def)}, ${ns.formatNumber(asc.dex)}, ${ns.formatNumber(asc.agi)}, ${ns.formatNumber(asc.cha)}`);
        if (asc.agi > threshold ||
          asc.cha > threshold ||
          asc.def > threshold ||
          asc.hack > threshold ||
          asc.str > threshold) {
          ns.gang.ascendMember(member);
          ns.tprint(`Ascended ${member}`);
        }
      }


      if (memberInfo.str < skillSteps[numberOfMembers] || memberInfo.def < skillSteps[numberOfMembers] || memberInfo.dex < skillSteps[numberOfMembers] || memberInfo.agi < skillSteps[numberOfMembers]) {
        ns.gang.setMemberTask(member, "Train Combat");
      }
      else if (memberInfo.hack < skillSteps[numberOfMembers]) {
        ns.gang.setMemberTask(member, "Train Hacking");
      }
      else if (memberInfo.cha < skillSteps[numberOfMembers]) {
        ns.gang.setMemberTask(member, "Train Charisma");
      }
      else if (gang.respect < (gang.wantedLevel * 50) && gang.wantedLevel >= 5) {
        ns.gang.setMemberTask(member, "Vigilante Justice");
      }
      else if (gang.respect < 5e6) {
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

class TaskData {
  name: string;
  respect: number;
  wanted: number;
  money: number;
  constructor(ns: NS, gang: GangGenInfo, memberInfo: GangMemberInfo, task: GangTaskStats) {
    this.name = task.name;
    this.respect = ns.formulas.gang.respectGain(gang, memberInfo, task);
    this.wanted = ns.formulas.gang.wantedLevelGain(gang, memberInfo, task);
    this.money = ns.formulas.gang.moneyGain(gang, memberInfo, task);
  }
  print(ns: NS) {
    ns.print(`Task: ${this.name} Respect: ${this.respect} Wanted: ${this.wanted} Money: ${this.money}`);
  }
}

type reduceFunction = (previousValue: TaskData, currentValue: TaskData, currentIndex: number, array: TaskData[]) => TaskData;

function getBestTask(ns: NS, memberInfo: GangMemberInfo, callback: reduceFunction): string {
  const gang = ns.gang.getGangInformation();
  return ns.gang.getTaskNames()
    .map((task) => ns.gang.getTaskStats(task))
    .map((task) => new TaskData(ns, gang, memberInfo, task))
    .filter(x => (x.respect / x.wanted) > 50)
    .reduce(callback)
    .name;
}

function reduceRespect(prev: TaskData, current: TaskData) {
  if (prev.respect > current.respect) {
    return prev;
  } else if (prev.respect < current.respect) {
    return current;
  } else if (prev.wanted < current.wanted) {
    return prev;
  } else if (prev.wanted > current.wanted) {
    return current;
  } else if (prev.money > current.money) {
    return prev;
  } else {
    return current;
  }
}

function reduceMoney(prev: TaskData, current: TaskData) {
  if (prev.money > current.money) {
    return prev;
  } else if (prev.money < current.money) {
    return current;
  } else if (prev.respect > current.respect) {
    return prev;
  } else if (prev.respect < current.respect) {
    return current;
  } else if (prev.wanted < current.wanted) {
    return prev;
  } else {
    return current;
  }
}


function getBestRepTask(ns: NS, memberInfo: GangMemberInfo): string {
  return getBestTask(ns, memberInfo, reduceRespect);
}

function getBestMoneyTask(ns: NS, memberInfo: GangMemberInfo): string {
  return getBestTask(ns, memberInfo, reduceMoney);
}

function EngageInTerritoryWar(ns: NS, gang: GangGenInfo): boolean {
  let otherGangs = ns.gang.getOtherGangInformation();

  const mostPowerfulGangs = [
    "Slum Snakes",
    "Tetrads",
    "The Syndicate",
    "The Dark Army",
    "Speakers for the Dead",
    "NiteSec",
    "The Black Hand"
  ]
    .filter(x => x != gang.faction)
    .filter(x => otherGangs[x].territory);

  if (!mostPowerfulGangs.length) {
    return false;
  }
  else {
    const mostPowerfulGang = mostPowerfulGangs.reduce((a, b) => {
      if (otherGangs[a].power > otherGangs[b].power) {
        return a;
      }
      return b;
    });
    //ns.print(`Most powerful gang: ${mostPowerfulGang} target ${(otherGangs[mostPowerfulGang].power * 5)}`);
    return gang.territory < 1 && gang.power < (otherGangs[mostPowerfulGang].power * 5)

  }
}