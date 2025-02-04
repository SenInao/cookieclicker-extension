chrome.runtime.sendMessage({ action: "getUpdates" }, (response) => {
  console.log(response)
  if (response) {
    response.forEach(res => {
      let liEl = document.createElement("li")
      liEl.innerHTML = res
      document.getElementById("notifications").appendChild(liEl)
    })
  }
});
