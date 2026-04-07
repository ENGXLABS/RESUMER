# Workflow: Generate AI-Native Testing Resume

> **Purpose:** Step-by-step guide for generating or updating the AI-focused resume variant tailored to a specific JD.
> **Target File:** `components/resume-ai/resume-ai.md`

---

## Prerequisites

- [ ] Job Description (JD) provided by user
- [ ] Access to `.github/resume-ai-master-content.md` (AI-specific verified content)
- [ ] Access to `.github/instructions/resume-instructions.md` (formatting rules)
- [ ] Access to `.github/resume-role-templates.md` (Template #6: AI-Native QE Lead)

---

## Step 1: Read Instruction Files (MANDATORY)

**Read ALL of these files completely before generating any content:**

1. `.github/instructions/resume-instructions.md` (828 lines - ALL formatting, punctuation, tone rules)
2. `.github/resume-ai-master-content.md` (ALL lines - AI achievements, metrics, agent details)
3. `.github/resume-role-templates.md` (Template #6 section - AI-Native QE Lead structure)

**State explicitly:**
```
✅ Read resume-instructions.md (828 lines)
✅ Read resume-ai-master-content.md (XXX lines)
✅ Read resume-role-templates.md - Template #6 (AI-Native QE Lead)
```

---

## Step 2: Analyze Job Description

Extract and categorize:
- **AI-specific requirements:** Agent engineering, MCP, prompt engineering, RAG, LLM
- **QE fundamentals required:** API testing, CI/CD, test strategy, performance
- **Leadership requirements:** Team size, roadmap, stakeholder communication
- **Seniority level:** Lead, Manager, Staff, Principal
- **JD keywords:** For natural weaving into bullets

---

## Step 3: Plan Resume Structure

Based on Template #6 and JD analysis:

1. **Professional Summary** - EXACTLY 4 bullets, AI-native identity first
2. **Core Skills** - 6-8 thematic buckets, prioritize AI skills matching JD
3. **Technical Skills** - Lead with AI tools (Copilot, Claude, MCP), then traditional
4. **EPAM Experience** - 8-10 bullets, ALL AI-focused (agents, MCP, training, metrics)
5. **Previous Roles** - Carried from existing content (mobile/traditional focus, NOT rewritten)
6. **AI Agent Projects** - 2-3 project highlights with metrics
7. **Key Achievements** - 3-4 metrics (agent impact leading)
8. **Certifications** - Microsoft Certified GitHub Copilot Engineer (first)
9. **Education** - Minimal

**Page Structure:**
- Page 1: Summary + Skills + EPAM (AI focus) - covers 80-90% of JD
- Page 2: Previous roles + Projects + Achievements + Certs + Education

---

## Step 4: Generate Content

**Critical Rules (from resume-instructions.md):**
- NO EM/EN dashes - use regular hyphens (-) only
- Use % symbol for percentages
- Each bullet starts with unique action verb
- Each bullet has measurable outcome
- Natural human tone, not robotic
- Connection words: "while", "through", "by", "ensuring", "resulting in"

**AI Content Rules:**
- ALL metrics must be verified against `resume-ai-master-content.md`
- Prioritize: Agent engineering > MCP > Prompt engineering > Traditional QE
- EPAM section is COMPLETELY AI-focused (different from QE resume)
- Previous roles stay as-is from QE resume (mobile/traditional)

---

## Step 5: Update File

Update `components/resume-ai/resume-ai.md` with generated content.

**CRITICAL: Preserve HTML template structure:**
- Keep contact line format (email | linkedin | github | portfolio)
- Keep spacer spans: `<span class="spacer"></span><span class="normal">dates</span>`
- Keep H4 for company names
- Keep markdown heading hierarchy (H1 > H2 > H3 > H4)

---

## Step 6: Self-Audit (MANDATORY)

Before submitting, verify:

### Punctuation and Formatting
- [ ] ZERO EM/EN dashes used
- [ ] % symbol used, not spelled out
- [ ] Single column layout
- [ ] Max 2 pages

### Content Verification
- [ ] ALL metrics verified against resume-ai-master-content.md
- [ ] No fabricated agents, companies, dates, or achievements
- [ ] Agent names match master content exactly
- [ ] Hours saved, error rates, team sizes all verified

### AI Resume-Specific
- [ ] Professional Summary: EXACTLY 4 bullets, AI-native identity
- [ ] Core Skills: 6-8 buckets, AI skills prioritized
- [ ] Technical Skills: AI tools listed first
- [ ] EPAM: ALL bullets AI-focused (agents, MCP, training)
- [ ] Previous roles: NOT rewritten for AI
- [ ] Microsoft Certified GitHub Copilot Engineer listed first in certs

### Tone and Style
- [ ] Human, direct, confident tone
- [ ] No robotic phrasing
- [ ] Natural flow with connection words
- [ ] No forbidden phrases or cliches

**State explicitly:**
```
✅ Self-audit completed: [list specific checks performed]
```

---

## Step 7: Output

Present the updated resume with:
1. Proof of compliance (files read + line counts)
2. JD analysis summary
3. Generated content
4. Self-audit results

---

**Last Updated:** March 27, 2026
**Purpose:** Workflow for AI-Native Testing resume generation
**Content Source:** `.github/resume-ai-master-content.md`
