import { NS, CityName, CorporationInfo, CorpIndustryName, CorpUnlockName, CorpUpgradeName, CorpResearchName, Division, Office } from "@ns";

const officeSize = 522;

const divisionPriorities: CorpIndustryName[] = [
  "Agriculture",
  "Spring Water",
  "Chemical",
  "Tobacco",
  "Restaurant",
  "Software",
  "Fishing",
  "Pharmaceutical",
  "Mining",
  "Refinery",
  "Water Utilities",
  "Computer Hardware",
  "Healthcare",
  "Robotics",
  "Real Estate",
];


export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  const CityName = ns.enums.CityName;
  while (true) {

    ns.clearLog();

    const corpInfo = ns.corporation.getCorporation();

    manageUnlocks(ns);

    expandIndustry(ns, corpInfo);

    //manageUpgrades(ns);
    manageShares(ns);
    //manageAdverts(ns);

    setupExports(ns);

    expandOfficeSize(ns);

    for (const divisionName of corpInfo.divisions) {
      const division = ns.corporation.getDivision(divisionName);

      manageOfficeExpansion(ns, division);

      manageResearch(ns, division);

      for (const cityName of division.cities) {
        await manageOffice(ns, corpInfo, divisionName, cityName);
      }
    }
    await ns.corporation.nextUpdate();

  }
}

function allIndustriesHaveAllOffices(ns: NS, corpInfo: CorporationInfo): boolean {
  const divisionCities = corpInfo.divisions
    .map(divisionName => ns.corporation.getDivision(divisionName))
    .flatMap(division => division.cities.map(cityName => [division.name, cityName] as [string, CityName]));

  for (const [divisionName, cityName] of divisionCities) {
    const div = ns.corporation.getDivision(divisionName);
    if (!div.cities.includes(cityName)) {
      return false;
    }
  }
  return true;
}

function expandIndustry(ns: NS, corpInfo: CorporationInfo) {
  const industries = divisionPriorities
    .filter(industry => !corpInfo.divisions
      .map(divisionName => ns.corporation.getDivision(divisionName).type)
      .includes(industry))
    .map(industry => {
      const data = ns.corporation.getIndustryData(industry);
      return { industry: industry, cost: data.startingCost, start: data.recommendStarting, prod: data.makesProducts };
    });

  if (industries.length === 0) {
    return;
  }
  const industry = industries
    .reduce((a, b) => {
      if (a.start && !b.start) {
        return a;
      }
      if (!a.start && b.start) {
        return b;
      }
      if (a.prod && !b.prod) {
        return b;
      }
      if (!a.prod && b.prod) {
        return a;
      }
      if (b.cost < a.cost) {
        return b;
      }
      return a;
    });
  ;

  if (industry === undefined) {
    return;
  }
  if (industry.cost <= corpInfo.funds) {
    ns.tprint(`Expanding ${industry.industry} for ${ns.formatNumber(industry.cost)}`);
    ns.print(`Expanding ${industry.industry} for ${ns.formatNumber(industry.cost)}`);
    const divisionName = industry.industry + "-Corp";
    ns.corporation.expandIndustry(industry.industry, divisionName);
    const division = ns.corporation.getDivision(divisionName);
    if (ns.corporation.hasUnlock("Smart Supply")) {
      ns.corporation.setSmartSupply(divisionName, "Sector-12", true);
    }

    const id = ns.corporation.getIndustryData(division.type);
    if (id.makesMaterials) {
      for (const material of id.producedMaterials!) {
        ns.print(`Selling ${material}`);
        ns.corporation.sellMaterial(division.name, "Sector-12", material, "MAX", "MP");
      }
    }
    if (id.makesProducts) {
      for (const product of division.products) {
        ns.corporation.sellProduct(division.name, "Sector-12", product, "MAX", "MP", true);
      }
    }
  }
}

function manageOfficeExpansion(ns: NS, division: Division) {
  const CityName = ns.enums.CityName;

  const funds = ns.corporation.getCorporation().funds;
  if (funds > 9e9) {
    const city = [
      CityName.Sector12,
      CityName.Aevum,
      CityName.Chongqing,
      CityName.NewTokyo,
      CityName.Ishima,
      CityName.Volhaven,
    ]
      .filter(city => !division.cities.includes(city))[0];

    if (city === undefined) {
      return;
    }

    ns.corporation.expandCity(division.name, city);
    if (ns.corporation.hasUnlock("Warehouse API")) {
      ns.corporation.purchaseWarehouse(division.name, city);
    }
    if (ns.corporation.hasUnlock("Smart Supply")) {
      ns.corporation.setSmartSupply(division.name, city, true);
    }


    const industry = ns.corporation.getIndustryData(division.type);
    if (industry.makesMaterials) {
      for (const material of industry.producedMaterials!) {
        ns.corporation.sellMaterial(division.name, city, material, "MAX", "MP");
      }
    }
    if (industry.makesProducts) {
      for (const product of division.products) {
        ns.corporation.sellProduct(division.name, city, product, "MAX", "MP", true);
      }
    }
  }
}

