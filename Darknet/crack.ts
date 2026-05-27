import { NS } from "@ns";

const PASSWORDS_FILE = "Darknet/passwords.txt";
const SCRIPT         = "Darknet/crack.js";

export async function main(ns: NS): Promise<void> {
    const host = ns.args[0] as string | undefined;
    if (!host) { ns.tprint("ERROR Usage: crack.js <host>"); return; }

    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(700, 500);

    if (ns.dnet.isDarknetServer()) {
        const fname = `dnet_${ns.getHostname()}.txt`;
        ns.write(fname, JSON.stringify(ns.dnet.probe()), "w");
        await ns.scp(fname, "home");
    }

    try {
        const auth    = (ns.dnet as any).getServerDetails(host);
        const modelId = (auth as any).modelId ?? "";
        const charReq  = ns.dnet.getServerRequiredCharismaLevel(host);
        const charisma = ns.getPlayer().skills.charisma;

        ns.print(`Target:   ${host}`);
        ns.print(`Model:    ${modelId || "(unknown)"}`);
        ns.print(`Format:   ${auth.passwordFormat}  length=${auth.passwordLength}`);
        ns.print(`Hint:     ${auth.passwordHint || "(none)"}`);
        ns.print(`Data:     ${auth.data         || "(none)"}`);
        ns.print(`Charisma: ${charisma} / ${charReq} req`);
        ns.print("─".repeat(60));

        if (auth.hasSession) {
            ns.print("Already have an active session — saving password.");
            const candidates = buildCandidates(auth.passwordHint, auth.data, auth.passwordFormat, auth.passwordLength, modelId);
            if (candidates.length > 0) await savePassword(ns, host, candidates[0]);
            return;
        }

        if (!ns.dnet.probe().includes(host)) {
            const parent = findParent(ns, host);
            if (!parent) {
                ns.tprint(`ERROR ${host}: not found in any topology file.`);
                return;
            }
            if (parent !== ns.getHostname()) {
                const reachable = ns.dnet.probe().includes(parent) || ns.dnet.getStasisLinkedServers().includes(parent);
                if (!reachable) {
                    ns.tprint(`ERROR ${parent} → ${host}: ${parent} is not reachable from ${ns.getHostname()}.`);
                    return;
                }
                await hopAndCrack(ns, host, parent);
                return;
            }
        }

        await attemptCrack(ns, host, auth, modelId, charisma, charReq);
    } finally {
        ns.ui.closeTail();
    }
}

function findParent(ns: NS, target: string): string | null {
    for (const f of ns.ls(ns.getHostname(), "dnet_")) {
        try {
            const neighbors = JSON.parse(ns.read(f)) as string[];
            if (neighbors.includes(target))
                return f.replace("dnet_", "").replace(".txt", "");
        } catch {}
    }
    return null;
}

async function hopAndCrack(ns: NS, target: string, parent: string): Promise<void> {
    const passwords = loadPasswords(ns);
    const password  = passwords[parent];
    if (password === undefined) {
        ns.tprint(`ERROR ${parent}: no saved password — crack it first.`);
        return;
    }

    const r = ns.dnet.connectToSession(parent, password);
    if (!r.success) {
        ns.tprint(`ERROR connectToSession(${parent}) failed: ${r.message}`);
        return;
    }

    const blocked = ns.dnet.getBlockedRam(parent);
    if (blocked > 0) {
        ns.print(`Freeing ${blocked}GB blocked RAM on ${parent}...`);
        const mr = await ns.dnet.memoryReallocation(parent);
        ns.print(mr.success ? `  Freed.` : `  ${mr.message}`);
    }

    const files = [SCRIPT, PASSWORDS_FILE, ...ns.ls(ns.getHostname(), "dnet_")];
    for (const f of files) await ns.scp(f, parent, "home");

    const pid = ns.exec(SCRIPT, parent, 1, target);
    if (pid > 0) ns.tprint(`INFO crack: running on ${parent} targeting ${target} (pid ${pid})`);
    else         ns.tprint(`ERROR exec on ${parent} failed — not enough RAM?`);
}

