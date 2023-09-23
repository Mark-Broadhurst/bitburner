import { NS, Server } from "@ns";
import { getTargetServers, getWorkerServers, getPlayerServers } from "utils/network";
import { WorkerServer } from "hacking/WorkerServer";

const hackPercent = 0.3;
const hackGuard = 0.5;
const growPercent = 1.8;

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    while (true) {
        ns.clearLog();
        for(const server of getTargetServers(ns)){
          await cycleServer(ns, server);
        }
        await ns.sleep(50);
    }
}

async function cycleServer(ns: NS, server: Server): Promise<void> {
    const [hackTime, hackThreads, hackSecurity] = getHackDetails(ns, server);
    const [growTime, growThreads, growSecurity] = getGrowDetails(ns, server);
    const [weakenTime, weakenHackThreads] = getWeakenDetails(ns, server, hackSecurity);
    const [, weakenGrowThreads] = getWeakenDetails(ns, server, growSecurity);

    const growOffset = Math.ceil(Math.max(0, weakenTime - growTime));
    const hackOffset = Math.ceil(Math.max(0, weakenTime - hackTime));

    if (weakenTime > (10 * 60 * 1000) || growTime > (10 * 60 * 1000)) {
        ns.print(`Skipping ${server.hostname} ${Math.round(weakenTime / 1000)}s`);
        return;
    }

    if (server.moneyAvailable! > (server.moneyMax! * hackGuard)) {
        ns.print(`${server.hostname.padEnd(18)}\tH:${hackThreads}\tW:${weakenHackThreads}\tG:${growThreads}\tW:${weakenGrowThreads}`);
        await allocateWork(ns, "hack", server.hostname, hackThreads, hackOffset);
        await allocateWork(ns, "weaken", server.hostname, weakenHackThreads, 10);
    } else {
        ns.print(`${server.hostname}\t\t\tG:${growThreads}\tW:${weakenGrowThreads}`);
    }
    await allocateWork(ns, "grow", server.hostname, growThreads, growOffset + 20);
    await allocateWork(ns, "weaken", server.hostname, weakenGrowThreads, 30);
}

async function allocateWork(ns: NS, command: "hack"|"grow"|"weaken", target: string, threads: number = 1, wait: number = 0): Promise<void> {
    while (threads > 0) {
        const workerServer = await findWorkerServer(ns);
        const threadsToUse = Math.min(threads, workerServer.freeThreads);
        ns.exec(`${command}.js`, workerServer.hostname, threadsToUse, target, wait);
        threads = threads - threadsToUse;
    }
}

async function findWorkerServer(ns: NS): Promise<WorkerServer> {
    while (true) {
        const servers = [...getPlayerServers(ns), ...getWorkerServers(ns)].map(s => new WorkerServer(s));
        const server = servers.find(s => s.freeThreads > 0)
        if (server != undefined) {
            return server;
        }
        await ns.sleep(1000);
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

function getGrowDetails(ns: NS, server: Server) {
    const time = ns.getGrowTime(server.hostname);
    const threads = Math.max(1, Math.ceil(ns.growthAnalyze(server.hostname, growPercent)));
    const security = ns.growthAnalyzeSecurity(threads, server.hostname);
    return [time, threads, security];
}

function getHackDetails(ns: NS, server: Server) {
    const time = ns.getHackTime(server.hostname);
    const threads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(server.hostname, server.moneyMax! * hackPercent)));
    const security = ns.hackAnalyzeSecurity(threads, server.hostname);
    return [time, threads, security];
}