function manageShares(ns: NS) {
  const corpInfo = ns.corporation.getCorporation();


  if (!corpInfo.public) {
    return;
  }
  if (corpInfo.issueNewSharesCooldown === 0) {
    const shares = ns.corporation.issueNewShares();
    ns.print(`Issued ${ns.formatNumber(shares)} shares`);
    ns.tprint(`Issued ${ns.formatNumber(shares)} shares`);

  }
}

function manageUpgrades(ns: NS) {
  const funds = ns.corporation.getCorporation().funds;
  const upgrade = [
    "Smart Factories",
    "Smart Storage",
    "DreamSense",
    "Wilson Analytics",
    "Nuoptimal Nootropic Injector Implants",
    "Speech Processor Implants",
    "Neural Accelerators",
    "FocusWires",
    "ABC SalesBots",
    "Project Insight",
  ]
    .reduce((a, b) => {
      const costA = ns.corporation.getUpgradeLevelCost(a);
      const costB = ns.corporation.getUpgradeLevelCost(b);
      return costA <= costB ? a : b;
    });
  if (upgrade === undefined) {
    return;
  }
  const cost = ns.corporation.getUpgradeLevelCost(upgrade);
  if (cost > funds) {
    return;
  }
  ns.corporation.levelUpgrade(upgrade);
}

function manageUnlocks(ns: NS) {
  const corpInfo = ns.corporation.getCorporation();

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
  if (ns.corporation.getUnlockCost(unlock) > corpInfo.funds) {
    return;
  }

  ns.tprint(`Purchasing ${unlock}`);
  ns.print(`Purchasing ${unlock}`);
  ns.corporation.purchaseUnlock(unlock);

  if (unlock === "Smart Supply") {
    for (const divisionName of corpInfo.divisions) {
      const division = ns.corporation.getDivision(divisionName);
      for (const cityName of division.cities) {
        ns.corporation.setSmartSupply(divisionName, cityName, true);
      }
    }
  }
}

