import { NS } from "@ns";

/**
 * One-shot: reports this server's probe() results back to home and exits.
 * Run this on any cracked darknet server to discover its neighbors.
 * RAM cost is minimal (~2.4 GB) so it fits on small hop servers.
 */
export async function main(ns: NS): Promise<void> {
    const fname = `dnet_${ns.getHostname()}.txt`;
    ns.write(fname, JSON.stringify(ns.dnet.probe()), "w");
    await ns.scp(fname, "home");
}
