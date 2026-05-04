import { CorpMaterialName, Division, Material, NS, Warehouse } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  const CityName = ns.enums.CityName;

  while (true) {
    ns.clearLog();

    const corpInfo = ns.corporation.getCorporation();
    while (true) {
      const funds = ns.corporation.getCorporation().funds;

      const smallestWarehouse = corpInfo.divisions
        .map(divisionName => ns.corporation.getDivision(divisionName))
        .flatMap(division => division.cities.map(cityName => {
          if (!ns.corporation.hasWarehouse(division.name, cityName)) {
            return { division: division.name, city: cityName, size: 0, cost: 4e9 }
          }
          const warehouse = ns.corporation.getWarehouse(division.name, cityName);
          const cost = ns.corporation.getUpgradeWarehouseCost(division.name, cityName);
          return { division: division.name, city: cityName, size: warehouse.size, cost: cost }
        }))
        .reduce((a, b) => {
          if (b.size < a.size) {
            return b;
          }
          return a;
        });

      if (smallestWarehouse.cost <= funds) {
        ns.print(`Upgrading warehouse in ${smallestWarehouse.division}:${smallestWarehouse.city} for ${ns.formatNumber(smallestWarehouse.cost)}`);
        ns.tprint(`Upgrading warehouse in ${smallestWarehouse.division}:${smallestWarehouse.city} for ${ns.formatNumber(smallestWarehouse.cost)}`);
        if (smallestWarehouse.size === 0) {
          ns.corporation.purchaseWarehouse(smallestWarehouse.division, smallestWarehouse.city);
        }
        else {
          ns.corporation.upgradeWarehouse(smallestWarehouse.division, smallestWarehouse.city);
        }
      }
      else {
        break;
      }
      await ns.sleep(10);
    }

    for (const divisionName of corpInfo.divisions) {
      //ns.print(`Division: ${divisionName}`);
      const division = ns.corporation.getDivision(divisionName);
      const bestFactor = getBestFactor(ns, division);
      const matData = ns.corporation.getMaterialData(bestFactor.material);

      ns.print(`bestFactor: ${bestFactor.material} ${bestFactor.size}`);

      for (const cityName of division.cities) {
        //ns.print(`City: ${cityName}`);
        if (!ns.corporation.hasWarehouse(divisionName, cityName)) {
          ns.print(`No warehouse in ${cityName}`);
          continue;
        }
        const warehouse = ns.corporation.getWarehouse(divisionName, cityName);
        const spaceToUse = Math.floor((warehouse.size * 0.4) - warehouse.sizeUsed);

        if (spaceToUse <= 0) {
          continue;
        }

        const amountToBuy = Math.floor(spaceToUse / bestFactor.size);
        const corpFunds = ns.corporation.getCorporation().funds;
        const amountAffordable = Math.floor(corpFunds / (matData.baseCost * matData.baseMarkup));
        const amount = Math.floor(Math.min(amountToBuy, amountAffordable));

        ns.print(`ToBuy: ${amountToBuy} Affordable: ${amountAffordable} amount: ${ns.formatNumber(amount * matData.baseCost * matData.baseMarkup)}`);

        if (amount > 0) {
          ns.print(`Buying ${amount} ${bestFactor.material} in ${cityName}`);
          //ns.tprint(`${divisionName}: Buying ${amount} ${bestFactor.material} in ${cityName}`);
          try {

            ns.corporation.bulkPurchase(divisionName, cityName, bestFactor.material, amount);
          } catch (e) {
            ns.print(e);
          }
        }

      }
    }
    await ns.corporation.nextUpdate();
  }
}

type Factor = {
  material: CorpMaterialName;
  size: number;
  factor: number;
}

function getBestFactor(ns: NS, division: Division): Factor {

  const industryData = ns.corporation.getIndustryData(division.type);
  const factor = [];
  ns.print(`Division Type: ${division.type}`);
  if (division.type !== "Real Estate") {
    factor.push({ material: "Real Estate", size: 0.005, factor: industryData.realEstateFactor!, } as Factor);
  }
  if (division.type !== "Software") {
    factor.push({ material: "AI Cores", size: 0.1, factor: industryData.aiCoreFactor! } as Factor,);
  }
  if (division.type !== "Computer Hardware") {
    factor.push({ material: "Hardware", size: 0.06, factor: industryData.hardwareFactor! } as Factor,);
  }
  if (division.type !== "Robotics") {
    factor.push({ material: "Robots", size: 0.5, factor: industryData.robotFactor! } as Factor,);
  }
  return factor
    .reduce((a, b) => {
      if (b.factor > a.factor) {
        return b;
      }
      return a;
    });
}