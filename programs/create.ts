import { NS } from "@ns";

const programs = [
  { name: "AutoLink.exe", req: 25 },
  { name: "BruteSSH.exe", req: 50 },
  { name: "DeepscanV1.exe", req: 75 },
  { name: "ServerProfiler.exe", req: 75 },
  { name: "FTPCrack.exe", req: 100 },
  { name: "relaySMTP.exe", req: 250 },
  { name: "DeepscanV2.exe", req: 400 },
  { name: "HTTPWorm.exe", req: 500 },
  { name: "SQLInject.exe", req: 750 },
  { name: "Formulas.exe", req: 1000 },
];

export async function main(ns: NS): Promise<void> {
  ns.disableLog("sleep");
  ns.clearLog();

  const player = ns.getPlayer();
  const skill = player.skills.hacking + player.skills.intelligence;

  const progList = programs
    .filter(p => p.req < skill)
    .filter(p => !ns.fileExists(p.name));
    for(const program of progList){
      ns.print(`${program.name} ${program.req}`);
    }
    for(const program of progList){
      await createProgram(ns, program.name, program.req);
    }
}

async function createProgram(ns: NS, fileName: string, reqHackLevel: number) {
  const player = ns.getPlayer();
  if (!ns.fileExists(fileName) && reqHackLevel < (player.skills.hacking + player.skills.intelligence)) {
    ns.print(`Creating ${fileName}`)
    ns.singularity.createProgram(fileName);
    while (!ns.fileExists(fileName)) {
      await ns.sleep(1000);
    }
  }
}