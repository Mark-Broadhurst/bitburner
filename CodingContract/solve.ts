import { NS, CodingContractName, CodingContractNameEnumType, CodingContractSignatures, CodingContractObject } from "@ns";
import { getServerNames } from "Utils/network";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    const servers = ["home", ...getServerNames(ns)];
    let solved = 0, failed = 0, skipped = 0;

    for (const hostname of servers) {
        for (const file of ns.ls(hostname, ".cct")) {
            const type = ns.codingcontract.getContractType(file, hostname);
            const data = ns.codingcontract.getData(file, hostname);
            const answer = solve(type, data);

            if (answer === null) {
                ns.tprint(`SKIP  [${type}]  ${hostname}:${file}`);
                skipped++;
                continue;
            }

            const reward = ns.codingcontract.attempt(answer as string, file, hostname);
            if (reward) {
                ns.tprint(`✅ [${type}]  ${hostname}:${file}  — ${reward}`);
                solved++;
            } else {
                ns.tprint(`❌ [${type}]  ${hostname}:${file}  submitted: ${JSON.stringify(answer)}`);
                failed++;
            }
        }
    }

    ns.tprint(`Done — solved: ${solved}  failed: ${failed}  skipped: ${skipped}`);
}

function solve(type: string, data: any): any {
    switch (type) {
        case "Find Largest Prime Factor":               return largestPrimeFactor(data);
        case "Subarray with Maximum Sum":               return subarrayMaxSum(data);
        case "Total Ways to Sum":                       return totalWaysToSum(data);
        case "Total Ways to Sum II":                    return totalWaysToSum2(data);
        case "Spiralize Matrix":                        return spiralizeMatrix(data);
        case "Array Jumping Game":                      return arrayJumpingGame(data);
        case "Array Jumping Game II":                   return arrayJumpingGame2(data);
        case "Merge Overlapping Intervals":             return mergeIntervals(data);
        case "Generate IP Addresses":                   return generateIPs(data);
        case "Algorithmic Stock Trader I":              return stockTrader1(data);
        case "Algorithmic Stock Trader II":             return stockTrader2(data);
        case "Algorithmic Stock Trader III":            return stockTrader3(data);
        case "Algorithmic Stock Trader IV":             return stockTrader4(data);
        case "Minimum Path Sum in a Triangle":          return minTrianglePath(data);
        case "Unique Paths in a Grid I":                return uniquePaths1(data);
        case "Unique Paths in a Grid II":               return uniquePaths2(data);
        case "Shortest Path in a Grid":                 return shortestPath(data);
        case "Sanitize Parentheses in Expression":      return sanitizeParens(data);
        case "Find All Valid Math Expressions":         return validMathExpressions(data);
        case "HammingCodes: Integer to Encoded Binary": return hammingEncode(data);
        case "HammingCodes: Encoded Binary to Integer": return hammingDecode(data);
        case "Proper 2-Coloring of a Graph":            return twoColorGraph(data);
        case "Compression I: RLE Compression":          return rleCompress(data);
        case "Compression II: LZ Decompression":        return lzDecompress(data);
        case "Compression III: LZ Compression":         return lzCompress(data);
        case "Encryption I: Caesar Cipher":             return caesarCipher(data);
        case "Encryption II: Vigenère Cipher":          return vigenereCipher(data);
        case "Square Root":                             return squareRoot(data);
        case "Total Number of Primes":                  return totalPrimesInRange(data);
        case "Largest Rectangle in a Matrix":           return largestRectangle(data);
        default:                                        return null;
    }
}

// ── Solvers ───────────────────────────────────────────────────────────────────

function largestPrimeFactor(n: number): number {
    let largest = 1, d = 2;
    while (n > 1) {
        while (n % d === 0) { largest = d; n /= d; }
        d++;
    }
    return largest;
}

function subarrayMaxSum(data: number[]): number {
    let max = 0, sum = 0;
    for (const x of data) {
        sum = Math.max(0, sum + x);
        max = Math.max(max, sum);
    }
    return max;
}

function totalWaysToSum(n: number): number {
    const dp = new Array(n + 1).fill(0);
    dp[0] = 1;
    for (let i = 1; i < n; i++)
        for (let j = i; j <= n; j++)
            dp[j] += dp[j - i];
    return dp[n];
}

function totalWaysToSum2([n, nums]: [number, number[]]): number {
    const dp = new Array(n + 1).fill(0);
    dp[0] = 1;
    for (const k of nums)
        for (let j = k; j <= n; j++)
            dp[j] += dp[j - k];
    return dp[n];
}

