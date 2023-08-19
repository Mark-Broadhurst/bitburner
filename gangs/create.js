/** @param {NS} ns */
export async function main(ns) {
  if(!ns.gang.inGang())
  {
    while(ns.heart.break() < -54_000)
    {
      ns.gang.createGang("Slum Snakes");

      ns.run("./gangs/equipment.js");
      ns.run("./gangs/ascend.js");
      ns.run("./gangs/recruit.js");
      ns.run("./gangs/tasks.js");
    }
  }
}