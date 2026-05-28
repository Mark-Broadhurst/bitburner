import { NS } from "@ns";

const NICE: Set<string> = new Set([
    "affectionate","agreeable","amusing","brave","bright","charming",
    "communicative","confident","considerate","courageous","creative",
    "decisive","determined","diligent","diplomatic","dynamic","earnest",
    "elegant","energetic","enthusiastic","excellent","exuberant","fabulous",
    "fair","faithful","fantastic","fine","frank","friendly","funny",
    "generous","gentle","giving","good","happy","helpful","honest",
    "humorous","imaginative","impartial","independent","intellectual",
    "intelligent","intuitive","inventive","kind","likable","logical",
    "lovely","loving","loyal","mature","modest","nice","optimistic",
    "outstanding","passionate","patient","peaceful","persistent","plucky",
    "polished","positive","powerful","practical","productive","protective",
    "proud","punctual","quiet","rational","reliable","resourceful","romantic",
    "sensitive","sincere","smart","straightforward","supportive","talented",
    "thoughtful","tidy","tough","understanding","versatile","warmhearted",
    "willing","wonderful",
]);

const BRACKET_CLOSE: Record<string, string> = { '(': ')', '[': ']', '{': '}', '<': '>' };

const ARROW_KEY: Record<string, string> = {
    '↑': 'ArrowUp', '↓': 'ArrowDown', '←': 'ArrowLeft', '→': 'ArrowRight',
};

interface State {
    lastGame:    string;
    bracketSeq:  string;
    bracketIdx:  number;
    wordTarget:  string;
    wordIdx:     number;
    lastArrow:   string;
    mines:       [number, number][];
    minePos:     [number, number];
    mineTodo:    [number, number][];
    wiresDone:   Set<number>;
}

function freshState(): State {
    return {
        lastGame: "", bracketSeq: "", bracketIdx: 0,
        wordTarget: "", wordIdx: 0, lastArrow: "",
        mines: [], minePos: [0, 0], mineTodo: [],
        wiresDone: new Set(),
    };
}

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(520, 320);

    const doc   = eval("document") as Document;
    installHook(doc);
    const press = makePress(doc);

    ns.clearLog();
    ns.print("🤖 Infiltration automator active — navigate to a location to begin.");
    ns.print("─".repeat(55));

    const s = freshState();

    while (true) {
        await ns.sleep(50);

        const game = detectGame(doc);

        if (!game) {
            if (s.lastGame) {
                ns.print(`✅ Completed: ${s.lastGame}`);
                Object.assign(s, freshState());
            }
            continue;
        }

        if (game.name !== s.lastGame) {
            s.lastGame = game.name;
            Object.assign(s, { ...freshState(), lastGame: game.name });
            ns.print(`🎮 ${game.name}`);
        }

        try {
            const c = game.container;
            if (game.isSlash)                                        solveSlash(c, press);
            else if (game.name === "close the brackets")             solveBracket(c, press, s);
            else if (game.name === "type it backward")               solveBackward(c, press, s);
            else if (game.name === "say something nice about the guard") solveBribe(c, press);
            else if (game.name === "enter the code")                 solveCheatCode(c, press, s);
            else if (game.name === "match the symbols")              solveCyberpunk(c, press);
            else if (game.name === "remember all the mines")         solveMineP1(c, s);
            else if (game.name === "mark all the mines")             solveMineP2(c, press, s);
            else if (game.name.startsWith("cut the wires"))         solveWires(c, press, s);
            else ns.print(`⚠ Unknown game: "${game.name}"`);
        } catch (_) { /* ignore transient DOM errors */ }
    }
}

