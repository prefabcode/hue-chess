import {
	updateProgressBar,
	monitorBoardDiv,
	waitForElm,
	updateProgressBarTooltip,
	resetUserMenuState,
} from "./uiUpdates.js";
import { checkUrlAndStartMonitoring } from "./gameMonitoring.js";

const sleep = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function createOnboardingModal() {
	// Create the dialog element
	const dialog = document.createElement("dialog");
	dialog.id = "hue-onboarding-modal";

	// Create the content for the dialog
	const content = document.createElement("div");
	content.innerHTML = `
    <div class="close-button-anchor">
      <button id="close-hue-onboarding-modal-x" class="close-button" data-icon="" aria-label="Close"></button>
    </div>
    <div class="scrollable dialog-content">
      <h2>Welcome to Hue Chess!</h2>
      <p>Hue Chess adds gamification elements to Lichess. With this extension enabled, you'll earn <strong>Hue Points</strong> every time you win a game. These points slightly change the color of your chessboard, and are also used to track your progress throughout each level. </p>

      <h3>Discover Exciting Perks</h3>
      <p>Hue Chess features a <strong>Perk System</strong> that boosts the number of Hue Points you earn for every win, in exchange for completing specific challenges on Lichess. As you progress and gain levels in Hue Chess, you'll unlock new perks that provide different ways to accumulate even more Hue Points for your victories!</p>

      <h3>Level Up with Hue Points</h3>
      <p>Each level requires 100 Hue Points, and every level features a unique chessboard theme. Journey through 17 distinct levels, discover 9 unique perks, and complete the Hue Chess Challenge!</p>

      <h3>Get Started</h3>
      <p>To choose your perks, simply click on the <strong>Hue Progress Bar</strong> in the top right corner of your navigation bar.</p>

      <button id="close-hue-onboarding-modal" class="button" style="margin-top: 20px;">Get Started!</button>
    </div>
  `;

	// Append the content to the dialog
	dialog.appendChild(content);
	document.body.appendChild(dialog);

	// Show the dialog
	dialog.showModal();

	// Add event listener to close the dialog
	document
		.getElementById("close-hue-onboarding-modal")
		.addEventListener("click", () => {
			dialog.close();
			dialog.remove();
		});

	document
		.getElementById("close-hue-onboarding-modal-x")
		.addEventListener("click", () => {
			dialog.close();
			dialog.remove();
		});
}

// event handler that populates dasher app may not be set at the time this is called initially
// retry to see if dasher_app menu is populated before continuing with installation.
async function ensureDasherAppIsPopulated(maxRetries) {
	let retries = 0;
	while (retries < maxRetries) {
		const userTag = document.querySelector("#user_tag");
		const dasherApp = document.querySelector("#dasher_app");

		if (userTag) {
			userTag.click();
			console.log("user_tag clicked");

			await sleep(500);

			if (dasherApp && dasherApp.children.length > 0) {
				console.log("dasher_app populated");
				return true;
			}
		}

		retries++;
		console.log(`Retrying to click user_tag and check dasher_app... Attempt
 ${retries}`);
		await sleep(500);
	}
	console.error("Failed to populate dasher_app after multiple attempts");
	return false;
}

export const initializeExtension = async () => {
	console.log("Initializing extension for the first time...");
	await resetUserMenuState();
	createOnboardingModal();

	try {
		const dasherResult = await ensureDasherAppIsPopulated(10);
		if (!dasherResult) {
			alert(
				"Hue Chess installation failed. Try to reinstall the extension. Please report this error to prefabcode@gmail.com or make an issue on the project github: https://github.com/prefabcode/hue-chess/issues",
			);
			return;
		}

		const subsDiv = await waitForElm(".subs");
		console.log("Subs div detected");
		const subButtons = subsDiv.querySelectorAll("button.sub");
		if (subButtons.length < 5) {
			console.error(
				`Error: expected at least 5 buttons in menu container, but found ${subButtons.length}`,
			);
			return;
		}
		const boardButton = subButtons[3]; // currently binded to Board Button

		boardButton.click();
		console.log("Clicked board button");

		const userTag = await waitForElm("#user_tag");
		const boardSettingsDiv = await waitForElm(".board");
		const boardBackButton = await waitForElm(".head");

		const dimensionSelector = boardSettingsDiv.querySelector(".selector");
		if (!dimensionSelector) {
			console.error(
				"Dimension selector element not detected, initialization failed",
			);
			return;
		}
		const the2DButton = Array.from(
			dimensionSelector.querySelectorAll("button"),
		).find((button) => button.textContent === "2D");
		if (!the2DButton) {
			console.error("2d button not found, initialization failed");
			return;
		}
		the2DButton.click();
		console.log("Clicked 2d button");

		const boardList = await waitForElm(".list");
		const brownBoardButton = boardList.querySelector('button[title="brown"]');
		if (!brownBoardButton) {
			console.log("Brown board button not found");
			return;
		}

		brownBoardButton.click();
		console.log("Clicked brown board button");

		const isTransparentMode = document.body.classList.contains("transp");
		if (isTransparentMode) {
			const boardOpacityDiv = await waitForElm(".board-opacity");
			const opacitySlider = boardOpacityDiv.querySelector("input.range");
			if (!opacitySlider) {
				console.error("transparency mode detected but opacity not found");
				return;
			}
			opacitySlider.value = 100;
			opacitySlider.dispatchEvent(new Event("input"));
			console.log("Opacity slider set to 100");
		} else {
			const boardBrightnessDiv = await waitForElm(".board-brightness");
			const brightnessSlider = boardBrightnessDiv.querySelector("input.range");
			if (!brightnessSlider) {
				console.error("light/dark mode detected but brightness not found");
				return;
			}
			brightnessSlider.value = 100;
			brightnessSlider.dispatchEvent(new Event("input"));
			console.log("Brightness slider set to 100");
		}

		const boardHueDiv = await waitForElm(".board-hue");
		const hueSlider = boardHueDiv.querySelector("input.range");
		if (!hueSlider) {
			console.log("Hue slider not found");
			return;
		}

		hueSlider.value = 0;
		hueSlider.dispatchEvent(new Event("input"));
		console.log("Set hue slider to 0");
		boardBackButton.click(); // return to default profile view
		userTag.click(); // Close the user menu

		// Mark the initialization as done
		browser.storage.local.set(
			{ initialized: true, completedBoards: 0, prestige: 0 },
			() => {
				console.log("Initialization complete, flag set in storage");
				// TODO: Understand how this works, wouldn't passing 0 in this method break updateProgressBar?
				updateProgressBar(0, 0);
			},
		);
	} catch (error) {
		console.error("An error occurred during initialization:", error);
	}
};

export const init = async () => {
	console.log("Initializing extension...");

	browser.storage.local.get(["initialized"], (result) => {
		if (!result.initialized) {
			initializeExtension();
		} else {
			console.log("Extension already initialized");
			// Initialize the progress bar with current values
			browser.storage.local.get(["completedBoards", "currentHue"], (result) => {
				updateProgressBar(result.completedBoards, result.currentHue);
			});
		}
	});

	updateProgressBarTooltip();
	monitorBoardDiv();
	await checkUrlAndStartMonitoring();
	let currentUrl = window.location.href;

	setInterval(() => {
		if (currentUrl !== window.location.href) {
			currentUrl = window.location.href;
			checkUrlAndStartMonitoring();
		}
	}, 1000);
};
