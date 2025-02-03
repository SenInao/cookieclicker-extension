chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getContent") {
    chrome.tabs.query({}, tabs => {
      const cookieTab = tabs.find(tab => tab.url.includes("cookieclicker"));
      if (!cookieTab) {
        sendResponse({ active: false });
        return true;
      }

      chrome.scripting.executeScript({
        target: { tabId: cookieTab.id },
        func: getContent,
        world: 'MAIN'
      }, (results) => {
        if (results?.[0]?.result) {
          sendResponse({ active: true, game: results[0].result });
        } else {
          sendResponse({ active: false });
        }
      });
    });
    return true;
  }
});

function getContent() {
  function formatCookies(cookies) {
    const suffixes = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion"];
    const tier = Math.log10(cookies) / 3 | 0;
    if (tier === 0) return cookies.toFixed(2);
    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = cookies / scale;
    return `${scaled.toFixed(3)} ${suffix}`;
  }
  let nextTick = (Game.Objects["Farm"].minigame.nextStep - Date.now()) / 1000

  return window.Game ? {
    cookies: formatCookies(Game.cookies),
    nextTick: nextTick
  } : null;
}

