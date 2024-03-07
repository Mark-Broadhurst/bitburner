import { NS } from "@ns";
import { PlayerRegularFactions, Factions } from "utils/factions";


export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const player = ns.getPlayer();
    const faction = PlayerRegularFactions(ns)
        .reduce((a, b) => {
            if (ns.singularity.getFactionFavor(b) > ns.singularity.getFactionFavor(a)) {
                return b;
            }
            return a;
        });

    while (true) {
        const reqRep = ns.singularity.getAugmentationRepReq("NeuroFlux Governor");

        const repGain = ns.formulas.reputation.repFromDonation(1e6, player);

        let requiredDonation = (reqRep / repGain) * 1e6;

        ns.print(`Donating ${ns.formatNumber(requiredDonation)} to ${faction}`);

        while (ns.singularity.getFactionRep(faction) < reqRep) {
            const donation = Math.min(requiredDonation, ns.getServerMoneyAvailable("home"));
            requiredDonation -= donation;
            ns.singularity.donateToFaction(faction, donation);
            await ns.sleep(100);
        }

        ns.run("neuroFlux-Governor.js");
        await ns.sleep(100);

        if(ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length >= 10) {
            ns.singularity.softReset("startup.js");
        }
    }
    //ns.singularity.softReset("startup.js");
}
