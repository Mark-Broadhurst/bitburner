/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const server = ns.args[0];
  while (true) {
    ns.clearLog();
    const maxRam = ns.getServerMaxRam(server);
    const usedRam = ns.getServerUsedRam(server);
    const freeRam = maxRam - usedRam;
    ns.print(`Free Ram: ${freeRam}`);
    if (freeRam < 1.75) {
      await ns.sleep(10);
      continue;
    }
    let portData = ns.readPort(1);

    if (portData == "NULL PORT DATA") {
      await ns.sleep(10);
      continue;
    }

    let [command, target, threads, wait] = portData.split(",");

    switch (command) {
      case "weaken":
        ns.print(`Weakening ${target} ${threads} times`);
        ns.run("weaken.js", threads, target, wait);
        break;
      case "grow":
        ns.print(`Growing ${target} ${threads} times`);
        ns.run("grow.js", threads, target, wait);
        break;
      case "hack":
        ns.print(`Hacking ${target} ${threads} times`);
        ns.run("hack.js", threads, target, wait);
        break;
    }
    await ns.sleep(10);

  }
}