import { init, initializeExtension } from './content_scripts/initialization.js';
import { incrementHue } from './content_scripts/rewardCalculation.js';
import { checkUrlAndStartMonitoring } from './content_scripts/gameMonitoring.js';
import { openSettingsModal } from './content_scripts/uiUpdates.js';
import { exportExtensionState, importExtensionState, confirmResetProgress, resetProgress } from './content_scripts/storageManagement.js';

// Start the extension
init(incrementHue, checkUrlAndStartMonitoring);

// Expose the openSettingsModal function to the window object
window.openSettingsModal = openSettingsModal;
