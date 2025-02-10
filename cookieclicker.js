function formatNumber(cookies) {
  if (!cookies) return ""
  const suffixes = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion"]
  const tier = Math.log10(cookies) / 3 | 0
  if (tier === 0) return cookies.toFixed(2)
  const suffix = suffixes[tier]
  const scale = Math.pow(10, tier * 3)
  const scaled = cookies / scale
  return `${scaled.toFixed(3)} ${suffix}`
}

function appendElement(parent, type, content, color="") {
  let el = document.createElement(type)
  el.innerHTML = content
  el.style.color = color
  parent.appendChild(el)
}

function update() {
  chrome.runtime.sendMessage({ action: "getContent" }, (response) => {
    if (response?.active && response.game) {
      document.getElementById("cookies").textContent = "Total: " + formatNumber(response.game.cookies);
      document.getElementById("nextTick").textContent = "Next tick in: " + Math.round(response.game.farmT);
      document.getElementById("cps").textContent = "CPS: " + formatNumber(response.game.cps)

      let wrinklerTotal = 0
      document.getElementById("wrinkler-list").innerHTML = ""
      response.game.wrinklers.forEach(wrinkler => {
        if (wrinkler.phase > 0) {
          document.getElementById("wrinkler-list").innerHTML += `<li>${formatNumber(wrinkler.sucked*1.1)}</li>`
          wrinklerTotal+=wrinkler.sucked*1.1
        }
      })
      document.getElementById("wrinkler-total").innerText = `Total: ${formatNumber(wrinklerTotal)}`
      
      document.getElementById("buffs-container").innerHTML = ""
      Object.keys(response.game.buffs).forEach(buff => {
        document.getElementById("buffs-container").innerHTML+=`<label>${buff}: ${(response.game.buffs[buff].time/30).toFixed(0)}</label>`
      })

      let stocks = response.game.stocks
      let stockList = Object.keys(stocks).sort((a, b) => stocks[a].currentPrice - stocks[b].currentPrice)
      document.getElementById("stock-list").innerHTML = "<tr><th>Stock</th><th>Price</th><th>Owned</th><th>Trend</th><th>Valuation</th></tr>"

      stockList.forEach((key)=>{
        if (stocks[key].active) {
          let rowEl = document.createElement("tr")

          appendElement(rowEl, "td", stocks[key].symbol + " (" + stocks[key].restingValue + "$)")
          appendElement(rowEl, "td", stocks[key].currentPrice + "$")

          let color = stocks[key].bought > 0 ? "lightgreen" : null
          appendElement(rowEl, "td", stocks[key].bought + "/" + stocks[key].maxStock, color)

          color = stocks[key].modeLabel.includes("Rise") ? "lightgreen" : stocks[key].modeLabel.includes("Fall") ? "red" : "orange"
          appendElement(rowEl, "td", stocks[key].modeLabel, color)

          color = stocks[key].valuation.includes("Overvalued") ? "lightgreen" : "red"
          appendElement(rowEl, "td", stocks[key].strength.toFixed(0) + "%", color)

          document.getElementById("stock-list").appendChild(rowEl)
        }
      })
    }
  });
}

setInterval(update, 100);
