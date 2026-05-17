import { NS } from "@ns";
import { getWorkerServers, getPlayerServers } from "Utils/network";
import { WorkerServer } from "Utils/hacking";

/**
 * BN8 stock manipulation engine.
 *
 * Dedicates all RAM to W → G/H → W batches on stock-linked servers:
 *   - weaken1  lands first, bringing security to minimum so ops run at full speed
 *   - grow/hack lands next with stock:true, moving the stock price
 *   - weaken2  lands last, counteracting the security raised by the grow/hack
 *
 * Direction per server:
 *   forecast >= 0.5 → grow  (price goes up  → trade.ts buys long)
 *   forecast <  0.5 → hack  (price goes down → trade.ts buys short)
 *
 * Targets are prioritised by distance from 0.5 — most exploitable gets RAM first.
 * MAX_TARGETS caps how many stocks we spread across; with limited threads it is
 * better to fully commit to the highest-edge stocks than to dilute across many.
 */

const HOME_RESERVED_RAM      = 128;
const HISTORY_LEN            = 32;
const SPACING                = 200;  // ms between landing times
const MIN_THREADS_PER_TARGET = 100;  // minimum threads a target must receive to be worth taking on
const MIN_EDGE               = 0.06; // skip stocks within 6% of 0.5 — signal too weak

// Security raised per thread: grow = 0.004, hack = 0.002; weaken lowers by 0.05
const SEC_PER_GROW   = 0.004;
const SEC_PER_HACK   = 0.002;
const SEC_PER_WEAKEN = 0.05;

