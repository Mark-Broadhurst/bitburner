import { NS } from "@ns";
import { getTargetServers } from "utils/network";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.tail();
    ns.resizeTail(560, 700);

    while (true) {
        ns.clearLog();
        const servers = getTargetServers(ns)
            .sort((a, b) => b.moneyMax! - a.moneyMax!)
            .sort((a, b) => b.minDifficulty! - a.minDifficulty!)
            .reverse();

        ns.print(`🖥️                💰       \\ max      🔒 \\ min  🎲`);
        ns.print("".padEnd(56, "—"));
        for (const server of servers) {
            ns.print(`${server.hostname.padEnd(19)}` +
                `${ns.formatNumber(server.moneyAvailable!).padEnd(8)} \\ ${ns.formatNumber(server.moneyMax!).padEnd(8)} ` +
                `${ns.formatNumber(server.hackDifficulty!, 0).padEnd(3)} \\ ${ns.formatNumber(server.minDifficulty!, 0).padEnd(3)} ` +
                `${ns.formatPercent(ns.hackAnalyzeChance(server.hostname))}`
            );
        }
        await ns.sleep(1000);
    }
}
