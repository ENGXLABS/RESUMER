/**
 * prompts.js — Prompt templates for all AI actions.
 *
 * Each exported function returns { system, user } ready to pass to sendToProvider().
 * All prompts enforce factual integrity (no fabrication) and output structured JSON.
 */

// ─── Paste & Parse ────────────────────────────────────────────────────────────

const PROFILE_SCHEMA = `
{
  "identity": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  },
  "summary": "",
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "bullets": []
    }
  ],
  "skills": {
    "core": [{ "label": "", "items": [] }],
    "technical": []
  },
  "education": [
    { "degree": "", "field": "", "institution": "", "year": "" }
  ],
  "certifications": [
    { "name": "", "issuer": "", "year": "" }
  ],
  "projects": [
    { "name": "", "description": "", "bullets": [] }
  ],
  "achievements": []
}`;

export function parsePastePrompt(rawText) {
  const system = `You are a precise data extraction engine. Extract career information from unstructured text and return ONLY valid JSON matching the schema exactly. Rules:
- Extract ONLY information explicitly stated in the input text.
- NEVER fabricate, infer, or add information not present in the input.
- If a field has no data, use empty string "" or empty array [].
- For dates, use format "Month YYYY" (e.g. "Jan 2022") or "YYYY".
- For bullets in experience, keep them as achievement statements.
- Return ONLY the JSON object, no markdown fences, no explanation.

Schema to follow:
${PROFILE_SCHEMA}`;

  const user = `Extract career information from the following text and return the JSON profile:

${rawText}`;

  return { system, user };
}

// ─── JD Tailoring ─────────────────────────────────────────────────────────────

export function tailorResumePrompt(resumeMarkdown, jdText, profileJson = '') {
  const system = `You are a senior resume writer and ATS optimization expert. Your task is to tailor a resume to a specific job description.

Rules:
- ONLY use information already present in the resume or profile. NEVER fabricate experience, metrics, or skills.
- Rewrite the Professional Summary (4 bullets) to directly address the JD's key requirements.
- Identify the 3-5 experience bullets most relevant to the JD and rewrite them to use the JD's exact language.
- Add JD keywords naturally — do not keyword-stuff.
- NEVER use EM dashes (—) or EN dashes (–). Use regular hyphens (-) or commas.
- Return a JSON object with this exact shape:
  {
    "summary": ["bullet1", "bullet2", "bullet3", "bullet4"],
    "tailoredBullets": [
      { "section": "role title at company", "original": "...", "tailored": "..." }
    ],
    "addedKeywords": ["keyword1", "keyword2"],
    "atsScore": { "before": 0, "after": 0 }
  }
- Return ONLY the JSON object, no markdown fences, no explanation.`;

  const user = `Job Description:
---
${jdText}
---

Current Resume:
---
${resumeMarkdown}
---
${profileJson ? `\nProfile (source of truth):\n---\n${profileJson}\n---` : ''}

Tailor the resume to this job description following all rules above.`;

  return { system, user };
}

// ─── Bullet improvement ───────────────────────────────────────────────────────

export function improveBulletPrompt(bullet, context = '') {
  const system = `You are an expert resume writer. Improve a single resume bullet point to be more achievement-focused, specific, and impactful.

Rules:
- Start with a strong, unique action verb.
- Include a measurable outcome (number, percentage, time, or scale) if one can be inferred from the original.
- Keep to 1-2 lines maximum.
- Do NOT fabricate metrics — only improve language and structure.
- Do NOT use EM dashes or EN dashes.
- Return ONLY a JSON object: { "improved": "...", "explanation": "..." }`;

  const user = `Original bullet: "${bullet}"${context ? `\nContext (role/company): ${context}` : ''}

Return the improved bullet as JSON.`;

  return { system, user };
}

// ─── Cover letter generation ──────────────────────────────────────────────────

export function generateCoverLetterPrompt(profileJson, jdText, companyName = '') {
  const system = `You are a professional cover letter writer. Write a concise, human-sounding cover letter (4 paragraphs, 250-300 words total).

Rules:
- Use ONLY information from the provided profile. NEVER fabricate.
- Paragraph 1 (1-2 lines): Role and company, why strong fit. No clichés ("excited to apply", "thrilled", "perfect fit").
- Paragraph 2 (3-4 lines): 2-3 key strengths matching the JD with verified metrics from the profile.
- Paragraph 3 (2-3 lines): Specific things about the company that genuinely resonate.
- Paragraph 4 (1-2 lines): Confident close, offer to discuss.
- No EM dashes or EN dashes. Use % for percentages.
- Return ONLY a JSON object: { "coverLetter": "full text with newlines as \\n" }`;

  const user = `Profile:
${profileJson}

Job Description:
${jdText}
${companyName ? `\nCompany Name: ${companyName}` : ''}

Write the cover letter following all rules.`;

  return { system, user };
}

// ─── Summary generation ───────────────────────────────────────────────────────

export function generateSummaryPrompt(profileJson, jdText = '') {
  const system = `You are an expert resume writer. Write a Professional Summary as exactly 4 bullet points.

Rules:
- Use ONLY information from the provided profile.
- Bullet 1: Years of experience + role identity (e.g. "Senior QA Engineer with 8 years...")
- Bullet 2: Major strengths aligned to ${jdText ? 'the job description' : 'the candidate\'s background'}
- Bullet 3: Key improvements delivered with metrics (verified from profile)
- Bullet 4: Why fit for the team or domain
- Direct, natural tone. No clichés ("passionate", "hardworking", "highly motivated").
- No EM dashes or EN dashes.
- Return ONLY a JSON object: { "summary": ["bullet1", "bullet2", "bullet3", "bullet4"] }`;

  const user = `Profile:
${profileJson}
${jdText ? `\nJob Description:\n${jdText}` : ''}

Generate the 4-bullet professional summary.`;

  return { system, user };
}

// ─── ATS gap analysis ─────────────────────────────────────────────────────────

export function atsGapPrompt(resumeMarkdown, jdText) {
  const system = `You are an ATS optimization expert. Analyze a resume against a job description and provide a structured gap analysis.

Rules:
- Identify keywords in the JD not present in the resume.
- Group findings by priority: Critical (must-have), Important (nice-to-have).
- Suggest specific resume sections where each keyword should be added.
- Return ONLY a JSON object:
  {
    "score": { "estimate": 0, "rationale": "" },
    "critical": [{ "keyword": "", "suggestedSection": "", "insertionHint": "" }],
    "important": [{ "keyword": "", "suggestedSection": "" }],
    "strengths": []
  }`;

  const user = `Job Description:
${jdText}

Resume:
${resumeMarkdown}

Provide the ATS gap analysis.`;

  return { system, user };
}
