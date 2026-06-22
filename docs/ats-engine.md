# ATS Engine

The ATS (Applicant Tracking System) engine scores how well your resume matches a job description. It lives in [`src/features/ats/scorer.js`](../src/features/ats/scorer.js).

---

## Architecture Overview

```
Job Description Text
       │
       ▼
  extractKeywords(jdText)
       │ jdKeywords[]
       ▼
  calculateATSScore(jdKeywords, resumeKeywords, resumeFullText)
       │
       ├─ Exact match
       ├─ Synonym match
       ├─ Partial match
       ├─ Context / placement scoring
       ├─ Seniority alignment
       └─ Importance boost
       │
       ▼
  { score, totalMatched, totalExpected,
    matchedDetails, missingDetails,
    components, importanceBoost, weakPlacementPenalty }
```

---

## API

### `extractKeywords(text): Keyword[]`

Parses a block of text into a deduplicated array of keywords with metadata.

```js
import { extractKeywords } from './src/features/ats/scorer.js';

const keywords = extractKeywords('Senior QA Engineer with Selenium and Java');
// [
//   { keyword: 'selenium', importance: 'high', frequency: 1 },
//   { keyword: 'java',     importance: 'high', frequency: 1 },
//   ...
// ]
```

**Importance levels:** `critical` › `high` › `medium` › `low`

- `critical` — exact matches for specific tools in `SPECIFIC_TOOLS` set (e.g., `selenium`, `playwright`)
- `high` — rare technical terms in `RARE_TERMS` set (e.g., `kubernetes`, `graphql`)
- `medium` — multi-word phrases (e.g., `test automation`)
- `low` — general industry terms

Common English words in `COMMON_WORDS` are filtered out.

---

### `getVariations(keyword): string[]`

Returns synonym/alias variations for a keyword. Powers the synonym matching step.

```js
getVariations('kubernetes') // ['k8s']
getVariations('k8s')        // ['kubernetes']
getVariations('ci/cd')      // ['cicd', 'continuous integration', 'continuous delivery']
```

---

### `parseSections(resumeText): SectionMap`

Splits a resume into named sections for placement-aware scoring.

```js
const sections = parseSections(resumeText);
// {
//   summary: 'lowercased summary content...',
//   experience: 'lowercased experience content...',
//   skills: 'lowercased skills content...',
//   education: '...',
//   certifications: '...',
//   projects: '...',
// }
```

**Section name aliases recognised:**

| Canonical | Also matches |
|-----------|-------------|
| `experience` | Work History, Employment, Career History |
| `skills` | Technical Skills, Core Skills, Core Competencies |
| `certifications` | Licenses |
| `projects` | Key Projects, Side Projects |

---

### `calculateATSScore(jdKeywords, resumeKeywords, resumeFullText): ScoreResult`

The main scoring function. Runs all scoring phases and returns a full breakdown.

```js
const jdKw     = extractKeywords(jobDescriptionText);
const resumeKw = extractKeywords(resumeText);
const result   = calculateATSScore(jdKw, resumeKw, resumeText);

console.log(result.score);           // 0–100
console.log(result.matchedDetails);  // array of matched keywords with matchType
console.log(result.missingDetails);  // array of unmatched JD keywords
```

---

## Scoring Phases

### 1. Exact Match
Compares normalised keyword strings directly. Weight: highest.

### 2. Synonym Match
Uses `getVariations()` to check if a JD keyword's synonym appears in the resume. Weight: slightly lower than exact.

### 3. Partial Match
Multi-word JD phrases where individual component words appear in the resume. Weight: lower.

### 4. Context / Placement Score
Keywords found in the **Professional Experience** section receive a higher context score than those found only in Skills or Education.

### 5. Seniority Alignment
Compares years-of-experience mentions between JD and resume using `extractYears()` heuristics. A senior JD matched against a senior resume profile receives a bonus.

### 6. Importance Boost
Keywords flagged as `critical` or `high` importance contribute an additional `importanceBoost` to the final score.

### 7. Weak Placement Penalty
If a keyword is matched only in the header or certification section (low-signal areas), a small `weakPlacementPenalty` is applied.

---

## Keyword Libraries

Industry-specific keyword libraries are stored in `src/data/keywords/`. Each JSON file follows this schema:

```json
{
  "industry": "quality-engineering",
  "version": "1.0.0",
  "keywords": [
    { "term": "selenium",   "aliases": ["selenium webdriver"], "importance": "critical" },
    { "term": "playwright", "aliases": [],                     "importance": "critical" }
  ]
}
```

Register new libraries in `src/data/keywords/index.js`:

```js
export const LIBRARIES = {
  'quality-engineering': () => import('./quality-engineering.json', { assert: { type: 'json' } }),
  'your-industry':       () => import('./your-industry.json',       { assert: { type: 'json' } }),
};
```

---

## Testing

ATS tests live in `tests/ats/scorer.test.js`. Any change to `src/features/ats/` must maintain test coverage. Run:

```bash
npm test -- tests/ats/scorer.test.js --coverage
```
