/**
 * events.js — Lightweight event bus for decoupled feature communication.
 * Usage:
 *   import { emit, on, off } from './events.js';
 *   on('ats:score-updated', ({ score }) => console.log(score));
 *   emit('ats:score-updated', { score: 82 });
 */

const _handlers = new Map();

/**
 * Subscribe to an event.
 * @param {string} event
 * @param {Function} handler
 * @returns {Function} Unsubscribe function
 */
export function on(event, handler) {
  if (!_handlers.has(event)) {
    _handlers.set(event, new Set());
  }
  _handlers.get(event).add(handler);
  return () => off(event, handler);
}

/**
 * Unsubscribe from an event.
 * @param {string} event
 * @param {Function} handler
 */
export function off(event, handler) {
  _handlers.get(event)?.delete(handler);
}

/**
 * Emit an event with optional data.
 * @param {string} event
 * @param {*} [data]
 */
export function emit(event, data) {
  _handlers.get(event)?.forEach(fn => {
    try {
      fn(data);
    } catch (err) {
      console.error(`[events] Error in handler for "${event}":`, err);
    }
  });
}

/**
 * Subscribe to an event once — auto-unsubscribes after first call.
 * @param {string} event
 * @param {Function} handler
 */
export function once(event, handler) {
  const unsubscribe = on(event, (data) => {
    handler(data);
    unsubscribe();
  });
  return unsubscribe;
}

// Named events — single source of truth for event names
export const EVENTS = {
  // Profile
  PROFILE_LOADED: 'profile:loaded',
  PROFILE_UPDATED: 'profile:updated',

  // Editor
  EDITOR_CHANGED: 'editor:changed',
  EDITOR_SAVED: 'editor:saved',
  EDITOR_MODE_CHANGED: 'editor:mode-changed',

  // Preview
  PREVIEW_RENDERED: 'preview:rendered',

  // ATS
  ATS_JD_UPDATED: 'ats:jd-updated',
  ATS_SCORE_UPDATED: 'ats:score-updated',
  ATS_KEYWORDS_EXTRACTED: 'ats:keywords-extracted',

  // Templates
  TEMPLATE_CHANGED: 'template:changed',
  RESUME_TYPE_CHANGED: 'resume-type:changed',

  // Tab
  TAB_CHANGED: 'tab:changed',

  // AI
  AI_TAILOR_REQUESTED: 'ai:tailor-requested',
  AI_TAILOR_COMPLETE: 'ai:tailor-complete',
  AI_COVER_REQUESTED: 'ai:cover-requested',
  AI_COVER_COMPLETE: 'ai:cover-complete',

  // Export
  EXPORT_PDF: 'export:pdf',
  EXPORT_DOCX: 'export:docx',
  EXPORT_JSON: 'export:json',

  // UI
  TOAST: 'ui:toast',
  MODAL_OPEN: 'ui:modal-open',
  MODAL_CLOSE: 'ui:modal-close',
};
