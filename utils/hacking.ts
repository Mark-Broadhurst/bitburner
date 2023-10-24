import { NS, Server } from "@ns";

export class Work {
  command: Command;
  target: string;
  threads: number;
  wait: number;
  constructor(command: Command, target: string, threads: number, wait: number = 0) {
      this.command = command;
      this.target = target;
      this.threads = threads;
      this.wait = wait;
  }
}

const scriptSize = 1.75;
const hackPercent = 0.2;

export class WorkerServer {
    hostname: string;
    maxThreads: number;
    freeThreads: number;
    constructor(server: Server) {
        this.hostname = server.hostname;
        this.maxThreads = Math.floor(server.maxRam / scriptSize);
        this.freeThreads = Math.floor((server.maxRam - server.ramUsed) / scriptSize);
    }
}

export type Command = "hack" | "grow" | "weaken";

export class WorkDetail {
    time: number;
    constructor(time: number) {
        this.time = time;
    }
}

export class HackGrowDetail extends WorkDetail {
    security: number;
    constructor(time: number, security: number) {
        super(time);
        this.security = security;
    }
}

export class WeakenDetail extends WorkDetail {
    threads: number;
    constructor(time: number, threads: number) {
        super(time);
        this.threads = threads;
    }
}

export function weakenDetails(ns: NS, server: Server, security: number) : WeakenDetail {
    const time = ns.getWeakenTime(server.hostname);
    const weakenPerThread = 0.05;
    const threads = Math.ceil(security / weakenPerThread);
    return new WeakenDetail(time, threads);
}

export function growDetails(ns: NS, server: Server) : HackGrowDetail {
    const growPercent = server.moneyMax! / server.moneyAvailable!;
    const threads = Math.max(1, Math.ceil(ns.growthAnalyze(server.hostname, growPercent, server.cpuCores)));
    const security = ns.growthAnalyzeSecurity(threads, server.hostname, server.cpuCores);
    return new HackGrowDetail(threads, security);
}

function getHackDetails(ns: NS, server: Server) : HackGrowDetail {
    const threads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(server.hostname, server.moneyMax! * hackPercent)));
    const security = ns.hackAnalyzeSecurity(threads, server.hostname);
    return new HackGrowDetail(threads, security);
}