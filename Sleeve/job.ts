import { CompanyName, NS } from "@ns";
import { CompaniesWithFactions } from "Utils/companies";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");

    while (true) {
        ns.clearLog();

        // Companies the player is currently employed at
        const jobs = CompaniesWithFactions(ns).filter(company => {
            const title = ns.getPlayer().jobs[company];
            return title !== undefined && title.length > 0;
        });

        ns.print(`Active jobs: ${jobs.length}`);

        // Reset all sleeves to idle first
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            ns.sleeve.setToIdle(i);
        }

        // Assign sleeves to companies round-robin
        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            const company = jobs[i] as CompanyName | undefined;
            if (company !== undefined) {
                ns.print(`Sleeve ${i} → ${company}`);
                ns.sleeve.setToCompanyWork(i, company);
            } else {
                ns.print(`Sleeve ${i} → idle`);
            }
        }

        if (jobs.length === 0) {
            ns.print("No companies to work for.");
            break;
        }

        await ns.sleep(1000);
    }
}
