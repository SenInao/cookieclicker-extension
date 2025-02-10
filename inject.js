export function getContent() {
  function getStockTrend(stock) {
    const bank = Game.Objects.Bank;
    const bankLevel = bank.level;
    const stockId = stock.symbol

    // Get stock's position in the goods list for resting value calculation
    const goodsList = Object.keys(bank.minigame.goods);
    const stockIndex = goodsList.indexOf(stock.building.name);
    const restingValue = 10 * (stockIndex + 1) + bankLevel - 1;

    // Trend analysis
    const modeLabels = [
      "Stable", "Slow Rise", "Slow Fall", 
      "Rapid Rise", "Rapid Fall", "Chaotic"
    ];

    const currentTrend = {
      symbol: stockId,
      currentPrice: stock.val.toFixed(2),
      restingValue: restingValue.toFixed(2),
      mode: stock.mode,
      modeLabel: modeLabels[stock.mode],
      valuation: stock.val < restingValue ? "Undervalued" : "Overvalued",
      strength: Math.abs(stock.val - restingValue)/restingValue * 100,

      maxStock: Game.Objects.Bank.minigame.getGoodMaxStock(stock),
      bought: stock.stock,
      active: stock.active,
      name: stock.name
    };

    // Generate summary
    currentTrend.summary = `${stock.name}: ${currentTrend.modeLabel} (${currentTrend.deltaDirection})\n` +
      `Price: $${currentTrend.currentPrice} | Resting: $${currentTrend.restingValue}\n` +
      `${currentTrend.valuation} (${currentTrend.strength.toFixed(1)}% ${stock.val < restingValue ? "below" : "above"})`;

    return currentTrend;
  }


  if (!window.Game) return null

  let goods = Game.Objects.Bank.minigame.goods
  let stocks = {}
  Object.keys(goods).forEach(key => {
    stocks[key] = getStockTrend(goods[key])
  })
  
  return {
    cookies: Game.cookies,
    cps: Game.cookiesPs,
    shimmers: Game.shimmers,
    buffs: Game.buffs,

    farmT: (Game.Objects.Farm.minigame.nextStep - Date.now()) / 1000,
    plot: Game.Objects.Farm.minigame.plot,
    plants: Game.Objects.Farm.minigame.plantsById,

    stocks: stocks,
    bankT: Game.Objects.Farm.minigame.tickT/30,

    wrinklers: Game.wrinklers
  }
}
