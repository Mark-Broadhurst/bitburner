import { NS, PlayerRequirement, Server } from "@ns";
import { RegularFactions, FactionsList } from "Utils/factions";

// ── Entry point ───────────────────────────────────────────────────────────────

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(620, 700);

    while (true) {
        ns.clearLog();

        const joined  = ns.getPlayer().factions;
        const invited = ns.singularity.checkFactionInvitations();

        // Accept any pending invites immediately
        for (const faction of invited) {
            ns.singularity.joinFaction(faction);
            ns.print(`📬 Joined ${faction}`);
        }

        const pending = RegularFactions(ns)
            .filter(f => !joined.includes(f) && !invited.includes(f))
            .sort((a, b) => FactionsList.indexOf(a) - FactionsList.indexOf(b));

        ns.print(`Joined: ${joined.length}  |  Pending: ${pending.length}`);
        ns.print("─".repeat(62));

        for (const faction of pending) {
            const requirements = ns.singularity.getFactionInviteRequirements(faction);
            const results      = requirements.map(r => checkReq(ns, r));
            const allMet       = results.every(r => r.met);

            ns.print(`${allMet ? "✅" : "⏳"} ${faction}`);
            for (const r of results) {
                ns.print(`   ${r.met ? "✅" : "❌"} ${r.text}`);
                if (!r.met) await meetReq(ns, r.req);
            }
        }

        ns.print("─".repeat(62));
        await ns.sleep(2000);
    }
}

// ── Requirement checking ──────────────────────────────────────────────────────

type ReqResult = { text: string; met: boolean; req: PlayerRequirement };

function checkReq(ns: NS, req: PlayerRequirement): ReqResult {
    const player = ns.getPlayer();
    let text: string;
    let met: boolean;

    switch (req.type) {
        case "money": {
            const have = ns.getServerMoneyAvailable("home");
            text = `Money  $${ns.format.number(have)} / $${ns.format.number(req.money)}`;
            met  = have >= req.money;
            break;
        }
        case "skills": {
            const skills = player.skills as unknown as Record<string, number>;
            const checks = (Object.entries(req.skills) as [string, number][]).map(([skill, need]) => {
                const have = skills[skill] ?? 0;
                return { text: `${skill} ${have}/${need}`, met: have >= need };
            });
            text = `Skills  ${checks.map(c => c.text).join("  ")}`;
            met  = checks.every(c => c.met);
            break;
        }
        case "karma": {
            // @ts-ignore — hidden API
            const karma = ns.heart.break() as number;
            text = `Karma  ${karma.toFixed(0)} / ${req.karma}`;
            met  = karma <= req.karma;
            break;
        }
        case "numAugmentations": {
            const have = ns.singularity.getOwnedAugmentations().length;
            text = `Augmentations  ${have} / ${req.numAugmentations}`;
            met  = have >= req.numAugmentations;
            break;
        }
        case "backdoorInstalled": {
            const server = ns.getServer(req.server) as Server;
            text = `Backdoor  ${req.server}`;
            met  = server.backdoorInstalled ?? false;
            break;
        }
        case "city": {
            text = `City  ${player.city} / ${req.city}`;
            met  = player.city === req.city;
            break;
        }
        case "companyReputation": {
            const have = ns.singularity.getCompanyRep(req.company);
            text = `${req.company} rep  ${ns.format.number(have)} / ${ns.format.number(req.reputation)}`;
            met  = have >= req.reputation;
            break;
        }
        case "employedBy": {
            text = `Employed by  ${req.company}`;
            met  = player.jobs[req.company] !== undefined;
            break;
        }
        case "file": {
            text = `File  ${req.file}`;
            met  = ns.fileExists(req.file, "home");
            break;
        }
        case "numPeopleKilled": {
            const have = player.numPeopleKilled;
            text = `People killed  ${have} / ${req.numPeopleKilled}`;
            met  = have >= req.numPeopleKilled;
            break;
        }
        case "hacknetLevels": {
            const have = totalHacknetStat(ns, "level");
            text = `Hacknet levels  ${have} / ${req.hacknetLevels}`;
            met  = have >= req.hacknetLevels;
            break;
        }
        case "hacknetRAM": {
            const have = totalHacknetStat(ns, "ram");
            text = `Hacknet RAM  ${have} / ${req.hacknetRAM}`;
            met  = have >= req.hacknetRAM;
            break;
        }
        case "hacknetCores": {
            const have = totalHacknetStat(ns, "cores");
            text = `Hacknet cores  ${have} / ${req.hacknetCores}`;
            met  = have >= req.hacknetCores;
            break;
        }
        case "someCondition": {
            const inner = req.conditions.map(r => checkReq(ns, r));
            met  = inner.some(r => r.met);
            text = `Any of: ${inner.map(r => `[${r.text}]`).join(" or ")}`;
            break;
        }
        case "everyCondition": {
            const inner = req.conditions.map(r => checkReq(ns, r));
            met  = inner.every(r => r.met);
            text = inner.map(r => r.text).join(" & ");
            break;
        }
        case "not": {
            const inner = checkReq(ns, req.condition);
            text = `Not: ${inner.text}`;
            met  = !inner.met;
            break;
        }
        default:
            text = (req as any).type;
            met  = false;
    }

    return { text, met, req };
}

