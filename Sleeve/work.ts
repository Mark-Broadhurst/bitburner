import { NS, CityName, LocationName } from "@ns";

export async function main(ns: NS): Promise<void> {
    const UniversityClassType = ns.enums.UniversityClassType;
    const GymType = ns.enums.GymType;
    const CityName = ns.enums.CityName;
    const numSleeves = ns.sleeve.getNumSleeves();
    while (true) {
        ns.clearLog();
        const player = ns.getPlayer();
        // @ts-ignore
        let karma = eval("ns.heart.break()");
        for (let i = 0; i < numSleeves; i++) {
            let current = ns.sleeve.getSleeve(i);
            if (current.sync < 100) {
                ns.print(`Synth ${i} set to Sync`);
                ns.sleeve.setToSynchronize(i);
            } else if (current.shock > 0) {
                ns.print(`Synth ${i} set to Recovery`);
                ns.sleeve.setToShockRecovery(i);
            } else if (current.skills.hacking < 100 || current.exp.hacking < 10_000) {
                if (current.city != CityName.Sector12) {
                    ns.sleeve.travel(i, CityName.Sector12);
                }
                ns.print(`Synth ${i} set to Hacking`);
                ns.sleeve.setToUniversityCourse(i, getUniversity(ns, current.city)!, UniversityClassType.algorithms);
            } else if (current.skills.charisma < 100 || current.exp.charisma < 10_000) {
                if (current.city != CityName.Sector12) {
                    ns.sleeve.travel(i, CityName.Sector12);
                }
                ns.print(`Synth ${i} set to Charisma`);
                ns.sleeve.setToUniversityCourse(i, getUniversity(ns, current.city)!, UniversityClassType.leadership);
            } else if (current.skills.strength < 120 || current.exp.strength < 30_000) {
                if (current.city != CityName.Sector12) {
                    ns.sleeve.travel(i, CityName.Sector12);
                }
                ns.print(`Synth ${i} set to Strength`);
                ns.sleeve.setToGymWorkout(i, getGym(ns, current.city)!, GymType.strength);
            } else if (current.skills.defense < 100 || current.exp.defense < 30_000) {
                if (current.city != CityName.Sector12) {
                    ns.sleeve.travel(i, CityName.Sector12);
                }
                ns.print(`Synth ${i} set to Defense`);
                ns.sleeve.setToGymWorkout(i, getGym(ns, current.city)!, GymType.defense);
            } else if (current.skills.dexterity < 100 || current.exp.dexterity < 30_000) {
                if (current.city != CityName.Sector12) {
                    ns.sleeve.travel(i, CityName.Sector12);
                }
                ns.print(`Synth ${i} set to Dexterity`);
                ns.sleeve.setToGymWorkout(i, getGym(ns, current.city)!, GymType.dexterity);
            } else if (current.skills.agility < 100 || current.exp.agility < 30_000) {
                if (current.city != CityName.Sector12) {
                    ns.sleeve.travel(i, CityName.Sector12);
                }
                ns.print(`Synth ${i} set to Agility`);
                ns.sleeve.setToGymWorkout(i, getGym(ns, current.city)!, GymType.agility);
            } else if (player.numPeopleKilled < 45 && karma > -54_000 && !ns.gang.inGang()) {
                ns.print(`Synth ${i} set to Homicide`);
                ns.sleeve.setToCommitCrime(i, "Homicide");
                await ns.sleep(10 * 1000);
            } else {
                ns.print(`Synth ${i} set to Idle`);
                ns.sleeve.setToIdle(i);
            }

            /*
            const invites = ns.singularity.checkFactionInvitations();

            let company = CompaniesWithFactions
              .filter(x=> !player.factions.includes(x) && !invites.includes(x))
              .reduce((a, b) => {
              const aRep = ns.singularity.getCompanyRep(a);
              const bRep = ns.singularity.getCompanyRep(b);
              if (aRep > bRep) {
                return a;
              }
              return b;
            });

            ns.singularity.applyToCompany(company, "software");
            ns.print(`Synth ${i} working for ${company}`);
            ns.sleeve.setToCompanyWork(i, company);
            ns.sleeve.setToFactionWork(i, , "hacking");
            */
        }
        await ns.sleep(100);
    }
}

function getUniversity(ns: NS, city: CityName): LocationName | null {
    const CityName = ns.enums.CityName;
    const LocationName = ns.enums.LocationName;

    switch (city) {
        case CityName.Sector12:
            return LocationName.Sector12RothmanUniversity;
        case CityName.Aevum:
            return LocationName.AevumSummitUniversity;
        case CityName.Volhaven:
            return LocationName.VolhavenZBInstituteOfTechnology;
        default:
            return null;
    }
}

function getGym(ns: NS, city: CityName): LocationName | null {
    const CityName = ns.enums.CityName;
    const LocationName = ns.enums.LocationName;
    switch (city) {
        case CityName.Sector12:
            return LocationName.Sector12PowerhouseGym;
        case CityName.Aevum:
            return LocationName.AevumCrushFitnessGym;
        case CityName.Volhaven:
            return LocationName.VolhavenMilleniumFitnessGym;
        default:
            return null;
    }
}

