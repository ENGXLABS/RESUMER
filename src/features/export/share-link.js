/**
 * Share-link encoder/decoder — Base64 encodes resume markdown into a URL hash.
 * Works in both browser (btoa/atob) and Node 16+ (global btoa/atob or Buffer).
 * Pure ES module, zero external deps, fully unit-testable.
 */

export const SHARE_PARAM = 'resume';

/** Maximum encoded length before showing a size warning (characters) */
export const WARN_BYTES = 8000;

/**
 * Encode markdown text → URL-safe Base64 string.
 * Uses TextEncoder for reliable UTF-8 handling.
 * @param {string} markdown
 * @returns {string} base64 encoded string
 */
export function encodeShareLink(markdown) {
    if (typeof markdown !== 'string') throw new TypeError('markdown must be a string');
    const bytes = new TextEncoder().encode(markdown);
    const binary = Array.from(bytes, b => String.fromCharCode(b)).join('');
    return btoa(binary);
}

/**
 * Decode a base64 share string back to markdown text.
 * @param {string} encoded - base64 string from encodeShareLink
 * @returns {string|null} decoded markdown, or null if decoding fails
 */
export function decodeShareLink(encoded) {
    if (typeof encoded !== 'string') return null;
    try {
        const binary = atob(encoded);
        const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    } catch {
        return null;
    }
}

/**
 * Build a full shareable URL from markdown content.
 * @param {string} markdown - resume markdown to encode
 * @param {string} [baseURL] - base URL (defaults to current location without hash)
 * @returns {string} full URL with encoded resume in hash
 */
export function buildShareURL(markdown, baseURL = '') {
    const encoded = encodeShareLink(markdown);
    const base = baseURL || (
        typeof window !== 'undefined'
            ? window.location.href.split('#')[0]
            : 'https://resumer.app/'
    );
    return `${base}#${SHARE_PARAM}=${encoded}`;
}

/**
 * Extract the share param from a URL hash string.
 * @param {string} hash - URL hash (e.g. '#resume=abc123')
 * @returns {string|null} encoded value, or null if not present
 */
export function extractShareParam(hash) {
    if (typeof hash !== 'string') return null;
    const match = hash.match(new RegExp(`[#&]${SHARE_PARAM}=([^&]+)`));
    return match ? match[1] : null;
}

/**
 * Check if an encoded string exceeds the recommended URL length.
 * @param {string} encoded
 * @returns {boolean}
 */
export function isOversized(encoded) {
    return typeof encoded === 'string' && encoded.length > WARN_BYTES;
}
