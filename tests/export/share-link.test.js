import { encodeShareLink, decodeShareLink, buildShareURL, extractShareParam, isOversized, SHARE_PARAM, WARN_BYTES } from '../../src/features/export/share-link.js';

describe('share-link: encodeShareLink', () => {
    test('throws on non-string input', () => {
        expect(() => encodeShareLink(null)).toThrow(TypeError);
        expect(() => encodeShareLink(42)).toThrow(TypeError);
    });

    test('encodes ASCII text', () => {
        const enc = encodeShareLink('Hello, world!');
        expect(typeof enc).toBe('string');
        expect(enc.length).toBeGreaterThan(0);
    });

    test('encodes UTF-8 text (emoji, non-ASCII)', () => {
        const md = '# Resume\n\n⭐ Senior Engineer';
        const enc = encodeShareLink(md);
        expect(typeof enc).toBe('string');
        // should decode back correctly
        expect(decodeShareLink(enc)).toBe(md);
    });

    test('encodes empty string', () => {
        const enc = encodeShareLink('');
        expect(typeof enc).toBe('string');
    });

    test('encodes typical resume markdown', () => {
        const md = '# Alex Rivera\n\n## Professional Summary\n- 8 years QE experience\n\n## Experience\n\n### SDET @ Acme | 2020-2024\n- Built test frameworks';
        const enc = encodeShareLink(md);
        expect(decodeShareLink(enc)).toBe(md);
    });
});

describe('share-link: decodeShareLink', () => {
    test('returns null for non-string', () => {
        expect(decodeShareLink(null)).toBeNull();
        expect(decodeShareLink(42)).toBeNull();
    });

    test('returns null for invalid base64', () => {
        expect(decodeShareLink('!!!invalid!!!')).toBeNull();
    });

    test('round-trips ASCII text', () => {
        const original = 'Hello, world!';
        expect(decodeShareLink(encodeShareLink(original))).toBe(original);
    });

    test('round-trips text with special chars', () => {
        const original = '# Title\n\n- Bullet: 40% improvement\n- Tools: Selenium/Playwright';
        expect(decodeShareLink(encodeShareLink(original))).toBe(original);
    });

    test('round-trips text with Unicode', () => {
        const original = 'résumé • señor • über • 中文';
        expect(decodeShareLink(encodeShareLink(original))).toBe(original);
    });
});

describe('share-link: buildShareURL', () => {
    test('returns a URL string containing the share param', () => {
        const url = buildShareURL('# My Resume', 'https://resumer.app/');
        expect(url).toContain(`#${SHARE_PARAM}=`);
        expect(url.startsWith('https://resumer.app/')).toBe(true);
    });

    test('encoded content in URL decodes back to original', () => {
        const md = '# Test Resume\n- Bullet 1';
        const url = buildShareURL(md, 'https://example.com/');
        const encoded = extractShareParam(url.split('?')[0].replace(/^.*#/, '#'));
        // extractShareParam expects the hash portion
        const hashPart = '#' + url.split('#')[1];
        const enc2 = extractShareParam(hashPart);
        expect(decodeShareLink(enc2)).toBe(md);
    });

    test('uses provided baseURL', () => {
        const url = buildShareURL('md', 'https://custom.app/resume');
        expect(url.startsWith('https://custom.app/resume#')).toBe(true);
    });
});

describe('share-link: extractShareParam', () => {
    test('returns null for non-string', () => {
        expect(extractShareParam(null)).toBeNull();
        expect(extractShareParam(42)).toBeNull();
    });

    test('returns null when param not in hash', () => {
        expect(extractShareParam('#other=value')).toBeNull();
        expect(extractShareParam('')).toBeNull();
    });

    test('extracts value from hash-only string', () => {
        const val = extractShareParam('#resume=abc123');
        expect(val).toBe('abc123');
    });

    test('extracts value with SHARE_PARAM constant', () => {
        const val = extractShareParam(`#${SHARE_PARAM}=xyz789`);
        expect(val).toBe('xyz789');
    });

    test('handles additional params after the share value', () => {
        const val = extractShareParam('#resume=abc123&other=foo');
        expect(val).toBe('abc123');
    });
});

describe('share-link: isOversized', () => {
    test('returns false for short encoded strings', () => {
        expect(isOversized(encodeShareLink('Short resume'))).toBe(false);
    });

    test('returns false for non-string', () => {
        expect(isOversized(null)).toBe(false);
        expect(isOversized(42)).toBe(false);
    });

    test('returns true for strings over WARN_BYTES', () => {
        const longStr = 'x'.repeat(WARN_BYTES + 1);
        expect(isOversized(longStr)).toBe(true);
    });

    test('WARN_BYTES is a positive number', () => {
        expect(typeof WARN_BYTES).toBe('number');
        expect(WARN_BYTES).toBeGreaterThan(0);
    });
});
