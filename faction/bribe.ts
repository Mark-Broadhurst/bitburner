import { NS } from "@ns";
import { Factions } from "/utils/factions";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const minFavour = 150;
    const maxRep = 5e6;

    const factions = ns.getPlayer().factions
        .filter((faction) => ns.singularity.getFactionFavor(faction) > minFavour &&
            faction != Factions.ShadowsOfAnarchy &&
            ns.singularity.getFactionRep(faction) < maxRep);

    for (const faction of factions) {
        while (ns.singularity.getFactionRep(faction) < maxRep) {
            const money = ns.getServerMoneyAvailable("home");
            let donationAmount = 0;
            if (money > 1e12) {
                donationAmount = 1e12;
            } else if (money > 1e11) {
                donationAmount = 1e11;
            } else if (money > 1e10) {
                donationAmount = 1e10;
            } else if (money > 1e9) {
                donationAmount = 1e9;
            } else if (money > 1e6) {
                donationAmount = 1e6;
            }

            ns.clearLog();
            printFactionReps(ns, factions);
            ns.print(`donating ${ns.formatNumber(donationAmount)} to ${faction}`);
            ns.singularity.donateToFaction(faction, donationAmount);
            await ns.sleep(100);
        }
    }

}

function printFactionReps(ns: NS, factions: string[]): void {
    ns.print("Faction\t\t\t\tRep");
    for (const faction of factions) {
        ns.print(`${faction.padEnd(25)}\t${ns.formatNumber(ns.singularity.getFactionRep(faction))}`);
    }
}