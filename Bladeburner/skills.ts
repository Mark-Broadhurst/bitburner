import { NS } from "@ns";
import { skills } from "bladeburner/enums";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    while (ns.bladeburner.getSkillLevel("Overclock") < 90) {
        const skill = ["Overclock","Hyperdrive"]
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
            await ns.bladeburner.nextUpdate();
        }
        ns.bladeburner.upgradeSkill(skill);
        ns.print(`${skill} ${ns.bladeburner.getSkillLevel(skill)}`);

        await ns.bladeburner.nextUpdate();
    }

    while (true) {
        const skill = skills
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
            await ns.bladeburner.nextUpdate();
        }
        ns.bladeburner.upgradeSkill(skill);
        ns.print(skill + " " + ns.bladeburner.getSkillLevel(skill));
        //await ns.bladeburner.nextUpdate();
    }
}