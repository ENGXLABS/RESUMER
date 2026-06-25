# RESUMER — End-to-End Architecture Audit

**Pro Architect Review · ENGXLABS · June 2026**

---

## Executive Summary

RESUMER is a fully client-side SPA (no backend) — a local-first, markdown-powered, AI-native resume builder deployed on Vercel. The core experience works, but the codebase has a critical structural problem: **two parallel systems running simultaneously with no coordination** — a 3,373-line vanilla JS IIFE (`app.js`) and an ES module layer (`src/`) that was built but never wired to the UI.

| Stat | Count |
|---|---|
| Critical bugs | 7 |
| High severity issues | 8 |
| Security issues | 6 |
| Accessibility failures | 9 |
| Dead code areas | 13 |
| Duplicate implementations | 6 |
| Files with zero test coverage | All IIFE code in app.js |

---

## Severity Scorecard

| Category | Score | Status | Notes |
|---|---|---|---|
| Architecture Health | 6/10 | MODERATE | Dual system incoherence, IIFE + ES modules uncoordinated |
| Security Posture | 5/10 | NEEDS WORK | unsafe-inline CSP, XSS in quick-wins, API keys in plaintext localStorage |
| Accessibility | 4/10 | CRITICAL | Multiple WCAG failures, unstyled onboarding, broken keyboard nav |
| Code Quality | 6/10 | MODERATE | 13+ dead code areas, large monolith, significant duplication |
| Test Coverage | 5/10 | NEEDS WORK | 10 test files exist but test ONLY the unwired module layer — zero tests for live IIFE code |
| Feature Completeness | 7/10 | GOOD | Core features work; enhanceWithAI is a stub, onboarding broken, MCP server broken |
| Performance | 7/10 | GOOD | Static SPA, good CDN usage; file watcher polling at 1.5s, no AI request timeouts |
| Deployment / DevOps | 7/10 | GOOD | Vercel static deploy works; 1hr cache, profile.json could be served publicly |

---

## Critical Bugs (Fix Before Ship)

### 1. MCP Server — `zod` missing from dependencies
- **File:** `mcp-resumer/package.json` + `mcp-resumer/src/index.js:16`
- **Problem:** `import { z } from 'zod'` on line 16 but `zod` is not in `mcp-resumer/package.json` dependencies. MCP server crashes immediately on start with `Cannot find module 'zod'`.
- **Fix:** Add `"zod": "^3.x"` to `mcp-resumer/package.json`

### 2. Onboarding Modal — completely unstyled
- **File:** `src/ui/onboarding.js`
- **Problem:** Classes like `onboarding-overlay`, `onboarding-modal`, `onboarding-btn--primary`, `onboarding-dot` are referenced but **no CSS exists anywhere** in the project. First-run experience renders as raw unstyled HTML flowing at the bottom of the page.
- **Fix:** Add onboarding CSS block to `app.css`

### 3. Double Toast on Cmd+S
- **File:** `src/main.js` + `app.js`
- **Problem:** Both the ES module (`src/main.js → registerShortcuts`) and the IIFE (`app.js → initKeyboardShortcuts`) register Cmd+S handlers. Both fire: module shows "Saved" toast from an event nobody handles, then `app.js` shows "Changes saved" toast. Every save = two toasts.
- **Fix:** Remove duplicate Cmd+S shortcut registration from `src/main.js`

### 4. MCP Server — `readResumeFile` fallback crashes
- **File:** `mcp-resumer/src/index.js:28`
- **Problem:** `map.qe` is `undefined` (key is `'classic'`, not `'qe'`). `path.join(ROOT, undefined)` throws `TypeError` for any unrecognised resume type.
- **Fix:** Change fallback from `map.qe` to `map['classic']`

### 5. `enhanceWithAI` — visible button, stub implementation
- **File:** `app.js ~line 1803`
- **Problem:** "Enhance with AI" button in the ATS tab is fully visible and clickable in production but calls `toast('AI Enhancement coming soon!', 'info', 5000)`. Dead placeholder.
- **Fix:** Hide the button (`display: none`) until the feature is implemented

