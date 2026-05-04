import { NS, Server } from "@ns";
import { getTargetServers, getWorkerServers, getPlayerServers } from "Utils/network";
import { Work, WorkerServer, Command } from "Utils/hacking";

const HACK_PERCENT       = 0.5;           // fraction of maxMoney to steal per hack
const SPACING            = 200;           // ms gap between each op landing
const MAX_WEAKEN         = 5 * 60 * 1000; // skip servers with weakenTime > 5 min
const HOME_RESERVED_RAM  = 64;            // GB to keep free on home for other scripts

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Entry point ───────────────────────────────────────────────────────────────

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(620, 500);

    while (true) {
        ns.clearLog();

        // farmPool: purchased + hacked servers — used for HWGW batches only
        const farmPool = getTaskServers(ns);

        // prepPool: farmPool + home — used for prep work only
        // (farmPool objects are shared by reference so farm allocations are
        //  visible here; home is appended as an extra source of threads)
        const prepPool = buildPrepPool(ns, farmPool);

        // All viable targets, sorted highest value first so RAM fills with the
        // best servers when capacity is limited.
        // Score = moneyMax / minDifficulty — rewards high money, low security.
        const targets = getTargetServers(ns)
            .filter(s => ns.getWeakenTime(s.hostname) <= MAX_WEAKEN)
            .filter(s => ns.hackAnalyzeChance(s.hostname) > 0)
            .sort((a, b) => (b.moneyMax! / b.minDifficulty!) - (a.moneyMax! / a.minDifficulty!));

        // ── Farm pass: fill RAM with HWGW batches for prepped targets ──────
        for (const server of targets) {
            const fresh = ns.getServer(server.hostname) as Server;
            if (!isPrepped(fresh)) continue;

            const batch   = calcFarmBatch(ns, fresh);
            const timings = calcTimings(ns, fresh);

            while (canAllocate(farmPool, batch.totalThreads)) {
                dispatchFarmBatch(ns, farmPool, fresh, batch, timings);
            }
        }

        // ── Prep pass: weaken / grow non-prepped targets (home allowed) ────
        for (const server of targets) {
            const fresh = ns.getServer(server.hostname) as Server;
            if (isPrepped(fresh)) continue;

            const works = calcPrepWork(ns, fresh);
            for (const w of works) {
                allocateWork(ns, prepPool, w.command, w.target, w.threads, w.wait);
            }
        }

        printStatus(ns, targets, farmPool, prepPool);
        await ns.sleep(SPACING);
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** True when server is at minimum security and maximum money. */
function isPrepped(server: Server): boolean {
    return (server.hackDifficulty!  <= server.minDifficulty! + 1) &&
           (server.moneyAvailable!  >= server.moneyMax! * 0.99);
}

/**
 * Calculate thread counts for one HWGW farm batch.
 * Assumes server is prepped (min security, max money).
 */
function calcFarmBatch(ns: NS, server: Server): BatchThreads {
    const host     = server.hostname;
    const moneyMax = server.moneyMax!;
    const cores    = server.cpuCores;

    // Hack — steal HACK_PERCENT of max money
    const hackThreads    = Math.max(1, Math.floor(ns.hackAnalyzeThreads(host, moneyMax * HACK_PERCENT)));
    const hackSecurity   = ns.hackAnalyzeSecurity(hackThreads, host);

    // Weaken1 — counter hack's security increase (each thread reduces by 0.05)
    const weaken1Threads = Math.ceil(hackSecurity / 0.05);

    // Grow — restore money from (1 - HACK_PERCENT) back to 1.0
    const growMultiplier = Math.min(1 / (1 - HACK_PERCENT), 1000);
    const growThreads    = Math.max(1, Math.ceil(ns.growthAnalyze(host, growMultiplier, cores)));
    const growSecurity   = ns.growthAnalyzeSecurity(growThreads, host, cores);

    // Weaken2 — counter grow's security increase
    const weaken2Threads = Math.ceil(growSecurity / 0.05);

    const totalThreads = hackThreads + weaken1Threads + growThreads + weaken2Threads;

    return { hackThreads, weaken1Threads, growThreads, weaken2Threads, totalThreads };
}

/**
 * Calculate additionalMsec delays so all four ops land in order:
 *   hack → weaken1 → grow → weaken2
 * with SPACING ms between each landing.
 *
 * All scripts dispatched at t=0. Landing times:
 *   hack:    weakenTime + 0*SPACING
 *   weaken1: weakenTime + 1*SPACING
 *   grow:    weakenTime + 2*SPACING
 *   weaken2: weakenTime + 3*SPACING
 */
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

/**
 * Calculate prep work for a non-prepped server.
 *   - Security above min  → weaken only
 *   - Security at min     → grow + weaken (staggered so weaken lands after grow)
 */
function calcPrepWork(ns: NS, server: Server): Work[] {
    const host       = server.hostname;
    const works: Work[] = [];

    const securityDiff = server.hackDifficulty! - server.minDifficulty!;

    if (securityDiff > 1) {
        // Weaken down to min security first
        const weakenThreads = Math.ceil(securityDiff / 0.05);
        works.push(new Work("weaken", host, weakenThreads, 0));
    } else {
        // Security OK — grow money and weaken after
        const moneyRatio = server.moneyMax! / Math.max(server.moneyAvailable!, 1);
        if (moneyRatio > 1.01) {
            const weakenTime = ns.getWeakenTime(host);
            const growTime   = ns.getGrowTime(host);
            const cores      = server.cpuCores;

            const growThreads   = Math.max(1, Math.ceil(ns.growthAnalyze(host, moneyRatio, cores)));
            const growSecurity  = ns.growthAnalyzeSecurity(growThreads, host, cores);
            const weakenThreads = Math.ceil(growSecurity / 0.05);

            // Grow lands first; weaken lands 200ms later
            const growDelay   = Math.ceil(weakenTime - growTime);
            const weakenDelay = SPACING;

            works.push(new Work("grow",   host, growThreads,   growDelay));
            works.push(new Work("weaken", host, weakenThreads, weakenDelay));
        }
    }

    return works;
}

/** True if the pool has enough total free threads for a full batch. */
function canAllocate(pool: WorkerServer[], threads: number): boolean {
    return pool.reduce((sum, s) => sum + s.freeThreads, 0) >= threads;
}

/** Dispatch all four HWGW ops, splitting threads across the pool as needed. */
function dispatchFarmBatch(
    ns: NS,
    pool: WorkerServer[],
    server: Server,
    batch: BatchThreads,
    timings: BatchTimings,
): void {
    const host = server.hostname;
    allocateWork(ns, pool, "hack",   host, batch.hackThreads,    timings.hackDelay);
    allocateWork(ns, pool, "weaken", host, batch.weaken1Threads, timings.weaken1Delay);
    allocateWork(ns, pool, "grow",   host, batch.growThreads,    timings.growDelay);
    allocateWork(ns, pool, "weaken", host, batch.weaken2Threads, timings.weaken2Delay);
}

/**
 * Exec a work item, splitting across multiple worker servers if needed.
 * Mutates freeThreads in-memory so subsequent calls in the same cycle
 * see the updated available RAM.
 */
function allocateWork(
    ns: NS,
    pool: WorkerServer[],
    command: Command,
    target: string,
    threads: number,
    wait: number,
): void {
    for (const worker of pool) {
        if (threads <= 0) break;
        if (worker.freeThreads <= 0) continue;
        const use = Math.min(threads, worker.freeThreads);
        ns.exec(`${command}.js`, worker.hostname, use, target, wait);
        worker.freeThreads -= use;
        threads -= use;
    }
}

/** Build the farm pool: purchased + hacked servers (home excluded). */
function getTaskServers(ns: NS): WorkerServer[] {
    return [
        ...getPlayerServers(ns),
        ...getWorkerServers(ns),
    ].map(s => new WorkerServer(s));
}

/**
 * Build the prep pool by appending a home WorkerServer to the existing farmPool.
 * Shares the farmPool objects by reference so farm allocations are already
 * reflected here. HOME_RESERVED_RAM GB is kept free on home for other scripts.
 */
function buildPrepPool(ns: NS, farmPool: WorkerServer[]): WorkerServer[] {
    const home       = ns.getServer("home") as Server;
    const freeRam    = Math.max(0, home.maxRam - home.ramUsed - HOME_RESERVED_RAM);
    const homeWorker = new WorkerServer(home);
    homeWorker.freeThreads = Math.floor(freeRam / 1.75);
    // Put home last so purchased/hacked servers are used first
    return [...farmPool, homeWorker];
}

/** Print a status table to the tail log. */
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