// ── Automated actions ─────────────────────────────────────────────────────────

async function meetReq(ns: NS, req: PlayerRequirement): Promise<void> {
    switch (req.type) {
        case "backdoorInstalled":
            await installBackdoor(ns, req.server);
            break;
        case "city":
            ns.singularity.travelToCity(req.city);
            break;
        case "employedBy":
            ns.singularity.applyToCompany(req.company, ns.enums.JobField.security);
            ns.singularity.applyToCompany(req.company, ns.enums.JobField.software);
            ns.singularity.applyToCompany(req.company, ns.enums.JobField.it);
            ns.singularity.applyToCompany(req.company, ns.enums.JobField.business);
            break;
        case "companyReputation":
            if (ns.getPlayer().jobs[req.company] === undefined) {
                ns.singularity.applyToCompany(req.company, ns.enums.JobField.security);
            }
            ns.singularity.workForCompany(req.company, false);
            break;
        case "someCondition":
            // Try to meet the first unmet sub-condition
            for (const sub of req.conditions) {
                const result = checkReq(ns, sub);
                if (!result.met) { await meetReq(ns, sub); break; }
            }
            break;
        case "everyCondition":
            for (const sub of req.conditions) {
                const result = checkReq(ns, sub);
                if (!result.met) await meetReq(ns, sub);
            }
            break;
        // Not automatable — displayed as progress only
        default:
            break;
    }
}

/** Install a backdoor by navigating to the server via BFS path. */
async function installBackdoor(ns: NS, target: string): Promise<void> {
    const server = ns.getServer(target) as Server;
    if (!server.hasAdminRights)                              return;
    if (server.backdoorInstalled)                            return;
    if ((server.requiredHackingSkill ?? 0) > ns.getHackingLevel()) return;

    const path = findPath(ns, target);
    if (path.length === 0) return;

    for (const hop of path.slice(1)) ns.singularity.connect(hop);
    await ns.singularity.installBackdoor();
    ns.singularity.connect("home");
    ns.print(`✅ Backdoor installed: ${target}`);
}

/** BFS from home to find the shortest path to a hostname. */
function findPath(ns: NS, target: string): string[] {
    const visited = new Set<string>(["home"]);
    const queue: { host: string; path: string[] }[] = [{ host: "home", path: ["home"] }];
    while (queue.length > 0) {
        const { host, path } = queue.shift()!;
        if (host === target) return path;
        for (const neighbor of ns.scan(host)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push({ host: neighbor, path: [...path, neighbor] });
            }
        }
    }
    return [];
}

/** Sum a stat across all hacknet nodes. */
function totalHacknetStat(ns: NS, stat: "level" | "ram" | "cores"): number {
    let total = 0;
    for (let i = 0; i < ns.hacknet.numNodes(); i++) total += ns.hacknet.getNodeStats(i)[stat];
    return total;
}
