function update() {
  chrome.runtime.sendMessage({ action: "getContent" }, (response) => {
    if (response?.active) {
      document.getElementById("cookies").textContent = response.game.cookies;
      document.getElementById("nextTick").textContent = response.game.nextTick;
    }
  });
}

setInterval(update, 100);
