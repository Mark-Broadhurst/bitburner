import network from "./network/scan";
import sortBy from "./helpers/sortBy";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.tail();
  const servers = network(ns).filter(s => s.moneyMax != 0).sort(sortBy("requiredHackingSkill"));
  const player = ns.getPlayer();

  for(const server of servers){
    const moneyDiff = server.moneyMax - server.moneyAvailable;
    const growThr = ns.formulas.hacking.growThreads(server, player, moneyDiff);
    const growPer = ns.formulas.hacking.growPercent(server, growThr, player, 1) * 100;
    const hackCha = ns.formulas.hacking.hackChance(server, player) * 100;
    const xp = ns.formulas.hacking.hackExp(server, player);
    const hackper = ns.formulas.hacking.hackPercent(server, player) * 100;
    const totalTime = (ns.formulas.hacking.weakenTime(server, player) + ns.formulas.hacking.growTime(server, player) + ns.formulas.hacking.hackTime(server, player)) / 1000;
    const hackThreads = Math.floor(80 / hackper);
    
    if (hackCha > 0 && totalTime < 900) {
      ns.print(`Server : ${server.hostname}\tgrowPercent: ${growPer}\tgrowThreads: ${growThr}\thackChance: ${hackCha}\thackXp: ${xp}\thackPer: ${hackper}\ttotaltime: ${totalTime}\ttotalHack: ${hackThreads}`);
    }
  }
}