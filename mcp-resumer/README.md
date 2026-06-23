# mcp-resumer

MCP (Model Context Protocol) server for the [Resumer](https://github.com/codemie/resumer) open-source resume builder.

Exposes 6 tools for AI coding assistants (GitHub Copilot, Claude, Cursor, etc.) to tailor resumes, analyse ATS scores, and generate cover letters — all without leaving your editor.

## Tools

| Tool | Description |
|------|-------------|
| `tailor_resume` | Tailor a resume to a job description; returns rewrites + keyword additions |
| `improve_bullet` | Rewrite a single bullet to be achievement-focused and ATS-friendly |
| `ats_check` | Score and gap-analyse a resume against a JD |
| `generate_summary` | Write a 4-bullet Professional Summary |
| `generate_cover_letter` | Write a 4-paragraph cover letter (250-300 words) |
| `get_profile` | Return the profile JSON schema |

## Setup

### Prerequisites

- Node.js 20+
- The Resumer project cloned locally

### Install

```bash
cd mcp-resumer
npm install
```

### Configure in VS Code (GitHub Copilot)

Add to your VS Code `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "resumer": {
        "type": "stdio",
        "command": "node",
        "args": ["/absolute/path/to/resumer/mcp-resumer/src/index.js"]
      }
    }
  }
}
```

Replace `/absolute/path/to/resumer` with your local clone path.

### Configure in Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "resumer": {
      "command": "node",
      "args": ["/absolute/path/to/resumer/mcp-resumer/src/index.js"]
    }
  }
}
```

## Usage Examples

Once configured, ask your AI assistant:

```text
@resumer tailor_resume job_description="Senior SDET at Acme Corp..."
```

```text
@resumer ats_check job_description="..." resume_type=classic
```

```text
@resumer improve_bullet bullet="Worked on automation framework" keywords="Selenium, CI/CD"
```

## Notes

- All tools read resume markdown files directly from the workspace — no server, no API keys needed for the MCP server itself.
- AI generation (via the browser UI) requires a running Ollama instance or a cloud provider API key configured in the app.
- Profile data (`profile.json`) is gitignored and never sent to this server.

## License

MIT
