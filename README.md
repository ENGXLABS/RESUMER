# Resume Builder

A comprehensive tool for creating ATS-optimized resumes, professional cover letters, and checking ATS compatibility scores.

---

## AI Persona

**You are a top-tier HR hiring expert who has reviewed over 100,000 resumes.**

Your expertise includes:
- Identifying what makes candidates stand out to recruiters
- Crafting ATS-optimized content that passes automated screening
- Converting responsibilities into measurable achievements
- Quantifying impact with numbers, percentages, and business results
- Making every bullet point irresistible and achievement-focused

**Your mission:** Transform every resume into a powerful document that showcases real impact, not just duties. Convert weak, passive language into strong, results-driven achievements that prove the candidate's value.

---

## Component-Specific Instructions

This project has three main components, each with detailed instructions:

### 1. Resume Generator
📄 **Instructions:** `.github/instructions/resume-instructions.md`  
**Purpose:** Generate ATS-optimized, achievement-focused resumes tailored to job descriptions  
**Key Files:** `components/resume/resume.css`, `components/resume/resume.md`, `components/resume/resume-settings.css`

### 2. Cover Letter Generator
📝 **Instructions:** `.github/instructions/cover-letter-instructions.md`  
**Purpose:** Generate clean, human-sounding cover letters in Siva's authentic voice  
**Key Files:** `components/cover-letter/cover-letter.css`

### 3. ATS Score Checker
🎯 **Instructions:** `.github/instructions/ats-checker-instructions.md`  
**Purpose:** Analyze resumes against job descriptions and provide ATS compatibility scores  
**Key Files:** `components/ats-checker/`

---

## Master Content Reference

📚 **Master Resume Content:** `.github/resume-master-content.md`  
Contains all verified achievements, experiences, skills, and metrics for Sivasankaramalan Gunasekarasivam

---

## Quick Reference

When user asks for:
- **Resume generation/editing** → Use `instructions/resume-instructions.md`
- **Cover letter creation** → Use `instructions/cover-letter-instructions.md`
- **ATS score check** → Use `instructions/ats-checker-instructions.md`

Always refer to the component-specific instructions for detailed rules and guidelines.

---

## Project Structure

```
resume-builder/
├── README.md (this file)
├── index.html (main web app)
├── settings.css (web UI styles)
├── .github/
│   ├── copilot-instructions.md (router file)
│   ├── resume-master-content.md
│   └── instructions/
│       ├── resume-instructions.md
│       ├── cover-letter-instructions.md
│       └── ats-checker-instructions.md
└── components/
    ├── resume/
    │   ├── resume.css (resume formatting)
    │   ├── resume-settings.css (print settings)
    │   └── resume.md (content)
    ├── cover-letter/
    │   └── cover-letter.css
    └── ats-checker/
```

---

## Getting Started

1. **Start Local Server:**
   ```bash
   cd resume-builder
   python3 -m http.server 8000
   ```

2. **Open in Browser:**
   ```
   http://localhost:8000
   ```

3. **Use the Tools:**
   - **Resume Generator:** Edit and export tailored resumes
   - **Cover Letter Generator:** Create personalized cover letters
   - **ATS Checker:** Analyze and optimize your documents

---

## Features

### Resume Generator
- ✅ Edit Mode with live preview
- ✅ Company name for dynamic file naming
- ✅ Download as Markdown
- ✅ Print to PDF with custom margins
- ✅ Auto-save drafts
- ✅ ATS-optimized formatting

### Cover Letter Generator
- 📝 Four-paragraph structure
- 📝 Human, direct tone
- 📝 JD-tailored content
- 📝 250-300 word limit
- 📝 Professional formatting

### ATS Score Checker
- 🎯 Keyword matching analysis
- 🎯 Formatting compatibility check
- 🎯 Optimization recommendations
- 🎯 Match percentage scoring

---

**Last Updated:** November 30, 2025  
**Maintained By:** Sivasankaramalan Gunasekarasivam
