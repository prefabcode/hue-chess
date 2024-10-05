import { updateProgressBar, waitForElm, updateProgressBarTooltip, resetUserMenuState, createChallengeCompletionModal } from './uiUpdates.js';
import { getActivePerks, setAllowGladiatorPerkRemoval, resetGladiatorLossBuffer, setPlayedOpenings, resetProgress } from './storageManagement.js';
import { calculatePerkBonuses } from './perks.js';


export const getInitialRewardValue = (game) => {
  return new Promise((resolve) => {
    const timeControl = game.tags.TimeControl.value;
    const [initialTime, increment] = timeControl.split('+').map(Number);

    // Calculate estimated game duration
    const estimatedDuration = initialTime + (40 * increment);
    let bulletDuration = 179; 

    let gameType;
    let rewardMultiplier = Math.ceil(4 * (estimatedDuration / bulletDuration));
    let rewardRange = [rewardMultiplier - 1, rewardMultiplier + 1];


    if (estimatedDuration < 29) {
      gameType = 'UltraBullet';
    } else if (estimatedDuration < 179) {
      gameType = 'Bullet';
    } else if (estimatedDuration < 479) {
      gameType = 'Blitz';
    } else if (estimatedDuration < 1499) {
      gameType = 'Rapid';
    } else {
      gameType = 'Classical';
    }

    const [min, max] = rewardRange;
    const incrementValue = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`Detected game type: ${gameType}, setting increment value to
${incrementValue}`);
    resolve({ incrementValue, gameType });
  });
};

export const incrementHue = async (game) => {
  console.log('game obj', game);
  let { incrementValue, gameType } = await getInitialRewardValue(game);
  console.log(`initial increment value ${incrementValue}`);

  const perkBonus = await calculatePerkBonuses(incrementValue, gameType, game);
  console.log(`Perk bonus: ${perkBonus}`);

  incrementValue += perkBonus;

  try {
    await resetUserMenuState();
    const userTag = await waitForElm('#user_tag');
    userTag.click();

    const dasherApp = document.getElementById('dasher_app');
    if (!dasherApp) {
      console.log("Dasher app not found");
      return;
    }

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

    const boardHueDiv = await waitForElm('.board-hue');
    const boardBackButton = await waitForElm('.head');
    const hueSlider = boardHueDiv.querySelector('input.range');
    if (!hueSlider) {
      console.log('Hue slider not found');
      return;
    }

    // Get the current hue value
    let currentValue = parseInt(hueSlider.value, 10);
    let newValue = currentValue + incrementValue;
    console.log(`Current hue value: ${currentValue}, New hue value: ${newValue}`);

    if (newValue >= 100) {
      let carryOverValue = newValue - 100;
      console.log('Max hue reached, resetting to 0 and changing board');

      // Reset playedOpenings array
      await setPlayedOpenings([]);
      updateProgressBarTooltip();
      console.log('Played openings reset for new level');

      // Increment completedBoards
      const result = await new Promise((resolve) => {
        chrome.storage.local.get(['completedBoards', 'prestige'], resolve);
      });
      let completedBoards = (result.completedBoards || 0) + 1;
      let prestige = result.prestige || 0;

      if (completedBoards >= 17) {
        prestige += 1;
        console.log(`Prestige level increased to: ${prestige}, and resetting to level 1`);
        boardBackButton.click();
        userTag.click();
        resetProgress(prestige);
        createChallengeCompletionModal();
        return;
      }

      // Change to the next board
      const boardList = dasherApp.querySelector('.list');
      const activeButton = boardList.querySelector('button.active');
      const nextButton = activeButton.nextElementSibling;
      if (nextButton) {
        nextButton.click();
        console.log('Clicked next board button');
      }
      
      await new Promise((resolve) => {
        chrome.storage.local.set({ completedBoards, currentHue: carryOverValue },
resolve);
      });
      console.log(`Completed boards incremented, now: ${completedBoards}`);
      updateProgressBar(completedBoards, carryOverValue);

      // Allow removal of gladiator perk on level up.
      const activePerks = await getActivePerks();
      if (activePerks.includes('gladiator')) {
        await resetGladiatorLossBuffer();
        await setAllowGladiatorPerkRemoval(true);
      }
    } else {
      // Update current hue in storage
      await new Promise((resolve) => {
        chrome.storage.local.set({ currentHue: newValue }, resolve);
      });
      updateProgressBar(null, newValue);
    }

    // Set the new value to the hue slider and dispatch the event
    hueSlider.value = newValue >= 100 ? newValue - 100 : newValue;
    hueSlider.dispatchEvent(new Event('input'));
    console.log('Updated hue slider value');
    boardBackButton.click();
    userTag.click();

  } catch (error) {
    console.error('An error occurred in incrementHue function', error);
  }
    
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
        let newHue = currentHue - 35 >= 0 ? currentHue - 35 : 0;
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