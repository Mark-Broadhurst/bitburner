/** @param {NS} ns */
export async function main(ns) {
  let target = ns.args[0];
  let threads = ns.args[1];
  while(true){
    await ns.hack(target, threads);
  }
}