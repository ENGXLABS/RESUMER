# Resumer — Implementation Plan

> **Vision:** An open source, local-first resume builder hosted at a public URL — anyone visits, fills in their profile, gets an ATS-optimized resume with real-time scoring. No account. No tracking. No backend.

## Product Direction

| Axis | Decision |
|------|----------|
| **Distribution** | Open source repo (GitHub) + hosted web app (resumer.app or similar) |
| **Architecture** | Static site, zero backend — all data in browser localStorage |
| **Editor model** | Markdown-first for launch (Option A); AI paste-and-parse in Phase 4 (Option C) |
| **Monetization** | Free forever, open source. Optional: GitHub Sponsors, premium themes |
| **Audience** | Developers first (launch), everyone eventually |

---

## Key Differentiators

1. **Live ATS score in the editor** — not a separate tool, updates as you type
2. **Markdown-first** — every AI tool (Claude, Copilot, Cursor, any LLM) reads and writes resumes natively
3. **Local-first, zero tracking** — profile never leaves the browser unless the user exports it
4. **AI paste-and-parse** — paste your LinkedIn / old resume, AI extracts your profile (Phase 4)
5. **Open standard** — JSON Resume export works with the entire ecosystem

---

## Phase 1 — Open Source Foundation ✅

**Branch:** `feature/phase-1-open-source-foundation`
**Status:** Complete

- ✅ `LICENSE` (MIT)
- ✅ `CONTRIBUTING.md`
- ✅ `.github/ISSUE_TEMPLATE/` (bug report + feature request)
- ✅ `.github/pull_request_template.md`
- ✅ `.github/workflows/ci.yml` (test + lint on push/PR)
- ✅ `README.md` updated for open source
- ✅ `.gitignore` updated (personal data excluded)
- ✅ `package.json` (npm dev/test/lint scripts)
- ✅ `profile.sample.json` (full schema template)
- ✅ `src/core/state.js` + `src/core/events.js`
- ✅ `src/features/profile.js`
- ✅ `src/ui/toast.js` + `src/ui/shortcuts.js` + `src/ui/onboarding.js`
- ✅ `src/main.js` (ES module bootstrap)

---

## Phase 2 — Production Cleanup + Hosted Deployment

**Branch:** `feature/phase-2-production-cleanup`
**Goal:** Remove all personal data from the repo. Make it safe and deployable to a public URL.

### 2.1 Remove Personal Data from Committed Files

- [ ] Replace `components/resume/resume.md` with sample/demo content (generic persona)
- [ ] Replace `components/cover-letter/cover-letter.md` with sample content
- [ ] Replace `components/resume-tpm/resume-tpm.md` with sample content
- [ ] Replace `components/resume-ai/resume-ai.md` with sample content
- [ ] Gitignore `.github/resume-master-content.md` (personal)
- [ ] Gitignore `.github/resume-role-templates.md` (personal)
- [ ] Gitignore `.github/resume-ai-master-content.md` (personal)
- [ ] Gitignore `.github/instructions/` (personal AI workflow instructions)
- [ ] Gitignore `CLAUDE.md` → replace with generic public version
- [ ] Gitignore `GEMINI.md`
- [ ] Rewrite `.github/copilot-instructions.md` to be generic (not Siva-specific)

### 2.2 Folder Restructure (Production-Grade)

```
resumer/
├── public/                   ← NEW: favicon, og-image, robots.txt
├── src/
│   ├── core/                 ← Done
│   ├── features/
│   │   ├── profile.js        ← Done
│   │   ├── ats/              ← NEW in Phase 3
│   │   ├── export/           ← NEW in Phase 7
│   │   └── ai/               ← NEW in Phase 4
│   ├── ui/                   ← Done
│   └── data/
│       └── keywords/         ← NEW: ATS industry keyword libraries
├── templates/                ← NEW: CSS themes (replaces components/resume/*.css)
│   ├── classic/
│   ├── modern/
│   └── minimal/
├── docs/                     ← NEW: user-facing documentation
├── tests/                    ← NEW: Jest test suites
└── vercel.json               ← NEW: static deployment config
```

