import { NS, Server } from "@ns";
import { getWorkerServers, getPlayerServers } from "utils/network";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.tail();
    ns.resizeTail(560, 700);

    while (true) {
        ns.clearLog();
        const workerServers = getWorkerServers(ns);
        const playerServers = getPlayerServers(ns);

        const servers = [...workerServers, ...playerServers];
        ns.print(`🖥️`);
        ns.print("".padEnd(40, "—"));
        const totalRamUsed = servers.reduce((acc, server) => server.ramUsed! + acc, 0);
        const totalRamMax = servers.reduce((acc, server) => server.maxRam! + acc, 0);
        const totalThreadsUsed = servers.reduce((acc, server) => Math.floor(server.ramUsed! / 1.75) + acc, 0);
        const totalThreadsMax = servers.reduce((acc, server) => Math.floor(server.maxRam! / 1.75) + acc, 0);
        const summary = [
            "Totals".padEnd(19),
            ns.formatRam(totalRamUsed).padEnd(8) + "/",
            ns.formatRam(totalRamMax).padEnd(8),
            totalThreadsUsed + " /",
            totalThreadsMax,
        ];
        ns.print(summary.join(" "));
        ns.print("".padEnd(40, "—"));
        for (const server of servers) {
            const line = [
                server.hostname.padEnd(19),
                ns.formatRam(server.ramUsed!).padEnd(8) + "/",
                ns.formatRam(server.maxRam!).padEnd(8),
                ns.formatNumber(Math.floor(server.ramUsed! / 1.75),0) + " /",
                ns.formatNumber(Math.floor(server.maxRam! / 1.75),0),
            ]
            ns.print(line.join(" "));
        }
        await ns.sleep(1000);
    }
}
