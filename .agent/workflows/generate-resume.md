---
description: Generate a tailored resume optimized for a specific Job Description (JD) using the Master Resume Content.
---

1. **Prerequisite Check**:
    - Ensure you have the Job Description (JD) text.
    - Ensure `.github/resume-master-content.md` is accessible (Note: It may be gitignored. If read fails, ask user to unignore or provide content).

2. **Read Instructions**:
    - Read `.github/instructions/resume-instructions.md` completely.
    - Read `.github/resume-master-content.md` completely.

3. **Analyze Job Description**:
    - Extract keywords, required skills, and role level (Manager/Staff/Senior).
    - Identify the specific resume strategy (QA Manager vs SDET vs Principal).

4. **Planning**:
    - Select relevant experience and bullets from `resume-master-content.md`.
    - Plan the 4-bullet Professional Summary tailored to the JD.
    - Select the 6-8 Core Skills buckets.

5. **Generation**:
    - Generate the resume content in Markdown format.
    - **CRITICAL RULES**:
        - **NO EM/EN DASHES** (— / –). Use hyphens (-).
        - **Verify Metrics**: Only use numbers found in master content.
        - **Tone**: Natural, human, Siva's voice. Start bullets with strong action verbs.
        - **Structure**: Header -> Summary -> Core Skills -> Technical Skills -> Experience -> Projects -> Achievements -> Certifications -> Education.
        - **Length**: Max 2 pages.

6. **Self-Audit**:
    - formatting: Single column, no tables.
    - content: Summary is exactly 4 bullets? Tech skills comma-separated?
    - exclusions: No "References available", no "Responsible for".

7. **Output**:
    - Present the final Markdown code block.
