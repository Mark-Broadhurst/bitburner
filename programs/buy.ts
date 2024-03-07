import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL")
    ns.clearLog();
    while (ns.getServerMoneyAvailable("home") < 200000) {
        await ns.sleep(100);
    }
    ns.singularity.purchaseTor();
    const programs = ns.singularity.getDarkwebPrograms()
        .map(prog => { return { name: prog, cost: ns.singularity.getDarkwebProgramCost(prog) } })
        .sort((a, b) => a.cost - b.cost);

    for (const program of programs) {
        if (ns.fileExists(program.name, "home")) {
            ns.print(`skipping ${program.name}`);
            continue;
        }
        while (ns.getServerMoneyAvailable("home") < program.cost) {
            ns.print(`waiting to buy ${program.name} for ${ns.formatNumber(program.cost)}`);
            await ns.sleep(1000);
        }
        ns.tprint(`buying ${program.name} for ${ns.formatNumber(program.cost)}`);
        ns.singularity.purchaseProgram(program.name);
    }
}
