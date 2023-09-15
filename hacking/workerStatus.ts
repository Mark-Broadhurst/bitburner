import { NS } from "@ns";
import { getWorkerServers, getPlayerServers } from "utils/network";
import { WorkerServer } from "hacking/WorkerServer"

export async function main(ns: NS): Promise<void> {

    ns.disableLog("ALL");
    ns.clearLog();
    ns.tail();

    while (true) {
        ns.clearLog();
        const servers = [...getPlayerServers(ns), ...getWorkerServers(ns)].map(s => new WorkerServer(s));

        ns.print("hostname\t\t\tfree\t   total");
        for (const server of servers) {
            ns.print(`${server.hostname.padEnd(25)}\t${ns.formatNumber(server.freeThreads).padEnd(8)} \\ ${ns.formatNumber(server.maxThreads).padEnd(8)}`);
        }
        await ns.sleep(100);
    }
}
