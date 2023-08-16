/** @param {NS} ns */
export async function main(ns) {
  ns.print(ns.gang.getTaskNames());
  ns.gang.getMemberNames()
    .forEach(member => {
      ns.exec("gangs/train.js","home", 1, member);
  });
}