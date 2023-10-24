import { NS } from "@ns";
import { findBestCrime, printCrimeStats } from "utils/crime";



export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    while (true) {
        ns.clearLog();
        const player = ns.getPlayer();
        printCrimeStats(ns, player);
        const crime = findBestCrime(ns, player);
        const stats = ns.singularity.getCrimeStats(crime);
        ns.singularity.commitCrime(crime, false);
        await ns.sleep(stats.time);
    }
}

