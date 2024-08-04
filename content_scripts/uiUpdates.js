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
} from './storageManagement.js';
import { levelNames, MAX_PERKS } from './constants.js';
import tippy from 'tippy.js';

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
    openSettingsModal();
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
    'hue-master-icon',
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

export const openSettingsModal = async () => {
  try {
    // Check if the modal already exists
    let modal = document.querySelector('#hue-chess-settings-modal');
    if (modal) {
      document.body.style.overflowY = 'hidden';
      modal.showModal();
      await updateModalContent();
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

    // Add event listeners for perks
    const perkBoxes = document.querySelectorAll('.perks .perk-box');
    perkBoxes.forEach(box => {
      box.addEventListener('click', async () => {
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
          if (isActive) {
            await setPreparationStatus(false);
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
    await updateModalContent();
    await updatePerksHeader();
  } catch (error) {
    console.error("Error opening settings modal:", error);
  }
}

export const updateModalContent = async () => {
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
      appendTo: () => document.querySelector('#hue-chess-settings-modal'),
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
  chrome.storage.local.get(['activePerks'], (result) => {
    const activePerks = result.activePerks || [];

    // Check if there are any active perks
    if (activePerks.length === 0) {
      const perksIcon = document.getElementById('perks-icon');
      if (perksIcon) {
        perksIcon.remove();
      }
      return;
    }
    waitForElm('#hue-progress-bar').then(() => {
      // Create the perks icon
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
        perksIconImg.src = chrome.runtime.getURL('images/perks-icon.png'); // Assuming you have an icon image
        perksIconImg.alt = 'Active Perks';
        perksIconImg.style.width = '24px';
        perksIconImg.style.height = '24px';
        perksIcon.appendChild(perksIconImg);

        const header = document.querySelector('header');
        const progressBar = header.querySelector('#hue-progress-bar');
        header.insertBefore(perksIcon, progressBar);

        // Create the tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'perks-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.bottom = '30px';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.padding = '10px';
        tooltip.style.borderRadius = '5px';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = '#fff';
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s';

        perksIcon.appendChild(tooltip);

        // Add event listeners once
        perksIcon.addEventListener('mouseenter', () => {
          tooltip.style.visibility = 'visible';
          tooltip.style.opacity = '1';
        });

        perksIcon.addEventListener('mouseleave', () => {
          tooltip.style.visibility = 'hidden';
          tooltip.style.opacity = '0';
        });
      }

      // Update the tooltip content
      const tooltip = document.getElementById('perks-tooltip');
      tooltip.innerHTML = activePerks.length ? `Active Perks: ${activePerks.join(', ')}` : 'No Active Perks';
    });

  });
};

export const startAnalysisTimer = async (analysisTimeLeft) => {
  const activePerks = await getActivePerks();
  if (!activePerks.includes('preparation')) {
    return;
  }

  const preparationStatusMet = await getPreparationStatus();
  if (preparationStatusMet) {
    return;
  }

  const analysisBoard = document.querySelector('.analyse__board.main-board');
  if (!analysisBoard) {
    console.log('Analysis board not found.');
    return;
  }

  const timerElement = document.createElement('div');
  timerElement.id = 'analysis-timer';
  timerElement.style.position = 'absolute';
  timerElement.style.left = '0';
  timerElement.style.top = '-20px';
  timerElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  timerElement.style.color = 'white';
  timerElement.style.padding = '5px 10px';
  timerElement.style.borderRadius = '5px';
  timerElement.style.fontSize = '14px';
  timerElement.innerText = `Time left: ${formatTime(analysisTimeLeft)}`;
  analysisBoard.appendChild(timerElement);


  let analysisTimer = setInterval(() => {
    analysisTimeLeft--;
    timerElement.innerText = `Time left: ${formatTime(analysisTimeLeft)}`;
    if (analysisTimeLeft <= 0) {
      clearInterval(analysisTimer);
      console.log('preparation requirement fulfilled');
      setPreparationStatus(true);
      // TODO - ADD toast here for prep requirement fulfilled! 
      // showToast('preparation', 'Preparation requirement fulfilled', 0);
    }
  }, 1000);
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};