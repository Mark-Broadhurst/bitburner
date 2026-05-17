import { NS, Server } from "@ns";
import { getTargetServers, getWorkerServers, getPlayerServers } from "Utils/network";
import { WorkerServer, Command } from "Utils/hacking";

const HOME_RESERVED_RAM = 128;           // GB to keep free on home
const SPACING           = 200;           // ms between grow landing and weaken landing
const MAX_WEAKEN        = 10 * 60 * 1000; // skip servers with weakenTime > 10 min

// ── Entry point ───────────────────────────────────────────────────────────────

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(560, 420);

    while (true) {
        ns.clearLog();

        const targets = getTargetServers(ns)
            .filter(s => ns.getWeakenTime(s.hostname) <= MAX_WEAKEN);
        const unprepped = targets.filter(s => !isPrepped(s));

        if (unprepped.length === 0) {
            ns.print("✅ All servers prepped.");
            await ns.sleep(3000);
            ns.ui.closeTail();
            break;
        }

        // Single pool including home — this script runs before hackCommander
        // so all RAM is available
        const pool = buildPool(ns);

        for (const server of unprepped) {
            const works = calcPrepWork(ns, server);
            for (const w of works) {
                allocateWork(ns, pool, w.command, w.target, w.threads, w.wait);
            }
        }

        printStatus(ns, targets);
        await ns.sleep(SPACING);
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** True when server is at minimum security and maximum money. */
function isPrepped(server: Server): boolean {
    return (server.hackDifficulty! <= server.minDifficulty! + 1) &&
           (server.moneyAvailable! >= server.moneyMax! * 0.99);
}

/**
 * Calculate prep work for a non-prepped server.
 *   - Security above min → weaken only (bring security down first)
 *   - Security at min    → grow + weaken pair
 *
 * Grow naturally finishes before weaken (growTime < weakenTime), so both can
 * be dispatched with no additionalMsec and will land in the correct order.
 * A small SPACING offset is added so weaken lands cleanly after grow.
 */
function calcPrepWork(ns: NS, server: Server): { command: Command; target: string; threads: number; wait: number }[] {
    const host  = server.hostname;
    const works: { command: Command; target: string; threads: number; wait: number }[] = [];

    const securityDiff = server.hackDifficulty! - server.minDifficulty!;

    if (securityDiff > 1) {
        // Security too high — weaken only this cycle
        const weakenThreads = Math.ceil(securityDiff / 0.05);
        works.push({ command: "weaken", target: host, threads: weakenThreads, wait: 0 });
    } else {
        // Security OK — grow money then weaken to counter grow's security
        const moneyRatio = server.moneyMax! / Math.max(server.moneyAvailable!, 1);
        if (moneyRatio > 1.01) {
            const weakenTime = ns.getWeakenTime(host);
            const growTime   = ns.getGrowTime(host);
            const cores      = server.cpuCores;

            const growThreads   = Math.max(1, Math.ceil(ns.growthAnalyze(host, moneyRatio, cores)));
            const growSecurity  = ns.growthAnalyzeSecurity(growThreads, host, cores);
            const weakenThreads = Math.ceil(growSecurity / 0.05);

            // Stagger: grow lands at weakenTime, weaken lands at weakenTime + SPACING
            const growDelay   = Math.ceil(weakenTime - growTime);
            const weakenDelay = SPACING;

            works.push({ command: "grow",   target: host, threads: growThreads,   wait: growDelay });
            works.push({ command: "weaken", target: host, threads: weakenThreads, wait: weakenDelay });
        }
    }

    return works;
}

/** Build a pool of all available worker servers including home. */
function buildPool(ns: NS): WorkerServer[] {
    const servers = [
        ...getPlayerServers(ns),
        ...getWorkerServers(ns),
    ].map(s => new WorkerServer(s));

    // Append home with reserved RAM held back
    const home       = ns.getServer("home") as Server;
    const freeRam    = Math.max(0, home.maxRam - home.ramUsed - HOME_RESERVED_RAM);
    const homeWorker = new WorkerServer(home);
    homeWorker.freeThreads = Math.floor(freeRam / 1.75);
    servers.push(homeWorker);

    return servers;
}

/**
 * Distribute threads across the pool synchronously.
 * Mutates freeThreads in-memory so consecutive calls in the same cycle
 * don't double-allocate the same RAM.
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

/** Print a status table showing prep progress. */
function printStatus(ns: NS, targets: Server[]): void {
    const prepped = targets.filter(s => isPrepped(s)).length;
    ns.print(`Prepped: ${prepped} / ${targets.length}`);
    ns.print("─".repeat(62));
    ns.print("  " + "Target".padEnd(18) + "Sec↓".padEnd(13) + "$/max");
    ns.print("─".repeat(62));
    for (const server of targets) {
        const s        = ns.getServer(server.hostname) as Server;
        const secStr   = `${ns.format.number(s.hackDifficulty!, 1)}/${ns.format.number(s.minDifficulty!, 1)}`;
        const moneyStr = `${ns.format.number(s.moneyAvailable!)}/${ns.format.number(s.moneyMax!)}`;
        const tick     = isPrepped(s) ? "✅" : "🔧";
        ns.print(`${tick} ${s.hostname.padEnd(18)}${secStr.padEnd(13)}${moneyStr}`);
    }
    ns.print("─".repeat(62));
}

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}
