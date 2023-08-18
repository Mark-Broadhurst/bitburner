/** @param {NS} ns */
export async function main(ns) {
  let target = ns.args[0];
  let threads = ns.args[1];
  let waitBefore = ns.args[2];
  let waitAfter = ns.args[3];
  while(true){
    ns.sleep(waitBefore);
    await ns.hack(target, threads);
    ns.sleep(waitAfter);
  }
}