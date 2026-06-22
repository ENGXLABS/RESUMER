---
description: Detailed ATS score analysis and optimization recommendations for a resume against a JD.
---

1. **Prerequisite Check**:
    - Resume content (or generated draft).
    - Job Description (JD).
    - Read `.github/instructions/ats-checker-instructions.md`.
    - Load `profile.json` (to check valid additions — never fabricate).

2. **Keyword Extraction**:
    - Extract Technical Skills, Tools, Domain terms, Responsibilities, Soft Skills from JD.
    - Prioritize them (Critical vs Nice-to-have).

3. **Scoring Analysis**:
    - **Skill Match Rate**: % of keywords found.
    - **Context Match**: Are keywords in bullets (Strong) or just Skills section (Weak)?
    - **Seniority**: Does experience match JD level?

4. **Gap Analysis**:
    - Identify Missing Critical Keywords (High Impact).
    - Identify Weak Placements (Keywords only in 'Skills').

5. **Recommendations (Auto-Patch)**:
    - Generate exact sentence insertions for missing/weak keywords.
    - **Source**: `profile.json > experience` (don't fabricate).
    - **Placement**: Summary, Experience bullets (contextualized).

6. **Output Report**:
    - Generate the **ATS Analysis Report** (Markdown).
    - Include: Current Score, Missing Keywords, Auto-Patch Recommendations, Projected Score.
    - **Goal**: Target 95%+ Projected Score.
