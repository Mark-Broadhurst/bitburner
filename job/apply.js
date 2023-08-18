/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    for (const company of companies) {
      //let positions = ns.singularity.getCompanyPositions(company);
      //let job = positions[0];
      //let info = ns.singularity.getCompanyPositionInfo(company, job);

      ns.singularity.applyToCompany(company, "software");

      /*
      while (!info.nextPosition) {
        let rep = ns.singularity.getCompanyRep(company);
        if (rep > info.requiredReputation) {
          ns.singularity.applyToCompany(company, "software");
          info = ns.singularity.getCompanyPositionInfo(company, info.nextPosition);
          ns.print(`promoted to ${info.name} next ${info.nextPosition}`);
        } 
        else {
          await ns.sleep(1000);
        }
      }
      */
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