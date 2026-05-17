import { NS, CityName, CorporationInfo, CorpIndustryName, CorpMaterialName, CorpUnlockName, CorpUpgradeName, CorpResearchName, Division, Product } from "@ns";

const divisionPriorities: CorpIndustryName[] = [
  "Agriculture",
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
  ns.disableLog("ALL");
  ns.clearLog();

  while (true) {
    ns.clearLog();
    const corp = ns.corporation.getCorporation();

    manageUnlocks(ns, corp);
    expandIndustry(ns, corp);
    manageShares(ns, corp);
    manageUpgrades(ns, corp);
    setupExports(ns);
    expandOfficeSize(ns, corp);
    manageWarehouses(ns, corp);
    manageMaterials(ns, corp);

    for (const divisionName of corp.divisions) {
      const division = ns.corporation.getDivision(divisionName);
      manageOfficeExpansion(ns, division);
      manageResearch(ns, division);
      manageProducts(ns, division);
      manageAdverts(ns, division);

      for (const cityName of division.cities) {
        manageOffice(ns, divisionName, cityName);
      }
    }

    await ns.corporation.nextUpdate();
  }
}

function manageUnlocks(ns: NS, corp: CorporationInfo) {
  const unlock = ([
    "Warehouse API",
    "Office API",
    "Smart Supply",
    "Export",
    "Market Research - Demand",
    "Market Data - Competition",
    "Shady Accounting",
    "Government Partnership",
  ] as CorpUnlockName[]).find(u => !ns.corporation.hasUnlock(u));

  if (unlock === undefined) return;
  if (ns.corporation.getUnlockCost(unlock) > corp.funds) return;

  ns.tprint(`Purchasing ${unlock}`);
  ns.print(`Purchasing ${unlock}`);
  ns.corporation.purchaseUnlock(unlock);

  if (unlock === "Smart Supply") {
    for (const divisionName of corp.divisions) {
      for (const cityName of ns.corporation.getDivision(divisionName).cities) {
        ns.corporation.setSmartSupply(divisionName, cityName, true);
      }
    }
  }
}

function expandIndustry(ns: NS, corp: CorporationInfo) {
  const existing = corp.divisions.map(d => ns.corporation.getDivision(d).industry);
  const next = divisionPriorities
    .filter(industry => !existing.includes(industry))
    .map(industry => ({ industry, cost: ns.corporation.getIndustryData(industry).startingCost }))[0];

  if (next === undefined || next.cost > corp.funds) return;

  const divisionName = next.industry + "-Corp";
  ns.tprint(`Expanding ${next.industry} for ${ns.format.number(next.cost)}`);
  ns.print(`Expanding ${next.industry} for ${ns.format.number(next.cost)}`);
  ns.corporation.expandIndustry(next.industry, divisionName);

  if (ns.corporation.hasUnlock("Smart Supply" as CorpUnlockName)) {
    ns.corporation.setSmartSupply(divisionName, "Sector-12", true);
  }

  const id = ns.corporation.getIndustryData(next.industry);
  if (id.makesMaterials && id.producedMaterials) {
    for (const material of id.producedMaterials) {
      ns.corporation.sellMaterial(divisionName, "Sector-12", material, "MAX", "MP");
    }
  }
}

function manageShares(ns: NS, corp: CorporationInfo) {
  if (!corp.public) return;
  if (corp.issueNewSharesCooldown === 0) {
    const shares = ns.corporation.issueNewShares();
    ns.print(`Issued ${ns.format.number(shares)} shares`);
    ns.tprint(`Issued ${ns.format.number(shares)} shares`);
  }
}

function manageUpgrades(ns: NS, corp: CorporationInfo) {
  const upgrades = ([
    "Smart Factories",
    "Smart Storage",
    "Wilson Analytics",
    "Nuoptimal Nootropic Injector Implants",
    "Speech Processor Implants",
    "Neural Accelerators",
    "FocusWires",
    "ABC SalesBots",
    "Project Insight",
  ] as CorpUpgradeName[]);

  const upgrade = upgrades.reduce((a, b) =>
    ns.corporation.getUpgradeLevelCost(a) <= ns.corporation.getUpgradeLevelCost(b) ? a : b);

  const cost = ns.corporation.getUpgradeLevelCost(upgrade);
  if (cost > corp.funds / 10) return;
  ns.corporation.levelUpgrade(upgrade);
}

