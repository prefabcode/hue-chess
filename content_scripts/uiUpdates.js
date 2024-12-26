import {
  confirmResetProgress, 
  updateActivePerks, 
  resetGladiatorLossBuffer, 
  setAllowGladiatorPerkRemoval, 
  getAllowGladiatorPerkRemoval, 
  getActivePerks,
  getPreparationStatus,
  setPreparationStatus, 
  getPlayingId,
  getCurrentHue,
  getCompletedBoards,
} from './storageManagement.js';
import { showPerkToast } from './perks.js';
import { levelNames, PREPARATION_TIME, TIPS, PERK_DISPLAY_NAMES, MAX_PERKS, browser, LEVEL_CAP } from './constants.js';
import tippy from 'tippy.js';

const showRandomTip = () => {
  const tipMessage = document.getElementById('tips-message');
  const randomIndex = Math.floor(Math.random() * TIPS.length);
  tipMessage.innerHTML = TIPS[randomIndex];
}

export const updateProgressBar = () => {
  return new Promise((resolve) => {
    browser.storage.local.get(['completedBoards', 'currentHue'], (result) => {
      const level = (result.completedBoards !== null ? result.completedBoards : 0) + 1;
      const progress = result.currentHue || 0;
      const levelName = levelNames[level - 1];
  
      let progressBar = document.getElementById('hue-progress-bar');
      if (!progressBar) {
        // Create progress bar
        progressBar = document.createElement('div');
        progressBar.id = 'hue-progress-bar';
        progressBar.style.display = 'flex';
        progressBar.style.alignItems = 'center';
        progressBar.style.margin = '0 10px';
        progressBar.style.flexGrow = '1';
        progressBar.style.justifyContent = 'flex-end';
  
        const progressBarContainer = document.createElement('div');
        progressBarContainer.id = 'progress-bar-container';
        progressBarContainer.style.display = 'flex';
        progressBarContainer.style.alignItems = 'center';
        progressBarContainer.style.width = '240px';
        progressBarContainer.style.cursor = 'pointer';
  
        const progressBarOuter = document.createElement('div');
        progressBarOuter.id = 'progress-bar-outer';
        progressBarOuter.style.flexBasis = '180px';
        progressBarOuter.style.height = '10px';
        progressBarOuter.style.borderRadius = '5px';
        progressBarOuter.style.backgroundColor = '#8c8c8c';
  
        const progressFill = document.createElement('div');
        progressFill.id = 'progress-fill';
        progressFill.style.height = '100%';
        progressFill.style.borderRadius = '5px';
        progressFill.style.backgroundColor = 'hsl(88, 62%, 37%)';
        progressFill.style.width = `${progress}%`;
  
        progressBarOuter.appendChild(progressFill);
        progressBarContainer.appendChild(progressBarOuter);
  
        const levelText = document.createElement('span');
        levelText.id = 'level-text';
        levelText.style.marginLeft = '10px';
        levelText.style.marginBottom = '1px';
        levelText.textContent = `Level ${level} - ${levelName}`;
  
        progressBarContainer.appendChild(levelText);
        progressBar.appendChild(progressBarContainer);
  
        const header = document.querySelector('header');
        const siteButtons = header.querySelector('.site-buttons');
        header.insertBefore(progressBar, siteButtons);
  
        progressBarContainer.addEventListener('click', openPerksModal);
  
      } else {
        const progressFill = progressBar.querySelector('#progress-fill');
        const levelText = document.getElementById('level-text');
        progressFill.style.width = `${progress}%`;
        levelText.textContent = `Level ${level} - ${levelName}`;
      }
  
      // Adapt to light and dark modes
      const isDarkMode = document.body.classList.contains('dark') || document.body.classList.contains('transp');
      if (isDarkMode) {
        const progressBarOuter = progressBar.querySelector('#progress-bar-outer');
        const progressFill = progressBar.querySelector('#progress-fill');
        progressFill.style.backgroundColor = '#f7f7f7';
        progressBarOuter.style.backgroundColor = 'hsl(37, 5%, 22%)';
      }
      resolve();
    });
  });
};

