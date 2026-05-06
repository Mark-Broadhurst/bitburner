import { NS } from "@ns";

/**
 * Self-replicating darknet crawler.
 *
 * Each instance runs on one server. It probes nearby servers, cracks them
 * in parallel, then copies itself there and execs with preventDuplicates
 * so the crack naturally spreads across the network.
 *
 * Passwords are saved to passwords.txt and scp'd back to home for persistence.
 * Topology reporting removed (scan.ts is gone); mutationWatch handles re-seeding
 * after mutations so we don't need to re-spread to already-running instances.
 */

const PASSWORDS_FILE = "Darknet/passwords.txt";
const SELF           = "Darknet/crawler.js";

// Models where heartbleed won't add useful clues — skip the async call
const NO_HEARTBLEED_MODELS = new Set([
    "DeskMemo_3.1",
    "FreshInstall_1.0",
    "ZeroLogon",
    "Pr0verFl0",
    "OctantVoxel",
    "AccountsManager_4.2",
    "DeepGreen",   // uses interactive solver
    "NIL",         // uses interactive solver
    "BellaCuore",  // Roman numeral — data field contains the numeral, convert to decimal
]);

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    await localMaintenance(ns);

    while (true) {
        const passwords  = loadPasswords(ns);
        const probeHosts = ns.dnet.probe();

        // Crack all visible uncracked servers in parallel.
        // Each host is wrapped in try/catch so one failure doesn't abort the rest.
        const newPasswords = new Map<string, string>();
        await Promise.all(probeHosts.map(async host => {
            try {
                const auth = ns.dnet.getServerAuthDetails(host);
                if (!auth.isOnline || !auth.isConnectedToCurrentServer) return;
                if (auth.hasSession) return; // already cracked, handled below
                const pw = await crack(ns, host, auth, passwords);
                if (pw !== null) newPasswords.set(host, pw);
            } catch (e) {
                ns.tprint(`WARN crawler: exception cracking ${host}: ${e}`);
            }
        }));

        // Save new passwords and spread to newly cracked servers
        for (const [host, pw] of newPasswords) {
            await savePassword(ns, host, pw);
            await spread(ns, host);
        }

        // Re-spread to already-cracked servers in parallel.
        // preventDuplicates makes this a no-op if the crawler is still alive;
        // if the instance died (mutation restart, OOM, etc.) this revives it.
        await Promise.all(probeHosts.map(async host => {
            if (newPasswords.has(host)) return; // just handled above
            try {
                const auth = ns.dnet.getServerAuthDetails(host);
                if (!auth.isOnline || !auth.isConnectedToCurrentServer || !auth.hasSession) return;
                const pw = passwords[host];
                if (!pw) return;
                ns.dnet.connectToSession(host, pw);
                await spread(ns, host);
            } catch { /* skip — host may be momentarily unreachable */ }
        }));

        // Wait for topology to change, then do local maintenance
        await ns.dnet.nextMutation();
        await localMaintenance(ns);
    }
}

/**
 * Free blocked RAM and claim any cache files on the current server.
 * Called at startup and after each mutation.
 */
async function localMaintenance(ns: NS): Promise<void> {
    const hostname = ns.getHostname();
    if (!ns.dnet.isDarknetServer()) return; // home is not a darknet server

    const blocked = ns.dnet.getBlockedRam();
    if (blocked > 0) {
        const mr = await ns.dnet.memoryReallocation();
        if (mr.success) ns.tprint(`INFO crawler: ${hostname} freed ${blocked}GB blocked RAM`);
        else            ns.tprint(`WARN crawler: ${hostname} RAM release failed: ${mr.message}`);
    }

    for (const cacheFile of ns.ls(hostname, ".cache")) {
        const result = ns.dnet.openCache(cacheFile);
        if (result.success) ns.tprint(`INFO crawler: ${hostname} claimed cache ${cacheFile} (karma -${result.karmaLoss})`);
        else                ns.tprint(`WARN crawler: ${hostname} cache ${cacheFile} failed: ${result.message}`);
    }
}

