import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const CityName = ns.enums.CityName;
  const corpInfo = ns.corporation.getCorporation();
  for (const divisionName of corpInfo.divisions) {
    const division = ns.corporation.getDivision(divisionName);
    for(const cityName of division.cities) {
      const warehouse = ns.corporation.getWarehouse(divisionName, cityName);
      
    }
  }
}
