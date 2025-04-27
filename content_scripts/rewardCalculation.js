import { 
  updateProgressBar,  
  updateHueRotateStyle,
  updateProgressBarTooltip,
  updateBoardStyle,   
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
  GLADIATOR_PENALTY, 
  LEVEL_CAP, 
} from './constants.js';


export const getInitialRewardValue = (game) => {
  return new Promise((resolve) => {
    const timeControl = game.tags.TimeControl.value;
    const [initialTime, increment] = timeControl.split('+').map(Number);

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
      return;
    }
    await setCompletedBoards(completedBoards);
    updateBoardStyle(completedBoards);
    await cleanupPerkStateOnLevelUp();
  }
  updateHueRotateStyle(updatedHue);
  await setCurrentHue(updatedHue);
  await updateProgressBar();
}

export const applyGladiatorPenalty = async () => {
  let updatedHue = await getCurrentHue() - GLADIATOR_PENALTY;
  if (updatedHue < 0) updatedHue = 0;
  console.log(`applyGladiatorPenalty: new hue is ${updatedHue}`);
  updateHueRotateStyle(updatedHue);
  await setCurrentHue(updatedHue);
  await updateProgressBar();
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