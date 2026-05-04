import { NS } from "@ns";
import { getServers } from "Utils/network";


export async function main(ns: NS): Promise<void> {

    ns.disableLog("ALL");
    ns.clearLog();
    const servers = getServers(ns)
        .filter(x => x.hostname != "w0r1d_d43m0n")
        .sort((a, b) => a.requiredHackingSkill! - b.requiredHackingSkill!)
        .sort((a, b) => a.numOpenPortsRequired! - b.numOpenPortsRequired!);
    ns.singularity.connect("home");
    for (const server of servers) {
        if (server.backdoorInstalled) {
            continue;
        }
        while (!ns.hasRootAccess(server.hostname)) {
            ns.print(`waiting for rootAccess to backdoor ${server.hostname}`);
            await ns.sleep(10000);
        }
        while (ns.getHackingLevel() < server.requiredHackingSkill!) {
            ns.print(`waiting for hacklevel ${server.requiredHackingSkill} to backdoor ${server.hostname}`);
            await ns.sleep(60000);
        }
        const path = await pathTo(ns, server.hostname);
        for (const element of path) {
            ns.singularity.connect(element);
        }
        ns.print(`Installing backdoor for ${server.hostname}`);
        await ns.singularity.installBackdoor()
            .then(() => {
                ns.tprint(`Backdoor installed on ${server.hostname}`);
            });

        ns.singularity.connect("home");

    }
}

/**
 * BFS from home to find the shortest path to hostname.
 * Returns the path including "home" as the first element.
 * Using ns.scan(node)[0] is unreliable — the first neighbour isn't
 * always the parent toward home, so we use a proper BFS instead.
 */
function pathTo(ns: NS, hostname: string): string[] {
    const visited = new Set<string>(["home"]);
    const queue: { host: string; path: string[] }[] = [{ host: "home", path: ["home"] }];

    while (queue.length > 0) {
        const { host, path } = queue.shift()!;
        if (host === hostname) return path;
        for (const neighbor of ns.scan(host)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push({ host: neighbor, path: [...path, neighbor] });
            }
        }
    }
    return [hostname]; // fallback — shouldn't be reached
}
