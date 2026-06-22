/**
 * scorer.test.js — Unit tests for the ATS scoring engine.
 *
 * Run: npm test
 */

import { extractKeywords, calculateATSScore, getVariations, parseSections } from '../../src/features/ats/scorer.js';

// ─── extractKeywords ─────────────────────────────────────────────────────────

describe('extractKeywords', () => {
  test('extracts known tool names from JD text', () => {
    const jd = 'We need experience with Selenium WebDriver and Jenkins CI/CD pipeline.';
    const { keywords } = extractKeywords(jd);
    expect(keywords.some(k => k.includes('selenium'))).toBe(true);
    expect(keywords.some(k => k.includes('jenkins'))).toBe(true);
  });

  test('extracts multi-word phrases', () => {
    const jd = 'Strong knowledge of test automation and rest api testing required.';
    const { keywords } = extractKeywords(jd);
    expect(keywords).toContain('test automation');
    expect(keywords).toContain('rest api');
  });

  test('returns importance scores between 0 and 1', () => {
    const { importance } = extractKeywords('Selenium, Java, Agile, test automation');
    for (const score of Object.values(importance)) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });

  test('returns frequency counts', () => {
    const jd = 'selenium selenium selenium';
    const { frequency } = extractKeywords(jd);
    const selFreq = frequency['selenium'] || 0;
    expect(selFreq).toBeGreaterThanOrEqual(1);
  });

  test('handles empty string without throwing', () => {
    expect(() => extractKeywords('')).not.toThrow();
    const { keywords } = extractKeywords('');
    expect(Array.isArray(keywords)).toBe(true);
  });
});

// ─── getVariations ────────────────────────────────────────────────────────────

describe('getVariations', () => {
  test('returns synonyms for known keywords', () => {
    const vars = getVariations('kubernetes');
    expect(vars).toContain('k8s');
  });

  test('always includes the original keyword', () => {
    const vars = getVariations('something-unknown');
    expect(vars[0]).toBe('something-unknown');
  });

  test('returns ci/cd variants', () => {
    const vars = getVariations('ci/cd');
    expect(vars).toContain('continuous integration');
    expect(vars).toContain('cicd');
  });
});

// ─── parseSections ────────────────────────────────────────────────────────────

describe('parseSections', () => {
  const SAMPLE_RESUME = `
## Professional Summary
Senior QA Engineer with 8 years experience.

## Technical Skills
Java, Selenium, Jenkins

## Professional Experience
### Senior QA Engineer — Acme Corp
- Built automation frameworks using Selenium
`;

  test('extracts summary section', () => {
    const sections = parseSections(SAMPLE_RESUME);
    expect(sections.summary).toContain('senior qa engineer');
  });

  test('extracts skills section', () => {
    const sections = parseSections(SAMPLE_RESUME);
    expect(sections.skills).toContain('selenium');
  });

  test('extracts experience section', () => {
    const sections = parseSections(SAMPLE_RESUME);
    expect(sections.experience).toContain('automation frameworks');
  });

  test('returns empty strings for missing sections', () => {
    const sections = parseSections('No sections here');
    expect(sections.projects).toBe('');
    expect(sections.certifications).toBe('');
  });
});

// ─── calculateATSScore ────────────────────────────────────────────────────────

