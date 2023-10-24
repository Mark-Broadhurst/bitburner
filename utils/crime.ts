import { NS, CrimeType, Person } from '@ns';

export function findBestCrime(ns: NS, person:Person): CrimeType {
    const crime = (Object.keys(ns.enums.CrimeType) as CrimeType[])
        .filter(crime => ns.formulas.work.crimeSuccessChance(person, crime) > 0.8);

    if (crime.length === 0) {
        return ns.enums.CrimeType.shoplift;
    }
    return crime.reduce((prev, curr) => {
        const aChance = ns.formulas.work.crimeSuccessChance(person, prev);
        const bChance = ns.formulas.work.crimeSuccessChance(person, curr);
        const aStats = ns.singularity.getCrimeStats(prev);
        const bStats = ns.singularity.getCrimeStats(curr);
        const a = (aStats.money / aStats.time) * aChance;
        const b = (bStats.money / bStats.time) * bChance;
        return a > b ? prev : curr;
    });
}


export function printCrimeStats(ns: NS, person:Person) {
    ns.print(`Crime\t\t\tChance\tTime\t\t\tMoney\t\tWeight`);
    (Object.keys(ns.enums.CrimeType) as CrimeType[]).forEach(crime => {

        const chance = ns.formulas.work.crimeSuccessChance(person, crime);
        const stats = ns.singularity.getCrimeStats(crime);
        const weight = stats.money / stats.time * chance;
        ns.print(`${crime.padEnd(16)}\t${ns.formatPercent(chance)}\t${ns.tFormat(stats.time).padEnd(20)}\t${ns.formatNumber(stats.money).padEnd(9)}\t${ns.formatNumber(weight, 4)}`);
    });
}