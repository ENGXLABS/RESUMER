/**
 * main.js — Application entry point.
 *
 * Bootstraps all modules in the correct order and wires up the DOM.
 * Loaded via <script type="module" src="src/main.js"> in index.html.
 */

import { restoreState, getState } from './core/state.js';
import { emit, on, EVENTS } from './core/events.js';
import { initProfile } from './features/profile.js';
import { initToasts, showToast } from './ui/toast.js';
import { initShortcuts, registerShortcut } from './ui/shortcuts.js';
import { maybeShowOnboarding } from './ui/onboarding.js';

/**
 * Bootstrap sequence
 */
async function bootstrap() {
  // 1. Restore persisted state (theme, template, zoom, etc.)
  restoreState();

  // 2. Wire up toasts — must be before any emit(EVENTS.TOAST)
  initToasts();

  // 3. Load user profile
  const profile = initProfile();

  // 4. Register keyboard shortcuts
  initShortcuts();
  registerShortcuts();

  // 5. Show onboarding wizard on first run
  maybeShowOnboarding(profile);

  // 6. Dynamically load the legacy app.js for backward compatibility
  //    (the monolith is progressively replaced by the modules above)
  await loadLegacyApp();
}

/**
 * Gradually migrate from the monolithic app.js.
 * Once all features are modularized, this import is removed.
 */
async function loadLegacyApp() {
  // The legacy IIFE in app.js initialises the UI with DOMContentLoaded.
  // Because it's not a module, it self-executes. We just let it run.
  // Feature modules above override specific behaviours via events.
  return Promise.resolve();
}

/**
 * Register app-wide keyboard shortcuts.
 */
function registerShortcuts() {
  registerShortcut({ key: 's', meta: true }, () => {
    emit(EVENTS.EDITOR_SAVED);
    showToast('Saved', 'success');
  }, '⌘S — Save');

  registerShortcut({ key: '?', shift: false }, () => {
    emit(EVENTS.MODAL_OPEN, { type: 'shortcuts' });
  }, '? — Show shortcuts');

  registerShortcut({ key: '=', meta: true }, () => {
    const state = getState();
    const key = state.currentTab === 'cover-letter' ? 'zoomCover' : 'zoomResume';
    emit('zoom:in', { key });
  }, '⌘= — Zoom in');

  registerShortcut({ key: '-', meta: true }, () => {
    const state = getState();
    const key = state.currentTab === 'cover-letter' ? 'zoomCover' : 'zoomResume';
    emit('zoom:out', { key });
  }, '⌘- — Zoom out');

  registerShortcut({ key: '0', meta: true }, () => {
    emit('zoom:reset');
  }, '⌘0 — Reset zoom');
}

// Run bootstrap when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
