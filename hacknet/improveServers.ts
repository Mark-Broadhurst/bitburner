import { NS } from "@ns";
import { getServers } from "utils/network";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    let servers = getServers(ns);
    while (servers.length) {
        servers = getServers(ns)
            .filter(s => s.moneyMax! <= 1e13)
            .filter(s => s.minDifficulty! >= 1)
            .sort((a, b) => a.moneyMax! - b.moneyMax!)
            .reverse();
        const server = servers[0];
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
                ns.print(`Reducing security on ${server.hostname} from ${server.minDifficulty}`);
                ns.hacknet.spendHashes("Reduce Minimum Security", server.hostname, 1);
                break;
            case "Increase Maximum Money":
                ns.print(`Increasing money on ${server.hostname} from ${ns.formatNumber(server.moneyMax!)}`);
                ns.hacknet.spendHashes("Increase Maximum Money", server.hostname, 1);
                break;
        }
        await ns.sleep(1000);
    }
}