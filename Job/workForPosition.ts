import { NS, CompanyName, JobField, JobName } from "@ns";
import { CompaniesJobs } from "Utils/companies";

// Field priority when Formulas.exe is unavailable
const FIELD_PRIORITY: JobField[] = [
    "software"           as JobField,
    "it"                 as JobField,
    "security"           as JobField,
    "business"           as JobField,
    "agent"              as JobField,
    "software consultant" as JobField,
    "employee"           as JobField,
    "waiter"             as JobField,
];

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(560, 400);

    const allCompanies = CompaniesJobs(ns).map(x => x.company);

    for (const company of allCompanies) {
        // Skip if already at max position
        const currentJob = ns.getPlayer().jobs[company] as JobName | undefined;
        if (currentJob) {
            const info = ns.singularity.getCompanyPositionInfo(company, currentJob);
            if (!info.nextPosition) {
                ns.print(`✅ ${company} — already at max position (${currentJob})`);
                continue;
            }
        }

        // Apply to every field to land the highest available starting position
        const fields = getCompanyFields(ns, company);
        for (const field of fields) {
            ns.singularity.applyToCompany(company, field);
        }

        let bestField = pickBestField(ns, company, fields);
        ns.singularity.workForCompany(company, false);

        ns.print(`Working for ${company} (${bestField})...`);

        while (true) {
            ns.clearLog();

            const jobName = ns.getPlayer().jobs[company] as JobName | undefined;
            if (!jobName) {
                // Not employed — reapply
                for (const field of fields) ns.singularity.applyToCompany(company, field);
                bestField = pickBestField(ns, company, fields);
                ns.singularity.workForCompany(company, false);
                await ns.sleep(1000);
                continue;
            }

            const info = ns.singularity.getCompanyPositionInfo(company, jobName);
            const rep  = ns.singularity.getCompanyRep(company);

            if (!info.nextPosition) {
                // Reached the top of this field
                ns.print(`✅ ${company} — max position: ${jobName}`);
                break;
            }

            if (rep >= info.requiredReputation) {
                // Apply for promotion in the best field
                ns.singularity.applyToCompany(company, bestField);
                bestField = pickBestField(ns, company, fields);
                ns.singularity.workForCompany(company, false);

                const promoted = ns.getPlayer().jobs[company] ?? jobName;
                ns.print(`⬆️  ${company} — promoted to ${promoted}`);
            } else {
                ns.print(`⏳ ${company}`);
                ns.print(`   Job:   ${jobName}`);
                ns.print(`   Rep:   ${ns.format.number(rep)} / ${ns.format.number(info.requiredReputation)}`);
                ns.print(`   Field: ${bestField}`);
                await ns.sleep(1000);
            }
        }
    }

    ns.singularity.stopAction();
    ns.tprint("✅ All companies worked to max position.");
    ns.ui.closeTail();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCompanyFields(ns: NS, company: CompanyName): JobField[] {
    return CompaniesJobs(ns).find(x => x.company === company)?.jobField ?? [];
}

/**
 * Pick the best field for reputation gain.
 * Uses Formulas.exe when available; otherwise falls back to FIELD_PRIORITY order.
 */
function pickBestField(ns: NS, company: CompanyName, fields: JobField[]): JobField {
    if (fields.length === 0) return "software" as JobField;

    if (ns.fileExists("Formulas.exe", "home")) {
        const player  = ns.getPlayer();
        const favour  = ns.singularity.getCompanyFavor(company);
        const jobName = ns.getPlayer().jobs[company] as JobName | undefined;

        if (jobName) {
            let best     = fields[0];
            let bestGain = -1;
            for (const field of fields) {
                const gain = ns.formulas.work.companyGains(player, company, jobName, favour);
                if (gain.reputation > bestGain) {
                    bestGain = gain.reputation;
                    best     = field;
                }
            }
            return best;
        }
    }

    // Fallback: prefer by priority
    for (const preferred of FIELD_PRIORITY) {
        if (fields.includes(preferred)) return preferred;
    }
    return fields[0];
}
