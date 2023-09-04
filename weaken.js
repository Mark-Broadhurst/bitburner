/** @param {NS} ns */
export async function main(ns) {
  let target = ns.args[0];
  //let wait = ns.args[1];
  await ns.weaken(target);
}