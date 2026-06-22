import {
    validateProfile, validateIdentity, validateExperience, validateEducation,
    validateSkills, validateProjects, validateCertifications, SCHEMA_VERSION,
} from '../../src/features/profile/validator.js';

// ─── validateProfile ──────────────────────────────────────────────────────────

describe('validateProfile: top-level checks', () => {
    test('returns invalid for null', () => {
        const { valid, errors } = validateProfile(null);
        expect(valid).toBe(false);
        expect(errors.length).toBeGreaterThan(0);
    });

    test('returns invalid for string', () => {
        expect(validateProfile('string').valid).toBe(false);
    });

    test('returns invalid for array', () => {
        expect(validateProfile([]).valid).toBe(false);
    });

    test('returns invalid for missing identity', () => {
        const { valid } = validateProfile({});
        expect(valid).toBe(false);
    });

    test('returns valid for minimal valid profile', () => {
        const profile = { identity: { name: 'Alex Rivera', email: 'alex@example.com' } };
        const { valid, errors } = validateProfile(profile);
        expect(valid).toBe(true);
        expect(errors).toHaveLength(0);
    });

    test('passes full valid profile', () => {
        const profile = {
            identity: { name: 'Alex', email: 'alex@test.com', linkedin: 'https://linkedin.com/in/alex' },
            experience: [{ company: 'Acme', title: 'SDET', bullets: ['Did A'] }],
            education: [{ institution: 'MIT' }],
            skills: { core: [{ name: 'Testing', items: [] }], technical: ['Java'] },
            projects: [{ name: 'Proj' }],
            certifications: [{ name: 'AWS SA' }],
        };
        expect(validateProfile(profile).valid).toBe(true);
    });

    test('SCHEMA_VERSION is a non-empty string', () => {
        expect(typeof SCHEMA_VERSION).toBe('string');
        expect(SCHEMA_VERSION.length).toBeGreaterThan(0);
    });
});

// ─── validateIdentity ────────────────────────────────────────────────────────

describe('validateIdentity', () => {
    test('returns error when identity is missing', () => {
        expect(validateIdentity(undefined).length).toBeGreaterThan(0);
    });

    test('returns error when identity is an array', () => {
        expect(validateIdentity([]).length).toBeGreaterThan(0);
    });

    test('returns error for missing name', () => {
        const errs = validateIdentity({ email: 'a@b.com' });
        expect(errs.some(e => e.includes('name'))).toBe(true);
    });

    test('returns error for empty name', () => {
        const errs = validateIdentity({ name: '   ', email: 'a@b.com' });
        expect(errs.some(e => e.includes('name'))).toBe(true);
    });

    test('returns error for missing email', () => {
        const errs = validateIdentity({ name: 'Alex' });
        expect(errs.some(e => e.includes('email'))).toBe(true);
    });

    test('returns error for invalid email format', () => {
        const errs = validateIdentity({ name: 'Alex', email: 'not-an-email' });
        expect(errs.some(e => e.includes('email'))).toBe(true);
    });

    test('accepts valid email', () => {
        const errs = validateIdentity({ name: 'Alex', email: 'alex@example.com' });
        expect(errs).toHaveLength(0);
    });

    test('returns error when optional url field is not a string', () => {
        const errs = validateIdentity({ name: 'Alex', email: 'a@b.com', linkedin: 123 });
        expect(errs.some(e => e.includes('linkedin'))).toBe(true);
    });

    test('accepts optional string fields', () => {
        const errs = validateIdentity({ name: 'Alex', email: 'a@b.com', github: 'https://github.com/alex', portfolio: 'https://alex.dev' });
        expect(errs).toHaveLength(0);
    });
});

// ─── validateExperience ──────────────────────────────────────────────────────

