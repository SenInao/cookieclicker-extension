function formatNumber(cookies) {
  const suffixes = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion"]
  const tier = Math.log10(cookies) / 3 | 0
  if (tier === 0) return cookies.toFixed(2)
  const suffix = suffixes[tier]
  const scale = Math.pow(10, tier * 3)
  const scaled = cookies / scale
  return `${scaled.toFixed(3)} ${suffix}`
}

function update() {
  chrome.runtime.sendMessage({ action: "getContent" }, (response) => {
    if (response?.active) {
      document.getElementById("cookies").textContent = formatNumber(response.game.cookies);
      document.getElementById("nextTick").textContent = "Next tick in: " + Math.round(response.game.farmT);

      let wrinklerTotal = 0
      document.getElementById("wrinkler-list").innerHTML = ""
      response.game.wrinklers.forEach(wrinkler => {
        if (wrinkler.phase > 0) {
          document.getElementById("wrinkler-list").innerHTML += `<li>${formatNumber(wrinkler.sucked*1.1)}</li>`
          wrinklerTotal+=wrinkler.sucked*1.1
        }
      })
      document.getElementById("wrinkler-total").innerText = `Total: ${formatNumber(wrinklerTotal)}`


      let stocks = response.game.stocks
      let stockList = Object.keys(stocks).sort((a, b) => (stocks[a].val - stocks[b].val))
      document.getElementById("stock-list").innerHTML = "<tr><th>Stock</th><th>Price</th><th>Owned</th><th>Trend</th></tr>"

      stockList.forEach((key)=>{
        if (stocks[key].active) {
          let rowEl = document.createElement("tr")

          let nameEl = document.createElement("td")
          nameEl.innerText = stocks[key].name
          rowEl.appendChild(nameEl)

          let valueEl = document.createElement("td")
          valueEl.innerText = stocks[key].val.toFixed(2)
          rowEl.appendChild(valueEl)

          let shareEl = document.createElement("td")
          shareEl.innerText = stocks[key].bought + "/" + stocks[key].maxStock
          if (stocks[key].bought > 0) {
            shareEl.style.color = "lightgreen"
          }
          rowEl.appendChild(shareEl)

          let trendEl = document.createElement("td")
          trendEl.innerText = stocks[key].d.toFixed(2) + "%"
          if (stocks[key].d > 0) {
            trendEl.style.color = "lightgreen"
          } else {
            trendEl.style.color = "red"
          }
          rowEl.appendChild(trendEl)

          document.getElementById("stock-list").appendChild(rowEl)
        }
      })
    }
  });
}

setInterval(update, 100);
