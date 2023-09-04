import ServerHackingDetail from '/hacking/ServerHackingDetail.js';

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    const player = ns.getPlayer();
    const home = ns.getServer("home");
    ns.clearPort(1);

    //while (true) {
        ns.clearLog();

        const servers = network(ns)
            .filter(hostname => ns.hackAnalyzeChance(hostname) >= 1)
            .map(hostname => new ns.getServer(hostname))
            .filter(server => server.moneyMax != 0)
            .filter(server => server.hasAdminRights)
            .filter(server => server.requiredHackingSkill <= ns.getHackingLevel());


        ns.print(`Servers: ${servers.length}`);
        for (const server of servers) {
            let totalTime = 0;

            let threads = Math.floor(ns.hackAnalyzeThreads(server.hostname, server.moneyAvailable * 0.4));
            ns.print(`Hacking ${server.hostname} ${threads} threads`);
            //ns.writePort(1, `hack,${server.hostname},1`);
            totalTime += ns.getHackTime(server.hostname); 

            if (server.moneyAvailable != server.moneyMax) {
                let growAmount = server.moneyMax / server.moneyAvailable;
                let times = Math.ceil(ns.growthAnalyze(server.hostname, growAmount));
                ns.growthAnalyzeSecurity(1, server.hostname);
                ns.print(`Growing ${server.hostname} ${growAmount} with ${times} ${ns.formatNumber(server.moneyAvailable, 2)}/${ns.formatNumber(server.moneyMax, 2)}`);
                for(let i = 1; i < times; i++)
                {
                    while(!ns.tryWritePort(1, `grow,${server.hostname},1`)){
                        await ns.sleep(100);
                    }
                }
                totalTime += ns.getGrowTime(server.hostname);
            }

            if (server.minDifficulty != server.hackDifficulty) {
                let diff = (server.hackDifficulty - server.minDifficulty)
                let weak = ns.weakenAnalyze(1);
                let times = Math.ceil(diff / weak);
                ns.print(`Weakening ${server.hostname} ${times} times ${Math.ceil(server.hackDifficulty)}/${server.minDifficulty} `);
                while(!ns.tryWritePort(1, `weaken,${server.hostname},${times}`)){
                    await ns.sleep(100);
                }
                totalTime += ns.getWeakenTime(server.hostname);
            }



        }
        //await ns.sleep(60 * 1000);
    //}
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
