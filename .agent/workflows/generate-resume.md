---
description: Generate a tailored resume optimized for a specific Job Description (JD) using the Master Resume Content.
---

// turbo-all

# Generate Resume Workflow

## Step 1: Prerequisite Check

- Ensure you have the Job Description (JD) text
- Ensure `.github/resume-master-content.md` is accessible (Note: It may be gitignored. If read fails, ask user to unignore or provide content)

## Step 2: Read ALL Instruction Files (MANDATORY)

**You MUST read these files completely and state what you read:**

1. Read `.github/instructions/resume-instructions.md` (ALL 828 lines)
2. Read `.github/resume-master-content.md` (ALL lines for fact verification)
3. Read `.github/resume-role-templates.md` (to identify correct resume structure)

**After reading, explicitly state:**

```
✅ Read resume-instructions.md (828 lines)
✅ Read resume-master-content.md (XXX lines)
✅ Read resume-role-templates.md (430 lines)
```

## Step 3: Analyze Job Description

- Extract keywords, required skills, and role level (Manager/Staff/Senior/Principal)
- Identify seniority and focus area from JD
- **Select appropriate role template** from `.github/resume-role-templates.md`:
  - Template #1: Master (General strong candidate)
  - Template #2: SDET Focus (Hands-on automation engineering)
  - Template #3: QA Lead (Team leadership + quality governance)
  - Template #4: Staff QE/Reliability (Staff-level, architecture influence)
  - Template #5: Singapore Market (Singapore-specific roles)

## Step 4: Planning

- Select relevant experience and bullets from `resume-master-content.md`
- Plan the 4-bullet Professional Summary tailored to the JD
- Select the 6-8 Core Skills buckets
- **CRITICAL:** Prioritize Siva's core strengths:
  - **Languages:** Java, Kotlin (PRIMARY) > Python, JavaScript, TypeScript (secondary)
  - **Test Tools:** Selenium WebDriver (PRIMARY) > Playwright, Cypress, Appium

## Step 5: Generation

Generate the resume content following the selected role template structure.

### CRITICAL RULES

**Punctuation:**

- ❌ **NO EM/EN DASHES** (— / –). Use regular hyphens (-) ONLY for dates and ranges
- ✅ Use commas or periods for sentence breaks
- ✅ Use % symbol for percentages

**Content Verification:**

- ✅ **Verify ALL metrics** against master content - NEVER fabricate numbers
- ✅ Use exact company names and dates from master content
- ❌ If it's not in master content, DO NOT include it

**Tone:**

- ✅ Natural, human, Siva's voice
- ✅ Use connection words: "while", "through", "by", "ensuring"
- ✅ Start bullets with unique action verbs
- ❌ Avoid robotic disconnected clauses

**Structure:**

1. Header (name + contact info)
2. Professional Summary (EXACTLY 4 bullets)
3. Core Skills (6-8 thematic buckets, comma-separated)
4. Technical Skills (comma-separated list, NO prose)
5. Professional Experience (reverse chronological)
6. Key Achievements (3-4 metrics)
7. Certifications (JD-aligned only)
8. Education (minimal: degree + institution)

**Length:** Max 2 pages when rendered

### HTML Template Preservation (CRITICAL!)

When updating `components/resume/resume.md`, **NEVER remove or modify these HTML sections:**

```markdown
# Sivasankaramalan Gunasekarasivam

<div class="section headerInfo">

- [ssmalan94@gmail.com](mailto:ssmalan94@gmail.com)
- [linkedin.com/in/Sivasankaramalan](https://linkedin.com/in/Sivasankaramalan)
- [github.com/Sivasankaramalan](https://github.com/Sivasankaramalan)
- [Portfolio](https://sivasankaramalan.is-a.dev/)

</div>
```

**For experience sections, use:**

```markdown
### Job Title <span class="spacer"></span><span class="normal">Date Range</span>

#### Company Name <span class="spacer"></span> Location
```

## Step 6: Self-Audit (MANDATORY)

**Check against the self-audit checklist:**

### Punctuation & Formatting

- [ ] ZERO EM dashes (—) or EN dashes (–) used
- [ ] Only regular hyphens (-) for ranges/compound words
- [ ] Percent symbol (%) used, not spelled out
- [ ] Single column layout
- [ ] Max 2 pages

### Content Verification

- [ ] Read complete instruction files
- [ ] All metrics verified against master content
- [ ] No fabricated companies, dates, or achievements
- [ ] Exact company names from master content
- [ ] Prioritized Java/Kotlin over Python/JS/TS
- [ ] Prioritized Selenium over Playwright/Cypress

### Resume-Specific

- [ ] Professional Summary: EXACTLY 4 bullets
- [ ] Core Skills: 6-8 thematic buckets, comma-separated
- [ ] Technical Skills: Comma-separated list only (NO prose)
- [ ] All bullets start with unique action verbs
- [ ] Each bullet has measurable outcome
- [ ] HTML template sections preserved

### Tone & Style

- [ ] Natural human tone (not robotic)
- [ ] Connection words used appropriately
- [ ] No forbidden phrases ("Responsible for", "Worked on")

**After self-audit, explicitly state:**

```
✅ Self-audit completed:
- Verified all metrics from master content
- No EM/EN dashes used
- 4-bullet summary, 6-8 core skills
- HTML template preserved
- Natural human tone maintained
```

## Step 7: File Update

**Update the file:** `components/resume/resume.md`

**CRITICAL:** Only update the CONTENT sections, preserve ALL HTML template structures:

- ✅ Keep `<div class="section headerInfo">` wrapper
- ✅ Keep `<span class="spacer"></span>` formatting
- ✅ Only replace the content between sections

## Step 8: Output

Present the final resume showing what file was updated and confirmation of self-audit completion.

---

**Created:** February 1, 2026  
**Last Updated:** February 1, 2026
