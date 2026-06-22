/**
 * tests/theme/settings.test.js
 * Unit tests for src/features/theme/settings.js
 */

import {
    FONT_OPTIONS,
    ACCENT_PRESETS,
    MARGIN_PRESETS,
    DEFAULTS,
    loadSettings,
    saveSettings,
    resetSettings,
    buildOverrideCSS,
} from '../../src/features/theme/settings.js';

// ── localStorage mock (not available in Node/Jest JSDOM-less env) ───────────
const _store = {};
const localStorageMock = {
    getItem:    (k) => _store[k] ?? null,
    setItem:    (k, v) => { _store[k] = String(v); },
    removeItem: (k) => { delete _store[k]; },
    clear:      () => { Object.keys(_store).forEach(k => delete _store[k]); },
};
global.localStorage = localStorageMock;

// ── Basic structure ──────────────────────────────────────────────────────────

describe('constants', () => {
    test('FONT_OPTIONS has 5 entries with required fields', () => {
        expect(FONT_OPTIONS.length).toBe(5);
        FONT_OPTIONS.forEach(f => {
            expect(f).toHaveProperty('id');
            expect(f).toHaveProperty('label');
            expect(f).toHaveProperty('value');
            expect(typeof f.ats).toBe('boolean');
        });
    });

    test('ACCENT_PRESETS has 8 entries, all valid hex', () => {
        expect(ACCENT_PRESETS.length).toBe(8);
        ACCENT_PRESETS.forEach(p => {
            expect(p.value).toMatch(/^#[0-9a-fA-F]{6}$/);
        });
    });

    test('MARGIN_PRESETS has 3 entries', () => {
        expect(MARGIN_PRESETS.length).toBe(3);
        const ids = MARGIN_PRESETS.map(m => m.id);
        expect(ids).toContain('narrow');
        expect(ids).toContain('normal');
        expect(ids).toContain('wide');
    });

    test('DEFAULTS has all required keys', () => {
        expect(DEFAULTS).toHaveProperty('font');
        expect(DEFAULTS).toHaveProperty('fontSize');
        expect(DEFAULTS).toHaveProperty('lineHeight');
        expect(DEFAULTS).toHaveProperty('accent');
        expect(DEFAULTS).toHaveProperty('margins');
    });
});

// ── localStorage helpers ─────────────────────────────────────────────────────

describe('loadSettings / saveSettings / resetSettings', () => {
    beforeEach(() => {
        // Clear localStorage mock before each test
        localStorage.clear();
    });

    test('loadSettings returns DEFAULTS when nothing stored', () => {
        const s = loadSettings();
        expect(s).toEqual(DEFAULTS);
    });

    test('saveSettings + loadSettings round-trips correctly', () => {
        const custom = { ...DEFAULTS, font: 'georgia', accent: '#2563eb', fontSize: 12 };
        saveSettings(custom);
        const loaded = loadSettings();
        expect(loaded.font).toBe('georgia');
        expect(loaded.accent).toBe('#2563eb');
        expect(loaded.fontSize).toBe(12);
    });

    test('loadSettings merges partial stored values with DEFAULTS', () => {
        localStorage.setItem('resumer-theme-settings', JSON.stringify({ font: 'inter' }));
        const s = loadSettings();
        expect(s.font).toBe('inter');
        expect(s.fontSize).toBe(DEFAULTS.fontSize);
        expect(s.lineHeight).toBe(DEFAULTS.lineHeight);
    });

    test('resetSettings removes stored settings and returns DEFAULTS', () => {
        saveSettings({ ...DEFAULTS, font: 'mono' });
        const s = resetSettings();
        expect(s).toEqual(DEFAULTS);
        expect(localStorage.getItem('resumer-theme-settings')).toBeNull();
    });

    test('loadSettings handles corrupted localStorage gracefully', () => {
        localStorage.setItem('resumer-theme-settings', 'NOT_VALID_JSON');
        const s = loadSettings();
        expect(s).toEqual(DEFAULTS);
    });
});

// ── buildOverrideCSS ─────────────────────────────────────────────────────────

describe('buildOverrideCSS', () => {
    test('contains @page rule', () => {
        const css = buildOverrideCSS(DEFAULTS);
        expect(css).toContain('@page');
    });

    test('contains .resume-page font-family', () => {
        const css = buildOverrideCSS(DEFAULTS);
        expect(css).toContain('.resume-page');
        expect(css).toContain('font-family');
    });

    test('reflects custom font choice', () => {
        const css = buildOverrideCSS({ ...DEFAULTS, font: 'georgia' });
        expect(css).toContain('Georgia');
    });

    test('reflects custom accent color', () => {
        const css = buildOverrideCSS({ ...DEFAULTS, accent: '#7c3aed' });
        expect(css).toContain('#7c3aed');
    });

    test('reflects custom font size', () => {
        const css = buildOverrideCSS({ ...DEFAULTS, fontSize: 12.5 });
        expect(css).toContain('12.5pt');
    });

    test('reflects narrow margins', () => {
        const css = buildOverrideCSS({ ...DEFAULTS, margins: 'narrow' });
        expect(css).toContain('0.28in');
    });

    test('reflects wide margins', () => {
        const css = buildOverrideCSS({ ...DEFAULTS, margins: 'wide' });
        expect(css).toContain('0.55in');
    });

    test('sets V3 CSS custom properties', () => {
        const css = buildOverrideCSS(DEFAULTS);
        expect(css).toContain('--v3-accent');
    });

    test('outputs V2 h2 accent border rule', () => {
        const css = buildOverrideCSS(DEFAULTS);
        expect(css).toContain('.resume-page h2');
        expect(css).toContain('border-left');
    });

    test('falls back gracefully with empty settings', () => {
        const css = buildOverrideCSS({});
        expect(css).toContain('@page');
        expect(css).toContain('Calibri');
    });
});
