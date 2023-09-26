import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();



    while (true) {

        const actions = [
            "Improve Studying",
            "Improve Gym Training",
            //"Generate Coding Contract",
        ];

        if (ns.getPlayer().factions.includes("Bladeburners")) {
            actions.push("Exchange for Bladeburner Rank");
            actions.push("Exchange for Bladeburner SP");
        }

        if (ns.corporation.hasCorporation()) {
            actions.push("Sell for Corporation Funds");
            actions.push("Exchange for Corporation Research");
        }
        if (ns.getPlayer().skills.hacking > 1500) {
            actions.push("Reduce Minimum Security");
            actions.push("Increase Maximum Money");
        }

        const action = actions
            .map(a => ({ name: a, cost: ns.hacknet.hashCost(a) }))
            .reduce((a, b) => a.cost <= b.cost ? a : b);

        while (action.cost > ns.hacknet.numHashes()) {
            await ns.sleep(1000);
        };
        ns.print(`${action.name} ${action.cost}`);

        switch (action.name) {
            case "Sell for Corporation Funds":
                ns.hacknet.spendHashes("Sell for Corporation Funds", "home", 1);
                break;
            case "Reduce Minimum Security":
                ns.hacknet.spendHashes("Reduce Minimum Security", "home", 1);
                break;
            case "Increase Maximum Money":
                ns.hacknet.spendHashes("Increase Maximum Money", "home", 1);
                break;
            case "Exchange for Corporation Research":
                ns.hacknet.spendHashes("Exchange for Corporation Research", "home", 1);
                break;
            case "Improve Studying":
                ns.hacknet.spendHashes("Improve Studying", "home", 1);
                break;
            case "Improve Gym Training":
                ns.hacknet.spendHashes("Improve Gym Training", "home", 1);
                break;
            case "Exchange for Bladeburner Rank":
                ns.hacknet.spendHashes("Exchange for Bladeburner Rank", "home", 1);
                break;
            case "Exchange for Bladeburner SP":
                ns.hacknet.spendHashes("Exchange for Bladeburner SP", "home", 1);
                break;
            case "Generate Coding Contract":
                ns.hacknet.spendHashes("Generate Coding Contract", "home", 1);
                break;
        }

        await ns.sleep(1000);
    }

}