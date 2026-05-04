import { NS, Server } from "@ns";
import { getWorkerServers, getPlayerServers } from "utils/network";
import { WorkerServer, Command } from "utils/hacking";

/**
 * Stock market manipulation.
 * When we hold a LONG position in a stock, grow the linked server to
 * push the price up.  When SHORT, hack it to push the price down.
 *
 * This gives a small edge on top of forecast-based trading.
 * Requires TIX API access to read positions.
 */

// Symbol → server hostname mapping (null = no linked server)
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
    WDS:   null,           // no linked server
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

// ── Entry point ───────────────────────────────────────────────────────────────

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    if (!ns.stock.hasTIXAPIAccess()) {
        ns.tprint("❌ No TIX API access — cannot read stock positions.");
        return;
    }

    while (true) {
        ns.clearLog();

        const pool = buildPool(ns);

        for (const symbol of ns.stock.getSymbols()) {
            const target = SYMBOL_SERVER[symbol];
            if (!target) continue; // no linked server for this symbol

            const [longShares, , shortShares] = ns.stock.getPosition(symbol);

            if (longShares > 0) {
                allocateWork(ns, pool, "grow", target, 1);
            }
            if (shortShares > 0) {
                allocateWork(ns, pool, "hack", target, 1);
            }
        }

        await ns.stock.nextUpdate();
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildPool(ns: NS): WorkerServer[] {
    return [
        ...getPlayerServers(ns),
        ...getWorkerServers(ns),
    ].map(s => new WorkerServer(s));
}

/**
 * Non-blocking work allocation — finds a worker with free threads and
 * dispatches the job.  Skips silently if no RAM is available rather than
 * looping forever.
 */
function allocateWork(
    ns:      NS,
    pool:    WorkerServer[],
    command: Command,
    target:  string,
    threads: number,
): void {
    for (const worker of pool) {
        if (threads <= 0) break;
        if (worker.freeThreads <= 0) continue;
        const use = Math.min(threads, worker.freeThreads);
        ns.exec(`${command}.js`, worker.hostname, use, target, 0);
        worker.freeThreads -= use;
        threads -= use;
    }
}
