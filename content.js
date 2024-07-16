import { init } from './content_scripts/initialization.js';
import { openSettingsModal } from './content_scripts/uiUpdates.js';


// Start the extension
init();

// Expose the openSettingsModal function to the window object
window.openSettingsModal = openSettingsModal;
