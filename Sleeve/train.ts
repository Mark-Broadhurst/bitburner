import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    let numSleeves = ns.sleeve.getNumSleeves();
    for (let i = 0; i < numSleeves; i++) {
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
                ns.sleeve.setToUniversityCourse(i, ns.enums.LocationName.VolhavenZBInstituteOfTechnology, ns.enums.UniversityClassType.algorithms);
                break;
            case 5:
                ns.sleeve.setToUniversityCourse(i, ns.enums.LocationName.VolhavenZBInstituteOfTechnology, ns.enums.UniversityClassType.leadership);
                break;
            default:
                ns.sleeve.setToIdle(i);
        }
    }
}
