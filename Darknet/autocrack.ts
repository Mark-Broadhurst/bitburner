import { NS } from "@ns";

const PASSWORDS_FILE = "Darknet/passwords.txt";

/**
 * Continuously cracks all reachable darknet servers.
 *
 * Direct targets (probe() sees them from home) are cracked in parallel since
 * they each run their own crack.js on home with plenty of RAM.
 *
 * Hop targets (need exec onto a small intermediate server) are cracked one at
 * a time — they all compete for the same parent's limited RAM so parallelism
 * just causes exec failures.
 */
export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(700, 500);

    let idleCycles = 0;

    while (true) {
        ns.clearLog();

        const passwords  = loadPasswords(ns);
        const discovered = discoverAll(ns);
        const targets    = [...discovered].filter(h => {
            if (h in passwords) return false;
            const a = (ns.dnet as any).getServerDetails(h);
            return a.isOnline && !a.hasSession;
        });

        ns.print(`Known: ${discovered.size}  Cracked: ${Object.keys(passwords).length}  Pending: ${targets.length}`);
        ns.print("─".repeat(60));

        if (targets.length === 0) {
            // Bootstrap / refresh topology: for every directly-reachable cracked server
            // that has no topology file, exec probe.js on it to discover its neighbors.
            // probe() is script-location-based, so this must run ON the remote server.
            const probed = await probeDirectCracked(ns, passwords);
            if (probed > 0) continue; // re-check — new topology files may reveal new targets

            idleCycles++;
            ns.print(`No new targets. Waiting for next mutation... (idle ${idleCycles})`);
            await ns.dnet.nextMutation();
            continue;
        }

        idleCycles = 0;

        const visible = new Set(ns.dnet.probe());
        const direct  = targets.filter(h =>  visible.has(h));
        const hop     = targets.filter(h => !visible.has(h));

        // --- Direct targets: crack all in parallel (run on home, plenty of RAM) ---
        if (direct.length > 0) {
            ns.print(`Direct (${direct.length}): ${direct.join(", ")}`);
            const pids = new Map<number, string>();
            for (const target of direct) {
                const pid = ns.run("Darknet/crack.js", 1, target);
                if (pid > 0) pids.set(pid, target);
                else ns.print(`  WARN: could not start crack.js for ${target}`);
            }
            while (pids.size > 0) {
                await ns.sleep(0);
                for (const [pid] of pids) if (!ns.isRunning(pid)) pids.delete(pid);
            }
        }

        // --- Hop targets: one at a time (all compete for the same parent's RAM) ---
        if (hop.length > 0) {
            ns.print(`Hop (${hop.length}): ${hop.join(", ")}`);
            for (const target of hop) {
                ns.print(`  Cracking ${target}...`);
                const pid = ns.run("Darknet/crack.js", 1, target);
                if (pid <= 0) { ns.print(`  WARN: could not start crack.js`); continue; }

                // Wait for home-side crack.js to exit (hands off then exits quickly)
                while (ns.isRunning(pid)) await ns.sleep(0);

                // Poll until the password appears — 45s ceiling for slow/brute-force cracks
                const deadline = Date.now() + 45_000;
                while (Date.now() < deadline) {
                    const pw = loadPasswords(ns);
                    if (pw[target] !== undefined || (ns.dnet as any).getServerDetails(target).hasSession) break;
                    await ns.sleep(0);
                }
            }
        }

        // Report results
        ns.clearLog();
        const updated = loadPasswords(ns);
        ns.print(`Known: ${discovered.size}  Cracked: ${Object.keys(updated).length}`);
        ns.print("─".repeat(60));
        for (const target of targets) {
            const ok = updated[target] !== undefined || (ns.dnet as any).getServerDetails(target).hasSession;
            ns.print(`${ok ? "✅" : "❌"} ${target}`);
        }

    }
}

/**
 * Exec probe.js on every directly-reachable cracked server that has no topology
 * file yet. Returns the number of servers probed.
 */
async function probeDirectCracked(ns: NS, passwords: Record<string, string>): Promise<number> {
    const direct = new Set(ns.dnet.probe());
    const targets = [...direct].filter(h =>
        h in passwords && !ns.fileExists(`dnet_${h}.txt`, "home")
    );
    for (const host of targets) {
        const r = ns.dnet.connectToSession(host, passwords[host]);
        if (!r.success) continue;
        await ns.scp("Darknet/probe.js", host, "home");
        const pid = ns.exec("Darknet/probe.js", host, 1);
        if (pid > 0) while (ns.isRunning(pid)) await ns.sleep(0);
    }
    return targets.length;
}

function discoverAll(ns: NS): Set<string> {
    const hosts = new Set<string>(ns.dnet.probe());
    for (const f of ns.ls("home", "dnet_")) {
        try {
            const neighbors = JSON.parse(ns.read(f)) as string[];
            neighbors.forEach(h => hosts.add(h));
        } catch {}
    }
    ns.dnet.getStasisLinkedServers().forEach(h => hosts.add(h));
    return hosts;
}

function loadPasswords(ns: NS): Record<string, string> {
    if (!ns.fileExists(PASSWORDS_FILE, "home")) return {};
    try { return JSON.parse(ns.read(PASSWORDS_FILE)); } catch { return {}; }
}
