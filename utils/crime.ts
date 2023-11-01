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


export function printCrimeStats(ns: NS, person:Person, selectedCrime: CrimeType | null = null) {
    ns.print(`🚨            🎲      ⌚                   💵       ⚖️`);
    ns.print(`-----------------------------------------------------------`);
    (Object.keys(ns.enums.CrimeType) as CrimeType[]).forEach(crime => {

        const chance = ns.formulas.work.crimeSuccessChance(person, crime);
        const stats = ns.singularity.getCrimeStats(crime);
        const weight = stats.money / stats.time * chance;
        let print = "";
        if(selectedCrime == crime) {
            print += "\u001b[31m"
        }
        print += crime.padEnd(15);
        print += ns.formatPercent(chance).padEnd(8);
        print += ns.tFormat(stats.time).padEnd(21);
        print += ns.formatNumber(stats.money).padEnd(9);
        print += ns.formatNumber(weight, 4);
        if(selectedCrime == crime) {
            print +="\u001b[0m"
        }
        ns.print(print);
    });
}
