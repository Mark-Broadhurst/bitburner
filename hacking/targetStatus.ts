import { NS } from "@ns";
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
            ns.print(`${server.hostname.padEnd(30)}\t` +
                `${ns.formatNumber(server.moneyAvailable!).padEnd(8)} \\ ${ns.formatNumber(server.moneyMax!).padEnd(8)}\t` +
                `${ns.formatNumber(server.hackDifficulty!, 0).padEnd(3)} \\ ${ns.formatNumber(server.minDifficulty!, 0).padEnd(3)}\t`
            );
        }
        await ns.sleep(100);
    }
}
