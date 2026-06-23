# Resumer

**Local-first, markdown-powered, AI-native resume builder with real-time ATS scoring.**

No accounts. No cloud. No build step. Your data stays on your machine.

---

## Features

- **Markdown-based editing** — Write your resume in clean Markdown; see it rendered beautifully in real time
- **Multiple themes** — Switch between classic, modern, and compact layouts without touching content
- **Real-time ATS scoring** — Paste any job description and get an instant keyword match score
- **Cover letter generator** — One-click tailored cover letter from your profile + the JD
- **AI integration** — Optional GitHub Copilot / Cursor / MCP hooks for smart tailoring
- **Export** — Print to PDF, download as DOCX, or share a JSON snapshot
- **Dual resume types** — Quality Engineering and Technical Product Manager templates built in
- **Zero dependencies to run** — Static HTML/CSS/JS; serve with any local HTTP server

---

## Quick Start

```bash
git clone https://github.com/yourusername/resumer.git
cd resumer
cp profile.sample.json profile.json   # fill in your details
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

### With npm dev tools (optional)

```bash
npm install
npm run dev    # starts live-server with auto-reload
```

---

## Project Structure

```text
resumer/
├── index.html              # App entry point — no build step
├── app.js                  # Legacy monolith (progressively replaced by src/)
├── app.css / settings.css  # Global styles
├── profile.sample.json     # Profile schema template — copy to profile.json
├── profile.json            # Your data — gitignored, never committed
├── src/                    # ES module source (replacing app.js progressively)
│   ├── core/               # state.js, events.js
│   ├── features/           # profile.js, ats.js, export.js, ...
│   └── ui/                 # toast.js, shortcuts.js, onboarding.js, ...
├── components/
│   ├── resume/             # Resume Markdown + CSS themes
│   ├── cover-letter/       # Cover letter Markdown + CSS
│   └── ats-checker/        # ATS checker styles
└── PLAN.md                 # 7-phase open-source roadmap
```

---

## Your Profile

The `profile.json` file is the single source of truth for all resume content. Copy the sample, fill in your details:

```bash
cp profile.sample.json profile.json
```

`profile.json` is gitignored — your personal data is never committed.

---

## Roadmap

See [PLAN.md](PLAN.md) for the full 7-phase roadmap.

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | In Progress | Open Source Foundation — profile system, modular JS, onboarding |
| 2 | Planned | ATS Engine — live scoring, keyword heat map, industry libraries |
| 3 | Planned | AI Integration — Copilot/Cursor/MCP hooks, smart tailoring |
| 4 | Planned | UI Themes — dark mode, accessibility, more layouts |
| 5 | Planned | Cover Letter — template system, AI generation |
| 6 | Planned | Export & Sharing — PDF, DOCX, shareable links |
| 7 | Planned | Developer Experience — plugin API, CLI, tests |

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, coding standards, and the PR process.

---

## License

MIT — see [LICENSE](LICENSE).

---

**Last Updated:** November 30, 2025  
**Maintained By:** Community Contributors
