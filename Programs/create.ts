import { NS, ProgramName } from "@ns";

const programs: { name: ProgramName; req: number }[] = [
    { name: "AutoLink.exe",       req: 25   },
    { name: "BruteSSH.exe",       req: 50   },
    { name: "DeepscanV1.exe",     req: 75   },
    { name: "ServerProfiler.exe", req: 75   },
    { name: "FTPCrack.exe",       req: 100  },
    { name: "relaySMTP.exe",      req: 250  },
    { name: "DeepscanV2.exe",     req: 400  },
    { name: "HTTPWorm.exe",       req: 500  },
    { name: "SQLInject.exe",      req: 750  },
    { name: "Formulas.exe",       req: 1000 },
];

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(420, 280);

    const player = ns.getPlayer();
    const skill  = player.skills.hacking + player.skills.intelligence;

    const queue = programs
        .filter(p => p.req < skill)
        .filter(p => !ns.fileExists(p.name, "home"));

    if (queue.length === 0) {
        ns.print("✅ All creatable programs already exist.");
        await ns.sleep(3000);
        ns.ui.closeTail();
        return;
    }

    for (const program of queue) {
        ns.print(`🔧 Creating ${program.name} (req: ${program.req})...`);
        ns.singularity.createProgram(program.name);
        while (!ns.fileExists(program.name, "home")) {
            await ns.sleep(1000);
        }
        ns.print(`✅ Done: ${program.name}`);
        ns.run("Hacking/nuke-all.js");
    }

    ns.tprint("✅ All programs created.");
    ns.ui.closeTail();
}