function setupExports(ns: NS) {
  if (!ns.corporation.hasUnlock("Export" as CorpUnlockName)) return;
  const corp = ns.corporation.getCorporation();

  const divisionCities = corp.divisions
    .map(d => ns.corporation.getDivision(d))
    .flatMap(division => division.cities.map(city => [division.name, division.industry, city] as [string, CorpIndustryName, CityName]));

  for (const [d1, t1, c1] of divisionCities) {
    for (const [d2, t2, c2] of divisionCities) {
      if (d1 === d2 || c1 !== c2) continue;
      const i1 = ns.corporation.getIndustryData(t1);
      const i2 = ns.corporation.getIndustryData(t2);

      if (!i1.producedMaterials?.length) continue;

      for (const material of i1.producedMaterials) {
        if ((i2.requiredMaterials[material] ?? 0) > 0) {
          const reqMat = i2.requiredMaterials[material]!;
          const multi = ns.corporation.getDivision(d2).productionMult * ns.corporation.getOffice(d2, c2).size;
          ns.corporation.cancelExportMaterial(d1, c1, d2, c2, material);
          ns.corporation.exportMaterial(d1, c1, d2, c2, material, reqMat * multi);
        }
      }
    }
  }
}

function expandOfficeSize(ns: NS, corp: CorporationInfo) {
  const office = corp.divisions
    .flatMap(divisionName => {
      const division = ns.corporation.getDivision(divisionName);
      return division.cities.map(cityName => {
        const office = ns.corporation.getOffice(divisionName, cityName);
        const cost = ns.corporation.getOfficeSizeUpgradeCost(divisionName, cityName, 3);
        return { division: divisionName, city: cityName, size: office.size, cost };
      });
    })
    .reduce((a, b) => a.size <= b.size ? a : b);

  ns.print(`Upgrading ${office.division} office in ${office.city} to size ${office.size + 3} for ${ns.format.number(office.cost)}`);
  if (office.cost <= corp.funds) {
    ns.tprint(`Upgrading ${office.division} office in ${office.city} to size ${office.size + 3}`);
    ns.corporation.upgradeOfficeSize(office.division, office.city, 3);
  }
}

function manageWarehouses(ns: NS, corp: CorporationInfo) {
  while (true) {
    const funds = ns.corporation.getCorporation().funds;
    const smallest = corp.divisions
      .flatMap(d => {
        const division = ns.corporation.getDivision(d);
        return division.cities.map(city => {
          if (!ns.corporation.hasWarehouse(d, city)) {
            return { division: d, city, size: 0, cost: 4e9 };
          }
          const wh = ns.corporation.getWarehouse(d, city);
          return { division: d, city, size: wh.size, cost: ns.corporation.getUpgradeWarehouseCost(d, city) };
        });
      })
      .reduce((a, b) => b.size < a.size ? b : a);

    if (smallest.cost > funds) break;
    ns.print(`Upgrading warehouse ${smallest.division}:${smallest.city}`);
    if (smallest.size === 0) {
      ns.corporation.purchaseWarehouse(smallest.division, smallest.city);
    } else {
      ns.corporation.upgradeWarehouse(smallest.division, smallest.city);
    }
  }
}

type Factor = { material: CorpMaterialName; size: number; factor: number; };

function getBestFactor(ns: NS, division: Division): Factor | undefined {
  const id = ns.corporation.getIndustryData(division.industry);
  const candidates: Factor[] = [];

  if (division.industry !== "Real Estate" && id.realEstateFactor)
    candidates.push({ material: "Real Estate" as CorpMaterialName, size: 0.005, factor: id.realEstateFactor });
  if (division.industry !== "Software" && id.aiCoreFactor)
    candidates.push({ material: "AI Cores" as CorpMaterialName, size: 0.1, factor: id.aiCoreFactor });
  if (division.industry !== "Computer Hardware" && id.hardwareFactor)
    candidates.push({ material: "Hardware" as CorpMaterialName, size: 0.06, factor: id.hardwareFactor });
  if (division.industry !== "Robotics" && id.robotFactor)
    candidates.push({ material: "Robots" as CorpMaterialName, size: 0.5, factor: id.robotFactor });

  if (candidates.length === 0) return undefined;
  return candidates.reduce((a, b) => b.factor > a.factor ? b : a);
}

function manageMaterials(ns: NS, corp: CorporationInfo) {
  for (const divisionName of corp.divisions) {
    const division = ns.corporation.getDivision(divisionName);
    const bestFactor = getBestFactor(ns, division);
    if (bestFactor === undefined) continue;
    const matData = ns.corporation.getMaterialData(bestFactor.material);

    ns.print(`bestFactor: ${bestFactor.material} ${bestFactor.size}`);

    for (const cityName of division.cities) {
      if (!ns.corporation.hasWarehouse(divisionName, cityName)) continue;
      const warehouse = ns.corporation.getWarehouse(divisionName, cityName);
      const spaceToUse = Math.floor(warehouse.size * 0.4 - warehouse.sizeUsed);
      if (spaceToUse <= 0) continue;

      const amountToBuy = Math.floor(spaceToUse / bestFactor.size);
      const corpFunds = ns.corporation.getCorporation().funds;
      const amountAffordable = Math.floor(corpFunds / (matData.baseCost * matData.baseMarkup));
      const amount = Math.min(amountToBuy, amountAffordable);
      if (amount <= 0) continue;

      try {
        ns.corporation.bulkPurchase(divisionName, cityName, bestFactor.material, amount);
      } catch (e) {
        ns.print(e);
      }
    }
  }
}

