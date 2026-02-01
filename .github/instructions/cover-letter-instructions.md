# Cover Letter Generation Rules - Master Spec

## ⚠️ STOP: PRE-FLIGHT CHECK

**Before writing ANY cover letter, confirm:**

- [ ] I have READ this ENTIRE instruction file
- [ ] I have READ the master-content.md file
- [ ] I understand: hyphens ONLY for ranges/compound words, NOT sentence breaks
- [ ] I understand: use commas or periods for sentence breaks
- [ ] I will verify EVERY metric against master content
- [ ] Cover letter will fit on ONE PAGE (250-300 words max)
- [ ] I will self-audit before submitting

**If you cannot check all boxes, STOP and read the instructions first.**

---

## CRITICAL PUNCTUATION RULE

**NEVER use EM dashes (—) or EN dashes (–) in any output.**

- Use regular hyphens (-) for ranges, dates, and compound words
- Use commas or periods for sentence breaks
- **ALWAYS use percent symbol (%) for percentages** (e.g., "40%" not "40 percent")
- This applies to ALL generated content (cover letters, resumes, emails)

---

## CRITICAL CONTENT VERIFICATION RULE

**ALWAYS cross-check work experience, achievements, and metrics against `resume-master-content.md` before generating ANY content.**

- **NEVER fabricate** work experience, company names, or achievements
- **NEVER assume** previous roles or experiences not in master content
- **ALWAYS verify** metrics, percentages, and numbers exist in master content
- **ALWAYS use** exact company names, dates, and achievements from master file
- If information is not in master content, DO NOT include it
- When in doubt, read the master content file first before generating

**Master Content File Location:** `.github/resume-master-content.md`

**Workflow Before Generating:**

1. Read the master content file first
2. Identify relevant work experiences for the JD
3. Extract exact achievements and metrics
4. Use only verified information in generation
5. Never make up companies, dates, or numbers

---

## CRITICAL SKILLS AND LANGUAGE PRIORITIZATION RULE

**ALWAYS prioritize Siva's core strengths over JD requirements when there are multiple options.**

### Programming Languages Priority

