import { NS, CityName, CorporationInfo, CorpUnlockName, CorpResearchName, Division } from "@ns";

const officeSize = 90;

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  const CityName = ns.enums.CityName;
  while (true) {

    ns.clearLog();

    const corpInfo = ns.corporation.getCorporation();

    manageUnlocks(ns, corpInfo);

    for (const divisionName of corpInfo.divisions) {
      const division = ns.corporation.getDivision(divisionName);

      manageResearch(ns, division);

      for (const cityName of division.cities) {
        manageOffice(ns, corpInfo, divisionName, cityName);
      }
    }
    await ns.corporation.nextUpdate();

  }
}

function manageUnlocks(ns: NS, corpInfo: CorporationInfo) {
  const unlock = [
    "Warehouse API",
    "Smart Supply",
    "Market Research - Demand",
    "Market Data - Competition",
    "VeChain",
    "Export",
    "Shady Accounting",
    "Government Partnership",
  ]
    .filter(unlock => !ns.corporation.hasUnlock(unlock))[0];

  if (unlock === undefined) {
    return;
  }
  if (ns.corporation.getUnlockCost(unlock) <= corpInfo.funds) {
    ns.tprint(`Purchasing ${unlock}`);
    ns.print(`Purchasing ${unlock}`);
    ns.corporation.purchaseUnlock(unlock);
  }
}

function manageResearch(ns: NS, division: Division) {
  let defaultResearch = [
    "Hi-Tech R&D Laboratory",
    "AutoBrew",
    "AutoPartyManager",
    "Automatic Drug Administration",
    "CPH4 Injections",
    "Drones",
    "Drones - Assembly",
    "Drones - Transport",
    "Go-Juice",
    "HRBuddy-Recruitment",
    "HRBuddy-Training",
    "Market-TA.I",
    "Market-TA.II",
    "Overclock",
    "Self-Correcting Assemblers",
    "Sti.mu",
  ];
  if (division.makesProducts) {
    defaultResearch = defaultResearch.concat([
      "uPgrade: Fulcrum",
      "uPgrade: Capacity.I",
      "uPgrade: Capacity.II",
      "uPgrade: Dashboard",
    ]);
  }

  const research = defaultResearch
    .filter(research => !ns.corporation.hasResearched(division.name, research))[0];

  if (research === undefined) {
    return;
  }
  const cost = ns.corporation.getResearchCost(division.name, research);

  if (division.researchPoints >= cost) {
    ns.tprint(`Researching ${research} for ${division.name}`);
    ns.print(`Researching ${research} for ${division.name}`);
    ns.corporation.research(division.name, research);
  }
}

function manageOffice(ns: NS, corp: CorporationInfo, divisionName: string, cityName: CityName) {
  const office = ns.corporation.getOffice(divisionName, cityName);
  if (office.size < officeSize && ns.corporation.getOfficeSizeUpgradeCost(divisionName, cityName, office.size + 3) <= corp.funds) {
    ns.tprint(`Upgrading ${divisionName} office in ${cityName} to size ${office.size + 3}`);
    ns.print(`Upgrading ${divisionName} office in ${cityName} to size ${office.size + 3}`);
    ns.corporation.upgradeOfficeSize(divisionName, cityName, office.size + 3);
  }
  if (office.numEmployees < office.size) {
    ns.tprint(`Hiring employee for ${divisionName} office in ${cityName}`);
    ns.print(`Hiring employee for ${divisionName} office in ${cityName}`);
    ns.corporation.hireEmployee(divisionName, cityName);
  }

  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Operations", Math.floor(office.numEmployees * 0.25));
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Engineer", Math.round(office.numEmployees * 0.20));
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Business", Math.floor(office.numEmployees * 0.1));
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Management", Math.floor(office.numEmployees * 0.1));
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Research & Development", Math.floor(office.numEmployees * 0.05));
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Intern", Math.floor(office.numEmployees * 0.05));

}