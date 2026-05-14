import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    let numSleeves: number;
    try { numSleeves = ns.sleeve.getNumSleeves(); }
    catch { return; }  // Sleeve API not available (SF10 not owned)
    if (numSleeves === 0) return;
    for (let i = 0; i < numSleeves; i++) {
        if (ns.sleeve.getSleeve(i).shock > 0) {
            ns.sleeve.setToShockRecovery(i);
            continue;
        }
        switch (i) {
            case 0:
                ns.sleeve.setToGymWorkout(i, ns.enums.LocationName.Sector12PowerhouseGym, ns.enums.GymType.strength);
                break;
            case 1:
                ns.sleeve.setToGymWorkout(i, ns.enums.LocationName.Sector12PowerhouseGym, ns.enums.GymType.defense);
                break;
            case 2:
                ns.sleeve.setToGymWorkout(i, ns.enums.LocationName.Sector12PowerhouseGym, ns.enums.GymType.dexterity);
                break;
            case 3:
                ns.sleeve.setToGymWorkout(i, ns.enums.LocationName.Sector12PowerhouseGym, ns.enums.GymType.agility);
                break;
            case 4:
                ns.sleeve.travel(i, ns.enums.CityName.Volhaven);
                ns.sleeve.setToUniversityCourse(i, ns.enums.LocationName.VolhavenZBInstituteOfTechnology, ns.enums.UniversityClassType.algorithms);
                break;
            case 5:
                ns.sleeve.travel(i, ns.enums.CityName.Volhaven);
                ns.sleeve.setToUniversityCourse(i, ns.enums.LocationName.VolhavenZBInstituteOfTechnology, ns.enums.UniversityClassType.leadership);
                break;
            default:
                ns.sleeve.setToIdle(i);
        }
    }
}
