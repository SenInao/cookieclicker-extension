import { getContent } from "./inject.js"

let gamestate = null
let previousGamestate = gamestate
let notifications = []

function getPlotChanges(prevPlot, currPlot, plants) {
  let changes = []
  for (let y = 0;y<6;y++) {
    for (let x = 0;x<6;x++) {
      let msg = ""
      let prevTile = prevPlot[y][x]
      let currTile = currPlot[y][x]
      if (!currTile[0] && !prevTile[0]) {
        continue
      }

      if (prevTile[0] && !currTile[0]) {
        msg = `${plants[prevTile[0]-1].name} has died!`
      } else if (!prevTile[0] && currTile[0]) {
        msg = `${plants[currTile[0]-1].name} has Appeared!`
      } else {
        let maturity = plants[prevTile[0]-1].mature
        if (prevTile[1] < maturity && currTile[1] >= maturity) {
          msg = `${plants[currTile[0]-1].name} has grown up!`
        }
      }
      if (msg) {
        changes.push(msg)
      }
    }
  }
  return changes
}

function checkShimmerSpawn(prevShimmers, currShimmers) {
  if (prevShimmers.length < currShimmers.length) {
    return 1
  } else if (!prevShimmers.length && !currShimmers.length) {
    return 0
  } else if (prevShimmers.length > currShimmers.length) {
    return 0
  }

  return 0
}

function getMarketChanges(prevStocks, currStocks) {
  let changes = []
  Object.keys(currStocks).forEach((key)=>{
    if (currStocks[key].active && currStocks[key].val < 2 && prevStocks[key].val >= 2) {
      changes.push(`${currStocks[key].name} stock has gone below 2!`)
    }
  })
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
        }, (results) => {
          if (results?.[0]?.result) {
            handleGamestate(results[0].result)
          }
        }
      )
    }
  })
}

function handleGamestate(newgamestate) {
  previousGamestate = gamestate
  gamestate = newgamestate

  if (!gamestate || !previousGamestate) return

  if (previousGamestate.farmT < gamestate.farmT) {
    notifications.push(...getPlotChanges(previousGamestate.plot, gamestate.plot, gamestate.plants))
  }

  if (!gamestate.buffs["Cookie storm"] && checkShimmerSpawn(previousGamestate.shimmers, gamestate.shimmers)) {
    notifications.push("A golden cookie has appeared")
  }

  if (gamestate.bankT < previousGamestate.bankT) {
    notifications.push(...getMarketChanges(previousGamestate.stocks, gamestate.stocks))
  }

  if (notifications.length) {
    notifyUser(notifications.join("\n"))
    notifications = []
  }
}

function notifyUser(msg) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon.png"),
    title: "Cookie clicker",
    message: msg,
    priority: 2
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getContent") {
    if (gamestate) {
      sendResponse({active:true, game:gamestate})
    } else {
      sendResponse({active:false})
    }
  }
})

setInterval(stateUpdater, 100)
