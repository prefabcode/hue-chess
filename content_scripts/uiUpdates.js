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
  getSelectedUnlockOrder,
  setSelectedUnlockOrder,
  getCurrentHue,
  getCompletedBoards,
  resetProgress,
  resetPerksAndSideEffects,
  getPrestige,
  getRandomizerOrder,
  setRandomizerOrder
} from './storageManagement.js';
import { getObsSettings, setObsSettings, OBS_DEFAULTS } from '../streamer/obsSettings.js';
import { showPerkToast } from './perks.js';
import { PREPARATION_TIME, TIPS, MAX_PERKS, browser, BOARD_LEVEL_MAP } from './constants.js';
import tippy from 'tippy.js';
import { PERK_MARKUP_TEMPLATE, PERK_METADATA, PERK_UNLOCK_ORDERS, RANDOMIZER_INDEX } from './perkConstants.js';
import { generateRandomUnlockOrder } from './utils.js';

const showRandomTip = () => {
  const tipMessage = document.getElementById('tips-message');
  const randomIndex = Math.floor(Math.random() * TIPS.length);
  tipMessage.innerHTML = TIPS[randomIndex];
}

export const updateProgressBar = () => {
  return new Promise((resolve) => {
    browser.storage.local.get(['completedBoards', 'currentHue'], async (result) => {
      const level = (result.completedBoards !== null ? result.completedBoards : 0) + 1;
      const progress = result.currentHue || 0;

      let progressBar = document.getElementById('hue-progress-bar');
      if (!progressBar) {
        // Create progress bar
        progressBar = document.createElement('div');
        progressBar.id = 'hue-progress-bar';
        progressBar.style.display = 'flex';
        progressBar.style.alignItems = 'center';
        progressBar.style.marginLeft = 'auto';
        progressBar.style.marginRight = '10px';
  
        const progressBarContainer = document.createElement('div');
        progressBarContainer.id = 'progress-bar-container';
        progressBarContainer.style.display = 'flex';
        progressBarContainer.style.alignItems = 'center';
        progressBarContainer.style.cursor = 'pointer';
  
        const progressBarOuter = document.createElement('div');
        progressBarOuter.id = 'progress-bar-outer';
        progressBarOuter.style.width = '180px';
        progressBarOuter.style.height = '10px';
        progressBarOuter.style.borderRadius = '5px';

        const progressFill = document.createElement('div');
        progressFill.id = 'progress-fill';
        progressFill.style.height = '100%';
        progressFill.style.borderRadius = '5px';
        progressFill.style.width = `${progress}%`;
  
        progressBarOuter.appendChild(progressFill);
        progressBarContainer.appendChild(progressBarOuter);
  
        const levelText = document.createElement('span');
        levelText.id = 'level-text';
        levelText.style.marginLeft = '10px';
        levelText.style.marginBottom = '1px';
        levelText.textContent = `Level ${level}`;
  
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
        levelText.textContent = `Level ${level}`;
      }

      await paintActivePerks();
      resolve();
    });
  });
};

const paintActivePerks = async () => {
  const progressBar = document.getElementById('hue-progress-bar');
  if (!progressBar) return;

  const result = await new Promise((resolve) => {
    browser.storage.local.get(['activePerks', 'gladiatorLossBuffer', 'playedOpenings', 'preparationStatus'], resolve);
  });
  const activePerks = result.activePerks || [];
  const gladiatorLossBuffer = result.gladiatorLossBuffer || 0;
  const playedOpenings = result.playedOpenings || [];
  const preparationStatus = result.preparationStatus || false;

  const existingContainer = document.getElementById('active-perks-container');
  if (existingContainer) existingContainer.remove();

  if (activePerks.length === 0) return;

  const container = document.createElement('div');
  container.id = 'active-perks-container';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.marginRight = '10px';

  activePerks.forEach((perk) => {
    const perkElement = document.createElement('div');
    perkElement.className = 'active-perk';
    perkElement.style.display = 'flex';
    perkElement.style.alignItems = 'center';
    perkElement.style.marginRight = '8px';

    const icon = document.createElement('img');
    icon.className = 'active-perk-icon';
    icon.src = browser.runtime.getURL(`imgs/${perk}.svg`);
    icon.style.width = '20px';
    icon.style.height = '20px';
    perkElement.appendChild(icon);

    let stateText = '';
    if (perk === 'gladiator') {
      stateText = `${gladiatorLossBuffer}`;
    } else if (perk === 'versatility') {
      stateText = `${playedOpenings.length}`;
    } else if (perk === 'preparation') {
      stateText = preparationStatus ? '✓' : '✗';
    }

    if (stateText) {
      const state = document.createElement('span');
      state.className = 'active-perk-state';
      state.style.marginLeft = '4px';
      state.textContent = stateText;
      perkElement.appendChild(state);
    }

    container.appendChild(perkElement);
  });

  const barContainer = progressBar.querySelector('#progress-bar-container');
  if (barContainer) barContainer.prepend(container);
};

