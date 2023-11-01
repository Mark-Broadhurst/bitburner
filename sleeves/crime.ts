import { NS } from "@ns";
import { findBestCrime, printCrimeStats } from "utils/crime";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    let numSleeves = ns.sleeve.getNumSleeves();
    for (let i = 0; i < numSleeves; i++) {
        const sleeve = ns.sleeve.getSleeve(i);
        printCrimeStats(ns, sleeve);
        const crime = findBestCrime(ns, sleeve);
        ns.sleeve.setToCommitCrime(i, crime);
    }
}
