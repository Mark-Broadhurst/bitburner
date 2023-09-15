import { NS, CompanyName, JobName } from "@ns";

export function CompaniesWithFactions(ns: NS): CompanyName[] {
    const CompanyName = ns.enums.CompanyName;
    return [
        CompanyName.BachmanAndAssociates,
        CompanyName.ECorp,
        CompanyName.MegaCorp,
        CompanyName.KuaiGongInternational,
        CompanyName.FourSigma,
        CompanyName.NWO,
        CompanyName.BladeIndustries,
        CompanyName.OmniTekIncorporated,
        CompanyName.ClarkeIncorporated,
        CompanyName.FulcrumTechnologies,
    ];
}

export function CompaniesJobs (ns:NS) : {name: CompanyName, type: JobName[]}[]  {
    const CompanyName = ns.enums.CompanyName;
    const JobName = ns.enums.JobName;
    return [
        { name: CompanyName.ECorp, type: [JobName.business0, JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.MegaCorp, type: [JobName.business0, JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.BachmanAndAssociates, type: [JobName.business0, JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.BladeIndustries, type: [JobName.business0, JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.NWO, type: [JobName.business0, JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.ClarkeIncorporated, type: [JobName.business0, JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.OmniTekIncorporated, type: [JobName.business0, JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.FourSigma, type: [JobName.business0, JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.KuaiGongInternational, type: [JobName.business0, JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.FulcrumTechnologies, type: [JobName.business0, JobName.IT0, JobName.software0] },
        { name: CompanyName.StormTechnologies, type: [JobName.business0, JobName.softwareConsult0, JobName.security0, JobName.software0] },
        { name: CompanyName.DefComm, type: [JobName.IT0, JobName.softwareConsult0, JobName.software0] },
        { name: CompanyName.HeliosLabs, type: [JobName.IT0, JobName.softwareConsult0, JobName.software0] },
        { name: CompanyName.VitaLife, type: [JobName.business0, JobName.IT0, JobName.softwareConsult0, JobName.software0] },
        { name: CompanyName.IcarusMicrosystems, type: [JobName.business0, JobName.IT0, JobName.softwareConsult0, JobName.software0] },
        { name: CompanyName.UniversalEnergy, type: [JobName.business0, JobName.IT0, JobName.softwareConsult0, JobName.software0] },
        { name: CompanyName.GalacticCybersystems, type: [JobName.business0, JobName.IT0, JobName.softwareConsult0, JobName.software0] },
        { name: CompanyName.AeroCorp, type: [JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.OmniaCybersystems, type: [JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.SolarisSpaceSystems, type: [JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.DeltaOne, type: [JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.GlobalPharmaceuticals, type: [JobName.business0, JobName.IT0, JobName.security0, JobName.softwareConsult0, JobName.software0] },
        { name: CompanyName.NovaMedical, type: [JobName.business0, JobName.IT0, JobName.security0, JobName.softwareConsult0, JobName.software0] },
        { name: CompanyName.CIA, type: [JobName.agent0, JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.NSA, type: [JobName.agent0, JobName.IT0, JobName.security0, JobName.software0] },
        { name: CompanyName.WatchdogSecurity, type: [JobName.agent0, JobName.IT0, JobName.security0, JobName.softwareConsult0, JobName.software0] },
        { name: CompanyName.LexoCorp, type: [JobName.business0, JobName.IT0, JobName.softwareConsult0, JobName.security0, JobName.software0] },
        { name: CompanyName.RhoConstruction, type: [JobName.business0, JobName.software0] },
        { name: CompanyName.AlphaEnterprises, type: [JobName.business0, JobName.softwareConsult0, JobName.software0] },
        { name: CompanyName.Police, type: [JobName.security0, JobName.software0] },
        { name: CompanyName.SysCoreSecurities, type: [JobName.IT0, JobName.software0] },
        { name: CompanyName.CompuTek, type: [JobName.IT0, JobName.software0] },
        { name: CompanyName.NetLinkTechnologies, type: [JobName.IT0, JobName.software0] },
        { name: CompanyName.CarmichaelSecurity, type: [JobName.agent0, JobName.IT0, JobName.security0, JobName.softwareConsult0, JobName.software0] },
        { name: CompanyName.FoodNStuff, type: [JobName.employee] },
        { name: CompanyName.JoesGuns, type: [JobName.employee] },
        { name: CompanyName.OmegaSoftware, type: [JobName.IT0, JobName.softwareConsult0, JobName.software0] },
        { name: CompanyName.NoodleBar, type: [JobName.waiter] },
    ];

}