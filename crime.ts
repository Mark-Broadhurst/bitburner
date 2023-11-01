import { NS } from "@ns";
import { findBestCrime, printCrimeStats } from "utils/crime";



export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.tail();
    ns.resizeTail(600, 380);
    while (true) {
        ns.clearLog();
        const player = ns.getPlayer();
        const crime = findBestCrime(ns, player);
        printCrimeStats(ns, player, crime);

        const stats = ns.singularity.getCrimeStats(crime);
        ns.singularity.commitCrime(crime, false);
        await ns.sleep(stats.time);
    }
}

