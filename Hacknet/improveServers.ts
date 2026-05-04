import { NS } from "@ns";
import { getServers } from "utils/network";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    let servers = getServers(ns);
    while (servers.length) {
        //ns.print(servers.map(s => `${s.hostname} ${ns.formatNumber(s.moneyMax!)}`).join("\n"));
        const action = [
            "Reduce Minimum Security",
            "Increase Maximum Money",
        ]
            .map(a => ({ name: a, cost: ns.hacknet.hashCost(a) }))
            .reduce((a, b) => a.cost <= b.cost ? a : b);

        while (action.cost > ns.hacknet.numHashes()) {
            await ns.sleep(1000);
        };
        switch (action.name) {
            case "Reduce Minimum Security":

                servers = getServers(ns)
                    .filter(s => s.moneyMax! <= 1e13)
                    .filter(s => s.minDifficulty! >= 1)
                    .sort((a, b) => a.minDifficulty! - b.minDifficulty!)
                    .reverse();

                ns.print(`Reducing security on ${servers[0].hostname} from ${servers[0].minDifficulty}`);
                ns.hacknet.spendHashes("Reduce Minimum Security", servers[0].hostname, 1);
                break;
            case "Increase Maximum Money":
                servers = getServers(ns)
                    .filter(s => s.moneyMax! <= 1e13)
                    .filter(s => s.minDifficulty! >= 1)
                    .sort((a, b) => a.moneyMax! - b.moneyMax!)
                    .reverse();


                ns.print(`Increasing money on ${servers[0].hostname} from ${ns.formatNumber(servers[0].moneyMax!)}`);
                ns.hacknet.spendHashes("Increase Maximum Money", servers[0].hostname, 1);
                break;
        }
        await ns.sleep(1000); 
    }
}