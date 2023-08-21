/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();

  const typeOfWork = "security";

  for (const company of companies) {
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
        info = ns.singularity.getCompanyPositionInfo(company, info.nextPosition);
        ns.print(`promoted to ${info.name} next ${info.nextPosition}`);
      } 
      else if (!info.nextPosition) {
        break;
      }
      else {
        await ns.sleep(1000);
      }
    }
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
];