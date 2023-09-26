import { NS } from "@ns";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();

    const CrimeType = ns.enums.CrimeType;
    ns.singularity.commitCrime(CrimeType.homicide, false);
    while (ns.getPlayer().numPeopleKilled < 45) {
        ns.print(`Killed ${ns.getPlayer().numPeopleKilled} people`);
        await ns.sleep(5000);
    }
    ns.singularity.stopAction();
}