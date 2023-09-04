/** @param {NS} ns */
export async function main(ns) {
  let target = ns.args[0];
  //let wait = ns.args[1];
  let money = await ns.hack(target);
  ns.toast(`Hacked ${target} for ${ns.formatNumber(money,2)}`);
}