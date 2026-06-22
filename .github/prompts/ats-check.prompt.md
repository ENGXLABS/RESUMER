---
mode: ask
description: Analyse the resume ATS score against a job description and provide a detailed gap report.
---

You are an ATS optimization expert. Analyse the resume against the job description below and return a structured gap report.

## Context

Resume: check `.github/instructions/jd-routing-instructions.md` to identify the correct template file for this role type (e.g., `components/resume/resume.md`, `components/resume-tpm/resume-tpm.md`, `components/resume-ai/resume-ai.md`).

## Task

**Job Description:**
${input:jobDescription:Paste the full job description here}

## Output Format

Return a report with these sections:

### 1. ATS Score Estimate
- Estimated score: `XX/100`
- Key reason for score

### 2. Critical Gaps (must-have keywords missing)
| Keyword | Suggested Section | Insertion Hint |
|---------|------------------|----------------|

### 3. Important Keywords (nice-to-have, not present)
List keywords with the resume section where they'd fit best.

### 4. Weak Placements
List keywords that only appear in the Skills section. For each, suggest an experience bullet where they can be added with context.

### 5. Strengths Found
List keywords and phrases already well-placed in the resume.

### 6. Top 3 Quick Wins
Specific, actionable edits ranked by ATS score impact. Include the exact sentence to add and where.

## Rules

- Do not fabricate experience or metrics.
- Prioritise keywords that appear multiple times in the JD.
- Weak placements (Skills only) are penalised by ATS scanners — flag them clearly.