function manageResearch(ns: NS, division: Division) {
  let defaultResearch = [
    "Hi-Tech R&D Laboratory",
    "AutoBrew",
    "AutoPartyManager",
    "Automatic Drug Administration",
    "Drones",
    "Go-Juice",
    "CPH4 Injections",
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
  ns.print(`Researching ${research} for ${division.name} ${ns.formatNumber(cost)}`)
  if (division.researchPoints < cost) {
    return;
  }
  ns.tprint(`Researching ${research} for ${division.name}`);
  ns.print(`Researching ${research} for ${division.name}`);
  ns.corporation.research(division.name, research);

  if (research == "Market-TA.I") {
    if (ns.corporation.getIndustryData(division.type).producedMaterials != undefined) {
      ns.corporation.getIndustryData(division.type).producedMaterials!.forEach(material => {
        for (const cityName of division.cities) {
          ns.corporation.setMaterialMarketTA1(division.name, cityName, material, true);
        }
      });
    }
    division.products.forEach(product => {
      ns.corporation.setProductMarketTA1(division.name, product, true);
    });
  }
  if (research == "Market-TA.II") {
    if (ns.corporation.getIndustryData(division.type).producedMaterials != undefined) {
      ns.corporation.getIndustryData(division.type).producedMaterials!.forEach(material => {
        for (const cityName of division.cities) {
          ns.corporation.setMaterialMarketTA2(division.name, cityName, material, true);
        }
      });
    }
    division.products.forEach(product => {
      ns.corporation.setProductMarketTA2(division.name, product, true);
    });
  }
}

function manageAdverts(ns: NS) {
  const divisions = ns.corporation.getCorporation().divisions
    .map(divisionName => ns.corporation.getDivision(divisionName))
    .map(division => {
      ns.print(`${division.name} ${division.numAdVerts}`)
      return division;
    })

  if (divisions.length === 0) {
    return;
  }
  const division = divisions
    .reduce((a, b) => a.numAdVerts <= b.numAdVerts ? a : b);

  const funds = ns.corporation.getCorporation().funds;
  if (funds < ns.corporation.getHireAdVertCost(division.name)) {
    return;
  }
  ns.print(`Hiring advert for ${division.name}`);
  //ns.tprint(`Hiring advert for ${division.name}`);
  ns.corporation.hireAdVert(division.name);

}

function expandOfficeSize(ns: NS) {
  const {division, city, size, cost} = getSmallestOffice(ns);
  ns.print(`Upgrading ${division} office in ${city} to size ${size + 3} for ${ns.formatNumber(cost)}`);
  if (cost <= ns.corporation.getCorporation().funds) {
    ns.tprint(`Upgrading ${division} office in ${city} to size ${size + 3}`);
    ns.print(`Upgrading ${division} office in ${city} to size ${size + 3}`);
    ns.corporation.upgradeOfficeSize(division, city, size + 3);
  }
}

async function manageOffice(ns: NS, corp: CorporationInfo, divisionName: string, cityName: CityName) {
  while (ns.corporation.hireEmployee(divisionName, cityName)) {
    //ns.tprint(`Hiring employee for ${divisionName} office in ${cityName}`);
    //ns.print(`Hiring employee for ${divisionName} office in ${cityName}`);
  }

  jobAssignments(ns, divisionName, cityName);
}

function hasResearch(ns: NS, divisionName: string): boolean {
  const division = ns.corporation.getDivision(divisionName);
  let defaultResearch = [
    "Hi-Tech R&D Laboratory",
    "AutoBrew",
    "AutoPartyManager",
    "Automatic Drug Administration",
    "Drones",
    "Go-Juice",
    "CPH4 Injections",
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
  defaultResearch = defaultResearch.filter(research => !ns.corporation.hasResearched(divisionName, research));
  return defaultResearch.length > 0;
}

function jobAssignments(ns: NS, divisionName: string, cityName: CityName) {
  const office = ns.corporation.getOffice(divisionName, cityName);

  const doResearch = hasResearch(ns, divisionName);

  let employees = office.numEmployees;

  let operations = 0;
  let engineer = 0;
  let business = 0;
  let management = 0;
  let research = 0;
  let intern = 0;

  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Operations", operations);
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Engineer", engineer);
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Business", business);
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Management", management);
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Research & Development", research);
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Intern", intern);

  if (doResearch) {

    intern = Math.floor(employees / 6);
    employees -= intern;

    business = Math.floor(employees / 5);
    employees -= business;

    management = Math.floor(employees / 4);
    employees -= management;

    research = Math.floor(employees / 3);
    employees -= research;

    engineer = Math.floor(employees / 2);
    employees -= engineer;

    operations = Math.floor(employees);
    employees -= operations;

  }
  else {
    intern = Math.floor(employees / 5);
    employees -= intern;

    business = Math.floor(employees / 4);
    employees -= business;

    management = Math.floor(employees / 3);
    employees -= management;

    research = 0;
    employees -= research;

    engineer = Math.floor(employees / 2);
    employees -= engineer;

    operations = Math.floor(employees);
    employees -= operations;
  }

  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Operations", operations);
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Engineer", engineer);
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Business", business);
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Management", management);
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Research & Development", research);
  ns.corporation.setAutoJobAssignment(divisionName, cityName, "Intern", intern);
}

function setupExports(ns: NS) {
  const corpInfo = ns.corporation.getCorporation();

  const divisionCities = corpInfo.divisions
    .map(divisionName => ns.corporation.getDivision(divisionName))
    .flatMap(division => division.cities.map(cityName => [division.name, division.type, cityName] as [string, CorpIndustryName, CityName]))

  for (const [d1, t1, c1] of divisionCities) {
    for (const [d2, t2, c2] of divisionCities) {
      if (d1 === d2 || c1 !== c2) {
        continue;
      }
      const i1 = ns.corporation.getIndustryData(t1);
      const i2 = ns.corporation.getIndustryData(t2);

      if (i1.producedMaterials == undefined || i1.producedMaterials.length === 0) {
        continue;
      }

      for (const material of i1.producedMaterials) {
        if (i2.requiredMaterials[material]! > 0) {
          const requiredMaterials = i2.requiredMaterials[material]!;
          const multi = ns.corporation.getDivision(d2).productionMult * ns.corporation.getOffice(d2, c2).size;
          ns.corporation.cancelExportMaterial(d1, c1, d2, c2, material);
          ns.corporation.exportMaterial(d1, c1, d2, c2, material, requiredMaterials * multi);
        }
      }
    }
  }
}

function getSmallestOffice(ns: NS){
  const corpInfo = ns.corporation.getCorporation();

  const office = corpInfo.divisions.flatMap(divisionName => {
      const division = ns.corporation.getDivision(divisionName);
      return division.cities.map(cityName => {
          const office = ns.corporation.getOffice(divisionName, cityName);
          const cost = ns.corporation.getOfficeSizeUpgradeCost(divisionName, cityName, office.size + 3);
          return { division: divisionName, city: cityName, size: office.size, cost: cost};
      });
  })
  .reduce((a, b) => a.size <= b.size ? a : b);

  return office;
}