### 6. Zoom broken on Firefox
- **File:** `app.js` zoom functions
- **Problem:** `document.body.style.zoom` is a non-standard Chrome/Edge property. All zoom functionality silently fails on Firefox — no error, no feedback.
- **Fix:** Replace with `transform: scale()` or the CSS `zoom` property

### 7. Cover Letter zoom state never applied
- **File:** `app.js` + `src/core/state.js`
- **Problem:** `zoomCover` key exists in `STORAGE_KEYS` but the IIFE zoom functions always zoom `document.body` — the cover letter zoom level is stored in state but never read back.
- **Fix:** Apply `zoomCover` state in the cover letter tab's zoom controls

---

## High Severity Issues

### 1. XSS in Quick-Wins +Add buttons
- **File:** `app.js ~line 2097`
- **Problem:** `onclick="window._insertKeyword('${item.keyword.replace(/'/g, "\\'")}')"` — keywords from the JD textarea are only single-quote escaped before injection into `onclick` HTML. A keyword like `</button><script>alert(1)</script>` injects arbitrary HTML.
- **Fix:** Use `data-keyword` attribute + delegated `addEventListener`, never build `onclick` from user input

### 2. API Key bleed on provider switch
- **File:** `app.js → saveAISettings`
- **Problem:** Switching from OpenAI to Anthropic preserves `openaiKey` in the merged config object. The display field then shows the wrong key for the new provider.
- **Fix:** Clear the key input field when provider selection changes

### 3. Classic resume file watcher never reloads
- **File:** `app.js ~line 2000`
- **Problem:** `typeMap` maps `'resume-classic'` but the internal file type string is `'resume-qe'`. Classic resume file changes never trigger a live reload.
- **Fix:** Update `typeMap` key from `'resume-classic'` to `'resume-qe'`

### 4. Share link MutationObserver race condition
- **File:** `app.js → _initPhase7`
- **Problem:** `MutationObserver` on `#resume-content` is registered **after** `loadResume()` is called. If the fetch resolves from cache before the observer attaches, the mutation is missed and the shared resume silently never loads.
- **Fix:** Attach the observer before calling `loadResume()`, or use a direct callback

### 5. Duplicate AI provider logic — two diverging implementations
- **File:** `app.js → _callProvider` + `src/features/ai/provider.js`
- **Problem:** Two separate AI provider dispatch systems with different error messages and behaviour. The module version has no request timeout; the IIFE version uses `AbortSignal.timeout(5000)` for connection tests but not for actual AI actions.
- **Fix:** Wire the live UI to use `src/features/ai/provider.js` and delete the IIFE's inline version

### 6. AI Parser — 4-bullet count crashes tailor action
- **File:** `src/features/ai/parser.js → parseTailorResponse`
- **Problem:** Throws if the LLM summary doesn't return exactly 4 bullets. LLMs returning 3 or 5 bullets cause the entire tailor action to fail with an error shown to the user.
- **Fix:** Accept any number of bullets in the range 2–6

### 7. Anthropic API `temperature` field may cause 400 errors
- **File:** `src/features/ai/provider.js → _sendAnthropic`
- **Problem:** Sends `temperature` in the Anthropic Messages API request body — not in the documented schema for all models. May cause 400 errors with some model versions.
- **Fix:** Remove `temperature` from the Anthropic request or gate it behind the model capability check

### 8. No AI request timeout — UI hangs indefinitely
- **File:** `src/features/ai/provider.js` (all `_send*` functions)
- **Problem:** None of `_sendOllama`, `_sendOpenAI`, `_sendAnthropic` pass an `AbortSignal` with a timeout. A hung AI request blocks the UI with no way to cancel.
- **Fix:** Add `AbortSignal.timeout(30000)` to all provider `fetch` calls

---

## Security Issues

