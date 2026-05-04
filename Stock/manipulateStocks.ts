import { NS, Server } from "@ns";
import { getWorkerServers, getPlayerServers } from "utils/network";
import { Work, WorkerServer, Command } from "utils/hacking";


export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    while (true) {
        ns.clearLog();

        for(const symbol of ns.stock.getSymbols()) {
            const [longShares, longPrice, shortShares, shortPrice] = ns.stock.getPosition(symbol);
            const target = mappings[symbol] as string;

            if (longShares > 0) {
                await allocateWork(ns, "grow", target, 1);
            }
            if (shortShares > 0) {
                await allocateWork(ns, "hack", target, 1);
            }
        }

        await ns.sleep(1000);
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


async function allocateWork(ns: NS, command: Command, target: string, threads: number = 1, wait: number = 0): Promise<void> {
    while (threads > 0) {
        const workerServer = await findWorkerServer(ns);
        const threadsToUse = Math.min(threads, workerServer.freeThreads);
        ns.exec(`${command}.js`, workerServer.hostname, threadsToUse, target, wait, true);
        threads = threads - threadsToUse;
    }
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

const mappings = {
    "ECP": "ecorp",
    "MCP": "megacorp",
    "BLD": "blade",
    "CLRK": "clarkinc",
    "OMTK": "omnitek",
    "FSIG": "4sigma",
    "KGI": "kuai-gong",
    "FLCM": "fulcrumtech",
    "STM": "stormtech",
    "DCOMM": "defcomm",
    "HLS": "helios",
    "VITA": "vitalife",
    "ICRS": "icarus",
    "UNV": "univ-energy",
    "AERO": "aerocorp",
    "OMN": "omnia",
    "SLRS": "solaris",
    "GPH": "global-pharm",
    "NVMD": "nova-med",
    "WDS": null,
    "LXO": "lexo-corp",
    "RHOC": "rho-construction",
    "APHE": "alpha-ent",
    "SYSC": "syscore",
    "CTK": "computek",
    "NTLK": "netlink",
    "OMGA": "omega-net",
    "FNS": "foodnstuff",
    "JGN": "joesguns",
    "SGC": "sigma-cosmetics",
    "CTYS": "catalyst",
    "MDYN": "microdyne",
    "TITN": "titan-labs",
} as const;

