import { NS } from "@ns";

/**
 * Self-replicating darknet crawler.
 *
 * Each instance runs on one server. It probes nearby servers, cracks them,
 * then copies itself there and execs with preventDuplicates so the crawler
 * spreads across the network. After each mutation everything re-cracks fresh.
 */

const SELF       = "Darknet/crawler.js";
const MAX_EVENTS = 30;

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

const eventLog: string[] = [];

function log(ns: NS, msg: string): void {
    const host = ns.getHostname();
    const line = `[${host}] ${msg}`;
    eventLog.push(line);
    if (eventLog.length > MAX_EVENTS) eventLog.shift();

    if (host !== "home") {
        const file = `Darknet/events_${host.replace(/\W/g, "_")}.txt`;
        ns.write(file, eventLog.join("\n"), "w");
        ns.scp(file, "home");
    }
}

function readRemoteEvents(ns: NS): string[] {
    return ns.ls("home", "Darknet/events_").flatMap(f =>
        ns.read(f).split("\n").filter(Boolean)
    );
}

// ---------------------------------------------------------------------------
// Crack context
// ---------------------------------------------------------------------------

interface CrackCtx {
    ns:      NS;
    host:    string;
    modelId: string;
    hint:    string;
    data:    string;
    format:  string;
    length:  number;
}

type CrackerFn = (ctx: CrackCtx) => Promise<string[]>;

// ---------------------------------------------------------------------------
// Heartbleed helper
// ---------------------------------------------------------------------------

async function heartbleed(ctx: CrackCtx): Promise<string[]> {
    if (ctx.ns.getPlayer().skills.charisma < ctx.ns.dnet.getServerRequiredCharismaLevel(ctx.host))
        return [];
    const hb = await ctx.ns.dnet.heartbleed(ctx.host, { peek: true, logsToCapture: 10 });
    return hb.logs;
}

// ---------------------------------------------------------------------------
// Model crackers — each is self-contained, calls heartbleed if it needs it
// ---------------------------------------------------------------------------

async function zeroLogon(ctx: CrackCtx): Promise<string[]> {
    return ctx.length === 0 ? [""] : ["0".repeat(ctx.length)];
}

async function freshInstall(ctx: CrackCtx): Promise<string[]> {
    return [
        "12345", "1234", "123456", "0000", "00000", "000000",
        "admin", "guest", "login", "user", "test",
        "password", "sunshine", "princess", "iloveyou", "computer",
        "security", "internet", "baseball", "football", "skeleton",
        "welcome", "letmein", "default", "dragon", "monkey", "master",
        "shadow", "michael", "superman", "batman",
        "password1", "abc12345", "admin123",
    ].filter(p => ctx.length === 0 || p.length === ctx.length);
}

async function deskMemo(ctx: CrackCtx): Promise<string[]> {
    const lastWord = ctx.hint.trim().split(/\s+/).pop();
    return lastWord ? [lastWord] : [];
}

async function cloudBlare(ctx: CrackCtx): Promise<string[]> {
    const digits = (ctx.data.match(/\d/g) ?? []).join("");
    if (digits.length === ctx.length) return [digits];
    if (digits.length > ctx.length)   return [digits.slice(0, ctx.length)];
    return [];
}

async function pr0verFl0(ctx: CrackCtx): Promise<string[]> {
    return ["a".repeat(ctx.length * 2)];
}

