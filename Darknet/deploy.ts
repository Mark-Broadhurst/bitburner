import { NS } from "@ns";

const PASSWORDS_FILE = "Darknet/passwords.txt";
const PHISH          = "Darknet/phish.js";
const HOP_DEPLOY     = "Darknet/hopDeploy.js";

/**
 * (Re)deploys phish.js onto all cracked darknet servers.
 *
 * Servers directly reachable from home (probe() or stasis-linked) are exec'd
 * onto directly. Servers deeper in the network are handled by exec'ing
 * hopDeploy.js onto their parent so the deploy happens from an adjacent node.
 *
 * Usage:
 *   deploy.js          — deploys to all servers with saved passwords
 *   deploy.js <host>   — deploys to a specific host
 */
export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");

    if (!ns.fileExists(PASSWORDS_FILE, "home")) {
        ns.tprint("ERROR No passwords file found. Crack some servers first.");
        return;
    }

    let passwords: Record<string, string> = {};
    try { passwords = JSON.parse(ns.read(PASSWORDS_FILE)); }
    catch { ns.tprint("ERROR Could not parse passwords file."); return; }

    const targetArg = ns.args[0] as string | undefined;
    const hosts     = targetArg ? [targetArg] : Object.keys(passwords);
    if (hosts.length === 0) { ns.tprint("INFO No hosts to deploy to."); return; }

    const reachable = new Set([
        ...ns.dnet.probe(),
        ...ns.dnet.getStasisLinkedServers(),
    ]);

    for (const host of hosts) {
        const password = passwords[host];
        if (password === undefined) {
            ns.tprint(`WARN ${host}: no saved password, skipping`);
            continue;
        }

        if (!ns.dnet.getServerDetails(host).isOnline) {
            ns.tprint(`SKIP ${host}: offline`);
            continue;
        }

        const r = ns.dnet.connectToSession(host, password);
        if (!r.success) {
            // "Service Unavailable" = server is temporarily unreachable, keep the password.
            // Anything else (wrong password, auth rejected) = server restarted with a new
            // password, evict the entry so autocrack will re-crack it.
            if (!r.message?.includes("Service Unavailable")) {
                ns.tprint(`INFO ${host}: bad password — evicting so it gets re-cracked`);
                delete passwords[host];
                ns.write(PASSWORDS_FILE, JSON.stringify(passwords, null, 2), "w");
            } else {
                ns.tprint(`SKIP ${host}: unreachable (${r.message})`);
            }
            continue;
        }

        if (reachable.has(host)) {
            // Direct deploy from home
            await ns.scp([PHISH, "Darknet/pin.js"], host, "home");
            ns.scriptKill(PHISH, host);

            const pid = ns.exec(PHISH, host, 1);
            if (pid > 0) {
                ns.tprint(`SUCCESS ${host}: phish.js started (pid ${pid})`);
                const slots         = ns.dnet.getStasisLinkLimit() - ns.dnet.getStasisLinkedServers().length;
                const alreadyPinned = ns.dnet.getStasisLinkedServers().includes(host);
                if (slots > 0 && !alreadyPinned) {
                    const pinPid = ns.exec("Darknet/pin.js", host, 1);
                    if (pinPid > 0) ns.tprint(`  Pinned (pid ${pinPid})`);
                }
            } else {
                ns.tprint(`WARN ${host}: exec failed — trying --no-phish`);
                const pid2 = ns.exec(PHISH, host, 1, "--no-phish");
                if (pid2 > 0) ns.tprint(`  Retried with --no-phish: pid ${pid2}`);
            }
        } else {
            // Hop deploy — find parent and relay through it
            const parent = findParent(ns, host);
            if (!parent) {
                ns.tprint(`WARN ${host}: no parent found in topology — skipping`);
                continue;
            }

            const parentPassword = passwords[parent];
            if (parentPassword === undefined) {
                ns.tprint(`WARN ${host}: parent ${parent} has no saved password — skipping`);
                continue;
            }

            const pr = ns.dnet.connectToSession(parent, parentPassword);
            if (!pr.success) {
                ns.tprint(`WARN ${host}: connectToSession(${parent}) failed — ${pr.message}`);
                continue;
            }

            // Copy everything the relay needs onto the parent
            await ns.scp([HOP_DEPLOY, PHISH, "Darknet/pin.js"], parent, "home");

            const pid = ns.exec(HOP_DEPLOY, parent, 1, host, password);
            if (pid > 0) ns.tprint(`INFO ${host}: hopDeploy.js relayed via ${parent} (pid ${pid})`);
            else         ns.tprint(`WARN ${host}: hopDeploy exec on ${parent} failed — not enough RAM?`);
        }
    }
}

/** Find which server's topology file lists host as a neighbour. */
function findParent(ns: NS, target: string): string | null {
    for (const f of ns.ls("home", "dnet_")) {
        try {
            const neighbors = JSON.parse(ns.read(f)) as string[];
            if (neighbors.includes(target))
                return f.replace("dnet_", "").replace(".txt", "");
        } catch {}
    }
    return null;
}

export function autocomplete(data: any): string[] {
    try {
        const stored = JSON.parse(data.scripts?.["Darknet/passwords.txt"] ?? "{}") as Record<string, string>;
        return Object.keys(stored);
    } catch { return []; }
}
