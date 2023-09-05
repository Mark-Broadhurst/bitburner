/** @param {NS} ns */
export async function main(ns) {
  let target = ns.args[0];
  let wait = ns.args[1] ?? 0;
  await ns.weaken(target, {additionalMsec: wait});
}