function installHook(doc: Document): void {
    const win = doc.defaultView as Window & { _infHooked?: boolean };
    if (win._infHooked) return;
    win._infHooked = true;

    const orig = doc.addEventListener.bind(doc);
    (doc as any).addEventListener = (
        type: string,
        listener: EventListenerOrEventListenerObject,
        opts?: boolean | AddEventListenerOptions,
    ) => {
        if (type === "keydown" && typeof listener === "function") {
            const fn = listener as EventListener;
            return orig(type, (ev: Event) => fn(
                ev instanceof KeyboardEvent
                    ? new Proxy(ev, { get: (t, p: string) => p === "isTrusted" ? true : (t as any)[p] })
                    : ev
            ), opts);
        }
        return orig(type, listener, opts);
    };
}

function makePress(doc: Document): (key: string) => void {
    return (key: string) => {
        const code =
            key === " "            ? "Space"         :
            key.startsWith("Arrow") ? key            :
            key.length === 1       ? `Key${key.toUpperCase()}` : key;

        const init = { key, code, bubbles: true, cancelable: true };
        doc.dispatchEvent(new KeyboardEvent("keydown", init));
        doc.dispatchEvent(new KeyboardEvent("keyup",   init));
    };
}

const SLASH_STATES = ["guarding", "distracted", "alerted"];

