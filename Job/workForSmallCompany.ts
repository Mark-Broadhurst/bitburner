import { NS } from "@ns";

const REP_TARGET = 1_000_000; // stop once rep reaches 1m at each company

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(500, 320);

    const CompanyName = ns.enums.CompanyName;
    const typeOfWork  = ns.enums.JobField.security;

    for (const company of Object.values(CompanyName)) {
        ns.clearLog();

        const positions = ns.singularity.getCompanyPositions(company);
        if (positions.length === 0) continue;

        let info = ns.singularity.getCompanyPositionInfo(company, positions[0]);

        ns.singularity.applyToCompany(company, typeOfWork);
        ns.singularity.workForCompany(company, false);
        ns.print(`Working for ${company}...`);

        while (true) {
            const rep = ns.singularity.getCompanyRep(company);

            if (rep >= REP_TARGET) {
                ns.print(`✅ ${company} — rep target reached (${ns.format.number(rep)})`);
                break;
            } else if (rep >= info.requiredReputation && info.nextPosition) {
                ns.singularity.applyToCompany(company, typeOfWork);
                info = ns.singularity.getCompanyPositionInfo(company, info.nextPosition);
                ns.print(`Promoted to ${info.name}`);
            } else if (!info.nextPosition && rep >= info.requiredReputation) {
                ns.print(`✅ ${company} — max position reached`);
                break;
            } else {
                ns.print(`${company} — rep: ${ns.format.number(rep)} / ${ns.format.number(REP_TARGET)}`);
                await ns.sleep(1000);
            }
        }
    }

    ns.singularity.stopAction();
    ns.tprint("✅ All small companies done.");
    ns.ui.closeTail();
}
