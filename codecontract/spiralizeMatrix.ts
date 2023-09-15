import { NS } from "@ns";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.clearLog();

    const hostname = ns.args[0] as string;
    const filename = ns.args[1] as string;
    const data = ns.codingcontract.getData(filename, hostname);

    const result = spiralizeMatrix(data);
    ns.toast(`Solving Code Contract on ${hostname}:${filename} ${result}`)
}

function spiralizeMatrix(matrix: number[][]): number[] {
    const result = [];
    let top = 0;
    let bottom = matrix.length - 1;
    let left = 0;
    let right = matrix[0].length - 1;
    let direction = 0;
    while (top <= bottom && left <= right) {
        if (direction === 0) {
            for (let i = left; i <= right; i++) {
                result.push(matrix[top][i]);
            }
            top++;
        } else if (direction === 1) {
            for (let i = top; i <= bottom; i++) {
                result.push(matrix[i][right]);
            }
            right--;
        } else if (direction === 2) {
            for (let i = right; i >= left; i--) {
                result.push(matrix[bottom][i]);
            }
            bottom--;
        } else if (direction === 3) {
            for (let i = bottom; i >= top; i--) {
                result.push(matrix[i][left]);
            }
            left++;
        }
        direction = (direction + 1) % 4;
    }
    return result;
}