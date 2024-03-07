import { NS } from "@ns";
import { PlayerRegularFactions, Factions } from "utils/factions";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const minFavour = 150;
    const factions = PlayerRegularFactions(ns)
        .filter((faction) => ns.singularity.getFactionFavor(faction) > minFavour);

    for (const faction of factions) {
        const maxRep = ns.singularity.getAugmentationsFromFaction(faction)
            .filter((aug) => aug != "NeuroFlux Governor")
            .map(aug => ns.singularity.getAugmentationRepReq(aug))
            .reduce((a, b) => {
                if (a > b) {
                    return a;
                }
                return b;
            });

        while (ns.singularity.getFactionRep(faction) < maxRep) {
            ns.clearLog();
            const donationAmount = getDonationAmount(ns, faction, maxRep);
            printFactionReps(ns, factions, faction);
            ns.print(`max rep for ${faction} is ${ns.formatNumber(maxRep)}`);
            ns.print(`donating ${ns.formatNumber(donationAmount)} to ${faction}`);
            ns.singularity.donateToFaction(faction, donationAmount);
            await ns.sleep(1000);
        }
    }

}

function getDonationAmount(ns: NS, faction: Factions, maxRep: number): number {
    const rep = ns.singularity.getFactionRep(faction);
    const repToMax = maxRep - rep;
    const player = ns.getPlayer();

    let moneyNeeded = 0
    for (let repFromDonation = 0; repFromDonation < repToMax; moneyNeeded = moneyNeeded + 1e6) {
        repFromDonation = ns.formulas.reputation.repFromDonation(moneyNeeded, player);
    }
    return Math.min(moneyNeeded, ns.getServerMoneyAvailable("home"));
}

function printFactionReps(ns: NS, factions: string[], currentFaction: string): void {
    ns.print("Faction\t\t\t\tRep");
    for (const faction of factions) {
        if (faction == currentFaction) {
            ns.print(`\u001b[31m${faction.padEnd(25)}\t${ns.formatNumber(ns.singularity.getFactionRep(faction))}\u001b[0m`);
        }
        else {
            ns.print(`${faction.padEnd(25)}\t${ns.formatNumber(ns.singularity.getFactionRep(faction))}`);

        }

    }
}