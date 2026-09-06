import { browser } from '../content_scripts/constants.js';
import { buildState, STREAMER_STATE_KEYS } from '../streamer/state.js';
import { getObsSettings, OBS_SETTING_KEYS } from '../streamer/obsSettings.js';
import { applyObsSettings, emitToObs } from './obsClient.js';

const HEARTBEAT_MS = 3000;
const TRANSIENT_TYPES = ['toast', 'clock', 'levelup', 'prestige'];

let started = false;

const publishState = async () => {
  emitToObs(await buildState());
};

const refreshSettings = async () => {
  applyObsSettings(await getObsSettings());
};

export const startBridge = () => {
  if (started) return;
  started = true;

  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    const keys = Object.keys(changes);
    if (keys.some((key) => OBS_SETTING_KEYS.includes(key))) refreshSettings();
    if (keys.some((key) => STREAMER_STATE_KEYS.includes(key))) publishState();
  });

  browser.runtime.onMessage.addListener((message) => {
    if (message?.v === 1 && TRANSIENT_TYPES.includes(message.type)) emitToObs(message);
  });

  setInterval(publishState, HEARTBEAT_MS);
  refreshSettings();
};
