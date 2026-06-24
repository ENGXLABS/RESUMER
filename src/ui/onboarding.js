/**
 * onboarding.js — First-run wizard modal.
 *
 * Shown when no profile.json has been set up yet.
 * Guides the user through 4 steps:
 *   1. Welcome & intro
 *   2. Choose how to set up (paste JSON, fill form, or skip)
 *   3. Profile preview
 *   4. Done — open editor
 */

import { importProfile } from '../features/profile.js';
import { emit, EVENTS } from '../core/events.js';

const SEEN_KEY = 'resumer-onboarding-seen';

/**
 * Show the onboarding wizard if the user hasn't seen it before
 * and has no saved profile.
 * @param {object|null} profile - Current profile (null = first run)
 */
export function maybeShowOnboarding(profile) {
  const seen = localStorage.getItem(SEEN_KEY);
  if (profile || seen) return;
  showOnboarding();
}

/**
 * Force-show the onboarding wizard (e.g. from Settings > Reset).
 */
export function showOnboarding() {
  const overlay = createOverlay();
  document.body.appendChild(overlay);
  renderStep(overlay, 1);
}

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'onboarding-overlay';
  overlay.className = 'onboarding-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'onboarding-title');
  return overlay;
}

const STEPS = {
  1: {
    title: 'Welcome to Resumer',
    content: `
      <p>Resumer is a local-first, markdown-powered resume builder with real-time ATS scoring.</p>
      <p>Your data never leaves your machine. Everything is stored in your browser's localStorage, 
      and you can export to a <code>profile.json</code> file anytime.</p>
      <p>Let's get you set up in under a minute.</p>
    `,
    actions: [
      { label: 'Get Started', primary: true, next: 2 },
      { label: 'Skip for now', skip: true },
    ],
  },
  2: {
    title: 'Set Up Your Profile',
    content: `
      <p>Your profile holds your name, experience, skills, and achievements — the source of truth for every resume you generate.</p>
      <p>How would you like to start?</p>
      <div class="onboarding-options">
        <button class="onboarding-option" id="ob-import">
          <strong>Import profile.json</strong>
          <span>Already have one from a previous install</span>
        </button>
        <button class="onboarding-option" id="ob-sample">
          <strong>Use sample profile</strong>
          <span>Load the sample data to explore the app</span>
        </button>
        <button class="onboarding-option" id="ob-skip-profile">
          <strong>Skip</strong>
          <span>I'll edit the markdown files directly</span>
        </button>
      </div>
    `,
    actions: [],
  },
  3: {
    title: 'You\'re Ready',
    content: `
      <p>Your profile is loaded. Here's what you can do:</p>
      <ul>
        <li><strong>Resume tab</strong> — edit and preview your resume</li>
        <li><strong>Cover Letter tab</strong> — tailor a cover letter per JD</li>
        <li><strong>ATS Score tab</strong> — paste a job description and get a real-time score</li>
      </ul>
      <p>Tip: Press <kbd>⌘S</kbd> / <kbd>Ctrl+S</kbd> to save edits, 
      <kbd>⌘P</kbd> / <kbd>Ctrl+P</kbd> to print, and 
      <kbd>?</kbd> to see all shortcuts.</p>
    `,
    actions: [
      { label: 'Open Resumer', primary: true, finish: true },
    ],
  },
};

function renderStep(overlay, stepNum) {
  const step = STEPS[stepNum];
  if (!step) return;

  overlay.innerHTML = `
    <div class="onboarding-modal">
      <button class="onboarding-close" aria-label="Close" title="Skip onboarding">&times;</button>
      <div class="onboarding-progress">
        ${[1, 2, 3].map(n => `<div class="onboarding-dot ${n === stepNum ? 'active' : n < stepNum ? 'done' : ''}"></div>`).join('')}
      </div>
      <h2 id="onboarding-title" class="onboarding-title">${step.title}</h2>
      <div class="onboarding-content">${step.content}</div>
      <div class="onboarding-actions">
        ${step.actions.map(a => `
          <button 
            class="onboarding-btn ${a.primary ? 'onboarding-btn--primary' : 'onboarding-btn--secondary'}"
            data-next="${a.next || ''}"
            data-skip="${a.skip || ''}"
            data-finish="${a.finish || ''}">
            ${a.label}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Wire close (×) button
  overlay.querySelector('.onboarding-close')?.addEventListener('click', () => dismiss(overlay));

  // Wire step 2 option buttons
  if (stepNum === 2) {
    overlay.querySelector('#ob-import')?.addEventListener('click', async () => {
      try {
        await importProfile();
        renderStep(overlay, 3);
      } catch (err) {
        emit(EVENTS.TOAST, { message: err.message, type: 'error' });
      }
    });

    overlay.querySelector('#ob-sample')?.addEventListener('click', async () => {
      try {
        const res = await fetch('./profile.sample.json');
        const sample = await res.json();
        const { saveProfile } = await import('../features/profile.js');
        saveProfile(sample);
        emit(EVENTS.TOAST, { message: 'Sample profile loaded!', type: 'success' });
        renderStep(overlay, 3);
      } catch {
        emit(EVENTS.TOAST, { message: 'Could not load sample profile.', type: 'error' });
      }
    });

    overlay.querySelector('#ob-skip-profile')?.addEventListener('click', () => {
      dismiss(overlay);
    });
  }

  // Wire next/skip/finish buttons
  overlay.querySelectorAll('.onboarding-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.finish === 'true') {
        dismiss(overlay);
      } else if (btn.dataset.skip === 'true') {
        dismiss(overlay);
      } else if (btn.dataset.next) {
        renderStep(overlay, Number(btn.dataset.next));
      }
    });
  });
}

function dismiss(overlay) {
  localStorage.setItem(SEEN_KEY, '1');
  overlay.classList.add('onboarding-overlay--hidden');
  overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
}
