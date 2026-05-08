import { NS } from "@ns";

/**
 * Relay script: exec'd onto a hop server (e.g. darkweb) so it can deploy
 * phish.js onto an adjacent target that isn't directly reachable from home.
 *
 * Args: <target> <password>
 */
export async function main(ns: NS): Promise<void> {
    const [target, password] = ns.args as [string, string];
    if (!target || password === undefined) {
        ns.tprint("ERROR Usage: hopDeploy.js <target> <password>");
        return;
    }

    const r = ns.dnet.connectToSession(target, password);
    if (!r.success) {
        ns.tprint(`ERROR hopDeploy: connectToSession(${target}) failed — ${r.message}`);
        return;
    }

    await ns.scp(["Darknet/phish.js", "Darknet/pin.js"], target, ns.getHostname());
    ns.scriptKill("Darknet/phish.js", target);

    const pid = ns.exec("Darknet/phish.js", target, 1);
    if (pid > 0) {
        ns.tprint(`INFO hopDeploy: phish.js started on ${target} (pid ${pid})`);

        const slots         = ns.dnet.getStasisLinkLimit() - ns.dnet.getStasisLinkedServers().length;
        const alreadyPinned = ns.dnet.getStasisLinkedServers().includes(target);
        if (slots > 0 && !alreadyPinned) {
            const pinPid = ns.exec("Darknet/pin.js", target, 1);
            if (pinPid > 0) ns.tprint(`INFO hopDeploy: pin.js started on ${target}`);
        }
    } else {
        ns.tprint(`WARN hopDeploy: exec phish.js on ${target} failed — not enough RAM?`);
        const pid2 = ns.exec("Darknet/phish.js", target, 1, "--no-phish");
        if (pid2 > 0) ns.tprint(`  Retried with --no-phish: pid ${pid2}`);
    }
}
