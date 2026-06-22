/**
 * profile.js — Load, save, export, and import the user's profile.json.
 *
 * The profile is stored in localStorage for persistence across page reloads.
 * Users can also export to / import from profile.json (the file is gitignored).
 *
 * Schema reference: profile.sample.json at the project root.
 */

import { emit, EVENTS } from '../core/events.js';
import { setState } from '../core/state.js';

const STORAGE_KEY = 'resumer-profile';

/**
 * Load profile from localStorage.
 * Returns null if no profile has been saved yet.
 * @returns {object|null}
 */
export function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    console.warn('[profile] Failed to parse saved profile — clearing.');
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Save profile to localStorage and update app state.
 * @param {object} profile
 */
export function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  setState({ profile });
  emit(EVENTS.PROFILE_UPDATED, profile);
}

/**
 * Clear the saved profile from localStorage.
 */
export function clearProfile() {
  localStorage.removeItem(STORAGE_KEY);
  setState({ profile: null });
}

/**
 * Trigger a browser file-download of the current profile as profile.json.
 * @param {object} profile
 */
export function exportProfile(profile) {
  const json = JSON.stringify(profile, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'profile.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Open a file picker and import a profile.json from the user's filesystem.
 * Validates basic schema before saving.
 * @returns {Promise<object>} Resolved profile object
 */
export function importProfile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return reject(new Error('No file selected'));

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const profile = JSON.parse(evt.target.result);
          if (!validateProfile(profile)) {
            return reject(new Error('Invalid profile format. Please use the profile.sample.json schema.'));
          }
          saveProfile(profile);
          emit(EVENTS.PROFILE_LOADED, profile);
          resolve(profile);
        } catch {
          reject(new Error('Failed to parse profile.json — check it is valid JSON.'));
        }
      };
      reader.readAsText(file);
    };

    input.click();
  });
}

/**
 * Minimal schema validation — checks required top-level keys.
 * @param {object} profile
 * @returns {boolean}
 */
function validateProfile(profile) {
  const required = ['identity', 'professional_identity', 'experience', 'education'];
  return required.every(key => key in profile);
}

/**
 * Initialise the profile system on app start.
 * Loads from localStorage and emits PROFILE_LOADED if found.
 * @returns {object|null}
 */
export function initProfile() {
  const profile = loadProfile();
  if (profile) {
    setState({ profile });
    emit(EVENTS.PROFILE_LOADED, profile);
  }
  return profile;
}
