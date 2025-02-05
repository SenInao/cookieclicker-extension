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

      document.getElementById("wrinkler-list").innerHTML = ""
      response.game.wrinklers.forEach(wrinkler => {
        if (wrinkler.phase > 0) {
          document.getElementById("wrinkler-list").innerHTML += `<li>${formatNumber(wrinkler.sucked)}</li>`
        }
      })


      let stocks = response.game.stocks
      let stockList = Object.keys(stocks).sort((a, b) => (stocks[a].val - stocks[b].val))
      document.getElementById("stock-list").innerHTML = "<tr><th>Stock</th><th>Price</th><th>Owned</th></tr>"

      stockList.forEach((key)=>{
        if (stocks[key].active) {
          document.getElementById("stock-list").innerHTML += `<tr><td>${stocks[key].name}</td> <td>${stocks[key].val.toFixed(2)}$</td><td>${stocks[key].bought}/${stocks[key].maxStock}</td></tr>`
        }
      })
    }
  });
}

setInterval(update, 100);