function manageOfficeExpansion(ns: NS, division: Division) {
  const funds = ns.corporation.getCorporation().funds;
  if (funds <= 9e9) return;

  const cities = [
    ns.enums.CityName.Sector12,
    ns.enums.CityName.Aevum,
    ns.enums.CityName.Chongqing,
    ns.enums.CityName.NewTokyo,
    ns.enums.CityName.Ishima,
    ns.enums.CityName.Volhaven,
  ];

  const city = cities.find(c => !division.cities.includes(c));
  if (city === undefined) return;

  ns.corporation.expandCity(division.name, city);
  if (ns.corporation.hasUnlock("Warehouse API" as CorpUnlockName)) {
    ns.corporation.purchaseWarehouse(division.name, city);
  }
  if (ns.corporation.hasUnlock("Smart Supply" as CorpUnlockName)) {
    ns.corporation.setSmartSupply(division.name, city, true);
  }

  const id = ns.corporation.getIndustryData(division.industry);
  if (id.makesMaterials && id.producedMaterials) {
    for (const material of id.producedMaterials) {
      ns.corporation.sellMaterial(division.name, city, material, "MAX", "MP");
    }
  }
  if (id.makesProducts) {
    for (const product of division.products) {
      ns.corporation.sellProduct(division.name, city, product, "MAX", "MP", true);
    }
  }
}

const researchOrder: CorpResearchName[] = [
  "Hi-Tech R&D Laboratory",
  "AutoBrew",
  "AutoPartyManager",
  "Automatic Drug Administration",
  "Drones",
  "Go-Juice",
  "CPH4 Injections",
  "Drones - Assembly",
  "Drones - Transport",
  "HRBuddy-Recruitment",
  "HRBuddy-Training",
  "Market-TA.I",
  "Market-TA.II",
  "Overclock",
  "Self-Correcting Assemblers",
  "Sti.mu",
];

const productResearch: CorpResearchName[] = [
  "uPgrade: Fulcrum",
  "uPgrade: Capacity.I",
  "uPgrade: Capacity.II",
  "uPgrade: Dashboard",
];

function getResearchList(division: Division): CorpResearchName[] {
  return division.makesProducts ? [...researchOrder, ...productResearch] : researchOrder;
}

function manageResearch(ns: NS, division: Division) {
  const research = getResearchList(division).find(r => !ns.corporation.hasResearched(division.name, r));
  if (research === undefined) return;

  const cost = ns.corporation.getResearchCost(division.name, research);
  ns.print(`Researching ${research} for ${division.name} (${ns.format.number(cost)})`);
  if (division.researchPoints < cost) return;

  ns.tprint(`Researching ${research} for ${division.name}`);
  ns.corporation.research(division.name, research);

  const id = ns.corporation.getIndustryData(division.industry);
  if (research === "Market-TA.I") {
    id.producedMaterials?.forEach(material => {
      for (const city of division.cities) ns.corporation.setMaterialMarketTA1(division.name, city, material, true);
    });
    division.products.forEach(p => ns.corporation.setProductMarketTA1(division.name, p, true));
  }
  if (research === "Market-TA.II") {
    id.producedMaterials?.forEach(material => {
      for (const city of division.cities) ns.corporation.setMaterialMarketTA2(division.name, city, material, true);
    });
    division.products.forEach(p => ns.corporation.setProductMarketTA2(division.name, p, true));
  }
}

function getTargetInvestment(ns: NS, division: Division): number {
  const products = getDivisionProducts(ns, division.name).filter(p => p.developmentProgress === 100);
  if (products.length === 0) return 1e6;

  const maxInvestment = Math.max(...products.map(p => p.designInvestment + p.advertisingInvestment));
  const atMax = products.filter(p => p.designInvestment + p.advertisingInvestment === maxInvestment);
  return atMax.length >= division.maxProducts ? maxInvestment * 10 : maxInvestment;
}

