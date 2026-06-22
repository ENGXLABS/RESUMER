import { reposToMarkdown, reposToProfileProjects, GITHUB_API_BASE } from '../../src/features/import/github.js';

const SAMPLE_REPOS = [
    {
        name: 'selenium-framework',
        description: 'Enterprise Selenium test automation framework',
        html_url: 'https://github.com/alexrivera/selenium-framework',
        language: 'Java',
        stargazers_count: 42,
        fork: false,
        topics: ['selenium', 'java', 'testing'],
    },
    {
        name: 'api-test-kit',
        description: 'REST API testing utilities',
        html_url: 'https://github.com/alexrivera/api-test-kit',
        language: 'Kotlin',
        stargazers_count: 0,
        fork: false,
        topics: [],
    },
    {
        name: 'forked-repo',
        description: 'A forked repository',
        html_url: 'https://github.com/alexrivera/forked-repo',
        language: 'Python',
        stargazers_count: 0,
        fork: true,
        topics: [],
    },
    {
        name: 'no-desc-repo',
        description: null,
        html_url: 'https://github.com/alexrivera/no-desc-repo',
        language: null,
        stargazers_count: 5,
        fork: false,
        topics: ['util'],
    },
];

// ─── GITHUB_API_BASE ─────────────────────────────────────────────────────────

describe('GITHUB_API_BASE', () => {
    test('is the correct GitHub API URL', () => {
        expect(GITHUB_API_BASE).toBe('https://api.github.com');
    });
});

// ─── reposToMarkdown ─────────────────────────────────────────────────────────

describe('reposToMarkdown', () => {
    test('returns empty string for empty array', () => {
        expect(reposToMarkdown([])).toBe('');
    });

    test('returns empty string for non-array', () => {
        expect(reposToMarkdown(null)).toBe('');
        expect(reposToMarkdown(undefined)).toBe('');
    });

    test('starts with ## Projects heading', () => {
        const md = reposToMarkdown(SAMPLE_REPOS);
        expect(md.startsWith('## Projects')).toBe(true);
    });

    test('skips forked repos', () => {
        const md = reposToMarkdown(SAMPLE_REPOS);
        expect(md).not.toContain('forked-repo');
    });

    test('includes non-fork repo names', () => {
        const md = reposToMarkdown(SAMPLE_REPOS);
        expect(md).toContain('selenium-framework');
        expect(md).toContain('api-test-kit');
    });

    test('includes language as inline code', () => {
        const md = reposToMarkdown(SAMPLE_REPOS);
        expect(md).toContain('`Java`');
        expect(md).toContain('`Kotlin`');
    });

    test('includes stars when greater than zero', () => {
        const md = reposToMarkdown(SAMPLE_REPOS);
        expect(md).toContain('⭐ 42');
    });

    test('does not show stars when count is zero', () => {
        const md = reposToMarkdown([SAMPLE_REPOS[1]]); // api-test-kit, 0 stars
        expect(md).not.toContain('⭐ 0');
    });

    test('includes description as bullet', () => {
        const md = reposToMarkdown(SAMPLE_REPOS);
        expect(md).toContain('Enterprise Selenium test automation framework');
    });

    test('omits description line when null', () => {
        const md = reposToMarkdown([SAMPLE_REPOS[3]]); // no-desc-repo
        // Should not have a bullet for description
        const lines = md.split('\n').filter(l => l.trim() !== '');
        const descLines = lines.filter(l => l.startsWith('- ') && !l.startsWith('- Topics:'));
        expect(descLines).toHaveLength(0);
    });

    test('includes topics line when topics present', () => {
        const md = reposToMarkdown(SAMPLE_REPOS);
        expect(md).toContain('Topics: selenium, java, testing');
    });

    test('omits topics line when topics array is empty', () => {
        const md = reposToMarkdown([SAMPLE_REPOS[1]]); // api-test-kit, no topics
        expect(md).not.toContain('Topics:');
    });

    test('omits language code when null', () => {
        const md = reposToMarkdown([SAMPLE_REPOS[3]]); // no-desc-repo, null language
        // Language backtick shouldn't appear
        const lines = md.split('\n');
        const h3Line = lines.find(l => l.includes('no-desc-repo'));
        expect(h3Line).not.toMatch(/`[^`]+`/);
    });
});

// ─── reposToProfileProjects ──────────────────────────────────────────────────

describe('reposToProfileProjects', () => {
    test('returns empty array for non-array input', () => {
        expect(reposToProfileProjects(null)).toEqual([]);
        expect(reposToProfileProjects({})).toEqual([]);
    });

    test('skips forked repos', () => {
        const projects = reposToProfileProjects(SAMPLE_REPOS);
        expect(projects.every(p => !p.name.includes('forked'))).toBe(true);
    });

    test('maps repo fields to profile project schema', () => {
        const projects = reposToProfileProjects([SAMPLE_REPOS[0]]);
        expect(projects[0].name).toBe('selenium-framework');
        expect(projects[0].description).toBe('Enterprise Selenium test automation framework');
        expect(projects[0].url).toBe('https://github.com/alexrivera/selenium-framework');
    });

    test('keywords include language and topics', () => {
        const projects = reposToProfileProjects([SAMPLE_REPOS[0]]);
        expect(projects[0].keywords).toContain('Java');
        expect(projects[0].keywords).toContain('selenium');
    });

    test('keywords filter out null language', () => {
        const projects = reposToProfileProjects([SAMPLE_REPOS[3]]); // null language
        expect(projects[0].keywords).not.toContain(null);
    });

    test('description defaults to empty string when null', () => {
        const projects = reposToProfileProjects([SAMPLE_REPOS[3]]);
        expect(projects[0].description).toBe('');
    });
});
