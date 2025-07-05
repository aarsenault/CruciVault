// background.js

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    console.log("Setting side panel behavior to open on action click");
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } else {
    console.log("Side panel API not available");
  }
});

// fallback
chrome.action.onClicked.addListener((tab) => {
  if (chrome.sidePanel && chrome.sidePanel.open) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  } else {
    console.log("Side panel API not available for opening");
  }
});
