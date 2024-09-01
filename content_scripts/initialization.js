import { updateProgressBar, monitorBoardDiv, waitForElm, updateProgressBarTooltip } from './uiUpdates.js';
import { checkUrlAndStartMonitoring } from './gameMonitoring.js';

export const initializeExtension = () => {
  console.log("Initializing extension for the first time...");

  // Click the user tag to open the menu
  const userTag = document.getElementById('user_tag');
  userTag.click();

  const dasherApp = document.getElementById('dasher_app');
  if (!dasherApp) {
    console.log("Dasher app not found");
    return;
  }

  waitForElm('.subs').then((subsDiv) => {
    console.log('Subs div detected');
    const boardButton = Array.from(subsDiv.querySelectorAll('button')).find(button => button.textContent === 'Board');
    if (!boardButton) {
      console.log("Board button not found");
      return;
    }

    boardButton.click();
    console.log("Clicked board button");

    waitForElm('.board').then((boardSettingsDiv) => {
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

      waitForElm('.list').then((boardList) => {
        const brownBoardButton = boardList.querySelector('button[title="brown"]');
        if (!brownBoardButton) {
          console.log("Brown board button not found");
          return;
        }

        brownBoardButton.click();
        console.log("Clicked brown board button");

        const isTransparentMode = document.body.classList.contains('transp');
        if (isTransparentMode) {
          waitForElm('.board-opacity').then((boardOpacityDiv) => {
            const opacitySlider = boardOpacityDiv.querySelector('input.range');
            if (!opacitySlider) {
              console.error('transparency mode detected but opacity not found');
              return;
            }
            opacitySlider.value = 100;
            opacitySlider.dispatchEvent(new Event('input'));
            console.log('Opacity slider set to 100');
          });
        } else {
          waitForElm('.board-brightness').then((boardBrightnessDiv) => {
            const brightnessSlider = boardBrightnessDiv.querySelector('input.range');
            if (!brightnessSlider) {
              console.error('light/dark mode detected but brightness not found');
              return;
            }
            brightnessSlider.value = 100;
            brightnessSlider.dispatchEvent(new Event('input'));
            console.log('Brightness slider set to 100');
          });
        }

        waitForElm('.board-hue').then((boardHueDiv) => {
          const hueSlider = boardHueDiv.querySelector('input.range');
          if (!hueSlider) {
            console.log("Hue slider not found");
            return;
          }

          hueSlider.value = 0;
          hueSlider.dispatchEvent(new Event('input'));
          console.log("Set hue slider to 0");
          userTag.click(); // Close the user menu

          // Mark the initialization as done
          chrome.storage.local.set({ initialized: true, completedBoards: 0 }, () => {
            console.log("Initialization complete, flag set in storage");
            // TODO: Understand how this works, wouldn't passing 0 in this method break updateProgressBar? 
            updateProgressBar(0, 0);
          });
        });
      });
    });

  });
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
