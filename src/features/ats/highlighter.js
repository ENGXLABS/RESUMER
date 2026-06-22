/**
 * highlighter.js — Keyword heat map for the resume preview.
 *
 * Wraps matched and missing keywords in the rendered preview HTML
 * with CSS classes that show green/amber highlights.
 *
 * Usage:
 *   import { applyHeatMap, removeHeatMap } from './highlighter.js';
 *   applyHeatMap(previewContainer, matchedKeywords, missingKeywords);
 *   removeHeatMap(previewContainer);
 */

const MATCH_CLASS  = 'kw-match';
const MISS_CLASS   = 'kw-miss';
const WRAP_CLASS   = 'kw-highlighted';

/**
 * Apply keyword heat map to a DOM container.
 * @param {Element} container - The resume preview container
 * @param {string[]} matched  - Keywords found in resume
 * @param {string[]} missing  - Keywords in JD but not in resume
 */
export function applyHeatMap(container, matched, missing) {
  removeHeatMap(container);

  // Build a single sorted list: longer phrases first to avoid partial overlaps
  const matKw = [...matched].sort((a, b) => b.length - a.length);
  const misKw = [...missing].sort((a, b) => b.length - a.length);

  walkTextNodes(container, (textNode) => {
    const text = textNode.nodeValue;
    if (!text.trim()) return;

    const result = highlightText(text, matKw, misKw);
    if (result === null) return; // no changes

    const span = document.createElement('span');
    span.className = WRAP_CLASS;
    span.innerHTML = result;
    textNode.parentNode.replaceChild(span, textNode);
  });
}

/**
 * Remove all heat map highlighting from a container.
 * @param {Element} container
 */
export function removeHeatMap(container) {
  container.querySelectorAll(`.${WRAP_CLASS}`).forEach(el => {
    el.replaceWith(...el.childNodes);
  });
}

/**
 * Walk all text nodes in a subtree (skip script/style).
 * @param {Element} root
 * @param {Function} fn  - Called with each Text node
 */
function walkTextNodes(root, fn) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement?.tagName?.toLowerCase();
        if (['script', 'style', 'code', 'pre'].includes(parent)) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest(`.${WRAP_CLASS}`)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  // Process in reverse to avoid invalidating the walker
  nodes.forEach(fn);
}

/**
 * Wrap keyword occurrences in a text string with highlight spans.
 * Returns null if no changes were made.
 * @param {string} text
 * @param {string[]} matched
 * @param {string[]} missing
 * @returns {string|null}
 */
function highlightText(text, matched, missing) {
  let result = escapeHtml(text);
  let changed = false;

  // Apply matched highlights (green)
  for (const kw of matched) {
    const escaped = escapeRegex(kw);
    const re = new RegExp(`(${escaped})`, 'gi');
    if (re.test(result)) {
      result = result.replace(new RegExp(`(${escaped})`, 'gi'), `<span class="${MATCH_CLASS}">$1</span>`);
      changed = true;
    }
  }

  // Apply missing highlights (amber) — only if not already marked matched
  for (const kw of missing) {
    const escaped = escapeRegex(kw);
    // Skip if already wrapped in a match span
    const re = new RegExp(`(?<!<span[^>]*>)(${escaped})(?!</span>)`, 'gi');
    if (re.test(result)) {
      result = result.replace(new RegExp(`(${escaped})`, 'gi'), (match, p1, offset, str) => {
        // Don't double-wrap
        const before = str.slice(Math.max(0, offset - 20), offset);
        if (before.includes(`class="${MATCH_CLASS}"`)) return match;
        return `<span class="${MISS_CLASS}">$1</span>`.replace('$1', p1);
      });
      changed = true;
    }
  }

  return changed ? result : null;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
