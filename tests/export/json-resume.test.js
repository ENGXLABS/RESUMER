import { toJsonResume, buildBasics, buildWork, buildEducation, buildSkills, buildProjects, buildCertificates, JSON_RESUME_SCHEMA } from '../../src/features/export/json-resume.js';

describe('json-resume: toJsonResume', () => {
    test('throws on non-object input', () => {
        expect(() => toJsonResume(null)).toThrow(TypeError);
        expect(() => toJsonResume('string')).toThrow(TypeError);
        expect(() => toJsonResume(42)).toThrow(TypeError);
    });

    test('returns correct $schema URL', () => {
        const out = toJsonResume({});
        expect(out.$schema).toBe(JSON_RESUME_SCHEMA);
    });

    test('returns all top-level keys', () => {
        const out = toJsonResume({});
        expect(out).toHaveProperty('basics');
        expect(out).toHaveProperty('work');
        expect(out).toHaveProperty('education');
        expect(out).toHaveProperty('skills');
        expect(out).toHaveProperty('projects');
        expect(out).toHaveProperty('certificates');
    });

    test('maps full profile correctly', () => {
        const profile = {
            identity: { name: 'Alex Rivera', email: 'alex@example.com', portfolio: 'https://alex.dev', linkedin: 'https://linkedin.com/in/alexrivera', github: 'https://github.com/alexrivera' },
            experience: [{ company: 'Acme Corp', title: 'SDET', start: '2021-01', end: '2024-01', bullets: ['Built CI pipeline'] }],
            education: [{ institution: 'MIT', degree: 'B.Sc', area: 'CS', start: '2017', end: '2021' }],
            skills: { core: [{ name: 'Testing', items: ['Selenium', 'Jest'] }], technical: ['Java', 'Python'] },
            projects: [{ name: 'Proj A', description: 'desc', url: 'https://github.com/a', keywords: ['Java'] }],
            certifications: [{ name: 'ISTQB', issuer: 'ISQI', date: '2022-05', url: 'https://cert.com' }],
        };
        const out = toJsonResume(profile);
        expect(out.basics.name).toBe('Alex Rivera');
        expect(out.basics.email).toBe('alex@example.com');
        expect(out.work[0].name).toBe('Acme Corp');
        expect(out.work[0].highlights).toEqual(['Built CI pipeline']);
        expect(out.education[0].institution).toBe('MIT');
        expect(out.skills[0].name).toBe('Testing');
        expect(out.skills[0].keywords).toEqual(['Selenium', 'Jest']);
        expect(out.projects[0].name).toBe('Proj A');
        expect(out.certificates[0].name).toBe('ISTQB');
    });
});

describe('json-resume: buildBasics', () => {
    test('empty profile → empty strings', () => {
        const b = buildBasics({});
        expect(b.name).toBe('');
        expect(b.email).toBe('');
        expect(b.profiles).toEqual([]);
    });

    test('extracts LinkedIn and GitHub usernames', () => {
        const b = buildBasics({ identity: { linkedin: 'https://linkedin.com/in/siva/', github: 'https://github.com/sivasankaramalan' } });
        expect(b.profiles).toHaveLength(2);
        expect(b.profiles[0].network).toBe('LinkedIn');
        expect(b.profiles[0].username).toBe('siva');
        expect(b.profiles[1].network).toBe('GitHub');
        expect(b.profiles[1].username).toBe('sivasankaramalan');
    });

    test('only linkedin present → one profile entry', () => {
        const b = buildBasics({ identity: { linkedin: 'https://linkedin.com/in/user' } });
        expect(b.profiles).toHaveLength(1);
        expect(b.profiles[0].network).toBe('LinkedIn');
    });
});

describe('json-resume: buildWork', () => {
    test('empty experience → empty array', () => {
        expect(buildWork({})).toEqual([]);
    });

    test('maps experience fields', () => {
        const w = buildWork({ experience: [{ company: 'Acme', title: 'Dev', start: '2020', end: '2023', bullets: ['Did A', 'Did B'] }] });
        expect(w).toHaveLength(1);
        expect(w[0]).toEqual({ name: 'Acme', position: 'Dev', startDate: '2020', endDate: '2023', highlights: ['Did A', 'Did B'] });
    });

    test('missing fields default to empty strings', () => {
        const w = buildWork({ experience: [{}] });
        expect(w[0].name).toBe('');
        expect(w[0].highlights).toEqual([]);
    });
});

describe('json-resume: buildEducation', () => {
    test('empty education → empty array', () => {
        expect(buildEducation({})).toEqual([]);
    });

    test('maps degree and area', () => {
        const e = buildEducation({ education: [{ institution: 'UoT', degree: 'B.Sc', area: 'CS', start: '2016', end: '2020' }] });
        expect(e[0].institution).toBe('UoT');
        expect(e[0].area).toBe('CS');
    });

    test('falls back to degree when area missing', () => {
        const e = buildEducation({ education: [{ institution: 'UoT', degree: 'M.Sc' }] });
        expect(e[0].area).toBe('M.Sc');
    });
});

describe('json-resume: buildSkills', () => {
    test('empty skills → empty array', () => {
        expect(buildSkills({})).toEqual([]);
    });

    test('maps core skill groups', () => {
        const s = buildSkills({ skills: { core: [{ name: 'Automation', items: ['Selenium', 'Playwright'] }] } });
        expect(s[0].name).toBe('Automation');
        expect(s[0].keywords).toEqual(['Selenium', 'Playwright']);
    });

    test('adds Technical group when technical skills present', () => {
        const s = buildSkills({ skills: { core: [], technical: ['Java', 'Kotlin'] } });
        expect(s[s.length - 1].name).toBe('Technical');
        expect(s[s.length - 1].keywords).toEqual(['Java', 'Kotlin']);
    });

    test('no Technical group when technical array is empty', () => {
        const s = buildSkills({ skills: { core: [], technical: [] } });
        expect(s.find(g => g.name === 'Technical')).toBeUndefined();
    });
});

describe('json-resume: buildCertificates', () => {
    test('empty certifications → empty array', () => {
        expect(buildCertificates({})).toEqual([]);
    });

    test('maps cert fields', () => {
        const c = buildCertificates({ certifications: [{ name: 'AWS SA', issuer: 'Amazon', date: '2023-09', url: 'https://aws.amazon.com/cert' }] });
        expect(c[0]).toEqual({ name: 'AWS SA', issuer: 'Amazon', date: '2023-09', url: 'https://aws.amazon.com/cert' });
    });
});
