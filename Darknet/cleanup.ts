import { NS } from "@ns";

/** One-shot: removes all dnet_*.txt topology files from home. */
export async function main(ns: NS): Promise<void> {
    const files = ns.ls("home", "dnet_");
    if (files.length === 0) {
        ns.tprint("No dnet_*.txt files found.");
        return;
    }
    for (const f of files) {
        ns.rm(f, "home");
        ns.tprint(`Removed ${f}`);
    }
    ns.tprint(`Done — removed ${files.length} file(s).`);
}
