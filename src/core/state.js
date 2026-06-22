/**
 * state.js — Centralized application state
 * All state mutations go through setState() so subscribers are notified.
 */

const STORAGE_KEYS = {
  PROFILE: 'resumer-profile',
  THEME: 'resumer-theme',
  TEMPLATE: 'resumer-template',
  RESUME_TYPE: 'resumer-resume-type',
  JD: 'resumer-jd',
  ZOOM_RESUME: 'resumer-zoom-resume',
  ZOOM_COVER: 'resumer-zoom-cover',
};

const initialState = {
  mode: 'preview',           // 'preview' | 'edit'
  currentTab: 'resume',      // 'resume' | 'cover-letter' | 'ats-checker'
  currentTemplate: 'v1',     // 'v1' | 'v2' | 'v3'
  currentResumeType: 'qe',   // 'qe' | 'tpm' | 'ai'
  zoomResume: 100,
  zoomCover: 100,
  profile: null,             // Loaded from localStorage or profile.json
  markdownContent: '',
  coverLetterContent: '',
  jdContent: '',
  atsScore: null,
  atsKeywords: null,
  isFirstRun: false,
};

let _state = { ...initialState };
const _subscribers = new Map();

/**
 * Get the current state (or a specific key).
 * @param {string} [key] - Optional key to retrieve
 */
export function getState(key) {
  return key ? _state[key] : { ..._state };
}

/**
 * Update one or more state keys and notify subscribers.
 * @param {Partial<typeof initialState>} updates
 */
export function setState(updates) {
  const prev = { ..._state };
  _state = { ..._state, ...updates };

  // Notify all subscribers for changed keys
  for (const [key, value] of Object.entries(updates)) {
    const handlers = _subscribers.get(key);
    if (handlers) {
      handlers.forEach(fn => fn(value, prev[key]));
    }
  }
}

/**
 * Subscribe to state changes for a specific key.
 * @param {string} key
 * @param {Function} handler - Called with (newValue, oldValue)
 * @returns {Function} Unsubscribe function
 */
export function subscribe(key, handler) {
  if (!_subscribers.has(key)) {
    _subscribers.set(key, new Set());
  }
  _subscribers.get(key).add(handler);
  return () => _subscribers.get(key).delete(handler);
}

/**
 * Persist selected state keys to localStorage.
 */
export function persistState() {
  const { currentTemplate, currentResumeType, zoomResume, zoomCover } = _state;
  localStorage.setItem(STORAGE_KEYS.TEMPLATE, currentTemplate);
  localStorage.setItem(STORAGE_KEYS.RESUME_TYPE, currentResumeType);
  localStorage.setItem(STORAGE_KEYS.ZOOM_RESUME, zoomResume);
  localStorage.setItem(STORAGE_KEYS.ZOOM_COVER, zoomCover);
}

/**
 * Restore persisted state from localStorage on app init.
 */
export function restoreState() {
  const template = localStorage.getItem(STORAGE_KEYS.TEMPLATE);
  const resumeType = localStorage.getItem(STORAGE_KEYS.RESUME_TYPE);
  const zoomResume = localStorage.getItem(STORAGE_KEYS.ZOOM_RESUME);
  const zoomCover = localStorage.getItem(STORAGE_KEYS.ZOOM_COVER);
  const jd = localStorage.getItem(STORAGE_KEYS.JD);

  const updates = {};
  if (template) updates.currentTemplate = template;
  if (resumeType) updates.currentResumeType = resumeType;
  if (zoomResume) updates.zoomResume = Number(zoomResume);
  if (zoomCover) updates.zoomCover = Number(zoomCover);
  if (jd) updates.jdContent = jd;

  if (Object.keys(updates).length) setState(updates);
}

export { STORAGE_KEYS };
