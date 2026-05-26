import { NS, CompanyName, JobField } from "@ns";
import { CompaniesWithFactions, CompaniesJobs } from "Utils/companies";


export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(560, 360);

    for (const company of CompaniesWithFactions(ns)) {
        if (hasFactionAccess(ns, company)) {
            ns.print(`✅ ${company} — already have faction access`);
            continue;
        }

        // Apply to every available field to land the highest starting position
        const fields = getCompanyFields(ns, company);
        for (const field of fields) {
            ns.singularity.applyToCompany(company, field);
        }

        // Work in the best field for reputation gain
        let bestField = pickBestField(ns, company, fields);
        ns.singularity.workForCompany(company, false);

        ns.print(`Working for ${company} (${bestField})...`);

        while (!hasFactionAccess(ns, company)) {
            ns.clearLog();

            const rep     = ns.singularity.getCompanyRep(company);
            const jobName = ns.getPlayer().jobs[company];

            if (!jobName) {
                // Not employed — try applying again
                for (const field of fields) ns.singularity.applyToCompany(company, field);
                bestField = pickBestField(ns, company, fields);
                ns.singularity.workForCompany(company, false);
                await ns.sleep(1000);
                continue;
            }

            const info = ns.singularity.getCompanyPositionInfo(company, jobName);

            // Promote when ready
            if (rep >= info.requiredReputation && info.nextPosition) {
                ns.singularity.applyToCompany(company, bestField);
                // Re-evaluate best field after promotion (stats may have changed)
                bestField = pickBestField(ns, company, fields);
                ns.singularity.workForCompany(company, false);
                const newJob = ns.getPlayer().jobs[company] ?? jobName;
                ns.print(`⬆️  ${company} — promoted to ${newJob} (${bestField})`);
            } else {
                const repStr  = ns.format.number(rep);
                const needStr = ns.format.number(info.requiredReputation);
                ns.print(`⏳ ${company}`);
                ns.print(`   Job:   ${jobName}`);
                ns.print(`   Rep:   ${repStr} / ${needStr}`);
                ns.print(`   Field: ${bestField}`);
            }

            await ns.sleep(1000);
        }

        ns.print(`✅ ${company} — faction access unlocked!`);
    }

    ns.singularity.stopAction();
    ns.tprint("✅ All company factions unlocked.");
    ns.ui.closeTail();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return the job fields available for a company. */
function getCompanyFields(ns: NS, company: CompanyName): JobField[] {
    return CompaniesJobs(ns).find(x => x.company === company)?.jobField ?? [];
}

/**
 * Pick the best field for reputation gain.
 * Uses Formulas.exe when available; otherwise falls back to FIELD_PRIORITY order.
 */
function pickBestField(ns: NS, company: CompanyName, fields: JobField[]): JobField {
    if (fields.length === 0) return ns.enums.JobField.software;

    if (ns.fileExists("Formulas.exe", "home")) {
        const player = ns.getPlayer();
        const favour = ns.singularity.getCompanyFavor(company);
        const jobName = ns.getPlayer().jobs[company];

        if (jobName) {
            let best = fields[0];
            let bestGain = -1;
            for (const field of fields) {
                // Note: companyGains uses the current jobName regardless of field;
                // we iterate fields to find which one produces the best rep gain
                // given the player's current stats and favour.
                const gain = ns.formulas.work.companyGains(player, company, jobName, favour);
                if (gain.reputation > bestGain) {
                    bestGain = gain.reputation;
                    best = field;
                }
            }
            return best;
        }
    }

    // Fallback: use priority order (most desirable field first)
    const JF = ns.enums.JobField;
    for (const preferred of [JF.software, JF.it, JF.security, JF.business, JF.agent, JF.softwareConsultant, JF.employee, JF.waiter]) {
        if (fields.includes(preferred)) return preferred;
    }
    return fields[0];
}

/**
 * Returns true if the player is already in the faction or has a pending invite.
 * Handles the Fulcrum Technologies → "Fulcrum Secret Technologies" mapping.
 */
function hasFactionAccess(ns: NS, company: string): boolean {
    const factions = ns.getPlayer().factions
        .concat(ns.singularity.checkFactionInvitations());

    // Direct name match (most companies share name with their faction)
    if (factions.some(f => f === company)) return true;

    // Fulcrum Technologies → Fulcrum Secret Technologies
    if (company === ns.enums.CompanyName.FulcrumTechnologies) {
        return factions.includes("Fulcrum Secret Technologies");
    }

    return false;
}
