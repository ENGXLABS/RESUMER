/**
 * Profile schema validator.
 * Validates a resumer profile.json object against the expected schema.
 * Returns { valid, errors } — errors is empty when the profile is valid.
 * Pure ES module, zero browser deps, fully unit-testable.
 */

export const SCHEMA_VERSION = '1.0.0';

/**
 * Validate a full resumer profile object.
 * @param {unknown} profile
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateProfile(profile) {
    const errors = [];

    if (profile === null || typeof profile !== 'object' || Array.isArray(profile)) {
        errors.push('profile must be a non-null object');
        return { valid: false, errors };
    }

    errors.push(...validateIdentity(profile.identity));

    if (profile.experience   !== undefined) errors.push(...validateExperience(profile.experience));
    if (profile.education    !== undefined) errors.push(...validateEducation(profile.education));
    if (profile.skills       !== undefined) errors.push(...validateSkills(profile.skills));
    if (profile.projects     !== undefined) errors.push(...validateProjects(profile.projects));
    if (profile.certifications !== undefined) errors.push(...validateCertifications(profile.certifications));

    return { valid: errors.length === 0, errors };
}

/**
 * Validate the identity section.
 * @param {unknown} identity
 * @returns {string[]} error messages
 */
export function validateIdentity(identity) {
    const errors = [];

    if (!identity || typeof identity !== 'object' || Array.isArray(identity)) {
        errors.push('identity is required and must be an object');
        return errors;
    }

    if (!identity.name  || typeof identity.name  !== 'string' || !identity.name.trim()) {
        errors.push('identity.name is required and must be a non-empty string');
    }
    if (!identity.email || typeof identity.email !== 'string' || !identity.email.trim()) {
        errors.push('identity.email is required and must be a non-empty string');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email)) {
        errors.push('identity.email must be a valid email address');
    }

    for (const field of ['linkedin', 'github', 'portfolio']) {
        if (identity[field] !== undefined && typeof identity[field] !== 'string') {
            errors.push(`identity.${field} must be a string`);
        }
    }

    return errors;
}

/**
 * Validate the experience array.
 * @param {unknown} experience
 * @returns {string[]}
 */
export function validateExperience(experience) {
    const errors = [];

    if (!Array.isArray(experience)) {
        errors.push('experience must be an array');
        return errors;
    }

    experience.forEach((exp, i) => {
        if (exp === null || typeof exp !== 'object') {
            errors.push(`experience[${i}] must be an object`);
            return;
        }
        if (!exp.company || typeof exp.company !== 'string' || !exp.company.trim()) {
            errors.push(`experience[${i}].company is required`);
        }
        if (!exp.title || typeof exp.title !== 'string' || !exp.title.trim()) {
            errors.push(`experience[${i}].title is required`);
        }
        if (exp.bullets !== undefined && !Array.isArray(exp.bullets)) {
            errors.push(`experience[${i}].bullets must be an array`);
        }
        if (Array.isArray(exp.bullets)) {
            exp.bullets.forEach((b, j) => {
                if (typeof b !== 'string') errors.push(`experience[${i}].bullets[${j}] must be a string`);
            });
        }
    });

    return errors;
}

/**
 * Validate the education array.
 * @param {unknown} education
 * @returns {string[]}
 */
export function validateEducation(education) {
    const errors = [];

    if (!Array.isArray(education)) {
        errors.push('education must be an array');
        return errors;
    }

    education.forEach((edu, i) => {
        if (edu === null || typeof edu !== 'object') {
            errors.push(`education[${i}] must be an object`);
            return;
        }
        if (!edu.institution || typeof edu.institution !== 'string' || !edu.institution.trim()) {
            errors.push(`education[${i}].institution is required`);
        }
    });

    return errors;
}

/**
 * Validate the skills object.
 * @param {unknown} skills
 * @returns {string[]}
 */
export function validateSkills(skills) {
    const errors = [];

    if (skills === null || typeof skills !== 'object' || Array.isArray(skills)) {
        errors.push('skills must be a non-null object');
        return errors;
    }

    if (skills.core !== undefined && !Array.isArray(skills.core)) {
        errors.push('skills.core must be an array');
    }
    if (skills.technical !== undefined && !Array.isArray(skills.technical)) {
        errors.push('skills.technical must be an array');
    }
    if (Array.isArray(skills.technical)) {
        skills.technical.forEach((s, i) => {
            if (typeof s !== 'string') errors.push(`skills.technical[${i}] must be a string`);
        });
    }

    return errors;
}

/**
 * Validate the projects array.
 * @param {unknown} projects
 * @returns {string[]}
 */
export function validateProjects(projects) {
    const errors = [];

    if (!Array.isArray(projects)) {
        errors.push('projects must be an array');
        return errors;
    }

    projects.forEach((p, i) => {
        if (p === null || typeof p !== 'object') {
            errors.push(`projects[${i}] must be an object`);
            return;
        }
        if (!p.name || typeof p.name !== 'string' || !p.name.trim()) {
            errors.push(`projects[${i}].name is required`);
        }
    });

    return errors;
}

/**
 * Validate the certifications array.
 * @param {unknown} certs
 * @returns {string[]}
 */
export function validateCertifications(certs) {
    const errors = [];

    if (!Array.isArray(certs)) {
        errors.push('certifications must be an array');
        return errors;
    }

    certs.forEach((c, i) => {
        if (c === null || typeof c !== 'object') {
            errors.push(`certifications[${i}] must be an object`);
            return;
        }
        if (!c.name || typeof c.name !== 'string' || !c.name.trim()) {
            errors.push(`certifications[${i}].name is required`);
        }
    });

    return errors;
}
