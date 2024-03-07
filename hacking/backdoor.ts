import { NS } from "@ns";
import { getServers } from "utils/network";


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

function pathTo(ns:NS, hostname: string) {
    let path = [];
    let node = hostname;
    path.push(hostname);
    while (node != "home") {
        node = ns.scan(node)[0];
        path.push(node);
    }
    return path.reverse();
}
