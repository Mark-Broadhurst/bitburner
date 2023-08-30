/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    let gang = ns.gang.getGangInformation();

    while (gang.territory < 100) {
        ns.clearLog();
        gang = ns.gang.getGangInformation();
        let otherGangs = ns.gang.getOtherGangInformation();

        const mostPowerfulGang = [
            "Slum Snakes", 
            "Tetrads", 
            "The Syndicate", 
            "The Dark Army", 
            "Speakers for the Dead", 
            "NiteSec", 
            "The Black Hand"
        ]
            .reduce((a, b) => {
                if (otherGangs[a].power > otherGangs[b].power) {
                    return a;
                }
                return b;
            });
        const mostPowerful = mostPowerfulGang == gang.faction
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