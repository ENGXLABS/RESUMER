/**
 * src/features/ats/index.js — barrel export for the ATS feature module.
 *
 * Import from here for clean external usage:
 *   import { extractKeywords, calculateATSScore, applyHeatMap } from '../../features/ats/index.js';
 */

export { extractKeywords, getVariations, parseSections, calculateATSScore } from './scorer.js';
export { applyHeatMap, removeHeatMap } from './highlighter.js';
