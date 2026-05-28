import { NS, Server } from "@ns";
import { getWorkerServers, getPlayerServers } from "Utils/network";
import { WorkerServer } from "Utils/hacking";

const HOME_RESERVED_RAM      = 128;
const HISTORY_LEN            = 32;
const SPACING                = 200;
const MIN_THREADS_PER_TARGET = 100;
const MIN_EDGE               = 0.06;

const SEC_PER_GROW   = 0.004;
const SEC_PER_HACK   = 0.002;
const SEC_PER_WEAKEN = 0.05;

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

        for (const sym of symbols) {
            const price = ns.stock.getAskPrice(sym);
            const h     = priceHistory.get(sym) ?? [];
            h.push(price);
            if (h.length > HISTORY_LEN + 1) h.shift();
            priceHistory.set(sym, h);
        }

        const pool = [
            ...getPlayerServers(ns),
            ...getWorkerServers(ns),
        ].map(s => new WorkerServer(s));

        const home       = ns.getServer("home") as Server;
        const homeWorker = new WorkerServer(home);
        homeWorker.freeThreads = Math.floor(
            Math.max(0, home.maxRam - home.ramUsed - HOME_RESERVED_RAM) / 1.75
        );
        pool.push(homeWorker);

        const totalFreeThreads = pool.reduce((s, w) => s + w.freeThreads, 0);

        const homeCapacity  = Math.floor(Math.max(0, home.maxRam - HOME_RESERVED_RAM) / 1.75);
        const otherCapacity = pool
            .filter(w => w.hostname !== "home")
            .reduce((s, w) => s + w.maxThreads, 0);
        const totalCapacity = homeCapacity + otherCapacity;

        const targets = symbols
            .map(sym => {
                const server = SYMBOL_SERVER[sym];
                if (!server || !ns.serverExists(server) || !ns.hasRootAccess(server)) return null;
                const forecast = has4S
                    ? ns.stock.getForecast(sym)
                    : estimateForecast(priceHistory.get(sym) ?? [], HISTORY_LEN);
                const command: "grow" | "hack" = (!has4S || forecast >= 0.5) ? "grow" : "hack";
                return { sym, server, forecast, command };
            })
            .filter((t): t is NonNullable<typeof t> => t !== null)
            .filter(t => has4S ? Math.abs(t.forecast - 0.5) >= MIN_EDGE : t.forecast - 0.5 >= MIN_EDGE)
            .sort((a, b) => Math.abs(b.forecast - 0.5) - Math.abs(a.forecast - 0.5));

        const numTargets      = Math.max(1, Math.floor(totalCapacity / MIN_THREADS_PER_TARGET));
        const focusedTargets  = targets.slice(0, numTargets);
        const budgetPerTarget = Math.floor(totalCapacity / Math.max(focusedTargets.length, 1));

        for (const target of focusedTargets) {
            const srv        = ns.getServer(target.server) as Server;
            const weakenTime = ns.getWeakenTime(target.server);
            const opTime     = target.command === "grow"
                ? ns.getGrowTime(target.server)
                : ns.getHackTime(target.server);

            const secOver        = Math.max(0, srv.hackDifficulty! - srv.minDifficulty!);
            const weaken1Threads = Math.ceil(secOver / SEC_PER_WEAKEN);

            const secPerOp  = target.command === "grow" ? SEC_PER_GROW : SEC_PER_HACK;
            const w2PerOp   = secPerOp / SEC_PER_WEAKEN;

            const poolFree  = pool.reduce((s, w) => s + w.freeThreads, 0);
            const capped    = Math.min(poolFree, budgetPerTarget);
            const available = Math.max(0, capped - weaken1Threads);
            const opThreads      = Math.floor(available / (1 + w2PerOp));
            const weaken2Threads = available - opThreads;

            if (opThreads <= 0) continue;

            const weaken1Delay = 0;
            const opDelay      = Math.ceil(weakenTime - opTime + SPACING);
            const weaken2Delay = 2 * SPACING;

            allocate(ns, pool, "weaken",         target.server, weaken1Threads, weaken1Delay, false);
            allocate(ns, pool, target.command,   target.server, opThreads,      opDelay,      true);
            allocate(ns, pool, "weaken",         target.server, weaken2Threads, weaken2Delay, false);
        }

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
