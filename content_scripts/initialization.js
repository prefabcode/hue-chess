import {
  updateProgressBar,   
  updateProgressBarTooltip,  
  updateHueRotateStyle,
  updateBoardStyle
} from './uiUpdates.js';
import { checkUrlAndStartMonitoring } from './gameMonitoring.js';
import {
  browser, 
  CURRENT_VERSION 
} from './constants.js';
import { getCompletedBoards, getCurrentHue, setCompletedBoards, setCurrentHue } from './storageManagement.js';

function createOnboardingModal() {
  const dialog = document.createElement('dialog');
  dialog.id = 'hue-onboarding-modal';
  
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="close-button-anchor">
      <button id="close-hue-onboarding-modal-x" class="close-button" data-icon="" aria-label="Close"></button>
    </div>
    <div class="scrollable dialog-content">
      <h2>Welcome to Hue Chess!</h2>
      <p>Hue Chess adds gamification elements to Lichess. With this extension enabled, you'll earn <strong>Hue Points</strong> every time you win a game. These points slightly change the color of your chessboard, and are also used to track your progress throughout each level. </p>
      
      <h3>Discover Exciting Perks</h3>
      <p>Hue Chess features a <strong>Perk System</strong> that boosts the number of Hue Points you earn for every win, in exchange for completing specific challenges on Lichess. As you progress and gain levels in Hue Chess, you'll unlock new perks that provide different ways to accumulate even more Hue Points for your victories!</p>
      
      <h3>Level Up with Hue Points</h3>
      <p>Each level requires 100 Hue Points, and every level features a unique chessboard theme. Journey through 15 distinct levels, discover 12 unique perks, and complete the Hue Chess Challenge!</p>

      <h3>Get Started</h3>
      <p>To choose your perks, simply click on the <strong>Hue Progress Bar</strong> in the top right corner of your navigation bar.</p>
      
      <button id="close-hue-onboarding-modal" class="button" style="margin-top: 20px;">Get Started!</button>
    </div>
  `;

  dialog.appendChild(content);
  document.body.appendChild(dialog);

  dialog.showModal();

  document.getElementById('close-hue-onboarding-modal').addEventListener('click', () => {
    dialog.close();
    dialog.remove();
  });

  document.getElementById('close-hue-onboarding-modal-x').addEventListener('click', () => {
    dialog.close();
    dialog.remove();
  });
}


export const initializeExtension = async () => {
  console.log("initializeExtension: Initializing hue-chess...");
  createOnboardingModal();
  await setCompletedBoards(0);
  await setCurrentHue(0);

  return new Promise((resolve) => {
    browser.storage.local.set({ initialized: false}, () => {
      resolve();
    });
  });
};

export const init = async () => {
  console.log("Init: Running Hue-Chess...");

  await checkIfInitialized();
  await versionCheck();
  
  const currentLevel = await getCompletedBoards();
  const currentHue = await getCurrentHue();
  updateBoardStyle(currentLevel);
  updateHueRotateStyle(currentHue);
  
  await updateProgressBar();
  await updateProgressBarTooltip();
  
  await checkUrlAndStartMonitoring();
  let currentUrl = window.location.href;

  setInterval(() => {
    if (currentUrl !== window.location.href) {
      currentUrl = window.location.href;
      checkUrlAndStartMonitoring();
    }
  }, 1000);
};

const checkIfInitialized = async () => {
  return new Promise((resolve) => {
    browser.storage.local.get(['initialized'], async (result) => {
      if (!result.initialized) {
        await initializeExtension();
      } 
      resolve();
    });
  })
}

const versionCheck = async () => {
  return new Promise((resolve) => {
    browser.storage.local.get(['version'], async (result) => {
      if (!result.version || result.version !== CURRENT_VERSION) {
        console.log(`versionCheck: incorrect version detected, setting new version: ${CURRENT_VERSION} and running update logic`);
        await browser.storage.local.set(
          {
            activePerks: [],
            version: CURRENT_VERSION,
          }
        );
      }
      resolve();
    });
  });
}