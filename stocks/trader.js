/** @param {NS} ns */
export async function main(ns) {
	// Logging
	ns.disableLog('ALL');
	//ns.disableLog('sleep');
	//ns.disableLog('getServerMoneyAvailable');
	ns.tail();

	// Globals
	const scriptTimer = 2000; // Time script waits
	const moneyKeep = 1000000000; // Failsafe Money
	const stockBuyOver_Long = 0.60; // Buy stocks when forcast is over this % 
	const stockBuyUnder_Short = 0.40; // Buy shorts when forcast is under this % 
	const stockVolatility = 0.05; // Stocks must be under this volatility 
	const minSharePercent = 5;
	const maxSharePercent = 1.00;
	const sellThreshold_Long = 0.55; // Sell Long when chance of increasing is under this
	const sellThreshold_Short = 0.40; // Sell Short when chance of increasing is under this
	const shortUnlock = false;  // Set true when short stocks are available to player

	// Functions
	function buyPositions(stock) {
		let position = ns.stock.getPosition(stock);
		let maxShares = (ns.stock.getMaxShares(stock) * maxSharePercent) - position[0];
		let maxSharesShort = (ns.stock.getMaxShares(stock) * maxSharePercent) - position[2];
		let askPrice = ns.stock.getAskPrice(stock);
		let forecast = ns.stock.getForecast(stock);
		let volatilityPercent = ns.stock.getVolatility(stock);
		let playerMoney = ns.getPlayer().money;


		// Look for Long Stocks to buy
		if (forecast >= stockBuyOver_Long && volatilityPercent <= stockVolatility) {
			if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePercent, "Long")) {
				let shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxShares);
				let boughtFor = ns.stock.buyStock(stock, shares);

				if (boughtFor > 0) {
					ns.print('Bought ' + shares + ' Long shares of ' + stock + ' for ' + ns.nFormat(boughtFor, '$0.000a'));
				}
			}
		}

		// Look for Short Stocks to buy
		if (shortUnlock) {
			if (forecast <= stockBuyUnder_Short && volatilityPercent <= stockVolatility) {
				if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePercent, "Short")) {
					let shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxSharesShort);
					let boughtFor = ns.stock.buyShort(stock, shares);

					if (boughtFor > 0) {
						ns.print('Bought ' + shares + ' Short shares of ' + stock + ' for ' + ns.nFormat(boughtFor, '$0.000a'));
					}
				}
			}
		}
	}

	function sellIfOutsideThreshdold(stock) {
		let position = ns.stock.getPosition(stock);
		let forecast = ns.stock.getForecast(stock);

		if (position[0] > 0) {
			ns.print(stock + ' 4S Forcast -> ' + forecast.toFixed(2));

			// Check if we need to sell Long stocks
			if (forecast < sellThreshold_Long) {
				let soldFor = ns.stock.sellStock(stock, position[0]);

				ns.print('Sold ' + stock + ' Long shares of ' + stock + ' for ' + ns.nFormat(soldFor, '$0.000a'));
			}
		}

		if (shortUnlock) {
			if (position[2] > 0) {
				ns.print(stock + ' 4S Forcast -> ' + forecast.toFixed(2));

				// Check if we need to sell Short stocks
				if (forecast > sellThreshold_Short) {
					let soldFor = ns.stock.sellShort(stock, position[2]);

					ns.print('Sold ' + stock + ' Short shares of ' + stock + ' for ' + ns.nFormat(soldFor, '$0.000a'));
				}
			}
		}
	}


	// Main Loop
	while (true) {
		// Get stocks in order of favorable forcast
		let orderedStocks = ns.stock.getSymbols().sort(function (a, b) { return Math.abs(0.5 - ns.stock.getForecast(b)) - Math.abs(0.5 - ns.stock.getForecast(a)); })
		let currentWorth = 0;

		ns.print("-------------------------------");
		ns.print('Current Forceasts:');

		for (const stock of orderedStocks) {
			const position = ns.stock.getPosition(stock);

			if (position[0] > 0 || position[2] > 0) {
				ns.print(stock + ' Position -> ' + position[0]);

				// Check if we need to sell
				sellIfOutsideThreshdold(stock);
			}

			// Check if we should buy
			buyPositions(stock);

			// Track out current profit over time...
			if (position[0] > 0 || position[2] > 0) {
				let longShares = position[0];
				let longPrice = position[1];
				let shortShares = position[2];
				let shortPrice = position[3];
				let bidPrice = ns.stock.getBidPrice(stock);

				// Calculate profit
				let profit = longShares * (bidPrice - longPrice) - (2 * 100000);
				let profitShort = shortShares * Math.abs(bidPrice - shortPrice) - (2 * 100000);

				// Calculate net worth
				currentWorth += profitShort + profit + (longShares * longPrice) + (shortShares * shortPrice);
			}
		}

		// Output Script Status
		ns.print('Current Stock Worth: ' + ns.formatNumber(currentWorth, '$0.000a'));
		ns.print('Current Net Worth: ' + ns.formatNumber(currentWorth + ns.getPlayer().money, '$0.000a'));
		ns.print(new Date().toLocaleTimeString() + ' - Running...');

		await ns.sleep(scriptTimer);
	}
}