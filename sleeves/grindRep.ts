import { NS } from "@ns";
import { CompaniesWithFactions } from "utils/companies";

export async function main(ns: NS): Promise<void> {
    for(let sleeveNumber = 0; sleeveNumber > ns.sleeve.getNumSleeves(); sleeveNumber++)
    {
        
    }
    CompaniesWithFactions(ns)
        .forEach(company => {
        });
}
