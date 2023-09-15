import { NS } from "@ns";
import { getWorkerServers, getPlayerServers } from "utils/network";

export async function main(ns: NS): Promise<void> {
    const servers = [...getPlayerServers(ns), ...getWorkerServers(ns)];
    for (const server of servers) {
        ns.killall(server.hostname);
    }
}
