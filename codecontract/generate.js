/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ls("home","*.cct").forEach(file => {
        ns.rm(file);
    });

    ns.codingcontract.createDummyContract("Total Ways to Sum");

    /*
    ns.codingcontract.getContractTypes().forEach(type => {
        ns.codingcontract.createDummyContract(type);
    });
*/
}