### 2.3 Hosted Deployment

- [ ] `vercel.json` — static deployment config (zero config, just points to `index.html`)
- [ ] Check domain availability: `resumer.app`, `resumer.dev`, `resumer.io`
- [ ] Configure custom domain in Vercel
- [ ] Add `public/robots.txt`, `public/og-image.png`, `public/favicon.svg`
- [ ] Add Open Graph meta tags to `index.html` (title, description, og:image)
- [ ] Test full app on deployed URL

### 2.4 Demo Content

The repo ships with a realistic sample resume (generic persona "Alex Rivera") so anyone can:
1. Clone the repo and see a working resume immediately
2. Replace the sample with their own content
3. The sample demonstrates all template features

### Phase 2 Definition of Done

- [ ] Zero personal data in any committed file
- [ ] App deploys to Vercel with one click
- [ ] Custom domain points to the deployed app
- [ ] Sample resume looks professional and demonstrates all features
- [ ] Any developer can clone → `npm run dev` → see a working app in 60 seconds

---

## Phase 3 — World-Class ATS Engine

**Branch:** `feature/phase-3-ats-engine`
**Goal:** Real-time ATS scoring embedded directly into the resume-making experience.

### 3.1 JD Input Panel (Persistent Sidebar)

- [ ] Collapsible right panel alongside the preview
- [ ] JD textarea persists in `localStorage` (key: `resumer-jd`)
- [ ] "Analyze JD" button → triggers keyword extraction
- [ ] Auto-extracts keywords into categories:
  - Required Skills, Tools & Technologies, Leadership & Soft Skills, Domain Keywords, Action Verbs

### 3.2 Live ATS Score Badge

- [ ] Score badge in the header updates in real-time as user types
- [ ] Color coding: 0–60% red, 61–80% amber, 81–100% green
- [ ] Score breakdown panel: click badge → shows per-category scores
- [ ] Score persists between sessions

### 3.3 ATS Scoring Algorithm (Pure JS, No API)

```javascript
const WEIGHTS = {
  required_skills: 2.0,
  tools:           1.5,
  leadership:      1.0,
  domain:          1.0,
  action_verbs:    0.5
};

function calculateScore(resumeText, jdKeywords) {
  let totalWeight = 0, matchedWeight = 0;
  for (const [category, keywords] of Object.entries(jdKeywords)) {
    const weight = WEIGHTS[category] || 1.0;
    for (const kw of keywords) {
      totalWeight += weight;
      if (resumeText.toLowerCase().includes(kw.toLowerCase())) matchedWeight += weight;
    }
  }
  return Math.round((matchedWeight / totalWeight) * 100);
}
```

### 3.4 Keyword Heat Map in Preview

- [ ] Keywords found in resume: green underline in preview
- [ ] Matched keywords listed in sidebar with green checkmarks
- [ ] Missing keywords listed with red X marks
- [ ] Click missing keyword → copies a suggested bullet snippet to clipboard
- [ ] Toggle heat map on/off

### 3.5 Smart Suggestion Panel

- [ ] "Quick Wins" — top 5 missing keywords with most impact
- [ ] One-click "Insert" → adds placeholder bullet with the keyword to editor
- [ ] Detects overused words (flags 5+ uses of "Responsible for")
- [ ] "Predicted score after fixes: XX%" shown at bottom

### 3.6 Industry Keyword Libraries (`src/data/keywords/`)

- [ ] `quality-engineering.json`
- [ ] `software-engineering.json`
- [ ] `product-management.json`
- [ ] `data-engineering.json`
- [ ] `devops-sre.json`
- [ ] `frontend-engineering.json`
- [ ] `backend-engineering.json`
- [ ] `ai-ml-engineering.json`
- [ ] `management-leadership.json`

### Phase 3 Definition of Done

- [ ] ATS score updates within 300ms of typing
- [ ] Keyword heat map visible on resume preview
- [ ] Smart suggestions generate actionable copy-paste bullets
- [ ] All 9 keyword libraries present with 50+ keywords each
- [ ] Score accuracy validated against 10 real JDs

---

