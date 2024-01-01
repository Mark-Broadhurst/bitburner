import { NS, Server } from "@ns";
import { getServers, Command, weakenDetails, growDetails, getHackDetails } from "utils/index";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();

  const mockServers: MockServer[] = getServers(ns).map(server => new MockServer(server));


  ns.print(mockServers);
}

class MockServer  {
  backdoorInstalled: boolean | undefined;
  baseDifficulty: number | undefined;
  cpuCores: number;
  ftpPortOpen: boolean;
  hackDifficulty: number | undefined;
  hasAdminRights: boolean;
  hostname: string;
  httpPortOpen: boolean;
  ip: string;
  isConnectedTo: boolean;
  maxRam: number | undefined;
  minDifficulty: number | undefined;
  moneyAvailable: number | undefined;
  moneyMax: number | undefined;
  numOpenPortsRequired: number | undefined;
  openPortCount: number | undefined;
  organizationName: string;
  purchasedByPlayer: boolean;
  ramUsed: number;
  requiredHackingSkill: number | undefined;
  serverGrowth: number | undefined;
  smtpPortOpen: boolean;
  sqlPortOpen: boolean;
  sshPortOpen: boolean;

  constructor(server: Server) {
    this.backdoorInstalled = server.backdoorInstalled;
    this.baseDifficulty = server.baseDifficulty;
    this.cpuCores = server.cpuCores;
    this.ftpPortOpen = server.ftpPortOpen;
    this.hackDifficulty = server.hackDifficulty;
    this.hasAdminRights = server.hasAdminRights;
    this.hostname = server.hostname;
    this.httpPortOpen = server.httpPortOpen;
    this.ip = server.ip;
    this.isConnectedTo = server.isConnectedTo;
    this.maxRam = server.maxRam;
    this.minDifficulty = server.minDifficulty;
    this.moneyAvailable = server.moneyAvailable;
    this.moneyMax = server.moneyMax;
    this.numOpenPortsRequired = server.numOpenPortsRequired;
    this.openPortCount = server.openPortCount;
    this.organizationName = server.organizationName;
    this.purchasedByPlayer = server.purchasedByPlayer;
    this.ramUsed = server.ramUsed;
    this.requiredHackingSkill = server.requiredHackingSkill;
    this.serverGrowth = server.serverGrowth;
    this.smtpPortOpen = server.smtpPortOpen;
    this.sqlPortOpen = server.sqlPortOpen;
    this.sshPortOpen = server.sshPortOpen;
  }
  hack(ns: NS)  {
    const hackPercent = ns.hackAnalyze(this.hostname!);
    const hackSecurity = ns.hackAnalyzeSecurity(1, this.hostname!);
    const hackTime = ns.getHackTime(this.hostname!);
    this.hackDifficulty! += hackSecurity;
    this.moneyAvailable! -= this.moneyAvailable! * hackPercent;
    if(this.moneyAvailable! < 0){
      this.moneyAvailable = 0;
    }
    return hackTime;
  }
  weaken(ns: NS) {
    this.hackDifficulty! -= ns.weakenAnalyze(1);
    const weakenTime = ns.getWeakenTime(this.hostname!);
    if (this.hackDifficulty! > this.minDifficulty!) {
      this.hackDifficulty = this.minDifficulty;
    }
    return weakenTime;
  }
  grow(ns: NS) {
    ns.growthAnalyze(this.hostname!, 1.2);
    ns.growthAnalyzeSecurity(1, this.hostname!);
    ns.getGrowTime(this.hostname!);
  }

  next() : Command {
    if(this.hackDifficulty! >= this.minDifficulty!){
      return "weaken";
    }
    if(this.moneyAvailable! <= this.moneyMax!){
      return "grow";
    }
    return "hack";
  }

}
