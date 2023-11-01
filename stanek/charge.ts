import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  while (true) {
    for (const fragment of ns.stanek.activeFragments().filter(f => f.id < 100)) {
      ns.print(fragment)
      await ns.stanek.chargeFragment(fragment.x, fragment.y);
    }
  }
}