## Phase 4 — AI Integration (Paste & Parse + Tailoring)

**Branch:** `feature/phase-4-ai-integration`
**Goal:** The killer feature — paste anything, get a resume. Plus one-sentence tailoring.

### 4.1 Paste & Parse (The Killer Feature)

The #1 drop-off point for resume tools is the blank slate. Solve it:

- [ ] "Import from text" button in onboarding and settings
- [ ] User pastes: LinkedIn About section, old resume text, bio, bullet dump — anything
- [ ] App sends text to chosen AI provider with a structured extraction prompt
- [ ] AI returns a `profile.json`-compatible object
- [ ] User reviews extracted data in a diff-style UI before confirming
- [ ] Saves to localStorage

**Why this is different:** No other free/open source tool does this. It eliminates the #1 reason people abandon resume builders (setup friction).

### 4.2 One-Sentence JD Tailoring

- [ ] User pastes JD into the JD panel
- [ ] Clicks "Tailor" → AI rewrites the summary and top 3 bullets to match the JD
- [ ] Shows a diff view: original vs tailored (user accepts/rejects each change)
- [ ] Uses `profile.json` as the source of truth (never fabricates)

### 4.3 MCP Server (`mcp-resumer/`)

For Claude Code / Cursor users — control Resumer from the AI chat:

| Tool | Description |
|------|-------------|
| `tailor_resume` | Tailors resume to a JD |
| `improve_bullet` | Improves a single bullet with metrics |
| `ats_check` | Returns score + gaps |
| `generate_summary` | 4-bullet professional summary |
| `generate_cover_letter` | Full cover letter |
| `get_profile` | Returns current profile.json |

### 4.4 GitHub Copilot Prompts

- [ ] `.github/prompts/tailor-resume.prompt.md`
- [ ] `.github/prompts/generate-cover-letter.prompt.md`
- [ ] `.github/prompts/ats-check.prompt.md`

### 4.5 In-App AI Panel

- [ ] Floating AI panel in header
- [ ] Provider selector: Ollama (local) / OpenAI / Anthropic / Custom API
- [ ] API key stored in `localStorage` only (never sent except to chosen provider)
- [ ] Actions: Tailor Resume, Generate Cover Letter, Improve Selected Bullet, Check Tone

### Phase 4 Definition of Done

- [ ] Paste & Parse works end-to-end with at least one provider
- [ ] MCP server tools all return correct output
- [ ] In-app AI panel connects to Ollama (free, local) successfully
- [ ] All AI operations use `profile.json` — zero fabrication

---

## Phase 5 — UI Themes & Customization

**Branch:** `feature/phase-5-ui-themes`
**Goal:** Beautiful, professional, fully customizable themes.

### Theme 1: Classic (ATS-Safe)
Single column, zero decoration, maximum ATS compatibility. Font: Inter. Best for: Banking, Consulting, Corporate.

### Theme 2: Modern Executive
Single column with subtle left accent bar. Customizable accent color (8 presets + color picker). Best for: Tech, Product, Engineering.

### Theme 3: Impact (Two-Column)
Left sidebar: skills, certs, education. Right main: summary, experience, projects. Best for: Startups, Senior ICs.

### Customization Panel

- [ ] Font family, accent color, font size, line spacing, margins
- [ ] All settings in `localStorage`
- [ ] Live preview as settings change
- [ ] "Reset to defaults" per theme

### Phase 5 Definition of Done

- [ ] All 3 themes render correctly in print/PDF
- [ ] Customization panel works for all settings
- [ ] Themes pass ATS text-extraction test

---

## Phase 6 — Cover Letter Builder

**Branch:** `feature/phase-6-cover-letter`
**Goal:** Full-featured cover letter builder with structure enforcement.

- [ ] 4 styles: Classic, Modern, Minimal, Bold
- [ ] Live word counter (amber at 300, red at 350)
- [ ] Company name + role auto-fill from JD input
- [ ] Forbidden phrase detector (highlights "excited to apply", "passionate about")
- [ ] 4-paragraph structure guide in sidebar
- [ ] Cover letter ATS score (same engine as resume)

