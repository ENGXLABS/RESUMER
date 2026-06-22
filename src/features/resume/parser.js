/**
 * Resume markdown parser — extracts structure from a markdown resume document.
 * Produces a plain object with named sections, word count, and job entries.
 * Pure ES module, no marked.js dependency, no DOM — fully unit-testable.
 */

/**
 * Parse a resume markdown document into a structured object.
 * @param {string} md - raw markdown string
 * @returns {ResumeDocument}
 */
export function parseResumeMarkdown(md) {
    if (typeof md !== 'string') throw new TypeError('md must be a string');

    const lines = md.split('\n');
    /** @type {ResumeDocument} */
    const doc = { name: '', sections: [], wordCount: 0, headingCount: 0 };

    // H1 → candidate name
    const h1Line = lines.find(l => /^#\s+/.test(l));
    if (h1Line) doc.name = h1Line.replace(/^#\s+/, '').trim();

    // Word count (strip markdown syntax)
    const stripped = md
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // keep link text, drop URL
        .replace(/[#*_>~|]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    doc.wordCount = stripped.length > 0 ? stripped.split(' ').filter(w => w.length > 0).length : 0;

    // Parse H2 sections
    let current = null;
    for (const line of lines) {
        if (/^##\s+/.test(line)) {
            if (current) doc.sections.push(current);
            current = {
                heading: line.replace(/^##\s+/, '').trim(),
                content: '',
                bullets: [],
            };
            doc.headingCount++;
        } else if (current) {
            current.content += line + '\n';
            if (/^\s*[-*]\s+/.test(line)) {
                current.bullets.push(line.replace(/^\s*[-*]\s+/, '').trim());
            }
        }
    }
    if (current) doc.sections.push(current);

    return doc;
}

/**
 * Validate that a parsed resume document has all required and recommended sections.
 * @param {ResumeDocument} doc
 * @returns {{ valid: boolean, missing: string[], warnings: string[] }}
 */
export function validateResumeStructure(doc) {
    if (!doc || !Array.isArray(doc.sections)) {
        return { valid: false, missing: ['(no sections found)'], warnings: [] };
    }

    const REQUIRED = ['professional summary', 'experience'];
    const RECOMMENDED = ['skills', 'education'];

    const headings = doc.sections.map(s => s.heading.toLowerCase());
    const missing   = REQUIRED.filter(r => !headings.some(h => h.includes(r)));
    const warnings  = RECOMMENDED
        .filter(r => !headings.some(h => h.includes(r)))
        .map(r => `Recommended section "${r}" not found`);

    return { valid: missing.length === 0, missing, warnings };
}

/**
 * Extract individual job entries from a raw experience section string.
 * H3 headings become job entries; bullet points under each H3 become highlights.
 * @param {string} experienceText
 * @returns {{ title: string, bullets: string[] }[]}
 */
export function extractJobEntries(experienceText) {
    if (!experienceText || typeof experienceText !== 'string') return [];

    const entries = [];
    let current = null;

    for (const line of experienceText.split('\n')) {
        if (/^###\s+/.test(line)) {
            if (current) entries.push(current);
            current = { title: line.replace(/^###\s+/, '').trim(), bullets: [] };
        } else if (current && /^\s*[-*]\s+/.test(line)) {
            current.bullets.push(line.replace(/^\s*[-*]\s+/, '').trim());
        }
    }
    if (current) entries.push(current);

    return entries;
}

/**
 * Find a named section within a parsed document (case-insensitive partial match).
 * @param {ResumeDocument} doc
 * @param {string} sectionName
 * @returns {{ heading: string, content: string, bullets: string[] } | null}
 */
export function findSection(doc, sectionName) {
    if (!doc || !Array.isArray(doc.sections)) return null;
    const needle = sectionName.toLowerCase();
    return doc.sections.find(s => s.heading.toLowerCase().includes(needle)) || null;
}

/**
 * @typedef {Object} ResumeDocument
 * @property {string} name - candidate name extracted from H1
 * @property {{ heading: string, content: string, bullets: string[] }[]} sections
 * @property {number} wordCount - approximate word count (markdown stripped)
 * @property {number} headingCount - number of H2 sections found
 */
