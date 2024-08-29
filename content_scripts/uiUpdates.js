import { 
  exportExtensionState, 
  importExtensionState, 
  confirmResetProgress, 
  updateActivePerks, 
  setWinningStreak, 
  resetGladiatorLossBuffer, 
  setAllowGladiatorPerkRemoval, 
  getAllowGladiatorPerkRemoval, 
  getActivePerks,
  getPreparationStatus,
  setPreparationStatus, 
  getPlayingId
} from './storageManagement.js';
import { showPerkToast } from './perks.js';
import { levelNames, MAX_PERKS, PREPARATION_TIME, TIPS, PERK_DISPLAY_NAMES } from './constants.js';
import tippy from 'tippy.js';

const showRandomTip = () => {
  const tipMessage = document.getElementById('tips-message');
  const randomIndex = Math.floor(Math.random() * TIPS.length);
  tipMessage.textContent = TIPS[randomIndex];
}

export const updateProgressBar = (completedBoards = null, hueValue = null) => {
  chrome.storage.local.get(['completedBoards'], (result) => {
    const level = (completedBoards !== null ? completedBoards : result.completedBoards) + 1;
    const progress = hueValue !== null ? hueValue : 0;
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
      progressBar.style.cursor = 'pointer';

      const progressBarContainer = document.createElement('div');
      progressBarContainer.id = 'progress-bar-container';
      progressBarContainer.style.flexBasis = '180px';
      progressBarContainer.style.height = '10px';
      progressBarContainer.style.borderRadius = '5px';
      progressBarContainer.style.backgroundColor = '#8c8c8c';

      const progressFill = document.createElement('div');
      progressFill.id = 'progress-fill';
      progressFill.style.height = '100%';
      progressFill.style.borderRadius = '5px';
      progressFill.style.backgroundColor = 'hsl(88, 62%, 37%)';
      progressFill.style.width = `${progress}%`;

      progressBarContainer.appendChild(progressFill);
      progressBar.appendChild(progressBarContainer);

      const levelText = document.createElement('span');
      levelText.id = 'level-text';
      levelText.style.marginLeft = '10px';
      levelText.style.marginBottom = '1px';
      levelText.textContent = `Level ${level} - ${levelName}`;

      progressBar.appendChild(levelText);

      const header = document.querySelector('header');
      const siteButtons = header.querySelector('.site-buttons');
      header.insertBefore(progressBar, siteButtons);

      progressBar.addEventListener('click', openPerksModal);

    } else {
      const progressFill = progressBar.querySelector('#progress-fill');
      const levelText = document.getElementById('level-text');
      progressFill.style.width = `${progress}%`;
      levelText.textContent = `Level ${level} - ${levelName}`;
    }

    // Adapt to light and dark modes
    const isDarkMode = document.body.classList.contains('dark') || document.body.classList.contains('transp');
    if (isDarkMode) {
      const progressBarContainer = progressBar.querySelector('#progress-bar-container');
      const progressFill = progressBar.querySelector('#progress-fill');
      progressFill.style.backgroundColor = '#f7f7f7';
      progressBarContainer.style.backgroundColor = 'hsl(37, 5%, 22%)';
    }
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
    'bongcloud-icon',
    'gambiteer-icon',
    'endgame-specialist-icon',
    'hot-streak-icon',
    'gladiator-icon',
    'equalizer-icon',
    'rivalry-icon',
    'preparation-icon'
  ];

  images.forEach(imageId => {
    const imageElement = document.getElementById(imageId);
    const perkBox = imageElement.closest('.perk-box');
    const unlockLevel = parseInt(perkBox.getAttribute('data-unlock-level'), 10);
    chrome.storage.local.get(['completedBoards'], (result) => {
      const playerLevel = (result.completedBoards !== null ? result.completedBoards : 0) + 1;
      if (playerLevel >= unlockLevel) {
        imageElement.src = chrome.runtime.getURL(`imgs/${imageId.replace('-icon', '')}.svg`);
      } else {
        imageElement.src = chrome.runtime.getURL('imgs/lock.svg');
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

    const response = await fetch(chrome.runtime.getURL('perks.html'));
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

        if (perk === 'hot-streak') {
          console.log(`hot-streak perk toggled with value:${!isActive}, resetting win streak`);
          setWinningStreak(0);
        }

        if (perk === 'gladiator') {
          if (!isActive) {
            const confirmSelection = confirm("Warning: You will not be able to remove the Gladiator perk until you level up or suffer a 20% hue point penalty. Do you want to proceed?");
            if (!confirmSelection) {
              return;
            } else {
              await resetGladiatorLossBuffer();
              await setAllowGladiatorPerkRemoval(false);
            }
          } else {
            const canRemove = await getAllowGladiatorPerkRemoval();
            if (!canRemove) {
              alert("You cannot remove the Gladiator perk until you level up or suffer a 20% hue point penalty.");
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
  chrome.storage.local.get(['completedBoards', 'currentHue', 'activePerks'], (result) => {
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
        imgElement.src = chrome.runtime.getURL(`imgs/${perk}.svg`);
        box.classList.remove('locked');
        box.setAttribute('data-tippy-content', box.getAttribute('data-tippy-content-original'));
      } else {
        box.style.display = 'flex';
        box.classList.add('locked');
        imgElement.src = chrome.runtime.getURL('imgs/lock.svg');
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

    const response = await fetch(chrome.runtime.getURL('settings.html'));
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

    document.getElementById('export-progress').addEventListener('click', exportExtensionState);
    document.getElementById('import-progress').addEventListener('click', importExtensionState);
    document.getElementById('reset-progress').addEventListener('click', confirmResetProgress);


  }
  catch (error) {
    console.error('Error opening settings modal', err);
  }
  // Check if the modal already exists
}

// expose settings modal to extension button
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

export const updateUIAfterImport = (extensionState) => {
  const { completedBoards, currentHue } = extensionState;

  waitForElm('#user_tag').then((userTag) => {
    userTag.click();

    const dasherApp = document.getElementById('dasher_app');
    if (!dasherApp) {
      console.log("Dasher app not found");
      return;
    }

    waitForElm('.subs').then((subsDiv) => {
      const boardButton = Array.from(subsDiv.querySelectorAll('button')).find(button => button.textContent === 'Board');
      if (!boardButton) {
        console.log("Board button not found");
        return;
      }

      boardButton.click();
      console.log("Clicked board button");

      waitForElm('.list').then((boardList) => {
        const targetBoardTitle = levelNames[completedBoards].toLowerCase();
        const targetBoardButton = boardList.querySelector(`button[title="${targetBoardTitle}"]`);
        if (!targetBoardButton) {
          console.log(`${targetBoardTitle} board button not found`);
          return;
        }

        targetBoardButton.click();
        console.log(`Clicked ${targetBoardTitle} board button`);

        waitForElm('.board-hue').then((boardHueDiv) => {
          const hueSlider = boardHueDiv.querySelector('input.range');
          if (!hueSlider) {
            console.log("Hue slider not found");
            return;
          }

          hueSlider.value = currentHue;
          hueSlider.dispatchEvent(new Event('input'));
          console.log(`Set hue slider to ${currentHue}`);
          const backButton = document.querySelector('.sub.board .head');
          if (backButton) backButton.click();
          userTag.click(); // Close the user menu

          // Update the progress bar
          updateProgressBar(completedBoards, currentHue);
        });
      });
    });
  });
};

export const updatePerksIcon = () => {
  chrome.storage.local.get(['activePerks', 'winningStreak', 'gladiatorLossBuffer', 'preparationStatus'], async (result) => {
    const activePerks = result.activePerks || [];
    const winningStreak = result.winningStreak || 0;
    const gladiatorLossBuffer = result.gladiatorLossBuffer || 0;
    const preparationStatus = result.preparationStatus || false;

    if (activePerks.length === 0) {
      const perksIcon = document.getElementById('perks-icon');
      if (perksIcon) {
        perksIcon.remove();
      }
      return;
    }

    await waitForElm('#hue-progress-bar');

    let perksIcon = document.getElementById('perks-icon');
    if (!perksIcon) {
      perksIcon = document.createElement('div');
      perksIcon.id = 'perks-icon';
      perksIcon.style.position = 'relative';
      perksIcon.style.display = 'flex';
      perksIcon.style.alignItems = 'center';
      perksIcon.style.marginRight = '10px';
      perksIcon.style.cursor = 'pointer';

      const perksIconImg = document.createElement('img');
      perksIconImg.src = chrome.runtime.getURL('imgs/dragon.svg'); // Assuming you have an icon image
      perksIconImg.alt = 'Active Perks';
      perksIconImg.style.width = '24px';
      perksIconImg.style.height = '24px';
      perksIcon.appendChild(perksIconImg);

      const progressBar = document.getElementById('hue-progress-bar');
      const progressBarContainer = progressBar.querySelector('#progress-bar-container');
      progressBar.insertBefore(perksIcon, progressBarContainer);

      // Create the tooltip content
      let tooltipContent = '<ul>';
      activePerks.forEach(perk => {
        const displayName = PERK_DISPLAY_NAMES[perk] || perk;
        tooltipContent += `<li>${displayName}`;
        if (perk === 'hot-streak') {
          tooltipContent += ` (Winning Streak: ${winningStreak})`;
        } else if (perk === 'gladiator') {
          tooltipContent += ` (Allowed Losses: ${gladiatorLossBuffer})`;
        } else if (perk === 'preparation') {
          tooltipContent += ` (${preparationStatus ? 'Fulfilled' : 'Not Fulfilled'})`;
        }
        tooltipContent += '</li>';
      });
      tooltipContent += '</ul>';

      // Initialize tippy.js tooltip
      tippy(perksIcon, {
        content: tooltipContent,
        placement: 'bottom',
        theme: 'light-border',
        allowHTML: true,
      });
    }

    // Update the tooltip content
    const tooltipContent = '<ul>' + activePerks.map(perk => {
      const displayName = PERK_DISPLAY_NAMES[perk] || perk;
      let status = '';
      if (perk === 'hot-streak') {
        status = ` (Winning Streak: ${winningStreak})`;
      } else if (perk === 'gladiator') {
        status = ` (Allowed Losses: ${gladiatorLossBuffer})`;
      } else if (perk === 'preparation') {
        status = ` (${preparationStatus ? 'Fulfilled' : 'Not Fulfilled'})`;
      }
      return `<li>${displayName}:${status}</li>`;
    }).join('') + '</ul>';

    const tooltip = perksIcon._tippy;
    if (tooltip) {
      tooltip.setContent(tooltipContent);
    }
  });
};


export const startAnalysisTimer = async (analysisTimeLeft) => {
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
  timerElement.innerText = `Preparation time left: ${formatTime(analysisTimeLeft)}`;
  analysisBoard.appendChild(timerElement);


  let analysisTimer = setInterval(async () => {
    analysisTimeLeft--;
    timerElement.innerText = `Preparation time left: ${formatTime(analysisTimeLeft)}`;
    
    if (analysisTimeLeft <= 0) {
      clearInterval(analysisTimer);
      timerElement.remove();
      activePerks = await getActivePerks(); 
      if (activePerks.includes('preparation')) {
        setPreparationStatus(true);
        showPerkToast('preparation', 'Preparation: requirement fulfilled');
        updatePerksIcon();
      }
    }
  }, 1000);
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};
