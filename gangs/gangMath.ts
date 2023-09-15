import { NS, GangMemberInfo } from "@ns";

export async function main(ns: NS): Promise<void> {
    const members = ns.gang.getMemberNames();

    for (const member of members) {
        const memberInfo = ns.gang.getMemberInformation(member);
        const bestTask = getTaskStats(ns, memberInfo);
        ns.print(`${member}: ${JSON.stringify(bestTask)}`);
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