async function bellaCuore(ctx: CrackCtx): Promise<string[]> {
    const results: string[] = [];
    const fromData = parseRomanNumeral(ctx.data);
    if (fromData !== null) results.push(String(fromData).padStart(ctx.length, "0"));
    const m = ctx.hint.match(/['"]([IVXLCDM]+)['"]/i);
    if (m) {
        const fromHint = parseRomanNumeral(m[1]);
        if (fromHint !== null) results.push(String(fromHint).padStart(ctx.length, "0"));
    }
    return results;
}

async function laika4(ctx: CrackCtx): Promise<string[]> {
    const logs = await heartbleed(ctx);
    const names = [
        "max", "rex",
        "maxi", "roxy", "luna", "bear", "duke", "finn", "jake", "lola",
        "coco", "zeus", "beau", "toby", "ruby", "jack", "nova", "koda",
        "thor", "axel", "xena", "otto", "hugo", "odie", "toto", "fido",
        "spot", "lady",
        "maxie", "roxie", "laika", "belka", "buddy", "rocky", "bella",
        "molly", "daisy", "rufus", "scout", "sadie", "lucky", "bingo",
        "pluto", "astro", "tramp", "benji", "rover",
        "baxter", "cooper", "tucker", "harley", "ginger", "shadow", "diesel",
    ].filter(p => ctx.length === 0 || p.length === ctx.length);

    const hinted = new Set<string>();
    for (const line of logs)
        for (const m of line.matchAll(/(?:theres?\s+a|maybe\s+a)\s+([a-z])/gi))
            hinted.add(m[1].toLowerCase());
    if (hinted.size > 0) {
        const score = (p: string) => [...hinted].filter(l => p.includes(l)).length;
        names.sort((a, b) => score(b) - score(a));
    }
    return names;
}

async function octantVoxel(ctx: CrackCtx): Promise<string[]> {
    return baseConversionCandidates(ctx.hint, ctx.data, ctx.length);
}

async function factoriOs(ctx: CrackCtx): Promise<string[]> {
    const m = ctx.hint.match(/divisible by (\d+)/i);
    if (!m) return [];
    const divisor = parseInt(m[1]);
    if (divisor === 0) return [];
    const results: string[] = [];
    const max = Math.pow(10, ctx.length);
    for (let i = 0; i < max; i++)
        if (i % divisor === 0) results.push(String(i).padStart(ctx.length, "0"));
    return results;
}

async function openWebAccessPoint(_ctx: CrackCtx): Promise<string[]> { return [""]; }

async function accountsManager(_ctx: CrackCtx): Promise<string[]> { return []; }  // handled interactively

async function kingOfTheHill(ctx: CrackCtx): Promise<string[]> {
    const logs = await heartbleed(ctx);
    if (logs.length === 0) {
        const charisma = ctx.ns.getPlayer().skills.charisma;
        const required = ctx.ns.dnet.getServerRequiredCharismaLevel(ctx.host);
        log(ctx.ns, `[KingOfTheHill] ${ctx.host} — heartbleed empty (charisma ${charisma}/${required})`);
        return [];
    }
    for (const line of logs) {
        const m = line.match(/I think (\d+) with \1 is key/i);
        if (m) return [m[1].padStart(ctx.length, "0")];
    }
    log(ctx.ns, `[KingOfTheHill] ${ctx.host} — no key phrase in logs: ${JSON.stringify(logs)}`);
    return [];
}

async function rateMyPix(_ctx: CrackCtx): Promise<string[]> { return []; }  // handled interactively

async function php54(ctx: CrackCtx): Promise<string[]> {
    const match = ctx.hint.match(/shuffled\s+(\d+)/i);
    const digits = match?.[1] ?? ctx.data;
    if (!digits) return [];
    return [...new Set(permutations(digits))].filter(p => ctx.length === 0 || p.length === ctx.length);
}

// ---------------------------------------------------------------------------
// Dispatch map
// ---------------------------------------------------------------------------

const MODELS: Record<string, CrackerFn> = {
    "ZeroLogon":           zeroLogon,
    "FreshInstall_1.0":    freshInstall,
    "DeskMemo_3.1":        deskMemo,
    "CloudBlare(tm)":      cloudBlare,
    "Pr0verFl0":           pr0verFl0,
    "BellaCuore":          bellaCuore,
    "OctantVoxel":         octantVoxel,
    "Factori-Os":          factoriOs,
    "OpenWebAccessPoint":  openWebAccessPoint,
    "Openwebaccesspoint":  openWebAccessPoint,
    "AccountsManager_4.2": accountsManager,
    "KingOfTheHill":       kingOfTheHill,
    "RateMyPix.Auth":      rateMyPix,
    "PHP 5.4":             php54,
    "Laika4":              laika4,
    "(The Labyrinth)":     async (_ctx) => [],  // interactive solver handles it
};

// ---------------------------------------------------------------------------
// Candidate assembly
// ---------------------------------------------------------------------------

async function buildCandidates(ctx: CrackCtx): Promise<string[]> {
    if (!(ctx.modelId in MODELS)) {
        throw new Error(
            `Unknown model "${ctx.modelId}" on ${ctx.host} — ` +
            `format=${ctx.format}[${ctx.length}]  hint="${ctx.hint}"  data="${ctx.data}"`
        );
    }
    return [...new Set(await MODELS[ctx.modelId](ctx))];
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");

    const onHome = ns.getHostname() === "home";
    if (onHome) {
        ns.ui.openTail();
        ns.ui.resizeTail(720, 600);
    }

    await localMaintenance(ns);

    while (true) {
        try {
            const probeHosts = ns.dnet.probe();

            if (onHome) {
                ns.clearLog();
                ns.print(`Visible: ${probeHosts.length}   Host: ${ns.getHostname()}`);
                ns.print("─".repeat(64));
            }

            for (const host of probeHosts) {
                try {
                    const auth = (ns.dnet as any).getServerDetails(host);

                    if (!auth.isOnline) {
                        if (onHome) ns.print(`  ${host.padEnd(20)} offline`);
                        continue;
                    }
                    if (!auth.isConnectedToCurrentServer) {
                        if (onHome) ns.print(`  ${host.padEnd(20)} not connected`);
                        continue;
                    }

                    if (auth.hasSession) {
                        if (onHome) ns.print(`  ${host.padEnd(20)} ✅ session — spreading`);
                        await spread(ns, host);
                        continue;
                    }

                    const modelId = auth.modelId ?? "?";
                    if (onHome) ns.print(`  ${host.padEnd(20)} 🔓 [${modelId}] ${auth.passwordFormat}[${auth.passwordLength}]  hint="${auth.passwordHint}"`);

                    const pw = await crack(ns, host, auth);
                    if (pw === null) {
                        if (onHome) ns.print(`  ${host.padEnd(20)} ❌ crack failed`);
                        else log(ns, `❌ crack failed: ${host}`);
                        continue;
                    }

                    await spread(ns, host);
                    if (onHome) ns.print(`  ${host.padEnd(20)} ✅ cracked! pw="${pw}"`);
                } catch (e) {
                    if (onHome) ns.print(`  ${host.padEnd(20)} ⚠ ${e}`);
                    else log(ns, `⚠ ${host}: ${e}`);
                }
            }

            if (onHome) {
                const remoteEvents = readRemoteEvents(ns);
                if (remoteEvents.length > 0) {
                    ns.print("─".repeat(64));
                    ns.print("Remote crawler events:");
                    for (const line of remoteEvents.slice(-15)) ns.print(`  ${line}`);
                }
                ns.print("─".repeat(64));
                ns.print("Waiting for next mutation...");
            }

            await ns.dnet.nextMutation();
            await localMaintenance(ns);
        } catch (e) {
            if (onHome) {
                ns.clearLog();
                ns.print(`⚠️ LOOP ERROR: ${e}`);
                ns.print("Retrying in 5s...");
            } else {
                log(ns, `⚠ LOOP ERROR: ${e}`);
            }
            await ns.sleep(5_000);
        }
    }
}

// ---------------------------------------------------------------------------
// Crack a single server
// ---------------------------------------------------------------------------

async function crack(ns: NS, host: string, auth: any): Promise<string | null> {
    const modelId = auth.modelId ?? "?";
    const ctx: CrackCtx = {
        ns,
        host,
        modelId,
        hint:   auth.passwordHint  ?? "",
        data:   auth.data           ?? "",
        format: auth.passwordFormat ?? "",
        length: auth.passwordLength ?? 0,
    };

    if (modelId === "(The Labyrinth)") {
        if (!acquireLock(ns, host)) { log(ns, `⏭ [(The Labyrinth)] ${host} — another crawler is solving`); return null; }
        try {
            const solved = await labyrinthSolve(ns, host);
            if (!solved) log(ns, `❌ [(The Labyrinth)] ${host} — maze unsolvable`);
            return solved ? "__navigated__" : null;
        } finally { releaseLock(ns, host); }
    }

    if (modelId === "DeepGreen" && ctx.format === "numeric" && ctx.length > 0) {
        if (!acquireLock(ns, host)) { log(ns, `⏭ [DeepGreen] ${host} — another crawler is solving`); return null; }
        try {
            const pw = await mastermindSolve(ns, host, ctx.length);
            if (pw === null) log(ns, `❌ [DeepGreen] ${host} solver exhausted`);
            return pw;
        } finally { releaseLock(ns, host); }
    }

    if (modelId === "NIL" && ctx.format === "numeric" && ctx.length > 0) {
        if (!acquireLock(ns, host)) { log(ns, `⏭ [NIL] ${host} — another crawler is solving`); return null; }
        try {
            const pw = await nilSolve(ns, host, ctx.length);
            if (pw === null) log(ns, `❌ [NIL] ${host} solver exhausted`);
            return pw;
        } finally { releaseLock(ns, host); }
    }

    if (modelId === "AccountsManager_4.2" && ctx.format === "numeric" && ctx.length > 0) {
        if (!acquireLock(ns, host)) { log(ns, `⏭ [AccountsManager_4.2] ${host} — another crawler is solving`); return null; }
        try {
            const pw = await accountsManagerSolve(ns, host, ctx.length);
            if (pw === null) log(ns, `❌ [AccountsManager_4.2] ${host} solver failed`);
            return pw;
        } finally { releaseLock(ns, host); }
    }

    if (modelId === "Factori-Os" && ctx.format === "numeric" && ctx.length > 0) {
        if (!acquireLock(ns, host)) { log(ns, `⏭ [Factori-Os] ${host} — another crawler is solving`); return null; }
        try {
            const pw = await factoriOsSolve(ns, host, ctx.length);
            if (pw === null) log(ns, `❌ [Factori-Os] ${host} solver failed`);
            return pw;
        } finally { releaseLock(ns, host); }
    }

    if (modelId === "RateMyPix.Auth" && ctx.format === "numeric" && ctx.length > 0) {
        if (!acquireLock(ns, host)) { log(ns, `⏭ [RateMyPix.Auth] ${host} — another crawler is solving`); return null; }
        try {
            const pw = await rateMyPixSolve(ns, host, ctx.length);
            if (pw === null) log(ns, `❌ [RateMyPix.Auth] ${host} solver failed`);
            return pw;
        } finally { releaseLock(ns, host); }
    }

    const candidates = await buildCandidates(ctx);

    for (const candidate of candidates) {
        const r = await ns.dnet.authenticate(host, candidate);
        if (r.success) return candidate;
    }

    log(ns, `❌ [${modelId}] ${host} — no match. hint="${ctx.hint}" format=${ctx.format}[${ctx.length}] data="${ctx.data}"`);
    return null;
}

// ---------------------------------------------------------------------------
// Interactive solver lock — prevents multiple crawlers racing on same host
// ---------------------------------------------------------------------------

function acquireLock(ns: NS, host: string): boolean {
    const lockFile = `Darknet/lock_${host.replace(/\W/g, "_")}.txt`;
    const me = ns.getHostname();
    // If another crawler already holds the lock, back off
    const held = ns.read(lockFile);
    if (held && held !== me) return false;
    ns.write(lockFile, me, "w");
    return true;
}

function releaseLock(ns: NS, host: string): void {
    ns.rm(`Darknet/lock_${host.replace(/\W/g, "_")}.txt`);
}

// ---------------------------------------------------------------------------
// Spread / maintenance
// ---------------------------------------------------------------------------

async function spread(ns: NS, host: string): Promise<void> {
    const blocked = ns.dnet.getBlockedRam(host);
    if (blocked > 0) await ns.dnet.memoryReallocation(host);
    await ns.scp(SELF, host, "home");
    ns.exec(SELF, host, { preventDuplicates: true } as any);
}

async function localMaintenance(ns: NS): Promise<void> {
    if (!ns.dnet.isDarknetServer()) return;
    const hostname = ns.getHostname();

    const blocked = ns.dnet.getBlockedRam();
    if (blocked > 0) {
        const mr = await ns.dnet.memoryReallocation();
        if (mr.success) log(ns, `freed ${blocked}GB blocked RAM on ${hostname}`);
        else            log(ns, `RAM release failed on ${hostname}: ${mr.message}`);
    }

    for (const cacheFile of ns.ls(hostname, ".cache")) {
        const result = ns.dnet.openCache(cacheFile);
        if (result.success) log(ns, `claimed cache ${cacheFile} on ${hostname} (karma -${result.karmaLoss})`);
        else                log(ns, `cache ${cacheFile} failed on ${hostname}: ${result.message}`);
    }
}

// ---------------------------------------------------------------------------
// (The Labyrinth): DFS maze solver
// ---------------------------------------------------------------------------

async function labyrinthSolve(ns: NS, host: string): Promise<boolean> {
    let state: any;
    try {
        state = await (ns.dnet as any).labreport(host);
    } catch (e) {
        log(ns, `[(The Labyrinth)] ${host} — labreport failed: ${e}`);
        return false;
    }

    if (!state?.coords) {
        log(ns, `[(The Labyrinth)] ${host} — unexpected labreport: ${JSON.stringify(state)}`);
        return false;
    }

    const visited = new Set<string>();
    const MOVES = [
        { cmd: "go north", back: "go south", dx:  0, dy: -1, flag: "north" },
        { cmd: "go east",  back: "go west",  dx:  1, dy:  0, flag: "east"  },
        { cmd: "go south", back: "go north", dx:  0, dy:  1, flag: "south" },
        { cmd: "go west",  back: "go east",  dx: -1, dy:  0, flag: "west"  },
    ];

    const dfs = async (coords: [number, number]): Promise<boolean> => {
        const key = `${coords[0]},${coords[1]}`;
        if (visited.has(key)) return false;
        visited.add(key);

        const report = await (ns.dnet as any).labreport(host);
        if (!report?.success) return false;

        for (const { cmd, back, dx, dy, flag } of MOVES) {
            if (!report[flag]) continue;
            const r = await ns.dnet.authenticate(host, cmd);
            if (r.success) return true;
            const next: [number, number] = [coords[0] + dx, coords[1] + dy];
            if (await dfs(next)) return true;
            await ns.dnet.authenticate(host, back);
        }
        return false;
    };

    return await dfs(state.coords as [number, number]);
}

// ---------------------------------------------------------------------------
// DeepGreen: Mastermind solver
// ---------------------------------------------------------------------------

async function mastermindSolve(ns: NS, host: string, length: number): Promise<string | null> {
    // Phase 1: probe "dddd" for each digit — bulls == exact count of d in the password
    // (every guess position is d, so any d in the secret at any position is a bull)
    log(ns, `[DeepGreen] ${host} — phase 1: probing digit counts`);
    const digitCounts = new Array(10).fill(0);
    let knownTotal = 0;

    for (let d = 0; d <= 9 && knownTotal < length; d++) {
        const guess = String(d).repeat(length);
        const r = await ns.dnet.authenticate(host, guess);
        if (r.success) return guess;

        const fb = parseMastermindFeedback(r.data, r.message);
        if (fb === null) {
            log(ns, `[DeepGreen] ${host} — no feedback. data(${typeof r.data})=${JSON.stringify(r.data)} msg=${JSON.stringify(r.message)}`);
            return null;
        }
        digitCounts[d] = fb.bulls;
        knownTotal += fb.bulls;
        log(ns, `[DeepGreen] ${host} — probe "${guess}" → ${fb.bulls} '${d}'s (${knownTotal}/${length} known)`);
    }

    // Build the digit multiset from the counts
    const digitList: string[] = [];
    for (let d = 0; d <= 9; d++)
        for (let i = 0; i < digitCounts[d]; i++)
            digitList.push(String(d));

    log(ns, `[DeepGreen] ${host} — phase 2: permutations of [${digitList.join("")}]`);

    // Phase 2: try every unique permutation of those digits
    const seen = new Set<string>();
    for (const perm of permutations(digitList.join(""))) {
        if (seen.has(perm)) continue;
        seen.add(perm);
        const r = await ns.dnet.authenticate(host, perm);
        if (r.success) return perm;
    }
    return null;
}

function parseMastermindFeedback(data: unknown, message?: string): { bulls: number; cows: number } | null {
    if (typeof data === "string") {
        const parts = data.split(",");
        if (parts.length === 2) {
            const bulls = parseInt(parts[0].trim()), cows = parseInt(parts[1].trim());
            if (!isNaN(bulls) && !isNaN(cows)) return { bulls, cows };
        }
    }
    if (data && typeof data === "object") {
        const d = data as Record<string, unknown>;
        const bulls = firstNumber(d, "bulls", "correct", "exact", "rightPosition", "hits");
        const cows  = firstNumber(d, "cows", "misplaced", "partial", "present", "blows");
        if (bulls !== null && cows !== null) return { bulls, cows };
    }
    if (message) {
        const m = message.match(/(\d+)\s+symbols?\s+(?:are\s+)?match\s+exactly.*?(\d+)\s+symbols?\s+match\s+but\s+are\s+in\s+the\s+wrong\s+place/i);
        if (m) return { bulls: parseInt(m[1]), cows: parseInt(m[2]) };
        const m2 = message.match(/(\d+)[^,\d]*exact[^,\d]*,?[^,\d]*(\d+)[^,\d]*wrong\s+place/i);
        if (m2) return { bulls: parseInt(m2[1]), cows: parseInt(m2[2]) };
    }
    return null;
}


// ---------------------------------------------------------------------------
// NIL: yes/yesn't solver
// ---------------------------------------------------------------------------

async function nilSolve(ns: NS, host: string, length: number): Promise<string | null> {
    let pool: string[] = [];
    for (let i = 0; i < Math.pow(10, length); i++) pool.push(String(i).padStart(length, "0"));

    log(ns, `[NIL] ${host} — starting, pool=${pool.length}`);

    while (pool.length > 0) {
        const guess = pool[0];
        const r = await ns.dnet.authenticate(host, guess);
        if (r.success) return guess;

        const feedback = parseNilFeedback(r.data);
        if (feedback === null) {
            const raw = JSON.stringify(r.data);
            const codes = raw.split("").map(c => c.charCodeAt(0).toString(16)).join(" ");
            log(ns, `[NIL] ${host} — can't parse feedback, raw: ${raw}`);
            log(ns, `[NIL] ${host} — char codes: ${codes}`);
            return null;
        }

        const before = pool.length;
        pool = pool.filter(code => {
            for (let i = 0; i < Math.min(feedback.length, code.length); i++)
                if ((code[i] === guess[i]) !== feedback[i]) return false;
            return true;
        });
        log(ns, `[NIL] ${host} — guess="${guess}" fb=[${feedback.map(b => b ? "y" : "n").join(",")}] pool:${before}→${pool.length}`);
    }
    return null;
}

// ---------------------------------------------------------------------------
// Factori-Os: divisibility constraint solver
// ---------------------------------------------------------------------------

async function factoriOsSolve(ns: NS, host: string, length: number): Promise<string | null> {
    // Build pool of all length-digit numbers
    let pool: number[] = [];
    for (let i = 0; i < Math.pow(10, length); i++) pool.push(i);

    // Small primes to use as probes — each splits the pool by divisibility
    const probes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    log(ns, `[Factori-Os] ${host} — starting, pool=${pool.length}`);

    while (pool.length > 1) {
        // Pick the probe that most evenly splits the remaining pool, else fall back to pool[0]
        let guess: number;
        const bestProbe = probes.find(p => {
            const divCount = pool.filter(n => n % p === 0).length;
            return divCount > 0 && divCount < pool.length;
        });
        if (bestProbe !== undefined) {
            probes.splice(probes.indexOf(bestProbe), 1);
            guess = bestProbe;
        } else {
            guess = pool[0];
        }

        const guessStr = String(guess).padStart(length, "0");
        const r = await ns.dnet.authenticate(host, guessStr);
        if (r.success) return guessStr;

        // r.data = true means password IS divisible by guess
        const divisible = r.data === true;
        const before = pool.length;
        pool = pool.filter(n => n !== guess && (n % guess === 0) === divisible);
        log(ns, `[Factori-Os] ${host} — probe=${guessStr} divisible=${divisible} pool:${before}→${pool.length}`);
    }

    if (pool.length === 1) {
        const final = String(pool[0]).padStart(length, "0");
        const r = await ns.dnet.authenticate(host, final);
        if (r.success) return final;
    }
    return null;
}

// ---------------------------------------------------------------------------
// AccountsManager_4.2: Higher / Lower binary search
// ---------------------------------------------------------------------------

async function accountsManagerSolve(ns: NS, host: string, length: number): Promise<string | null> {
    const max = Math.pow(10, length) - 1;
    let lo = 0, hi = max;
    log(ns, `[AccountsManager_4.2] ${host} — binary search 0..${max}`);

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const guess = String(mid).padStart(length, "0");
        const r = await ns.dnet.authenticate(host, guess);
        if (r.success) return guess;

        const fb = ((typeof r.data === "string" ? r.data : "") || (typeof r.message === "string" ? r.message : "")).toLowerCase();
        if (fb.includes("higher")) {
            log(ns, `[AccountsManager_4.2] ${host} — guess=${guess} → Higher (lo=${mid+1})`);
            lo = mid + 1;
        } else if (fb.includes("lower")) {
            log(ns, `[AccountsManager_4.2] ${host} — guess=${guess} → Lower (hi=${mid-1})`);
            hi = mid - 1;
        } else {
            log(ns, `[AccountsManager_4.2] ${host} — unexpected feedback: data=${JSON.stringify(r.data)} message=${JSON.stringify(r.message)}`);
            return null;
        }
    }
    return null;
}

// ---------------------------------------------------------------------------
// RateMyPix.Auth: chilli-count solver
// ---------------------------------------------------------------------------
// Each authentication response contains 🌶️ × score where score is the number
// of digits in the guess that are at the correct position.  Pool-filtering
// works the same way as the NIL solver but uses a count instead of per-digit
// booleans.

async function rateMyPixSolve(ns: NS, host: string, length: number): Promise<string | null> {
    let pool: string[] = [];
    for (let i = 0; i < Math.pow(10, length); i++)
        pool.push(String(i).padStart(length, "0"));

    log(ns, `[RateMyPix.Auth] ${host} — starting, pool=${pool.length}`);

    while (pool.length > 1) {
        const guess = pool[0];
        const r     = await ns.dnet.authenticate(host, guess);
        if (r.success) return guess;

        const score = parseChilliScore(r.data, r.message);
        if (score === null) {
            log(ns, `[RateMyPix.Auth] ${host} — can't parse feedback: data=${JSON.stringify(r.data)} msg=${JSON.stringify(r.message)}`);
            return null;
        }

        const before = pool.length;
        pool = pool.filter(candidate => {
            let matches = 0;
            for (let i = 0; i < length; i++)
                if (candidate[i] === guess[i]) matches++;
            return matches === score;
        });
        log(ns, `[RateMyPix.Auth] ${host} — guess="${guess}" 🌶️×${score} pool:${before}→${pool.length}`);
    }

    if (pool.length === 1) {
        const r = await ns.dnet.authenticate(host, pool[0]);
        if (r.success) return pool[0];
        log(ns, `[RateMyPix.Auth] ${host} — final guess ${pool[0]} rejected`);
    }
    return null;
}

/** Count the number of 🌶️ chilli emojis (or parse a numeric X/N pattern) in the feedback. */
function parseChilliScore(data: unknown, message?: string): number | null {
    const text = (typeof data === "string" ? data : "")
              || (typeof message === "string" ? message : "");
    if (!text) return null;

    // Primary: count chilli emoji occurrences
    const chillis = text.match(/🌶/g);
    if (chillis !== null) return chillis.length;

    // Fallback: numeric "X/N" pattern
    const m = text.match(/(\d+)\s*\/\s*\d+/);
    if (m) return parseInt(m[1]);

    return null;
}

function parseNilFeedback(data: unknown): boolean[] | null {
    let parts: string[];
    if (typeof data === "string")  parts = data.split(",").map(s => s.trim());
    else if (Array.isArray(data))  parts = (data as unknown[]).map(String);
    else                           return null;
    if (parts.length === 0) return null;
    // Normalize curly/smart apostrophes (U+2018–U+201B) to straight ASCII
    parts = parts.map(p => p.replace(/[‘’‚‛]/g, "'").trim());
    if (!parts.every(p => p === "yes" || p === "yesn't")) return null;
    return parts.map(p => p === "yes");
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function parseRomanNumeral(s: string): number | null {
    const vals: Record<string, number> = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
    const str = s.trim().toUpperCase();
    if (!str || !/^[IVXLCDM]+$/.test(str)) return null;
    let result = 0;
    for (let i = 0; i < str.length; i++) {
        const cur = vals[str[i]], next = vals[str[i+1]] ?? 0;
        result += cur < next ? -cur : cur;
    }
    return result > 0 ? result : null;
}

function baseConversionCandidates(hint: string, data: string, length: number): string[] {
    const results: string[] = [];
    const hintMatch = hint.match(/the base (\d+) number (\S+) in base 10/i);
    if (hintMatch) {
        const v = parseInt(hintMatch[2], parseInt(hintMatch[1]));
        if (!isNaN(v)) results.push(String(v).padStart(length, "0"));
    }
    if (!hintMatch && data) {
        const parts = data.split(",");
        if (parts.length === 2 && /^\d+$/.test(parts[0].trim()) && /^[0-9a-zA-Z]+$/.test(parts[1].trim())) {
            const v = parseInt(parts[1].trim(), parseInt(parts[0].trim()));
            if (!isNaN(v)) results.push(String(v).padStart(length, "0"));
        }
    }
    return results;
}

function permutations(s: string): string[] {
    if (s.length <= 1) return [s];
    const result: string[] = [];
    for (let i = 0; i < s.length; i++) {
        const rest = s.slice(0, i) + s.slice(i + 1);
        for (const p of permutations(rest)) result.push(s[i] + p);
    }
    return result;
}

function firstNumber(obj: Record<string, unknown>, ...keys: string[]): number | null {
    for (const k of keys) if (typeof obj[k] === "number") return obj[k] as number;
    return null;
}
