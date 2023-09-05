import network from "./network/scan";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.clearPort(1);

    const port = ns.getPortHandle(1);
    while (true) {
        ns.clearLog();

        const servers = network(ns)
            .filter(server => server.moneyMax != 0)
            .filter(server => server.hasAdminRights)
            .filter(server => server.requiredHackingSkill <= ns.getHackingLevel())
        
        for (const server of servers) {
            const weakenTime = ns.getWeakenTime(server.hostname);
            const growTime = ns.getGrowTime(server.hostname);
            const hackTime = ns.getHackTime(server.hostname);

            const growOffset = Math.max(0, weakenTime - growTime);
            const hackOffset = Math.max(0, growTime - hackTime);

            if (weakenTime > (8 * 60 * 1000)) {
                ns.print(`Skipping ${server.hostname} ${Math.round(weakenTime / 1000)}s`);
                continue;
            }
            if (ns.hackAnalyzeChance(server.hostname) == 1 && server.moneyAvailable > (server.moneyMax * 0.9)) {
                ns.print(`Hacking ${server.hostname}`);
                while (!port.tryWrite(`hack,${server.hostname},1,${hackOffset}`)) {
                    ns.print("Failed to write port");
                    await ns.sleep(100);
                }
                while (!port.tryWrite(`weaken,${server.hostname},1,1`)) {
                    ns.print("Failed to write port");
                    await ns.sleep(100);
                }

            }
            //ns.growthAnalyze(server.hostname, growAmount));
            //ns.growthAnalyzeSecurity(1, server.hostname);
            ns.print(`Growing ${server.hostname} with ${ns.formatNumber(server.moneyAvailable, 2)}/${ns.formatNumber(server.moneyMax, 2)}`);
            while (!port.tryWrite(`grow,${server.hostname},1,${growOffset}`)) {
                ns.print("Failed to write port");
                await ns.sleep(100);
            }
            while (!port.tryWrite(`weaken,${server.hostname},1,0`)) {
                ns.print("Failed to write port");
                await ns.sleep(100);
            }
            //ns.weakenAnalyze(1);
            ns.print(`Weakening ${server.hostname} ${Math.ceil(server.hackDifficulty)}/${server.minDifficulty} `);
            while (!port.tryWrite(`weaken,${server.hostname},1,0`)) {
                ns.print("Failed to write port");
                await ns.sleep(100);
            }
        }
        await ns.sleep(100);
    }
}