function manageProducts(ns: NS, division: Division) {
  if (!division.makesProducts) return;
  if (isMakingProduct(ns, division.name)) return;

  const targetInvestment = getTargetInvestment(ns, division);
  if (ns.corporation.getCorporation().funds < targetInvestment) return;

  const fullyDeveloped = getDivisionProducts(ns, division.name).filter(p => p.developmentProgress === 100);
  const atTarget = fullyDeveloped.filter(p => p.designInvestment + p.advertisingInvestment === targetInvestment);
  const slot = atTarget.length;

  const baseName = division.name.replace(/-Corp$/, "");
  const newProductName = `${baseName}-${ns.format.number(targetInvestment, 0)}-${slot}`;

  if (division.products.includes(newProductName)) return;

  if (division.products.length >= division.maxProducts) {
    const worst = findWorstProduct(ns, division.name);
    if (worst === undefined) return;
    if (worst.designInvestment + worst.advertisingInvestment >= targetInvestment) return;
    ns.corporation.discontinueProduct(division.name, worst.name);
  }

  ns.tprint(`Making product ${newProductName}`);
  ns.print(`Making product ${newProductName}`);
  ns.corporation.makeProduct(division.name, "Sector-12", newProductName, targetInvestment / 2, targetInvestment / 2);
  ns.corporation.sellProduct(division.name, "Sector-12", newProductName, "MAX", "MP", true);
  if (ns.corporation.hasResearched(division.name, "Market-TA.I")) {
    ns.corporation.setProductMarketTA1(division.name, newProductName, true);
  }
  if (ns.corporation.hasResearched(division.name, "Market-TA.II")) {
    ns.corporation.setProductMarketTA2(division.name, newProductName, true);
  }
}

function getDivisionProducts(ns: NS, divisionName: string): Product[] {
  return ns.corporation.getDivision(divisionName).products
    .map(name => ns.corporation.getProduct(divisionName, "Sector-12", name));
}

function findWorstProduct(ns: NS, divisionName: string): Product | undefined {
  const products = getDivisionProducts(ns, divisionName).filter(p => p.developmentProgress === 100);
  if (products.length === 0) return undefined;
  return products.reduce((a, b) => a.effectiveRating < b.effectiveRating ? a : b);
}

function isMakingProduct(ns: NS, divisionName: string): boolean {
  return getDivisionProducts(ns, divisionName).some(p => p.developmentProgress < 100);
}

function manageAdverts(ns: NS, division: Division) {
  const cost = ns.corporation.getHireAdVertCost(division.name);
  if (cost > ns.corporation.getCorporation().funds / 10) return;
  ns.print(`Hiring advert for ${division.name}`);
  ns.corporation.hireAdVert(division.name);
}

function manageOffice(ns: NS, divisionName: string, cityName: CityName) {
  while (ns.corporation.hireEmployee(divisionName, cityName)) { }
  jobAssignments(ns, divisionName, cityName);
}

function jobAssignments(ns: NS, divisionName: string, cityName: CityName) {
  const office = ns.corporation.getOffice(divisionName, cityName);
  const doResearch = getResearchList(ns.corporation.getDivision(divisionName))
    .some(r => !ns.corporation.hasResearched(divisionName, r));

  let employees = office.numEmployees;
  let intern = 0, business = 0, management = 0, research = 0, engineer = 0, operations = 0;

  ns.corporation.setJobAssignment(divisionName, cityName, "Operations", 0);
  ns.corporation.setJobAssignment(divisionName, cityName, "Engineer", 0);
  ns.corporation.setJobAssignment(divisionName, cityName, "Business", 0);
  ns.corporation.setJobAssignment(divisionName, cityName, "Management", 0);
  ns.corporation.setJobAssignment(divisionName, cityName, "Research & Development", 0);
  ns.corporation.setJobAssignment(divisionName, cityName, "Intern", 0);

  if (doResearch) {
    intern = Math.floor(employees / 6); employees -= intern;
    business = Math.floor(employees / 5); employees -= business;
    management = Math.floor(employees / 4); employees -= management;
    research = Math.floor(employees / 3); employees -= research;
    engineer = Math.floor(employees / 2); employees -= engineer;
    operations = employees;
  } else {
    intern = Math.floor(employees / 5); employees -= intern;
    business = Math.floor(employees / 4); employees -= business;
    management = Math.floor(employees / 3); employees -= management;
    engineer = Math.floor(employees / 2); employees -= engineer;
    operations = employees;
  }

  ns.corporation.setJobAssignment(divisionName, cityName, "Operations", operations);
  ns.corporation.setJobAssignment(divisionName, cityName, "Engineer", engineer);
  ns.corporation.setJobAssignment(divisionName, cityName, "Business", business);
  ns.corporation.setJobAssignment(divisionName, cityName, "Management", management);
  ns.corporation.setJobAssignment(divisionName, cityName, "Research & Development", research);
  ns.corporation.setJobAssignment(divisionName, cityName, "Intern", intern);
}
