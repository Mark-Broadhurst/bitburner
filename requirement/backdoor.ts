import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(500, 360);

    const targets = findBackdoorTargets(ns);

    if (targets.length === 0) {
        ns.print("✅ All accessible servers already backdoored.");
        await ns.sleep(3000);
        ns.ui.closeTail();
        return;
    }

    ns.print(`Installing backdoors on ${targets.length} server(s)...`);
    ns.print("─".repeat(50));

    let done = 0;
    for (const server of targets) {
        const path = findPath(ns, server.hostname);
        if (path.length === 0) {
            ns.print(`⚠  No path found to ${server.hostname}`);
            continue;
        }

        // Navigate to the target server
        for (const hop of path.slice(1)) {  // skip "home"
            ns.singularity.connect(hop);
        }

        ns.print(`🔧 Installing backdoor on ${server.hostname}...`);
        await ns.singularity.installBackdoor();
        ns.print(`✅ Done: ${server.hostname}`);
        done++;

        // Return home after each install
        ns.singularity.connect("home");
    }

    ns.print("─".repeat(50));
    ns.print(`Backdoored ${done} / ${targets.length} servers.`);
    await ns.sleep(3000);
    ns.ui.closeTail();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Find all servers that should receive a backdoor:
 *   - We have admin rights
 *   - Backdoor not yet installed
 *   - Our hacking level meets the requirement
 */
function findBackdoorTargets(ns: NS): Server[] {
    const hackLevel = ns.getHackingLevel();

    return getAllServers(ns)
        .map(hostname => ns.getServer(hostname) as Server)
        .filter(s => s.hasAdminRights)
        .filter(s => !s.backdoorInstalled)
        .filter(s => s.requiredHackingSkill! <= hackLevel)
        .filter(s => s.hostname !== "home")
        .sort((a, b) => a.requiredHackingSkill! - b.requiredHackingSkill!);
}

/**
 * BFS to find the shortest path from home to a target hostname.
 * Returns the full path including "home" and the target.
 */
function findPath(ns: NS, target: string): string[] {
    const visited = new Set<string>(["home"]);
    const queue: { host: string; path: string[] }[] = [{ host: "home", path: ["home"] }];

    while (queue.length > 0) {
        const { host, path } = queue.shift()!;
        if (host === target) return path;
        for (const neighbor of ns.scan(host)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push({ host: neighbor, path: [...path, neighbor] });
            }
        }
    }
    return []; // target unreachable
}

/** Walk the full server graph and return all hostnames. */
function getAllServers(ns: NS): string[] {
    const visited = new Set<string>(["home"]);
    const queue = ["home"];
    while (queue.length > 0) {
        const host = queue.shift()!;
        for (const neighbor of ns.scan(host)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    return [...visited];
}

export function autocomplete(data: any, args: any) {
    return [...data.servers];
}
