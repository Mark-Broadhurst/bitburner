import { CrimeType, NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    while (true) {
        ns.clearLog();
        printStats(ns);
        const crime = findBestCrime(ns);
        const stats = ns.singularity.getCrimeStats(crime);
        ns.singularity.commitCrime(crime, false);
        await ns.sleep(stats.time);
    }
}

function findBestCrime(ns: NS): CrimeType {
    const player = ns.getPlayer();
    const crime = (Object.keys(ns.enums.CrimeType) as CrimeType[])
        .filter(crime => ns.formulas.work.crimeSuccessChance(player, crime) > 0.2)
        .reduce((prev, curr) => {
            const aChance = ns.formulas.work.crimeSuccessChance(player, prev);
            const bChance = ns.formulas.work.crimeSuccessChance(player, curr);
            const aStats = ns.singularity.getCrimeStats(prev);
            const bStats = ns.singularity.getCrimeStats(curr);
            const a = (aStats.money / aStats.time) * aChance;
            const b = (bStats.money / bStats.time) * bChance;
            return a > b ? prev : curr;
        });
    return crime;
}

function printStats(ns: NS) {
    const player = ns.getPlayer();
    ns.print(`Crime\t\t\tChance\tTime\t\t\tMoney\t\tWeight`);
    (Object.keys(ns.enums.CrimeType) as CrimeType[]).forEach(crime => {

        const chance = ns.formulas.work.crimeSuccessChance(player, crime);
        const stats = ns.singularity.getCrimeStats(crime);
        const weight = stats.money / stats.time * chance;
        ns.print(`${crime.padEnd(16)}\t${ns.formatPercent(chance)}\t${ns.tFormat(stats.time).padEnd(20)}\t${ns.formatNumber(stats.money).padEnd(9)}\t${ns.formatNumber(weight, 4)}`);
    });
}