/** Copy crawler to host and exec it (no-op if already running). */
async function spread(ns: NS, host: string): Promise<void> {
    const blocked = ns.dnet.getBlockedRam(host);
    if (blocked > 0) await ns.dnet.memoryReallocation(host);

    await ns.scp(SELF, host, "home");
    ns.exec(SELF, host, { preventDuplicates: true } as any);
}

/** Attempt to crack a server. Returns password or null. */
async function crack(
    ns: NS,
    host: string,
    auth: ReturnType<typeof ns.dnet.getServerAuthDetails>,
    passwords: Record<string, string>
): Promise<string | null> {
    const { passwordHint: hint, passwordFormat: format, passwordLength: length, data, modelId } = auth as any;

    // DeepGreen: Mastermind / Bulls-and-Cows interactive solver
    if (modelId === "DeepGreen" && format === "numeric" && length > 0) {
        const pw = await mastermindSolve(ns, host, length);
        if (pw !== null) ns.tprint(`SUCCESS crawler: ${host} [DeepGreen] password="${pw}"`);
        else ns.tprint(`INFO crawler: ${host} [DeepGreen] — Mastermind solver exhausted`);
        return pw;
    }

    // NIL: exact-position "yes/yesn't" feedback solver
    if (modelId === "NIL" && format === "numeric" && length > 0) {
        const pw = await nilSolve(ns, host, length);
        if (pw !== null) ns.tprint(`SUCCESS crawler: ${host} [NIL] password="${pw}"`);
        else ns.tprint(`INFO crawler: ${host} [NIL] — NIL solver exhausted`);
        return pw;
    }

    // Heartbleed for extra clues — skip for models that don't need it
    let logs: string[] = [];
    if (!NO_HEARTBLEED_MODELS.has(modelId ?? "") &&
        ns.getPlayer().skills.charisma >= ns.dnet.getServerRequiredCharismaLevel(host)) {
        const hb = await ns.dnet.heartbleed(host, { peek: true, logsToCapture: 10 });
        logs = hb.logs;
    }

    const candidates = buildCandidates(hint ?? "", data ?? "", format ?? "", length ?? 0, modelId ?? "", logs, passwords);

    for (const candidate of candidates) {
        const r = await ns.dnet.authenticate(host, candidate);
        if (r.data !== undefined) {
            ns.tprint(`INFO crawler: ${host} auth data = ${JSON.stringify(r.data)}`);
        }
        if (r.success) {
            ns.tprint(`SUCCESS crawler: ${host} [${modelId}] password="${candidate}"`);
            return candidate;
        }
    }

    ns.tprint(`INFO crawler: ${host} [${modelId}] — no candidate matched. Hint: "${hint}"  Format: ${format}[${length}]`);
    return null;
}

// ---------------------------------------------------------------------------
// Candidate generation
// ---------------------------------------------------------------------------

