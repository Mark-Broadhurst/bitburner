import { NS, Server } from "@ns";
import { getTargetServers, getWorkerServers, getPlayerServers } from "Utils/network";
import { Work, WorkerServer, Command } from "Utils/hacking";

const HACK_PERCENT       = 0.5;           // fraction of maxMoney to steal per hack
const SPACING            = 200;           // ms gap between each op landing
const MAX_WEAKEN         = 5 * 60 * 1000; // skip servers with weakenTime > 5 min
const MAX_LOOKAHEAD      = 30 * 1000;     // don't stagger batches more than 30s ahead
const HOME_RESERVED_RAM  = 128;           // GB to keep free on home for other scripts

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

        // Read stock position signals written by manipulateStocks.ts.
        // Servers in these sets get stock:true on their hack/grow dispatches.
        const { grow: stockGrow, hack: stockHack } = readStockSignals(ns);

        // Unified pool: purchased + hacked servers + home (HOME_RESERVED_RAM kept free).
        // Both farm and prep passes draw from this same array (shared WorkerServer
        // objects), so allocations in one pass are immediately visible to the other.
        // Home is last so dedicated servers fill first.
        const farmPool = getTaskServers(ns);
        const prepPool = buildPrepPool(ns, farmPool);

        // Home's actual CPU core count — used to correctly predict grow thread
        // needs for prep work.  Home is the dominant prep worker once farm
        // servers are saturated; grow.js uses the running server's cores
        // automatically at runtime, so predicting with 1 core over-allocates.
        const homeCores = ns.getServer("home").cpuCores;

        // All viable targets, sorted highest value first so RAM fills with the
        // best servers when capacity is limited.
        // Score = moneyMax / minDifficulty — rewards high money, low security.
        const targets = getTargetServers(ns)
            .filter(s => ns.getWeakenTime(s.hostname) <= MAX_WEAKEN)
            .filter(s => ns.hackAnalyzeChance(s.hostname) > 0)
            .sort((a, b) => (b.moneyMax! / b.minDifficulty!) - (a.moneyMax! / a.minDifficulty!));

        // ── Prep pass FIRST: weaken / grow non-prepped targets ─────────────
        // Runs before farm so desynced servers can always claim RAM to recover.
        for (const server of targets) {
            const fresh = ns.getServer(server.hostname) as Server;
            if (isPrepped(fresh)) continue;

            const works = calcPrepWork(ns, fresh, homeCores);
            for (const w of works) {
                const stock = w.command === "grow" && stockGrow.has(w.target);
                allocateWork(ns, prepPool, w.command, w.target, w.threads, w.wait, stock);
            }
        }

        // ── Farm pass SECOND: fill remaining RAM with pipelined HWGW batches
        // Each successive batch is offset by 4×SPACING so ops land sequentially
        // rather than simultaneously — prevents the security spiral caused by
        // many hacks landing at once before their corresponding weakens.
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

                // Re-check live security before each dispatch — stop immediately
                // if the server has drifted out of prepped state.
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
 *
 * workerCores should be the CPU core count of the primary prep worker (home).
 * grow.js automatically uses the running server's cores at runtime, so passing
 * home's actual core count here gives an accurate thread estimate and avoids
 * over-allocating grow threads when home handles the bulk of prep work.
 */
function calcPrepWork(ns: NS, server: Server, workerCores = 1): Work[] {
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

            // Use the worker's actual core count so thread prediction matches
            // runtime behaviour (multi-core home needs fewer grow threads).
            const growThreads   = Math.max(1, Math.ceil(ns.growthAnalyze(host, moneyRatio, workerCores)));
            const growSecurity  = ns.growthAnalyzeSecurity(growThreads, host, workerCores);
            const weakenThreads = Math.ceil(growSecurity / 0.05);

            // Grow lands first; weaken lands SPACING ms later
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
    stockGrow = false,
    stockHack = false,
): void {
    const host = server.hostname;
    allocateWork(ns, pool, "hack",   host, batch.hackThreads,    timings.hackDelay,    stockHack);
    allocateWork(ns, pool, "weaken", host, batch.weaken1Threads, timings.weaken1Delay);
    allocateWork(ns, pool, "grow",   host, batch.growThreads,    timings.growDelay,    stockGrow);
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

/**
 * Read the stock position signals written by manipulateStocks.ts.
 * Returns empty sets when the file is absent or malformed (safe default).
 */
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

/**
 * Build the unified worker pool: purchased servers + hacked servers + home.
 * Home is appended last so purchased/hacked servers fill first.
 * HOME_RESERVED_RAM GB is kept free on home for management scripts.
 *
 * Both the farm pass and the prep pass draw from this same pool (shared
 * WorkerServer objects), so prep allocations are visible to the farm pass
 * and vice-versa — no threads are double-counted.
 */
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

/**
 * Prep pool = farm pool — home is already included in getTaskServers().
 * Returns the same array so prep allocations are reflected in the farm pass.
 */
function buildPrepPool(_ns: NS, farmPool: WorkerServer[]): WorkerServer[] {
    return farmPool;
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
