import { NS, CompanyName, JobField, Person, JobName } from "@ns";
import { Factions } from "utils/factions";

type CompanyFaction = { company: CompanyName, faction: Factions };

export function CompaniesWithFactions(ns: NS): CompanyName[] {
    const CompanyName = ns.enums.CompanyName;
    const factions = ns.getPlayer().factions.concat(ns.singularity.checkFactionInvitations());

    const companies = [
        { company: CompanyName.BachmanAndAssociates, faction: "Bachman & Associates" },
        { company: CompanyName.ECorp, faction: "ECorp" },
        { company: CompanyName.MegaCorp, faction: "MegaCorp" },
        { company: CompanyName.KuaiGongInternational, faction: "KuaiGong International" },
        { company: CompanyName.FourSigma, faction: "Four Sigma" },
        { company: CompanyName.NWO, faction: "NWO" },
        { company: CompanyName.BladeIndustries, faction: "Blade Industries" },
        { company: CompanyName.OmniTekIncorporated, faction: "OmniTek Incorporated" },
        { company: CompanyName.ClarkeIncorporated, faction: "Clarke Incorporated" },
        { company: CompanyName.FulcrumTechnologies, faction: "Fulcrum Secret Technologies" },
    ] as CompanyFaction[];

    return companies.filter(x => !factions.includes(x.faction)).map(x => x.company);
}

export function CompaniesJobs(ns: NS): { company: CompanyName, jobField: JobField[] }[] {
    const CompanyName = ns.enums.CompanyName;
    const JobField = ns.enums.JobField;

    return [
        { company: CompanyName.ECorp, jobField: [JobField.business, JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.MegaCorp, jobField: [JobField.business, JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.BachmanAndAssociates, jobField: [JobField.business, JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.BladeIndustries, jobField: [JobField.business, JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.NWO, jobField: [JobField.business, JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.ClarkeIncorporated, jobField: [JobField.business, JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.OmniTekIncorporated, jobField: [JobField.business, JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.FourSigma, jobField: [JobField.business, JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.KuaiGongInternational, jobField: [JobField.business, JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.FulcrumTechnologies, jobField: [JobField.business, JobField.it, JobField.software] },
        { company: CompanyName.StormTechnologies, jobField: [JobField.business, JobField.softwareConsultant, JobField.security, JobField.software] },
        { company: CompanyName.DefComm, jobField: [JobField.it, JobField.softwareConsultant, JobField.software] },
        { company: CompanyName.HeliosLabs, jobField: [JobField.it, JobField.softwareConsultant, JobField.software] },
        { company: CompanyName.VitaLife, jobField: [JobField.business, JobField.it, JobField.softwareConsultant, JobField.software] },
        { company: CompanyName.IcarusMicrosystems, jobField: [JobField.business, JobField.it, JobField.softwareConsultant, JobField.software] },
        { company: CompanyName.UniversalEnergy, jobField: [JobField.business, JobField.it, JobField.softwareConsultant, JobField.software] },
        { company: CompanyName.GalacticCybersystems, jobField: [JobField.business, JobField.it, JobField.softwareConsultant, JobField.software] },
        { company: CompanyName.AeroCorp, jobField: [JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.OmniaCybersystems, jobField: [JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.SolarisSpaceSystems, jobField: [JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.DeltaOne, jobField: [JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.GlobalPharmaceuticals, jobField: [JobField.business, JobField.it, JobField.security, JobField.softwareConsultant, JobField.software] },
        { company: CompanyName.NovaMedical, jobField: [JobField.business, JobField.it, JobField.security, JobField.softwareConsultant, JobField.software] },
        { company: CompanyName.CIA, jobField: [JobField.agent, JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.NSA, jobField: [JobField.agent, JobField.it, JobField.security, JobField.software] },
        { company: CompanyName.WatchdogSecurity, jobField: [JobField.agent, JobField.it, JobField.security, JobField.softwareConsultant, JobField.software] },
        { company: CompanyName.LexoCorp, jobField: [JobField.business, JobField.it, JobField.softwareConsultant, JobField.security, JobField.software] },
        { company: CompanyName.RhoConstruction, jobField: [JobField.business, JobField.software] },
        { company: CompanyName.AlphaEnterprises, jobField: [JobField.business, JobField.softwareConsultant, JobField.software] },
        { company: CompanyName.Police, jobField: [JobField.security, JobField.software] },
        { company: CompanyName.SysCoreSecurities, jobField: [JobField.it, JobField.software] },
        { company: CompanyName.CompuTek, jobField: [JobField.it, JobField.software] },
        { company: CompanyName.NetLinkTechnologies, jobField: [JobField.it, JobField.software] },
        { company: CompanyName.CarmichaelSecurity, jobField: [JobField.agent, JobField.it, JobField.security, JobField.softwareConsultant, JobField.software] },
        { company: CompanyName.FoodNStuff, jobField: [JobField.employee] },
        { company: CompanyName.JoesGuns, jobField: [JobField.employee] },
        { company: CompanyName.OmegaSoftware, jobField: [JobField.it, JobField.softwareConsultant, JobField.software] },
        { company: CompanyName.NoodleBar, jobField: [JobField.waiter] },
    ];
}

export function GetBestJobField(ns: NS, company: CompanyName, person: Person): JobField {
    const jobs = CompaniesJobs(ns).find(x => x.company == company)?.jobField ?? [];

    const jobName = ns.getPlayer().jobs[company] as JobName

    const favour = ns.singularity.getCompanyFavor(company);

    const gains = jobs
        .map(job => {
            return { name: job, gain: ns.formulas.work.companyGains(person, company, jobName, favour) };
        })
        .reduce((a, b) => {
            if (a.gain.reputation > b.gain.reputation) {
                return a;
            }
            return b;
        })
    return gains.name;
}