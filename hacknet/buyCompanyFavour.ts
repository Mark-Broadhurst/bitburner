import { NS } from "@ns";
import { getHashLimit } from "hacknet/hashLimit";
import { CompaniesWithFactions } from "utils/companies";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    for (const company of CompaniesWithFactions(ns)) {
        while (ns.singularity.getCompanyFavor(company) < 150) {
            ns.clearLog();
            printCompanyFavour(ns);
            const hashLimit = getHashLimit(ns);
            const hashes = ns.hacknet.numHashes();
            ns.print(`Hashes: ${hashes} / ${hashLimit}`);

            ns.hacknet.spendHashes("Company Favor", company);
            ns.print(`Bought company favor for ${company}`);
            await ns.sleep(1000);
        }
    }
}

function printCompanyFavour(ns: NS) {
    for (const company of CompaniesWithFactions(ns)) {
        ns.print(`${company.padEnd(30)}\t${ns.singularity.getCompanyFavor(company)}`);
    }
}

