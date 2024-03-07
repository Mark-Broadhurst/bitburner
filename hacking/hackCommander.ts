import { NS, Server } from "@ns";
import { getTargetServers, getWorkerServers, getPlayerServers } from "utils/network";
import { Work, WorkerServer, Command } from "utils/hacking";

const hackPercent = 0.2;
const hackGuard = 0.6;
const growPercent = 1.4;

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    while (true) {
        ns.clearLog();
        const servers = getTargetServers(ns);
        const serverWork: Work[] = [];
        for (const server of servers) {
            serverWork.push(...caclulateWork(ns, server));
        }
        await allocateWorks(ns, serverWork);
        await ns.sleep(40);
    }
}

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}

function printWork(ns: NS, work: Work[]) {
    const acc = work.reduce((acc: any, w: Work) => {
        if (acc[w.target] == undefined) {
            acc[w.target] = { hack: 0, grow: 0, weaken: 0 };
        }
        acc[w.target][w.command] += w.threads;
        return acc;
    }, {})
    ns.clearLog();

    ns.print("🖥️".padEnd(19) + "💵".padEnd(7) + "🪴".padEnd(7) + "🛡️");
    ns.print("".padEnd(40, "-"));
    for (const [server, work] of Object.entries<{ hack: number, grow: number, weaken: number }>(acc)) {
        ns.print(server.padEnd(19) + work.hack.toString().padEnd(7) + work.grow.toString().padEnd(7) + work.weaken.toString().padEnd(7) + (work.hack + work.grow + work.weaken).toString());
    }
    ns.print("".padEnd(40, "-"));
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

    if (weakenTime > (5 * 60 * 1000) || growTime > (5 * 60 * 1000)) {
        return [];
    }

    if (server.moneyAvailable! > (server.moneyMax! * hackGuard)) {
        work.push(new Work("hack", server.hostname, hackThreads, hackOffset));
    }
    work.push(new Work("grow", server.hostname, growThreads, growOffset + 20));
    work.push(new Work("weaken", server.hostname, weakenThreads, 30));

    return work;
}

async function allocateWorks(ns: NS, work: Work[]): Promise<void> {
    for (const w of work) {
        printWork(ns, work);
        ns.print(`${w.target.padEnd(18)} ${w.command} : ${w.threads}`);
        await allocateWork(ns, w.command, w.target, w.threads, w.wait);
    }
}

async function allocateWork(ns: NS, command: Command, target: string, threads: number = 1, wait: number = 0): Promise<void> {
    while (threads > 0) {
        const workerServer = await findWorkerServer(ns);
        const threadsToUse = Math.min(threads, workerServer.freeThreads);
        ns.exec(`${command}.js`, workerServer.hostname, threadsToUse, target, wait);
        threads = threads - threadsToUse;
    }
}

function getTaskServers(ns: NS): WorkerServer[] {
    const serverList: Server[] = [];
    const home = ns.getServer("home");
    //serverList.push(home);
    serverList.push(...getPlayerServers(ns));
    serverList.push(...getWorkerServers(ns));
    return serverList.map(s => new WorkerServer(s));
}

async function findWorkerServer(ns: NS): Promise<WorkerServer> {
    while (true) {
        const servers = getTaskServers(ns);
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
    const hackPercent = Math.min(server.serverGrowth! / 100, 0.4)
    const threads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(server.hostname, server.moneyMax! * hackPercent)));
    const security = ns.hackAnalyzeSecurity(threads, server.hostname);
    return [threads, security];
}