---

## Phase 7 — Export & Sharing

**Branch:** `feature/phase-7-export-sharing`
**Goal:** Every format users need, shareable without a server.

- [ ] **PDF** — improved `@page` CSS, proper page break hints
- [ ] **DOCX** — `docx.js`, render from profile JSON
- [ ] **JSON Resume** — export as `jsonresume.org` standard
- [ ] **Share link** — Base64-encode resume markdown into URL hash (no backend)
  - `https://resumer.app/#resume=<base64>`
- [ ] **LinkedIn import** — parse LinkedIn data export → auto-populate profile
- [ ] **GitHub import** — read public repos → auto-generate projects section

---

## Phase 8 — Developer Experience

**Branch:** `feature/phase-8-dx`
**Goal:** Make contributing easy, tested, and documented.

### Test Coverage Targets

| Module | Target |
|--------|--------|
| ATS scoring engine | 90% |
| Profile schema validation | 100% |
| Markdown → resume rendering | 80% |
| Export (JSON Resume) | 80% |

### Docs Site (GitHub Pages)

- [ ] `docs/getting-started.md`
- [ ] `docs/profile-schema.md`
- [ ] `docs/ats-engine.md`
- [ ] `docs/ai-integration.md`
- [ ] `docs/themes.md`

---

## Branch Strategy