- **Primary Languages:** Java, Kotlin (Siva's core proficiency)
- **Secondary Languages:** Python, JavaScript, TypeScript (basic knowledge only)
- **Rule:** Even if JD requires Python/JS/TS, DO NOT overemphasize them
- **Rule:** Always mention Java/Kotlin first, others only if JD mandatory

### Test Automation Tools Priority

- **Core Strength:** Selenium WebDriver (emphasize this first)
- **Strong Skills:** Playwright, Appium, REST Assured, Cypress
- **Rule:** When JD says "Selenium OR Playwright OR Cypress", focus on Selenium
- **Rule:** Don't list all options, emphasize the strongest match

---

## CRITICAL HUMAN TONE AND NATURAL WRITING RULE

**Write naturally like a human, not like a robot listing skills.**

### Writing Guidelines

1. **Connect ideas naturally** using flow words: "while", "through", "by"
2. **Show cause and effect** clearly
3. **Avoid disconnected statements** jammed together
4. **Write as you speak** naturally

### BAD Example

❌ "Expert in Playwright, Selenium, Cypress building frameworks increasing coverage"
(Too many tools, no natural flow)

### GOOD Example

✅ "I build test automation using Selenium that scaled coverage from 60% to 95%"
(Natural, connected, core strength emphasized)

---

## 1. Overall Philosophy

The cover letter must be:

- **Simple, clean, and human**
- **Direct and confident** (Siva's style)
- **Tailored** to the specific job and company
- **Free of clichés** or robotic language
- **Focused on real value**, not storytelling
- **One page, concise, and purposeful**
- **Showing understanding** of the role and how you add value
- **Written in your natural tone**: straightforward, grounded, honest

**No fluffy intros.**  
**No dramatic narratives.**  
**No textbook corporate tone.**

---

## 2. Format Rules

- Standard business letter format
- Single column
- Include:
  - Date
  - Applicant name
  - Email
  - LinkedIn
  - Phone (optional)
  - Company name
  - Hiring manager name if available
- Single spaced
- Double space between paragraphs
- **Max length: 240-280 words** (strict limit to prevent page overflow)
- Use short paragraphs (2-4 sentences each)
- **CRITICAL: MUST fit on ONE PAGE ONLY (8.5" x 11" letter size)**
- **NO empty second page allowed - if PDF creates extra page, content is TOO LONG**
- **One page limit is NON-NEGOTIABLE**

### Preventing Empty Second Pages

**Common causes of page overflow:**

- ❌ Too many words (over 280 words)
- ❌ Too many `<br>` tags or line breaks
- ❌ Excessive spacing between sections
- ❌ Long paragraphs that don't fit

**Rules to prevent overflow:**

- ✅ Keep total word count at 240-280 words MAX
- ✅ Use exactly 2 line breaks (`<br><br>`) before footer, never more
- ✅ Each paragraph should be 2-4 LINES when rendered (not sentences)
- ✅ If content pushes to second page, remove entire sentences (not just words)
- ✅ Test mentally: 4 paragraphs + header + footer = must fit on one page

---

## 3. Section Structure

The cover letter must follow this **exact four-paragraph format**:

### Paragraph 1 - Opening

**Purpose:** Grab attention quickly.

**Rules:**

- Mention the job title and company clearly
- Keep it crisp (1-2 lines of interest)
- Briefly state why you're a strong fit
- Sound human
- **No generic lines** like "I am excited to apply…"

**Preferred tone example:**
> "How you work matches how I operate — fast, clear ownership, and quality built into the flow."

---

### Paragraph 2 - What You Bring

**Purpose:** Show relevance to the JD.

**Rules:**

- Highlight **2-3 key strengths** that directly match the JD
- Use short, clean sentences
- Mention **quantifiable improvements** (regression speed, stability, automation coverage, cycle time)
- Resonate with user and product impact
- Use JD keywords naturally (not stuffed)

---

### Paragraph 3 - Why This Company

**Purpose:** Show genuine interest.

**Rules:**

- Mention **specific things** about the company
- Sound real, not scripted
- Use phrases that match your voice
- Connect their mission or product philosophy to how you work
- **Avoid flattery or clichés**

**Example tone:**
> "I like the way you treat quality — not as a final step, but part of how the product evolves."

---

### Paragraph 4 - Closing

**Purpose:** Close confidently.

**Rules:**

- Keep it short
- Reaffirm interest
- Offer to discuss, don't beg for interview
- Thank them politely
- Sign off with your name

**Example tone:**
> "Happy to walk through how I approach quality and automation, if you think the role is a fit."

---

## 4. Tone Rules

**Write like Siva:**

- Direct, clean sentences
- No inflated language
- No thesaurus words
- No long story arcs
- No emotional over-the-top tone
- Confident without sounding robotic
- Use simple English
- Focus on value, clarity, and fit
- Conversational, natural flow (not bullet-like or formal)
- Use % symbol for percentages, not spelled out

**Absolutely avoid phrases like:**

- "I am thrilled to…"
- "I believe I would be a perfect fit…"
- "I am writing to express my interest…"
- "I am excited to apply…"
- "It would be an honor…"
- "I would be grateful for the opportunity…"

---

## 5. Tailoring to the Job Description

Copilot must:

- Extract **top 5 responsibilities**
- Extract **required skills**
- Mention **2-3 directly relevant strengths**
- Reword them in human tone
- **Never copy JD lines verbatim**
- Show understanding through phrasing, not repetition

---

## 6. Final Output Requirements

The output must include:

- Full letter formatting
- Date
- Applicant info
- Company info
- Four paragraphs
- Professional signature

**No bullets.**  
**No quotes.**  
**No templates left unfinished.**

---

## 7. Self-Audit Before Returning

**MANDATORY QUALITY CHECKLIST - Verify ALL items:**

### Punctuation & Formatting

- [ ] **ZERO hyphens used as sentence breaks** (must use commas/periods)
- [ ] Hyphens ONLY for ranges (5 to 10, not 5-10) or compound words
- [ ] Percent symbol (%) used, not spelled out
- [ ] No EM dashes (—) or EN dashes (–) anywhere
- [ ] Content fits on ONE PAGE (240-280 words, NO empty second page)
- [ ] Exactly 2 `<br>` tags before footer (not 3 or more)
- [ ] When previewed/printed, creates exactly 1 page (no overflow)

### Content Verification

- [ ] All metrics verified against master-content.md
- [ ] No fabricated companies or achievements
- [ ] Exact company names and dates from master content

### Structure & Tone

- [ ] Paragraph 1: Under 3 lines, no clichés
- [ ] Paragraph 2: Includes verified metric, 2-3 strengths
- [ ] Paragraph 3: Real company-specific detail
- [ ] Paragraph 4: 1-2 lines max
- [ ] Tone sounds human, direct, confident (Siva's voice)
- [ ] No robotic phrasing or textbook language

### Forbidden Phrases Check

- [ ] NO "excited to apply"
- [ ] NO "perfect fit"
- [ ] NO "it would be an honor"
- [ ] NO "I believe I would be"

**If ANY checkbox fails, fix it before submitting.**

---

**Last Updated:** December 6, 2025
