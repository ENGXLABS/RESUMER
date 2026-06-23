import js from '@eslint/js';
import markdown from 'eslint-plugin-markdown';
import globals from 'globals';

export default [
    // ── JavaScript source files ──────────────────────────────────────────
    {
        files: ['src/**/*.js', 'tests/**/*.js', 'app.js'],
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
        },
    },

    // ── JS code blocks inside Markdown files ─────────────────────────────
    ...markdown.configs.recommended,
];
