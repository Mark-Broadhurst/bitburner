/** @param {NS} ns */
export async function main(ns) {
  ns.print(ns.gang.getTaskNames());
  for (const member of ns.gang.getMemberNames()) {
    ns.run("gangs/train.js", 1, member);
  };
}