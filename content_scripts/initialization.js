import { updateProgressBar, monitorBoardDiv, waitForElm, updateProgressBarTooltip, resetUserMenuState } from './uiUpdates.js';
import { checkUrlAndStartMonitoring } from './gameMonitoring.js';

export const initializeExtension = async () => {
  console.log("Initializing extension for the first time...");
  await resetUserMenuState();
  // Click the user tag to open the menu
  const userTag = document.getElementById('user_tag');
  userTag.click();

  const dasherApp = document.getElementById('dasher_app');
  if (!dasherApp) {
    console.log("Dasher app not found");
    return;
  }

  try {
    const subsDiv = await waitForElm('.subs');
    console.log('Subs div detected');
    const subButtons = subsDiv.querySelectorAll('button.sub');
    if (subButtons.length < 5) {
      console.error(`Error: expected at least 5 buttons in menu container, but found ${subButtons.length}`);
      return;
    }
    const boardButton = subButtons[3]; // currently binded to Board Button

    boardButton.click();
    console.log("Clicked board button");

    const boardSettingsDiv = await waitForElm('.board');
    const boardBackButton = await waitForElm('.head');

    const dimensionSelector = boardSettingsDiv.querySelector('.selector');
    if (!dimensionSelector) {
      console.error('Dimension selector element not detected, initialization failed');
      return;
    }
    const the2DButton = Array.from(dimensionSelector.querySelectorAll('button')).find(button => button.textContent === '2D');
    if (!the2DButton) {
      console.error('2d button not found, initialization failed');
      return;
    }
    the2DButton.click();
    console.log('Clicked 2d button');

    const boardList = await waitForElm('.list');
    const brownBoardButton = boardList.querySelector('button[title="brown"]');
    if (!brownBoardButton) {
      console.log("Brown board button not found");
      return;
    }

    brownBoardButton.click();
    console.log("Clicked brown board button");

    const isTransparentMode = document.body.classList.contains('transp');
    if (isTransparentMode) {
      const boardOpacityDiv = await waitForElm('.board-opacity');
      const opacitySlider = boardOpacityDiv.querySelector('input.range');
      if (!opacitySlider) {
        console.error('transparency mode detected but opacity not found');
        return;
      }
      opacitySlider.value = 100;
      opacitySlider.dispatchEvent(new Event('input'));
      console.log('Opacity slider set to 100');
    } else {
      const boardBrightnessDiv = await waitForElm('.board-brightness');
      const brightnessSlider = boardBrightnessDiv.querySelector('input.range');
      if (!brightnessSlider) {
        console.error('light/dark mode detected but brightness not found');
        return;
      }
      brightnessSlider.value = 100;
      brightnessSlider.dispatchEvent(new Event('input'));
      console.log('Brightness slider set to 100');
    }

    const boardHueDiv = await waitForElm('.board-hue');
    const hueSlider = boardHueDiv.querySelector('input.range');
    if (!hueSlider) {
      console.log("Hue slider not found");
      return;
    }

    hueSlider.value = 0;
    hueSlider.dispatchEvent(new Event('input'));
    console.log("Set hue slider to 0");
    boardBackButton.click(); // return to default profile view
    userTag.click(); // Close the user menu

    // Mark the initialization as done
    chrome.storage.local.set({ initialized: true, completedBoards: 0 }, () => {
      console.log("Initialization complete, flag set in storage");
      // TODO: Understand how this works, wouldn't passing 0 in this method break updateProgressBar? 
      updateProgressBar(0, 0);
    });
  } catch (error) {
    console.error('An error occurred during initialization:', error);
  }
};

export const init = async () => {
  console.log("Initializing extension...");

  chrome.storage.local.get(['initialized'], (result) => {
    if (!result.initialized) {
      initializeExtension();
    } else {
      console.log("Extension already initialized");
      // Initialize the progress bar with current values
      chrome.storage.local.get(['completedBoards', 'currentHue'], (result) => {
        updateProgressBar(result.completedBoards, result.currentHue);
      });
    }
  });

  updateProgressBarTooltip();
  monitorBoardDiv();

  await checkUrlAndStartMonitoring();
  let currentUrl = window.location.href;

  setInterval(() => {
    if (currentUrl !== window.location.href) {
      currentUrl = window.location.href;
      checkUrlAndStartMonitoring();
    }
  }, 1000);
};