function detectGame(doc: Document): { name: string; container: Element; isSlash: boolean } | null {
    for (const h4 of doc.querySelectorAll("h4")) {
        const raw  = h4.textContent?.trim() ?? "";
        if (!raw) continue;
        const name = raw.toLowerCase().split(/[!.(]/)[0].trim();
        const isSlash = SLASH_STATES.some(s => name.startsWith(s));
        const container =
            h4.closest('[class*="MuiContainer"], [class*="MuiPaper"], [class*="MuiBox"]')
            ?? h4.parentElement
            ?? doc.body;
        return { name, container, isSlash };
    }
    return null;
}

function solveSlash(container: Element, press: (k: string) => void): void {
    for (const h4 of container.querySelectorAll("h4")) {
        if (h4.textContent?.toLowerCase().includes("distracted")) {
            press(" ");
            return;
        }
    }
}

function solveBracket(container: Element, press: (k: string) => void, s: State): void {
    if (!s.bracketSeq) {
        for (const el of container.querySelectorAll("p, span, h5")) {
            const t = el.textContent?.trim() ?? "";
            if (t && /^[\(\[\{\<]+$/.test(t)) { s.bracketSeq = t; s.bracketIdx = 0; break; }
        }
    }
    if (!s.bracketSeq || s.bracketIdx >= s.bracketSeq.length) return;

    const open  = s.bracketSeq[s.bracketSeq.length - 1 - s.bracketIdx];
    const close = BRACKET_CLOSE[open];
    if (close) { press(close); s.bracketIdx++; }
}

function solveBackward(container: Element, press: (k: string) => void, s: State): void {
    if (!s.wordTarget) {
        for (const el of container.querySelectorAll("p, span, h5")) {
            const t = el.textContent?.trim() ?? "";
            if (t.length > 1 && /^[a-zA-Z ]+$/.test(t)) {
                s.wordTarget = t.split("").reverse().join("");
                s.wordIdx    = 0;
                break;
            }
        }
    }
    if (!s.wordTarget || s.wordIdx >= s.wordTarget.length) return;
    press(s.wordTarget[s.wordIdx++]);
}

function solveBribe(container: Element, press: (k: string) => void): void {
    const candidate =
        container.querySelector('[class*="highlighted"]')
        ?? container.querySelector('[class*="selected"]')
        ?? container.querySelector('[style*="color: green"], [style*="color:#"]')
        ?? null;

    const word = candidate?.textContent?.toLowerCase().trim() ?? "";
    if (word && NICE.has(word)) {
        press(" ");
    } else {
        press("ArrowUp");
    }
}

function solveCheatCode(container: Element, press: (k: string) => void, s: State): void {
    const text = container.textContent ?? "";
    for (const [sym, key] of Object.entries(ARROW_KEY)) {
        if (text.includes(sym) && key !== s.lastArrow) {
            press(key);
            s.lastArrow = key;
            return;
        }
    }
    if (!Object.keys(ARROW_KEY).some(sym => text.includes(sym))) s.lastArrow = "";
}

function solveCyberpunk(container: Element, press: (k: string) => void): void {
    const targetEl = container.querySelector('[class*="target"], [class*="answer"]');
    const target   = targetEl?.textContent?.trim();
    if (!target) return;

    const cells = Array.from(container.querySelectorAll("td, [class*=\"cell\"], [class*=\"symbol\"]"));
    const idx   = cells.findIndex(c => c.textContent?.trim() === target);
    if (idx < 0) return;

    const cols  = Math.round(Math.sqrt(cells.length)) || 4;
    const tRow  = Math.floor(idx / cols);
    const tCol  = idx % cols;
    const curEl = container.querySelector('[class*="cursor"], [class*="active"]');
    const curIdx = curEl ? cells.indexOf(curEl as HTMLElement) : 0;
    const cRow  = Math.floor(curIdx / cols);
    const cCol  = curIdx % cols;

    if (cRow < tRow)       press("ArrowDown");
    else if (cRow > tRow)  press("ArrowUp");
    else if (cCol < tCol)  press("ArrowRight");
    else if (cCol > tCol)  press("ArrowLeft");
    else                   press(" ");
}

function solveMineP1(container: Element, s: State): void {
    s.mines = [];
    const rows = container.querySelectorAll("tr, [class*=\"row\"]");
    rows.forEach((row, r) => {
        row.querySelectorAll("td, [class*=\"cell\"]").forEach((cell, c) => {
            if ((cell as HTMLElement).dataset.mine === "true"
                || cell.textContent?.includes("💣")
                || cell.classList.toString().includes("mine")) {
                s.mines.push([r, c]);
            }
        });
    });
}

function solveMineP2(container: Element, press: (k: string) => void, s: State): void {
    if (s.mineTodo.length === 0 && s.mines.length > 0) {
        s.mineTodo  = [...s.mines];
        s.minePos   = [0, 0];
    }
    if (s.mineTodo.length === 0) return;

    const [tr, tc] = s.mineTodo[0];
    const [cr, cc] = s.minePos;

    if      (cr < tr) { press("ArrowDown");  s.minePos[0]++; }
    else if (cr > tr) { press("ArrowUp");    s.minePos[0]--; }
    else if (cc < tc) { press("ArrowRight"); s.minePos[1]++; }
    else if (cc > tc) { press("ArrowLeft");  s.minePos[1]--; }
    else              { press(" "); s.mineTodo.shift(); }
}

function solveWires(container: Element, press: (k: string) => void, s: State): void {
    for (const el of container.querySelectorAll("p, span, h5")) {
        const text = el.textContent ?? "";

        const numMatch = text.match(/wire(?:\s+number)?\s+(\d)/i);
        if (numMatch) {
            const n = parseInt(numMatch[1]);
            if (!s.wiresDone.has(n)) { press(String(n)); s.wiresDone.add(n); }
            return;
        }

        const colorMatch = text.match(/colou?red\s+(\w+)/i);
        if (colorMatch) {
            const color = colorMatch[1].toLowerCase();
            container.querySelectorAll("[data-wire], [class*=\"wire\"]").forEach((w, i) => {
                const c = (w as HTMLElement).dataset.color
                    ?? (w as HTMLElement).style.backgroundColor ?? "";
                if (c.toLowerCase().includes(color) && !s.wiresDone.has(i + 1)) {
                    press(String(i + 1));
                    s.wiresDone.add(i + 1);
                }
            });
            return;
        }

        const connMatch = text.match(/(\d+)\s+connections?/i);
        if (connMatch) {
            const target = parseInt(connMatch[1]);
            container.querySelectorAll("[data-connections]").forEach((w, i) => {
                const conn = parseInt((w as HTMLElement).dataset.connections ?? "0");
                if (conn === target && !s.wiresDone.has(i + 1)) {
                    press(String(i + 1));
                    s.wiresDone.add(i + 1);
                }
            });
            return;
        }
    }
}
