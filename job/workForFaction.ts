import { NS } from "@ns";
import { CompaniesWithFactions } from "utils/companies";

export async function main(ns: NS): Promise<void> {
    const typeOfWork = "security";

    for (const company of CompaniesWithFactions(ns)) {
        ns.clearLog();
        let positions = ns.singularity.getCompanyPositions(company);
        let job = positions[0];
        let info = ns.singularity.getCompanyPositionInfo(company, job);

        ns.singularity.applyToCompany(company, typeOfWork);
        ns.singularity.workForCompany(company, false);

        ns.print(`working for ${company}`);

        while (!ns.getPlayer().factions.concat(ns.singularity.checkFactionInvitations()).map(x => x.replace("Secret ", "")).includes(company)) {
            let rep = ns.singularity.getCompanyRep(company);
            if (rep > info.requiredReputation) {
                ns.singularity.applyToCompany(company, typeOfWork);
                info = ns.singularity.getCompanyPositionInfo(company, info.nextPosition!);
                ns.print(`promoted to ${info.name} next ${info.nextPosition}`);
            }
            else {
                await ns.sleep(1000);
            }
        }
    }
}

