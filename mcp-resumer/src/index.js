#!/usr/bin/env node
/**
 * mcp-resumer — MCP server exposing resume builder tools for AI coding assistants.
 *
 * Tools:
 *   tailor_resume       — Tailor a resume markdown to a job description
 *   improve_bullet      — Rewrite a single experience bullet for stronger ATS impact
 *   ats_check           — Score and gap-analyse a resume against a JD
 *   generate_summary    — Write a 4-bullet professional summary
 *   generate_cover_letter — Write a cover letter (4 paragraphs, 250-300 words)
 *   get_profile         — Return the current profile JSON from localStorage backup
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Helpers ──────────────────────────────────────────────────────────────────

async function readResumeFile(type = 'classic') {
    const map = { classic: 'components/resume/resume.md', professional: 'components/resume-professional/resume-professional.md', modern: 'components/resume-modern/resume-modern.md' };
    const file = path.join(ROOT, map[type] || map.qe);
    return fs.readFile(file, 'utf8');
}

async function readMasterContent() {
    const file = path.join(ROOT, '.github', 'resume-master-content.md');
    try { return await fs.readFile(file, 'utf8'); } catch { return ''; }
}

// ── Server ───────────────────────────────────────────────────────────────────

const server = new McpServer({
    name: 'resumer',
    version: '1.0.0',
});

// ── Tool: tailor_resume ───────────────────────────────────────────────────────

server.tool(
    'tailor_resume',
    'Analyse a resume against a job description and return tailored bullet rewrites plus ATS improvements. Never fabricates experience.',
    {
        job_description: z.string().min(50).describe('Full job description text'),
        resume_type: z.enum(['classic', 'professional', 'modern']).default('classic').describe('Which resume variant to tailor'),
    },
    async ({ job_description, resume_type }) => {
        const [resume, master] = await Promise.all([readResumeFile(resume_type), readMasterContent()]);
        return {
            content: [{
                type: 'text',
                text: buildTailorContext(resume, job_description, master),
            }],
        };
    }
);

function buildTailorContext(resume, jd, master) {
    return [
        '## Resume Tailoring Context',
        '',
        '### Job Description',
        jd,
        '',
        '### Current Resume',
        '```markdown',
        resume,
        '```',
        master ? `\n### Verified Facts (do not deviate)\n${master.slice(0, 4000)}` : '',
        '',
        '### Instructions for the model',
        '- Rewrite the Professional Summary (exactly 4 bullets) to match the JD keywords.',
        '- For each bullet rewrite, show: `[Section] Original → Tailored`.',
        '- List added keywords.',
        '- Estimate ATS score: `before/100 → after/100`.',
        '- NEVER fabricate experience, companies, or metrics.',
        '- No EM dashes (—) or EN dashes (–).',
    ].join('\n');
}

// ── Tool: improve_bullet ──────────────────────────────────────────────────────

server.tool(
    'improve_bullet',
    'Rewrite a single resume bullet point to be more achievement-focused and ATS-friendly.',
    {
        bullet: z.string().min(10).describe('The bullet point text to improve'),
        context: z.string().optional().describe('Optional: section name or target role for context'),
        keywords: z.string().optional().describe('Optional: comma-separated keywords to incorporate'),
    },
    async ({ bullet, context, keywords }) => {
        return {
            content: [{
                type: 'text',
                text: [
                    '## Bullet Improvement Task',
                    '',
                    `**Original bullet:** ${bullet}`,
                    context ? `**Context:** ${context}` : '',
                    keywords ? `**Keywords to include:** ${keywords}` : '',
                    '',
                    '### Instructions',
                    '- Start with a strong action verb (Led, Built, Designed, Automated, etc.).',
                    '- Include ONE measurable outcome (%, number, time).',
                    '- Keep to 1-2 lines maximum.',
                    '- Naturally include one of the provided keywords if given.',
                    '- No EM dashes, no "Responsible for", no "Worked on".',
                    '- Return: improved bullet + 1-line explanation of changes.',
                ].filter(Boolean).join('\n'),
            }],
        };
    }
);

// ── Tool: ats_check ───────────────────────────────────────────────────────────

server.tool(
    'ats_check',
    'Score and gap-analyse a resume against a job description. Returns missing keywords, weak placements, and quick wins.',
    {
        job_description: z.string().min(50).describe('Full job description text'),
        resume_type: z.enum(['classic', 'professional', 'modern']).default('classic').describe('Which resume variant to analyse'),
    },
    async ({ job_description, resume_type }) => {
        const resume = await readResumeFile(resume_type);
        return {
            content: [{
                type: 'text',
                text: [
                    '## ATS Gap Analysis Task',
                    '',
                    '### Job Description',
                    job_description,
                    '',
                    '### Resume',
                    '```markdown',
                    resume,
                    '```',
                    '',
                    '### Required Output',
                    '1. **ATS Score Estimate** (0-100) with rationale',
                    '2. **Critical Gaps** — must-have keywords missing (table: keyword | suggested section | insertion hint)',
                    '3. **Weak Placements** — keywords only in Skills section; suggest experience bullets',
                    '4. **Nice-to-Have Gaps** — secondary keywords',
                    '5. **Strengths Found** — well-placed keywords',
                    '6. **Top 3 Quick Wins** — ranked by score impact, include exact sentence to add',
                ].join('\n'),
            }],
        };
    }
);

// ── Tool: generate_summary ────────────────────────────────────────────────────

server.tool(
    'generate_summary',
    'Generate a 4-bullet Professional Summary tailored to a role and job description.',
    {
        job_description: z.string().optional().describe('Job description to tailor toward (optional)'),
        resume_type: z.enum(['classic', 'professional', 'modern']).default('classic'),
    },
    async ({ job_description, resume_type }) => {
        const [resume, master] = await Promise.all([readResumeFile(resume_type), readMasterContent()]);
        return {
            content: [{
                type: 'text',
                text: [
                    '## Professional Summary Generation Task',
                    '',
                    job_description ? `### Target Job Description\n${job_description}\n` : '',
                    '### Current Resume',
                    '```markdown',
                    resume.slice(0, 3000),
                    '```',
                    master ? `### Verified Facts\n${master.slice(0, 2000)}` : '',
                    '',
                    '### Rules',
                    '- Exactly 4 bullets.',
                    '- Bullet 1: years of experience + role identity.',
                    '- Bullet 2: major strengths aligned to JD.',
                    '- Bullet 3: key improvements delivered with metrics.',
                    '- Bullet 4: why fit for this team/domain.',
                    '- No EM dashes, no clichés (passionate, hardworking, team player).',
                    '- Use only verified metrics from the resume / master content.',
                ].filter(Boolean).join('\n'),
            }],
        };
    }
);

// ── Tool: generate_cover_letter ───────────────────────────────────────────────

server.tool(
    'generate_cover_letter',
    'Write a tailored 4-paragraph cover letter (250-300 words) for a job application.',
    {
        job_description: z.string().min(50).describe('Full job description text'),
        company: z.string().optional().describe('Company name'),
        role: z.string().optional().describe('Job title'),
        resume_type: z.enum(['classic', 'professional', 'modern']).default('classic'),
    },
    async ({ job_description, company, role, resume_type }) => {
        const [resume, master] = await Promise.all([readResumeFile(resume_type), readMasterContent()]);
        return {
            content: [{
                type: 'text',
                text: [
                    '## Cover Letter Generation Task',
                    '',
                    `Company: ${company || 'the company'}`,
                    `Role: ${role || 'the position'}`,
                    '',
                    '### Job Description',
                    job_description,
                    '',
                    '### Resume Summary',
                    resume.slice(0, 2500),
                    master ? `\n### Verified Facts\n${master.slice(0, 1500)}` : '',
                    '',
                    '### Structure',
                    '- Para 1 (1-2 lines): role + company + strong fit. No "thrilled" or "excited to apply".',
                    '- Para 2 (3-4 lines): 2-3 strengths with verified metrics.',
                    '- Para 3 (2-3 lines): specific company detail — genuine connection.',
                    '- Para 4 (1-2 lines): confident close.',
                    '- Total: 250-300 words. One page only.',
                    '- No EM dashes, no clichés.',
                    '- Use % symbol for percentages.',
                ].filter(Boolean).join('\n'),
            }],
        };
    }
);

// ── Tool: get_profile ─────────────────────────────────────────────────────────

server.tool(
    'get_profile',
    'Return the profile sample schema. Use as a reference for the expected profile JSON structure.',
    {},
    async () => {
        const samplePath = path.join(ROOT, 'profile.sample.json');
        let sample = '{}';
        try { sample = await fs.readFile(samplePath, 'utf8'); } catch { /* not found */ }
        return {
            content: [{
                type: 'text',
                text: [
                    '## Profile Schema',
                    '',
                    'The Resumer profile uses this JSON structure (stored in localStorage key `resumer-profile`):',
                    '',
                    '```json',
                    sample,
                    '```',
                ].join('\n'),
            }],
        };
    }
);

// ── Start ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
