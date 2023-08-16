import network from "./network/scan";
import sortBy from "./helpers/sortBy";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.tail();
  var servers = network(ns).filter(s => s.moneyMax != 0).sort(sortBy("requiredHackingSkill"));
  var player = ns.getPlayer()
  servers.forEach(server => {
    var moneyDiff = server.moneyMax - server.moneyAvailable;
    var growThr = ns.formulas.hacking.growThreads(server, player, moneyDiff);
    var growPer = ns.formulas.hacking.growPercent(server, growThr, player, 1) * 100;
    var hackCha = ns.formulas.hacking.hackChance(server, player) * 100;
    var xp = ns.formulas.hacking.hackExp(server, player);
    var hackper = ns.formulas.hacking.hackPercent(server, player) * 100;
    var totalTime = (ns.formulas.hacking.weakenTime(server, player) + ns.formulas.hacking.growTime(server, player) + ns.formulas.hacking.hackTime(server, player)) / 1000;
    var hackThreads = Math.floor(80 / hackper);
    
    if (hackCha > 0 && totalTime < 900) {
      ns.print(`Server : ${server.hostname}\tgrowPercent: ${growPer}\tgrowThreads: ${growThr}\thackChance: ${hackCha}\thackXp: ${xp}\thackPer: ${hackper}\ttotaltime: ${totalTime}\ttotalHack: ${hackThreads}`);
    }
  });
}