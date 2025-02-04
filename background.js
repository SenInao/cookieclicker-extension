let gamestate = {nextTick: null}
let previousGamestate = gamestate
let cookieTimer = 0
let notifications = []

function getPlotChanges(prevPlot, currPlot, plants) {
  let changes = []
  for (let y = 0;y<6;y++) {
    for (let x = 0;x<6;x++) {
      let prevTile = prevPlot[y][x]
      let currTile = currPlot[y][x]
      if (!currTile[0] && !prevTile[0]) {
        continue
      }

      if (prevTile[0] && !currTile[0]) {
        changes.push("A plant has died")
        continue
      } else if (!prevTile[0] && currTile[0]) {
        changes.push("A new plant has appeared")
        continue
      } else {
        let maturity = plants[prevTile[0]-1].mature
        if (prevTile[1] < maturity && currTile[1] >= maturity) {
          changes.push("A plant has grown up!")
        }
      }
    }
  }
  return changes
}

function stateUpdater() {
  chrome.tabs.query({}, tabs => {
    const cookieTab = tabs.find(tab => tab.url === "https://orteil.dashnet.org/cookieclicker/")
    if (cookieTab) {
      chrome.scripting.executeScript(
        {
          target: { tabId: cookieTab.id },
          func: getContent,
          world: 'MAIN'
        },
        (results) => {
          if (results?.[0]?.result) {
            previousGamestate = gamestate
            gamestate = results[0].result

            if (previousGamestate.nextTick < gamestate.nextTick) {
              notifications.push(...getPlotChanges(previousGamestate.plot, gamestate.plot, gamestate.plants))
            }

            if (gamestate.goldencookies && !cookieTimer) {
              notifications.push("A Golden cookie has appeared")
              cookieTimer = 1
              setTimeout(()=>{cookieTimer=0}, 10000)
            }

            if (notifications.length) {
              notifyUser(notifications.join("\n"))
              notifications = []
            }
          }
        }
      )
    }
  })
}

function notifyUser(msg) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon.png"),
    title: "Cookie notification",
    message: msg,
    priority: 2
  });
}

function getContent() {
  function formatCookies(cookies) {
    const suffixes = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion"]
    const tier = Math.log10(cookies) / 3 | 0
    if (tier === 0) return cookies.toFixed(2)
    const suffix = suffixes[tier]
    const scale = Math.pow(10, tier * 3)
    const scaled = cookies / scale
    return `${scaled.toFixed(3)} ${suffix}`
  }

  return window.Game ? {
    cookies: formatCookies(Game.cookies),
    nextTick: (Game.Objects["Farm"].minigame.nextStep - Date.now()) / 1000,
    plot: Game.Objects["Farm"].minigame.plot,
    plants: Game.Objects["Farm"].minigame.plantsById,
    goldencookies: Game.shimmers.length
  } : null
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getContent") {
    if (gamestate) {
      sendResponse({active:true, game:gamestate})
    } else {
      sendResponse({active:false})
    }
  } else if (message.action === "getUpdates") {
    if (notifications.length) {
      sendResponse(notifications)
      notifications = []
    } else {
      sendResponse(null)
    }
  }
})

setInterval(stateUpdater, 100)
