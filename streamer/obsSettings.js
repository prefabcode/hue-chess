import { browser } from '../content_scripts/constants.js';

export const OBS_DEFAULTS = {
  obsEnabled: false,
  obsHost: '127.0.0.1',
  obsPort: '4455',
  obsPassword: '',
};

export const OBS_SETTING_KEYS = Object.keys(OBS_DEFAULTS);

export const getObsSettings = () => new Promise((resolve) => {
  browser.storage.local.get(OBS_SETTING_KEYS, (result) => {
    resolve({ ...OBS_DEFAULTS, ...result });
  });
});

export const setObsSettings = (settings) => new Promise((resolve) => {
  browser.storage.local.set(settings, resolve);
});
