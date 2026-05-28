import { NS } from "@ns";

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
