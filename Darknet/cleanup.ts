import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const files = ns.ls("home", "Darknet/").filter(f => f.endsWith(".txt"));
    if (files.length === 0) {
        ns.tprint("INFO No Darknet txt files to clean up.");
        return;
    }
    for (const f of files) {
        ns.rm(f, "home");
        ns.tprint(`INFO Deleted ${f}`);
    }
    ns.tprint(`INFO Cleaned up ${files.length} file(s).`);
}
