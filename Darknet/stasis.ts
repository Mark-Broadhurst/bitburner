import { NS } from "@ns";

const PASSWORDS_FILE = "Darknet/passwords.txt";
const CRAWLER        = "Darknet/crawler.js";
const PHISH_SCRIPT   = "Darknet/phish.js";
const PIN_SCRIPT     = "Darknet/pin.js";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(640, 420);

    let mutations = 0;

    // Run immediately on startup, then after each mutation
    while (true) {
        ns.clearLog();
        const instab = ns.dnet.getDarknetInstability();
        ns.print(`⚡ Mutations: ${mutations}  AuthMult: ${instab.authenticationDurationMultiplier.toFixed(2)}x`);
        ns.print("─".repeat(60));

        const passwords = loadPasswords(ns);

        ns.print("CRAWLER");
        if (!ns.isRunning(CRAWLER)) {
            const pid = ns.run(CRAWLER, 1);
            ns.print(pid > 0
                ? `  Restarted crawler on home (pid ${pid})`
                : "  WARNING: could not restart crawler.js");
        } else {
            ns.print("  crawler.js running on home ✓");
        }

        let seeded = 0, evicted = 0;
        for (const [host, password] of Object.entries(passwords)) {
            let auth: any;
            try { auth = (ns.dnet as any).getServerDetails(host); }
            catch { evictPassword(ns, host); evicted++; continue; }
            if (!auth.isOnline) continue;

            const r = ns.dnet.connectToSession(host, password);
            if (!r.success) {
                if (!r.message?.includes("Service Unavailable")) {
                    evictPassword(ns, host);
                    evicted++;
                }
                continue;
            }

            await ns.scp(CRAWLER, host, "home");
            const pid = ns.exec(CRAWLER, host, { preventDuplicates: true } as any);
            if (pid > 0) seeded++;
        }
        ns.print(`  Seeded: ${seeded}  Evicted: ${evicted}`);

        ns.print("─".repeat(60));
        ns.print("STASIS");

        const fresh     = loadPasswords(ns);
        const pinned    = ns.dnet.getStasisLinkedServers();
        const limit     = ns.dnet.getStasisLinkLimit();

        const invalidHosts: string[] = [];
        const candidates = Object.keys(fresh)
            .flatMap(host => {
                try {
                    const auth = (ns.dnet as any).getServerDetails(host);
                    const srv  = ns.getServer(host) as any;
                    return [{ host, ram: (srv.maxRam ?? 0) - (srv.blockedRam ?? 0), online: auth.isOnline }];
                } catch {
                    invalidHosts.push(host);
                    return [];
                }
            })
            .filter(s => s.online && s.ram > 0)
            .sort((a, b) => b.ram - a.ram);

        if (invalidHosts.length > 0) {
            ns.tprint(`WARN stasis: evicting invalid entries: ${invalidHosts.join(", ")}`);
            evictPasswords(ns, invalidHosts);
        }

        const targets = candidates.slice(0, limit).map(s => s.host);
        ns.print(`  ${pinned.length}/${limit} slots  Top: ${candidates.slice(0, 3).map(s => `${s.host}(${s.ram}GB)`).join(", ")}`);

        for (const host of targets) {
            if (pinned.includes(host)) {
                ns.print(`  ✅ ${host} — pinned`);
            } else {
                ns.print(`  📌 Pinning ${host}...`);
                await setPinState(ns, host, fresh[host], true);
            }
        }

        for (const host of pinned) {
            if (!targets.includes(host) && fresh[host]) {
                ns.print(`  🔓 Releasing ${host} (no longer top server)`);
                await setPinState(ns, host, fresh[host], false);
            }
        }

        ns.print("─".repeat(60));
        ns.print("PHISHING");
        const nowPinned = ns.dnet.getStasisLinkedServers();
        for (const host of nowPinned) {
            const pw = fresh[host];
            if (!pw) continue;
            if (ns.isRunning(PHISH_SCRIPT, host)) {
                ns.print(`  🎣 ${host} — running`);
            } else {
                ns.print(`  🎣 Deploying to ${host}...`);
                await deployPhish(ns, host, pw);
            }
        }

        ns.print("─".repeat(60));
        ns.print("Waiting for next mutation...");
        await ns.dnet.nextMutation();
        mutations++;
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function setPinState(ns: NS, host: string, password: string, enable: boolean): Promise<void> {
    const r = ns.dnet.connectToSession(host, password);
    if (!r.success) {
        ns.tprint(`WARN stasis: connectToSession(${host}) failed — ${r.message}`);
        return;
    }
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

function evictPassword(ns: NS, host: string): void {
    const stored = loadPasswords(ns);
    delete stored[host];
    ns.write(PASSWORDS_FILE, JSON.stringify(stored, null, 2), "w");
}

function evictPasswords(ns: NS, hosts: string[]): void {
    const stored = loadPasswords(ns);
    for (const host of hosts) delete stored[host];
    ns.write(PASSWORDS_FILE, JSON.stringify(stored, null, 2), "w");
}
