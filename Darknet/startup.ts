import { NS } from "@ns";

const LEGACY = [
    "Darknet/autocrack.js", "Darknet/deploy.js", "Darknet/hopDeploy.js",
    "Darknet/probe.js",     "Darknet/scan.js",   "Darknet/mutationWatch.js",
];

const DAEMONS: string[] = [
    "Darknet/crawler.js",  // self-replicating crawler — cracks servers, harvests files
    "Darknet/stasis.js",   // mutation watch + stasis links + phishing
];

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");

    while (!ns.fileExists("DarkscapeNavigator.exe", "home")) {
        ns.print("Waiting for DarkscapeNavigator.exe...");
        await ns.sleep(5_000);
    }

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
