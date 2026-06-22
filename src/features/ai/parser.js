/**
 * parser.js — Parse and validate AI responses for each action type.
 *
 * All functions accept the raw string from the AI and return a typed result.
 * Throws descriptive errors if the response cannot be parsed.
 */

// ─── Shared JSON extractor ────────────────────────────────────────────────────

/**
 * Extract JSON from an AI response (handles markdown fences + raw JSON).
 * @param {string} raw
 * @returns {object}
 */
export function extractJSON(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('Empty AI response');

  // Strip markdown code fences
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) text = fence[1].trim();

  // Find first { and last } to extract the JSON object
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in AI response');
  text = text.slice(start, end + 1);

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
  }
}

// ─── Paste & Parse ────────────────────────────────────────────────────────────

/**
 * Parse a Paste & Parse AI response into a profile object.
 * @param {string} raw
 * @returns {ProfileObject}
 */
export function parsePasteResponse(raw) {
  const data = extractJSON(raw);

  // Basic structural validation
  if (!data.identity || typeof data.identity !== 'object') {
    throw new Error('Parsed profile missing required "identity" field');
  }

  // Sanitise: ensure required arrays exist
  const safe = {
    identity:       { name: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '', ...data.identity },
    summary:        typeof data.summary === 'string' ? data.summary : '',
    experience:     Array.isArray(data.experience) ? data.experience.map(_sanitiseExperience) : [],
    skills:         data.skills || { core: [], technical: [] },
    education:      Array.isArray(data.education) ? data.education : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    projects:       Array.isArray(data.projects) ? data.projects : [],
    achievements:   Array.isArray(data.achievements) ? data.achievements : [],
  };

  return safe;
}

function _sanitiseExperience(exp) {
  return {
    title:     exp.title     || '',
    company:   exp.company   || '',
    location:  exp.location  || '',
    startDate: exp.startDate || '',
    endDate:   exp.endDate   || '',
    current:   exp.current   === true,
    bullets:   Array.isArray(exp.bullets) ? exp.bullets.filter(b => typeof b === 'string') : [],
  };
}

// ─── Tailoring ────────────────────────────────────────────────────────────────

/**
 * Parse a tailoring AI response.
 * @param {string} raw
 * @returns {{ summary: string[], tailoredBullets: object[], addedKeywords: string[], atsScore: object }}
 */
export function parseTailorResponse(raw) {
  const data = extractJSON(raw);

  if (!Array.isArray(data.summary) || data.summary.length !== 4) {
    throw new Error('Tailoring response must contain "summary" array with exactly 4 bullets');
  }

  return {
    summary:        data.summary.map(s => String(s)),
    tailoredBullets: Array.isArray(data.tailoredBullets) ? data.tailoredBullets : [],
    addedKeywords:  Array.isArray(data.addedKeywords) ? data.addedKeywords : [],
    atsScore:       data.atsScore || { before: 0, after: 0 },
  };
}

// ─── Bullet improvement ───────────────────────────────────────────────────────

/**
 * Parse a bullet improvement AI response.
 * @param {string} raw
 * @returns {{ improved: string, explanation: string }}
 */
export function parseBulletResponse(raw) {
  const data = extractJSON(raw);
  if (!data.improved || typeof data.improved !== 'string') {
    throw new Error('Bullet response missing "improved" field');
  }
  return {
    improved:    data.improved.trim(),
    explanation: data.explanation || '',
  };
}

// ─── Cover letter ─────────────────────────────────────────────────────────────

/**
 * Parse a cover letter AI response.
 * @param {string} raw
 * @returns {{ coverLetter: string }}
 */
export function parseCoverLetterResponse(raw) {
  const data = extractJSON(raw);
  if (!data.coverLetter || typeof data.coverLetter !== 'string') {
    throw new Error('Cover letter response missing "coverLetter" field');
  }
  return { coverLetter: data.coverLetter.trim() };
}

// ─── Summary generation ───────────────────────────────────────────────────────

/**
 * Parse a summary generation AI response.
 * @param {string} raw
 * @returns {{ summary: string[] }}
 */
export function parseSummaryResponse(raw) {
  const data = extractJSON(raw);
  if (!Array.isArray(data.summary) || data.summary.length !== 4) {
    throw new Error('Summary response must contain "summary" array with exactly 4 bullets');
  }
  return { summary: data.summary.map(s => String(s)) };
}

// ─── ATS gap analysis ─────────────────────────────────────────────────────────

/**
 * Parse an ATS gap analysis AI response.
 * @param {string} raw
 * @returns {{ score: object, critical: object[], important: object[], strengths: string[] }}
 */
export function parseATSGapResponse(raw) {
  const data = extractJSON(raw);
  return {
    score:     data.score     || { estimate: 0, rationale: '' },
    critical:  Array.isArray(data.critical)  ? data.critical  : [],
    important: Array.isArray(data.important) ? data.important : [],
    strengths: Array.isArray(data.strengths) ? data.strengths : [],
  };
}