| Issue | Severity | File | Fix |
|---|---|---|---|
| CSP allows `unsafe-inline` for both `script-src` and `style-src` | HIGH | `vercel.json` | Migrate `onclick=""` handlers to `addEventListener`; use nonce or hash-based CSP |
| OpenAI/Anthropic API keys stored in plain `localStorage` | MEDIUM | `app.js → saveAISettings` | Warn users explicitly; consider `sessionStorage` for shorter key lifetime |
| Quick-wins +Add XSS via `onclick` string injection | MEDIUM | `app.js ~line 2097` | Use `data-keyword` attribute + delegated listener |
| Dynamically loaded `docx.js` from CDN without SRI hash | MEDIUM | `app.js ~line 3304` | Add `integrity` attribute to dynamically created `<script>` element |
| Ollama HTTP endpoint in CSP — blocked by mixed-content on HTTPS | LOW | `vercel.json` | Document that Ollama only works on `http://` origin or requires an HTTPS Ollama proxy |
| Full resume content encoded in URL hash — visible in browser history | INFO | `app.js → share modal` | Add a warning in the share modal UI about browser history exposure |

---

## Accessibility Issues (WCAG Failures)

| Issue | WCAG | Location | Fix |
|---|---|---|---|
| Brand `<div role="button">` missing `onkeydown` handler | 2.1.1 | `index.html` | Add `keydown` handler for Enter/Space keys |
| `aria-current="false"` (string) on inactive tabs — truthy to assistive tech | 4.1.2 | `index.html` | Remove `aria-current` entirely from inactive items |
| Shortcut modal missing `aria-modal`, no focus trap | 2.1.2 | `index.html` | Add `aria-modal="true"` + focus trap JS |
| Resume type selector missing `role="group"` + `aria-label` | 1.3.1 | `index.html` | Wrap in `<fieldset>` or add `role="group"` |
| Accent colour `<input type="color">` missing `<label>` | 1.3.1 | `index.html` | Add visible or visually-hidden `<label>` |
| Onboarding modal: focus not trapped or moved to modal on open | 2.1.2 | `src/ui/onboarding.js` | Add focus trap, programmatically move focus on open |
| Onboarding modal completely unstyled | 1.4.1 | `src/ui/onboarding.js` | Add CSS (also listed in Critical Bugs) |
| Quick-win +Add chips have no accessible name | 4.1.2 | `app.js` | Add `aria-label="Add keyword: {word}"` to each button |
| ATS score ring label hardcoded white — invisible on light background | 1.4.3 | `app.css` | Replace `rgba(255,255,255,0.7)` with a design token colour |

---

## Architecture: Dual System Incoherence (Most Important Issue)

This is the single biggest risk in the codebase. Two parallel systems run simultaneously with no coordination:

### System A: `app.js` (IIFE — live, working)
- 3,373 lines of vanilla JS wrapped in an IIFE
- Powers **all** live UI interactions
- Uses inline `onclick` handlers, direct DOM manipulation, direct `localStorage` access
- Contains: theme management, templates, full ATS scoring engine, full AI actions, cover letter, export/import, share

### System B: `src/` (ES modules — built but never wired)
- State management (`persistState` is never called)
- Event bus (all `EVENTS` constants are defined but never emitted or subscribed to)
- AI provider abstraction (never called by any UI action)
- ATS scorer (different implementation from the IIFE — different results)
- Theme settings (generates different CSS than the IIFE version that actually runs)
- All import/export helpers (GitHub, LinkedIn, JSON Resume, share-link)

### User-visible bugs caused by this split
1. **Cmd+S → two toasts** (module fires first, then IIFE fires)
2. **Theme settings**: module's `buildOverrideCSS` generates more CSS variables than the IIFE but the IIFE is what runs
3. **ATS scoring**: two implementations with different keyword patterns produce different scores
4. **All 10 tests cover System B only** — zero unit tests for the live IIFE code (System A)

### Recommended paths forward

