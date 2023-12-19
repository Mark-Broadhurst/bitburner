import { NS, JobField } from "@ns";
import { CompaniesJobs } from "utils/index";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  ns.clearLog();
  const JobField = ns.enums.JobField;
  const player = ns.getPlayer();

  for (const {company, jobField} of CompaniesJobs(ns)) {
    if (player.jobs[company] !== undefined) continue;
    for(const field of jobField) {
      const result = ns.singularity.applyToCompany(company, field);
      if (result) {
        ns.print(`Applied to ${company} for ${field}`);
      }
    }
    ns.singularity.applyToCompany(company, JobField.security);
  }
}