async function attemptCrack(
    ns: NS, host: string,
    auth: any,
    modelId: string, charisma: number, charReq: number
): Promise<void> {
    if (charisma >= charReq) {
        ns.print("Heartbleeding for log clues...");
        const hb = await ns.dnet.heartbleed(host, { peek: true, logsToCapture: 10 });
        if (hb.logs.length > 0) {
            ns.print(`Logs (${hb.logs.length}):`);
            for (const line of hb.logs) ns.print(`  ${line}`);
        } else {
            ns.print("No logs.");
        }
    } else {
        ns.print(`Charisma too low for heartbleed (${charisma}/${charReq}) — skipping.`);
    }
    ns.print("─".repeat(60));

    // DeepGreen: Mastermind interactive solver
    if (modelId === "DeepGreen" && auth.passwordFormat === "numeric" && auth.passwordLength > 0) {
        ns.print("DeepGreen detected — running Mastermind solver...");
        const pw = await mastermindSolve(ns, host,  auth.passwordLength,
            (guess, fb) => ns.print(`  Guess: ${guess}  bulls=${fb.bulls} cows=${fb.cows}  pool=${fb.remaining}`));
        if (pw !== null) {
            await savePassword(ns, host, pw);
            ns.tprint(`SUCCESS crack: ${host} [DeepGreen] password="${pw}"`);
        } else {
            ns.tprint(`INFO crack: ${host} [DeepGreen] — solver failed`);
        }
        return;
    }

    // NIL: exact-position yes/yesn't solver
    if (modelId === "NIL" && auth.passwordFormat === "numeric" && auth.passwordLength > 0) {
        ns.print("NIL detected — running position-feedback solver...");
        const pw = await nilSolve(ns, host, auth.passwordLength,
            (guess, fb) => ns.print(`  Guess: ${guess}  feedback=${fb.feedback.map(b => b ? "✓" : "✗").join("")}  pool=${fb.remaining}`));
        if (pw !== null) {
            await savePassword(ns, host, pw);
            ns.tprint(`SUCCESS crack: ${host} [NIL] password="${pw}"`);
        } else {
            ns.tprint(`INFO crack: ${host} [NIL] — solver failed`);
        }
        return;
    }

    const candidates = buildCandidates(auth.passwordHint, auth.data, auth.passwordFormat, auth.passwordLength, modelId);

    for (const candidate of candidates) {
        ns.print(`Trying: "${candidate}"`);
        const r = await ns.dnet.authenticate(host, candidate);
        if (r.data !== undefined) {
            ns.print(`  [AUTH DATA] ${JSON.stringify(r.data)}`);
            ns.tprint(`INFO crack: ${host} auth data = ${JSON.stringify(r.data)}`);
        }
        if (r.success) {
            ns.print(`SUCCESS — password: "${candidate}"`);
            await savePassword(ns, host, candidate);
            ns.tprint(`SUCCESS crack: ${host} [${modelId}] password="${candidate}"`);
            return;
        }
        ns.print(`  Failed: ${r.message}`);
    }

    ns.print("─".repeat(60));
    ns.print("Automated attempts exhausted.");
    ns.tprint(`INFO crack: ${host} [${modelId}] — manual input needed`);
    ns.tprint(`  Hint: ${auth.passwordHint}  Data: ${auth.data}  Format: ${auth.passwordFormat}[${auth.passwordLength}]`);
}

// ---------------------------------------------------------------------------
// Candidate generation
// ---------------------------------------------------------------------------

function buildCandidates(hint: string, data: string, format: string, length: number, modelId: string): string[] {
    const candidates: string[] = [];

    // 1. Model-specific candidates first
    candidates.push(...getModelCandidates(modelId, format, length));

    // 2. Empty password
    if (length === 0 || /there is no password|i didn't set a password|the pin is empty/i.test(hint)) {
        candidates.push("");
    }

    // 3. Model-specific hint-based extractions
    if (modelId === "DeskMemo_3.1") {
        // Password is always the last word of the hint ("It's set to 950", etc.)
        const lastWord = hint.trim().split(/\s+/).pop();
        if (lastWord) candidates.push(lastWord);
    }
    if (modelId === "Pr0verFl0") {
        // Any repeated character of the right length passes — classic overflow fill
        candidates.push("A".repeat(length));
    }

    // 4. "Remember to use 312" / "The password/key/secret/code/pin is X"
    const rememberMatch = hint.match(/remember to use (\S+)/i);
    if (rememberMatch) candidates.push(rememberMatch[1]);
    const plainMatch = hint.match(/(?:the (?:password|key|secret|code|pin) is|(?:password|key|secret|code|pin):)\s*(\S+)/i);
    if (plainMatch) {
        const val = plainMatch[1];
        const looksNumeric = /^\d+$/.test(val);
        const looksAlpha   = /^[a-zA-Z]+$/.test(val);
        if      (format === "numeric"      && looksNumeric) candidates.push(val.padStart(length, "0"));
        else if (format === "alphabetic"   && looksAlpha  ) candidates.push(val);
        else if (format === "alphanumeric" && /^[a-zA-Z0-9]+$/.test(val)) candidates.push(val);
        else if (!format) candidates.push(val);
    }

    // 5. "a number between X and Y"
    const rangeMatch = hint.match(/number between (\d+) and (\d+)/i);
    if (rangeMatch) {
        const lo = parseInt(rangeMatch[1]);
        const hi = parseInt(rangeMatch[2]);
        for (let i = lo; i <= hi; i++) {
            const s = String(i).padStart(length, "0");
            if (s.length === length) candidates.push(s);
        }
    }

    // 6. "divisible by 1" — brute force
    if (/the password is divisible by 1/i.test(hint)) {
        const total = Math.pow(10, length);
        for (let i = 0; i < total; i++) candidates.push(String(i).padStart(length, "0"));
    }

    // 7. Base conversion
    const baseMatch = hint.match(/the base (\d+) number (\S+) in base 10/i);
    if (baseMatch) {
        const converted = parseInt(baseMatch[2], parseInt(baseMatch[1]));
        if (!isNaN(converted)) candidates.push(String(converted).padStart(length, "0"));
    }
    if (!baseMatch && data) {
        const parts = data.split(",");
        if (parts.length === 2 && /^\d+$/.test(parts[0].trim()) && /^[0-9a-zA-Z]+$/.test(parts[1].trim())) {
            const converted = parseInt(parts[1].trim(), parseInt(parts[0].trim()));
            if (!isNaN(converted)) candidates.push(String(converted).padStart(length, "0"));
        }
    }

    // 8. For numeric format: extract all N-digit sequences from data (password may be embedded)
    if (format === "numeric" && length > 0 && data) {
        const matches = data.match(new RegExp(`\\d{${length}}`, "g")) ?? [];
        candidates.push(...matches);
    }

    // 9. Raw data / hint as last resort — only if length matches (avoids passing long JSON blobs)
    if (data && (length === 0 || data.length === length)) candidates.push(data);
    if (hint && (length === 0 || hint.length === length)) candidates.push(hint);

    // Note: crack.ts doesn't pass logs — Laika4 letter-hint reordering is in crawler.ts where logs are available

    return [...new Set(candidates)];
}

