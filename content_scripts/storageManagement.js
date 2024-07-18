import { updateUIAfterImport, updateModalContent, updatePerksIcon } from './uiUpdates.js';

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
            updateModalContent();
        });
    } catch (error) {
        alert('Invalid base64 string. Please try again.');
    }
};

export const confirmResetProgress = () => {
    const confirmReset = confirm('Are you sure you want to reset your progress? This action cannot be undone.');
    if (confirmReset) {
        resetProgress();
        updateModalContent();
    }
};

export const resetProgress = () => {
    const resetState = {
        initialized: true,
        completedBoards: 0,
        currentHue: 0
    };

    chrome.storage.local.set(resetState, () => {
        console.log('Progress has been reset.');
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
            updatePerksIcon();  // Update the tooltip content
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

export const isSpeedrunModeEnabled = () => {
    return new Promise((resolve) => {
        chrome.storage.local.get(['speedrunMode'], (result) => {
            resolve(result.speedrunMode || false);
        });
    });
};
