import { NS } from "@ns";
import { getHashLimit } from "./hashLimit";
import { getTargetServers } from "utils/network";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    /*
    const servers = getTargetServers(ns)
        .filter(server => server.minDifficulty > 1)
        .sort((a, b) => {
            if (a.moneyMax > b.moneyMax) {
                return 1;
            }
            if (a.moneyMax < b.moneyMax) {
                return -1;
            }
            return 0;
        });
    */

    const servers = ["n00dles", "joesguns", "phantasy"].map(hostname => ns.getServer(hostname));

    for (let server of servers) {
        const hashLimit = getHashLimit(ns);
        const hashes = ns.hacknet.numHashes();
        ns.print(`Hashes: ${hashes} / ${hashLimit}`);

        ns.print(`Checking ${server.hostname} ${server.minDifficulty} ${server.moneyMax}`);
        while (server.minDifficulty != 1) {
            ns.clearLog();
            if (hashes >= (hashLimit - 40)) {
                ns.hacknet.spendHashes("Reduce Minimum Security", server.hostname, 1);
            }

            server = ns.getServer(server.hostname);
            ns.print(`Reducing minimum security on ${server.hostname} to ${server.minDifficulty}`)

            await ns.sleep(1000);
        }
        /*
        while (server.moneyMax <= 2e12) {
            ns.clearLog();
            if (hashes >= (hashLimit - 40)) {
                ns.hacknet.spendHashes("Increase Maximum Money", server.hostname, 1);
            }
            server = ns.getServer(server.hostname);
            ns.print(`Increasing maximum money on ${server.hostname} to ${server.moneyMax}`)
            await ns.sleep(1000);
        }
        */
    }
}