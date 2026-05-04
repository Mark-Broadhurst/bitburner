import { NS, Product } from "@ns";


export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    const corp = ns.corporation.getCorporation();
    let investmentAmount = parseInt("1".padEnd(Math.round(corp.funds).toString().length, "0"));
    while (investmentAmount < 1e60) {
        ns.print(`Investment: ${ns.formatNumber(investmentAmount, 0)}`)

        for (let i = 0; i < 5; i++) {
            for (const divisionName of corp.divisions) {
                const division = ns.corporation.getDivision(divisionName);
                if (!division.makesProducts || i > division.maxProducts) continue;
                ns.print(`Division: ${divisionName}`);
                while (ns.corporation.getCorporation().funds < investmentAmount || isMakingProduct(ns, divisionName)) {
                    await ns.corporation.nextUpdate();
                }

                const newProductName = divisionName.substring(0, divisionName.length - 5) + "-" + ns.formatNumber(investmentAmount, 0) + "-" + i;

                if (productExists(ns, divisionName, newProductName)) {
                    continue;
                }

                ns.print(`Making product: ${newProductName}`);
                ns.tprint(`Making product: ${newProductName}`);

                if (division.products.length >= division.maxProducts) {
                    const worstProduct = findWorstProduct(ns, divisionName);
                    if(worstProduct.designInvestment + worstProduct.advertisingInvestment > investmentAmount)
                        continue;
                    ns.corporation.discontinueProduct(divisionName, worstProduct.name);

                }

                ns.corporation.makeProduct(divisionName, "Sector-12", newProductName, investmentAmount / 2, investmentAmount / 2);

                ns.corporation.sellProduct(divisionName, "Sector-12", newProductName, "MAX", "MP", true);
                if(ns.corporation.hasResearched(divisionName, "Market-TA.I")) {
                    ns.corporation.setProductMarketTA1(divisionName, newProductName, true);
                }
                if(ns.corporation.hasResearched(divisionName, "Market-TA.II")) {
                    ns.corporation.setProductMarketTA2(divisionName, newProductName, true);
                }

            }
        }

        investmentAmount *= 10;
    }
}


function findWorstProduct(ns: NS, divisionName: string) {
    const products = getDivisionProducts(ns, divisionName);
    ns.print(`Discontinuing worst ${divisionName} product`);
    const worstProduct = products
        .filter(product => product.developmentProgress === 100)
        .reduce((a, b) => a.effectiveRating < b.effectiveRating ? a : b);
    return worstProduct;
}

function getProducts(ns: NS): Product[] {
    return ns.corporation.getCorporation().divisions
        .flatMap(divisionName =>
            ns.corporation.getDivision(divisionName).products
                .map(productName => ns.corporation.getProduct(divisionName, "Sector-12", productName)));
}

function getProductInvestment(ns: NS, productName: string): number {
    const product = getProducts(ns).find(product => product.name === productName);
    if (!product) return 0;
    return product?.advertisingInvestment + product?.designInvestment;
}

function getDivisionProducts(ns: NS, divisionName: string): Product[] {
    return ns.corporation.getDivision(divisionName).products
        .map(productName => ns.corporation.getProduct(divisionName, "Sector-12", productName));
}

function isMakingProduct(ns: NS, divisionName: string): boolean {
    return ns.corporation.getDivision(divisionName).products.filter(productName => ns.corporation.getProduct(divisionName, "Sector-12", productName).developmentProgress < 100).length > 0;
}

function productExists(ns: NS, divisionName: string, productName: string): boolean {
    return ns.corporation.getDivision(divisionName).products.includes(productName);
}