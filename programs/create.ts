import { NS } from "@ns";

const programs = [
  { name: "AutoLink.exe", req: 25, pri: 0 },
  { name: "BruteSSH.exe", req: 50, pri: 1 },
  { name: "DeepscanV1.exe", req: 75, pri: 0 },
  { name: "ServerProfiler.exe", req: 75, pri: 0 },
  { name: "FTPCrack.exe", req: 100, pri: 1 },
  { name: "relaySMTP.exe", req: 250, pri: 1 },
  { name: "DeepscanV2.exe", req: 400, pri: 0 },
  { name: "HTTPWorm.exe", req: 500, pri: 1 },
  { name: "SQLInject.exe", req: 750, pri: 1},
  { name: "Formulas.exe", req: 1000, pri: 0 },
];

export async function main(ns: NS): Promise<void> {
  ns.disableLog("sleep");
  ns.clearLog();

  const player = ns.getPlayer();
  const skill = player.skills.hacking + player.skills.intelligence;

  const progList = programs
    .filter(p => p.req < skill)
    .filter(p => !ns.fileExists(p.name))
    .sort((a, b) => {
      if(a.pri > b.pri){
        return -1;
      }
      if(a.pri < b.pri){
        return 1;
      }
      if (a.req > b.req) {
        return 1;
      }
      if (a.req < b.req) {
        return -1;
      }
      return 0;
    });
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