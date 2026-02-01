---
description: Generate a tailored cover letter for a specific Job Description (JD).
---

// turbo-all

# Generate Cover Letter Workflow

## Step 1: Prerequisite Check

- Ensure you have the Job Description (JD) text
- Ensure `.github/resume-master-content.md` is accessible for fact-checking

## Step 2: Read ALL Instruction Files (MANDATORY)

**You MUST read these files completely and state what you read:**

1. Read `.github/instructions/cover-letter-instructions.md` (ALL 282 lines)
2. Read `.github/resume-master-content.md` (ALL lines for fact verification)

**After reading, explicitly state:**

```
✅ Read cover-letter-instructions.md (282 lines)
✅ Read resume-master-content.md (XXX lines)
```

## Step 3: Analyze Job Description

- Extract top 5 responsibilities and required skills
- Identify company culture, values, and mission for the "Why this company" paragraph
- Note specific language and tone used in the JD
- Look for company values (e.g., "Bold", "Impactful", "Collaborative")

## Step 4: Planning

- Identify 2-3 key strengths/achievements from master content that map to JD
- Plan the 4-paragraph structure:
  1. **Opening (1-2 lines):** Hook mentioning role + company, no "excited to apply"
  2. **What You Bring (3-4 lines):** Evidence + verified metrics matching JD
  3. **Why This Company (2-3 lines):** Specific connection to their mission/values
  4. **Closing (1-2 lines):** Confident sign-off, offer to discuss

## Step 5: Generation

Generate the cover letter following the four-paragraph structure.

### CRITICAL RULES

**Length:**

- ✅ **ONE PAGE MAX:** 250-300 words total
- ✅ Keep each paragraph to specified line counts

**Punctuation:**

- ❌ **NO EM/EN DASHES** (— / –)
- ❌ **NO hyphens as sentence connectors**
- ✅ Use commas or periods for sentence breaks
- ✅ Use % symbol for percentages

**Content Verification:**

- ✅ **Verify ALL metrics** against master content
- ❌ NEVER fabricate numbers or achievements
- ✅ Use exact company names and dates

**Tone:**

- ✅ Direct, confident, human (Siva's voice)
- ✅ Conversational and natural flow
- ✅ Use connection words: "while", "through", "by"
- ❌ NO inflated language or thesaurus words
- ❌ NO emotional over-the-top tone

**Forbidden Phrases:**

- ❌ "I am thrilled to..."
- ❌ "I believe I would be a perfect fit..."
- ❌ "I am writing to express my interest..."
- ❌ "I am excited to apply..."
- ❌ "It would be an honor..."
- ❌ "I would be grateful for the opportunity..."

### HTML Template Preservation (CRITICAL!)

When updating `components/cover-letter/cover-letter.md`, **NEVER remove or modify these HTML sections:**

**Header (ALWAYS preserve):**

```markdown
<div class="gradient-header">
    <h1>Sivasankaramalan Gunasekarasivam</h1>
    <div class="contact-line">
        <a href="mailto:ssmalan94@gmail.com"><span class="iconify" data-icon="mdi:email"></span>ssmalan94@gmail.com</a>
        <a href="https://linkedin.com/in/Sivasankaramalan"><span class="iconify" data-icon="mdi:linkedin"></span>linkedin.com/in/Sivasankaramalan</a>
    </div>
</div>
```

**Footer (ALWAYS preserve):**

```markdown
<br>
<br>

<div class="footer-bar">
    <a href="https://github.com/Sivasankaramalan"><span class="iconify" data-icon="mdi:github"></span>GitHub</a>
    <a href="https://sivasankaramalan.is-a.dev/"><span class="iconify" data-icon="mdi:web"></span>Portfolio</a>
    <a href="https://linkedin.com/in/Sivasankaramalan"><span class="iconify" data-icon="mdi:linkedin"></span>LinkedIn</a>
</div>
```

**Content structure:**

```markdown
**Date:** [Current Date]

**[Company Name]**

Dear [Hiring Manager],

[PARAGRAPH 1 - Opening]

[PARAGRAPH 2 - What You Bring]

[PARAGRAPH 3 - Why This Company]

[PARAGRAPH 4 - Closing]

Best regards,  
Sivasankaramalan Gunasekarasivam
```

## Step 6: Self-Audit (MANDATORY)

**Check against the self-audit checklist:**

### Punctuation & Formatting

- [ ] ZERO EM dashes (—) or EN dashes (–) used
- [ ] No hyphens as sentence connectors
- [ ] Percent symbol (%) used, not spelled out
- [ ] Fits on ONE PAGE (250-300 words)

### Content Verification

- [ ] Read complete instruction files
- [ ] All metrics verified against master content
- [ ] No fabricated achievements
- [ ] Company name spelled exactly as in JD

### Cover Letter-Specific

- [ ] Four-paragraph structure followed
- [ ] Paragraph 1: Under 3 lines, no clichés
- [ ] Paragraph 2: Includes verified metric, 2-3 strengths
- [ ] Paragraph 3: Real company-specific detail (values/mission)
- [ ] Paragraph 4: 1-2 lines max, confident tone
- [ ] Total: 250-300 words
- [ ] HTML header and footer preserved

### Tone & Style

- [ ] Natural human tone (not robotic)
- [ ] No forbidden phrases used
- [ ] Connection words used appropriately
- [ ] Direct and confident, not begging

**After self-audit, explicitly state:**

```
✅ Self-audit completed:
- Verified all metrics from master content
- No EM/EN dashes used
- 4-paragraph structure, 280 words, fits on one page
- HTML template preserved
- Natural human tone, no forbidden phrases
```

## Step 7: File Update

**Update the file:** `components/cover-letter/cover-letter.md`

**CRITICAL:** Only update the CONTENT section between header and footer:

- ✅ Keep `<div class="gradient-header">` header
- ✅ Keep `<div class="footer-bar">` footer
- ✅ Only replace date, company name, recipient, and 4 paragraphs

## Step 8: Output

Present the final cover letter showing what file was updated and confirmation of self-audit completion.

---

**Created:** February 1, 2026  
**Last Updated:** February 1, 2026
