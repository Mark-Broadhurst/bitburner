import { CompanyPositionInfo, NS, Player } from "@ns";
import { CompaniesJobs } from "utils/companies";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  const player = ns.getPlayer();
  
  for (const company of Object.values(ns.enums.CompanyName)) {
    if(player.jobs[company] !== undefined) continue;
    for (const job of ns.singularity.getCompanyPositions(company)) {
      const info = ns.singularity.getCompanyPositionInfo(company, job);
      if(info.requiredReputation == 0 && verifySkills(player, info)){
        const result = ns.singularity.applyToCompany(company, job);
        ns.print(`Applying to ${company} for ${job} ${result} ${info.requiredSkills.hacking} ${info.requiredSkills.strength} ${info.requiredSkills.defense} ${info.requiredSkills.dexterity} ${info.requiredSkills.agility} ${info.requiredSkills.charisma}`);
      }
    }
  }
}


function verifySkills(player:Player, info: CompanyPositionInfo):boolean {
  return player.skills.hacking >= info.requiredSkills.hacking
    && player.skills.strength >= info.requiredSkills.strength
    && player.skills.defense >= info.requiredSkills.defense
    && player.skills.dexterity >= info.requiredSkills.dexterity
    && player.skills.agility >= info.requiredSkills.agility
    && player.skills.charisma >= info.requiredSkills.charisma;
}