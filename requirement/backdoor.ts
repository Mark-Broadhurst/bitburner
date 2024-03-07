import { NS } from "@ns";

export async function main(ns: NS) {
    ns.clearLog();
    ns.tail();
    const hostname = ns.args[0] as string;
    const server = ns.getServer(hostname);
    if(server.backdoorInstalled){
        return;
    }
    if(!server.hasAdminRights){

    }
    server.requiredHackingSkill
    ns.singularity.installBackdoor();
}