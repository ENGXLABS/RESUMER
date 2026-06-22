---
description: Generate both tailored resume AND cover letter from a LinkedIn/job link or raw JD text
---

// turbo-all

# Generate CV and Cover Letter Workflow

This workflow combines resume and cover letter generation into a single streamlined process.

## Inputs Accepted

This workflow accepts EITHER:

1. **LinkedIn job URL** (e.g., `https://www.linkedin.com/jobs/view/4356408984/`)
2. **Company career page URL** with job posting
3. **Raw job description text** (pasted directly)

## Step 1: Detect Input Type

- URL pattern (starts with `http://` or `https://`) → **Go to Step 2**
- Raw text → **Go to Step 3**

## Step 2: Fetch Job Description from Link (If URL provided)

### Step 2A: Try Direct URL Scraping First

**Notify user:**

```
Attempting to extract JD from [URL] using direct scraping...
```

Use `read_url_content` to fetch content directly from public URLs.

**Verify extraction quality:**

- [ ] Job title present
- [ ] Company name identified
- [ ] Full job description (not truncated)
- [ ] Requirements and skills section
- [ ] Company culture/values (if available)

**If successful:**

```
✅ Successfully extracted JD using direct scraping
Job: [TITLE] at [COMPANY]
Proceeding to generate resume and cover letter...
```

### Step 2B: Fall Back to Browser Automation (If Needed)

**Only use if Step 2A failed.**

**Notify user:**

```
❌ Direct scraping incomplete — falling back to browser automation...
```

Use browser automation only if:

- Direct scraping failed or returned truncated content
- Site requires authentication (e.g., LinkedIn behind login)
- Content is hidden behind "Show more" buttons

**Browser task:**

```
Navigate to: [URL]
Wait for full page load (3+ seconds).
Click any "Show more" / "See more" buttons to expand description.
Extract: job title, company, location, employment type, full description
(responsibilities, required skills, company values, benefits).
Return all extracted text.
```

**If extraction fails:** Notify user and ask them to paste the JD manually.

## Step 3: Confirm JD is Complete

```
I have the job description for [JOB_TITLE] at [COMPANY_NAME].

Key details captured:
- Role: [TITLE]
- Company: [COMPANY]
- Location: [LOCATION]
- Top 3 requirements: [REQ_1, REQ_2, REQ_3]

Proceeding to generate both resume and cover letter...
```

## Step 4: Generate Resume

### 4.1: Read Instruction Files

1. Read `.github/instructions/resume-instructions.md` (ALL lines)
2. Load `profile.json` for verified facts

```
✅ Read resume-instructions.md
✅ Loaded profile.json for fact verification
```

### 4.2: Analyze JD for Resume

- Extract keywords, required skills, role level
- Select appropriate role template from `resume-instructions.md` (QA Manager / Staff SDET / Senior SDET / Principal QA)

### 4.3: Generate Resume Content

- ❌ NO EM/EN dashes
- ✅ Verify ALL metrics from `profile.json`
- ✅ Prioritize user's core tools and languages from `profile.json > skills`
- ✅ Natural human tone
- ✅ EXACTLY 4-bullet summary
- ✅ 6-8 Core Skills buckets
- ✅ Max 2 pages

### 4.4: Preserve HTML Template

When updating `components/resume/resume.md`:

```markdown
# [Full Name — profile.json > identity.name]

<div class="section headerInfo">
[KEEP STRUCTURE — update with identity data from profile.json]
</div>

[UPDATE CONTENT HERE]
```

### 4.5: Self-Audit Resume

```
✅ Resume self-audit completed:
- Verified all metrics from profile.json
- No EM/EN dashes used
- 4-bullet summary, 6-8 core skills
- HTML template preserved
- Natural human tone maintained
```

## Step 5: Generate Cover Letter

### 5.1: Read Instruction Files

1. Read `.github/instructions/cover-letter-instructions.md` (ALL lines)
2. `profile.json` already loaded — use for fact verification

```
✅ Read cover-letter-instructions.md
✅ Using profile.json for fact verification
```

### 5.2: Analyze JD for Cover Letter

- Identify company culture, values, mission
- Extract top 5 responsibilities matching the user's experience
- Note specific language and tone in JD

### 5.3: Generate Cover Letter Content

- ❌ NO EM/EN dashes
- ❌ NO forbidden phrases ("excited to apply", "perfect fit", etc.)
- ✅ 4-paragraph structure
- ✅ 250-300 words (ONE PAGE)
- ✅ Verify all metrics from `profile.json`
- ✅ Natural, confident tone

**Four-paragraph structure:**

1. Opening (1-2 lines): Hook, no clichés
2. What You Bring (3-4 lines): Evidence + verified metrics
3. Why This Company (2-3 lines): Specific connection to values/mission
4. Closing (1-2 lines): Confident sign-off

### 5.4: Preserve HTML Template

When updating `components/cover-letter/cover-letter.md`:

```markdown
<div class="gradient-header">
[KEEP HEADER — populated from profile.json > identity]
</div>

**Date:** [CURRENT_DATE]
**[COMPANY_NAME]**

[UPDATE CONTENT HERE]

Best regards,
[Full Name — profile.json > identity.name]

<div class="footer-bar">
[KEEP FOOTER — populated from profile.json > identity]
</div>
```

### 5.5: Self-Audit Cover Letter

```
✅ Cover letter self-audit completed:
- Verified all metrics from profile.json
- No EM/EN dashes, no forbidden phrases
- 4-paragraph structure, ~280 words, fits on one page
- HTML template preserved
- Natural human tone maintained
```

## Step 6: Final Output

```
✅ COMPLETED: Resume and Cover Letter for [JOB_TITLE] at [COMPANY_NAME]

📄 Resume updated: components/resume/resume.md
💌 Cover letter updated: components/cover-letter/cover-letter.md

Key tailoring highlights:
- Emphasized: [TOP_3_SKILLS_FROM_JD]
- Matched company values: [COMPANY_VALUES]
- Included metrics: [KEY_METRICS_USED]

View at: http://localhost:8000
```

---

## Critical Success Criteria

✅ Complete JD captured (including company values)
✅ Both resume AND cover letter generated
✅ All metrics verified from `profile.json`
✅ NO EM/EN dashes in either document
✅ HTML templates preserved in both files
✅ Natural human tone in both documents
✅ Self-audit completed for both
✅ Files updated: `components/resume/resume.md` and `components/cover-letter/cover-letter.md`
