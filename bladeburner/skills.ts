import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    while (ns.bladeburner.getSkillLevel("Overclock") < 90) {

        while (ns.bladeburner.getSkillUpgradeCost("Overclock") > ns.bladeburner.getSkillPoints()) {
            await ns.sleep(1000);
        }
        ns.print("Overclock " + ns.bladeburner.getSkillLevel("Overclock"));
        ns.bladeburner.upgradeSkill("Overclock");
        await ns.bladeburner.nextUpdate();
    }

    while (true) {
        const skill = ns.bladeburner.getSkillNames()
            .filter(skill => !(skill === "Overclock" && ns.bladeburner.getSkillLevel("Overclock") === 90))
            .reduce((a, b) => {
                const aLevel = ns.bladeburner.getSkillLevel(a);
                const bLevel = ns.bladeburner.getSkillLevel(b);
                if (aLevel < bLevel) {
                    return a;
                }
                return b;
            });
        while (ns.bladeburner.getSkillUpgradeCost(skill) > ns.bladeburner.getSkillPoints()) {
            await ns.sleep(1000);
        }
        ns.print(skill);
        ns.bladeburner.upgradeSkill(skill);
        await ns.bladeburner.nextUpdate();
    }
}
