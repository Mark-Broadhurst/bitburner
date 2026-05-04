import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  const scripts = ns.args as string[];
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    ns.print(`Running ${script}`);
    if (i === scripts.length - 1) {
      ns.spawn(script, { spawnDelay: 0 });
    } else {
      const pid = ns.run(script);
      if (pid === 0) {
        ns.tprint(`ERROR scriptManager: failed to start ${script}`);
        return;
      }
      while (ns.isRunning(pid)) {
        await ns.sleep(1000);
      }
    }
  }
}

export function autocomplete(data: any, args: any) {
  return [...data.scripts];
}