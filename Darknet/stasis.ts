import { NS } from "@ns";

const PASSWORDS_FILE = "Darknet/passwords.txt";
const PHISH_SCRIPT   = "Darknet/phish.js";
const PIN_SCRIPT     = "Darknet/pin.js";

/**
 * Daemon that maintains stasis links on the highest-RAM cracked servers
 * and keeps phishing running on them.
 *
 * Runs from home. Re-evaluates after every topology mutation.
 * Stasis links keep servers reachable through mutations so phishing
 * doesn't need to re-authenticate constantly.
 */
export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(640, 320);

    while (true) {
        ns.clearLog();

        const passwords = loadPasswords(ns);
        const pinned    = ns.dnet.getStasisLinkedServers();
        const limit     = ns.dnet.getStasisLinkLimit();

        // Sort cracked online servers by usable RAM descending.
        // Guard against stale/invalid entries in passwords.txt (e.g. non-darknet hosts).
        const invalidHosts: string[] = [];
        const candidates = Object.keys(passwords)
            .flatMap(host => {
                try {
                    const auth = ns.dnet.getServerDetails(host);
                    const srv  = ns.getServer(host) as any;
                    return [{ host, ram: (srv.maxRam ?? 0) - (srv.blockedRam ?? 0), online: auth.isOnline }];
                } catch {
                    invalidHosts.push(host);
                    return [];
                }
            })
            .filter(s => s.online && s.ram > 0)
            .sort((a, b) => b.ram - a.ram);

        // Evict any hosts that threw (not darknet servers)
        if (invalidHosts.length > 0) {
            ns.tprint(`WARN stasis: evicting invalid password entries: ${invalidHosts.join(", ")}`);
            evictPasswords(ns, invalidHosts);
        }

        const targets = candidates.slice(0, limit).map(s => s.host);

        ns.print(`Stasis: ${pinned.length}/${limit} slots used`);
        ns.print(`Top servers: ${candidates.slice(0, 5).map(s => `${s.host}(${s.ram}GB)`).join(", ")}`);
        ns.print("─".repeat(60));

        // Pin top-N servers not yet linked
        for (const host of targets) {
            if (pinned.includes(host)) {
                ns.print(`✅ ${host} — pinned`);
            } else {
                ns.print(`📌 Pinning ${host}...`);
                await pinServer(ns, host, passwords[host]);
            }
        }

        // Remove stasis from servers that fell out of top-N
        for (const host of pinned) {
            if (!targets.includes(host) && passwords[host]) {
                ns.print(`🔓 Removing link from ${host} (no longer top server)`);
                await setPinState(ns, host, passwords[host], false);
            }
        }

        // Deploy phishing to all currently pinned servers
        const nowPinned = ns.dnet.getStasisLinkedServers();
        for (const host of nowPinned) {
            const pw = passwords[host];
            if (!pw) continue;
            if (ns.isRunning(PHISH_SCRIPT, host)) {
                ns.print(`🎣 ${host} — phishing running`);
            } else {
                ns.print(`🎣 Deploying phish to ${host}...`);
                await deployPhish(ns, host, pw);
            }
        }

        ns.print("─".repeat(60));
        ns.print("Waiting for next mutation...");
        await ns.dnet.nextMutation();
    }
}

async function pinServer(ns: NS, host: string, password: string): Promise<void> {
    await setPinState(ns, host, password, true);
}

async function setPinState(ns: NS, host: string, password: string, enable: boolean): Promise<void> {
    const r = ns.dnet.connectToSession(host, password);
    if (!r.success) {
        ns.tprint(`WARN stasis: connectToSession(${host}) failed — ${r.message}`);
        return;
    }

    // Free blocked RAM so pin.js (12 GB) has room to run
    const blocked = ns.dnet.getBlockedRam(host);
    if (blocked > 0) await ns.dnet.memoryReallocation(host);

    await ns.scp(PIN_SCRIPT, host, "home");
    const pid = ns.exec(PIN_SCRIPT, host, 1, ...(enable ? [] : ["--remove"]));
    if (pid > 0) ns.tprint(`INFO stasis: ${enable ? "pinned" : "unpinned"} ${host} (pid ${pid})`);
    else         ns.tprint(`WARN stasis: pin.js exec failed on ${host} — not enough RAM?`);
}

async function deployPhish(ns: NS, host: string, password: string): Promise<void> {
    const r = ns.dnet.connectToSession(host, password);
    if (!r.success) return;

    await ns.scp(PHISH_SCRIPT, host, "home");
    const pid = ns.exec(PHISH_SCRIPT, host, 1);
    if (pid > 0) ns.tprint(`INFO stasis: phish.js deployed to ${host} (pid ${pid})`);
    else         ns.tprint(`WARN stasis: phish.js exec failed on ${host} — not enough RAM?`);
}

function loadPasswords(ns: NS): Record<string, string> {
    if (!ns.fileExists(PASSWORDS_FILE, "home")) return {};
    try { return JSON.parse(ns.read(PASSWORDS_FILE)); } catch { return {}; }
}

function evictPasswords(ns: NS, hosts: string[]): void {
    const stored = loadPasswords(ns);
    for (const host of hosts) delete stored[host];
    ns.write(PASSWORDS_FILE, JSON.stringify(stored, null, 2), "w");
}
