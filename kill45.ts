import { NS } from "@ns";

export async function main(ns: NS) {
    const CrimeType = ns.enums.CrimeType;
    ns.singularity.commitCrime(CrimeType.homicide, false);
    while (ns.getPlayer().numPeopleKilled < 45) {
        await ns.sleep(5000);
    }
}