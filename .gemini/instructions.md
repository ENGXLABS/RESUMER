# Gemini/Antigravity Agent Instructions for RESUMER

## 🎯 Primary Instruction File

**For all resume and cover letter generation tasks, read:**

- **`.github/antigravity-agent-instructions.md`** (complete workflow and rules)

This file contains:

- Mandatory 6-step workflow
- Critical punctuation, content verification, and tone rules
- User command recognition ("CV for JD", "CV and Cover", etc.)
- Quick reference tables for resume/cover letter structure
- Comprehensive self-audit checklists
- Examples and anti-patterns

---

## 🚨 Automatic Workflow Trigger

When the user requests any of the following, **automatically read and follow** `.github/antigravity-agent-instructions.md`:

### Resume Generation

- "CV for JD"
- "CV for JD below"
- "Resume for this job"
- "Generate resume" (with job description)

### Cover Letter Generation

- "Cover letter"
- "Cover for JD"
- "Generate cover letter"

### Combined Generation

- "CV and Cover"
- "CV and Cover for JD"
- "Resume and cover letter"

### ATS Analysis

- "ATS score"
- "ATS check"
- "Check resume against JD"

---

## 📋 Mandatory Steps (Summary)

When triggered, you MUST:

1. ✅ Read `.github/antigravity-agent-instructions.md`
2. ✅ Read specific instruction file (resume-instructions.md or cover-letter-instructions.md)
3. ✅ Read `.github/resume-master-content.md` for fact verification
4. ✅ State what you read with line counts
5. ✅ Generate content following all rules
6. ✅ Self-audit against checklist
7. ✅ State self-audit results

---

## 🔑 Critical Rules (Quick Reference)

### Punctuation

- ❌ NO EM dashes (—) or EN dashes (–)
- ✅ Use regular hyphens (-) for ranges/dates only
- ✅ Use commas/periods for sentence breaks
- ✅ Use % symbol for percentages

### Content

- ✅ Verify ALL metrics from `.github/resume-master-content.md`
- ❌ NEVER fabricate companies, dates, or achievements

### Skills Priority

- Primary languages: **Java, Kotlin** (not Python/JS/TS)
- Primary test tool: **Selenium** (not Playwright/Cypress)

### Tone

- Write naturally with connection words ("while", "through", "by")
- Avoid robotic disconnected clauses
- Match Siva's voice: direct, simple, confident

---

## 📁 Key File Locations

| Purpose | File Path |
|---------|-----------|
| **Main Instructions** | `.github/antigravity-agent-instructions.md` |
| Resume Rules | `.github/instructions/resume-instructions.md` |
| Cover Letter Rules | `.github/instructions/cover-letter-instructions.md` |
| ATS Checker Rules | `.github/instructions/ats-checker-instructions.md` |
| Master Content | `.github/resume-master-content.md` |
| **Role Templates** | `.github/resume-role-templates.md` |
| Workflows | `.agent/workflows/` |

---

## ✅ Success Criteria

Your response is successful when it includes:

```
✅ Read antigravity-agent-instructions.md
✅ Read [resume/cover-letter]-instructions.md (XXX lines)
✅ Read resume-master-content.md (XXX lines)

[Generated content]

✅ Self-audit completed:
- Verified all metrics from master content
- No EM/EN dashes used
- [Resume/Cover letter specific checks]
- Natural human tone maintained
- All JD keywords incorporated naturally
```

---

## 💡 For Gemini Agents

This project uses a **mandatory workflow system** to ensure quality and consistency. The workflow is designed to:

1. **Prevent errors** (fabricated content, wrong punctuation, robotic tone)
2. **Ensure accuracy** (all facts verified from master content)
3. **Maintain voice** (Siva's authentic, direct style)
4. **Optimize ATS** (proper keywords, structure, formatting)

**Always follow the complete workflow in `.github/antigravity-agent-instructions.md`.**

---

**Last Updated:** February 1, 2026  
**Project:** RESUMER - Resume and Cover Letter Generation Tool
