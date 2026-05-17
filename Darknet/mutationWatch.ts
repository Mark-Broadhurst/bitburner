import { NS } from "@ns";

const PASSWORDS_FILE = "Darknet/passwords.txt";
const CRAWLER        = "Darknet/crawler.js";

/**
 * Watches for darknet topology mutations and re-seeds the crawler after each one.
 *
 * After a mutation some servers may have restarted (losing their crawler instance).
 * For every server we still have a password for, we reconnect and re-exec the crawler
 * (preventDuplicates means it's a no-op if it's already running there).
 *
 * Also restarts the home-side crawler if it somehow died.
 */
export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(620, 380);

    let mutations = 0;

    ns.print("mutationWatch: waiting for first mutation...");

    while (true) {
        await ns.dnet.nextMutation();
        mutations++;

        ns.clearLog();
        const instab = ns.dnet.getDarknetInstability();
        ns.print(`⚡ Mutation ${mutations}  AuthMult: ${instab.authenticationDurationMultiplier.toFixed(2)}x`);
        ns.print("─".repeat(52));

        // Ensure the home-side crawler is alive
        if (!ns.isRunning(CRAWLER)) {
            const pid = ns.run(CRAWLER, 1);
            ns.print(pid > 0 ? `Restarted crawler.js on home (pid ${pid})` : "WARNING: could not restart crawler.js");
        } else {
            ns.print("crawler.js running on home ✓");
        }

        // Re-seed crawler to all servers we have passwords for.
        // preventDuplicates makes this safe — it's a no-op if crawler is already running.
        const passwords = loadPasswords(ns);
        const hosts = Object.keys(passwords);
        ns.print(`Re-seeding crawler to ${hosts.length} cracked server(s)...`);

        let seeded = 0;
        let evicted = 0;
        for (const [host, password] of Object.entries(passwords)) {
            let auth: ReturnType<typeof ns.dnet.getServerDetails>;
            try { auth = ns.dnet.getServerDetails(host); }
            catch { evictPassword(ns, host); evicted++; continue; }
            if (!auth.isOnline) continue;

            const r = ns.dnet.connectToSession(host, password);
            if (!r.success) {
                // Server restarted with a new password — evict so autocrack picks it up
                if (!r.message?.includes("Service Unavailable")) {
                    evictPassword(ns, host);
                    ns.print(`  evicted stale password for ${host}`);
                    evicted++;
                }
                continue;
            }

            await ns.scp(CRAWLER, host, "home");
            const pid = ns.exec(CRAWLER, host, { preventDuplicates: true } as any);
            if (pid > 0) seeded++;
        }

        ns.print(`  Seeded: ${seeded}  Evicted: ${evicted}`);
        ns.print("─".repeat(52));
        ns.print("Waiting for next mutation...");
    }
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
