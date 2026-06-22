/**
 * scorer.js — ATS scoring engine (pure functions, no DOM dependencies).
 * Extracted from app.js for testability and reuse.
 *
 * Usage:
 *   import { extractKeywords, calculateATSScore } from './scorer.js';
 *   const jdKw = extractKeywords(jdText);
 *   const result = calculateATSScore(jdKw, extractKeywords(resumeText), resumeText);
 */

// ─── Keyword extraction ───────────────────────────────────────────────────────

const KEYWORD_PATTERNS = [
  /\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g,
  /\b(?:selenium|playwright|cypress|appium|jest|mocha|jasmine|testng|junit|cucumber)\b/gi,
  /\b(?:java|python|kotlin|javascript|typescript|golang|ruby|scala|rust|c\+\+|c#)\b/gi,
  /\b(?:aws|gcp|azure|kubernetes|k8s|docker|terraform|ansible|jenkins|github actions)\b/gi,
  /\b(?:react|angular|vue|node\.?js|spring|django|fastapi|graphql|grpc)\b/gi,
  /\b(?:sql|nosql|postgresql|mysql|mongodb|redis|kafka|elasticsearch|dynamodb)\b/gi,
  /\b(?:agile|scrum|kanban|ci\/cd|devops|sre|tdd|bdd|ddd)\b/gi,
  /\b(?:rest\s+api|api\s+testing|test\s+automation|quality\s+assurance|machine\s+learning|deep\s+learning)\b/gi,
];

const SYNONYM_MAP = {
  'rest api': ['rest', 'restful', 'rest apis', 'restful api'],
  'java': ['j2ee', 'java/j2ee', 'core java', 'java se'],
  'selenium': ['selenium webdriver', 'webdriver'],
  'rest assured': ['restassured', 'rest-assured'],
  'ci/cd': ['ci cd', 'cicd', 'continuous integration', 'continuous delivery', 'continuous deployment'],
  'kubernetes': ['k8s', 'kube'],
  'test automation': ['automated testing', 'automation testing', 'test automation framework'],
  'microservices': ['micro services', 'micro-services'],
  'docker': ['containerization', 'docker container'],
  'azure devops': ['ado', 'azure pipelines'],
  'github actions': ['github action', 'gh actions'],
  'agile': ['agile methodology', 'agile scrum', 'scrum'],
  'sql': ['structured query language', 'mysql', 'postgresql', 'sql server'],
  'qa': ['quality assurance', 'software quality assurance'],
};

const RARE_TERMS = new Set([
  'api contract testing', 'chaos engineering', 'contract testing', 'shift-left testing',
  'quality as code', 'mcp protocol', 'prompt engineering', 'rlhf', 'rag',
  'retrieval augmented generation', 'mlops', 'observability', 'sre',
]);
const SPECIFIC_TOOLS = new Set([
  'selenium', 'junit', 'rest assured', 'jenkins', 'docker', 'kubernetes',
  'testng', 'postman', 'azure devops', 'playwright', 'appium', 'cypress',
]);
const COMMON_WORDS = new Set([
  'testing', 'qa', 'test', 'quality', 'experience', 'work', 'agile', 'team',
]);

/**
 * Extract and score keywords from a text (JD or resume).
 * @param {string} text
 * @returns {{ keywords: string[], frequency: Object, importance: Object }}
 */
export function extractKeywords(text) {
  const lower = text.toLowerCase();
  const allKw = new Set();
  const freq = {};
  const importance = {};

  // Pattern-based extraction
  for (const pattern of KEYWORD_PATTERNS) {
    const matches = text.match(pattern) || [];
    for (const m of matches) {
      const kw = m.toLowerCase().trim();
      if (kw.length > 1) {
        allKw.add(kw);
        freq[kw] = (freq[kw] || 0) + 1;
      }
    }
  }

  // Phrase-based extraction
  const PHRASES = [
    'test automation', 'qa strategy', 'automation framework', 'ci/cd pipeline',
    'quality assurance', 'rest api', 'api testing', 'performance testing',
    'regression testing', 'integration testing', 'test coverage', 'team leadership',
    'automation strategy', 'test strategy', 'api contract testing', 'microservices',
    'kubernetes', 'docker', 'azure devops', 'continuous testing', 'quality standards',
  ];
  for (const phrase of PHRASES) {
    if (lower.includes(phrase)) {
      allKw.add(phrase);
      freq[phrase] = (lower.match(new RegExp(phrase, 'g')) || []).length;
    }
  }

  // Calculate importance per keyword
  const textLen = lower.length;
  for (const kw of allKw) {
    const f = freq[kw] || 1;
    const repetitionScore = f === 1 ? 0.3 : f === 2 ? 0.6 : 1.0;

    const firstIdx = lower.indexOf(kw);
    let placementScore;
    if (firstIdx < textLen * 0.15) placementScore = 1.0;
    else if (firstIdx < textLen * 0.40) placementScore = 0.8;
    else if (firstIdx < textLen * 0.70) placementScore = 0.5;
    else placementScore = 0.3;

    const rarityScore = RARE_TERMS.has(kw) ? 1.0
      : SPECIFIC_TOOLS.has(kw) ? 0.7
      : COMMON_WORDS.has(kw) ? 0.3
      : 0.5;

    importance[kw] = (repetitionScore * 0.4) + (placementScore * 0.35) + (rarityScore * 0.25);
  }

  const keywords = Array.from(allKw).sort((a, b) => (importance[b] || 0) - (importance[a] || 0));
  return { keywords, frequency: freq, importance };
}

/**
 * Get all synonym variants for a keyword.
 * @param {string} kw
 * @returns {string[]}
 */
export function getVariations(kw) {
  return [kw, ...(SYNONYM_MAP[kw] || [])];
}

/**
 * Parse a resume text into named sections.
 * @param {string} resumeText
 * @returns {{ summary: string, skills: string, experience: string, projects: string, certifications: string }}
 */
export function parseSections(resumeText) {
  const t = resumeText.toLowerCase();
  const sections = { summary: '', skills: '', experience: '', projects: '', certifications: '' };

  // Split on lines that are H2 headings (## Heading)
  const blocks = t.split(/\n(?=## )/);
  for (const block of blocks) {
    if (/^## (?:professional summary|summary|profile)/i.test(block)) {
      sections.summary = block;
    } else if (/^## (?:technical skills|core competencies|skills)/i.test(block)) {
      sections.skills = block;
    } else if (/^## (?:professional experience|experience|work history)/i.test(block)) {
      sections.experience = block;
    } else if (/^## (?:projects|key projects)/i.test(block)) {
      sections.projects = block;
    } else if (/^## certifications?/i.test(block)) {
      sections.certifications = block;
    }
  }
  return sections;
}

/**
 * Calculate the full ATS score.
 * @param {{ keywords: string[], frequency: Object, importance: Object }} jdKeywords
 * @param {{ keywords: string[], frequency: Object, importance: Object }} resumeKeywords
 * @param {string} resumeFullText
 * @returns {ATSResult}
 */
export function calculateATSScore(jdKeywords, resumeKeywords, resumeFullText) {
  const resumeSet = new Set(resumeKeywords.keywords.map(k => k.toLowerCase()));
  const resumeLower = resumeFullText.toLowerCase();
  const sections = parseSections(resumeFullText);

  const matchedDetails = [];
  const missingDetails = [];

  for (const kw of jdKeywords.keywords) {
    const k = kw.toLowerCase();
    const importance = jdKeywords.importance[k] || 0.5;
    let matchType = null;
    let matchScore = 0;

    // Exact match
    if (resumeSet.has(k) || resumeLower.includes(k)) {
      matchType = 'exact';
      matchScore = 1.0;
    }

    // Synonym match
    if (!matchType) {
      for (const v of getVariations(k)) {
        if (resumeLower.includes(v.toLowerCase())) {
          matchType = 'synonym';
          matchScore = 0.9;
          break;
        }
      }
    }

    // Partial match
    if (!matchType) {
      const parts = k.split(/[\s\-\/]+/);
      const hits = parts.filter(p => p.length > 2 && resumeLower.includes(p)).length;
      if (hits >= parts.length * 0.5 && hits > 0) {
        matchType = 'partial';
        matchScore = 0.6 + (hits / parts.length) * 0.3;
      }
    }

    if (matchType) {
      const placements = [];
      if (sections.summary.includes(k)) placements.push('summary');
      if (sections.skills.includes(k)) placements.push('skills');
      if (sections.experience.includes(k)) placements.push('experience');
      if (sections.projects.includes(k)) placements.push('projects');
      let freq = 0;
      for (const p of k.split(/[\s\-\/]+/)) {
        if (p.length > 2) freq = Math.max(freq, (resumeLower.match(new RegExp(p, 'gi')) || []).length);
      }
      matchedDetails.push({ keyword: kw, importance, matchType, matchScore, placements, frequency: Math.max(1, freq) });
    } else {
      missingDetails.push({ keyword: kw, importance });
    }
  }

  // Score components
  const totalImportance = jdKeywords.keywords.reduce((s, k) => s + (jdKeywords.importance[k.toLowerCase()] || 0.5), 0);
  const matchedImportance = matchedDetails.reduce((s, m) => s + m.importance * m.matchScore, 0);
  const skillMatchRate = totalImportance > 0 ? (matchedImportance / totalImportance) * 100 : 0;

  const avgJDFreq = jdKeywords.keywords.length > 0
    ? Object.values(jdKeywords.frequency).reduce((a, b) => a + b, 0) / jdKeywords.keywords.length : 1;
  const avgResumeFreq = matchedDetails.length > 0
    ? matchedDetails.reduce((s, m) => s + Math.min(m.frequency, 3), 0) / matchedDetails.length : 0;
  const frequencyScore = Math.min(100, (avgResumeFreq / Math.max(avgJDFreq, 1)) * 100);

  let contextScore = 0;
  const weakPlacements = [];
  for (const m of matchedDetails) {
    let w = 0;
    if (m.placements.includes('experience')) w = 1.0;
    else if (m.placements.includes('summary') || m.placements.includes('projects')) w = 0.7;
    else if (m.placements.includes('skills')) {
      w = 0.3;
      if (m.placements.length === 1) weakPlacements.push(m.keyword);
    }
    contextScore += w * m.importance;
  }
  contextScore = totalImportance > 0 ? (contextScore / totalImportance) * 100 : 0;

  // Seniority alignment
  const rYears = extractYears(resumeFullText);
  const jYears = extractYears(jdKeywords.keywords.join(' '));
  const rLevel = seniorityLevel(rYears, resumeFullText);
  const jLevel = seniorityLevel(jYears, jdKeywords.keywords.join(' '));
  const diff = Math.abs(rLevel - jLevel);
  const seniorityScore = diff === 0 ? 100 : diff === 1 ? 70 : 40;

  const base = (skillMatchRate * 0.4) + (frequencyScore * 0.2) + (contextScore * 0.3) + (seniorityScore * 0.1);
  const criticalMatched = matchedDetails.filter(m => m.importance >= 0.75).length;
  const highMatched = matchedDetails.filter(m => m.importance >= 0.5 && m.importance < 0.75).length;
  const importanceBoost = Math.min(20, (criticalMatched * 3) + (highMatched * 1));
  const weakPlacementPenalty = Math.min(10, weakPlacements.length * 2);
  const score = Math.min(100, Math.max(0, Math.round(base + importanceBoost - weakPlacementPenalty)));

  return {
    score,
    components: {
      skillMatchRate: Math.round(skillMatchRate * 0.4),
      frequencyScore: Math.round(frequencyScore * 0.2),
      contextScore: Math.round(contextScore * 0.3),
      seniorityScore: Math.round(seniorityScore * 0.1),
    },
    importanceBoost,
    weakPlacementPenalty,
    matched: matchedDetails.map(m => m.keyword),
    matchedDetails,
    missing: missingDetails.map(m => m.keyword),
    missingDetails,
    weakPlacements,
    totalJDKeywords: jdKeywords.keywords.length,
    totalMatched: matchedDetails.length,
    totalMissing: missingDetails.length,
  };
}

function extractYears(text) {
  const m = text.match(/(\d+)\+?\s*years?/i);
  return m ? parseInt(m[1]) : 5;
}

function seniorityLevel(years, text) {
  const t = (text || '').toLowerCase();
  if (t.includes('lead') || t.includes('principal') || t.includes('architect') || years >= 10) return 4;
  if (t.includes('senior') || years >= 6) return 3;
  if (t.includes('mid') || years >= 3) return 2;
  return 1;
}

/**
 * @typedef {Object} ATSResult
 * @property {number} score - 0–100
 * @property {Object} components - skillMatchRate, frequencyScore, contextScore, seniorityScore
 * @property {number} importanceBoost
 * @property {number} weakPlacementPenalty
 * @property {string[]} matched
 * @property {Object[]} matchedDetails
 * @property {string[]} missing
 * @property {Object[]} missingDetails
 * @property {string[]} weakPlacements
 * @property {number} totalJDKeywords
 * @property {number} totalMatched
 * @property {number} totalMissing
 */
