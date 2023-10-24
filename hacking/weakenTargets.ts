import { NS, Server } from "@ns";
import { getTargetServers, getWorkerServers, getPlayerServers } from "utils/network";
import { WorkerServer, Work, Command, weakenDetails } from "utils/hacking";

const growPercent = 1.2;

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    
    let work = [] as Work[];
    for (const server of getTargetServers(ns)) {
        work.push(...caclulateWork(ns, server));
    }
    for( const w of work) {
        ns.print(`${w.target} ${w.threads}`);
        await allocateWork(ns, w.command, w.target, w.threads);
    }
}

function caclulateWork(ns: NS, server: Server): Work[] {
    const { threads:weakenThreads } = weakenDetails(ns, server, server.hackDifficulty! - server.minDifficulty!);
    if (weakenThreads > 1) {
        return [new Work("weaken", server.hostname, weakenThreads)];
    }
    return [];
}

async function allocateWork(ns: NS, command: Command, target: string, threads: number = 1): Promise<void> {
    while (threads > 0) {
        const workerServer = await findWorkerServer(ns);
        const threadsToUse = Math.min(threads, workerServer.freeThreads);
        ns.exec(`${command}.js`, workerServer.hostname, threadsToUse, target);
        threads = threads - threadsToUse;
    }
}

async function findWorkerServer(ns: NS): Promise<WorkerServer> {
    while (true) {
        const serverList = [];
        const home = ns.getServer("home");
        if (home.maxRam < 1024) {
            serverList.push(...getPlayerServers(ns));
            serverList.push(...getWorkerServers(ns));
            serverList.push(home);
        } else {
            serverList.push(...getPlayerServers(ns));
            serverList.push(...getWorkerServers(ns));
        }
        const servers = serverList.map(s => new WorkerServer(s));
        const server = servers.find(s => s.freeThreads > 0)
        if (server != undefined) {
            return server;
        }
        await ns.sleep(1000);
    }
}

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}