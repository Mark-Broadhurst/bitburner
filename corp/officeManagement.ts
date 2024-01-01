import { NS, CityName, CorpResearchName  } from "@ns";

export async function main(ns: NS): Promise<void> {
  const CityName = ns.enums.CityName;
  const corpInfo = ns.corporation.getCorporation();
  for (const divisionName of corpInfo.divisions) {
    const division = ns.corporation.getDivision(divisionName);
 
    manageResearch(ns, divisionName);

    for (const cityName of division.cities) {
      manageOffice(ns, divisionName, cityName);
    }
  }
}

function manageResearch(ns:NS, divisionName:string) {
  ns.corporation.research(divisionName, "drones");
}

function manageOffice(ns:NS, divisionName:string, cityName:CityName) {
  const office = ns.corporation.getOffice(divisionName, cityName);
  if(office.size < 30) {
    ns.corporation.upgradeOfficeSize(divisionName, cityName, office.size + 3);
  }
  if( office.numEmployees < office.size) {
    ns.corporation.hireEmployee(divisionName, cityName);
  }
}