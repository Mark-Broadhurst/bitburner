import { NS } from "@ns";
import { getTargetServers } from "utils/network";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.clearPort(1);

    const port = ns.getPortHandle(1);
    while (true) {
        ns.clearLog();

        const servers = getTargetServers(ns);

        for (const server of servers) {
            const weakenTime = ns.getWeakenTime(server.hostname);
            const growTime = ns.getGrowTime(server.hostname);
            const hackTime = ns.getHackTime(server.hostname);

            const growOffset = Math.ceil(Math.max(0, weakenTime - growTime));
            const hackOffset = Math.ceil(Math.max(0, growTime - hackTime));

            let weakens = 0;

            if (weakenTime > (8 * 60 * 1000)) {
                ns.print(`Skipping ${server.hostname} ${Math.round(weakenTime / 1000)}s`);
                continue;
            }

            // ns.hackAnalyzeSecurity(threads, server.hostname);
            // ns.hackAnalyzeThreads(server.hostname, amount);

            if (ns.hackAnalyzeChance(server.hostname) == 1 && server.moneyAvailable! > (server.moneyMax! * 0.9)) {
                const moneyPart = ns.hackAnalyze(server.hostname);
                ns.print(`Hacking ${server.hostname} for ${ns.formatNumber(server.moneyAvailable! * moneyPart, 2)}/${ns.formatNumber(server.moneyAvailable!, 2)}`);
                while (!port.tryWrite(`hack,${server.hostname},1,${hackOffset}`)) {
                    await ns.sleep(100);
                }
                weakens++;
            }

            // ns.growthAnalyze(server.hostname, 1.2);
            // ns.growthAnalyzeSecurity(1, server.hostname);

            ns.print(`Growing ${server.hostname} with ${ns.formatNumber(server.moneyAvailable!, 2)}/${ns.formatNumber(server.moneyMax!, 2)}`);
            while (!port.tryWrite(`grow,${server.hostname},1,${growOffset}`)) {
                await ns.sleep(100);
            }
            weakens++;

            // ns.weakenAnalyze(1);

            ns.print(`${weakens} Weakening ${server.hostname} ${Math.ceil(server.hackDifficulty!)}/${server.minDifficulty} `);
            for (let i = 0; i < weakens; i++) {
                while (!port.tryWrite(`weaken,${server.hostname},1,0`)) {
                    await ns.sleep(100);
                }
            }
        }
        await ns.sleep(100);
    }
}
