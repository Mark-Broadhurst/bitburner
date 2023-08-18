/** @param {NS} ns */
export async function main(ns) {
  while(true){
    let target = ns.args[0];
    let threads = ns.args[1];
    await ns.weaken(target, threads);
  }
}