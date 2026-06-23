# Contributing to Resumer

Thank you for your interest in contributing! Resumer is a local-first, markdown-powered resume builder and we welcome contributions of all kinds.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A modern browser (Chrome, Firefox, Safari, Edge)

### Setup

```bash
git clone https://github.com/yourusername/resumer.git
cd resumer
npm install
npm run dev
```

Open `http://localhost:8000` — the app loads immediately, no build step.

### First Run

On first launch, copy the sample profile and fill in your details:

```bash
cp profile.sample.json profile.json
```

Edit `profile.json` with your information. This file is gitignored — your personal data never gets committed.

---

## Project Structure

```text
resumer/
├── index.html              # Main entry point
├── app.css                 # Global styles
├── settings.css            # Settings panel styles
├── profile.sample.json     # Sample profile schema (commit-safe)
├── profile.json            # Your personal profile (gitignored)
├── src/
│   ├── core/
│   │   ├── state.js        # Centralized app state
│   │   └── events.js       # Event bus
│   ├── features/
│   │   ├── editor.js       # Markdown editor
│   │   ├── preview.js      # Rendered preview
│   │   ├── templates.js    # Theme switching
│   │   ├── ats.js          # ATS scoring engine
│   │   ├── ai.js           # AI integration
│   │   └── export.js       # PDF/DOCX/JSON export
│   ├── ui/
│   │   ├── toast.js        # Notifications
│   │   ├── modal.js        # Modals
│   │   ├── shortcuts.js    # Keyboard shortcuts
│   │   └── onboarding.js   # First-run wizard
│   └── data/
│       └── keywords/       # Industry ATS keyword libraries
├── components/
│   ├── resume/             # Resume CSS themes
│   ├── cover-letter/       # Cover letter CSS
│   └── ats-checker/        # ATS checker styles
└── docs/                   # Documentation
```

---

## Ways to Contribute

### Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:

- Browser and OS
- Steps to reproduce
- Expected vs actual behaviour
- Screenshots if applicable

### Requesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).

### Good First Issues

Look for issues labelled `good first issue`. These are intentionally small and well-scoped.

### Contributing Code

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Run lint: `npm run lint`
6. Commit with a descriptive message (see commit format below)
7. Open a PR against `main`

---

## Commit Message Format

```text
type(scope): short description

Types: feat, fix, docs, style, refactor, test, chore
Scope: ats, editor, themes, export, ai, ui, docs

Examples:
  feat(ats): add real-time keyword heat map
  fix(editor): preserve scroll position on save
  docs(readme): add demo GIF
  test(ats): add scoring accuracy tests for QE keyword library
```

---

## Code Standards

- **No framework** — vanilla JS (ES modules), plain CSS
- **No build step** — the app runs directly in the browser
- **No personal data** — never commit `profile.json` or any real resume content
- **ATS scoring logic** must be covered by unit tests
- **CSS custom properties** for all theme values (no hardcoded colours in components)
- Follow existing code patterns in `src/` before introducing new patterns

---

## Adding a New Keyword Library

1. Create `src/data/keywords/your-industry.json`:

```json
{
  "name": "Your Industry",
  "version": "1.0",
  "categories": {
    "required_skills": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "leadership": ["keyword1", "keyword2"],
    "domain": ["term1", "term2"],
    "action_verbs": ["verb1", "verb2"]
  }
}
```

1. Register it in `src/data/keywords/index.js`
2. Add a test in `src/features/ats.test.js`
3. Document it in `docs/ats-engine.md`

---

## Adding a New UI Theme

1. Create `components/resume/resume-v4.css` (increment the version)
2. Follow the CSS custom properties pattern from `resume-v1.css`
3. Add a button in `index.html` to select it
4. Register it in `src/features/templates.js`
5. Test that it renders correctly in print view
6. Add a preview screenshot to `docs/themes/`

---

## Pull Request Checklist

- [ ] My change is scoped — one feature or fix per PR
- [ ] I ran `npm test` and all tests pass
- [ ] I ran `npm run lint` with no errors
- [ ] No personal data included anywhere
- [ ] I updated docs if my change affects user-facing behaviour
- [ ] I added tests for new ATS scoring logic

---

## Questions?

Open a [Discussion](https://github.com/yourusername/resumer/discussions) — happy to help.