```
main
  └── feature/phase-1-open-source-foundation   ✅ Complete
        └── feature/phase-2-production-cleanup   ← Current
              └── feature/phase-3-ats-engine
                    └── feature/phase-4-ai-integration
                          └── feature/phase-5-ui-themes
                                └── feature/phase-6-cover-letter
                                      └── feature/phase-7-export-sharing
                                            └── feature/phase-8-dx
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Vanilla JS (ES Modules), no build step |
| Markdown | `marked.js` |
| Styling | Plain CSS with custom properties |
| Dev server | `live-server` |
| Hosting | Vercel (static, free tier) |
| Testing | Jest |
| Linting | ESLint |
| AI (MCP) | Node.js MCP server |
| AI (in-app) | Fetch API → LLM provider (Ollama / OpenAI / Anthropic) |
| Export (DOCX) | `docx.js` |
| Export (PDF) | Browser print |
| CI/CD | GitHub Actions |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to first resume (new user) | < 5 minutes |
| ATS score update latency | < 300ms |
| PDF render accuracy | Pixel-perfect, Chrome/Firefox/Safari |
| GitHub stars (6 months post-launch) | 500+ |
| Monthly active users (hosted) | 1,000+ |
| Community contributors | 10+ |
| Resume templates | 3 built-in + community gallery |

---

*Last updated: 2026-06-22*


| Aspect | Current |
|---|---|
| Architecture | Single `index.html` + monolithic `app.js` + vanilla CSS |
| Data | Hardcoded `.md` files for one person |
| Themes | 3 CSS templates (v1/v2/v3) — not customizable |
| ATS | Separate manual tab, no live feedback |
| AI | Instruction files only (CLAUDE.md, copilot-instructions.md) |
| Export | Browser print → PDF only |
| Portability | `python3 -m http.server`, no build step |

---

## Key Differentiators (Why This Will Stand Out)

1. **Live ATS score embedded in the editor** — not a separate tool, updates as you type
2. **Markdown-first** — every AI tool (Claude, Copilot, Cursor, any LLM) can read and write resumes natively
3. **Local-first, zero tracking** — profile never leaves the browser unless user exports it
4. **AI-tool native** — MCP server + workspace instructions mean one-sentence resume tailoring
5. **Open standard** — JSON Resume export works with the entire ecosystem

---

## Phase 1 — Open Source Foundation

**Branch:** `feature/phase-1-open-source-foundation`  
**Goal:** Make it usable by anyone, not just one person.  
**Duration:** 2–3 weeks

### 1.1 Remove Personal Data — User Profile System

- [ ] Remove all hardcoded `.md` files from the repo (move to `.gitignore`)
- [ ] Create `profile.sample.json` — the template every new user starts from
- [ ] Define `profile.json` schema:
  ```json
  {
    "identity": { "name", "email", "linkedin", "github", "portfolio", "phone" },
    "summary": { "tagline", "years_experience", "specializations" },
    "experience": [ { "title", "company", "location", "start", "end", "bullets": [] } ],
    "skills": { "core": [], "technical": [], "languages": [] },
    "projects": [ { "name", "description", "bullets": [], "technologies": [] } ],
    "achievements": [],
    "certifications": [ { "name", "issuer", "url" } ],
    "education": [ { "degree", "institution", "year" } ]
  }
  ```
- [ ] Store active profile in `localStorage` (key: `resumer-profile`)
- [ ] Add Export Profile button → downloads `profile.json`
- [ ] Add Import Profile button → loads from JSON file

### 1.2 Onboarding Wizard (First Launch)

- [ ] Detect first run via `localStorage.getItem('resumer-profile') === null`
- [ ] Show a 5-step modal wizard:
  - Step 1: Personal info (name, email, LinkedIn, GitHub)
  - Step 2: Work experience (add roles with a form)
  - Step 3: Skills (core + technical)
  - Step 4: Education + Certifications
  - Step 5: Preview and confirm
- [ ] OR: "Import from JSON" shortcut to skip wizard
- [ ] Save to `localStorage` on completion

### 1.3 Modularize app.js → ES Modules

- [ ] Split monolithic `app.js` into:
  ```
  src/
    core/
      state.js          # Centralized app state
      events.js         # Event bus (emit/on)
    features/
      editor.js         # Markdown editor logic
      preview.js        # Rendered preview + pagination
      templates.js      # Theme/template switching
      ats.js            # ATS scoring engine
      ai.js             # AI integration hooks
      export.js         # PDF / DOCX / JSON export
    ui/
      toast.js          # Toast notification system
      modal.js          # Modal management
      shortcuts.js      # Keyboard shortcuts
      onboarding.js     # First-run wizard
  ```
- [ ] Use native ES modules (`type="module"` in HTML)
- [ ] Add a simple `npm run dev` via `live-server` (no framework, no build step)

### 1.4 Open Source Repository Files

- [ ] `LICENSE` — MIT
- [ ] `CONTRIBUTING.md` — setup, coding standards, PR process
- [ ] `.github/ISSUE_TEMPLATE/bug_report.md`
- [ ] `.github/ISSUE_TEMPLATE/feature_request.md`
- [ ] `.github/pull_request_template.md`
- [ ] `ROADMAP.md` — public-facing version of this plan
- [ ] `docs/` — screenshots, architecture diagrams
- [ ] Update `README.md` — proper open source README with demo GIF

### 1.5 package.json (Dev Tooling)

```json
{
  "scripts": {
    "dev": "live-server --port=8000",
    "test": "jest src/features/ats.test.js",
    "lint": "eslint src/"
  }
}
```

### Phase 1 Definition of Done

- [ ] Any person can clone the repo, run `npm run dev`, and build their own resume
- [ ] No personal data anywhere in the repo
- [ ] Onboarding wizard works end-to-end
- [ ] All JS split into modules
- [ ] Open source files all present

---

## Phase 2 — World-Class ATS Engine

**Branch:** `feature/phase-2-ats-engine`  
**Goal:** Real-time ATS scoring embedded directly into the resume-making experience.  
**Duration:** 3–4 weeks

### 2.1 JD Input Panel (Persistent Sidebar)

- [ ] Add collapsible right panel alongside the preview (not a separate tab)
- [ ] JD textarea persists in `localStorage` (key: `resumer-jd`)
- [ ] "Analyze JD" button → triggers keyword extraction
- [ ] Auto-extracts keywords into categories:
  - Required Skills
  - Tools & Technologies
  - Leadership & Soft Skills
  - Domain Keywords
  - Action Verbs

### 2.2 Live ATS Score Badge

- [ ] Score badge in the header updates in real-time as user types
- [ ] Color coding: 0–60% red, 61–80% amber, 81–100% green
- [ ] Score breakdown panel: click badge → shows per-category scores
- [ ] Score persists between sessions

### 2.3 ATS Scoring Algorithm (Pure JS, No API)

```javascript
// Weighted scoring
const WEIGHTS = {
  required_skills:  2.0,
  tools:            1.5,
  leadership:       1.0,
  domain:           1.0,
  action_verbs:     0.5
};

