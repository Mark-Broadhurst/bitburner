import { NS, Server } from "@ns";
import { getServers } from "Utils/network";

// Worker scripts to copy onto every newly-rooted server
const WORKER_FILES = ["grow.js", "weaken.js", "hack.js", "share.js", "charge.js"];

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    const servers = getServers(ns)
        .filter(s => !s.hasAdminRights)
        .sort((a, b) => a.numOpenPortsRequired! - b.numOpenPortsRequired!);

    let rooted = 0;
    let skipped = 0;

    for (const server of servers) {
        if (canRoot(ns, server)) {
            openPorts(ns, server);
            ns.nuke(server.hostname);
            ns.scp(WORKER_FILES, server.hostname);
            ns.tprint(`✅ Rooted: ${server.hostname}`);
            rooted++;
        } else {
            ns.tprint(`⏭  Skipped: ${server.hostname} (needs ${server.numOpenPortsRequired} ports, have ${countTools(ns)})`);
            skipped++;
        }
    }

    ns.tprint(`Done — rooted ${rooted}, skipped ${skipped}`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** True if we have enough port-opening tools to root this server. */
function canRoot(ns: NS, server: Server): boolean {
    return countTools(ns) >= server.numOpenPortsRequired!;
}

/** Count how many port-cracking programs currently exist on home. */
function countTools(ns: NS): number {
    const tools = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
    return tools.filter(t => ns.fileExists(t, "home")).length;
}

/** Open all available ports on a server. */
function openPorts(ns: NS, server: Server): void {
    if (ns.fileExists("BruteSSH.exe", "home")) ns.brutessh(server.hostname);
    if (ns.fileExists("FTPCrack.exe",  "home")) ns.ftpcrack(server.hostname);
    if (ns.fileExists("relaySMTP.exe", "home")) ns.relaysmtp(server.hostname);
    if (ns.fileExists("HTTPWorm.exe",  "home")) ns.httpworm(server.hostname);
    if (ns.fileExists("SQLInject.exe", "home")) ns.sqlinject(server.hostname);
}

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}
