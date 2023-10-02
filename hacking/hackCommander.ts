import { NS, Server } from "@ns";
import { getTargetServers, getWorkerServers, getPlayerServers } from "utils/network";
import { WorkerServer } from "hacking/WorkerServer";

const hackPercent = 0.2;
const hackGuard = 0.6;
const growPercent = 1.4;

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    while (true) {
        ns.clearLog();
        const servers = getTargetServers(ns);
        for (const server of servers) {
            await cycleServer(ns, server);
        }
        await ns.sleep(40);
    }
}

class Work {
    command: string;
    target: string;
    threads: number;
    wait: number;
    constructor(command: "hack" | "grow" | "weaken", target: string, threads: number, wait: number = 0) {
        this.command = command;
        this.target = target;
        this.threads = threads;
        this.wait = wait;
    }
}

function caclulateWork(ns: NS, server: Server): Work[] {
    const hackTime = ns.getHackTime(server.hostname);
    const weakenTime = ns.getWeakenTime(server.hostname);
    const growTime = ns.getGrowTime(server.hostname);

    const growOffset = Math.ceil(Math.max(0, weakenTime - growTime));
    const hackOffset = Math.ceil(Math.max(0, weakenTime - hackTime));

    const [hackThreads, hackSecurity] = getHackDetails(ns, server);
    const [growThreads, growSecurity] = getGrowDetails(ns, server);
    const weakenThreads = getWeakenDetails(ns, server, hackSecurity + growSecurity);

    const work: Work[] = [];

    if (weakenTime > (10 * 60 * 1000) || growTime > (10 * 60 * 1000)) {
        return [];
    }

    if (server.moneyAvailable! > (server.moneyMax! * hackGuard)) {
        work.push(new Work("hack", server.hostname, hackThreads, hackOffset));
    } else {
        ns.print(`${server.hostname}\t\t\tG:${growThreads}\tW:${weakenThreads}`);
    }
    work.push(new Work("grow", server.hostname, growThreads, growOffset + 20));
    work.push(new Work("weaken", server.hostname, weakenThreads, 30));

    return work;
}

async function cycleServer(ns: NS, server: Server): Promise<void> {
    const hackTime = ns.getHackTime(server.hostname);
    const weakenTime = ns.getWeakenTime(server.hostname);
    const growTime = ns.getGrowTime(server.hostname);

    const growOffset = Math.ceil(Math.max(0, weakenTime - growTime));
    const hackOffset = Math.ceil(Math.max(0, weakenTime - hackTime));

    const [hackThreads, hackSecurity] = getHackDetails(ns, server);
    const [growThreads, growSecurity] = getGrowDetails(ns, server);
    const weakenThreads = getWeakenDetails(ns, server, hackSecurity + growSecurity);


    if (weakenTime > (10 * 60 * 1000) || growTime > (10 * 60 * 1000)) {
        ns.print(`Skipping ${server.hostname} ${Math.round(weakenTime / 1000)}s`);
        return;
    }

    if (server.moneyAvailable! > (server.moneyMax! * hackGuard)) {
        ns.print(`${server.hostname.padEnd(18)}\tH:${hackThreads}\tG:${growThreads}\tW:${weakenThreads}`);
        await allocateWork(ns, "hack", server.hostname, hackThreads, hackOffset);
    } else {
        ns.print(`${server.hostname}\t\t\tG:${growThreads}\tW:${weakenThreads}`);
    }
    await allocateWork(ns, "grow", server.hostname, growThreads, growOffset + 20);
    await allocateWork(ns, "weaken", server.hostname, weakenThreads, 30);
}

async function allocateWork(ns: NS, command: "hack" | "grow" | "weaken", target: string, threads: number = 1, wait: number = 0): Promise<void> {
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
    let threads = 0;
    let securityDiff = 0;
    let targetSecurity = (server.hackDifficulty! - server.minDifficulty!) + security;
    while (securityDiff < targetSecurity) {
        securityDiff = ns.weakenAnalyze(threads++);
    }
    return threads;
}

function getGrowDetails(ns: NS, server: Server) {
    const maxMoney = server.moneyMax!;
    const availableMoney = Math.max(server.moneyAvailable!, 1);
    const growPercent = Math.max((maxMoney / availableMoney), 1) + 0.2;
    const threads = Math.max(1, Math.ceil(ns.growthAnalyze(server.hostname, (maxMoney / availableMoney) + growPercent)));
    const security = Math.max(1, Math.ceil(ns.growthAnalyzeSecurity(threads, server.hostname)));
    return [threads, security];
}

function getHackDetails(ns: NS, server: Server) {
    const threads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(server.hostname, server.moneyMax! * hackPercent)));
    const security = ns.hackAnalyzeSecurity(threads, server.hostname);
    return [threads, security];
}