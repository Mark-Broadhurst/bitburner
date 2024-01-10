import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const LocationName = ns.enums.LocationName;
    const UniversityClassType = ns.enums.UniversityClassType;
    const GymType = ns.enums.GymType;
    const focus = true;

    ns.singularity.universityCourse(LocationName.Sector12RothmanUniversity, UniversityClassType.algorithms, focus);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.gymWorkout(LocationName.Sector12PowerhouseGym, GymType.strength, focus);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.gymWorkout(LocationName.Sector12PowerhouseGym, GymType.defense, focus);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.gymWorkout(LocationName.Sector12PowerhouseGym, GymType.dexterity, focus);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.gymWorkout(LocationName.Sector12PowerhouseGym, GymType.agility, focus);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.universityCourse(LocationName.Sector12RothmanUniversity, UniversityClassType.leadership, focus);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.stopAction();
}