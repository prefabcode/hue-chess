import { updateProgressBar, waitForElm } from './uiUpdates.js';
import { isSpeedrunModeEnabled, getActivePerks, setAllowGladiatorPerkRemoval } from './storageManagement.js';
import { calculatePerkBonuses } from './perks.js';
import { timeControlIncrements } from './constants.js';

export const getInitialRewardValue = () => {
  return new Promise((resolve) => {
    waitForElm('.game__meta .header .setup').then((setupElement) => {
      const setupText = setupElement.innerText;

      for (const [key, value] of Object.entries(timeControlIncrements)) {
        if (setupText.includes(key)) {
          const [min, max] = value;
          const incrementValue = Math.floor(Math.random() * (max - min + 1)) + min;
          console.log(`Detected game type: ${key}, setting increment value to ${incrementValue}`);
          resolve({ incrementValue, gameType: key });
          return;
        }
      }

      // Default to 1 if no game type is detected
      console.log("No game type detected, defaulting increment value to 1");
      resolve({ incrementValue: 1, gameType: 'Unknown' });
    });
  });
};

export const incrementHue = async () => {
  let { incrementValue, gameType } = await getInitialRewardValue();
  console.log(`initial increment value ${incrementValue}`);

  // Check if Speedrun mode is enabled
  const speedrunMode = await isSpeedrunModeEnabled();
  if (speedrunMode) {
    incrementValue *= 4;
    console.log(`Speedrun mode enabled, new increment value: ${incrementValue}`);
  }

  const perkBonus = await calculatePerkBonuses(incrementValue, gameType);
  console.log(`Perk bonus: ${perkBonus}`);

  incrementValue += perkBonus;

  waitForElm('#user_tag').then((userTag) => {
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

      waitForElm('.board-hue').then(async (boardHueDiv) => {
        const hueSlider = boardHueDiv.querySelector('input.range');
        if (!hueSlider) {
          console.log("Hue slider not found");
          return;
        }

        // Get the current hue value
        let currentValue = parseInt(hueSlider.value, 10);
        let newValue = currentValue + incrementValue;
        console.log(`Current hue value: ${currentValue}, New hue value: ${newValue}`);

        if (newValue >= 100) {
          let carryOverValue = newValue - 100;
          console.log("Max hue reached, resetting to 0 and changing board");

          // Change to the next board
          const boardList = dasherApp.querySelector('.list');
          const activeButton = boardList.querySelector('button.active');
          const nextButton = activeButton.nextElementSibling;
          if (nextButton) {
            nextButton.click();
            console.log("Clicked next board button");
          }

          // Increment completedBoards
          chrome.storage.local.get(['completedBoards'], (result) => {
            const completedBoards = (result.completedBoards || 0) + 1;
            chrome.storage.local.set({ completedBoards, currentHue: carryOverValue }, () => {
              console.log(`Completed boards incremented, now: ${completedBoards}`);
              updateProgressBar(completedBoards, carryOverValue);
            });
          });
          // allow removal of gladiator perk on level up.
          const activePerks = await getActivePerks();
          if (activePerks.includes('gladiator')) {
            await setAllowGladiatorPerkRemoval(true);
          }
        } else {
          // Update current hue in storage
          chrome.storage.local.set({ currentHue: newValue }, () => {
            updateProgressBar(null, newValue);
          });
        }

        // Set the new value to the hue slider and dispatch the event
        hueSlider.value = newValue >= 100 ? newValue - 100 : newValue;
        hueSlider.dispatchEvent(new Event('input'));
        console.log("Updated hue slider value");
        userTag.click();
      });
    });
  });
};

export const applyGladiatorPenalty = async () => {
  waitForElm('#user_tag').then((userTag) => {
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

      waitForElm('.board-hue').then((boardHueDiv) => {
        const hueSlider = boardHueDiv.querySelector('input.range');
        if (!hueSlider) {
          console.log("Hue slider not found");
          return;
        }

        // Get the current hue value
        let currentHue = parseInt(hueSlider.value, 10);
        let newHue = currentHue - 20 >= 0 ? currentHue - 20 : 0;
        chrome.storage.local.set({ currentHue: newHue }, () => {
          updateProgressBar(null, newHue);
        });
        hueSlider.value = newHue
        hueSlider.dispatchEvent(new Event('input'));
        console.log(`Applying gladiator penalty. Previous hue value: ${currentHue}, New hue value: ${newHue}`);
        userTag.click();
      });
    });
  });

};