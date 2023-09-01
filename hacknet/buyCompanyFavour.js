import { getHashLimit } from "/hacknet/hashLimit.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();

    for (const company of companies) {
        while (ns.singularity.getCompanyFavor(company) < 150) {
            ns.clearLog();
            const hashLimit = getHashLimit(ns);
            const hashes = ns.hacknet.numHashes();
            ns.print(`Hashes: ${hashes} / ${hashLimit}`);

            if (hashes >= (hashLimit - 40)) {
                ns.hacknet.spendHashes("Company Favor", company);
                ns.print(`Bought company favor for ${company}`);
            }
            await ns.sleep(1000);
        }
    }
}

const companies = [
    "Bachman & Associates",
    "ECorp",
    "MegaCorp",
    "KuaiGong International",
    "Four Sigma",
    "NWO",
    "Blade Industries",
    "OmniTek Incorporated",
    "Clarke Incorporated",
    "Fulcrum Technologies",
];