function buildCandidates(
    hint: string, data: string, format: string, length: number, modelId: string,
    logs: string[], passwords: Record<string, string>
): string[] {
    const c: string[] = [];

    // 1. Model-specific candidates first (highest confidence)
    c.push(...getModelCandidates(modelId, format, length));

    // 2. Empty password
    if (length === 0 || /there is no password|i didn't set a password|the pin is empty/i.test(hint)) {
        c.push("");
    }

    // 3. Model-specific hint-based extractions
    if (modelId === "DeskMemo_3.1") {
        // Password is always the last word of the hint ("It's set to 950", etc.)
        const lastWord = hint.trim().split(/\s+/).pop();
        if (lastWord) c.push(lastWord);
    }
    if (modelId === "Pr0verFl0") {
        // Any repeated character of the right length passes — classic overflow fill
        c.push("A".repeat(length));
    }
    if (modelId === "BellaCuore") {
        // Data field contains a Roman numeral; password is its decimal value
        // Hint also has it: "The password is the value of the number 'XXXVII'"
        const fromData = parseRomanNumeral(data);
        if (fromData !== null) c.push(String(fromData).padStart(length, "0"));
        const hintRoman = hint.match(/['"]([IVXLCDM]+)['"]/i);
        if (hintRoman) {
            const fromHint = parseRomanNumeral(hintRoman[1]);
            if (fromHint !== null) c.push(String(fromHint).padStart(length, "0"));
        }
    }

    // 4. "Remember to use 312" / "The password/key/secret/code/pin is X"
    const rememberMatch = hint.match(/remember to use (\S+)/i);
    if (rememberMatch) c.push(rememberMatch[1]);
    const plainMatch = hint.match(/(?:the (?:password|key|secret|code|pin) is|(?:password|key|secret|code|pin):)\s*(\S+)/i);
    if (plainMatch) {
        const val = plainMatch[1];
        const looksNumeric = /^\d+$/.test(val);
        const looksAlpha   = /^[a-zA-Z]+$/.test(val);
        if      (format === "numeric"      && looksNumeric) c.push(val.padStart(length, "0"));
        else if (format === "alphabetic"   && looksAlpha  ) c.push(val);
        else if (format === "alphanumeric" && /^[a-zA-Z0-9]+$/.test(val)) c.push(val);
        else if (!format) c.push(val);
    }

    // 5. "a number between X and Y"
    const rangeMatch = hint.match(/number between (\d+) and (\d+)/i);
    if (rangeMatch) {
        const lo = parseInt(rangeMatch[1]);
        const hi = parseInt(rangeMatch[2]);
        for (let i = lo; i <= hi; i++) {
            const s = String(i).padStart(length, "0");
            if (s.length === length) c.push(s);
        }
    }

    // 6. "divisible by 1" — brute force all zero-padded numbers
    if (/the password is divisible by 1/i.test(hint)) {
        const total = Math.pow(10, length);
        for (let i = 0; i < total; i++) c.push(String(i).padStart(length, "0"));
    }

    // 7. "the base N number M in base 10" — base conversion
    const baseMatch = hint.match(/the base (\d+) number (\S+) in base 10/i);
    if (baseMatch) {
        const converted = parseInt(baseMatch[2], parseInt(baseMatch[1]));
        if (!isNaN(converted)) c.push(String(converted).padStart(length, "0"));
    }
    if (!baseMatch && data) {
        const parts = data.split(",");
        if (parts.length === 2 && /^\d+$/.test(parts[0].trim()) && /^[0-9a-zA-Z]+$/.test(parts[1].trim())) {
            const converted = parseInt(parts[1].trim(), parseInt(parts[0].trim()));
            if (!isNaN(converted)) c.push(String(converted).padStart(length, "0"));
        }
    }

    // 8. For numeric format: extract all N-digit sequences from data (password may be embedded)
    if (format === "numeric" && length > 0 && data) {
        const matches = data.match(new RegExp(`\\d{${length}}`, "g")) ?? [];
        c.push(...matches);
    }

    // 9. Passwords seen in heartbleed logs
    for (const log of logs) {
        const m = log.match(/password[:\s=]+["']?(\S+?)["']?(\s|$)/i);
        if (m) c.push(m[1]);
    }

    // 9b. For Laika4: reorder model candidates so those containing hinted letters come first
    if (modelId === "Laika4" && logs.length > 0) {
        const hinted = new Set<string>();
        for (const log of logs) {
            for (const m of log.matchAll(/(?:theres?\s+a|maybe\s+a)\s+([a-z])/gi))
                hinted.add(m[1].toLowerCase());
        }
        if (hinted.size > 0) {
            const score = (p: string) => [...hinted].filter(l => p.includes(l)).length;
            c.sort((a, b) => score(b) - score(a));
        }
    }

    // 10. Known passwords from other servers (sometimes reused)
    c.push(...Object.values(passwords));

    // 11. Raw data / hint as last resort — only if length matches (avoids passing long JSON blobs)
    if (data && (length === 0 || data.length === length)) c.push(data);
    if (hint && (length === 0 || hint.length === length)) c.push(hint);

    return [...new Set(c)];
}

/**
 * Model-specific candidate generation.
 * Add entries here as you discover each model's password pattern in-game.
 */
function getModelCandidates(modelId: string, format: string, length: number): string[] {
    switch (modelId) {
        case "ZeroLogon":
            return length === 0 ? [""] : ["0".repeat(length)];

        case "Openwebaccesspoint":
        case "OpenWebAccessPoint":
            // Password leaked as N-digit number in data field — caught by numeric extraction above
            return [""];

        case "FreshInstall_1.0":
            // Confirmed: numeric-5 = "12345"
            return ["12345", "1234", "123456", ...defaultCandidates(format, length)]
                .filter(p => length === 0 || p.length === length);

        case "Factori-Os":
            // Uses variable hint patterns — fall through to hint-based logic
            return [];

        case "Laika4":
            // "It's my dog's name" — heartbleed leaks letter hints ("Theres a x, and maybe a m...")
            return [
                // 3-letter
                "max", "rex",
                // 4-letter
                "maxi", "roxy", "luna", "bear", "duke", "finn", "jake", "lola",
                "coco", "zeus", "beau", "toby", "ruby", "jack", "nova", "koda",
                "thor", "axel", "xena", "otto", "hugo", "odie", "toto", "fido",
                "spot", "lady",
                // 5-letter
                "maxie", "roxie", "laika", "belka", "buddy", "rocky", "bella",
                "molly", "daisy", "rufus", "scout", "sadie", "lucky", "bingo",
                "pluto", "astro", "tramp", "benji", "rover",
                // 6-letter
                "baxter", "cooper", "tucker", "harley", "ginger", "shadow", "diesel",
            ].filter(p => length === 0 || p.length === length);

        case "Pr0verFl0":
            // Password = repeated char for length — handled in buildCandidates (needs hint)
            return [];

        case "DeepGreen":
            // Mastermind — handled via interactive solver before candidate list
            return [];

        case "NIL":
            // Exact-position yes/yesn't feedback — handled via interactive solver
            return [];

        case "OctantVoxel":
            // Base-conversion — caught by baseMatch regex
            return [];

        case "BellaCuore":
            // Roman numeral in data/hint — handled in buildCandidates
            return [];

        case "CloudBlare(tm)":
        case "DeskMemo_3.1":
            // DeskMemo: last word of hint — caught above
            // CloudBlare: pattern not yet identified
            return [];

        default:
            return [];
    }
}

function parseRomanNumeral(s: string): number | null {
    const vals: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    const str = s.trim().toUpperCase();
    if (!str || !/^[IVXLCDM]+$/.test(str)) return null;
    let result = 0;
    for (let i = 0; i < str.length; i++) {
        const cur  = vals[str[i]];
        const next = vals[str[i + 1]] ?? 0;
        if (cur < next) result -= cur;
        else            result += cur;
    }
    return result > 0 ? result : null;
}

function defaultCandidates(format: string, length: number): string[] {
    switch (format) {
        case "numeric":
            return ["0".repeat(length), "1".repeat(length), "1234".slice(0, length).padEnd(length, "0")];
        case "alphabetic":
            return ["password", "admin", "secret", "letmein", "qwerty", "default"].filter(p => p.length === length);
        case "alphanumeric":
            return ["password1", "admin123", "default1", "abc12345"].filter(p => p.length === length);
        default:
            return [];
    }
}

// ---------------------------------------------------------------------------
// DeepGreen: Mastermind / Bulls-and-Cows solver
// ---------------------------------------------------------------------------

/**
 * Mastermind solver for DeepGreen.
 *
 * Opening strategy: guess "000", "111", ... "999" first.
 * Each tells us exactly how many of that digit appear in the code.
 * Once we know the digit multiset, the remaining pool is tiny and
 * filters down to the answer in very few additional guesses.
 */
async function mastermindSolve(ns: NS, host: string, length: number): Promise<string | null> {
    const total = Math.pow(10, length);
    let pool: string[] = [];
    for (let i = 0; i < total; i++) pool.push(String(i).padStart(length, "0"));

    const digitQueue = ["0","1","2","3","4","5","6","7","8","9"];

    while (pool.length > 0) {
        const guess = digitQueue.length > 0
            ? digitQueue.shift()!.repeat(length)
            : pool[0];

        const r = await ns.dnet.authenticate(host, guess);
        if (r.success) return guess;

        const fb = parseMastermindFeedback(r.data, r.message);
        if (fb === null) {
            ns.tprint(`WARN crawler: ${host} [DeepGreen] no feedback — data=${JSON.stringify(r.data)}  msg="${r.message}"`);
            return null;
        }

        pool = pool.filter(code => {
            const [bulls, cows] = scoreMastermind(guess, code);
            return bulls === fb.bulls && cows === fb.cows;
        });
    }
    return null;
}

function parseMastermindFeedback(data: unknown, message?: string): { bulls: number; cows: number } | null {
    if (typeof data === "string") {
        const parts = data.split(",");
        if (parts.length === 2) {
            const bulls = parseInt(parts[0].trim());
            const cows  = parseInt(parts[1].trim());
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

function scoreMastermind(guess: string, secret: string): [number, number] {
    let bulls = 0;
    const gRem: Record<string, number> = {};
    const sRem: Record<string, number> = {};
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === secret[i]) { bulls++; }
        else {
            gRem[guess[i]] = (gRem[guess[i]] ?? 0) + 1;
            sRem[secret[i]] = (sRem[secret[i]] ?? 0) + 1;
        }
    }
    let cows = 0;
    for (const d in gRem) cows += Math.min(gRem[d], sRem[d] ?? 0);
    return [bulls, cows];
}

// ---------------------------------------------------------------------------
// NIL: exact-position "yes" / "yesn't" feedback solver
// ---------------------------------------------------------------------------

async function nilSolve(ns: NS, host: string, length: number): Promise<string | null> {
    const total = Math.pow(10, length);
    let pool: string[] = [];
    for (let i = 0; i < total; i++) pool.push(String(i).padStart(length, "0"));

    while (pool.length > 0) {
        const guess = pool[0];
        const r = await ns.dnet.authenticate(host, guess);
        if (r.success) return guess;

        const feedback = parseNilFeedback(r.data);
        if (feedback === null) {
            ns.tprint(`WARN crawler: ${host} [NIL] no yes/yesn't feedback in r.data=${JSON.stringify(r.data)}`);
            return null;
        }

        pool = pool.filter(code => {
            for (let i = 0; i < Math.min(feedback.length, code.length); i++) {
                if ((code[i] === guess[i]) !== feedback[i]) return false;
            }
            return true;
        });
    }
    return null;
}

function parseNilFeedback(data: unknown): boolean[] | null {
    let parts: string[];
    if (typeof data === "string") {
        parts = data.split(",").map(s => s.trim());
    } else if (Array.isArray(data)) {
        parts = (data as unknown[]).map(String);
    } else {
        return null;
    }
    if (parts.length === 0) return null;
    if (!parts.every(p => p === "yes" || p === "yesn't")) return null;
    return parts.map(p => p === "yes");
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function firstNumber(obj: Record<string, unknown>, ...keys: string[]): number | null {
    for (const k of keys) if (typeof obj[k] === "number") return obj[k] as number;
    return null;
}

function loadPasswords(ns: NS): Record<string, string> {
    if (!ns.fileExists(PASSWORDS_FILE, "home")) return {};
    try { return JSON.parse(ns.read(PASSWORDS_FILE)); } catch { return {}; }
}

async function savePassword(ns: NS, host: string, password: string): Promise<void> {
    const stored = loadPasswords(ns);
    stored[host] = password;
    ns.write(PASSWORDS_FILE, JSON.stringify(stored, null, 2), "w");
    if (ns.getHostname() !== "home") await ns.scp(PASSWORDS_FILE, "home");
}
