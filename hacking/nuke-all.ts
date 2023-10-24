import { NS, Server } from "@ns";
import { getServers } from "utils/network";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  const servers = getServers(ns)
    .filter(server => !server.hasAdminRights)
    .sort((a, b) => a.numOpenPortsRequired! - b.numOpenPortsRequired!);
  for (const server of servers) {
    await openPorts(ns, server);
    ns.toast(`Admin access gained for ${server.hostname}`);
    ns.scp(["grow.js", "weaken.js", "hack.js", "share.js"], server.hostname);
  }

}

async function waitForFile(ns: NS, fileName: string): Promise<void> {
  while (!ns.fileExists(fileName)) {
    await ns.sleep(1000);
  }
}

async function openPorts(ns: NS, server: Server): Promise<void> {
  const attacks = [
    { filename: "Nuke.exe", func: ns.nuke, check: server.hasAdminRights },
    { filename: "BruteSSH.exe", func: ns.brutessh, check: server.sshPortOpen },
    { filename: "FTPCrack.exe", func: ns.ftpcrack, check: server.ftpPortOpen },
    { filename: "relaySMTP.exe", func: ns.relaysmtp, check: server.smtpPortOpen },
    { filename: "HTTPworm.exe", func: ns.httpworm, check: server.httpPortOpen },
    { filename: "SQLinject.exe", func: ns.sqlinject, check: server.sqlPortOpen }
  ];
  for (let i: number = server.numOpenPortsRequired!; i > -1; i--) {
    let attack = attacks[i];
    ns.print(attack);

    if (!attack.check) {
      await waitForFile(ns, attack.filename);
      ns.print(`attacking ${server.hostname} with ${attack.filename}`);

      attack.func(server.hostname);
    }
  }
}