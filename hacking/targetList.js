import ServerHackingDetail from '/hacking/ServerHackingDetail.js';

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();

    const servers = network(ns)
        .map(hostname => new ServerHackingDetail(ns, hostname))
        .filter(server => server.moneyMax != 0)
        .filter(server => server.requiredHackingSkill <= ns.getHackingLevel())
        .filter(server => server.hackAnalyzeChance >= 1);

    const titles = [
        "hostname",
        "maxRam",
        "$max",
        "reqHac",
        "minSec",
        "serGro",
        "hacCha%",
        "hacSec",
        "hacThr",
        "hacTime",
        "hacXp",
        "hackAm%",
        "groAna",
        "groSec",
        "groTim",
        "grow%",
        "groThr",
        "weakAna",
        "weakTim"
    ].join("\t");
    ns.print(titles);
    for (const server of servers) {
        ns.print(server.formatString());
    }
}


/** 
 * Deep scan network for hosts
 * @param {NS} ns
 * @returns {string[]} 
 */
function network(ns) {
    let hosts = ["home"];

    /** @param {string} item */
    function add(item) {
        if (!hosts.includes(item) && !item.startsWith("pserv-") && !item.startsWith("hacknet-server-")) {
            hosts.push(item);
        }
    }

    for (const host of hosts) {
        ns.scan(host).forEach(add);
    }
    return hosts.slice(1);
}