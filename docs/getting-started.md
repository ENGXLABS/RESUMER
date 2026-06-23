# Getting Started

## Prerequisites

- **Node.js 18+** (Node 20 recommended)
- **npm 9+**

## Installation

```bash
git clone https://github.com/<your-org>/resumer.git
cd resumer
npm install
```

## Development Server

```bash
npm run dev
```

Opens the app at [http://localhost:8000](http://localhost:8000) using `live-server` with auto-reload.

> **Note:** The app is 100% static — no backend, no build step. All files are served directly.

## Running Tests

```bash
npm test             # run all tests once
npm test -- --watch  # watch mode
npm test -- --coverage  # with coverage report
```

Tests live in `tests/` and mirror the `src/` directory structure.

## Linting

```bash
npm run lint
```

ESLint is configured in `eslint.config.js`. Fix auto-fixable issues with:

```bash
npm run lint -- --fix
```

## Setting Up Your Profile

The app reads your personal data from `profile.json` (gitignored). Copy the sample:

```bash
cp profile.sample.json profile.json
```

Then edit `profile.json` with your real information. The file is never committed — it only lives in your local checkout and browser localStorage.

### Loading Your Profile

1. Open the app at `http://localhost:8000`
2. Click the **Profile** tab in the top navigation
3. Paste your `profile.json` content or click **Load Profile**

Your profile is saved to `localStorage` under the key `resumer-profile`.

## Project Structure

```text
resumer/
├── index.html              # Entry point — pure static HTML
├── app.js                  # Main IIFE — wires up all UI interactions
├── settings.css            # Global CSS custom properties
├── components/             # Resume, cover letter, ATS checker, theme CSS
├── src/
│   ├── core/               # state.js (centralized state), events.js (event bus)
│   ├── features/
│   │   ├── ats/            # ATS scoring engine
│   │   ├── ai/             # AI integration helpers
│   │   ├── export/         # JSON Resume, share link, DOCX helpers
│   │   ├── import/         # GitHub and LinkedIn CSV importers
│   │   ├── profile/        # Profile validator
│   │   └── resume/         # Markdown resume parser
│   └── ui/                 # Toast, shortcuts, onboarding, modal
├── src/data/keywords/      # Industry ATS keyword libraries (JSON)
├── tests/                  # Jest test suite
└── docs/                   # This documentation
```

## Key Constraints

| Rule | Why |
|------|-----|
| No build step | Zero-config deployment, instant local dev |
| ES Modules only | Modern, explicit imports |
| No personal data committed | `profile.json` is gitignored |
| CSS custom properties for themes | Consistent theming without duplication |
| ATS changes need tests | Protects scoring accuracy |
