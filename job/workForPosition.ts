import { CompanyName, JobName, NS } from "@ns";
import { CompaniesWithFactions } from "utils/companies";

export async function main(ns: NS): Promise<void> {
    const typeOfWork = "security";

    const player = ns.getPlayer();

    for (const company of CompaniesWithFactions(ns)) {
      let positions = ns.singularity.getCompanyPositions(company);
      let job = positions[0];
      let info = ns.singularity.getCompanyPositionInfo(company, job);
  
      ns.singularity.applyToCompany(company, typeOfWork);
      ns.singularity.workForCompany(company, false);
  
      ns.print(`working for ${company}`);
  
      while (true) {
        let rep = ns.singularity.getCompanyRep(company);
        if (rep > info.requiredReputation) {
          ns.singularity.applyToCompany(company, typeOfWork);
          info = ns.singularity.getCompanyPositionInfo(company, info.nextPosition!);
          ns.print(`promoted to ${info.name} next ${info.nextPosition}`);
        }
        else if (!info.nextPosition) {
          break;
        }
        else {
          await ns.sleep(1000);
        }
      }
      ns.singularity.applyToCompany(company, ns.enums.JobName.business4);
    }
    ns.singularity.stopAction();


}
