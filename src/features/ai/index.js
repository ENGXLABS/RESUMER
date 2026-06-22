/**
 * src/features/ai/index.js — barrel export for the AI feature module.
 */

export {
  PROVIDERS,
  getConfig,
  saveConfig,
  clearApiKeys,
  sendToProvider,
  testConnection,
} from './provider.js';

export {
  parsePastePrompt,
  tailorResumePrompt,
  improveBulletPrompt,
  generateCoverLetterPrompt,
  generateSummaryPrompt,
  atsGapPrompt,
} from './prompts.js';

export {
  extractJSON,
  parsePasteResponse,
  parseTailorResponse,
  parseBulletResponse,
  parseCoverLetterResponse,
  parseSummaryResponse,
  parseATSGapResponse,
} from './parser.js';