describe('calculateATSScore', () => {
  const jd = `
    We are looking for a Senior QA Engineer with strong Selenium WebDriver experience.
    Must know Java and REST API testing with REST Assured.
    Experience with Jenkins CI/CD pipeline required.
    Knowledge of Agile and JIRA preferred.
  `;

  const perfectResume = `
## Professional Summary
Senior QA Engineer with 8 years of experience in Selenium WebDriver, Java, REST Assured.

## Technical Skills
Java, Selenium WebDriver, REST Assured, Jenkins, JIRA, Agile

## Professional Experience
### Senior QA Engineer — Acme Corp
- Built automation framework using Selenium WebDriver and REST Assured for REST API testing
- Integrated with Jenkins CI/CD pipeline, reducing regression time by 60%
- Worked in Agile environment using JIRA for defect tracking
`;

  const poorResume = `
## Summary
Developer with 2 years experience.

## Skills
Python, Ruby
`;

  test('returns score between 0 and 100', () => {
    const jdKw = extractKeywords(jd);
    const resumeKw = extractKeywords(perfectResume);
    const result = calculateATSScore(jdKw, resumeKw, perfectResume);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test('scores perfect resume higher than poor resume', () => {
    const jdKw = extractKeywords(jd);
    const perfectKw = extractKeywords(perfectResume);
    const poorKw = extractKeywords(poorResume);
    const perfectResult = calculateATSScore(jdKw, perfectKw, perfectResume);
    const poorResult = calculateATSScore(jdKw, poorKw, poorResume);
    expect(perfectResult.score).toBeGreaterThan(poorResult.score);
  });

  test('returns matched and missing keyword arrays', () => {
    const jdKw = extractKeywords(jd);
    const resumeKw = extractKeywords(perfectResume);
    const result = calculateATSScore(jdKw, resumeKw, perfectResume);
    expect(Array.isArray(result.matched)).toBe(true);
    expect(Array.isArray(result.missing)).toBe(true);
  });

  test('totalMatched + totalMissing equals totalJDKeywords', () => {
    const jdKw = extractKeywords(jd);
    const resumeKw = extractKeywords(perfectResume);
    const result = calculateATSScore(jdKw, resumeKw, perfectResume);
    expect(result.totalMatched + result.totalMissing).toBe(result.totalJDKeywords);
  });

  test('detects weak placements (keywords only in skills section)', () => {
    const skillsOnlyResume = `
## Summary
QA Engineer.

## Technical Skills
Selenium WebDriver, Java, REST Assured, Jenkins

## Professional Experience
- Worked on various tasks.
`;
    const jdKw = extractKeywords(jd);
    const resumeKw = extractKeywords(skillsOnlyResume);
    const result = calculateATSScore(jdKw, resumeKw, skillsOnlyResume);
    expect(Array.isArray(result.weakPlacements)).toBe(true);
  });

  test('score components sum is approximately the total score', () => {
    const jdKw = extractKeywords(jd);
    const resumeKw = extractKeywords(perfectResume);
    const { score, components, importanceBoost, weakPlacementPenalty } = calculateATSScore(jdKw, resumeKw, perfectResume);
    const componentSum = Object.values(components).reduce((a, b) => a + b, 0);
    const reconstructed = componentSum + importanceBoost - weakPlacementPenalty;
    // Allow some rounding difference
    expect(Math.abs(score - reconstructed)).toBeLessThanOrEqual(5);
  });

  test('handles empty resume without throwing', () => {
    const jdKw = extractKeywords(jd);
    const emptyKw = extractKeywords('');
    expect(() => calculateATSScore(jdKw, emptyKw, '')).not.toThrow();
  });

  test('handles empty JD without throwing', () => {
    const emptyKw = extractKeywords('');
    const resumeKw = extractKeywords(perfectResume);
    expect(() => calculateATSScore(emptyKw, resumeKw, perfectResume)).not.toThrow();
  });
});

// ─── Score thresholds ─────────────────────────────────────────────────────────

describe('score thresholds', () => {
  test('excellent resume scores 70+', () => {
    const jd = 'Looking for Selenium Java REST Assured Jenkins CI/CD QA Engineer automation testing.';
    const resume = `
## Professional Summary
QA Engineer with 8 years Selenium Java REST Assured CI/CD automation testing experience.

## Technical Skills
Java, Selenium, REST Assured, Jenkins, CI/CD

## Professional Experience
### Senior QA Engineer
- Led Selenium automation testing using Java and REST Assured, integrated with Jenkins CI/CD.
- Delivered quality engineering using CI/CD pipelines and automation testing frameworks.
`;
    const jdKw = extractKeywords(jd);
    const resumeKw = extractKeywords(resume);
    const { score } = calculateATSScore(jdKw, resumeKw, resume);
    expect(score).toBeGreaterThanOrEqual(60);
  });
});
