/**
 * LinkedIn data-export CSV parser.
 * LinkedIn exports: Profile.csv, Positions.csv, Education.csv, Skills.csv, Projects.csv
 * All parsers are pure functions — no browser/DOM deps, fully unit-testable.
 */

/**
 * Minimal RFC 4180–compliant CSV parser.
 * Handles quoted fields, escaped quotes (""), and CRLF/LF line endings.
 * @param {string} text - raw CSV text
 * @returns {string[][]} array of rows, each row an array of field strings
 */
export function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQuote) {
            if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
            else if (ch === '"') inQuote = false;
            else field += ch;
        } else {
            if      (ch === '"')                              inQuote = true;
            else if (ch === ',')                              { row.push(field); field = ''; }
            else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
                row.push(field); field = '';
                if (row.some(c => c.trim())) rows.push(row);
                row = [];
                if (ch === '\r') i++;
            } else field += ch;
        }
    }
    // flush last row
    if (field || row.length) {
        row.push(field);
        if (row.some(c => c.trim())) rows.push(row);
    }
    return rows;
}

/**
 * Detect LinkedIn export file type from the first header row.
 * @param {string} csvText
 * @returns {'positions'|'education'|'skills'|'profile'|'unknown'}
 */
export function detectExportType(csvText) {
    const firstLine = csvText.split('\n')[0].toLowerCase();
    if (firstLine.includes('company name') || firstLine.includes('started on')) return 'positions';
    if (firstLine.includes('school name')  || firstLine.includes('degree name'))  return 'education';
    if (firstLine.includes('first name')   && firstLine.includes('last name'))    return 'profile';
    if (firstLine.includes('name') && !firstLine.includes('company'))              return 'skills';
    return 'unknown';
}

/**
 * Parse LinkedIn Positions.csv → experience entries.
 * @param {string} csvText
 * @returns {object[]}
 */
export function parsePositions(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const get = (row, key) => {
        const idx = headers.indexOf(key);
        return idx >= 0 ? (row[idx] || '').trim() : '';
    };
    return rows.slice(1).map(row => ({
        company: get(row, 'company name'),
        title:   get(row, 'title'),
        start:   get(row, 'started on'),
        end:     get(row, 'finished on') || 'Present',
        bullets: [],
    })).filter(e => e.company);
}

/**
 * Parse LinkedIn Education.csv → education entries.
 * @param {string} csvText
 * @returns {object[]}
 */
export function parseEducationCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const get = (row, key) => {
        const idx = headers.indexOf(key);
        return idx >= 0 ? (row[idx] || '').trim() : '';
    };
    return rows.slice(1).map(row => ({
        institution: get(row, 'school name'),
        degree:      get(row, 'degree name'),
        area:        get(row, 'field of study') || get(row, 'notes'),
        start:       get(row, 'start date'),
        end:         get(row, 'end date'),
    })).filter(e => e.institution);
}

/**
 * Parse LinkedIn Skills.csv → flat array of skill name strings.
 * @param {string} csvText
 * @returns {string[]}
 */
export function parseSkillsCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('name');
    if (nameIdx < 0) return [];
    return rows.slice(1).map(r => (r[nameIdx] || '').trim()).filter(Boolean);
}

/**
 * Parse LinkedIn Profile.csv → basic identity object.
 * @param {string} csvText
 * @returns {{name: string, email: string, headline?: string}}
 */
export function parseProfileCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) return {};
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const get = (row, key) => {
        const idx = headers.indexOf(key);
        return idx >= 0 ? (row[idx] || '').trim() : '';
    };
    const row = rows[1];
    const firstName = get(row, 'first name');
    const lastName  = get(row, 'last name');
    const result = {
        name:     `${firstName} ${lastName}`.trim(),
        email:    get(row, 'email address'),
    };
    const headline = get(row, 'headline');
    if (headline) result.headline = headline;
    return result;
}
