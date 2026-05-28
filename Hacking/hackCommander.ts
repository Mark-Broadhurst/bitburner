import { NS, Server } from "@ns";
import { getTargetServers, getWorkerServers, getPlayerServers } from "Utils/network";
import { Work, WorkerServer, Command } from "Utils/hacking";

const HACK_PERCENT       = 0.5;
const SPACING            = 200;
const MAX_WEAKEN         = 5 * 60 * 1000;
const MAX_LOOKAHEAD      = 30 * 1000;
const HOME_RESERVED_RAM  = 128;

type BatchThreads = {
    hackThreads:    number;
    weaken1Threads: number;
    growThreads:    number;
    weaken2Threads: number;
    totalThreads:   number;
};

type BatchTimings = {
    hackDelay:    number;
    weaken1Delay: number;
    growDelay:    number;
    weaken2Delay: number;
};

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(620, 500);

    while (true) {
        ns.clearLog();

        const { grow: stockGrow, hack: stockHack } = readStockSignals(ns);

        const farmPool = getTaskServers(ns);
        const prepPool = buildPrepPool(ns, farmPool);

        const homeCores = ns.getServer("home").cpuCores;

        const targets = getTargetServers(ns)
            .filter(s => ns.getWeakenTime(s.hostname) <= MAX_WEAKEN)
            .filter(s => ns.hackAnalyzeChance(s.hostname) > 0)
            .sort((a, b) => (b.moneyMax! / b.minDifficulty!) - (a.moneyMax! / a.minDifficulty!));

        for (const server of targets) {
            const fresh = ns.getServer(server.hostname) as Server;
            if (isPrepped(fresh)) continue;

            const works = calcPrepWork(ns, fresh, homeCores);
            for (const w of works) {
                const stock = w.command === "grow" && stockGrow.has(w.target);
                allocateWork(ns, prepPool, w.command, w.target, w.threads, w.wait, stock);
            }
        }

        for (const server of targets) {
            const fresh = ns.getServer(server.hostname) as Server;
            if (!isPrepped(fresh)) continue;

            const batch    = calcFarmBatch(ns, fresh);
            const timings  = calcTimings(ns, fresh);
            const doGrow   = stockGrow.has(fresh.hostname);
            const doHack   = stockHack.has(fresh.hostname);

            let batchIdx = 0;
            while (canAllocate(farmPool, batch.totalThreads)) {
                const offset = batchIdx * 4 * SPACING;
                if (offset > MAX_LOOKAHEAD) break;

                const live = ns.getServer(server.hostname) as Server;
                if (!isPrepped(live)) break;
                dispatchFarmBatch(ns, farmPool, fresh, batch, {
                    hackDelay:    timings.hackDelay    + offset,
                    weaken1Delay: timings.weaken1Delay + offset,
                    growDelay:    timings.growDelay    + offset,
                    weaken2Delay: timings.weaken2Delay + offset,
                }, doGrow, doHack);
                batchIdx++;
            }
        }

        printStatus(ns, targets, farmPool, prepPool);
        await ns.sleep(SPACING);
    }
}

function isPrepped(server: Server): boolean {
    return (server.hackDifficulty!  <= server.minDifficulty! + 1) &&
           (server.moneyAvailable!  >= server.moneyMax! * 0.99);
}

function calcFarmBatch(ns: NS, server: Server): BatchThreads {
    const host     = server.hostname;
    const moneyMax = server.moneyMax!;
    const cores    = server.cpuCores;

    const hackThreads    = Math.max(1, Math.floor(ns.hackAnalyzeThreads(host, moneyMax * HACK_PERCENT)));
    const hackSecurity   = ns.hackAnalyzeSecurity(hackThreads, host);

    const weaken1Threads = Math.ceil(hackSecurity / 0.05);

    const growMultiplier = Math.min(1 / (1 - HACK_PERCENT), 1000);
    const growThreads    = Math.max(1, Math.ceil(ns.growthAnalyze(host, growMultiplier, cores)));
    const growSecurity   = ns.growthAnalyzeSecurity(growThreads, host, cores);

    const weaken2Threads = Math.ceil(growSecurity / 0.05);

    const totalThreads = hackThreads + weaken1Threads + growThreads + weaken2Threads;

    return { hackThreads, weaken1Threads, growThreads, weaken2Threads, totalThreads };
}

function calcTimings(ns: NS, server: Server): BatchTimings {
    const host       = server.hostname;
    const weakenTime = ns.getWeakenTime(host);
    const hackTime   = ns.getHackTime(host);
    const growTime   = ns.getGrowTime(host);

    return {
        hackDelay:    Math.ceil(weakenTime - hackTime),
        weaken1Delay: SPACING,
        growDelay:    Math.ceil(weakenTime - growTime + 2 * SPACING),
        weaken2Delay: 3 * SPACING,
    };
}

