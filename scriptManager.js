/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const scripts = ns.args;
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