/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();

    while (true) {
        ns.clearLog();
        const servers = network(ns)
            .map(hostname => ns.getServer(hostname))
            .filter(server => server.moneyMax != 0)
            .filter(server => server.requiredHackingSkill <= ns.getHackingLevel())
            .filter(server => ns.getWeakenTime(server.hostname) < (8 * 60 * 1000))
            .sort((a, b) => a.moneyMax - b.moneyMax);


        ns.print("hostname\t\t\t$\t\t\tsec\t\thack\tgrow\tweak");
        for (const server of servers) {
            ns.print(`${server.hostname.padEnd(30)}\t` +
                `${ns.formatNumber(server.moneyAvailable).padEnd(8)} \\ ${ns.formatNumber(server.moneyMax).padEnd(8)}\t` +
                `${ns.formatNumber(server.hackDifficulty, 0).padEnd(3)} \\ ${ns.formatNumber(server.minDifficulty, 0).padEnd(3)}\t` +
                `${Math.round(ns.getHackTime(server.hostname) / 1000)}\t` +
                `${Math.round(ns.getGrowTime(server.hostname) / 1000)}\t` +
                `${Math.round(ns.getWeakenTime(server.hostname) / 1000)}`
            );
        }
        await ns.sleep(100);
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