function calculateScore(resumeText, jdKeywords) {
  let totalWeight = 0;
  let matchedWeight = 0;
  for (const [category, keywords] of Object.entries(jdKeywords)) {
    const weight = WEIGHTS[category] || 1.0;
    for (const kw of keywords) {
      totalWeight += weight;
      if (resumeText.toLowerCase().includes(kw.toLowerCase())) {
        matchedWeight += weight;
      }
    }
  }
  return Math.round((matchedWeight / totalWeight) * 100);
}
```

### 2.4 Keyword Heat Map in Preview

- [ ] Keywords found in resume: highlighted with green underline in preview
- [ ] Matched keywords listed in sidebar with green checkmarks
- [ ] Missing keywords listed in sidebar with red X marks
- [ ] Click any missing keyword → copies a suggested bullet snippet to clipboard
- [ ] Toggle heat map on/off with a button

### 2.5 Smart Suggestion Panel

- [ ] "Quick Wins" section — top 5 missing keywords that would have most impact
- [ ] One-click "Insert" → adds a placeholder bullet with the keyword to the editor
- [ ] Detects overused words (e.g., 5+ uses of "Responsible for") and flags them
- [ ] Detects long sentences (>25 words) and suggests splitting
- [ ] "Predicted score after fixes: XX%" shown at the bottom

### 2.6 Industry Keyword Libraries

Bundled as JSON files in `src/data/keywords/`:

- [ ] `software-quality-engineering.json`
- [ ] `software-engineering.json`
- [ ] `product-management.json`
- [ ] `data-engineering.json`
- [ ] `devops-sre.json`
- [ ] `frontend-engineering.json`
- [ ] `backend-engineering.json`
- [ ] `ai-ml-engineering.json`
- [ ] `management-leadership.json`

### Phase 2 Definition of Done

- [ ] ATS score updates within 300ms of typing
- [ ] Keyword heat map visible on the resume preview
- [ ] Smart suggestions generate actionable copy-paste bullets
- [ ] All 9 keyword libraries present
- [ ] Score accuracy validated against 10 real JDs

---

## Phase 3 — AI Tool Integration

**Branch:** `feature/phase-3-ai-integration`  
**Goal:** Claude Code, GitHub Copilot, and Cursor as first-class features.  
**Duration:** 2–3 weeks

### 3.1 Claude Code — MCP Server

Build `mcp-resumer/` — a custom MCP server exposing resume operations as tools:

| Tool | Input | Output |
|---|---|---|
| `tailor_resume` | JD text | Tailored resume markdown |
| `improve_bullet` | Single bullet text | Improved bullet with metrics |
| `ats_check` | Resume + JD | Score + gaps report |
| `generate_summary` | Profile + JD | 4-bullet professional summary |
| `generate_cover_letter` | Profile + JD | Full cover letter markdown |
| `check_tone` | Resume markdown | Flagged robotic phrases + fixes |
| `get_profile` | — | Current profile.json contents |
| `update_section` | Section name + content | Updated profile section |

- [ ] `mcp-resumer/package.json`
- [ ] `mcp-resumer/src/index.js` — MCP server entry point
- [ ] `mcp-resumer/src/tools/` — one file per tool
- [ ] `mcp-resumer/README.md` — setup guide
- [ ] Update `CLAUDE.md` — generic instructions pointing to `profile.json`

### 3.2 GitHub Copilot Workspace

- [ ] Rewrite `.github/copilot-instructions.md` to be generic (not Siva-specific)
- [ ] Point Copilot to `profile.json` as source of truth
- [ ] Define resume generation rules (4-bullet summary, no EM dashes, % symbol, etc.)
- [ ] Define slash command behaviors: `/tailor`, `/cover`, `/ats`
- [ ] Add `.github/prompts/tailor-resume.prompt.md`
- [ ] Add `.github/prompts/generate-cover-letter.prompt.md`
- [ ] Add `.github/prompts/ats-check.prompt.md`

### 3.3 Cursor Rules

- [ ] Rewrite `.cursorrules` to be generic
- [ ] Teach Cursor the `profile.json` schema
- [ ] Define PAR/STAR bullet auto-complete patterns
- [ ] Define forbidden phrases list
- [ ] Define ATS keyword injection patterns

### 3.4 In-App AI Panel

A floating panel in the app UI that calls a local or cloud LLM:

- [ ] Collapsible AI panel button in the header
- [ ] JD input (shared with ATS panel)
- [ ] Action buttons:
  - "Tailor Resume" → sends profile + JD to LLM, streams result into editor
  - "Generate Cover Letter" → streams result into cover letter editor
  - "Improve Selected Bullet" → replaces selected text with improved version
  - "Check Tone" → highlights problematic phrases in editor
- [ ] Provider selector: Ollama (local) / OpenAI / Anthropic / Custom API
- [ ] API key stored in `localStorage` (never sent anywhere except chosen provider)

### Phase 3 Definition of Done

- [ ] Claude MCP server works with `claude mcp` command
- [ ] `/tailor` slash command in Copilot Chat tailors the resume
- [ ] In-app AI panel connects to at least one provider end-to-end
- [ ] All AI operations use `profile.json` as source of truth, never fabricate

---

## Phase 4 — Three World-Class UI Themes

**Branch:** `feature/phase-4-ui-themes`  
**Goal:** Beautiful, professional, fully customizable themes.  
**Duration:** 2–3 weeks

### Theme 1: Classic (ATS Safe)

- Single column, zero decoration, maximum ATS compatibility
- Inspired by: Harvard/Columbia resume templates
- Font: Inter
- Best for: Banking, Consulting, Corporate

### Theme 2: Modern Executive

- Single column with subtle left accent bar
- Color-coded section headers
- Customizable accent color (8 presets + color picker)
- Font pairing: bold headers + regular body
- Best for: Tech companies, Product, Engineering

### Theme 3: Impact (Two-Column)

- Left sidebar: skills, certs, education, contact info
- Right main: summary, experience, projects
- Fits more content on page 1
- Best for: Startups, Senior ICs, Design-adjacent roles

### Theme Customization Panel (New)

- [ ] Settings panel accessible from header
  ```
  Font family:   [Inter] [Outfit] [Georgia] [Roboto Mono]
  Accent color:  ● ● ● ● ● ● ● ● [custom hex]
  Font size:     [S] [M] [L]
  Line spacing:  [Compact] [Normal] [Spacious]
  Margins:       [Narrow] [Normal] [Wide]
  ```
- [ ] All settings stored in `localStorage`
- [ ] Live preview updates as settings change
- [ ] "Reset to defaults" button per theme

### Phase 4 Definition of Done

- [ ] All 3 themes render correctly in print/PDF
- [ ] Customization panel works for all settings
- [ ] Themes pass basic ATS parsing test (text extractable, no images blocking content)

---

## Phase 5 — Cover Letter Builder (Proper)

**Branch:** `feature/phase-5-cover-letter`  
**Goal:** Full-featured cover letter builder with structure enforcement.  
**Duration:** 1–2 weeks

- [ ] 4 cover letter styles: Classic, Modern, Minimal, Bold
- [ ] Live word counter — turns amber at 300 words, red at 350 (one-page enforcer)
- [ ] Company name + role auto-fill from JD input
- [ ] Tone selector: Professional / Conversational / Confident
- [ ] Forbidden phrase detector (highlights "excited to apply", "passionate about", etc.)
- [ ] 4-paragraph structure guide shown in sidebar:
  - P1: Opening (who you are + why this role)
  - P2: What you bring (2–3 key strengths with metrics)
  - P3: Why this company (specific, genuine)
  - P4: Closing (confident call to action)
- [ ] Cover letter ATS score (keyword match against JD, same engine as resume)

### Phase 5 Definition of Done

- [ ] Word counter works live
- [ ] Forbidden phrase detector highlights correctly
- [ ] 4 styles render in print
- [ ] Cover letter ATS score shows alongside resume ATS score

---

## Phase 6 — Export and Sharing

**Branch:** `feature/phase-6-export-sharing`  
**Goal:** Export to every format users need, share without a server.  
**Duration:** 2 weeks

- [ ] **PDF** — improve current `window.print()` with proper `@page` CSS, page break hints
- [ ] **DOCX** — use `docx.js` library, render from profile JSON
- [ ] **JSON Resume** — export as `jsonresume.org` standard format
- [ ] **Share link** — Base64-encode resume markdown into URL hash (no backend needed)
  - `https://yourdomain.com/#resume=<base64>`
  - Anyone with the link can view the resume in the browser
