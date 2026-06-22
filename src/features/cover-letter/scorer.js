/**
 * src/features/cover-letter/scorer.js
 *
 * Cover letter analysis utilities:
 *   - Word counting
 *   - Forbidden phrase detection
 *   - Word count health scoring
 *   - Basic ATS keyword matching against a JD
 */

// ── Forbidden phrases ─────────────────────────────────────────────────────────

export const FORBIDDEN_PHRASES = [
    'excited to apply',
    'excited about this opportunity',
    'thrilled to apply',
    'i am thrilled',
    'i am writing to express',
    'i am writing to apply',
    'please consider my application',
    'it would be an honor',
    'i would be a perfect fit',
    'perfect fit for',
    'i believe i would be',
    'passionate about',
    'highly motivated',
    'i am highly motivated',
    'i am a quick learner',
    'hardworking individual',
    'team player',
    'i am a team player',
    'i am eager to',
    'i would be grateful',
    'please feel free to contact me',
    'at your earliest convenience',
    'to whom it may concern',
    'i look forward to hearing from you at',
    'thank you for your consideration',
];

// ── Word counting ─────────────────────────────────────────────────────────────

/**
 * Count words in text, stripping Markdown syntax and HTML tags.
 * @param {string} text Raw markdown or HTML text
 * @returns {number}
 */
export function countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    // Strip HTML tags
    const noHtml = text.replace(/<[^>]*>/g, ' ');
    // Strip markdown syntax: **, *, #, >, `, links
    const noMd = noHtml
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/!\[.*?\]\(.*?\)/g, ' ')
        .replace(/\[.*?\]\(.*?\)/g, ' ')
        .replace(/^#{1,6}\s+/gm, ' ')
        .replace(/[*_~]{1,3}/g, ' ')
        .replace(/^[-*+]\s+/gm, ' ')
        .replace(/^\d+\.\s+/gm, ' ');
    return noMd.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Classify word count health.
 * @param {number} words
 * @returns {'low'|'good'|'amber'|'red'}
 */
export function scoreWordCount(words) {
    if (words < 150)       return 'low';
    if (words <= 300)      return 'good';
    if (words <= 350)      return 'amber';
    return 'red';
}

// ── Forbidden phrase detection ────────────────────────────────────────────────

/**
 * Detect forbidden phrases in the cover letter text.
 * @param {string} text
 * @returns {Array<{phrase: string, index: number, context: string}>}
 */
export function detectForbiddenPhrases(text) {
    if (!text || typeof text !== 'string') return [];
    const lower = text.toLowerCase();
    const hits = [];

    for (const phrase of FORBIDDEN_PHRASES) {
        let idx = lower.indexOf(phrase);
        while (idx !== -1) {
            const start = Math.max(0, idx - 20);
            const end   = Math.min(text.length, idx + phrase.length + 20);
            const context = (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
            hits.push({ phrase, index: idx, context });
            idx = lower.indexOf(phrase, idx + 1);
        }
    }

    // Deduplicate by phrase
    const seen = new Set();
    return hits.filter(h => {
        if (seen.has(h.phrase)) return false;
        seen.add(h.phrase);
        return true;
    });
}

// ── CL ATS score ──────────────────────────────────────────────────────────────

/**
 * Basic ATS compatibility score between cover letter text and JD.
 * Extracts single-word and 2-gram tokens from the JD, counts matches.
 *
 * @param {string} clText Cover letter text (markdown or plain)
 * @param {string} jdText Job description text
 * @returns {{ score: number, matched: string[], missing: string[], total: number }}
 */
export function scoreCoverLetterATS(clText, jdText) {
    if (!clText || !jdText) return { score: 0, matched: [], missing: [], total: 0 };

    const clLower  = clText.toLowerCase();
    const jdLower  = jdText.toLowerCase();
    const keywords = _extractJDKeywords(jdLower);
    if (keywords.length === 0) return { score: 0, matched: [], missing: [], total: 0 };

    const matched = [];
    const missing = [];

    for (const kw of keywords) {
        if (clLower.includes(kw)) {
            matched.push(kw);
        } else {
            missing.push(kw);
        }
    }

    const score = Math.round((matched.length / keywords.length) * 100);
    return { score, matched, missing, total: keywords.length };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const _STOP_WORDS = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
    'from','as','is','was','are','were','be','have','has','had','do','does','did',
    'will','would','should','could','may','might','must','can','this','that',
    'these','those','i','you','he','she','it','we','they','what','which','who',
    'when','where','why','how','our','your','their','its','we','us','not','no',
]);

function _extractJDKeywords(jdLower) {
    // Extract significant words (3+ chars, not stopwords)
    const words = jdLower
        .replace(/[^a-z0-9\s\-\/]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !_STOP_WORDS.has(w));

    // Count frequency; keep top 30 most frequent
    const freq = {};
    for (const w of words) freq[w] = (freq[w] || 0) + 1;

    return Object.entries(freq)
        .filter(([, c]) => c >= 2)           // must appear at least twice
        .sort(([, a], [, b]) => b - a)
        .slice(0, 30)
        .map(([w]) => w);
}
