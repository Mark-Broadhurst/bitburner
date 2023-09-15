import { NS } from "@ns";
import { getWorkerServers } from "/utils/network";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const servers = getWorkerServers(ns);
    for (const server of servers) {
        ns.scp(["grow.js", "weaken.js", "hack.js", "portReader.js"], server.hostname);
        ns.killall(server.hostname);
        ns.exec("portReader.js", server.hostname, 1, server.hostname);
    }
}