| Option | Effort | Outcome |
|---|---|---|
| **A — Accept the monolith** | 1 hour | Remove `src/main.js` script tag from `index.html`, stop loading the module system entirely, fix the bugs in `app.js` directly |
| **B — Progressive migration** | 2–4 weeks | Wire each `src/` module to the IIFE one by one, removing the inline duplicate, test each swap |
| **C — Framework rewrite** | 2–3 months | Rewrite in React / Vue / Svelte with proper component architecture, proper state, proper testing |

**Recommendation:** Do Option A now to stop the bleeding, then plan Option B in sprints.

---

## Dead Code Inventory

| Dead Code | Location | Impact |
|---|---|---|
| `paginateByLines`, `estimateElementLines` | `app.js lines 1832–1870` | None — never called |
| `_origLoadCL` variable | `app.js line 2800` | None — assigned, never used |
| `persistState()` | `src/core/state.js` | State changes from module system never persisted |
| All `EVENTS` constants except `TOAST` | `src/core/events.js` | Event bus wired up, nothing uses it |
| `subscribe()` API | `src/core/state.js` | Zero callers anywhere |
| `accentDark` in `buildOverrideCSS` | `src/features/theme/settings.js` | Computed but never injected into CSS output |
| `.control-actions` CSS class | `settings.css` | Stale from old toolbar, not in HTML |
| `.edit-actions` CSS class | `settings.css` | Stale from old toolbar, not in HTML |
| All `src/data/keywords/*.json` libraries | `src/data/keywords/` | Loaded lazily but no UI ever triggers them |
| `src/features/ai/prompts.js` functions | `src/features/ai/prompts.js` | Defined, no UI action maps to them |
| `improveBulletPrompt` export | `src/features/ai/prompts.js` | Feature exists in MCP only, not in live app |
| `getLibrary`, `detectIndustry` | `src/data/keywords/index.js` | Auto-detect industry never fires |
| `loadLegacyApp()` | `src/main.js` | No-op placeholder, does nothing |

---

## Schema Inconsistencies

The `profile.sample.json` schema is inconsistent with what the IIFE, modules, and AI prompts each expect:

| Field | `profile.sample.json` | IIFE expects | Module expects | AI prompt returns |
|---|---|---|---|---|
| Skills top-level key | `core_skills[].bucket` | `skills.core[].name` | `skills.core[].name` | `skills` as flat array |
| Date fields | `start` / `end` | `start` / `end` | `startDate` / `endDate` | `startDate` / `endDate` |
| Technical skills | `technical_skills` object | `skills.technical[]` flat array | `skills.technical[]` flat array | `technical_skills` object |
| Profile identity | `professional_identity` | `identity` | `identity` | `identity` |

A user filling out `profile.sample.json` and loading it through the AI paste-parse path or JSON Resume exporter will get incorrect or empty output.

**Fix:** Align `profile.sample.json` to the schema the IIFE and modules actually consume, and update the AI paste-parse prompt to return matching field names.

---

## Additional Code Quality Issues

### `app.css` — broken design tokens in JD sidebar and ATS badge
The JD sidebar, quick-wins, and ATS badge sections use CSS custom property names like `--color-border`, `--color-bg-secondary`, `--color-text` that are **never defined in `:root`**. These are unknown variables — the hardcoded fallback values (`#ddd`, `#f9fafb`, `#333`) are always used instead. These elements **never switch correctly in dark mode**.

### `settings.css` — duplicate hover rules
`#download-button:hover` and `#print-button:hover` are defined identically in both `app.css` and `settings.css`. One definition is always dead.

### `app.js` — auto-save interval never cleared
`setInterval(() => { ... }, 30000)` on the auto-save has no stored reference and is never cleared. Fine for a SPA but is a code smell. Similarly the file watcher `setInterval(poll, 1500)` is never cleared.

