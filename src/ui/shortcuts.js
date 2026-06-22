/**
 * shortcuts.js — Keyboard shortcut registry.
 * Registers global key bindings and dispatches to handlers.
 *
 * Usage:
 *   import { registerShortcut, initShortcuts } from './shortcuts.js';
 *   registerShortcut({ key: 's', meta: true }, () => saveResume());
 */

const _shortcuts = [];

/**
 * Register a keyboard shortcut.
 * @param {{ key: string, meta?: boolean, ctrl?: boolean, alt?: boolean, shift?: boolean }} binding
 * @param {Function} handler
 * @param {string} [description] - Human-readable description for the help panel
 */
export function registerShortcut(binding, handler, description = '') {
  _shortcuts.push({ binding, handler, description });
}

/**
 * Get all registered shortcuts (for help panel display).
 */
export function getShortcuts() {
  return _shortcuts.map(({ binding, description }) => ({ binding, description }));
}

/**
 * Initialise the keyboard shortcut listener. Call once on app start.
 */
export function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Skip if user is typing in an input/textarea
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;

    for (const { binding, handler } of _shortcuts) {
      const metaMatch = binding.meta ? (e.metaKey || e.ctrlKey) : true;
      const ctrlMatch = binding.ctrl ? e.ctrlKey : true;
      const altMatch  = binding.alt  ? e.altKey  : true;
      const shiftMatch = binding.shift ? e.shiftKey : true;
      const keyMatch  = e.key?.toLowerCase() === binding.key?.toLowerCase();

      const needsMeta  = binding.meta  ?? false;
      const needsCtrl  = binding.ctrl  ?? false;
      const needsAlt   = binding.alt   ?? false;
      const needsShift = binding.shift ?? false;

      const modifiersMatch =
        (needsMeta  ? (e.metaKey || e.ctrlKey) : !e.metaKey && !e.ctrlKey) &&
        (needsCtrl  ? e.ctrlKey  : !needsMeta && !e.ctrlKey) &&
        (needsAlt   ? e.altKey   : !e.altKey) &&
        (needsShift ? e.shiftKey : !e.shiftKey);

      // Use a simpler match: just check the keys that are required
      const isMatch =
        keyMatch &&
        (!binding.meta  || e.metaKey || e.ctrlKey) &&
        (!binding.ctrl  || e.ctrlKey) &&
        (!binding.alt   || e.altKey) &&
        (!binding.shift || e.shiftKey);

      if (isMatch) {
        e.preventDefault();
        handler(e);
        break;
      }
    }
  });
}
