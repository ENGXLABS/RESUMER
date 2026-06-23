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

```
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

## Project Structure

```
resume-builder/
├── README.md (this file)
├── index.html (main web app)
├── settings.css (web UI styles)
├── .github/
│   ├── copilot-instructions.md (router file)
│   ├── resume-master-content.md
│   └── instructions/
│       ├── resume-instructions.md
│       ├── cover-letter-instructions.md
│       └── ats-checker-instructions.md
└── components/
    ├── resume/
    │   ├── resume.css (resume formatting)
    │   ├── resume-settings.css (print settings)
    │   └── resume.md (content)
    ├── cover-letter/
    │   └── cover-letter.css
    └── ats-checker/
```

---

## Getting Started

1. **Start Local Server:**
   ```bash
   cd resume-builder
   python3 -m http.server 8000
   ```

2. **Open in Browser:**
   ```
   http://localhost:8000
   ```

3. **Use the Tools:**
   - **Resume Generator:** Edit and export tailored resumes
   - **Cover Letter Generator:** Create personalized cover letters
   - **ATS Checker:** Analyze and optimize your documents

---

## Features

### Resume Generator
- ✅ Edit Mode with live preview
- ✅ Company name for dynamic file naming
- ✅ Download as Markdown
- ✅ Print to PDF with custom margins
- ✅ Auto-save drafts
- ✅ ATS-optimized formatting

### Cover Letter Generator
- 📝 Four-paragraph structure
- 📝 Human, direct tone
- 📝 JD-tailored content
- 📝 250-300 word limit
- 📝 Professional formatting

### ATS Score Checker
- 🎯 Keyword matching analysis
- 🎯 Formatting compatibility check
- 🎯 Optimization recommendations
- 🎯 Match percentage scoring

---

**Last Updated:** November 30, 2025  
**Maintained By:** Community Contributors
