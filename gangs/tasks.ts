import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.scriptKill("gangs/train.js", "home");
    for (const member of ns.gang.getMemberNames()) {
      ns.run("gangs/train.js", 1, member);
    };
}
