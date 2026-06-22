---
description: Generate a tailored resume optimized for a specific Job Description (JD).
---

// turbo-all

# Generate Resume Workflow

## Step 1: Prerequisite Check

- Ensure you have the Job Description (JD) text
- Ensure `profile.json` is loaded (localStorage key: `resumer-profile`)

## Step 2: Read Instruction Files (MANDATORY)

**You MUST read these files completely and state what you read:**

1. Read `.github/instructions/resume-instructions.md` (ALL lines)
2. Load `profile.json` for verified experience, metrics, and skills

**After reading, explicitly state:**

```
✅ Read resume-instructions.md
✅ Loaded profile.json for fact verification
```

## Step 3: Analyze Job Description

- Extract keywords, required skills, and role level (Manager/Staff/Senior/Principal)
- Identify seniority and focus area from JD
- **Select appropriate role template** from the role-specific strategies in `resume-instructions.md`:
  - QA Manager / QA Lead
  - Staff SDET
  - Senior SDET
  - Principal QA Engineer

## Step 4: Planning

- Select relevant experience and bullets from `profile.json > experience`
- Plan the 4-bullet Professional Summary tailored to the JD
- Select 6-8 Core Skills buckets from `profile.json > skills.core`
- **Prioritize the user's core strengths** — use the first-listed tools and languages in `profile.json > skills.technical`

## Step 5: Generation

Generate the resume content following the selected role template structure.

### CRITICAL RULES

**Punctuation:**

- ❌ **NO EM/EN DASHES** (— / –). Use regular hyphens (-) ONLY for dates and ranges
- ✅ Use commas or periods for sentence breaks
- ✅ Use % symbol for percentages

**Content Verification:**

- ✅ **Verify ALL metrics** against `profile.json` — NEVER fabricate numbers
- ✅ Use exact company names and dates from `profile.json > experience`
- ❌ If it's not in `profile.json`, DO NOT include it

**Tone:**

- ✅ Natural, human, the user's authentic voice
- ✅ Use connection words: "while", "through", "by", "ensuring"
- ✅ Start bullets with unique action verbs
- ❌ Avoid robotic disconnected clauses

**Structure:**

1. Header (name + contact info from `profile.json > identity`)
2. Professional Summary (EXACTLY 4 bullets)
3. Core Skills (6-8 thematic buckets, comma-separated)
4. Technical Skills (comma-separated list, NO prose)
5. Professional Experience (reverse chronological)
6. Key Achievements (3-4 metrics)
7. Certifications (JD-aligned only)
8. Education (minimal: degree + institution)

**Length:** Max 2 pages when rendered

### HTML Template Preservation (CRITICAL!)

When updating `components/resume/resume.md`, **NEVER remove or modify the HTML structure sections:**

```markdown
# [Full Name — from profile.json > identity.name]

<div class="section headerInfo">

- [email](mailto:[profile.identity.email])
- [linkedin.com/in/handle](https://linkedin.com/in/[profile.identity.linkedin])
- [github.com/handle](https://github.com/[profile.identity.github])
- [Portfolio]([profile.identity.portfolio])

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
- [ ] All metrics verified against `profile.json`
- [ ] No fabricated companies, dates, or achievements
- [ ] Exact company names from `profile.json > experience`
- [ ] Prioritized user's core languages from `profile.json > skills.technical`
- [ ] Prioritized user's core test tools from `profile.json > skills.core`

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
- Verified all metrics from profile.json
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