function calcPrepWork(ns: NS, server: Server, workerCores = 1): Work[] {
    const host       = server.hostname;
    const works: Work[] = [];

    const securityDiff = server.hackDifficulty! - server.minDifficulty!;

    if (securityDiff > 1) {
        const weakenThreads = Math.ceil(securityDiff / 0.05);
        works.push(new Work("weaken", host, weakenThreads, 0));
    } else {
        const moneyRatio = server.moneyMax! / Math.max(server.moneyAvailable!, 1);
        if (moneyRatio > 1.01) {
            const weakenTime = ns.getWeakenTime(host);
            const growTime   = ns.getGrowTime(host);

            const growThreads   = Math.max(1, Math.ceil(ns.growthAnalyze(host, moneyRatio, workerCores)));
            const growSecurity  = ns.growthAnalyzeSecurity(growThreads, host, workerCores);
            const weakenThreads = Math.ceil(growSecurity / 0.05);

            const growDelay   = Math.ceil(weakenTime - growTime);
            const weakenDelay = SPACING;

            works.push(new Work("grow",   host, growThreads,   growDelay));
            works.push(new Work("weaken", host, weakenThreads, weakenDelay));
        }
    }

    return works;
}

function canAllocate(pool: WorkerServer[], threads: number): boolean {
    return pool.reduce((sum, s) => sum + s.freeThreads, 0) >= threads;
}

function dispatchFarmBatch(
    ns: NS,
    pool: WorkerServer[],
    server: Server,
    batch: BatchThreads,
    timings: BatchTimings,
    stockGrow = false,
    stockHack = false,
): void {
    const host = server.hostname;
    allocateWork(ns, pool, "hack",   host, batch.hackThreads,    timings.hackDelay,    stockHack);
    allocateWork(ns, pool, "weaken", host, batch.weaken1Threads, timings.weaken1Delay);
    allocateWork(ns, pool, "grow",   host, batch.growThreads,    timings.growDelay,    stockGrow);
    allocateWork(ns, pool, "weaken", host, batch.weaken2Threads, timings.weaken2Delay);
}

function allocateWork(
    ns: NS,
    pool: WorkerServer[],
    command: Command,
    target: string,
    threads: number,
    wait: number,
    stock = false,
): void {
    for (const worker of pool) {
        if (threads <= 0) break;
        if (worker.freeThreads <= 0) continue;
        const use = Math.min(threads, worker.freeThreads);
        ns.exec(`${command}.js`, worker.hostname, use, target, wait, stock);
        worker.freeThreads -= use;
        threads -= use;
    }
}

function readStockSignals(ns: NS): { grow: Set<string>; hack: Set<string> } {
    const raw = ns.read("Stock/positions.txt");
    if (!raw) return { grow: new Set(), hack: new Set() };
    try {
        const parsed = JSON.parse(raw) as { grow: string[]; hack: string[] };
        return { grow: new Set(parsed.grow), hack: new Set(parsed.hack) };
    } catch {
        return { grow: new Set(), hack: new Set() };
    }
}

function getTaskServers(ns: NS): WorkerServer[] {
    const servers = [
        ...getPlayerServers(ns),
        ...getWorkerServers(ns),
    ].map(s => new WorkerServer(s));

    const home       = ns.getServer("home") as Server;
    const freeRam    = Math.max(0, home.maxRam - home.ramUsed - HOME_RESERVED_RAM);
    const homeWorker = new WorkerServer(home);
    homeWorker.freeThreads = Math.floor(freeRam / 1.75);
    servers.push(homeWorker);

    return servers;
}

function buildPrepPool(_ns: NS, farmPool: WorkerServer[]): WorkerServer[] {
    return farmPool;
}

function printStatus(ns: NS, targets: Server[], farmPool: WorkerServer[], prepPool: WorkerServer[]): void {
    const farmFree  = farmPool.reduce((s, w) => s + w.freeThreads, 0);
    const farmMax   = farmPool.reduce((s, w) => s + w.maxThreads,  0);
    const prepExtra = prepPool.find(w => w.hostname === "home");
    const homeStr   = prepExtra ? ` | home: ${prepExtra.freeThreads} free` : "";

    ns.print(`Farm threads: ${farmMax - farmFree} / ${farmMax} used${homeStr}`);
    ns.print("─".repeat(65));
    ns.print(
        "Target".padEnd(20) +
        "Sec↓".padEnd(14) +
        "$/max".padEnd(18) +
        "State"
    );
    ns.print("─".repeat(65));

    for (const server of targets) {
        const s        = ns.getServer(server.hostname) as Server;
        const secStr   = `${ns.format.number(s.hackDifficulty!, 1)}/${ns.format.number(s.minDifficulty!, 1)}`;
        const moneyStr = `${ns.format.number(s.moneyAvailable!)}/${ns.format.number(s.moneyMax!)}`;
        const state    = isPrepped(s) ? "🌾 farm" : "🔧 prep";
        ns.print(
            s.hostname.padEnd(20) +
            secStr.padEnd(14) +
            moneyStr.padEnd(18) +
            state
        );
    }
    ns.print("─".repeat(65));
}

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}