// Symbol → server hostname (null = no linked server)
const SYMBOL_SERVER: Record<string, string | null> = {
    ECP:   "ecorp",
    MCP:   "megacorp",
    BLD:   "blade",
    CLRK:  "clarkinc",
    OMTK:  "omnitek",
    FSIG:  "4sigma",
    KGI:   "kuai-gong",
    FLCM:  "fulcrumtech",
    STM:   "stormtech",
    DCOMM: "defcomm",
    HLS:   "helios",
    VITA:  "vitalife",
    ICRS:  "icarus",
    UNV:   "univ-energy",
    AERO:  "aerocorp",
    OMN:   "omnia",
    SLRS:  "solaris",
    GPH:   "global-pharm",
    NVMD:  "nova-med",
    WDS:   null,
    LXO:   "lexo-corp",
    RHOC:  "rho-construction",
    APHE:  "alpha-ent",
    SYSC:  "syscore",
    CTK:   "computek",
    NTLK:  "netlink",
    OMGA:  "omega-net",
    FNS:   "foodnstuff",
    JGN:   "joesguns",
    SGC:   "sigma-cosmetics",
    CTYS:  "catalyst",
    MDYN:  "microdyne",
    TITN:  "titan-labs",
};

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(520, 500);

    while (!ns.stock.hasTixApiAccess()) {
        ns.clearLog();
        ns.print("⏳ Waiting for TIX API...");
        await ns.sleep(5_000);
    }

    const priceHistory = new Map<string, number[]>();

    while (true) {
        ns.clearLog();

        const has4S   = ns.stock.has4SDataTixApi();
        const symbols = ns.stock.getSymbols();

        // Update price history for pre-4S estimation
        for (const sym of symbols) {
            const price = ns.stock.getAskPrice(sym);
            const h     = priceHistory.get(sym) ?? [];
            h.push(price);
            if (h.length > HISTORY_LEN + 1) h.shift();
            priceHistory.set(sym, h);
        }

        // Build worker pool
        const pool = [
            ...getPlayerServers(ns),
            ...getWorkerServers(ns),
        ].map(s => new WorkerServer(s));

        const home       = ns.getServer("home");
        const homeWorker = new WorkerServer(home);
        homeWorker.freeThreads = Math.floor(
            Math.max(0, home.maxRam - home.ramUsed - HOME_RESERVED_RAM) / 1.75
        );
        pool.push(homeWorker);

        const totalFreeThreads = pool.reduce((s, w) => s + w.freeThreads, 0);

        // Capacity = max threads across all workers regardless of what's currently running.
        // Previous-tick scripts are still in flight so freeThreads can be near zero — using
        // capacity here keeps numTargets stable as RAM grows rather than bouncing each tick.
        const homeCapacity  = Math.floor(Math.max(0, home.maxRam - HOME_RESERVED_RAM) / 1.75);
        const otherCapacity = pool
            .filter(w => w.hostname !== "home")
            .reduce((s, w) => s + w.maxThreads, 0);
        const totalCapacity = homeCapacity + otherCapacity;

        // Determine targets — only servers we have root access on.
        // Pre-4S: only grow.  trade.ts only buys longs before 4S data is available,
        // so hacking stocks (pushing prices down) would work against our positions.
        // With 4S data both directions are used to match trade.ts's long/short posture.
        const targets = symbols
            .map(sym => {
                const server = SYMBOL_SERVER[sym];
                if (!server || !ns.serverExists(server) || !ns.hasRootAccess(server)) return null;
                const forecast = has4S
                    ? ns.stock.getForecast(sym)
                    : estimateForecast(priceHistory.get(sym) ?? [], HISTORY_LEN);
                // Pre-4S: always grow (trade.ts is longs-only until 4S)
                const command: "grow" | "hack" = (!has4S || forecast >= 0.5) ? "grow" : "hack";
                return { sym, server, forecast, command };
            })
            .filter((t): t is NonNullable<typeof t> => t !== null)
            // Pre-4S: skip stocks trending downward — growing a bearish stock wastes
            // threads on a server trade.ts isn't long on.
            .filter(t => has4S ? Math.abs(t.forecast - 0.5) >= MIN_EDGE : t.forecast - 0.5 >= MIN_EDGE)
            .sort((a, b) => Math.abs(b.forecast - 0.5) - Math.abs(a.forecast - 0.5));

        // How many targets can we fund meaningfully? Use capacity so the count is
        // stable even when current free RAM is low due to in-flight scripts.
        const numTargets      = Math.max(1, Math.floor(totalCapacity / MIN_THREADS_PER_TARGET));
        const focusedTargets  = targets.slice(0, numTargets);
        const budgetPerTarget = Math.floor(totalCapacity / Math.max(focusedTargets.length, 1));

        // Dispatch W → G/H → W batches — each target gets an equal thread budget
        for (const target of focusedTargets) {
            const srv        = ns.getServer(target.server);
            const weakenTime = ns.getWeakenTime(target.server);
            const opTime     = target.command === "grow"
                ? ns.getGrowTime(target.server)
                : ns.getHackTime(target.server);

            // Threads needed to bring security back to min right now
            const secOver        = Math.max(0, srv.hackDifficulty! - srv.minDifficulty!);
            const weaken1Threads = Math.ceil(secOver / SEC_PER_WEAKEN);

            // Each op thread raises security; weaken2 counters it
            // opThreads + weaken2Threads = remaining, weaken2 = opThreads * ratio
            const secPerOp  = target.command === "grow" ? SEC_PER_GROW : SEC_PER_HACK;
            const w2PerOp   = secPerOp / SEC_PER_WEAKEN;  // grow: 0.08, hack: 0.04

            const poolFree  = pool.reduce((s, w) => s + w.freeThreads, 0);
            const capped    = Math.min(poolFree, budgetPerTarget);  // fair share
            const available = Math.max(0, capped - weaken1Threads);
            const opThreads      = Math.floor(available / (1 + w2PerOp));
            const weaken2Threads = available - opThreads;

            if (opThreads <= 0) continue;

            // Timing: all dispatched at t=0, land in order weaken1 → op → weaken2
            const weaken1Delay = 0;
            const opDelay      = Math.ceil(weakenTime - opTime + SPACING);
            const weaken2Delay = 2 * SPACING;

            allocate(ns, pool, "weaken",         target.server, weaken1Threads, weaken1Delay, false);
            allocate(ns, pool, target.command,   target.server, opThreads,      opDelay,      true);
            allocate(ns, pool, "weaken",         target.server, weaken2Threads, weaken2Delay, false);
        }

        // Status
        ns.print(`Capacity: ${totalCapacity}  Free: ${totalFreeThreads}  Targets: ${focusedTargets.length} (~${budgetPerTarget}/each)  ${has4S ? "✅ 4S" : "📈 Pre-4S"}`);
        ns.print("─".repeat(52));
        ns.print("Sym    Forecast  Action  Server");
        ns.print("─".repeat(52));
        for (const t of focusedTargets) {
            const fcst   = `${(t.forecast * 100).toFixed(1)}%`;
            const action = t.command === "grow" ? "📈 grow" : "📉 hack";
            ns.print(`${t.sym.padEnd(7)}${fcst.padEnd(10)}${action.padEnd(8)}${t.server}`);
        }
        ns.print("─".repeat(52));

        await ns.stock.nextUpdate();
    }
}

function allocate(
    ns: NS,
    pool: WorkerServer[],
    command: string,
    target: string,
    threads: number,
    wait: number,
    stock: boolean,
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

function estimateForecast(history: number[], window: number): number {
    const h = history.slice(-(window + 1));
    if (h.length < 2) return 0.5;
    let ups = 0;
    for (let i = 1; i < h.length; i++) {
        if (h[i] > h[i - 1]) ups++;
    }
    return ups / (h.length - 1);
}
