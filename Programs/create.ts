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
    ns.ui.openTail();
    ns.ui.resizeTail(420, 320);

    while (true) {
        ns.clearLog();

        const player  = ns.getPlayer();
        const skill   = player.skills.hacking + player.skills.intelligence;
        const current = ns.singularity.getCurrentWork();
        const activeProgram = current?.type === "CREATE_PROGRAM" ? current.programName : null;

        // Find the next program to create (first unlocked, not owned, not already active)
        const next = programs
            .filter(p => p.req <= skill && !ns.fileExists(p.name, "home") && p.name !== activeProgram)[0];

        // Start creating if nothing is active
        if (!activeProgram && next !== undefined) {
            ns.singularity.createProgram(next.name);
        }

        // Print status table
        ns.print(`Hack: ${skill}  (hacking ${player.skills.hacking} + int ${player.skills.intelligence})`);
        ns.print("─".repeat(42));
        ns.print("Program              Req    Status");
        ns.print("─".repeat(42));

        for (const p of programs) {
            const owned   = ns.fileExists(p.name, "home");
            const active  = p.name === activeProgram;
            const locked  = p.req > skill;

            let icon: string;
            let status: string;
            if (owned) {
                icon   = "☑";
                status = "done";
            } else if (active) {
                icon   = "⚙";
                status = "creating...";
            } else if (locked) {
                icon   = "☐";
                status = `locked (need ${p.req})`;
            } else {
                icon   = "☐";
                status = "queued";
            }

            ns.print(`${icon} ${p.name.padEnd(20)} ${String(p.req).padEnd(6)} ${status}`);
        }

        ns.print("─".repeat(42));

        // Exit when everything is done
        if (programs.every(p => ns.fileExists(p.name, "home"))) {
            ns.print("✅ All programs created.");
            ns.tprint("✅ All programs created.");
            break;
        }

        // Poll every second while a program is being created; longer when waiting on skill
        await ns.sleep(1000);

        // After sleep, check if active program finished and trigger nuke-all
        const workNow = ns.singularity.getCurrentWork();
        const stillActive = workNow?.type === "CREATE_PROGRAM" ? workNow.programName : null;
        if (activeProgram && !stillActive && ns.fileExists(activeProgram as string, "home")) {
            ns.run("Hacking/nuke-all.js");
        }
    }

    ns.ui.closeTail();
}
