import { CompanyName, NS } from "@ns";
import { CompaniesWithFactions, GetBestJobField } from "utils/companies";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    while (true) {
        ns.clearLog();
        var factions = CompaniesWithFactions(ns)
        for (let sleeveNumber = 0; sleeveNumber < ns.sleeve.getNumSleeves(); sleeveNumber++) {
            ns.sleeve.setToIdle(sleeveNumber);
        }
        for (let sleeveNumber = 0; sleeveNumber < ns.sleeve.getNumSleeves(); sleeveNumber++) {
            if (factions[sleeveNumber] != undefined) {
                const faction = factions[sleeveNumber];
                const work = GetBestJobField(ns, faction, ns.sleeve.getSleeve(sleeveNumber));
                ns.print(`sleeve ${sleeveNumber} to ${faction} ${work}`);
                ns.sleeve.setToCompanyWork(sleeveNumber, faction);
            }
            else {
                ns.print(`sleeve ${sleeveNumber} to idle`);
                ns.sleeve.setToIdle(sleeveNumber);
            }
        }
        if(factions.length == 0) {
            ns.print(`No factions to work for`);
            break;
        }
        await ns.sleep(1000);
    }
}

