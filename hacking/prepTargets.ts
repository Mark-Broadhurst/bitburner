import { NS, Server } from "@ns";
import { getTargetServers, getWorkerServers, getPlayerServers } from "utils/network";
import { WorkerServer } from "hacking/WorkerServer";

const growPercent = 1.2;

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    for (const server of getTargetServers(ns)) {
        await cycleServer(ns, server);
    }
}

async function cycleServer(ns: NS, server: Server): Promise<void> {
    const [growThreads, growSecurity] = getGrowDetails(ns, server);
    const [weakenThreads] = getWeakenDetails(ns, server, growSecurity);

    ns.print(`${server.hostname} ${growThreads} ${weakenThreads}`);

    await allocateWork(ns, "grow", server.hostname, growThreads);
    await allocateWork(ns, "weaken", server.hostname, weakenThreads);
}

async function allocateWork(ns: NS, command: "grow" | "weaken", target: string, threads: number = 1): Promise<void> {
    while (threads > 0) {
        const workerServer = await findWorkerServer(ns);
        const threadsToUse = Math.min(threads, workerServer.freeThreads);
        ns.exec(`${command}.js`, workerServer.hostname, threadsToUse, target);
        threads = threads - threadsToUse;
    }
}

async function findWorkerServer(ns: NS): Promise<WorkerServer> {
    while (true) {
        const servers = [ns.getServer("home")].map(s => new WorkerServer(s));
        const server = servers.find(s => s.freeThreads > 0)
        if (server != undefined) {
            return server;
        }
        await ns.sleep(1000);
    }
}

function getWeakenDetails(ns: NS, server: Server, security: number) {
    let threads = 0;
    let secTarget = (server.hackDifficulty! - server.minDifficulty!) + security;
    let securityDiff = 0;
    do {
        securityDiff = ns.weakenAnalyze(threads++, server.cpuCores);
    } while (securityDiff < secTarget);
    return [threads];
}

function getGrowDetails(ns: NS, server: Server) {
    const growPercent = server.moneyMax! / server.moneyAvailable!;
    const threads = Math.max(1, Math.ceil(ns.growthAnalyze(server.hostname, growPercent, server.cpuCores)));
    const security = ns.growthAnalyzeSecurity(threads, server.hostname, server.cpuCores);
    return [threads, security];
}
