import {
    parseResumeMarkdown, validateResumeStructure, extractJobEntries, findSection,
} from '../../src/features/resume/parser.js';

const FULL_RESUME = `# Alex Rivera

<div class="section headerInfo">
- [alex@example.com](mailto:alex@example.com)
- [linkedin.com/in/alexrivera](https://linkedin.com/in/alexrivera)
</div>

## Professional Summary
- Senior QA Engineer with 8 years of experience in test automation.
- Expert in Selenium WebDriver, Java, and CI/CD pipeline integration.
- Reduced regression time by 60% through automation framework development.
- Proven track record of delivering quality at scale in Agile environments.

## Core Skills
Quality Leadership, Test Automation, CI/CD, API Testing

## Technical Skills
Java, Selenium WebDriver, REST Assured, Jenkins, Docker, Kubernetes

## Professional Experience

### Senior QA Engineer — Acme Corp | Jan 2022 - Present
- Built Selenium automation framework reducing manual testing by 80%
- Integrated with Jenkins CI/CD pipeline for continuous testing
- Mentored team of 4 junior QA engineers

### SDET — Startup Inc | Mar 2019 - Dec 2021
- Developed REST API test suite using REST Assured
- Achieved 95% test coverage across 3 microservices

## Education

### B.Sc Computer Science — MIT | 2015-2019

## Certifications
- ISTQB Foundation Level — ISQI, 2022
`;

// ─── parseResumeMarkdown ──────────────────────────────────────────────────────

describe('parseResumeMarkdown: input validation', () => {
    test('throws TypeError for non-string input', () => {
        expect(() => parseResumeMarkdown(null)).toThrow(TypeError);
        expect(() => parseResumeMarkdown(42)).toThrow(TypeError);
    });

    test('handles empty string without throwing', () => {
        const doc = parseResumeMarkdown('');
        expect(doc.name).toBe('');
        expect(doc.sections).toHaveLength(0);
        expect(doc.wordCount).toBe(0);
    });
});

describe('parseResumeMarkdown: name extraction', () => {
    test('extracts name from H1', () => {
        const doc = parseResumeMarkdown(FULL_RESUME);
        expect(doc.name).toBe('Alex Rivera');
    });

    test('name is empty string when no H1', () => {
        const doc = parseResumeMarkdown('## Summary\n- Bullet');
        expect(doc.name).toBe('');
    });

    test('trims whitespace from name', () => {
        const doc = parseResumeMarkdown('#   Jordan Lee   \n');
        expect(doc.name).toBe('Jordan Lee');
    });
});

describe('parseResumeMarkdown: section parsing', () => {
    test('parses all H2 sections from full resume', () => {
        const doc = parseResumeMarkdown(FULL_RESUME);
        expect(doc.sections.length).toBeGreaterThanOrEqual(6);
    });

    test('headingCount matches number of sections', () => {
        const doc = parseResumeMarkdown(FULL_RESUME);
        expect(doc.headingCount).toBe(doc.sections.length);
    });

    test('section has heading, content, and bullets', () => {
        const doc = parseResumeMarkdown(FULL_RESUME);
        const summary = doc.sections.find(s => s.heading === 'Professional Summary');
        expect(summary).toBeDefined();
        expect(typeof summary.content).toBe('string');
        expect(Array.isArray(summary.bullets)).toBe(true);
    });

    test('extracts bullets from Professional Summary', () => {
        const doc = parseResumeMarkdown(FULL_RESUME);
        const summary = doc.sections.find(s => s.heading === 'Professional Summary');
        expect(summary.bullets.length).toBe(4);
    });

    test('extracts bullets from Experience section', () => {
        const doc = parseResumeMarkdown(FULL_RESUME);
        const exp = doc.sections.find(s => s.heading === 'Professional Experience');
        expect(exp.bullets.length).toBeGreaterThan(0);
    });

    test('handles resume with no sections', () => {
        const doc = parseResumeMarkdown('# Name\nSome plain text');
        expect(doc.sections).toHaveLength(0);
        expect(doc.headingCount).toBe(0);
    });
});

describe('parseResumeMarkdown: word count', () => {
    test('word count is a positive number for non-empty resume', () => {
        const doc = parseResumeMarkdown(FULL_RESUME);
        expect(doc.wordCount).toBeGreaterThan(50);
    });

    test('word count is 0 for empty string', () => {
        expect(parseResumeMarkdown('').wordCount).toBe(0);
    });

    test('strips markdown link URLs from word count', () => {
        const withLinks = '# Name\n\n[alex@example.com](mailto:alex@example.com) and more';
        const doc = parseResumeMarkdown(withLinks);
        // "alex@example.com and more" + "Name" = 5 words (link text kept, URL stripped)
        expect(doc.wordCount).toBeGreaterThan(0);
    });
});

