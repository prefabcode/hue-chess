import { updateUIAfterImport, updatePerksModalContent, updateProgressBarTooltip, updatePerksHeader } from './uiUpdates.js';
import { browser } from './constants.js';


export const confirmResetProgress = async () => {
  const confirmReset = confirm('Are you sure you want to reset your progress? This action cannot be undone.');
  if (confirmReset) {
    await resetProgress();
    updatePerksModalContent();
    updatePerksHeader();
  }
};

export const resetProgress = async () => {
  const prestige = await getPrestige();
  const resetState = {
    initialized: true,
    completedBoards: 0,
    currentHue: 0,
    activePerks: [],
    prestige,
  };
  
  return new Promise((resolve) => {
    browser.storage.local.set(resetState, () => {
      console.log(`resetProgress: Progress has been reset. Setting state to: ${resetState}`);
      updateUIAfterImport(resetState);
      resolve();
    });
  });
};

export const updateActivePerks = (perk, isChecked) => {
  browser.storage.local.get(['activePerks'], (result) => {
    let activePerks = result.activePerks || [];
    if (isChecked) {
      if (!activePerks.includes(perk)) {
        activePerks.push(perk);
      }
    } else {
      activePerks = activePerks.filter(p => p !== perk);
    }
    browser.storage.local.set({ activePerks }, () => {
      console.log(`Active perks updated: ${activePerks}`);
      updateProgressBarTooltip();  // Update the tooltip content
      updatePerksHeader();
    });
  });
};

export const getActivePerks = () => {
  return new Promise((resolve) => {
    browser.storage.local.get(['activePerks'], (result) => {
      resolve(result.activePerks || []);
    });
  });
};

export const getPlayingId = () => {
  return new Promise((resolve) => {
    browser.storage.local.get(['playingId'], (result) => {
      resolve(result.playingId || null);
    });
  });
};

export const setPlayingId = (playingId) => {
  return new Promise((resolve) => {
    browser.storage.local.set({ playingId }, () => {
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
    browser.storage.local.get(['gladiatorLossBuffer'], (result) => {
      resolve(result.gladiatorLossBuffer || 0);
    });
  });
};

export const setGladiatorLossBuffer = (value) => {
  return new Promise((resolve) => {
    browser.storage.local.set({ gladiatorLossBuffer: value }, () => {
      resolve();
    });
  });
};

export const resetGladiatorLossBuffer = () => {
  return setGladiatorLossBuffer(1); // Reset to 1 loss allowed when taking perk / applying penalty / level up
};

export const getAllowGladiatorPerkRemoval = () => {
  return new Promise((resolve) => {
      browser.storage.local.get(['allowGladiatorPerkRemoval'], (result) => {
          resolve(result.allowGladiatorPerkRemoval || false);
      });
  });
};

export const setAllowGladiatorPerkRemoval = (value) => {
  return new Promise((resolve) => {
      browser.storage.local.set({ allowGladiatorPerkRemoval: value }, () => {
          resolve();
      });
  });
};

// Get the hasPlayedBefore flag
export const getHasPlayedBefore = () => {
  return new Promise((resolve) => {
    browser.storage.local.get(['hasPlayedBefore'], (result) => {
      resolve(result.hasPlayedBefore || false);
    });
  });
};

// Set the hasPlayedBefore flag
export const setHasPlayedBefore = (hasPlayedBefore) => {
  return new Promise((resolve) => {
    browser.storage.local.set({ hasPlayedBefore }, () => {
      console.log("Has Played Before flag stored:", hasPlayedBefore);
      resolve();
    });
  });
};

export const getPreparationStatus = () => {
  return new Promise((resolve) => {
    browser.storage.local.get(['preparationStatus'], (result) => {
      resolve(result.preparationStatus || false);
    });
  });
};

export const setPreparationStatus = (status) => {
  return new Promise((resolve) => {
    browser.storage.local.set({ preparationStatus: status }, () => {
      console.log("Preparation status set to:", status);
      resolve();
    });
  });
};

export const getPlayedOpenings = () => {
  return new Promise((resolve) => {
    browser.storage.local.get(['playedOpenings'], (result) => {
      resolve(result.playedOpenings || []);
    });
  });
};

export const setPlayedOpenings = (openings) => {
  return new Promise((resolve) => {
    browser.storage.local.set({ playedOpenings: openings }, () => {
      console.log("Played openings updated:", openings);
      resolve();
    });
  });
};

export const getPrestige = () => {
  return new Promise((resolve) => {
    browser.storage.local.get(['prestige'], (result) => {
      resolve(result.prestige || 0);
    });
  });
};

export const incrementPrestige = () => {
  return new Promise(async (resolve) => {
    const prestige = await getPrestige() + 1;
    browser.storage.local.set({ prestige });
    console.log(`incrementPrestige: prestige set to ${prestige}`);
    resolve();
  });
}

export const getCompletedBoards = () => {
  return new Promise((resolve) => {
    browser.storage.local.get(['completedBoards'], (result) => {
      resolve(result.completedBoards || 0);
    });
  });
};

export const setCompletedBoards = (completedBoards) => {
  return new Promise((resolve) => {
    browser.storage.local.set({ completedBoards });
    console.log(`setCompletedBoards: Completed boards set to ${completedBoards}`);
    resolve();
  });
};

export const getCurrentHue = () => {
  return new Promise((resolve) => {
    browser.storage.local.get(['currentHue'], (result) => {
      resolve(result.currentHue || 0);
    });
  });
};

export const setCurrentHue = (currentHue) => {
  return new Promise((resolve) => {
    browser.storage.local.set({ currentHue });
    console.log(`setCurrentHue: Current hue updated in storage: ${currentHue}`);
    resolve();
  })
};