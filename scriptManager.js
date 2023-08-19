/** @param {NS} ns */
export async function main(ns) {
  const scripts = ns.args;
  for(const script of scripts)
  {
    ns.run(script);
    while(ns.scriptRunning(script, "home"))
    {
      ns.sleep(1000);
    }
  }
}