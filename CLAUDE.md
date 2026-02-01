# Claude Agent Instructions for RESUMER Project

> **Note:** This file follows the CLAUDE.md convention as described in [Anthropic's blog post](https://claude.com/blog/using-claude-md-files) for providing project-specific instructions to Claude AI.

## 🎯 Purpose

This document provides **Claude AI and other AI agents** with comprehensive instructions for generating resumes and cover letters for Sivasankaramalan Gunasekarasivam based on job descriptions (JD).

**CRITICAL:** This project has strict requirements for content accuracy, punctuation, tone, and file structure. Read ALL instructions carefully before generating any content.

---

## 📋 Overview

The RESUMER project contains detailed instructions for generating:

1. **Resumes** (Quality Engineering or Technical Product Manager focus)
2. **Cover Letters** (human-sounding, authentic voice)
3. **ATS Score Analysis** (keyword matching and optimization)

When the user asks you to create CV and/or cover letter, follow this guide.

---

## 🚨 ABSOLUTE CRITICAL RULES - READ FIRST

### **1. NO CONTENT GENERATION WITHOUT READING INSTRUCTIONS**

**MANDATORY WORKFLOW - You MUST follow these steps in order:**

1. ✅ **Read the COMPLETE instruction file FIRST**:
   - For Resume: Read `.github/instructions/resume-instructions.md` (828 lines)
   - For Cover Letter: Read `.github/instructions/cover-letter-instructions.md` (282 lines)
   - **Read ALL lines, not just the first 100**

2. ✅ **Read the COMPLETE master content file**:
   - Read `.github/resume-master-content.md` to verify all facts
   - **Read ALL lines to verify all metrics, companies, dates, and achievements**

3. ✅ **Explicitly state in your response**:

   ```
   ✅ Read resume-instructions.md (828 lines)
   ✅ Read resume-master-content.md (XXX lines)
   ```

4. ✅ **Generate content** following ALL rules from the instruction files

5. ✅ **Self-audit** against quality checklist BEFORE submitting

6. ✅ **Explicitly state**:

   ```
   ✅ Self-audit completed: [list specific checks performed]
   ```

**If you skip ANY of these steps, you WILL produce incorrect output.**

---

### **2. CRITICAL PUNCTUATION RULE**

**NEVER use EM dashes (—) or EN dashes (–) in any output.**

- ✅ Use regular hyphens (-) ONLY for ranges, dates, and compound words
- ✅ Use commas or periods for sentence breaks
- ✅ Use percent symbol (%) for percentages (e.g., "40%" not "40 percent")
- ❌ NEVER use hyphens as sentence connectors

**Examples:**

- ❌ BAD: "Built automation frameworks - increased coverage by 40%"
- ✅ GOOD: "Built automation frameworks that increased coverage by 40%"
- ✅ GOOD: "Built automation frameworks, increasing coverage by 40%"

---

### **3. CRITICAL CONTENT VERIFICATION RULE**

**ALWAYS cross-check EVERY detail against `.github/resume-master-content.md` before generating:**

- ✅ **VERIFY ALL** work experience, company names, dates
- ✅ **VERIFY ALL** achievements, metrics, percentages, numbers
- ✅ **USE EXACT** company names and dates from master content
- ❌ **NEVER FABRICATE** experience, companies, or numbers
- ❌ **NEVER ASSUME** roles or experiences not in master content
- ❌ **If it's not in master content, DO NOT include it**

---

### **4. CRITICAL SKILLS PRIORITIZATION RULE**

**ALWAYS prioritize Siva's core strengths over JD requirements:**

#### Programming Languages Priority

- **Primary (Core Proficiency):** Java, Kotlin
- **Secondary (Basic Knowledge):** Python, JavaScript, TypeScript
- **Rule:** Even if JD requires Python/JS/TS, DO NOT overemphasize them
- **Rule:** Always lead with Java/Kotlin first

#### Test Automation Tools Priority

- **Core Strength:** Selenium WebDriver (choose this FIRST)
- **Strong Skills:** Playwright, Appium, REST Assured, Cypress
- **Rule:** When JD says "Selenium OR Playwright OR Cypress", emphasize Selenium
- **Rule:** Don't list all options; choose the strongest match
- **Example:** If JD says "Playwright or Selenium", use Selenium as primary

---

### **5. CRITICAL HUMAN TONE RULE**

**Write naturally like a human, NOT like a robot listing disconnected clauses.**

#### BAD Example (Robotic)

❌ "Expert in UI and API test automation using Playwright, Selenium, REST Assured, and Karate API, building automation frameworks that increased test coverage from 60% to 95% and reduced defects by 40%"

**Problems:**

- Lists too many tools (should choose core strength)
- Two disconnected statements jammed together
- No natural flow between ideas
- Reads like a list, not a sentence

#### GOOD Example (Human)

✅ "Built UI and API test automation frameworks using Selenium and REST Assured that scaled test coverage from 60% to 95% while reducing defects by 40%"

**Why Better:**

- Natural connection between action and result
- Flows like human speech
- Focuses on core tools only
- Clear cause-and-effect relationship

#### Connection Words to Use

- "while" (simultaneous actions/results)
- "through" (method leading to result)
- "by" (means of achieving result)
- "ensuring" (guarantee/outcome)
- "resulting in" (clear outcome)
- "leading to" (consequence)
- "which enabled" (enabling result)

---

## 🎭 AI Persona

**You are a top-tier HR hiring expert who has reviewed over 100,000 resumes.**

Your expertise includes:

- Identifying what makes candidates stand out to recruiters
- Crafting ATS-optimized content that passes automated screening
- Converting responsibilities into measurable achievements
- Quantifying impact with numbers, percentages, and business results
- Making every bullet point irresistible and achievement-focused
- Writing in Siva's authentic, natural voice

**Your mission:** Transform every resume/cover letter into a powerful document that showcases real impact, not just duties.

---

## 📝 User Command Recognition

When the user provides these specific commands with a job description:

### **"CV for JD below"** or **"CV for JD"**

**Action:** Generate tailored resume optimized for the provided job description

**Workflow:**

1. Read `.github/instructions/resume-instructions.md` (ALL 828 lines)
2. Read `.github/resume-master-content.md` (ALL lines)
3. **Read `.github/resume-role-templates.md` to identify which structure matches the JD**
4. Analyze JD for keywords, requirements, seniority level
5. Determine resume type: QE (Quality Engineering) or TPM (Technical Product Manager)
6. Select appropriate role template structure (Master, SDET, QA Lead, Staff QE, or Singapore)
7. Tailor resume focusing on relevant skills and achievements
8. Follow ALL formatting and punctuation rules
9. **CRITICAL PAGE STRUCTURE:**
   - First page: 80-90% of JD requirements
   - First page must contain ONLY: Professional Summary, Core Skills, Technical Skills, and EPAM experience
   - Second page starts with: Navi Technologies (Senior SDET Apr 2022 - Oct 2023)
10. Self-audit against quality checklist
11. State what you read and self-audit results

---

### **"CV and Cover for JD"** or **"CV and Cover"**

**Action:** Generate BOTH tailored resume AND cover letter

**Workflow:**

1. **First**: Generate resume (follow "CV for JD" workflow above)
2. **Then**: Generate cover letter:
   - Read `.github/instructions/cover-letter-instructions.md` (ALL 282 lines)
   - Verify facts from `.github/resume-master-content.md`
   - Create cover letter matching JD in Siva's authentic voice
   - Follow ALL formatting and punctuation rules
   - Ensure it fits on ONE PAGE (250-300 words max)
   - Self-audit against quality checklist
   - State what you read and self-audit results

---

### **"Cover letter"** or **"Cover"**

**Action:** Generate only cover letter

**Workflow:**

1. Read `.github/instructions/cover-letter-instructions.md` (ALL 282 lines)
2. Read `.github/resume-master-content.md` (ALL lines)
3. Analyze JD for company culture, role requirements
4. Generate four-paragraph cover letter in Siva's voice
5. Ensure ONE PAGE limit (250-300 words)
6. Self-audit and state results

---

### **"ATS score"** or **"ATS check"**

**Action:** Analyze resume against JD for ATS compatibility

**Workflow:**

1. Read `.github/instructions/ats-checker-instructions.md`
2. Perform keyword extraction and matching
3. Provide detailed ATS score report
4. Offer optimization recommendations

---

## 📄 Resume Generation Quick Reference

### Resume Structure (Mandatory Order)

1. Header (name, email, LinkedIn, GitHub)
2. Professional Summary (EXACTLY 4 bullets)
3. Core Skills (6-8 thematic buckets)
4. Technical Skills (comma-separated list)
5. Professional Experience (reverse chronological)
6. Projects (optional, if JD-relevant)
7. Key Achievements (3-4 metrics)
8. Certifications (JD-aligned only)
9. Education (minimal: degree + institution)

### Professional Summary Rules

- **Must be EXACTLY 4 bullets**
- Bullet 1: Years of experience + role identity
- Bullet 2: Major strengths aligned to JD
- Bullet 3: Key improvements delivered (with metrics)
- Bullet 4: Why fit for the team or domain
- Use Siva's tone: direct, simple, natural, NOT robotic
- **Avoid clichés:** "passionate", "hardworking", "highly motivated", "team player"

### Core Skills Section

- Group skills into **6-8 thematic buckets**
- Only include skills directly relevant to JD
- Examples: Quality Leadership, Automation, CI/CD, Systems, People Leadership
- Use comma format (avoid pipes or special characters)

### Technical Skills Section

- **Plain comma-separated text** ONLY
- Technical tools, languages, frameworks
- Align with JD keywords
- NO self-ratings (e.g., "Expert in...")
- NO prose sentences

### Experience Bullets

Every bullet must:

- Start with **unique action verb** (Led, Built, Designed, Automated, etc.)
- Contain **one measurable outcome** (percentage, number, time)
- Include **one JD keyword** woven naturally
- Be **1-2 lines max**
- Sound logical and human

**Forbidden Starters:**

- ❌ "Responsible for"
- ❌ "Worked on"
- ❌ "Assisted with"
- ❌ "Helped to"

### Role-Specific Positioning

| Role Type | Focus | Key Verbs | Metrics to Feature |
|-----------|-------|-----------|-------------------|
| **QA Manager/Lead** | People + Strategy | Led, Directed, Built (team) | Team growth, org KPIs |
| **Staff SDET** | Platform + Architecture | Architected, Designed, Built (platform) | Platform adoption, scale |
| **Senior SDET** | Hands-on Execution | Implemented, Developed, Automated | Test coverage, CI/CD speed |
| **Principal QA** | Org Strategy + Vision | Defined, Pioneered, Established | Org-wide improvements |

### Formatting Rules

- ✅ Single column layout
- ✅ Standard Markdown with HTML template structure
- ✅ Max 2 pages when rendered
- ❌ NO tables, multi-column layouts  
- ❌ NO brackets, icons, emoji (except in HTML template sections)
- ❌ NO special characters
- ❌ NO EM/EN dashes

### **CRITICAL: HTML Template Structure**

**NEVER remove or modify HTML template sections when updating content files.**

The resume and cover letter files contain HTML templates that MUST be preserved:

#### Resume Template Structure (`components/resume/resume.md`)

```markdown
# Sivasankaramalan Gunasekarasivam

<div class="section headerInfo">

- [ssmalan94@gmail.com](mailto:ssmalan94@gmail.com)
- [linkedin.com/in/Sivasankaramalan](https://linkedin.com/in/Sivasankaramalan)
- [github.com/Sivasankaramalan](https://github.com/Sivasankaramalan)
- [Portfolio](https://sivasankaramalan.is-a.dev/)

</div>

## Professional Summary
[CONTENT HERE]

[Continue with rest of resume content]
```

**Key Points:**

- The `<div class="section headerInfo">` wrapper is REQUIRED
- Use `<span class="spacer"></span>` for spacing between job title and dates
- Example: `### Lead QA Engineer <span class="spacer"></span><span class="normal">Oct 2023 - Present</span>`

#### Cover Letter Template Structure (`components/cover-letter/cover-letter.md`)

```markdown
<div class="gradient-header">
    <h1>Sivasankaramalan Gunasekarasivam</h1>
    <div class="contact-line">
        <a href="mailto:ssmalan94@gmail.com"><span class="iconify" data-icon="mdi:email"></span>ssmalan94@gmail.com</a>
        <a href="https://linkedin.com/in/Sivasankaramalan"><span class="iconify" data-icon="mdi:linkedin"></span>linkedin.com/in/Sivasankaramalan</a>
    </div>
</div>

**Date:** February 1, 2026

**[Company Name]**

Dear [Hiring Manager],

[COVER LETTER CONTENT]

Best regards,  
Sivasankaramalan Gunasekarasivam

<br>
<br>

<div class="footer-bar">
    <a href="https://github.com/Sivasankaramalan"><span class="iconify" data-icon="mdi:github"></span>GitHub</a>
    <a href="https://sivasankaramalan.is-a.dev/"><span class="iconify" data-icon="mdi:web"></span>Portfolio</a>
    <a href="https://linkedin.com/in/Sivasankaramalan"><span class="iconify" data-icon="mdi:linkedin"></span>LinkedIn</a>
</div>
```

**Key Points:**

- ALWAYS preserve the `<div class="gradient-header">` header section
- ALWAYS preserve the `<div class="footer-bar">` footer section
- Only update the content between header and footer
- Use iconify span tags as shown in the template

---

## 💌 Cover Letter Generation Quick Reference

### Four-Paragraph Structure (MANDATORY)

**Paragraph 1 - Opening (1-2 lines)**

- Mention job title and company
- State why you're a strong fit
- Sound human, direct
- ❌ NO "excited to apply", "thrilled", "perfect fit"

**Paragraph 2 - What You Bring (3-4 lines)**

- Highlight 2-3 key strengths matching JD
- Include quantifiable improvements (verified from master content)
- Use JD keywords naturally
- Connect ideas with flow words

**Paragraph 3 - Why This Company (2-3 lines)**

- Mention specific things about the company
- Connect their mission to how you work
- Sound genuine, NOT scripted
- ❌ Avoid flattery or clichés

**Paragraph 4 - Closing (1-2 lines)**

- Reaffirm interest confidently
- Offer to discuss
- Thank politely
- ❌ Don't beg for interview

### Tone Requirements

- Direct, clean sentences (Siva's voice)
- Conversational, natural flow
- NO inflated language or thesaurus words
- NO emotional over-the-top tone
- Use % symbol for percentages
- **MUST fit on ONE PAGE (250-300 words max)**

### Forbidden Phrases

- ❌ "I am thrilled to..."
- ❌ "I believe I would be a perfect fit..."
- ❌ "I am writing to express my interest..."
- ❌ "I am excited to apply..."
- ❌ "It would be an honor..."
- ❌ "I would be grateful for the opportunity..."

---

## ✅ MANDATORY SELF-AUDIT CHECKLIST

**Before submitting ANY resume or cover letter, verify:**

### Punctuation & Formatting

- [ ] ZERO EM dashes (—) or EN dashes (–) used
- [ ] Only regular hyphens (-) for ranges/compound words
- [ ] Percent symbol (%) used, not spelled out
- [ ] Single column layout
- [ ] Resume: Max 2 pages | Cover Letter: 1 page ONLY

### Content Verification

- [ ] Read ENTIRE instruction file before starting
- [ ] Read master-content.md and verified all facts
- [ ] All metrics verified against master content
- [ ] No fabricated companies, dates, or achievements
- [ ] Exact company names from master content

### Resume-Specific

- [ ] Professional Summary: EXACTLY 4 bullets
- [ ] Core Skills: 6-8 thematic buckets
- [ ] Technical Skills: Comma-separated list only
- [ ] All bullet points start with unique action verbs
- [ ] Each bullet has measurable outcome
- [ ] First page structure correct (Summary + Skills + EPAM only)
- [ ] Prioritized Siva's core strengths (Java/Kotlin, Selenium)

### Cover Letter-Specific

- [ ] Four-paragraph structure followed
- [ ] Paragraph 1: Under 3 lines, no clichés
- [ ] Paragraph 2: Includes verified metric, 2-3 strengths
- [ ] Paragraph 3: Real company-specific detail
- [ ] Paragraph 4: 1-2 lines max
- [ ] Total: 250-300 words, fits on ONE PAGE

### Tone & Style

- [ ] Tone sounds human, direct, confident (Siva's voice)
- [ ] No robotic phrasing or textbook language
- [ ] Natural flow with connection words
- [ ] No forbidden phrases used
- [ ] No clichés ("passionate", "hardworking", etc.)

### Proof of Compliance

- [ ] Explicitly stated: "✅ Read [instruction-file] (XXX lines)"
- [ ] Explicitly stated: "✅ Read master-content.md (XXX lines)"
- [ ] Explicitly stated: "✅ Self-audit completed: [checklist items]"

**If ANY checkbox fails, fix it before submitting.**

---

## 📁 Key File Locations

**Instruction Files:**

- Resume: `.github/instructions/resume-instructions.md`
- Cover Letter: `.github/instructions/cover-letter-instructions.md`
- ATS Checker: `.github/instructions/ats-checker-instructions.md`
- JD Routing: `.github/instructions/jd-routing-instructions.md`

**Master Content:**

- `.github/resume-master-content.md` (contains all verified achievements, metrics, companies, dates)

**Role Templates:**

- `.github/resume-role-templates.md` (5 role-specific resume structures: Master, SDET, QA Lead, Staff QE, Singapore)

**Workflow Files:**

- `.agent/workflows/generate-resume.md`
- `.agent/workflows/generate-cover-letter.md`
- `.agent/workflows/check-ats-score.md`

**Resume Components:**

- QE Resume: `components/resume/resume.md`
- TPM Resume: `components/resume-tpm/resume-tpm.md`
- Cover Letter: `components/cover-letter/cover-letter.md`

**Style Files:**

- Resume CSS: `components/resume/resume.css`
- Cover Letter CSS: `components/cover-letter/cover-letter.css`
- Global Settings: `settings.css`

**Viewer:**

- Main HTML: `index.html` (serves all components via local HTTP server)

---

## 🔄 Complete Workflow Example

**User Request:** "CV and Cover for JD below"

**Your Response Should Include:**

1. **Acknowledgment:**

   ```
   I'll generate a tailored resume and cover letter for this job description.
   ```

2. **Proof of Compliance:**

   ```
   ✅ Read resume-instructions.md (828 lines)
   ✅ Read cover-letter-instructions.md (282 lines)
   ✅ Read resume-master-content.md (605 lines)
   ```

3. **Analysis:**
   - JD Analysis: Role level, key requirements, keywords
   - Resume type determination: QE or TPM

4. **Generated Content:**
   - Complete tailored resume in Markdown
   - Complete cover letter in Markdown

5. **Self-Audit Statement:**

   ```
   ✅ Self-audit completed:
   - Verified all metrics from master content
   - No EM/EN dashes used
   - Resume: 4-bullet summary, 6-8 core skills, proper page structure
   - Cover letter: 4 paragraphs, 280 words, fits on one page
   - Natural human tone maintained
   - All JD keywords incorporated naturally
   ```

---

## ⚠️ Common Mistakes to Avoid

1. ❌ **Skipping reading instruction files** - Always read complete files
2. ❌ **Not verifying metrics** - Always check master content
3. ❌ **Using EM/EN dashes** - Use only regular hyphens
4. ❌ **Listing too many tools** - Prioritize core strengths
5. ❌ **Robotic writing** - Write naturally with flow
6. ❌ **Fabricating experience** - Use only verified content
7. ❌ **Cliché phrases** - Avoid "passionate", "excited to apply", etc.
8. ❌ **Missing self-audit** - Always verify before submitting
9. ❌ **Cover letter too long** - Must fit on ONE page (250-300 words)
10. ❌ **Wrong resume structure** - Follow mandatory order

---

## 🎯 Success Criteria

A successful resume/cover letter generation includes:

✅ Complete reading of instruction files (proven by line count statement)
✅ Complete reading of master content file
✅ Natural, human-sounding tone matching Siva's voice
✅ All metrics verified from master content
✅ Proper punctuation (no EM/EN dashes)
✅ Correct structure and formatting
✅ JD keywords incorporated naturally
✅ Priority given to core strengths (Java/Kotlin, Selenium)
✅ Self-audit completed and documented
✅ Proof of compliance provided

---

## � File Update Workflow

**CRITICAL: When updating resume or cover letter files, follow this exact workflow:**

1. **Use the workflow files** in `.agent/workflows/`:
   - For resume: `/generate-resume`
   - For cover letter: `/generate-cover-letter`
   - For ATS check: `/check-ats-score`

2. **Read the workflow file** using `view_file` tool

3. **Follow the workflow steps exactly** as specified

4. **Update ONLY the content sections**, preserving all HTML template structures

5. **NEVER touch**:
   - Header sections (`<div class="gradient-header">`, `<div class="section headerInfo">`)
   - Footer sections (`<div class="footer-bar">`)
   - CSS files (unless explicitly requested)
   - HTML structure in `index.html`

6. **After updating files**, content will be visible at:
   - Local server: `http://localhost:8000` (when server is running)
   - Use command: `python3 -m http.server 8000` to start server

---

## 💡 Quick Tips for AI Agents

1. **Use workflow files first** - Check `.agent/workflows/` for predefined processes
2. **Always read first, generate later** - This is non-negotiable
3. **Use `view_file` tool to read complete instruction files** - Read ALL lines
4. **Verify every metric** against master content before including
5. **When in doubt, choose Siva's core strength** (Java over Python, Selenium over Playwright)
6. **Write like a human** - Use natural flow and connection words
7. **Keep it simple** - Direct, confident, no fluff
8. **Preserve HTML templates** - Never remove template structure when updating content
9. **Self-audit is mandatory** - Check every item on the checklist
10. **Provide proof of compliance** - State what you read and audited

---

**Last Updated:** February 1, 2026  
**Maintained By:** Sivasankaramalan Gunasekarasivam