function spiralizeMatrix(m: number[][]): number[] {
    const out: number[] = [];
    let top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1, dir = 0;
    while (top <= bottom && left <= right) {
        if (dir === 0) { for (let i = left;   i <= right;  i++) out.push(m[top][i]);    top++;    }
        if (dir === 1) { for (let i = top;    i <= bottom; i++) out.push(m[i][right]);  right--;  }
        if (dir === 2) { for (let i = right;  i >= left;   i--) out.push(m[bottom][i]); bottom--; }
        if (dir === 3) { for (let i = bottom; i >= top;    i--) out.push(m[i][left]);   left++;   }
        dir = (dir + 1) % 4;
    }
    return out;
}

function arrayJumpingGame(data: number[]): number {
    let reach = 0;
    for (let i = 0; i < data.length; i++) {
        if (i > reach) return 0;
        reach = Math.max(reach, i + data[i]);
    }
    return 1;
}

function arrayJumpingGame2(data: number[]): number {
    const n = data.length;
    if (n <= 1) return 0;
    let jumps = 0, curEnd = 0, farthest = 0;
    for (let i = 0; i < n - 1; i++) {
        farthest = Math.max(farthest, i + data[i]);
        if (i === curEnd) {
            if (farthest <= curEnd) return 0;
            jumps++;
            curEnd = farthest;
        }
    }
    return jumps;
}

function mergeIntervals(intervals: number[][]): number[][] {
    intervals.sort((a, b) => a[0] - b[0]);
    const out = [intervals[0].slice()];
    for (let i = 1; i < intervals.length; i++) {
        const last = out[out.length - 1];
        if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]);
        else out.push(intervals[i].slice());
    }
    return out;
}

function generateIPs(s: string): string[] {
    const out: string[] = [];
    for (let a = 1; a <= 3; a++) for (let b = 1; b <= 3; b++) for (let c = 1; c <= 3; c++) {
        const d = s.length - a - b - c;
        if (d < 1 || d > 3) continue;
        const parts = [s.slice(0,a), s.slice(a,a+b), s.slice(a+b,a+b+c), s.slice(a+b+c)];
        if (parts.some(p => p.length > 1 && p[0] === "0")) continue;
        if (parts.some(p => +p > 255)) continue;
        out.push(parts.join("."));
    }
    return out;
}

function stockTrader1(prices: number[]): number {
    let min = prices[0], max = 0;
    for (const p of prices) { min = Math.min(min, p); max = Math.max(max, p - min); }
    return max;
}

function stockTrader2(prices: number[]): number {
    let profit = 0;
    for (let i = 1; i < prices.length; i++)
        if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
    return profit;
}

function stockTrader3(prices: number[]): number {
    return stockTrader4([2, prices]);
}

function stockTrader4([k, prices]: [number, number[]]): number {
    const n = prices.length;
    if (n === 0 || k === 0) return 0;
    if (k >= Math.floor(n / 2)) return stockTrader2(prices);
    const dp = Array.from({ length: k + 1 }, () => new Array(n).fill(0));
    for (let t = 1; t <= k; t++) {
        let best = -prices[0];
        for (let d = 1; d < n; d++) {
            dp[t][d] = Math.max(dp[t][d - 1], prices[d] + best);
            best = Math.max(best, dp[t - 1][d] - prices[d]);
        }
    }
    return dp[k][n - 1];
}

function minTrianglePath(tri: number[][]): number {
    const dp = [...tri[tri.length - 1]];
    for (let i = tri.length - 2; i >= 0; i--)
        for (let j = 0; j <= i; j++)
            dp[j] = tri[i][j] + Math.min(dp[j], dp[j + 1]);
    return dp[0];
}

function uniquePaths1([r, c]: [number, number]): number {
    const dp = new Array(c).fill(1);
    for (let i = 1; i < r; i++)
        for (let j = 1; j < c; j++)
            dp[j] += dp[j - 1];
    return dp[c - 1];
}

function uniquePaths2(grid: number[][]): number {
    const r = grid.length, c = grid[0].length;
    if (grid[0][0] || grid[r-1][c-1]) return 0;
    const dp = Array.from({ length: r }, () => new Array(c).fill(0));
    dp[0][0] = 1;
    for (let i = 1; i < r; i++) dp[i][0] = grid[i][0] ? 0 : dp[i-1][0];
    for (let j = 1; j < c; j++) dp[0][j] = grid[0][j] ? 0 : dp[0][j-1];
    for (let i = 1; i < r; i++)
        for (let j = 1; j < c; j++)
            dp[i][j] = grid[i][j] ? 0 : dp[i-1][j] + dp[i][j-1];
    return dp[r-1][c-1];
}

