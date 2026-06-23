# AI Integration

The AI features in Resumer help you tailor resume bullets, write a professional summary, and improve cover letters. The integration is provider-agnostic — it works with **Ollama** (local), **OpenAI**, and **Anthropic**.

AI logic lives in [`src/features/ai/`](../src/features/ai/).

---

## Quick Setup

### Option 1: Ollama (Local, Recommended)

1. Install [Ollama](https://ollama.com/download)
2. Pull a model:

```bash
ollama pull llama3
# or
ollama pull mistral
```

1. In the app, go to **AI Settings** and set:
   - **Provider:** `ollama`
   - **Model:** `llama3` (or your pulled model)
   - **Base URL:** `http://localhost:11434`

No API key required.

---

### Option 2: OpenAI

1. Get an API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. In **AI Settings** set:
   - **Provider:** `openai`
   - **Model:** `gpt-4o` or `gpt-3.5-turbo`
   - **API Key:** your key

---

### Option 3: Anthropic

1. Get an API key from [console.anthropic.com](https://console.anthropic.com/)
2. In **AI Settings** set:
   - **Provider:** `anthropic`
   - **Model:** `claude-3-5-sonnet-20241022`
   - **API Key:** your key

---

## AI Settings Storage

AI configuration is saved to `localStorage` under the key `resumer-ai-config`:

```json
{
  "provider": "ollama",
  "model":    "llama3",
  "baseUrl":  "http://localhost:11434",
  "apiKey":   ""
}
```

> **Security:** API keys are stored only in your browser's `localStorage`. They are never committed to the repository or sent to any server other than the AI provider you configure.

---

## Available AI Actions

| Action | Trigger | What it does |
|--------|---------|-------------|
| **Improve Bullet** | Right-click bullet / AI panel | Rewrites the selected bullet with stronger action verbs and metrics |
| **Write Summary** | AI panel → Generate Summary | Creates a 4-bullet professional summary from your profile + target JD |
| **Cover Letter** | Cover Letter tab → Generate | Writes a full cover letter aligned to the current JD |
| **ATS Suggestions** | ATS panel → AI Suggestions | Recommends missing keywords to weave into your resume naturally |

---

## Provider API Reference

### Ollama

- Base URL: `http://localhost:11434`
- Endpoint used: `/api/chat` (streaming)
- Docs: [Ollama REST API](https://github.com/ollama/ollama/blob/main/docs/api.md)

### OpenAI

- Base URL: `https://api.openai.com/v1`
- Endpoint used: `/chat/completions`
- Docs: [OpenAI API](https://platform.openai.com/docs/api-reference)

### Anthropic

- Base URL: `https://api.anthropic.com/v1`
- Endpoint used: `/messages`
- Docs: [Anthropic API](https://docs.anthropic.com/en/api)

---

## Prompt Files

System prompts are stored in `src/features/ai/prompts/`. Each file is a plain text template:

```text
src/features/ai/prompts/
├── improve-bullet.txt
├── write-summary.txt
├── cover-letter.txt
└── ats-suggestions.txt
```

Edit these files to tune the AI behaviour for your use case.

---

## MCP Server (Optional)

If you use Claude Desktop or another MCP-compatible client, you can connect Resumer as an MCP server for deeper integration. See the MCP configuration in `src/features/ai/mcp/` for setup instructions.
