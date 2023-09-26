import { CrimeType, NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    while (true) {
        ns.clearLog();
        let numSleeves = ns.sleeve.getNumSleeves();
        for (let i = 0; i < numSleeves; i++) {
            printStats(ns, i);
            const crime = findBestCrime(ns, i);
            ns.sleeve.setToCommitCrime(i, crime);
        }
        await ns.sleep(4000);
    }
}

function findBestCrime(ns: NS, i: number): CrimeType {
    const sleeve = ns.sleeve.getSleeve(i);
    const crime = (Object.keys(ns.enums.CrimeType) as CrimeType[])
        .reduce((prev, curr) => {
            const aChance = ns.formulas.work.crimeSuccessChance(sleeve, prev);
            const bChance = ns.formulas.work.crimeSuccessChance(sleeve, curr);
            const aStats = ns.singularity.getCrimeStats(prev);
            const bStats = ns.singularity.getCrimeStats(curr);
            const a = (aStats.money / aStats.time) * aChance;
            const b = (bStats.money / bStats.time) * bChance;
            return a > b ? prev : curr;
        });
    return crime;
}

function printStats(ns: NS, i: number) {
    const sleeve = ns.sleeve.getSleeve(i);
    ns.print(`Sleeve ${i}`);
    ns.print(`Crime\t\t\tChance\tTime\t\t\tMoney\t\tWeight`);
    (Object.keys(ns.enums.CrimeType) as CrimeType[]).forEach(crime => {
        const chance = ns.formulas.work.crimeSuccessChance(sleeve, crime);
        const stats = ns.singularity.getCrimeStats(crime);
        const weight = (stats.money / stats.time) * chance;
        ns.print(`${crime.padEnd(16)}\t${ns.formatPercent(chance)}\t${ns.tFormat(stats.time).padEnd(20)}\t${ns.formatNumber(stats.money).padEnd(9)}\t${weight}`);
    });
}