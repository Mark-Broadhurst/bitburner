import { NS } from "@ns";

// The crawler self-replicates — we only need to launch it on home.
// autocrack.js is superseded; kill it if still running from an old session.
const LEGACY = ["Darknet/autocrack.js", "Darknet/deploy.js", "Darknet/hopDeploy.js", "Darknet/pin.js", "Darknet/scan.js"];

const DAEMONS: string[] = [
    "Darknet/crawler.js",
    "Darknet/mutationWatch.js",
    "Darknet/stasis.js",
];

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");

    // Kill legacy scripts and current daemons to start fresh
    for (const script of [...LEGACY, ...DAEMONS]) {
        if (ns.isRunning(script)) {
            ns.scriptKill(script, "home");
            ns.tprint(`INFO Stopped ${script}`);
        }
    }

    await ns.sleep(0);

    // Launch all daemons
    for (const script of DAEMONS) {
        const pid = ns.run(script, 1);
        if (pid > 0) ns.tprint(`INFO Started ${script} (pid ${pid})`);
        else         ns.tprint(`ERROR Could not start ${script} — not enough RAM?`);
    }
}
