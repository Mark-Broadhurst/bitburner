import { NS } from "@ns";
import { FactionsList } from "utils/factions";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    let faction = ns.args[0] as string;
    let rep = ns.singularity.getFactionRep(faction)

}

export function autocomplete(data:any, args:(string|boolean|number)[]):string[] {
  return FactionsList;
}