/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.scriptKill("gangs/train.js");
  for (const member of ns.gang.getMemberNames()) {
    ns.run("gangs/train.js", 1, member);
  };
}