function shortestPath(grid: number[][]): string {
    const r = grid.length, c = grid[0].length;
    if (grid[0][0] || grid[r-1][c-1]) return "";
    const dirs: [number, number, string][] = [[-1,0,"U"],[1,0,"D"],[0,-1,"L"],[0,1,"R"]];
    const queue: [number, number, string][] = [[0, 0, ""]];
    const seen = Array.from({ length: r }, () => new Array(c).fill(false));
    seen[0][0] = true;
    while (queue.length) {
        const [row, col, path] = queue.shift()!;
        if (row === r - 1 && col === c - 1) return path;
        for (const [dr, dc, d] of dirs) {
            const nr = row + dr, nc = col + dc;
            if (nr >= 0 && nr < r && nc >= 0 && nc < c && !seen[nr][nc] && !grid[nr][nc]) {
                seen[nr][nc] = true;
                queue.push([nr, nc, path + d]);
            }
        }
    }
    return "";
}

function sanitizeParens(s: string): string[] {
    let level = new Set([s]);
    while (true) {
        const valid = [...level].filter(str => {
            let n = 0;
            for (const c of str) {
                if (c === "(") n++;
                else if (c === ")") { if (--n < 0) return false; }
            }
            return n === 0;
        });
        if (valid.length) return valid;
        const next = new Set<string>();
        for (const str of level)
            for (let i = 0; i < str.length; i++)
                if (str[i] === "(" || str[i] === ")")
                    next.add(str.slice(0, i) + str.slice(i + 1));
        level = next;
    }
}

function validMathExpressions([digits, target]: [string, number]): string[] {
    const out: string[] = [];
    function dfs(pos: number, expr: string, val: number, last: number) {
        if (pos === digits.length) { if (val === target) out.push(expr); return; }
        for (let len = 1; len <= digits.length - pos; len++) {
            const s = digits.slice(pos, pos + len);
            if (s.length > 1 && s[0] === "0") break;
            const n = +s;
            if (pos === 0) dfs(len, s, n, n);
            else {
                dfs(pos + len, expr + "+" + s, val + n,        n);
                dfs(pos + len, expr + "-" + s, val - n,       -n);
                dfs(pos + len, expr + "*" + s, val - last + last * n, last * n);
            }
        }
    }
    dfs(0, "", 0, 0);
    return out;
}

function hammingEncode(n: number): string {
    const data = n.toString(2).split("").map(Number);
    let r = 0;
    while ((1 << r) < data.length + r + 1) r++;
    const len = data.length + r;
    const arr = new Array(len + 1).fill(0);
    let di = 0;
    for (let i = 1; i <= len; i++) if (i & (i - 1)) arr[i] = data[di++] ?? 0;
    for (let p = 0; p < r; p++) {
        const pos = 1 << p;
        let parity = 0;
        for (let i = pos; i <= len; i++) if (i & pos) parity ^= arr[i];
        arr[pos] = parity;
    }
    const overall = arr.slice(1).reduce((a, b) => a ^ b, 0);
    return overall + arr.slice(1).join("");
}

function hammingDecode(data: string): number {
    const bits = data.split("").map(Number);
    const n = bits.length;
    let err = 0;
    for (let i = 1; i < n; i++) if (bits[i]) err ^= i;
    if (err) bits[err] ^= 1;
    let result = "";
    for (let i = 1; i < n; i++) if (i & (i - 1)) result += bits[i];
    return parseInt(result, 2) || 0;
}

function twoColorGraph([n, edges]: [number, [number, number][]]): number[] {
    const adj: number[][] = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
    const color = new Array(n).fill(-1);
    for (let start = 0; start < n; start++) {
        if (color[start] !== -1) continue;
        color[start] = 0;
        const queue = [start];
        while (queue.length) {
            const node = queue.shift()!;
            for (const nb of adj[node]) {
                if (color[nb] === -1) { color[nb] = 1 - color[node]; queue.push(nb); }
                else if (color[nb] === color[node]) return [];
            }
        }
    }
    return color;
}

function rleCompress(data: string): string {
    let out = "", i = 0;
    while (i < data.length) {
        let count = 1;
        while (count < 9 && i + count < data.length && data[i + count] === data[i]) count++;
        out += count + data[i];
        i += count;
    }
    return out;
}

function lzDecompress(data: string): string {
    let out = "", i = 0, type = 1;
    while (i < data.length) {
        const L = +data[i++];
        if (type === 1) {
            out += data.slice(i, i + L);
            i += L;
        } else if (L > 0) {
            const D = +data[i++];
            const start = out.length - D;
            for (let j = 0; j < L; j++) out += out[start + j % D];
        }
        type = 3 - type;
    }
    return out;
}

