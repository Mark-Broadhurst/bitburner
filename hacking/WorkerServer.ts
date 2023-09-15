import { Server } from "@ns";

const scriptSize = 1.75;

export class WorkerServer {
    hostname: string;
    maxThreads: number;
    freeThreads: number;
    constructor(server: Server) {
        this.hostname = server.hostname;
        this.maxThreads = Math.floor(server.maxRam / scriptSize);
        this.freeThreads = Math.floor((server.maxRam - server.ramUsed) / scriptSize);
    }
    
}