- [ ] **LinkedIn JSON import** — parse LinkedIn data export → auto-populate profile
- [ ] **GitHub import** — read public repos from GitHub API → auto-generate projects section

### Phase 6 Definition of Done

- [ ] DOCX download works and renders correctly in Word/Google Docs
- [ ] JSON Resume export validates against the schema
- [ ] Share link round-trips correctly (encode → decode → same resume)

---

## Phase 7 — Developer Experience

**Branch:** `feature/phase-7-dx`  
**Goal:** Make contributing easy, tested, and documented.  
**Duration:** Ongoing

### Dev Tooling

- [ ] `npm run dev` — `live-server` with hot reload
- [ ] `npm run test` — Jest unit tests
- [ ] `npm run lint` — ESLint with sensible defaults
- [ ] GitHub Actions CI:
  ```yaml
  on: [push, pull_request]
  jobs:
    test: run npm test
    lint: run npm run lint
  ```

### Test Coverage Targets

| Module | Coverage target |
|---|---|
| ATS scoring engine | 90% |
| Profile schema validation | 100% |
| Markdown → resume rendering | 80% |
| Export (JSON Resume) | 80% |

### Documentation Site

- [ ] `docs/getting-started.md` — clone, run, add your profile
- [ ] `docs/profile-schema.md` — full schema reference
- [ ] `docs/ats-engine.md` — how scoring works, how to extend keyword libraries
- [ ] `docs/ai-integration.md` — Claude MCP setup, Copilot instructions, Cursor rules
- [ ] `docs/themes.md` — theme structure, how to create a new theme
- [ ] `docs/contributing.md` — same as CONTRIBUTING.md, formatted for docs site
- [ ] GitHub Pages deployment via Actions

