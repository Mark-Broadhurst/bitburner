import { NS, GangMemberInfo } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    ns.print(ns.gang.getMemberNames().length);

    const members = ns.gang.getMemberNames();

    for (const member of members) {
        const memberInfo = ns.gang.getMemberInformation(member);
        const bestTask = getTaskStats(ns, memberInfo);
        ns.print(`${member}:`);
        for (const task of Object.values(bestTask)) {
            if(task.respect == 0) continue;
            ns.print(`\t${task.name.padEnd(25)}:\t${task.respect}`);
        }
    }
}

function getTaskStats(ns: NS, memberInfo: GangMemberInfo) {
    const gang = ns.gang.getGangInformation();
    const tasks = ns.gang.getTaskNames().map((task) => ns.gang.getTaskStats(task));
    let taskData = [];
    for (const task of tasks) {
        taskData.push({name: task.name, respect: ns.formulas.gang.respectGain(gang, memberInfo, task)});
    }
    return taskData;
}