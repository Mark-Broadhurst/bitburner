import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const LocationName = ns.enums.LocationName;
    const UniversityClassType = ns.enums.UniversityClassType;
    const GymType = ns.enums.GymType;
    ns.singularity.universityCourse(LocationName.Sector12RothmanUniversity, UniversityClassType.algorithms, false);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.gymWorkout(LocationName.Sector12PowerhouseGym, GymType.strength, false);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.gymWorkout(LocationName.Sector12PowerhouseGym, GymType.defense, false);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.gymWorkout(LocationName.Sector12PowerhouseGym, GymType.dexterity, false);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.gymWorkout(LocationName.Sector12PowerhouseGym, GymType.agility, false);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.universityCourse(LocationName.Sector12RothmanUniversity, UniversityClassType.leadership, false);
    await ns.sleep(2 * 60 * 1000);
}