function getModelCandidates(modelId: string, format: string, length: number): string[] {
    switch (modelId) {
        case "ZeroLogon":
            return length === 0 ? [""] : ["0".repeat(length)];

        case "Openwebaccesspoint":
        case "OpenWebAccessPoint":
            // Password leaked as N-digit number in data field — caught by numeric extraction
            return [""];

        case "FreshInstall_1.0":
            return ["12345", "1234", "123456", ...defaultPasswordCandidates(format, length)]
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
            // Password = hint[length:length*2] — handled in buildCandidates (needs hint)
            return [];

        case "DeepGreen":
        case "NIL":
            // Interactive solvers — handled before candidate list in attemptCrack
            return [];

        case "OctantVoxel":
            return [];

        case "CloudBlare(tm)":
        case "DeskMemo_3.1":
            return [];

        default:
            return [];
    }
}

function defaultPasswordCandidates(format: string, length: number): string[] {
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

async function mastermindSolve(
    ns: NS, host: string, length: number,
    onGuess?: (guess: string, fb: { bulls: number; cows: number; remaining: number }) => void
): Promise<string | null> {
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
            ns.tprint(`WARN crack: ${host} [DeepGreen] no feedback — data=${JSON.stringify(r.data)}  msg="${r.message}"`);
            return null;
        }

        pool = pool.filter(code => {
            const [bulls, cows] = scoreMastermind(guess, code);
            return bulls === fb.bulls && cows === fb.cows;
        });

        onGuess?.(guess, { ...fb, remaining: pool.length });
    }
    return null;
}

function parseMastermindFeedback(data: unknown, message?: string): { bulls: number; cows: number } | null {
    // "bulls,cows" string e.g. "0,3"
    if (typeof data === "string") {
        const parts = data.split(",");
        if (parts.length === 2) {
            const bulls = parseInt(parts[0].trim());
            const cows  = parseInt(parts[1].trim());
            if (!isNaN(bulls) && !isNaN(cows)) return { bulls, cows };
        }
    }

    // Structured object
    if (data && typeof data === "object") {
        const d = data as Record<string, unknown>;
        const bulls = firstNumber(d, "bulls", "correct", "exact", "rightPosition", "hits");
        const cows  = firstNumber(d, "cows", "misplaced", "partial", "present", "blows");
        if (bulls !== null && cows !== null) return { bulls, cows };
    }

    // Message string e.g. "0 symbols are match exactly, and 3 symbols match but are in the wrong place."
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

async function nilSolve(
    ns: NS, host: string, length: number,
    onGuess?: (guess: string, fb: { feedback: boolean[]; remaining: number }) => void
): Promise<string | null> {
    const total = Math.pow(10, length);
    let pool: string[] = [];
    for (let i = 0; i < total; i++) pool.push(String(i).padStart(length, "0"));

    while (pool.length > 0) {
        const guess = pool[0];
        const r = await ns.dnet.authenticate(host, guess);
        if (r.success) return guess;

        const feedback = parseNilFeedback(r.data);
        if (feedback === null) {
            ns.tprint(`WARN crack: ${host} [NIL] no yes/yesn't feedback — data=${JSON.stringify(r.data)}`);
            return null;
        }

        pool = pool.filter(code => {
            for (let i = 0; i < Math.min(feedback.length, code.length); i++) {
                if ((code[i] === guess[i]) !== feedback[i]) return false;
            }
            return true;
        });

        onGuess?.(guess, { feedback, remaining: pool.length });
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
    if (!ns.fileExists(PASSWORDS_FILE)) return {};
    try { return JSON.parse(ns.read(PASSWORDS_FILE)); } catch { return {}; }
}

async function savePassword(ns: NS, host: string, password: string): Promise<void> {
    const stored = loadPasswords(ns);
    stored[host] = password;
    ns.write(PASSWORDS_FILE, JSON.stringify(stored, null, 2), "w");
    if (ns.getHostname() !== "home") await ns.scp(PASSWORDS_FILE, "home");
}