### `src/features/profile.js` — blob URL revoked too early
`URL.revokeObjectURL(url)` is called synchronously after `a.click()`. On some browsers this revokes the blob before the download starts.
**Fix:** Wrap in `setTimeout(() => URL.revokeObjectURL(url), 100)`

---

## Top 10 Priority Fixes (by Impact / Effort)

| Priority | Fix | Effort | Impact |
|---|---|---|---|
| 1 | Add `zod` to `mcp-resumer/package.json` | 5 min | Unbreaks MCP server entirely |
| 2 | Add onboarding CSS to `app.css` | 1 hour | Unbreaks first-run UX for all new users |
| 3 | Fix double Cmd+S toast — remove shortcut from `src/main.js` | 15 min | Fixes confusing UX on every save |
| 4 | Fix XSS in quick-wins `onclick` — use `data-keyword` + event delegation | 30 min | Closes medium-severity security hole |
| 5 | Fix Firefox zoom — replace `document.body.style.zoom` with CSS transform | 1 hour | Makes zoom work on ~30% of desktop browsers |
| 6 | Fix `readResumeFile` fallback in MCP — change `map.qe` to `map['classic']` | 5 min | Prevents MCP server TypeError |
| 7 | Add `AbortSignal.timeout(30000)` to all AI provider `fetch` calls | 30 min | Prevents indefinite UI hang on slow AI |
| 8 | Hide `enhanceWithAI` button until implemented | 10 min | Removes dead UI from ATS tab |
| 9 | Fix `aria-current="false"` string on inactive tabs | 15 min | Fixes screen-reader misreading all tabs as active |
| 10 | Fix ATS score ring colour — replace hardcoded white with design token | 10 min | Fixes invisible label on light-theme ATS results |

---

## What's Working Well

- **Design token system** — `--brand-*`, `--surface-*`, `--text-*` tokens are well-structured and consistently used throughout the main CSS
- **Print styles** — thorough and well-organised across all 3 resume types; properly hides UI chrome
- **ATS scoring engine** (IIFE version) — sophisticated implementation with synonym maps, context weighting, progressive threshold scoring, and live badge updates
- **Three resume types + three layout templates** — proper CSS isolation between Classic, Professional, and Modern variants
- **Cover letter builder with ATS integration** — strong differentiator, the ATS-against-JD scoring for cover letters is a genuinely useful feature
- **GitHub and LinkedIn import flows** — thoughtfully designed with sensible field mapping
- **MCP server concept** — exposing resume tools to AI coding assistants via the Model Context Protocol is excellent product thinking (even though the implementation has bugs)
- **Test infrastructure** — 10 well-structured test files covering the module layer; good foundation to expand to cover the IIFE
- **Vercel deployment** — clean static deploy with proper security headers and cache configuration
- **Share-link encoding** — the Base64 URL hash share mechanism is well-implemented and correctly handles encoding edge cases

---

## Recommended Sprint Plan

### Sprint 1 — Stop the bleeding (1–2 days)
- Fix all 7 critical bugs
- Fix top 4 priority items from the priority list
- Remove `src/main.js` script tag from `index.html` (Option A — stop dual system confusion)

### Sprint 2 — Security + Accessibility (2–3 days)
- Fix XSS in quick-wins onclick (Priority 4)
- Fix all 9 accessibility issues
- Fix API key bleed on provider switch
- Add AI request timeouts

### Sprint 3 — Schema + Code Quality (2–3 days)
- Align `profile.sample.json` schema
- Fix undefined CSS custom properties in dark mode (JD sidebar, ATS badge)
- Remove dead code inventory items
- Add tests for IIFE's core functions (ATS scoring, save/load, template switching)

### Sprint 4 — Feature Completeness (1 week)
- Implement `enhanceWithAI` properly or deprecate the button
- Wire `src/data/keywords/` industry libraries to the ATS checker UI
- Wire `improveBulletPrompt` from `src/features/ai/prompts.js` to a UI action
- Fix Firefox zoom

---

*Report generated by Claude Code (Sonnet 4.6) · ENGXLABS · June 2026*
