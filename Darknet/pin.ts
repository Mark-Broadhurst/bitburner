import { NS } from "@ns";

/**
 * One-shot: apply (or remove) a stasis link on the server this script runs on.
 * Kept separate from phish.ts so that phish.ts doesn't pay the 12 GB RAM cost
 * of setStasisLink on servers that don't need pinning.
 *
 * Args:
 *   --remove   Remove the stasis link instead of applying one
 */
export async function main(ns: NS): Promise<void> {
    const remove = (ns.args as string[]).includes("--remove");
    const r = await ns.dnet.setStasisLink(!remove);
    ns.tprint(r.success
        ? `INFO pin: stasis link ${remove ? "removed" : "applied"} on ${ns.getHostname()}`
        : `WARN pin: setStasisLink failed — ${r.message}`
    );
}
