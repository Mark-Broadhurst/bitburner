import { NS } from "@ns";

export async function main(ns : NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const scripts = ns.args as string[];
    for(const script of scripts)
    {
      ns.print(`Running ${script}`);
      ns.run(script);
      await ns.sleep(100);
      while(ns.scriptRunning(script, "home"))
      {
        await ns.sleep(1000);
      }
    }
  }