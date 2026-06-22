import { parseCSV, detectExportType, parsePositions, parseEducationCSV, parseSkillsCSV, parseProfileCSV } from '../../src/features/import/linkedin.js';

describe('linkedin: parseCSV', () => {
    test('parses basic CSV', () => {
        const rows = parseCSV('name,email\nAlice,alice@example.com');
        expect(rows).toHaveLength(2);
        expect(rows[0]).toEqual(['name', 'email']);
        expect(rows[1]).toEqual(['Alice', 'alice@example.com']);
    });

    test('handles quoted fields', () => {
        const rows = parseCSV('"Last, First",email@test.com');
        expect(rows[0][0]).toBe('Last, First');
        expect(rows[0][1]).toBe('email@test.com');
    });

    test('handles escaped quotes inside quoted field', () => {
        const rows = parseCSV('"He said ""hello""",value');
        expect(rows[0][0]).toBe('He said "hello"');
    });

    test('handles CRLF line endings', () => {
        const rows = parseCSV('a,b\r\nc,d');
        expect(rows).toHaveLength(2);
        expect(rows[1]).toEqual(['c', 'd']);
    });

    test('skips blank-ish rows', () => {
        const rows = parseCSV('a,b\n,\nc,d');
        expect(rows).toHaveLength(2);
    });

    test('handles single column', () => {
        const rows = parseCSV('skill\nSelenium\nJava');
        expect(rows).toHaveLength(3);
        expect(rows[1][0]).toBe('Selenium');
    });

    test('returns empty array for empty input', () => {
        expect(parseCSV('')).toEqual([]);
    });
});

describe('linkedin: detectExportType', () => {
    test('detects positions', () => {
        expect(detectExportType('Company Name,Title,Started On,Finished On')).toBe('positions');
    });

    test('detects education', () => {
        expect(detectExportType('School Name,Degree Name,Start Date,End Date')).toBe('education');
    });

    test('detects profile', () => {
        expect(detectExportType('First Name,Last Name,Headline,Email Address')).toBe('profile');
    });

    test('detects skills', () => {
        expect(detectExportType('Name')).toBe('skills');
    });

    test('returns unknown for unrecognised headers', () => {
        expect(detectExportType('Foo,Bar,Baz')).toBe('unknown');
    });
});

describe('linkedin: parsePositions', () => {
    const csv = `Company Name,Title,Description,Location,Started On,Finished On\nAcme Corp,SDET,,Remote,Jun 2020,Oct 2023\nStartup Inc,QA Lead,,Onsite,Nov 2023,`;

    test('returns expected number of entries', () => {
        expect(parsePositions(csv)).toHaveLength(2);
    });

    test('maps company and title', () => {
        const pos = parsePositions(csv);
        expect(pos[0].company).toBe('Acme Corp');
        expect(pos[0].title).toBe('SDET');
    });

    test('defaults end to Present when empty', () => {
        const pos = parsePositions(csv);
        expect(pos[1].end).toBe('Present');
    });

    test('initialises bullets as empty array', () => {
        const pos = parsePositions(csv);
        expect(pos[0].bullets).toEqual([]);
    });

    test('returns empty array for header-only CSV', () => {
        expect(parsePositions('Company Name,Title')).toEqual([]);
    });

    test('filters rows without a company', () => {
        const bad = 'Company Name,Title\n,Some Title';
        expect(parsePositions(bad)).toHaveLength(0);
    });
});

describe('linkedin: parseEducationCSV', () => {
    const csv = `School Name,Degree Name,Start Date,End Date,Field Of Study,Notes\nMIT,B.Sc Computer Science,2015,2019,Computer Science,`;

    test('maps institution and degree', () => {
        const ed = parseEducationCSV(csv);
        expect(ed[0].institution).toBe('MIT');
        expect(ed[0].degree).toBe('B.Sc Computer Science');
    });

    test('maps field of study', () => {
        const ed = parseEducationCSV(csv);
        expect(ed[0].area).toBe('Computer Science');
    });

    test('returns empty for header-only input', () => {
        expect(parseEducationCSV('School Name,Degree Name')).toEqual([]);
    });
});

describe('linkedin: parseSkillsCSV', () => {
    const csv = `Name\nSelenium\nJava\nREST Assured`;

    test('returns array of skill names', () => {
        expect(parseSkillsCSV(csv)).toEqual(['Selenium', 'Java', 'REST Assured']);
    });

    test('returns empty when Name column missing', () => {
        expect(parseSkillsCSV('skill_name\nSelenium')).toEqual([]);
    });

    test('filters empty strings', () => {
        const csv2 = 'Name\nSelenium\n\nJava';
        expect(parseSkillsCSV(csv2)).toEqual(['Selenium', 'Java']);
    });
});

describe('linkedin: parseProfileCSV', () => {
    const csv = `First Name,Last Name,Headline,Email Address\nAlex,Rivera,Senior SDET,alex@example.com`;

    test('constructs full name', () => {
        expect(parseProfileCSV(csv).name).toBe('Alex Rivera');
    });

    test('maps email', () => {
        expect(parseProfileCSV(csv).email).toBe('alex@example.com');
    });

    test('maps headline when present', () => {
        expect(parseProfileCSV(csv).headline).toBe('Senior SDET');
    });

    test('returns empty object for header-only input', () => {
        expect(parseProfileCSV('First Name,Last Name')).toEqual({});
    });
});