function lzCompress(plain: string): string {
    const n = plain.length;
    const dp: (string | null)[][] = Array.from({ length: n + 1 }, () => [null, null, null]);
    dp[0][1] = "";
    for (let i = 0; i <= n; i++) {
        // Resolve same-position 0-skips before advancing transitions.
        // Type-1 L=0 → Type-2 (same pos), then Type-2 L=0 → Type-1 (same pos).
        // Each skip adds 1 char, so at most one productive pass each direction.
        if (dp[i][1] !== null) {
            const s = dp[i][1] + "0";
            if (dp[i][2] === null || s.length < dp[i][2]!.length) dp[i][2] = s;
        }
        if (dp[i][2] !== null) {
            const s = dp[i][2] + "0";
            if (dp[i][1] === null || s.length < dp[i][1]!.length) dp[i][1] = s;
        }
        // Type-1: literal chunk (L ≥ 1) → advances to type-2
        if (dp[i][1] !== null) {
            const cur = dp[i][1]!;
            for (let L = 1; L <= 9 && i + L <= n; L++) {
                const cand = cur + L + plain.slice(i, i + L);
                if (dp[i + L][2] === null || cand.length < dp[i + L][2]!.length)
                    dp[i + L][2] = cand;
            }
        }
        // Type-2: backreference (L ≥ 1) → advances to type-1
        if (dp[i][2] !== null) {
            const cur = dp[i][2]!;
            for (let L = 1; L <= 9 && i + L <= n; L++) {
                for (let D = 1; D <= 9 && D <= i; D++) {
                    let ok = true;
                    for (let k = 0; k < L; k++)
                        if (plain[i + k] !== plain[i - D + k % D]) { ok = false; break; }
                    if (ok) {
                        const cand = cur + L + D;
                        if (dp[i + L][1] === null || cand.length < dp[i + L][1]!.length)
                            dp[i + L][1] = cand;
                    }
                }
            }
        }
    }
    const a = dp[n][1], b = dp[n][2];
    if (a === null) return b ?? "";
    if (b === null) return a;
    return a.length <= b.length ? a : b;
}

function caesarCipher([text, shift]: [string, number]): string {
    return text.split("").map(c =>
        c === " " ? " " : String.fromCharCode(((c.charCodeAt(0) - 65 - shift + 26) % 26) + 65)
    ).join("");
}

function vigenereCipher([text, key]: [string, string]): string {
    let out = "", ki = 0;
    for (const c of text) {
        if (c === " ") { out += " "; continue; }
        const shift = key[ki++ % key.length].charCodeAt(0) - 65;
        out += String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
    }
    return out;
}

function squareRoot(n: bigint): string {
    if (n <= 1n) return n.toString();
    let x = n;
    let y = (x + 1n) >> 1n;
    while (y < x) { x = y; y = (x + n / x) >> 1n; }
    return x.toString();
}

function totalPrimesInRange([a, b]: number[]): number {
    const sqrtB = Math.ceil(Math.sqrt(b));
    const small = new Uint8Array(sqrtB + 1);
    small[0] = small[1] = 1;
    for (let i = 2; i <= sqrtB; i++)
        if (!small[i]) for (let j = i * i; j <= sqrtB; j += i) small[j] = 1;
    const primes: number[] = [];
    for (let i = 2; i <= sqrtB; i++) if (!small[i]) primes.push(i);

    const lo = Math.max(a, 2);
    const size = b - lo + 1;
    if (size <= 0) return 0;
    const sieve = new Uint8Array(size);
    for (const p of primes) {
        const start = Math.max(p * p, Math.ceil(lo / p) * p);
        for (let j = start; j <= b; j += p) sieve[j - lo] = 1;
    }
    let count = 0;
    for (let i = 0; i < size; i++) if (!sieve[i]) count++;
    return count;
}

function largestRectangle(grid: number[][]): [[number, number], [number, number]] {
    const rows = grid.length, cols = grid[0].length;
    const h = new Array(cols).fill(0);
    let bestArea = 0;
    let r1 = 0, c1 = 0, r2 = 0, c2 = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) h[c] = grid[r][c] === 0 ? 0 : h[c] + 1;
        const stack: number[] = [];
        for (let c = 0; c <= cols; c++) {
            const cur = c < cols ? h[c] : 0;
            while (stack.length && h[stack[stack.length - 1]] > cur) {
                const top = stack.pop()!;
                const height = h[top];
                const left = stack.length ? stack[stack.length - 1] + 1 : 0;
                const area = height * (c - left);
                if (area > bestArea) {
                    bestArea = area;
                    r1 = r - height + 1; c1 = left; r2 = r; c2 = c - 1;
                }
            }
            stack.push(c);
        }
    }
    return [[r1, c1], [r2, c2]];
}
