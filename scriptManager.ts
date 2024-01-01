import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  const scripts = ns.args as string[];
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    ns.print(`Running ${script}`);
    if (i == scripts.length - 1) {
      ns.spawn(script, 1);
    }
    else {
      ns.run(script);
      await ns.sleep(100);
      while (ns.scriptRunning(script, "home")) {
        await ns.sleep(1000);
      }
    }
  }
}

export function autocomplete(data: any, args: any) {
  return [...data.scripts];
}