import { startBridge } from './background_scripts/bridge.js';
import { getObsStatus } from './background_scripts/obsClient.js';

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
          openSettingsModal();
      }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === 'openStreamerOverlay') {
    chrome.windows.create({
      url: chrome.runtime.getURL('streamer/overlay.html'),
      type: 'popup',
      width: 1280,
      height: 720,
    });
    return;
  }

  if (message?.action === 'getObsStatus') {
    sendResponse({ status: getObsStatus() });
  }
});

// registered so chrome starts the worker at browser launch; startBridge runs on every worker start
chrome.runtime.onStartup.addListener(() => {});
chrome.runtime.onInstalled.addListener(() => {});

startBridge();
