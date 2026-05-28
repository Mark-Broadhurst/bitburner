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

        const fields = getCompanyFields(ns, company);
        for (const field of fields) {
            ns.singularity.applyToCompany(company, field);
        }

        let bestField = pickBestField(ns, company, fields);
        ns.singularity.workForCompany(company, false);

        ns.print(`Working for ${company} (${bestField})...`);

        while (!hasFactionAccess(ns, company)) {
            ns.clearLog();

            const rep     = ns.singularity.getCompanyRep(company);
            const jobName = ns.getPlayer().jobs[company];

            if (!jobName) {
                for (const field of fields) ns.singularity.applyToCompany(company, field);
                bestField = pickBestField(ns, company, fields);
                ns.singularity.workForCompany(company, false);
                await ns.sleep(1000);
                continue;
            }

            const info = ns.singularity.getCompanyPositionInfo(company, jobName);

            if (rep >= info.requiredReputation && info.nextPosition) {
                ns.singularity.applyToCompany(company, bestField);
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

function getCompanyFields(ns: NS, company: CompanyName): JobField[] {
    return CompaniesJobs(ns).find(x => x.company === company)?.jobField ?? [];
}

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
                const gain = ns.formulas.work.companyGains(player, company, jobName, favour);
                if (gain.reputation > bestGain) {
                    bestGain = gain.reputation;
                    best = field;
                }
            }
            return best;
        }
    }

    const JF = ns.enums.JobField;
    for (const preferred of [JF.software, JF.it, JF.security, JF.business, JF.agent, JF.softwareConsultant, JF.employee, JF.waiter]) {
        if (fields.includes(preferred)) return preferred;
    }
    return fields[0];
}

function hasFactionAccess(ns: NS, company: string): boolean {
    const factions = ns.getPlayer().factions
        .concat(ns.singularity.checkFactionInvitations());

    if (factions.some(f => f === company)) return true;

    if (company === ns.enums.CompanyName.FulcrumTechnologies) {
        return factions.includes("Fulcrum Secret Technologies");
    }

    return false;
}
