/**
 * tests/cover-letter/scorer.test.js
 */

import {
    FORBIDDEN_PHRASES,
    countWords,
    scoreWordCount,
    detectForbiddenPhrases,
    scoreCoverLetterATS,
} from '../../src/features/cover-letter/scorer.js';

// ── countWords ───────────────────────────────────────────────────────────────

describe('countWords', () => {
    test('counts plain text words', () => {
        expect(countWords('Hello world this is a test')).toBe(6);
    });

    test('strips HTML tags', () => {
        expect(countWords('<p>Hello <strong>world</strong></p>')).toBe(2);
    });

    test('strips markdown headings', () => {
        // '# Title\n\nSome text here' → heading marker stripped → 'Title Some text here' = 4 words
        expect(countWords('# Title\n\nSome text here')).toBe(4);
    });

    test('strips markdown bold/italic', () => {
        expect(countWords('**Bold** and *italic* words')).toBe(4);
    });

    test('strips markdown links', () => {
        // Link is stripped entirely → 'and more' = 2 words
        expect(countWords('[Link text](http://example.com) and more')).toBe(2);
    });

    test('returns 0 for empty string', () => {
        expect(countWords('')).toBe(0);
    });

    test('returns 0 for null/undefined', () => {
        expect(countWords(null)).toBe(0);
        expect(countWords(undefined)).toBe(0);
    });

    test('handles multiple blank lines and spaces', () => {
        expect(countWords('  hello   world  \n\n  test  ')).toBe(3);
    });
});

// ── scoreWordCount ───────────────────────────────────────────────────────────

describe('scoreWordCount', () => {
    test('low for < 150 words', () => {
        expect(scoreWordCount(100)).toBe('low');
        expect(scoreWordCount(0)).toBe('low');
    });

    test('good for 150-300 words', () => {
        expect(scoreWordCount(150)).toBe('good');
        expect(scoreWordCount(250)).toBe('good');
        expect(scoreWordCount(300)).toBe('good');
    });

    test('amber for 301-350 words', () => {
        expect(scoreWordCount(301)).toBe('amber');
        expect(scoreWordCount(350)).toBe('amber');
    });

    test('red for > 350 words', () => {
        expect(scoreWordCount(351)).toBe('red');
        expect(scoreWordCount(500)).toBe('red');
    });
});

// ── detectForbiddenPhrases ───────────────────────────────────────────────────

describe('detectForbiddenPhrases', () => {
    test('detects a single forbidden phrase', () => {
        const hits = detectForbiddenPhrases('I am excited to apply for this role.');
        expect(hits.length).toBeGreaterThan(0);
        expect(hits[0].phrase).toBe('excited to apply');
    });

    test('is case-insensitive', () => {
        const hits = detectForbiddenPhrases('I am PASSIONATE ABOUT quality.');
        expect(hits.some(h => h.phrase === 'passionate about')).toBe(true);
    });

    test('includes context snippet', () => {
        const hits = detectForbiddenPhrases('I would be a perfect fit for this position.');
        const hit = hits.find(h => h.phrase === 'i would be a perfect fit');
        expect(hit).toBeDefined();
        expect(hit.context.length).toBeGreaterThan(10);
    });

    test('returns empty array for clean text', () => {
        const hits = detectForbiddenPhrases('I bring 10 years of automation expertise and measurable impact.');
        expect(hits).toHaveLength(0);
    });

    test('deduplicates repeated phrase', () => {
        const text = 'I am thrilled. Yes, I am thrilled again.';
        const hits = detectForbiddenPhrases(text);
        const count = hits.filter(h => h.phrase === 'i am thrilled').length;
        expect(count).toBe(1);
    });

    test('returns empty for empty string', () => {
        expect(detectForbiddenPhrases('')).toHaveLength(0);
    });

    test('FORBIDDEN_PHRASES list has at least 10 entries', () => {
        expect(FORBIDDEN_PHRASES.length).toBeGreaterThanOrEqual(10);
    });
});

// ── scoreCoverLetterATS ──────────────────────────────────────────────────────

describe('scoreCoverLetterATS', () => {
    const jd = `
        We are looking for a Senior SDET with experience in Selenium, Selenium automation,
        Java, Java frameworks, CI/CD pipelines, CI/CD integration, and test automation.
        The role requires test automation expertise and experience with CI/CD pipelines.
        Must have Selenium WebDriver and Java experience. Must have test automation skills.
    `;

    test('returns 0 for empty inputs', () => {
        expect(scoreCoverLetterATS('', jd).score).toBe(0);
        expect(scoreCoverLetterATS('text', '').score).toBe(0);
    });

    test('returns 100 when all keywords match', () => {
        const result = scoreCoverLetterATS(jd, jd);
        expect(result.score).toBe(100);
    });

    test('score is between 0 and 100', () => {
        const cl = 'I have experience with Selenium and Java for automation testing.';
        const result = scoreCoverLetterATS(cl, jd);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
    });

    test('matched array contains found keywords', () => {
        const cl = 'I have experience with selenium and java and test automation skills.';
        const result = scoreCoverLetterATS(cl, jd);
        expect(result.matched.length).toBeGreaterThan(0);
    });

    test('missing array contains not-found keywords', () => {
        const cl = 'I write prose with no technical terms at all.';
        const result = scoreCoverLetterATS(cl, jd);
        expect(result.missing.length).toBeGreaterThan(0);
    });

    test('matched + missing === total', () => {
        const cl = 'I have experience with selenium and java.';
        const { matched, missing, total } = scoreCoverLetterATS(cl, jd);
        expect(matched.length + missing.length).toBe(total);
    });
});
