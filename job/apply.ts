import { NS } from "@ns";
import { CompaniesJobs } from "utils/companies";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    const player = ns.getPlayer();
    let applied  = 0;

    for (const { company, jobField } of CompaniesJobs(ns)) {
        if (player.jobs[company] !== undefined) {
            ns.print(`Already employed at ${company}`);
            continue;
        }
        // Try every field — each successful application upgrades the position
        for (const field of jobField) {
            if (ns.singularity.applyToCompany(company, field)) {
                ns.print(`✅ ${company} — ${field}`);
                applied++;
            }
        }
    }

    ns.tprint(`Got ${applied} position(s) across all companies.`);
}