describe('validateExperience', () => {
    test('returns error when not an array', () => {
        expect(validateExperience({}).some(e => e.includes('array'))).toBe(true);
    });

    test('returns no errors for empty array', () => {
        expect(validateExperience([])).toHaveLength(0);
    });

    test('returns error for null entry', () => {
        expect(validateExperience([null]).length).toBeGreaterThan(0);
    });

    test('returns error for missing company', () => {
        const errs = validateExperience([{ title: 'Dev' }]);
        expect(errs.some(e => e.includes('company'))).toBe(true);
    });

    test('returns error for missing title', () => {
        const errs = validateExperience([{ company: 'Acme' }]);
        expect(errs.some(e => e.includes('title'))).toBe(true);
    });

    test('returns error for non-array bullets', () => {
        const errs = validateExperience([{ company: 'Acme', title: 'Dev', bullets: 'not-array' }]);
        expect(errs.some(e => e.includes('bullets'))).toBe(true);
    });

    test('returns error for non-string bullet item', () => {
        const errs = validateExperience([{ company: 'Acme', title: 'Dev', bullets: [123] }]);
        expect(errs.some(e => e.includes('bullets[0]'))).toBe(true);
    });

    test('passes valid experience entry', () => {
        const errs = validateExperience([{ company: 'Acme', title: 'SDET', start: '2020', end: '2024', bullets: ['Did A'] }]);
        expect(errs).toHaveLength(0);
    });
});

// ─── validateEducation ───────────────────────────────────────────────────────

describe('validateEducation', () => {
    test('returns error when not an array', () => {
        expect(validateEducation('string').length).toBeGreaterThan(0);
    });

    test('returns no errors for empty array', () => {
        expect(validateEducation([])).toHaveLength(0);
    });

    test('returns error for missing institution', () => {
        const errs = validateEducation([{ degree: 'B.Sc' }]);
        expect(errs.some(e => e.includes('institution'))).toBe(true);
    });

    test('passes valid education entry', () => {
        const errs = validateEducation([{ institution: 'MIT', degree: 'B.Sc', area: 'CS' }]);
        expect(errs).toHaveLength(0);
    });
});

// ─── validateSkills ──────────────────────────────────────────────────────────

describe('validateSkills', () => {
    test('returns error when not an object', () => {
        expect(validateSkills('string').length).toBeGreaterThan(0);
    });

    test('returns error when null', () => {
        expect(validateSkills(null).length).toBeGreaterThan(0);
    });

    test('returns error when core is not array', () => {
        const errs = validateSkills({ core: 'bad' });
        expect(errs.some(e => e.includes('core'))).toBe(true);
    });

    test('returns error when technical is not array', () => {
        const errs = validateSkills({ technical: {} });
        expect(errs.some(e => e.includes('technical'))).toBe(true);
    });

    test('returns error for non-string technical item', () => {
        const errs = validateSkills({ technical: [42] });
        expect(errs.some(e => e.includes('technical[0]'))).toBe(true);
    });

    test('passes valid skills object', () => {
        const errs = validateSkills({ core: [], technical: ['Java', 'Selenium'] });
        expect(errs).toHaveLength(0);
    });

    test('passes empty skills object', () => {
        expect(validateSkills({})).toHaveLength(0);
    });
});

// ─── validateProjects ────────────────────────────────────────────────────────

describe('validateProjects', () => {
    test('returns error when not an array', () => {
        expect(validateProjects(42).length).toBeGreaterThan(0);
    });

    test('returns error for null project entry', () => {
        expect(validateProjects([null]).length).toBeGreaterThan(0);
    });

    test('returns error for missing name', () => {
        const errs = validateProjects([{ description: 'desc' }]);
        expect(errs.some(e => e.includes('name'))).toBe(true);
    });

    test('passes valid project entry', () => {
        const errs = validateProjects([{ name: 'Proj A', description: 'desc', url: 'https://github.com/a' }]);
        expect(errs).toHaveLength(0);
    });
});

// ─── validateCertifications ──────────────────────────────────────────────────

describe('validateCertifications', () => {
    test('returns error when not an array', () => {
        expect(validateCertifications({}).length).toBeGreaterThan(0);
    });

    test('returns error for null certification entry', () => {
        expect(validateCertifications([null]).length).toBeGreaterThan(0);
    });

    test('returns error for missing name', () => {
        const errs = validateCertifications([{ issuer: 'Amazon' }]);
        expect(errs.some(e => e.includes('name'))).toBe(true);
    });

    test('passes valid certification', () => {
        const errs = validateCertifications([{ name: 'AWS SA', issuer: 'Amazon', date: '2023' }]);
        expect(errs).toHaveLength(0);
    });
});
