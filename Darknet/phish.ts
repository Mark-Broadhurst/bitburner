import { NS } from "@ns";

/**
 * Pure phishing loop — runs ON a darknet server.
 * Stasis linking, RAM freeing, and cache claiming are all handled by
 * stasis.ts and crawler.ts; this script does only one thing.
 */
export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");

    if (!ns.dnet.isDarknetServer()) {
        ns.tprint(`ERROR phish.js must run on a darknet server, not ${ns.getHostname()}`);
        return;
    }

    while (true) {
        const r = await ns.dnet.phishingAttack();
        ns.print(`Phish: ${r.success ? "✅ hit" : "❌ miss"} — ${r.message}`);
    }
}
