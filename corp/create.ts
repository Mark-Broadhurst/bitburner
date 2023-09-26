import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {

ns.corporation.createCorporation("TestCorp", true);
}
