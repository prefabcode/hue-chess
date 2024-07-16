import { updateProgressBar, waitForElm, levelNames, updateModalContent } from './uiUpdates.js';

export const exportExtensionState = () => {
    chrome.storage.local.get(['initialized', 'completedBoards', 'currentHue'], (result) => {
        const extensionState = {
            initialized: result.initialized,
            completedBoards: result.completedBoards,
            currentHue: result.currentHue || 0,
        };
        const jsonString = JSON.stringify(extensionState);
        const base64String = btoa(jsonString);

        // Create a textarea to copy the base64 string
        const textarea = document.createElement('textarea');
        textarea.value = base64String;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        alert('Extension state copied to clipboard as base64 string.');
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
