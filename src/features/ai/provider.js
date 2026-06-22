/**
 * provider.js — AI provider abstraction for Resumer.
 *
 * Supports: Ollama (local), OpenAI, Anthropic, Custom endpoint.
 * API keys are stored in localStorage only — never persisted server-side.
 *
 * Usage:
 *   import { getProvider, setProvider, sendPrompt } from './provider.js';
 *   await sendPrompt('tailor', { resumeText, jdText });
 */

export const PROVIDERS = {
  ollama:    { label: 'Ollama (local, free)', baseUrl: 'http://localhost:11434', requiresKey: false },
  openai:    { label: 'OpenAI',               baseUrl: 'https://api.openai.com/v1', requiresKey: true },
  anthropic: { label: 'Anthropic (Claude)',   baseUrl: 'https://api.anthropic.com/v1', requiresKey: true },
  custom:    { label: 'Custom endpoint',      baseUrl: '',                        requiresKey: false },
};

const STORAGE_KEY  = 'resumer-ai-config';
const DEFAULT_CONFIG = {
  provider: 'ollama',
  model: 'llama3',
  customUrl: '',
  openaiKey: '',
  anthropicKey: '',
  temperature: 0.3,
};

// ─── Config persistence ───────────────────────────────────────────────────────

export function getConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : { ...DEFAULT_CONFIG };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(patch) {
  const current = getConfig();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
}

export function clearApiKeys() {
  const c = getConfig();
  saveConfig({ ...c, openaiKey: '', anthropicKey: '' });
}

// ─── Core send function ───────────────────────────────────────────────────────

/**
 * Send a prompt to the configured AI provider.
 * @param {string} system  - System prompt
 * @param {string} user    - User message
 * @param {object} [opts]  - Optional overrides: { provider, model, temperature }
 * @returns {Promise<string>} The text response
 */
export async function sendToProvider(system, user, opts = {}) {
  const config = { ...getConfig(), ...opts };
  const { provider } = config;

  switch (provider) {
    case 'ollama':    return _sendOllama(system, user, config);
    case 'openai':    return _sendOpenAI(system, user, config);
    case 'anthropic': return _sendAnthropic(system, user, config);
    case 'custom':    return _sendCustom(system, user, config);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

// ─── Provider implementations ─────────────────────────────────────────────────

async function _sendOllama(system, user, config) {
  const url = `${config.customUrl || PROVIDERS.ollama.baseUrl}/api/chat`;
  const body = {
    model: config.model || 'llama3',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user   },
    ],
    stream: false,
    options: { temperature: config.temperature },
  };
  const res = await _fetch(url, body, {});
  return res.message?.content ?? '';
}

async function _sendOpenAI(system, user, config) {
  if (!config.openaiKey) throw new Error('OpenAI API key not configured.');
  const url = `${PROVIDERS.openai.baseUrl}/chat/completions`;
  const body = {
    model: config.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user   },
    ],
    temperature: config.temperature,
  };
  const res = await _fetch(url, body, {
    Authorization: `Bearer ${config.openaiKey}`,
  });
  return res.choices?.[0]?.message?.content ?? '';
}

async function _sendAnthropic(system, user, config) {
  if (!config.anthropicKey) throw new Error('Anthropic API key not configured.');
  const url = `${PROVIDERS.anthropic.baseUrl}/messages`;
  const body = {
    model: config.model || 'claude-3-haiku-20240307',
    max_tokens: 4096,
    system,
    messages: [{ role: 'user', content: user }],
    temperature: config.temperature,
  };
  const res = await _fetch(url, body, {
    'x-api-key': config.anthropicKey,
    'anthropic-version': '2023-06-01',
  });
  return res.content?.[0]?.text ?? '';
}

async function _sendCustom(system, user, config) {
  const url = config.customUrl;
  if (!url) throw new Error('Custom endpoint URL not configured.');
  // OpenAI-compatible format
  const body = {
    model: config.model || 'default',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user   },
    ],
    temperature: config.temperature,
  };
  const res = await _fetch(url, body, {});
  // Try OpenAI shape first, then Ollama shape
  return res.choices?.[0]?.message?.content ?? res.message?.content ?? '';
}

async function _fetch(url, body, extraHeaders) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`AI provider error ${response.status}: ${errText}`);
  }
  return response.json();
}

// ─── Connection test ──────────────────────────────────────────────────────────

/**
 * Test the current provider connection.
 * @returns {Promise<{ ok: boolean, message: string }>}
 */
export async function testConnection() {
  try {
    const text = await sendToProvider('You are a helpful assistant.', 'Reply with the single word: CONNECTED', { temperature: 0 });
    const ok = text.includes('CONNECTED');
    return { ok, message: ok ? 'Connection successful' : `Unexpected response: ${text.slice(0, 60)}` };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
