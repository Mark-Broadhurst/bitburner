import { NS } from "@ns";
import { Factions } from "/utils/factions";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const minFavour = 150;
    const factions = ns.getPlayer().factions
        .filter((faction) => ns.singularity.getFactionFavor(faction) > minFavour)
        .filter((faction) => faction != Factions.ShadowsOfAnarchy)
        .filter((faction) => faction != Factions.Bladeburners)
        .filter((faction) => faction != ns.gang.getGangInformation().faction)
        /*
        .filter((faction) => {
            const factionAugs = ns.singularity.getAugmentationsFromFaction(faction);
            const ownedAugs = ns.singularity.getOwnedAugmentations(true);
            return factionAugs.some((aug) => !ownedAugs.includes(aug));
        });
*/
        for (const faction of factions) {
        const maxRep = ns.singularity.getAugmentationsFromFaction(faction)
            .filter((aug) => aug != "NeuroFlux Governor")
            //.filter((aug) => !ns.singularity.getOwnedAugmentations(true).includes(aug))
            .map(aug => ns.singularity.getAugmentationRepReq(aug))
            .reduce((a, b) => {
                if (a > b) {
                    return a;
                }
                return b;
            });

        while (ns.singularity.getFactionRep(faction) < maxRep) {
            ns.clearLog();
            const donationAmount = getDonationAmount(ns);
            printFactionReps(ns, factions);
            ns.print(`max rep for ${faction} is ${ns.formatNumber(maxRep)}`);
            ns.print(`donating ${ns.formatNumber(donationAmount)} to ${faction}`);
            ns.singularity.donateToFaction(faction, donationAmount);
            await ns.sleep(100);
        }
    }

}

function getDonationAmount(ns: NS): number {
    const money = ns.getServerMoneyAvailable("home");
    if (money > 1e12) {
        return 1e12;
    } else if (money > 1e11) {
        return 1e11;
    } else if (money > 1e10) {
        return 1e10;
    } else if (money > 1e9) {
        return 1e9;
    } else if (money > 1e8) {
        return 1e8;
    } else if (money > 1e7) {
        return 1e7;
    } else if (money > 1e6) {
        return 1e6;
    }

    return 0;
}

function printFactionReps(ns: NS, factions: string[]): void {
    ns.print("Faction\t\t\t\tRep");
    for (const faction of factions) {
        ns.print(`${faction.padEnd(25)}\t${ns.formatNumber(ns.singularity.getFactionRep(faction))}`);
    }
}