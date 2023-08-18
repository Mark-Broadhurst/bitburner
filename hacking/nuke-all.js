import network from "./network/scan";
import sortBy from "./helpers/sortBy";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  const servers = network(ns)
    .filter(server => !server.hasAdminRights)
    .sort(sortBy("requiredHackingSkill"))
    .sort(sortBy("numOpenPortsRequired"));
  for (const server of servers) {
    await openPorts(ns, server);
    ns.toast(`Admin access gained for ${server.hostname}`)
  }
}

/** 
 * Wait for a file to exist
 * @param {NS} ns
 * @param {string} fileName
 */
async function waitForFile(ns, fileName) {
  while (!ns.fileExists(fileName)) {
    await ns.sleep(1000);
  }
}

/** 
 * Gain root access to target server
 * @param {NS} ns
 * @param {server} server
 */
 async function openPorts (ns, server) {
  const attacks = [
    { filename: "Nuke.exe", func: ns.nuke, check: server.hasAdminRights },
    { filename: "BruteSSH.exe", func: ns.brutessh, check: server.sshPortOpen },
    { filename: "FTPCrack.exe", func: ns.ftpcrack, check: server.ftpPortOpen },
    { filename: "relaySMTP.exe", func: ns.relaysmtp, check: server.smtpPortOpen },
    { filename: "HTTPworm.exe", func: ns.httpworm, check: server.httpPortOpen },
    { filename: "SQLinject.exe", func: ns.sqlinject, check: server.sqlPortOpen }
  ]
  for (let i = server.numOpenPortsRequired; i > -1; i--) {
    let attack = attacks[i];
    ns.print(attack);
    
    if(!attack.check)
    {
      await waitForFile(ns, attack.filename);
      ns.print(`attacking ${server.hostname} with ${attack.filename}`)

      attack.func(server.hostname);
    }
  }
}