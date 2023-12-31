import { JobField, NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const CompanyName = ns.enums.CompanyName;
  const typeOfWork = JobField.security;

  for (const company of Object.values(CompanyName)) {
    ns.clearLog();
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
      else if (rep > 1e6) {
        break;
      }
      else {
        await ns.sleep(1000);
      }
    }
  }
  ns.singularity.stopAction();
}