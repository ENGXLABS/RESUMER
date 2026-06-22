/**
 * JSON Resume export — converts resumer profile.json → jsonresume.org schema v1
 * Pure ES module, zero browser deps, fully unit-testable.
 */

export const JSON_RESUME_SCHEMA =
    'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json';

/**
 * Convert a resumer profile object to JSON Resume v1 format.
 * @param {object} profile - resumer profile object
 * @returns {object} JSON Resume document
 */
export function toJsonResume(profile) {
    if (!profile || typeof profile !== 'object') {
        throw new TypeError('profile must be a non-null object');
    }
    return {
        $schema: JSON_RESUME_SCHEMA,
        basics:       buildBasics(profile),
        work:         buildWork(profile),
        education:    buildEducation(profile),
        skills:       buildSkills(profile),
        projects:     buildProjects(profile),
        certificates: buildCertificates(profile),
    };
}

export function buildBasics(profile) {
    const id = profile.identity || {};
    const profiles = [];
    if (id.linkedin) {
        profiles.push({
            network:  'LinkedIn',
            url:      id.linkedin,
            username: id.linkedin.replace(/\/$/, '').split('/').pop(),
        });
    }
    if (id.github) {
        profiles.push({
            network:  'GitHub',
            url:      id.github,
            username: id.github.replace(/\/$/, '').split('/').pop(),
        });
    }
    return {
        name:     id.name     || '',
        email:    id.email    || '',
        url:      id.portfolio || '',
        profiles,
    };
}

export function buildWork(profile) {
    return (profile.experience || []).map(exp => ({
        name:       exp.company    || '',
        position:   exp.title      || '',
        startDate:  exp.start      || '',
        endDate:    exp.end        || '',
        highlights: exp.bullets    || [],
    }));
}

export function buildEducation(profile) {
    return (profile.education || []).map(edu => ({
        institution: edu.institution || '',
        area:        edu.area || edu.degree || '',
        studyType:   edu.studyType   || '',
        startDate:   edu.start       || '',
        endDate:     edu.end         || '',
    }));
}

export function buildSkills(profile) {
    const groups = [];
    for (const group of (profile.skills?.core || [])) {
        groups.push({
            name:     group.name  || '',
            keywords: group.items || [],
        });
    }
    if (profile.skills?.technical?.length) {
        groups.push({ name: 'Technical', keywords: profile.skills.technical });
    }
    return groups;
}

export function buildProjects(profile) {
    return (profile.projects || []).map(p => ({
        name:        p.name        || '',
        description: p.description || '',
        url:         p.url         || '',
        keywords:    p.keywords    || [],
    }));
}

export function buildCertificates(profile) {
    return (profile.certifications || []).map(c => ({
        name:   c.name   || '',
        issuer: c.issuer || '',
        date:   c.date   || '',
        url:    c.url    || '',
    }));
}
