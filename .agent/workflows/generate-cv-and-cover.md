---
description: Generate both tailored resume AND cover letter from a LinkedIn/job link or raw JD text
---

// turbo-all

# Generate CV and Cover Letter Workflow

This workflow combines both resume and cover letter generation into a single streamlined process.

## Inputs Accepted

This workflow accepts EITHER:

1. **LinkedIn job URL** (e.g., `https://www.linkedin.com/jobs/view/4356408984/`)
2. **Company career page URL** with job posting
3. **Raw job description text** (pasted directly)

## Step 1: Detect Input Type

**Check if user provided:**

- URL pattern (starts with `http://` or `https://`) → **Go to Step 2**
- Raw text → **Go to Step 3**

## Step 2: Fetch Job Description from Link (If URL provided)

**Strategy:** Try direct scraping first (faster), fall back to browser if needed

### Step 2A: Try Direct URL Scraping First

**Notify user:** State that you are attempting direct scraping first:

```
Attempting to extract JD from [URL] using direct scraping...
```

**Action:** Use `read_url_content` to fetch content directly from public URLs

**When to use direct scraping:**

- ✅ Public job boards (Workday, Indeed, Glassdoor)
- ✅ Company career pages
- ✅ Any URL that doesn't require authentication

**Verify extraction quality:**

- [ ] Job title present
- [ ] Company name identified
- [ ] Full job description (not truncated)
- [ ] Requirements and skills section
- [ ] Company culture/values (if available)

**If successful:** Notify user:

```
✅ Successfully extracted JD using direct scraping
Job: [TITLE] at [COMPANY]
Proceeding to generate resume and cover letter...
```

### Step 2B: Fall Back to Browser Automation (If Needed)

**Only use if Step 2A failed**

**Notify user about fallback:** Explicitly state why you're using browser:

```
❌ Direct scraping incomplete (reason: JavaScript-rendered content/authentication required/truncated content)
⚡ Falling back to browser automation to extract full job description...
```

**Use browser automation ONLY if:**

- Direct scraping failed or incomplete
- Site requires authentication (LinkedIn)
- Content behind "Show more" buttons

**Browser subagent task:**

```
Navigate to the job posting URL: [USER_PROVIDED_URL]

Wait for the page to fully load (at least 3 seconds).

Look for and click any "Show more" or "See more" buttons to expand the full description.

Extract the following information:
1. Job title
2. Company name
3. Location
4. Employment type and seniority level
5. Complete job description including:
   - About the company
   - Company values and culture (CRITICAL for tone matching)
   - Role overview and responsibilities
   - Required skills and experience
   - Benefits and perks
   - Application instructions

Return ALL extracted text in your final report.
```

**Verify extraction quality:**

- [ ] Full job description (not truncated)
- [ ] Company culture/values section captured
- [ ] Technical requirements and tools listed
- [ ] Benefits section (if available)

**If extraction fails:**

- Notify user and request manual paste
- Explain what information is needed (especially company values for tone matching)

## Step 3: Confirm JD is Complete

**Display to user:**

```
I have the job description for [JOB_TITLE] at [COMPANY_NAME].

Key details captured:
- Role: [TITLE]
- Company: [COMPANY]
- Location: [LOCATION]
- Top 3 requirements: [REQUIREMENT_1, REQUIREMENT_2, REQUIREMENT_3]

Proceeding to generate both resume and cover letter...
```

## Step 4: Generate Resume

**Follow the complete `/generate-resume` workflow:**

### 4.1: Read ALL Instruction Files

1. Read `.github/instructions/resume-instructions.md` (ALL 828 lines)
2. Read `.github/resume-master-content.md` (ALL lines)
3. Read `.github/resume-role-templates.md` (ALL 430 lines)

**State what you read:**

```
✅ Read resume-instructions.md (828 lines)
✅ Read resume-master-content.md (XXX lines)
✅ Read resume-role-templates.md (430 lines)
```

### 4.2: Analyze JD for Resume

- Extract keywords, required skills, role level
- **Select appropriate role template:**
  - Template #1: Master (General strong candidate)
  - Template #2: SDET Focus (Hands-on automation)
  - Template #3: QA Lead (Team leadership)
  - Template #4: Staff QE (Staff-level, architecture)
  - Template #5: Singapore Market (Singapore roles)

### 4.3: Generate Resume Content

**Apply ALL critical rules:**

