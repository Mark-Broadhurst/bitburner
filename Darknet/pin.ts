import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const remove = (ns.args as string[]).includes("--remove");
    const r = await ns.dnet.setStasisLink(!remove);
    ns.tprint(r.success
        ? `INFO pin: stasis link ${remove ? "removed" : "applied"} on ${ns.getHostname()}`
        : `WARN pin: setStasisLink failed — ${r.message}`
    );
}