async function setImageSources() {
  const images = [
    'berserker-icon',
    'gambiteer-icon',
    'endgame-specialist-icon',
    'gladiator-icon',
    'equalizer-icon',
    'rivalry-icon',
    'preparation-icon',
    'opportunist-icon',
    'versatility-icon',
    'hypermodern-icon',
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
    let modal = document.querySelector('#hue-chess-perks-modal');
    if (modal) {
      document.body.style.overflowY = 'hidden';
      modal.showModal();
      await updatePerksModalContent();
      showRandomTip();
      return;
    }

    // inject empty perks modal into dom 
    const response = await fetch(browser.runtime.getURL('perks.html'));
    const data = await response.text();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data;

    modal = tempDiv.querySelector('#hue-chess-perks-modal');

    document.body.appendChild(modal);

    // dynamically build perk modal component
    await updatePerksUnlockOrder();
    await setPerkModalEventHandlers();
    await setImageSources();
    await updatePerksModalContent();
    await updatePerksHeader();
    showRandomTip();

    // show modal
    document.body.style.overflowY = 'hidden';
    modal.showModal();

  } catch (error) {
    console.error("Error opening perks modal:", error);
  }
}

const setPerkModalEventHandlers = async () => {
  const modal = document.querySelector('#hue-chess-perks-modal');
  if (!modal) return;

  document.getElementById('close-perks-modal').addEventListener('click', () => {
    document.body.style.overflowY = 'scroll';
    modal.close();
  });

  const unlockOrderDropdown = document.querySelector('#unlock-order-dropdown');
  let previousUnlockValue = unlockOrderDropdown.value;

  unlockOrderDropdown.addEventListener('change', async (event) => {
    const currentHue = await getCurrentHue();
    const completedBoards = await getCompletedBoards();

    if (currentHue > 0 || completedBoards > 0) {
      const confirmReset = confirm('Changing Specialization will reset your accumulated XP and return you to level 1. Are you sure you want to proceed?');
      if (confirmReset) {
        await resetProgress(false);
      } else {
        event.target.value = previousUnlockValue;
        return;
      }
    } else {
      await resetPerksAndSideEffects();
    }

    const selectedOrder = parseInt(event.target.value, 10);
    await setSelectedUnlockOrder(selectedOrder);
    if (selectedOrder === RANDOMIZER_INDEX) {
      await setRandomizerOrder(generateRandomUnlockOrder());
    }
    await refreshPerksModalUi();
    previousUnlockValue = event.target.value;
  });

  const rerollButton = modal.querySelector('#reroll-perks-btn');
  rerollButton.addEventListener('click', async () => {
    const playingId = await getPlayingId();
    if (playingId) {
      alert("You cannot reroll perks while a game is in progress.");
      return;
    }
    const currentHue = await getCurrentHue();
    const completedBoards = await getCompletedBoards();
    if (currentHue > 0 || completedBoards > 0) return;
    await setRandomizerOrder(generateRandomUnlockOrder());
    await resetPerksAndSideEffects();
    await refreshPerksModalUi();
  });

  await setActivePerkEventHandler();

}

const refreshPerksModalUi = async () => {
  await updatePerksUnlockOrder();
  await setImageSources();
  await setActivePerkEventHandler();
  await updatePerksModalContent();
  await updatePerksHeader();
  await updateProgressBar();
};

