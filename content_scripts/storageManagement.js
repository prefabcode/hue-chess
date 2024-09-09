import { updateUIAfterImport, updatePerksModalContent, updateProgressBarTooltip, updatePerksHeader } from './uiUpdates.js';

export const exportExtensionState = () => {
  chrome.storage.local.get(['initialized', 'completedBoards', 'currentHue'], (result) => {
    const extensionState = {
      initialized: result.initialized,
      completedBoards: result.completedBoards,
      currentHue: result.currentHue || 0,
    };
    const jsonString = JSON.stringify(extensionState);
    const base64String = btoa(jsonString);

    navigator.clipboard.writeText(base64String);

    alert('Hue chess profile string copied to clipboard');
  });
};

export const importExtensionState = () => {
  const base64String = document.getElementById('import-input').value.trim();
  if (!base64String) {
    alert('Please paste a valid base64 string.');
    return;
  }

  try {
    const jsonString = atob(base64String);
    const extensionState = JSON.parse(jsonString);

    // Update the storage with imported values
    chrome.storage.local.set(extensionState, () => {
      alert('Extension state imported successfully.');
      updateUIAfterImport(extensionState);
      updatePerksModalContent();
    });
  } catch (error) {
    alert('Invalid base64 string. Please try again.');
  }
};

export const confirmResetProgress = () => {
  const confirmReset = confirm('Are you sure you want to reset your progress? This action cannot be undone.');
  if (confirmReset) {
    resetProgress();
    updatePerksModalContent();
    updatePerksHeader();
  }
};

export const resetProgress = (prestige = 0) => {
  const resetState = {
    initialized: true,
    completedBoards: 0,
    currentHue: 0,
    activePerks: [],
    prestige,
  };

  chrome.storage.local.set(resetState, () => {
    console.log(`Progress has been reset. Setting Prestige to: ${prestige}`);
    updateUIAfterImport(resetState);
  });
};

export const updateActivePerks = (perk, isChecked) => {
  chrome.storage.local.get(['activePerks'], (result) => {
    let activePerks = result.activePerks || [];
    if (isChecked) {
      if (!activePerks.includes(perk)) {
        activePerks.push(perk);
      }
    } else {
      activePerks = activePerks.filter(p => p !== perk);
    }
    chrome.storage.local.set({ activePerks }, () => {
      console.log(`Active perks updated: ${activePerks}`);
      updateProgressBarTooltip();  // Update the tooltip content
      updatePerksHeader();
    });
  });
};

export const getActivePerks = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['activePerks'], (result) => {
      resolve(result.activePerks || []);
    });
  });
};

export const getPlayingId = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['playingId'], (result) => {
      resolve(result.playingId || null);
    });
  });
};

export const setPlayingId = (playingId) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ playingId }, () => {
      console.log("Playing ID stored:", playingId);
      resolve();
    });
  });
};

export const getWinningStreak = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['winningStreak'], (result) => {
      resolve(result.winningStreak || 0);
    });
  });
};

export const setWinningStreak = (streak) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ winningStreak: streak }, () => {
      resolve();
    });
  });
};

export const getGladiatorLossBuffer = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['gladiatorLossBuffer'], (result) => {
      resolve(result.gladiatorLossBuffer || 0);
    });
  });
};

export const setGladiatorLossBuffer = (value) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ gladiatorLossBuffer: value }, () => {
      resolve();
    });
  });
};

export const resetGladiatorLossBuffer = () => {
  return setGladiatorLossBuffer(1); // Reset to 1 loss allowed when taking perk / applying penalty / level up
};

export const getAllowGladiatorPerkRemoval = () => {
  return new Promise((resolve) => {
      chrome.storage.local.get(['allowGladiatorPerkRemoval'], (result) => {
          resolve(result.allowGladiatorPerkRemoval || false);
      });
  });
};

export const setAllowGladiatorPerkRemoval = (value) => {
  return new Promise((resolve) => {
      chrome.storage.local.set({ allowGladiatorPerkRemoval: value }, () => {
          resolve();
      });
  });
};

// Get the hasPlayedBefore flag
export const getHasPlayedBefore = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['hasPlayedBefore'], (result) => {
      resolve(result.hasPlayedBefore || false);
    });
  });
};

// Set the hasPlayedBefore flag
export const setHasPlayedBefore = (hasPlayedBefore) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ hasPlayedBefore }, () => {
      console.log("Has Played Before flag stored:", hasPlayedBefore);
      resolve();
    });
  });
};

export const getPreparationStatus = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['preparationStatus'], (result) => {
      resolve(result.preparationStatus || false);
    });
  });
};

export const setPreparationStatus = (status) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ preparationStatus: status }, () => {
      console.log("Preparation status set to:", status);
      resolve();
    });
  });
};



export const getSecondWindStatus = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['secondWindStatus'], (result) => {
      resolve(result.secondWindStatus || false);
    });
  });
};

export const setSecondWindStatus = (status) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ secondWindStatus: status }, () => {
      console.log("Second wind status set to:", status);
      resolve();
    });
  });
};

export const getPlayedOpenings = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['playedOpenings'], (result) => {
      resolve(result.playedOpenings || []);
    });
  });
};

export const setPlayedOpenings = (openings) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ playedOpenings: openings }, () => {
      console.log("Played openings updated:", openings);
      resolve();
    });
  });
};