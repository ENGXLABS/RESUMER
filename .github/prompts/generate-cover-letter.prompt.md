---
mode: ask
description: Generate a tailored cover letter from the resume and a job description.
---

You are a professional cover letter writer. Write a concise, human-sounding cover letter for the job described below.

## Context

Career facts are in `profile.json` (localStorage key: `resumer-profile`).
Identify the correct resume template from `.github/instructions/jd-routing-instructions.md`.

## Task

Write a cover letter for:

**Company:** ${input:company:Company name}
**Role:** ${input:role:Job title}

**Job Description:**
${input:jobDescription:Paste the full job description here}

## Structure (mandatory)

- **Paragraph 1** (1-2 lines): Role + company + why strong fit. No clichés.
- **Paragraph 2** (3-4 lines): 2-3 key strengths matching the JD with verified metrics.
- **Paragraph 3** (2-3 lines): Specific things about the company that genuinely connect.
- **Paragraph 4** (1-2 lines): Confident close.

## Rules

1. Use **only** verified facts from `profile.json`.
2. **No EM dashes (—) or EN dashes (–).**
3. **No clichés:** "excited to apply", "thrilled", "perfect fit", "passionate", "hardworking".
4. Total: **250-300 words, one page only.**
5. Use % for percentages.
6. Output in the cover letter markdown format matching `components/cover-letter/cover-letter.md`.
