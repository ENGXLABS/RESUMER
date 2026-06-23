# Resumer — GitHub Copilot Instructions

## Project Overview

Resumer is an open source, local-first resume builder with real-time ATS scoring.
Stack: Vanilla JS (ES Modules), plain CSS, `marked.js` for markdown, no build step.

## Architecture

```
src/core/          # state.js (centralized state), events.js (event bus)
src/features/      # profile.js, ats/, export/, ai/
src/ui/            # toast.js, shortcuts.js, onboarding.js, modal.js
src/data/keywords/ # Industry ATS keyword libraries (JSON)
components/        # Resume + cover letter markdown + CSS themes
```

## Key Rules When Editing This Repo

1. **No personal data** — never commit real names, emails, phone numbers, or resume content
2. **No build step** — all code runs directly in the browser; no webpack, vite, or transpilation
3. **ES Modules only** — use `import`/`export`, not `require()` or globals
4. **CSS custom properties** for all theme values — no hardcoded colors in component CSS
5. **profile.json is gitignored** — user data lives in localStorage, never in committed files
6. **ATS scoring logic must have tests** — any changes to `src/features/ats/` need Jest coverage

## Profile Schema

User data lives in `profile.json` (localStorage key: `resumer-profile`). See `profile.sample.json` for the full schema. Key sections:

- `identity` — name, email, LinkedIn, GitHub, portfolio
- `experience[]` — roles with bullets
- `skills.core[]` — thematic skill groups
- `skills.technical[]` — tools and technologies
- `education[]`, `certifications[]`, `projects[]`

## Resume Markdown Format

Resume files use Markdown with embedded HTML for layout:

```markdown
<!-- markdownlint-disable MD033 -->
# Full Name
<div class="section headerInfo">
- [email](mailto:email)
- [linkedin](https://linkedin.com/in/handle)
</div>
## Professional Summary
- Bullet 1 (years + identity)
- Bullet 2 (key strengths)
- Bullet 3 (measurable impact)
- Bullet 4 (fit / domain)
### Job Title <span class="spacer"></span><span class="normal">Company | Date range</span>
- Achievement bullet with metric
```

**Never** use EM dashes (—) or EN dashes (–). Use regular hyphens or commas for breaks.

## Adding a New Keyword Library

1. Create `src/data/keywords/<industry>.json` following the schema in `quality-engineering.json`
2. Register it in `src/data/keywords/index.js` under `LIBRARIES`
3. Add a test in `tests/keywords/<industry>.test.js`

## Running Locally

```bash
npm install
npm run dev     # starts live-server at localhost:8000
npm test        # runs Jest
npm run lint    # runs ESLint
```
