import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    let gang = ns.gang.getGangInformation();

    while (gang.territory < 1) {
        ns.clearLog();
        gang = ns.gang.getGangInformation();
        let otherGangs = ns.gang.getOtherGangInformation();

        const mostPowerfulGangs = [
            "Slum Snakes",
            "Tetrads",
            "The Syndicate",
            "The Dark Army",
            "Speakers for the Dead",
            "NiteSec",
            "The Black Hand"
          ]
            .filter(x => x != gang.faction)
            .filter(x => otherGangs[x].territory);

        if (!mostPowerfulGangs.length) {
            ns.print("No other gangs with territory");
            break;
        }
        const mostPowerfulGang = mostPowerfulGangs.reduce((a, b) => {
            if (otherGangs[a].power > otherGangs[b].power) {
                return a;
            }
            return b;
        });

        ns.print(`Most powerful gang: ${mostPowerfulGang}`);
        ns.print(`Most powerful gang power: ${otherGangs[mostPowerfulGang].power}`);
        const mostPowerful = otherGangs[mostPowerfulGang].power < gang.power
        if(!gang.territoryWarfareEngaged && mostPowerful)
        {
            ns.gang.setTerritoryWarfare(mostPowerful);
            ns.print("Territory Warfare started");
            ns.toast("Territory Warfare started");
        } else if (gang.territoryWarfareEngaged && !mostPowerful) {
            ns.gang.setTerritoryWarfare(mostPowerful);
            ns.print("Territory Warfare stopped");
            ns.toast("Territory Warfare stopped");
        }

        await ns.sleep(1000);
    }
}
