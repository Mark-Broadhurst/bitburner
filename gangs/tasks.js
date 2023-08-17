/** @param {NS} ns */
export async function main(ns) {
  ns.print(ns.gang.getTaskNames());
  for(const member of ns.gang.getMemberNames()){
      ns.exec("gangs/train.js","home", 1, member);
  };
}