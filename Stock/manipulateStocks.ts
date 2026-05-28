import { NS } from "@ns";

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

    while (!ns.stock.hasTixApiAccess()) {
        await ns.sleep(10_000);
    }

    while (true) {
        const grow: string[] = [];
        const hack: string[] = [];

        for (const symbol of ns.stock.getSymbols()) {
            const server = SYMBOL_SERVER[symbol];
            if (!server) continue;

            const [longShares, , shortShares] = ns.stock.getPosition(symbol);
            if (longShares  > 0) grow.push(server);
            if (shortShares > 0) hack.push(server);
        }

        ns.write("Stock/positions.txt", JSON.stringify({ grow, hack }), "w");

        ns.clearLog();
        if (grow.length > 0) ns.print(`Long (grow): ${grow.join(", ")}`);
        if (hack.length > 0) ns.print(`Short (hack): ${hack.join(", ")}`);
        if (grow.length + hack.length === 0) ns.print("No active positions.");

        await ns.stock.nextUpdate();
    }
}
