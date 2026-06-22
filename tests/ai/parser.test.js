/**
 * parser.test.js — Unit tests for the AI response parser.
 */

import {
  extractJSON,
  parsePasteResponse,
  parseTailorResponse,
  parseBulletResponse,
  parseCoverLetterResponse,
  parseSummaryResponse,
  parseATSGapResponse,
} from '../../src/features/ai/parser.js';

// ─── extractJSON ──────────────────────────────────────────────────────────────

describe('extractJSON', () => {
  test('parses plain JSON', () => {
    const result = extractJSON('{"key": "value"}');
    expect(result.key).toBe('value');
  });

  test('strips markdown json fences', () => {
    const raw = '```json\n{"key": "value"}\n```';
    const result = extractJSON(raw);
    expect(result.key).toBe('value');
  });

  test('strips markdown fences without language tag', () => {
    const raw = '```\n{"key": "value"}\n```';
    const result = extractJSON(raw);
    expect(result.key).toBe('value');
  });

  test('extracts JSON from surrounding prose', () => {
    const raw = 'Here is the result:\n{"key": "value"}\nThat is the JSON.';
    const result = extractJSON(raw);
    expect(result.key).toBe('value');
  });

  test('throws on empty input', () => {
    expect(() => extractJSON('')).toThrow();
    expect(() => extractJSON(null)).toThrow();
  });

  test('throws when no JSON object found', () => {
    expect(() => extractJSON('No JSON here at all')).toThrow('No JSON object found');
  });

  test('throws on malformed JSON', () => {
    expect(() => extractJSON('{key: value}')).toThrow();
  });
});

// ─── parsePasteResponse ───────────────────────────────────────────────────────

describe('parsePasteResponse', () => {
  const VALID = JSON.stringify({
    identity: { name: 'Alex Rivera', email: 'alex@example.com', linkedin: '', github: '', phone: '', location: '', portfolio: '' },
    summary: 'Senior engineer with 8 years experience.',
    experience: [
      { title: 'Senior Engineer', company: 'Acme', location: 'NY', startDate: 'Jan 2020', endDate: '', current: true, bullets: ['Built frameworks'] }
    ],
    skills: { core: [{ label: 'Automation', items: ['Selenium'] }], technical: ['Java'] },
    education: [{ degree: 'BE', field: 'CS', institution: 'State Univ', year: '2016' }],
    certifications: [],
    projects: [],
    achievements: [],
  });

  test('parses valid response', () => {
    const result = parsePasteResponse(VALID);
    expect(result.identity.name).toBe('Alex Rivera');
    expect(result.experience).toHaveLength(1);
    expect(result.experience[0].bullets).toContain('Built frameworks');
  });

  test('fills missing optional fields with defaults', () => {
    const minimal = JSON.stringify({ identity: { name: 'Test' } });
    const result = parsePasteResponse(minimal);
    expect(Array.isArray(result.experience)).toBe(true);
    expect(Array.isArray(result.certifications)).toBe(true);
    expect(result.identity.email).toBe('');
  });

  test('throws when identity is missing', () => {
    const bad = JSON.stringify({ summary: 'No identity' });
    expect(() => parsePasteResponse(bad)).toThrow('identity');
  });

  test('sanitises experience bullets to strings only', () => {
    const withBadBullets = JSON.stringify({
      identity: { name: 'A' },
      experience: [{ title: 'Dev', company: 'X', bullets: ['Good bullet', 42, null, 'Another'] }],
    });
    const result = parsePasteResponse(withBadBullets);
    expect(result.experience[0].bullets).toEqual(['Good bullet', 'Another']);
  });
});

// ─── parseTailorResponse ──────────────────────────────────────────────────────

describe('parseTailorResponse', () => {
  const VALID = JSON.stringify({
    summary: ['Bullet 1', 'Bullet 2', 'Bullet 3', 'Bullet 4'],
    tailoredBullets: [{ section: 'EPAM', original: 'Old', tailored: 'New' }],
    addedKeywords: ['Selenium', 'CI/CD'],
    atsScore: { before: 55, after: 78 },
  });

  test('parses valid tailor response', () => {
    const result = parseTailorResponse(VALID);
    expect(result.summary).toHaveLength(4);
    expect(result.atsScore.after).toBe(78);
    expect(result.addedKeywords).toContain('Selenium');
  });

  test('throws when summary does not have 4 bullets', () => {
    const bad = JSON.stringify({ summary: ['Only 1 bullet'] });
    expect(() => parseTailorResponse(bad)).toThrow('4 bullets');
  });

  test('returns empty arrays when optional fields missing', () => {
    const minimal = JSON.stringify({ summary: ['A', 'B', 'C', 'D'] });
    const result = parseTailorResponse(minimal);
    expect(Array.isArray(result.tailoredBullets)).toBe(true);
    expect(Array.isArray(result.addedKeywords)).toBe(true);
  });
});

// ─── parseBulletResponse ──────────────────────────────────────────────────────

describe('parseBulletResponse', () => {
  test('parses valid bullet response', () => {
    const raw = JSON.stringify({ improved: 'Led automation framework reducing cycle time by 40%', explanation: 'Added metric' });
    const result = parseBulletResponse(raw);
    expect(result.improved).toContain('40%');
  });

  test('throws when improved field missing', () => {
    const bad = JSON.stringify({ explanation: 'no improved field' });
    expect(() => parseBulletResponse(bad)).toThrow('"improved"');
  });
});

// ─── parseCoverLetterResponse ─────────────────────────────────────────────────

describe('parseCoverLetterResponse', () => {
  test('parses valid cover letter response', () => {
    const raw = JSON.stringify({ coverLetter: 'Dear Hiring Manager,\n\nThank you.\n\nBest regards,\nAlex' });
    const result = parseCoverLetterResponse(raw);
    expect(result.coverLetter).toContain('Dear Hiring Manager');
  });

  test('throws when coverLetter field missing', () => {
    const bad = JSON.stringify({ letter: 'wrong field name' });
    expect(() => parseCoverLetterResponse(bad)).toThrow('"coverLetter"');
  });
});

// ─── parseSummaryResponse ─────────────────────────────────────────────────────

describe('parseSummaryResponse', () => {
  test('parses valid summary response', () => {
    const raw = JSON.stringify({ summary: ['Bullet 1', 'Bullet 2', 'Bullet 3', 'Bullet 4'] });
    const result = parseSummaryResponse(raw);
    expect(result.summary).toHaveLength(4);
  });

  test('throws when summary has wrong length', () => {
    const bad = JSON.stringify({ summary: ['A', 'B', 'C'] });
    expect(() => parseSummaryResponse(bad)).toThrow('4 bullets');
  });
});

// ─── parseATSGapResponse ──────────────────────────────────────────────────────

describe('parseATSGapResponse', () => {
  test('parses valid ATS gap response', () => {
    const raw = JSON.stringify({
      score: { estimate: 62, rationale: 'Missing CI/CD keywords' },
      critical: [{ keyword: 'Kubernetes', suggestedSection: 'Technical Skills', insertionHint: 'Add to skills list' }],
      important: [{ keyword: 'Agile', suggestedSection: 'Experience' }],
      strengths: ['Selenium WebDriver', 'REST Assured'],
    });
    const result = parseATSGapResponse(raw);
    expect(result.score.estimate).toBe(62);
    expect(result.critical).toHaveLength(1);
    expect(result.strengths).toContain('Selenium WebDriver');
  });

  test('returns safe defaults on empty response', () => {
    const result = parseATSGapResponse('{}');
    expect(Array.isArray(result.critical)).toBe(true);
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(result.score.estimate).toBe(0);
  });
});
