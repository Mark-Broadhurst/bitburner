/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  let numSleeves = ns.sleeve.getNumSleeves();
  while (true) {
    ns.clearLog();
    for (let i = 0; i < numSleeves; i++) {
      let current = ns.sleeve.getSleeve(i);
      if (current.sync < 100) {
        ns.print(`Synth ${i} set to Sync`);
        ns.sleeve.setToSynchronize(i);
      } else if (current.shock > 0) {
        ns.print(`Synth ${i} set to Recovery`);
        ns.sleeve.setToShockRecovery(i);
      } else if (current.exp.hacking < 10_000) {
        ns.print(`Synth ${i} set to Hacking`);
        ns.sleeve.setToUniversityCourse(i, getUniversity(current.city), ns.enums.UniversityClassType.algorithms);
      } else if (current.exp.charisma < 10_000) {
        ns.print(`Synth ${i} set to Charisma`);
        ns.sleeve.setToUniversityCourse(i, getUniversity(current.city), ns.enums.UniversityClassType.leadership);
      } else if (current.exp.strength < 30_000) {
        ns.print(`Synth ${i} set to Strength`);
        ns.sleeve.setToGymWorkout(i, getGym(current.city), ns.enums.GymType.strength);
      } else if (current.exp.defense < 30_000) {
        ns.print(`Synth ${i} set to Defense`);
        ns.sleeve.setToGymWorkout(i, getGym(current.city), ns.enums.GymType.defense);
      } else if (current.exp.dexterity < 30_000) {
        ns.print(`Synth ${i} set to Dexterity`);
        ns.sleeve.setToGymWorkout(i, getGym(current.city), ns.enums.GymType.dexterity);
      } else if (current.exp.agility < 30_000) {
        ns.print(`Synth ${i} set to Agility`);
        ns.sleeve.setToGymWorkout(i, getGym(current.city), ns.enums.GymType.agility);
      } else {
        ns.sleeve.setToCommitCrime(i,"Homicide");

        //const player = ns.getPlayer();
        //const invites = ns.singularity.checkFactionInvitations();

        //let company = companies
        //  .filter(x=> !player.factions.includes(x) && !invites.includes(x))
        //  .reduce((a, b) => {
        //  const aRep = ns.singularity.getCompanyRep(a);
        //  const bRep = ns.singularity.getCompanyRep(b);
        //  if (aRep > bRep) {
        //    return a;
        //  }
        //  return b;
        //});
   
        //ns.singularity.applyToCompany(company, "software");
        //ns.print(`Synth ${i} working for ${company}`);
        //ns.sleeve.setToCompanyWork(i, company);
        //ns.sleeve.setToFactionWork(i, , "hacking");
      }

    }
    await ns.sleep(1000);
  }
}

/** @param {string} city */
function getUniversity(city) {
  switch (city) {
    case "Sector-12":
      return "rothman university";
    case "Aevum":
      return "zb-institue";
  }
}

/** @param {string} city */
function getGym(city) {
  switch (city) {
    case "Sector-12":
      return "Powerhouse Gym";
    case "Aevum":
      return "Millenium Gym";
  }
}

const companies = [
  "Bachman & Associates",
  "ECorp",
  "MegaCorp",
  "KuaiGong International",
  "Four Sigma",
  "NWO",
  "Blade Industries",
  "OmniTek Incorporated",
  "Clarke Incorporated",
  "Fulcrum Technologies",
  "KuaiGong International"
];