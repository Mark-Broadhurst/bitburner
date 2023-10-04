import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const rootX = ns.args[0] as number;
  const rootY = ns.args[1] as number;
  while (true) {
    await ns.stanek.chargeFragment(rootX, rootY);
  }
}
