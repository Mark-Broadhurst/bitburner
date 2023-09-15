import { NS, Server } from "@ns";
import { getWorkerServers, getPlayerServers } from "utils/network";

const scriptSize = 1.75;

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  const servers = [...getWorkerServers(ns), ...getPlayerServers(ns)].map(s => new WorkerServer(s));


  ns.print(servers);
}

class WorkerServer  {
  hostname: string;
  maxThreads: number;
  freeThreads: number;
  constructor(server: Server) {
    this.hostname = server.hostname;
    this.maxThreads = Math.floor(server.maxRam / scriptSize);
    this.freeThreads = Math.floor((server.maxRam - server.ramUsed) / scriptSize);
  }
}