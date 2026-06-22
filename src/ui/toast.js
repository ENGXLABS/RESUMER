/**
 * toast.js — Toast notification system.
 * Emits and renders non-blocking status messages.
 *
 * Usage:
 *   import { showToast } from './toast.js';
 *   showToast('Resume saved!', 'success');
 *   showToast('Something went wrong', 'error');
 *   showToast('Copying to clipboard...', 'info');
 */

import { on, EVENTS } from '../core/events.js';

const DURATIONS = { success: 3000, error: 5000, info: 3000, warning: 4000 };

let _container = null;

function getContainer() {
  if (!_container) {
    _container = document.createElement('div');
    _container.id = 'toast-container';
    _container.setAttribute('role', 'region');
    _container.setAttribute('aria-live', 'polite');
    _container.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(_container);
  }
  return _container;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} [type='info']
 * @param {number} [duration] - ms before auto-dismiss
 */
export function showToast(message, type = 'info', duration) {
  const container = getContainer();
  const ms = duration ?? DURATIONS[type] ?? 3000;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;

  const close = document.createElement('button');
  close.className = 'toast__close';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.textContent = '×';
  close.onclick = () => dismiss(toast);
  toast.appendChild(close);

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  const timer = setTimeout(() => dismiss(toast), ms);
  toast.dataset.timer = timer;
}

function dismiss(toast) {
  clearTimeout(Number(toast.dataset.timer));
  toast.classList.remove('toast--visible');
  toast.classList.add('toast--hiding');
  toast.addEventListener('transitionend', () => toast.remove(), { once: true });
}

/**
 * Wire up the toast system to listen to the global TOAST event.
 * Call once on app init.
 */
export function initToasts() {
  on(EVENTS.TOAST, ({ message, type, duration }) => {
    showToast(message, type, duration);
  });
}
