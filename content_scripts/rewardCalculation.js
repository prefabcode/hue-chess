import { 
  updateProgressBar, 
  waitForElm, 
  updateHueRotateStyle,
  updateProgressBarTooltip, 
  resetUserMenuState, 
  createChallengeCompletionModal 
} from './uiUpdates.js';
import { 
  getActivePerks, 
  setAllowGladiatorPerkRemoval, 
  resetGladiatorLossBuffer, 
  setPlayedOpenings, 
  resetProgress, 
  updateActivePerks, 
  getCurrentHue,
  setCurrentHue,
  getCompletedBoards,
  setCompletedBoards,
  incrementPrestige
} from './storageManagement.js';
import { calculatePerkBonuses } from './perks.js';
import {
  browser, 
  LEVEL_CAP, 
} from './constants.js';


export const getInitialRewardValue = (game) => {
  return new Promise((resolve) => {
    const timeControl = game.tags.TimeControl.value;
    const [initialTime, increment] = timeControl.split('+').map(Number);

    // Calculate estimated game duration
    const estimatedDuration = initialTime + (40 * increment);
    const bulletDuration = 179;
    const rewardMultiplier = Math.ceil(3.5 * (estimatedDuration / bulletDuration));
    const rewardRange = [rewardMultiplier - 1, rewardMultiplier + 1];
    let gameType;

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
  let { incrementValue, gameType } = await getInitialRewardValue(game);
  console.log(`incrementHue: initial increment value ${incrementValue}`);

  const perkBonus = await calculatePerkBonuses(incrementValue, gameType, game);
  console.log(`incrementHue: perk bonus: ${perkBonus}`);

  incrementValue += perkBonus;
  let updatedHue = await getCurrentHue() + incrementValue;

  if (updatedHue >= 100) {
    
    updatedHue = updatedHue - 100;
    console.log('IncrementHue: > 100 hue reached, resetting to 0 and changing board');

    let completedBoards = await getCompletedBoards() + 1;
    if (completedBoards >= LEVEL_CAP) {
      await incrementPrestige();
      await resetProgress();
      createChallengeCompletionModal();
      return;
    }
    await setCompletedBoards(completedBoards);
    await changeToNextBoardInUi();
    await cleanupPerkStateOnLevelUp();
  }
  await updateHueRotateStyle(updatedHue);
  await setCurrentHue(updatedHue);
  await updateProgressBar();
}

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
        browser.storage.local.set({ currentHue: newHue }, () => {
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

const changeToNextBoardInUi = async () => {
  await resetUserMenuState();
  const userTag = await waitForElm('#user_tag');
  userTag.click();

  const dasherApp = document.getElementById('dasher_app');
  if (!dasherApp) {
    console.log("changeToNextBoardInUi: dasher app element not found");
    return;
  }

  const subsDiv = await waitForElm('.subs');
  console.log('changeToNextBoardInUi: subs div detected');
  const subButtons = subsDiv.querySelectorAll('button.sub');
  if (subButtons.length < 5) {
    console.error(`changeToNextBoardInUi: expected at least 5 buttons in menu container, but found ${subButtons.length}`);
    return;
  }
  const boardButton = subButtons[3]; // currently binded to Board Button

  boardButton.click();
  console.log("changeToNextBoardInUi: clicked board button in menu");

  const boardBackButton = await waitForElm('.head');

  const boardList = dasherApp.querySelector('.list');
  const activeButton = boardList.querySelector('button.active');
  const nextButton = activeButton.nextElementSibling;
  if (nextButton) {
    nextButton.click();
    console.log('changeToNextBoardInUi: clicked next board button.');
  }

  boardBackButton.click();
  userTag.click();
};

const cleanupPerkStateOnLevelUp = async () => {
  const activePerks = await getActivePerks();
  if (activePerks.includes('gladiator')) {
    await resetGladiatorLossBuffer();
    await setAllowGladiatorPerkRemoval(true);
    updateActivePerks('gladiator', false);
  }
  await setPlayedOpenings([]);
  await updateProgressBarTooltip();
};