/**
 * src/features/theme/settings.js
 *
 * Manages resume visual customisation (font, accent color, size, spacing, margins).
 * Settings are persisted to localStorage under `resumer-theme-settings`.
 *
 * Usage:
 *   import { loadSettings, buildOverrideCSS } from './settings.js';
 *   document.getElementById('resumer-theme-overrides').textContent = buildOverrideCSS(loadSettings());
 */

export const FONT_OPTIONS = [
    { id: 'calibri',  label: 'Calibri',   ats: true,  value: "Calibri, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" },
    { id: 'inter',    label: 'Inter',      ats: false, value: "'Inter', 'Segoe UI', system-ui, sans-serif" },
    { id: 'georgia',  label: 'Georgia',    ats: true,  value: "Georgia, 'Times New Roman', serif" },
    { id: 'garamond', label: 'Garamond',   ats: false, value: "Garamond, 'EB Garamond', Georgia, serif" },
    { id: 'mono',     label: 'Mono',       ats: false, value: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" },
];

export const ACCENT_PRESETS = [
    { id: 'navy',    label: 'Navy',    value: '#1E3A5F' },
    { id: 'blue',    label: 'Blue',    value: '#2563eb' },
    { id: 'indigo',  label: 'Indigo',  value: '#4f46e5' },
    { id: 'violet',  label: 'Violet',  value: '#7c3aed' },
    { id: 'emerald', label: 'Emerald', value: '#059669' },
    { id: 'teal',    label: 'Teal',    value: '#0d9488' },
    { id: 'rose',    label: 'Rose',    value: '#e11d48' },
    { id: 'amber',   label: 'Amber',   value: '#d97706' },
];

export const MARGIN_PRESETS = [
    { id: 'narrow', label: 'Narrow', block: '0.28in', inline: '0.22in' },
    { id: 'normal', label: 'Normal', block: '0.40in', inline: '0.35in' },
    { id: 'wide',   label: 'Wide',   block: '0.55in', inline: '0.50in' },
];

export const DEFAULTS = {
    font:       'calibri',
    fontSize:   11,
    lineHeight: 1.3,
    accent:     '#1E3A5F',
    margins:    'normal',
};

const STORAGE_KEY = 'resumer-theme-settings';

/** Load settings from localStorage, falling back to DEFAULTS. */
export function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch {
        return { ...DEFAULTS };
    }
}

/** Persist settings to localStorage. */
export function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/** Clear settings from localStorage and return DEFAULTS. */
export function resetSettings() {
    localStorage.removeItem(STORAGE_KEY);
    return { ...DEFAULTS };
}

/**
 * Build a CSS string that overrides the resume page styles.
 * Injected into <style id="resumer-theme-overrides">.
 */
export function buildOverrideCSS(settings) {
    const s = { ...DEFAULTS, ...settings };

    const fontOption = FONT_OPTIONS.find(f => f.id === s.font) || FONT_OPTIONS[0];
    const margin     = MARGIN_PRESETS.find(m => m.id === s.margins) || MARGIN_PRESETS[1];
    const accent     = s.accent || DEFAULTS.accent;
    const accentLight = _hexAlpha(accent, 0.08);
    const accentMid   = _hexAlpha(accent, 0.20);
    const accentDark  = _darken(accent);

    return `
/* ── Resumer theme overrides (generated) ── */

@page { margin: ${margin.block} ${margin.inline}; }

/* Base typography */
.resume-page {
    font-family: ${fontOption.value} !important;
    font-size: ${s.fontSize}pt !important;
    line-height: ${s.lineHeight} !important;
}

/* Print margins */
@media print {
    body {
        font-family: ${fontOption.value} !important;
        font-size: ${s.fontSize}pt !important;
        margin: ${margin.block} ${margin.inline} !important;
    }
}

/* Screen padding (mirrors @page margin so print/screen match) */
@media screen {
    .resume-page {
        padding: ${margin.block} ${margin.inline} !important;
    }
}

/* V3 accent tokens */
:root {
    --v3-accent:           ${accent};
    --v3-accent-light:     ${accentLight};
    --v3-accent-mid:       ${accentMid};
    --v3-highlight:        ${accent};
    --v3-highlight-light:  ${accentLight};
}

/* V2 section headers — add accent left border */
.resume-page h2 {
    background: ${accentLight} !important;
    border-left: 3px solid ${accent} !important;
    padding-left: 6pt !important;
}

/* V1 h2 underline accent */
.resume-page h2:not([class]) {
    border-bottom-color: ${accent} !important;
}
`.trim();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function _hexAlpha(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function _darken(hex) {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 20);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 20);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 20);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}