const setActivePerkEventHandler = async () => {
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
          const confirmSelection = confirm("Warning: You will not be able to remove the Gladiator perk until you level up or suffer the XP point penalty. Do you want to proceed?");
          if (!confirmSelection) {
            return;
          } else {
            await resetGladiatorLossBuffer();
            await setAllowGladiatorPerkRemoval(false);
          }
        } else {
          const canRemove = await getAllowGladiatorPerkRemoval();
          if (!canRemove) {
            alert("You cannot remove the Gladiator perk until you level up or suffer the XP point penalty.");
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
}

const resolveUnlockOrder = async (selectedUnlockOrder) => {
  if (selectedUnlockOrder === RANDOMIZER_INDEX) {
    let order = await getRandomizerOrder();
    if (!order || order.length === 0) {
      order = generateRandomUnlockOrder();
      await setRandomizerOrder(order);
    }
    return order;
  }
  return PERK_UNLOCK_ORDERS[selectedUnlockOrder];
};

const updateRerollButtonVisibility = async (modal, selectedUnlockOrder) => {
  const rerollButton = modal.querySelector('#reroll-perks-btn');
  if (!rerollButton) return;
  const currentHue = await getCurrentHue();
  const completedBoards = await getCompletedBoards();
  const canReroll = selectedUnlockOrder === RANDOMIZER_INDEX && currentHue === 0 && completedBoards === 0;
  rerollButton.style.display = canReroll ? '' : 'none';
};

const updatePerksUnlockOrder = async () => {
  const modal = document.querySelector('#hue-chess-perks-modal');
  if (!modal) return;
  const perksContainer = modal.querySelector('#perks-container');
  const selectedUnlockOrder = await getSelectedUnlockOrder();

  const unlockOrder = await resolveUnlockOrder(selectedUnlockOrder);
  const unlockOrderDropdown = modal.querySelector('#unlock-order-dropdown');

  unlockOrderDropdown.value = selectedUnlockOrder;

  const prestige = await getPrestige();
  const specializationContainer = modal.querySelector('#specialization-container');
  if (specializationContainer) {
    specializationContainer.style.display = prestige >= 1 ? '' : 'none';
  }

  await updateRerollButtonVisibility(modal, selectedUnlockOrder);

  let perkContainerHtmlStr = '';
  unlockOrder.forEach((unlockMetadata) => {
    const perkMetadata = PERK_METADATA.find(perk => perk.id === unlockMetadata.id);
    let perkRawHtml = PERK_MARKUP_TEMPLATE
      .replaceAll('{internalName}', perkMetadata.internalName)
      .replaceAll('{displayName}', perkMetadata.displayName)
      .replaceAll('{description}', perkMetadata.description)
      .replaceAll('{unlockLevel}', unlockMetadata.level);
    perkContainerHtmlStr += perkRawHtml;
  });

  perksContainer.innerHTML = perkContainerHtmlStr;
}

export const updatePerksModalContent = async () => {
  const modal = document.querySelector('#hue-chess-perks-modal');
  if (!modal) return;
  browser.storage.local.get(['completedBoards', 'currentHue', 'activePerks', 'prestige'], (result) => {
    const playerLevel = (result.completedBoards !== null ? result.completedBoards : 0) + 1;
    const huePoints = `${result.currentHue || 0}/100`;
    const prestige = result.prestige || 0;

    document.getElementById('current-level').innerText = playerLevel;
    document.getElementById('hue-points').innerText = huePoints;

    const emblem = document.getElementById('prestige-emblem');
    if (prestige >= 1) {
      const emblemIndex = ((prestige - 1) % 5) + 1;
      document.getElementById('prestige-emblem-img').src =
        browser.runtime.getURL(`imgs/prestige/prestige-${emblemIndex}.png`);
      document.getElementById('prestige-emblem-label').textContent = `Prestige ${prestige}`;
      emblem.style.display = 'flex';
    } else {
      emblem.style.display = 'none';
    }

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

    // Initialize Tippy.js tooltips
    tippy('.perk-box', {
      theme: 'hue-chess',
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
  if (perksHeader) {
    perksHeader.textContent = `Perk Selection (${activePerks.length}/${MAX_PERKS})`;
  }
}

const OBS_STATUS_LABELS = {
  'disconnected': 'Disconnected',
  'connecting': 'Connecting…',
  'connected': 'Connected to OBS',
  'auth-failed': 'Wrong password — check OBS WebSocket settings',
};

let obsStatusTimer = null;

const initObsSettings = async (modal) => {
  const fields = {
    obsEnabled: modal.querySelector('#obs-enabled'),
    obsHost: modal.querySelector('#obs-host'),
    obsPort: modal.querySelector('#obs-port'),
    obsPassword: modal.querySelector('#obs-password'),
  };

  const settings = await getObsSettings();
  fields.obsEnabled.checked = settings.obsEnabled;
  fields.obsHost.value = settings.obsHost;
  fields.obsPort.value = settings.obsPort;
  fields.obsPassword.value = settings.obsPassword;

  const persist = () => setObsSettings({
    obsEnabled: fields.obsEnabled.checked,
    obsHost: fields.obsHost.value.trim() || OBS_DEFAULTS.obsHost,
    obsPort: fields.obsPort.value.trim() || OBS_DEFAULTS.obsPort,
    obsPassword: fields.obsPassword.value,
  });

  Object.values(fields).forEach((field) => field.addEventListener('change', persist));
};

const startObsStatusPolling = (modal) => {
  const readout = modal.querySelector('#obs-status');
  if (!readout) return;

  const refresh = () => {
    browser.runtime.sendMessage({ action: 'getObsStatus' }, (response) => {
      if (browser.runtime.lastError || !response) return;
      readout.textContent = OBS_STATUS_LABELS[response.status] ?? response.status;
      readout.dataset.state = response.status;
    });
  };

  clearInterval(obsStatusTimer);
  refresh();
  obsStatusTimer = setInterval(refresh, 1000);

  modal.addEventListener('close', () => clearInterval(obsStatusTimer), { once: true });
};

const openSettingsModal = async () => {
  try {
    let modal = document.querySelector('#hue-chess-settings-modal');
    if (modal) {
      document.body.style.overflowY = 'hidden';
      modal.showModal();
      startObsStatusPolling(modal);
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

    document.getElementById('open-streamer-overlay').addEventListener('click', () => {
      browser.runtime.sendMessage({ action: 'openStreamerOverlay' });
    });

    await initObsSettings(modal);
    startObsStatusPolling(modal);

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

          alert('Perk chess profile string copied to clipboard');
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

           browser.storage.local.set(extensionState, async () => {
            alert('Extension state imported successfully.');
            await updateHueChessUI(extensionState);
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
      const activePerks = await getActivePerks();
      if (activePerks.includes('preparation')) {
        await setPreparationStatus(true);
        showPerkToast('preparation', 'Preparation: requirement fulfilled');
        await paintActivePerks();
      }
    }
  }, 200);
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const convertHuePointsToDegrees = (huePoints) => {
  if (huePoints < 0 || huePoints > 100) {
      throw new Error("Hue points must be between 0 and 100.");
  }
  return (huePoints / 100) * 360;
}


export const updateHueRotateStyle = (huePoints) => {
  const degrees = convertHuePointsToDegrees(huePoints);
  
  addStyle(`cg-board { filter: hue-rotate(${degrees}deg) !important; visibility: visible !important; }`);
  
}

export const updateBoardStyle = (level) => {
  const boardUrl = browser.runtime.getURL(BOARD_LEVEL_MAP[level]);
  
  addStyle(`body .is2d.is2d cg-board::before { background-image: url(${boardUrl}) !important; }`);
  addStyle(`cg-board::before { background-image: url(${boardUrl}) !important; }`);
}

const addStyle = ((styleString) => {
  const style = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
});

export const updateHueChessUI = async (state) => {
  updateBoardStyle(state.completedBoards);
  updateHueRotateStyle(state.currentHue);
  await updatePerksModalContent();
  await updatePerksHeader();
  await updateProgressBar();
}