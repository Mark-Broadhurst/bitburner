/** @param {NS} ns */
export async function main(ns) {
    ns.singularity.universityCourse("rothman university", ns.enums.UniversityClassType.algorithms, false);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.gymWorkout("Powerhouse Gym", ns.enums.GymType.strength, false);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.gymWorkout("Powerhouse Gym", ns.enums.GymType.defense, false);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.gymWorkout("Powerhouse Gym", ns.enums.GymType.dexterity, false);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.gymWorkout("Powerhouse Gym", ns.enums.GymType.agility, false);
    await ns.sleep(2 * 60 * 1000);
    ns.singularity.universityCourse("rothman university", ns.enums.UniversityClassType.leadership, false);
    await ns.sleep(2 * 60 * 1000);
}