/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
  
    const typeOfWork = "security";
  
    for (const company of companies) {
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
          info = ns.singularity.getCompanyPositionInfo(company, info.nextPosition);
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
  }
  
  const companies = [
    "Storm Technologies",
    "DefComm",
    "Helios Labs",
    "VitaLife",
    "Icarus Microsystems",
    "Universal Energy",
    "Galactic Cybersystems",
    "AeroCorp",
    "Omnia Cybersystems",
    "Solaris Space Systems",
    "DeltaOne",
    "Global Pharmaceuticals",
    "Nova Medical",
    "Central Intelligence Agency",
    "National Security Agency",
    "Watchdog Security",
    "LexoCorp",
    "Rho Construction",
    "Alpha Enterprises",
    "Aevum Police Headquarters",
    "SysCore Securities",
    "CompuTek",
    "NetLink Technologies",
    "Carmichael Security",
    "FoodNStuff",
    "Joe's Guns",
    "Omega Software",
    "Noodle Bar",
  ];