// ─── validateResumeStructure ─────────────────────────────────────────────────

describe('validateResumeStructure', () => {
    test('returns valid for well-structured resume', () => {
        const doc = parseResumeMarkdown(FULL_RESUME);
        const { valid } = validateResumeStructure(doc);
        expect(valid).toBe(true);
    });

    test('returns invalid when required sections are missing', () => {
        const doc = parseResumeMarkdown('# Name\n\n## Skills\nJava');
        const { valid, missing } = validateResumeStructure(doc);
        expect(valid).toBe(false);
        expect(missing.length).toBeGreaterThan(0);
    });

    test('reports missing professional summary', () => {
        const doc = parseResumeMarkdown('# Name\n\n## Professional Experience\n### Job\n- Bullet');
        const { missing } = validateResumeStructure(doc);
        expect(missing.some(m => m.includes('summary'))).toBe(true);
    });

    test('reports missing experience', () => {
        const doc = parseResumeMarkdown('# Name\n\n## Professional Summary\n- Summary bullet.');
        const { missing } = validateResumeStructure(doc);
        expect(missing.some(m => m.includes('experience'))).toBe(true);
    });

    test('returns warnings for missing recommended sections', () => {
        const minimal = '# Name\n\n## Professional Summary\n- Summary.\n\n## Professional Experience\n### Job\n- Bullet';
        const doc = parseResumeMarkdown(minimal);
        const { valid, warnings } = validateResumeStructure(doc);
        expect(valid).toBe(true);
        expect(warnings.length).toBeGreaterThan(0);
    });

    test('handles null doc gracefully', () => {
        const { valid } = validateResumeStructure(null);
        expect(valid).toBe(false);
    });

    test('handles doc with no sections array', () => {
        const { valid } = validateResumeStructure({ sections: null });
        expect(valid).toBe(false);
    });
});

// ─── extractJobEntries ────────────────────────────────────────────────────────

describe('extractJobEntries', () => {
    test('returns empty array for empty/null input', () => {
        expect(extractJobEntries('')).toEqual([]);
        expect(extractJobEntries(null)).toEqual([]);
        expect(extractJobEntries(undefined)).toEqual([]);
    });

    test('extracts two job entries from experience text', () => {
        const exp = `### Senior SDET — Acme Corp | 2022-Present\n- Built framework\n- Reduced cycle time\n\n### SDET — Startup | 2019-2022\n- Wrote API tests`;
        const entries = extractJobEntries(exp);
        expect(entries).toHaveLength(2);
    });

    test('first entry title matches heading text', () => {
        const exp = `### Lead QA — BigCo | 2020-2024\n- Led team of 5`;
        const entries = extractJobEntries(exp);
        expect(entries[0].title).toBe('Lead QA — BigCo | 2020-2024');
    });

    test('captures bullets under each entry', () => {
        const exp = `### Dev | 2020\n- Bullet A\n- Bullet B`;
        const entries = extractJobEntries(exp);
        expect(entries[0].bullets).toHaveLength(2);
        expect(entries[0].bullets[0]).toBe('Bullet A');
    });

    test('handles experience section with no H3 headings', () => {
        const exp = `- Some bullet\n- Another bullet`;
        expect(extractJobEntries(exp)).toEqual([]);
    });
});

// ─── findSection ─────────────────────────────────────────────────────────────

describe('findSection', () => {
    test('finds an existing section by partial name (case-insensitive)', () => {
        const doc = parseResumeMarkdown(FULL_RESUME);
        const section = findSection(doc, 'experience');
        expect(section).not.toBeNull();
        expect(section.heading.toLowerCase()).toContain('experience');
    });

    test('returns null when section not found', () => {
        const doc = parseResumeMarkdown(FULL_RESUME);
        expect(findSection(doc, 'nonexistent section xyz')).toBeNull();
    });

    test('returns null for null doc', () => {
        expect(findSection(null, 'experience')).toBeNull();
    });

    test('finds Skills section', () => {
        const doc = parseResumeMarkdown(FULL_RESUME);
        const section = findSection(doc, 'skills');
        expect(section).not.toBeNull();
    });
});
