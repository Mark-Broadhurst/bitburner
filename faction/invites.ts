import { NS, MoneyRequirement, SkillRequirement, KarmaRequiremennt, PeopleKilledRequirement, FileRequirement, NumAugmentationsRequirement, EmployedByRequirement, CompanyReputationRequirement, JobTitleRequirement, CityRequirement, LocationRequirement, BackdoorRequirement, HacknetRAMRequirement, HacknetCoresRequirement, HacknetLevelsRequirement, BitNodeRequirement, SourceFileRequirement, BladeburnerRankRequirement, NumInfiltrationsRequirement, NotRequirement, SomeRequirement, EveryRequirement } from "@ns";
import { RegularFactions } from "utils/factions";

export async function main(ns: NS): Promise<void> {
  for (const faction of RegularFactions(ns)) {
    const requirements = ns.singularity.getFactionInviteRequirements(faction);
    for (const requirement of requirements) {
        /*
        switch (requirement.type) {
            case "money":
                MoneyRequirement(ns, requirement as MoneyRequirement);
                break;
            case "skills":
                SkillRequirement(ns, requirement as SkillRequirement);
                break;
            case "karma":
                KarmaRequirement(ns, requirement as KarmaRequiremennt);
                break;
            case "peopleKilled":
                PeopleKilledRequirement(ns, requirement as PeopleKilledRequirement);
                break;
            case "file":
                FileRequirement(ns, requirement as FileRequirement);
                break;
            case "numAugmentations":
                NumAugmentationsRequirement(ns, requirement as NumAugmentationsRequirement);
                break;
            case "employedBy":
                EmployedByRequirement(ns, requirement as EmployedByRequirement);
                break;
            case "companyReputation":
                CompanyReputationRequirement(ns, requirement as CompanyReputationRequirement);
                break;
            case "jobTitle":
                JobTitleRequirement(ns, requirement as JobTitleRequirement);
                break;
            case "city":
                CityRequirement(ns, requirement as CityRequirement);
                break;
            case "location":
                LocationRequirement(ns, requirement as LocationRequirement);
                break;
            case "backdoor":
                BackdoorRequirement(ns, requirement as BackdoorRequirement);
                break;
            case "hacknetRAM":
                HacknetRAMRequirement(ns, requirement as HacknetRAMRequirement);
                break;
            case "hacknetCores":
                HacknetCoresRequirement(ns, requirement as HacknetCoresRequirement);
                break;
            case "hacknetLevels":
                HacknetLevelsRequirement(ns, requirement as HacknetLevelsRequirement);
                break;
            case "bitNode":
                BitNodeRequirement(ns, requirement as BitNodeRequirement);
                break;
            case "sourceFile":
                SourceFileRequirement(ns, requirement as SourceFileRequirement);
                break;
            case "bladeburnerRank":
                BladeburnerRankRequirement(ns, requirement as BladeburnerRankRequirement);
                break;
            case "numInfiltrations":
                NumInfiltrationsRequirement(ns, requirement as NumInfiltrationsRequirement);
                break;
            case "not":
                NotRequirement(ns, requirement as NotRequirement);
                break;
            case "some":
                SomeRequirement(ns, requirement as SomeRequirement);
                break;
            case "every":
                EveryRequirement(ns, requirement as EveryRequirement);
                break;
            
        }
        */
    }
  }
}

function MoneyRequirement(ns: NS, req: MoneyRequirement): void {
    if (ns.getServerMoneyAvailable("home") < req.money) {
        
    }
}

function SkillRequirement(ns: NS, req: SkillRequirement): void {

}