export const monitorBoardDiv = () => {
  const observer = new MutationObserver(() => {
    const boardDiv = document.querySelector('.sub.board');
    const injectedDiv = document.querySelector('#injected-div');
    if (boardDiv && !injectedDiv) {
      injectDiv(boardDiv);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

export const injectDiv = (boardDiv) => {
  // Create the injected div
  const injectedDiv = document.createElement('div');
  injectedDiv.id = 'injected-div';

  // Create the message
  const message = document.createElement('p');
  message.innerText = 'Board Settings controlled by Hue Chess Extension';

  // Create the settings button
  const settingsButton = document.createElement('button');
  settingsButton.innerText = 'Open Hue Chess Settings';
  settingsButton.classList.add('button', 'button-green', 'text');
  settingsButton.addEventListener('click', () => {
    const userTag = document.getElementById('user_tag');
    const backButton = document.querySelector('.sub.board .head');
    if (backButton) backButton.click();
    if (userTag) userTag.click();
    openPerksModal();
  });

  // Append the message and button to the injected div
  injectedDiv.appendChild(message);
  injectedDiv.appendChild(settingsButton);

  // Append the injected div to the board div
  boardDiv.appendChild(injectedDiv);

  console.log('Injected div added to .sub .board');
};

async function setImageSources() {
  const images = [
    'berzerker-icon',
    'gambiteer-icon',
    'endgame-specialist-icon',
    'gladiator-icon',
    'equalizer-icon',
    'rivalry-icon',
    'preparation-icon',
    'opportunist-icon',
    'versatility-icon',
    'knight-moves-icon',
    'aggression-icon',
    'kings-gambit-icon',
  ];

  images.forEach(imageId => {
    const imageElement = document.getElementById(imageId);
    const perkBox = imageElement.closest('.perk-box');
    const unlockLevel = parseInt(perkBox.getAttribute('data-unlock-level'), 10);
    browser.storage.local.get(['completedBoards'], (result) => {
      const playerLevel = (result.completedBoards !== null ? result.completedBoards : 0) + 1;
      if (playerLevel >= unlockLevel) {
        imageElement.src = browser.runtime.getURL(`imgs/${imageId.replace('-icon', '')}.svg`);
      } else {
        imageElement.src = browser.runtime.getURL('imgs/lock.svg');
      }
    });
  });
}

export const openPerksModal = async () => {
  try {
    // Check if the modal already exists
    let modal = document.querySelector('#hue-chess-perks-modal');
    if (modal) {
      document.body.style.overflowY = 'hidden';
      modal.showModal();
      await updatePerksModalContent();
      showRandomTip();
      return;
    }

    const response = await fetch(browser.runtime.getURL('perks.html'));
    const data = await response.text();

    // Create a temporary div to hold the fetched HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data;

    // Extract the modal element from the fetched HTML
    modal = tempDiv.querySelector('#hue-chess-perks-modal');

    // Append the modal to the body
    document.body.appendChild(modal);

    document.body.style.overflowY = 'hidden';
    modal.showModal();

    // Add event listeners for modal buttons
    document.getElementById('close-perks-modal').addEventListener('click', () => {
      document.body.style.overflowY = 'scroll';
      modal.close();
    });

    // Add event listeners for perks
    const perkBoxes = document.querySelectorAll('.perks .perk-box');
    perkBoxes.forEach(box => {
      box.addEventListener('click', async () => {
        const playingId = await getPlayingId();
        if (playingId) {
          alert("You cannot select perks while a game is in progress.");
          return;
        }
        
        if (box.classList.contains('locked')) {
          return;
        }
        const perk = box.id.replace('-perk', '');
        const isActive = box.classList.contains('active');

        if (perk === 'gladiator') {
          if (!isActive) {
            const confirmSelection = confirm("Warning: You will not be able to remove the Gladiator perk until you level up or suffer the hue point penalty. Do you want to proceed?");
            if (!confirmSelection) {
              return;
            } else {
              await resetGladiatorLossBuffer();
              await setAllowGladiatorPerkRemoval(false);
            }
          } else {
            const canRemove = await getAllowGladiatorPerkRemoval();
            if (!canRemove) {
              alert("You cannot remove the Gladiator perk until you level up or suffer the hue point penalty.");
              return;
            }
          }
        }

        if (perk === 'preparation') {
          await setPreparationStatus(false);
          const timerElement = document.querySelector('#analysis-timer');
          if (!isActive && document.querySelector('.analyse__board.main-board')) {
            startAnalysisTimer(PREPARATION_TIME);
          } else if (isActive && timerElement) {
            timerElement.remove();
          }
        }
        
        const activePerks = await getActivePerks();

        if (!isActive && activePerks.length >= MAX_PERKS) {
          alert(`You can only select up to ${MAX_PERKS} perks.`);
        } else {
          await updateActivePerks(perk, !isActive);
          box.classList.toggle('active');
        }
      });
    });

    // Update the modal content with current level and hue progress
    await setImageSources();
    await updatePerksModalContent();
    await updatePerksHeader();
    showRandomTip();
  } catch (error) {
    console.error("Error opening perks modal:", error);
  }
}

export const updatePerksModalContent = async () => {
  browser.storage.local.get(['completedBoards', 'currentHue', 'activePerks'], (result) => {
    const playerLevel = (result.completedBoards !== null ? result.completedBoards : 0) + 1;
    const huePoints = `${result.currentHue || 0}/100`;

    document.getElementById('current-level').innerText = playerLevel;
    document.getElementById('hue-points').innerText = huePoints;

    // Set active perks and handle locked perks
    const activePerks = result.activePerks || [];
    const perkBoxes = document.querySelectorAll('.perks .perk-box');
    perkBoxes.forEach(box => {
      const unlockLevel = parseInt(box.getAttribute('data-unlock-level'), 10);
      const perk = box.id.replace('-perk', '');
      const imgElement = box.querySelector('img');

      if (playerLevel >= unlockLevel) {
        box.style.display = 'flex';
        imgElement.src = browser.runtime.getURL(`imgs/${perk}.svg`);
        box.classList.remove('locked');
        box.setAttribute('data-tippy-content', box.getAttribute('data-tippy-content-original'));
      } else {
        box.style.display = 'flex';
        box.classList.add('locked');
        imgElement.src = browser.runtime.getURL('imgs/lock.svg');
        box.setAttribute('data-tippy-content', `Unlocks at Level ${unlockLevel}`);
      }

      if (activePerks.includes(perk)) {
        box.classList.add('active');
      } else {
        box.classList.remove('active');
      }
    });

    // Destroy existing Tippy instances
    tippy('.perk-box').forEach(instance => instance.destroy());

    const bodyClass = document.body.classList;
    let theme = 'light';
    if (bodyClass.contains('dark')) {
      theme = 'dark';
    } else if (bodyClass.contains('transp')) {
      theme = 'transp';
    }

    // Initialize Tippy.js tooltips
    tippy('.perk-box', {
      theme: theme,
      appendTo: () => document.querySelector('#hue-chess-perks-modal'),
      placement: 'bottom-start',
      maxWidth: 200,
      arrow: true,
      hideOnClick: false,
    });
  });
}

export const updatePerksHeader = async () => {
  const activePerks = await getActivePerks();
  const perksHeader = document.getElementById('perks-header');
  perksHeader.textContent = `Select Perks: (${activePerks.length}/${MAX_PERKS})`;
}

const openSettingsModal = async () => {
  try {
    let modal = document.querySelector('#hue-chess-settings-modal');
    if (modal) {
      document.body.style.overflowY = 'hidden';
      modal.showModal();
      return;
    }

    const response = await fetch(browser.runtime.getURL('settings.html'));
    const data = await response.text();

    // Create a temporary div to hold the fetched HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data;

    // Extract the modal element from the fetched HTML
    modal = tempDiv.querySelector('#hue-chess-settings-modal');

    // Append the modal to the body
    document.body.appendChild(modal);

    document.body.style.overflowY = 'hidden';
    modal.showModal();

    // Add event listeners for modal buttons
    document.getElementById('close-settings-modal').addEventListener('click', () => {
      document.body.style.overflowY = 'scroll';
      modal.close();
    });

    document.getElementById('reset-progress').addEventListener('click', confirmResetProgress);
    document.getElementById('sync-ui').addEventListener('click', syncLichessUIWithExtensionState);

    if (process.env.NODE_ENV !== 'production') {
      document.getElementById('dev-tools').style.display = 'block';

      document.getElementById('export-state').addEventListener('click', () => {
        browser.storage.local.get(['initialized', 'completedBoards', 'currentHue'], (result) => {
          const extensionState = {
            initialized: result.initialized,
            completedBoards: result.completedBoards,
            currentHue: result.currentHue || 0,
            activePerks: [],
          };
          
          const jsonString = JSON.stringify(extensionState);

          navigator.clipboard.writeText(jsonString);

          alert('Hue chess profile string copied to clipboard');
        });
      });

       document.getElementById('import-state').addEventListener('click', () => {
         const jsonString = prompt('Paste your game data string:').trim();
         if (!jsonString) {
           alert('Please paste a valid game data string.');
           return;
         }

         try {
           const extensionState = JSON.parse(jsonString);

           browser.storage.local.set(extensionState, () => {
            alert('Extension state imported successfully.');
            updateUIAfterImport(extensionState);
            updatePerksModalContent();
            updatePerksHeader();
           });
         } catch (error) {
           alert('Invalid game string. Please try again.');
         }
       });
    }

  }
  catch (error) {
    console.error('Error opening settings modal', err);
  }
  // Check if the modal already exists
}

// register openSettingsModal for firefox
browser.runtime.onMessage.addListener((request) => {   
  if (request.action === 'openSettingsModal') {                            
      openSettingsModal();                                                 
  }                                                                        
});

// register openSettingsModal for chrome
window.openSettingsModal = openSettingsModal;

export const waitForElm = (selector) => {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

export const updateUIAfterImport = async (extensionState) => {
  const { completedBoards, currentHue } = extensionState;

  const userTag = await waitForElm('#user_tag');
  userTag.click();
  
  const dasherApp = document.getElementById('dasher_app');
  if (!dasherApp) {
    console.error("updateUIAfterImport: dasher_app element not found");
    return;
  }

  const subsDiv = await waitForElm('.subs');
  const subButtons = subsDiv.querySelectorAll('button.sub');
  if (subButtons.length < 5) {
    console.error(`updateUIAfterImport: expected at least 5 buttons in menu container, but found ${subButtons.length}`);
    return;
  }
  const boardButton = subButtons[3];
  boardButton.click();

  const boardList = await waitForElm('.list');
  const targetBoardTitle = levelNames[completedBoards].toLowerCase();
  const targetBoardButton = boardList.querySelector(`button[title="${targetBoardTitle}"]`);
  if (!targetBoardButton) {
    console.error(`updateUIAfterImport: ${targetBoardTitle} board button not found`);
    return;
  }

  targetBoardButton.click();
  
  const boardBackButton = await waitForElm('.head');
  boardBackButton.click();
  userTag.click();

  await updateHueRotateStyle(currentHue);
  await updateProgressBar();
  await updateProgressBarTooltip();

};

let progressBarTooltipInstance = null;

export const updateProgressBarTooltip = async () => {
  browser.storage.local.get(['activePerks', 'winningStreak', 'gladiatorLossBuffer', 'preparationStatus', 'playedOpenings'], async (result) => {
    const activePerks = result.activePerks || [];
    const gladiatorLossBuffer = result.gladiatorLossBuffer || 0;
    const preparationStatus = result.preparationStatus || false;
    const playedOpenings = result.playedOpenings || [];

    await waitForElm('#hue-progress-bar');

    const progressBarContainer = document.getElementById('progress-bar-container');

    // Create the tooltip content
    let tooltipContent;
    if (activePerks.length === 0) {
      tooltipContent = '<p>No perks selected. Click the progress bar to select perks!</p>';
    } else {
      tooltipContent = '<ul class="progress-perk-tooltip">';
      activePerks.forEach(perk => {
        const displayName = PERK_DISPLAY_NAMES[perk] || perk;
        const svgIcon = browser.runtime.getURL(`imgs/${perk}.svg`);
        tooltipContent += `<li><img src="${svgIcon}" class="perk-icon" alt="${displayName} icon"/> ${displayName}`;
        if (perk === 'gladiator') {
          tooltipContent += ` (Allowed Losses: ${gladiatorLossBuffer})`;
        } else if (perk === 'preparation') {
          tooltipContent += ` (${preparationStatus ? 'Fulfilled' : 'Not Fulfilled'})`;
        } else if (perk === 'versatility') {
          tooltipContent += ` (Unique Openings: ${playedOpenings.length})`;
        }
        tooltipContent += '</li>';
      });
      tooltipContent += '</ul>';

      // If Versatility is active, add the playedOpenings list
      if (activePerks.includes('versatility') && playedOpenings.length) {
        tooltipContent += '<br><p>Played Openings:</p><ul class="versatility-openings">';
        playedOpenings.forEach(opening => {
          tooltipContent += `<li>${opening}</li>`;
        });
        tooltipContent += '</ul>';
      }
    }
    
    if (progressBarTooltipInstance) {
      progressBarTooltipInstance.destroy();
    }

    const bodyClass = document.body.classList;
    let theme = 'light';
    if (bodyClass.contains('dark')) {
      theme = 'dark';
    } else if (bodyClass.contains('transp')) {
      theme = 'transp';
    }

    // Initialize tippy.js tooltip
    progressBarTooltipInstance = tippy(progressBarContainer, {
      content: tooltipContent,
      placement: 'bottom',
      theme: theme,
      arrow: false,
      allowHTML: true,
    });
  });
};


export const startAnalysisTimer = async (analysisTimeInSeconds) => {
  const preparationStatusMet = await getPreparationStatus();
  if (preparationStatusMet) {
    return;
  }

  const analysisBoard = document.querySelector('.analyse__board.main-board');
  if (!analysisBoard) {
    console.log('Analysis board not found.');
    return;
  }

  let timerElement = document.querySelector('#analysis-timer'); 
  if (timerElement) return;

  timerElement = document.createElement('div');
  timerElement.id = 'analysis-timer';
  timerElement.className = 'analyse__clock';
  timerElement.style.position = 'absolute';
  timerElement.style.top = '-20px';
  timerElement.style.borderTopLeftRadius = '6px';
  timerElement.style.borderTopRightRadius = '6px';
  timerElement.style.borderBottomRightRadius = '0';
  timerElement.style.borderBottomLeftRadius = '0';
  timerElement.style.zIndex = '107';
  timerElement.innerText = `Preparation time left: ${formatTime(analysisTimeInSeconds)}`;
  analysisBoard.appendChild(timerElement);

  const end = Date.now() + analysisTimeInSeconds * 1000;

  let analysisTimer = setInterval(async () => {
    const timeLeft = Math.floor((end - Date.now()) / 1000);
    
    const formattedTime = formatTime(timeLeft);
    timerElement.innerText = `Preparation time left: ${formattedTime}`;

    document.title = `Preparation: ${formattedTime}`;
    
    if (timeLeft <= 0) {
      clearInterval(analysisTimer);
      timerElement.remove();
      document.title = 'Preparation: done';
      activePerks = await getActivePerks(); 
      if (activePerks.includes('preparation')) {
        setPreparationStatus(true);
        showPerkToast('preparation', 'Preparation: requirement fulfilled');
        updateProgressBarTooltip();
      }
    }
  }, 200);
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export const resetUserMenuState = async () => {
  try {
    const userTag = await waitForElm('#user_tag');
    userTag.click();

    const dasherApp = document.getElementById('dasher_app');
    if (!dasherApp) {
      console.log("Dasher app not found");
      return;
    }

    const backButton = dasherApp.querySelector('.head');
    if (backButton) {
      backButton.click();
      console.log('Menu was not in default state, clicked back button to reset');
    } else {
      console.log('Menu is already in default state');
    }
    userTag.click();
  } catch (error) {
    console.error('An error occurred while resetting the user menu state:', error);
  }
};


export const createChallengeCompletionModal = () => {
  // Create the dialog element
  const dialog = document.createElement('dialog');
  dialog.id = 'hue-challenge-completion-modal';

  // Create the content for the dialog
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="close-button-anchor">
      <button id="close-hue-challenge-completion-modal-x" class="close-button" data-icon="" aria-label="Close"></button>
    </div>
    <div class="scrollable dialog-content">
      <h2>Congratulations!</h2>
      <p>You've successfully completed the Hue Chess Challenge! 🏆</p>
      
      <h3>New Prestige Rank Unlocked!</h3>
      <p>Every time you beat level 15 you will gain a new prestige rank and a unique prestige icon visible in the perk selection menu. Your prestige icon will change as your prestige rank increases. </p>
      
      <h3>What’s Next?</h3>
      <p>Try to challenge yourself by playing one specific time control throughout an entire prestige, or a specific variant throughout an entire prestige. You can try a self-imposed "hardcore" mode, where you reset your progress if you lose a certain number of games within any given level. Reset Progress is accessible through the extension settings (it will not wipe your current prestige, just reset your level back to 1). You can also try a speedrun to a specific level. The possibilities for Hue Chess are limited by your own imagination! Good luck, have fun and experiment!</p>
      
      <button id="close-hue-challenge-completion-modal" class="button" style="margin-top: 20px;">Continue Playing</button>
    </div>
  `;

  // Append the content to the dialog
  dialog.appendChild(content);
  document.body.appendChild(dialog);

  // Show the dialog
  dialog.showModal();

  // Add event listener to close the dialog
  document.getElementById('close-hue-challenge-completion-modal').addEventListener('click', () => {
    dialog.close();
    dialog.remove();
  });

  document.getElementById('close-hue-challenge-completion-modal-x').addEventListener('click', () => {
    dialog.close();
    dialog.remove();
  });
}

const syncLichessUIWithExtensionState = async () => {
  try {
    // Ensure the board is in the correct initial state
    const userTag = await waitForElm('#user_tag');
    userTag.click();

    const dasherApp = await waitForElm('#dasher_app');
    const subsDiv = await waitForElm('.subs');
    const subButtons = subsDiv.querySelectorAll('button.sub');
    const boardButton = subButtons[3]; // Assuming this is the board button

    boardButton.click();
    console.log("Clicked board button");

    const boardSettingsDiv = await waitForElm('.board');
    const dimensionSelector = boardSettingsDiv.querySelector('.selector');
    const the2DButton =
Array.from(dimensionSelector.querySelectorAll('button')).find(button =>
button.textContent === '2D');
    the2DButton.click();
    console.log('Clicked 2D button');

    const boardList = await waitForElm('.list');
    const brownBoardButton = boardList.querySelector('button[title="brown"]');
    brownBoardButton.click();
    console.log("Clicked brown board button");

    const isTransparentMode = document.body.classList.contains('transp');
    if (isTransparentMode) {
      const boardOpacityDiv = await waitForElm('.board-opacity');
      const opacitySlider = boardOpacityDiv.querySelector('input.range');
      opacitySlider.value = 100;
      opacitySlider.dispatchEvent(new Event('input'));
      console.log('Opacity slider set to 100');
    } else {
      const boardBrightnessDiv = await waitForElm('.board-brightness');
      const brightnessSlider = boardBrightnessDiv.querySelector('input.range');
      brightnessSlider.value = 100;
      brightnessSlider.dispatchEvent(new Event('input'));
      console.log('Brightness slider set to 100');
    }

    const boardHueDiv = await waitForElm('.board-hue');
    const hueSlider = boardHueDiv.querySelector('input.range');
    hueSlider.value = 0;
    hueSlider.dispatchEvent(new Event('input'));
    console.log("Set hue slider to 0");

    const boardBackButton = await waitForElm('.head');
    boardBackButton.click(); // Return to default profile view
    userTag.click(); // Close the user menu

    // Now apply the extension state
    const completedBoards = await getCompletedBoards();
    const currentHue = await getCurrentHue();

    const extensionState = {
      completedBoards,
      currentHue,
    };

    updateUIAfterImport(extensionState);
    console.log('UI synchronized with extension state.');
  } catch (error) {
    console.error('Error synchronizing UI:', error);
  }
};


const convertHuePointsToDegrees = (huePoints) => {
  if (huePoints < 0 || huePoints > 100) {
      throw new Error("Hue points must be between 0 and 100.");
  }
  return (huePoints / 100) * 360;
}


export const updateHueRotateStyle = async (huePoints) => {
  const degrees = convertHuePointsToDegrees(huePoints);
  
  addStyle(`cg-board { filter: hue-rotate(${degrees}deg) !important; }`);
  
}

const addStyle = (() => {
  const style = document.createElement('style');
  document.head.append(style);
  return (styleString) => style.textContent = styleString;
})();