---

## Branch Strategy

```
main
  └── feature/phase-1-open-source-foundation   ← Start here
        └── feature/phase-2-ats-engine
              └── feature/phase-3-ai-integration
                    └── feature/phase-4-ui-themes
                          └── feature/phase-5-cover-letter
                                └── feature/phase-6-export-sharing
                                      └── feature/phase-7-dx
```

Each phase branch is created from the previous phase's merged result.  
Each phase ends with a PR into `main`.

---

## Tech Stack (Final)

| Layer | Technology | Reason |
|---|---|---|
| Runtime | Vanilla JS (ES Modules) | No build step, easy to contribute |
| Markdown | `marked.js` | Already in use, stable |
| Styling | Plain CSS with CSS custom properties | Easy theming, no preprocessor |
| Dev server | `live-server` | Zero config HMR |
| Testing | Jest | Standard, well-known |
| Linting | ESLint | Standard |
| AI (MCP) | Node.js MCP server | Claude Code native |
| AI (in-app) | Fetch API → LLM provider | No backend needed |
| Export (DOCX) | `docx.js` | Pure JS, no server |
| Export (PDF) | Browser print | Already works |
| CI/CD | GitHub Actions | Free, native |

---

## Success Metrics

| Metric | Target |
|---|---|
| Time to first resume (new user) | < 5 minutes |
| ATS score update latency | < 300ms |
| PDF render accuracy | Pixel-perfect across Chrome/Firefox/Safari |
| Open source stars (6 months) | 500+ |
| Community contributors | 10+ |
| Resume templates in gallery | 5+ |

---

*Last updated: 2026-06-22*  
*Maintained by: Community Contributors*
