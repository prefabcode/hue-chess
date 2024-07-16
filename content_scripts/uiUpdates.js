import { exportExtensionState, importExtensionState, confirmResetProgress } from './storageManagement.js';

export const levelNames = [
    "Brown", "Wood", "Wood2", "Wood3", "Wood4", "Maple", "Maple2", "Horsey", "Leather", "Blue",
    "Blue2", "Blue3", "Canvas", "Blue-Marble", "IC", "Green", "Marble", "Green-Plastic", "Olive", "Grey",
    "Metal", "Newspaper", "Purple", "Purple-Diag", "Pink"
];

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

export const openSettingsModal = () => {
    // Check if the modal already exists
    let modal = document.querySelector('#hue-chess-settings-modal');
    if (modal) {
        document.body.style.overflowY = 'hidden';
        modal.showModal();
        updateModalContent();
        return;
    }

    fetch(chrome.runtime.getURL('settings.html'))
        .then(response => response.text())
        .then(data => {
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

            // Update the modal content with current level and hue progress
            updateModalContent();
        });
}
// expose settings modal to extension button
window.openSettingsModal = openSettingsModal;

export const updateModalContent = () => {
    chrome.storage.local.get(['completedBoards', 'currentHue'], (result) => {
        const level = (result.completedBoards !== null ? result.completedBoards : 0) + 1;
        const huePoints = `${result.currentHue || 0}/100`;

        document.getElementById('current-level').innerText = level;
        document.getElementById('hue-points').innerText = huePoints;
    });
};

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