- ❌ NO EM/EN dashes
- ✅ Verify ALL metrics from master content
- ✅ Prioritize Java/Kotlin, Selenium
- ✅ Natural human tone
- ✅ EXACTLY 4-bullet summary
- ✅ 6-8 Core Skills buckets
- ✅ Max 2 pages

### 4.4: Preserve HTML Template

**When updating `components/resume/resume.md`:**

```markdown
# Sivasankaramalan Gunasekarasivam

<div class="section headerInfo">
[KEEP THIS SECTION INTACT]
</div>

[UPDATE CONTENT HERE]
```

### 4.5: Self-Audit Resume

Check complete self-audit checklist (see generate-resume.md Step 6)

**State audit results:**

```
✅ Resume self-audit completed:
- Verified all metrics from master content
- No EM/EN dashes used
- 4-bullet summary, 6-8 core skills
- HTML template preserved
- Natural human tone maintained
```

## Step 5: Generate Cover Letter

**Follow the complete `/generate-cover-letter` workflow:**

### 5.1: Read Instruction Files

1. Read `.github/instructions/cover-letter-instructions.md` (ALL 282 lines)
2. Read `.github/resume-master-content.md` (already read, reference for verification)

**State what you read:**

```
✅ Read cover-letter-instructions.md (282 lines)
✅ Using resume-master-content.md for fact verification
```

### 5.2: Analyze JD for Cover Letter

- Identify company culture, values, mission
- Extract top 5 responsibilities matching Siva's experience
- Note specific language and tone in JD

### 5.3: Generate Cover Letter Content

**Apply ALL critical rules:**

- ❌ NO EM/EN dashes
- ❌ NO forbidden phrases ("excited to apply", "perfect fit", etc.)
- ✅ 4-paragraph structure
- ✅ 250-300 words (ONE PAGE)
- ✅ Verify all metrics from master content
- ✅ Natural, confident tone

**Four-paragraph structure:**

1. Opening (1-2 lines): Hook, no clichés
2. What You Bring (3-4 lines): Evidence + metrics
3. Why This Company (2-3 lines): Specific connection
4. Closing (1-2 lines): Confident sign-off

### 5.4: Preserve HTML Template

**When updating `components/cover-letter/cover-letter.md`:**

```markdown
<div class="gradient-header">
[KEEP HEADER INTACT]
</div>

**Date:** [CURRENT_DATE]
**[COMPANY_NAME]**

[UPDATE CONTENT HERE]

Best regards,  
Sivasankaramalan Gunasekarasivam

<div class="footer-bar">
[KEEP FOOTER INTACT]
</div>
```

### 5.5: Self-Audit Cover Letter

Check complete self-audit checklist (see generate-cover-letter.md Step 6)

**State audit results:**

```
✅ Cover letter self-audit completed:
- Verified all metrics from master content
- No EM/EN dashes, no forbidden phrases
- 4-paragraph structure, 280 words
- HTML template preserved
- Natural human tone maintained
```

## Step 6: Final Output

**Present completion summary:**

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

## Usage Examples

### Example 1: With LinkedIn Link

```
User: "CV and Cover for https://www.linkedin.com/jobs/view/4356408984/"

Agent:
1. Extracts JD from LinkedIn
2. Generates resume using SDET Focus template
3. Generates cover letter matching Mable's values
4. Updates both files preserving HTML
5. Confirms completion
```

### Example 2: With Raw JD Text

```
User: "CV and Cover for JD below:

[PASTE FULL JD TEXT]"

Agent:
1. Uses provided JD text directly
2. Generates resume using appropriate template
3. Generates cover letter
4. Updates both files
5. Confirms completion
```

---

## Workflow Dependencies

This workflow orchestrates:

1. `/fetch-jd-from-link` (if URL provided)
2. `/generate-resume` (always)
3. `/generate-cover-letter` (always)

---

## Critical Success Criteria

✅ Complete JD captured (including company values)  
✅ Both resume AND cover letter generated  
✅ All metrics verified from master content  
✅ NO EM/EN dashes in either document  
✅ HTML templates preserved in both files  
✅ Natural human tone in both documents  
✅ Self-audit completed for both  
✅ Files updated: `components/resume/resume.md` and `components/cover-letter/cover-letter.md`  
✅ User can view immediately at <http://localhost:8000>

---

**Created:** February 1, 2026  
**Last Updated:** February 1, 2026
