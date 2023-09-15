export class GoalNode {
    level: number;
    core: number;
    ram: number;
    cache: number;
    constructor(level: number = 0, core: number = 0, ram: number = 0, cache: number = 0) {
        this.level = level;
        this.core = core;
        this.ram = ram;
        this.cache = cache;
    }
}