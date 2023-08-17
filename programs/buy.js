import sortBy from "./helpers/sortBy"

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL")
  ns.clearLog();
  ns.singularity.purchaseTor();
  const programs = ns.singularity.getDarkwebPrograms()
    .map(prog => { return { name: prog, cost: ns.singularity.getDarkwebProgramCost(prog) } })
    .sort(sortBy("cost"));

  for (const program of programs) {
    if (ns.fileExists(program.name, "home")) {
      ns.print(`skipping ${program.name}`)
      continue;
    }
    while (ns.getServerMoneyAvailable("home") < program.cost) {
      ns.print(`waiting to buy ${program.name} for ${program.cost}`);
      await ns.sleep(10000);
    }
    ns.toast(`buying ${program.name} for ${program.cost}`);
    ns.singularity.purchaseProgram(program.name);
  }

}