/** @param {NS} ns */
export async function main(ns) {
  if(!ns.gang.inGang())
  {
    while(ns.heart.break() < -54_000)
    {
      ns.gang.createGang("Slum Snakes");

      ns.exec("./gangs/equipment.js", "home");
      ns.exec("./gangs/ascend.js", "home");
      ns.exec("./gangs/recruit.js", "home");
      ns.exec("./gangs/tasks.js", "home");
    }
  }
}