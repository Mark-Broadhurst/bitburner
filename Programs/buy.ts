import { NS, ProgramName } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    while (ns.getServerMoneyAvailable("home") < 200_000) {
        await ns.sleep(1000);
    }
    ns.singularity.purchaseTor();

    const programs = (ns.singularity.getDarkwebPrograms() as ProgramName[])
        .map(prog => ({ name: prog, cost: ns.singularity.getDarkwebProgramCost(prog) }))
        .sort((a, b) => a.cost - b.cost);

    for (const program of programs) {
        if (ns.fileExists(program.name, "home")) {
            ns.print(`✅ Already have: ${program.name}`);
            continue;
        }
        while (ns.getServerMoneyAvailable("home") < program.cost) {
            ns.print(`⏳ Waiting to buy ${program.name} — need $${ns.format.number(program.cost)}`);
            await ns.sleep(1000);
        }
        ns.tprint(`💾 Buying ${program.name} for $${ns.format.number(program.cost)}`);
        ns.singularity.purchaseProgram(program.name);
        ns.run("Hacking/nuke-all.js");
    }

    ns.tprint("✅ All darkweb programs purchased.");
}
