import { NS, Server } from "@ns";
import { getTargetServers } from "utils/network";

export async function main(ns: NS): Promise<void> {

    ns.disableLog("ALL");
    ns.clearLog();
    ns.tail();

    while (true) {
        ns.clearLog();
        const servers = getTargetServers(ns)
            .filter(server => ns.getWeakenTime(server.hostname) < (30 * 60 * 1000))
            .sort((a, b) => a.moneyMax! - b.moneyMax!);

        ns.print("hostname\t\t\t$\t\t\tsec");
        for (const server of servers) {
            const [time, threads] = getWeakenDetails(ns, server, server.hackDifficulty! - server.minDifficulty!);
            ns.print(`${server.hostname.padEnd(30)}\t` +
                `${ns.formatNumber(server.moneyAvailable!).padEnd(8)} \\ ${ns.formatNumber(server.moneyMax!).padEnd(8)}\t` +
                `${ns.formatNumber(server.hackDifficulty!, 0).padEnd(3)} \\ ${ns.formatNumber(server.minDifficulty!, 0).padEnd(3)}\t` +
                `${ns.formatPercent(ns.hackAnalyzeChance(server.hostname))}\t` +
                `${ns.formatNumber(threads, 0).padEnd(6)}\t`
            );
        }
        await ns.sleep(100);
    }
}

function getWeakenDetails(ns: NS, server: Server, security: number) {
    const time = ns.getWeakenTime(server.hostname);
    let threads = 0;
    let securityDiff = 0;
    do {
        securityDiff = ns.weakenAnalyze(threads++);
    } while (securityDiff < security);
    return [time, threads];
}