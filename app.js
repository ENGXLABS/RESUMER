/* ============================================================
   RESUMER — Application Logic (Production-Ready)
   ============================================================ */

(function () {
    'use strict';

    // ────── State ──────
    let currentMode = 'preview';
    let markdownContent = '';
    let coverLetterContent = '';
    let currentResumeType = 'qe';
    let currentZoomLevel = 100;
    let currentTab = 'resume';

    // ────── DOM Cache ──────
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ────── Toast Notification System ──────
    window.toast = function (message, type = 'info', duration = 3500) {
        const container = $('#toast-container');
        if (!container) return;

        const icons = {
            success: 'mdi:check-circle',
            warning: 'mdi:alert-circle',
            error: 'mdi:close-circle',
            info: 'mdi:information'
        };

        const el = document.createElement('div');
        el.className = `toast toast--${type}`;
        el.innerHTML = `
            <span class="toast__icon"><span class="iconify" data-icon="${icons[type] || icons.info}"></span></span>
            <span class="toast__message">${message}</span>
            <button class="toast__close" onclick="this.parentElement.classList.add('toast-exit'); setTimeout(() => this.parentElement.remove(), 250);">&times;</button>
        `;

        container.appendChild(el);

        // Auto-dismiss
        setTimeout(() => {
            if (el.parentElement) {
                el.classList.add('toast-exit');
                setTimeout(() => el.remove(), 250);
            }
        }, duration);
    };

    // ────── Theme Management ──────
    function initTheme() {
        const saved = localStorage.getItem('resumer-theme');
        if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateThemeIcon(true);
        }
    }

    window.toggleTheme = function () {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('resumer-theme', 'light');
            updateThemeIcon(false);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('resumer-theme', 'dark');
            updateThemeIcon(true);
        }
    };

    function updateThemeIcon(isDark) {
        const lightIcon = $('.theme-icon-light');
        const darkIcon = $('.theme-icon-dark');
        if (lightIcon) lightIcon.style.display = isDark ? 'none' : 'inline-block';
        if (darkIcon) darkIcon.style.display = isDark ? 'inline-block' : 'none';
    }

    // ────── Shortcut Modal ──────
    window.openShortcutModal = function () {
        const modal = $('#shortcut-modal');
        if (modal) modal.classList.add('is-open');
    };

    window.closeShortcutModal = function () {
        const modal = $('#shortcut-modal');
        if (modal) modal.classList.remove('is-open');
    };

    // ────── Keyboard Shortcuts ──────
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const isMod = e.metaKey || e.ctrlKey;

            // Escape closes modal or exits edit mode
            if (e.key === 'Escape') {
                if ($('#shortcut-modal')?.classList.contains('is-open')) {
                    closeShortcutModal();
                } else if (currentMode === 'edit') {
                    e.preventDefault();
                    discardChanges();
                }
                return;
            }

            // Cmd/Ctrl + Shift + ? → Shortcut help
            if (isMod && e.shiftKey && e.key === '?') {
                e.preventDefault();
                openShortcutModal();
                return;
            }

            // Cmd/Ctrl + S → Save (only in edit mode)
            if (isMod && e.key === 's') {
                e.preventDefault();
                if (currentMode === 'edit') saveResume();
                return;
            }

            // Cmd/Ctrl + P → Print
            if (isMod && e.key === 'p') {
                e.preventDefault();
                window.print();
                return;
            }

            // Cmd/Ctrl + E → Toggle edit
            if (isMod && e.key === 'e') {
                e.preventDefault();
                toggleMode();
                return;
            }

            // Cmd/Ctrl + D → Download
            if (isMod && e.key === 'd') {
                e.preventDefault();
                downloadMarkdown();
                return;
            }

            // Cmd/Ctrl + 1/2/3 → Tabs
            if (isMod && e.key === '1') { e.preventDefault(); switchTab('resume'); }
            if (isMod && e.key === '2') { e.preventDefault(); switchTab('cover-letter'); }
            if (isMod && e.key === '3') { e.preventDefault(); switchTab('ats-checker'); }

            // Cmd/Ctrl + Shift + D → Toggle dark mode
            if (isMod && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }

    // ────── Template Switching (v1 / v2 / v3) ──────
    let currentTemplate = 'v1';

    window.switchTemplate = function (tpl) {
        currentTemplate = tpl;
        sessionStorage.setItem('currentTemplate', tpl);

        const v1 = $('#resume-css-v1');
        const v2 = $('#resume-css-v2');
        const v3 = $('#resume-css-v3');
        const settings = $('#resume-settings-css');

        // Disable all first
        if (v1) v1.disabled = true;
        if (v2) v2.disabled = true;
        if (v3) v3.disabled = true;
        if (settings) settings.disabled = true;

        if (tpl === 'v3') {
            if (v3) v3.disabled = false;
        } else if (tpl === 'v2') {
            if (v2) v2.disabled = false;
        } else {
            if (v1) v1.disabled = false;
            if (settings) settings.disabled = false;
        }

        $('#tpl-v1-btn')?.classList.toggle('active', tpl === 'v1');
        $('#tpl-v2-btn')?.classList.toggle('active', tpl === 'v2');
        $('#tpl-v3-btn')?.classList.toggle('active', tpl === 'v3');

        // Re-render preview to apply/remove V3 DOM restructuring
        updatePreview();

        const labels = { v1: 'Classic', v2: 'Modern', v3: 'Two-Column' };
        toast(`Template: ${labels[tpl] || 'Classic'}`, 'info');
    };

    function initTemplate() {
        const saved = sessionStorage.getItem('currentTemplate');
        if (saved === 'v2') switchTemplate('v2');
        else if (saved === 'v3') switchTemplate('v3');
    }

    // ────── Resume Loading & Switching ──────
    window.switchResumeType = function (type) {
        currentResumeType = type;
        sessionStorage.setItem('currentResumeType', type);

        $('#qe-resume-btn').classList.toggle('active', type === 'qe');
        $('#tpm-resume-btn').classList.toggle('active', type === 'tpm');
        const aiBtn = $('#ai-resume-btn');
        if (aiBtn) aiBtn.classList.toggle('active', type === 'ai');

        // Handle AI-specific CSS and template selector visibility
        const aiCss = $('#resume-css-ai');
        const tplSelector = $('#template-selector');
        if (type === 'ai') {
            // Enable AI CSS, disable QE template CSS
            if (aiCss) aiCss.disabled = false;
            const v1 = $('#resume-css-v1');
            const v2 = $('#resume-css-v2');
            const v3 = $('#resume-css-v3');
            const settings = $('#resume-settings-css');
            if (v1) v1.disabled = true;
            if (v2) v2.disabled = true;
            if (v3) v3.disabled = true;
            if (settings) settings.disabled = true;
            if (tplSelector) tplSelector.style.display = 'none';
        } else {
            // Disable AI CSS, restore template selector
            if (aiCss) aiCss.disabled = true;
            if (tplSelector) tplSelector.style.display = 'flex';
            // Re-apply current template
            switchTemplate(currentTemplate);
        }

        loadResume();
        updateStatusBar();
    };

    function loadResume() {
        let path;
        if (currentResumeType === 'ai') path = 'components/resume-ai/resume-ai.md';
        else if (currentResumeType === 'tpm') path = 'components/resume-tpm/resume-tpm.md';
        else path = 'components/resume/resume.md';

        fetch(path)
            .then(r => r.text())
            .then(text => {
                markdownContent = text;
                updatePreview();
                const editor = $('#markdown-editor');
                if (editor) editor.value = text;
                updateStatusBar();
                if (window._triggerLiveATS) window._triggerLiveATS();
            })
            .catch(() => {
                $('#resume-content').innerHTML = `
                    <div class="empty-state">
                        <span class="iconify" data-icon="mdi:file-alert"></span>
                        <h3>Could not load resume</h3>
                        <p>Make sure your local server is running and the markdown file exists.</p>
                    </div>`;
                toast('Failed to load resume file', 'error');
            });
    }

    // ────── Preview ──────
    function updatePreview() {
        const content = marked.parse(markdownContent);
        const container = $('#resume-content');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = content;
        wrapper.className = 'resume-page';
        container.innerHTML = '';

        if (currentResumeType === 'ai') {
            restructureForAI(wrapper);
        } else if (currentTemplate === 'v3') {
            restructureForV3(wrapper);
        }

        container.appendChild(wrapper);
    }

    // ────── V3 DOM Restructuring ──────
    // Transforms flat markdown HTML into the "Impact-First" layout:
    //   .v3-header       (centered name + accent line + contact icons)
    //   .v3-metrics      (4 key impact numbers extracted from content)
    //   sections flow:   Summary → Core Skills (pills) → Technical Skills (tags)
    //                    → Experience (timeline) → Projects → Achievements (highlight)
    //                    → Certifications (badges) → Education (minimal)

    const v3Icons = {
        'professional summary': 'mdi:account-outline',
        'core skills': 'mdi:star-four-points-outline',
        'technical skills': 'mdi:wrench-outline',
        'professional experience': 'mdi:briefcase-outline',
        'projects': 'mdi:folder-outline',
        'key achievements': 'mdi:trophy-outline',
        'certifications': 'mdi:certificate-outline',
        'education': 'mdi:school-outline'
    };

    // Extract key metrics from the resume text for the dashboard strip
    function extractMetrics(text) {
        const metrics = [];
        const patterns = [
            { regex: /(\d+)\s*(?:\+\s*)?years?\s+of\s+experience/i, label: 'Years Experience' },
            { regex: /coverage\s+(?:from\s+\d+%\s+)?to\s+(\d+)%/i, label: 'Test Coverage' },
            { regex: /reducing?\s+(?:late[- ]cycle\s+)?defects?\s+by\s+(\d+)%/i, label: 'Defect Reduction' },
            { regex: /automat(?:ing|ed)\s+(\d+)\+?\s+critical/i, label: 'Workflows Automated' },
            { regex: /(\d+)\+?\s+breaking\s+(?:api\s+)?changes/i, label: 'Breaking Changes Caught' },
            { regex: /regression\s+time\s+by\s+(\d+)%/i, label: 'Faster Regression' },
            { regex: /(\d+)M\+?\s+users/i, label: 'Users Served', transform: v => v + 'M+' },
            { regex: /pipeline\s+time\s+by\s+(\d+)%/i, label: 'CI/CD Speedup' }
        ];

        for (const p of patterns) {
            if (metrics.length >= 4) break;
            const match = text.match(p.regex);
            if (match) {
                let value = match[1];
                if (p.transform) value = p.transform(value);
                else if (p.label.includes('%') || p.label.includes('Reduction') || p.label.includes('Faster') || p.label.includes('Speedup') || p.label.includes('Coverage')) value += '%';
                else if (p.label.includes('Years')) value += '+';
                metrics.push({ value, label: p.label });
            }
        }

        return metrics;
    }

    function restructureForV3(wrapper) {
        const plainText = wrapper.textContent || '';

        // ── 1. Header: name + contact ──
        const header = document.createElement('div');
        header.className = 'v3-header';

        const h1 = wrapper.querySelector('h1');
        if (h1) {
            const nameEl = document.createElement('h1');
            nameEl.textContent = h1.textContent;
            header.appendChild(nameEl);
        }

        const firstP = wrapper.querySelector('h1 + p');
        if (firstP) {
            const contactDiv = document.createElement('div');
            contactDiv.className = 'v3-contact';
            const iconMap = {
                'mailto:': 'mdi:email-outline',
                'tel:': 'mdi:phone-outline',
                'linkedin': 'mdi:linkedin',
                'github.com': 'mdi:github',
                'portfolio': 'mdi:briefcase-outline',
                'sivasankaramalan.is': 'mdi:briefcase-outline'
            };
            firstP.querySelectorAll('a').forEach(link => {
                const a = document.createElement('a');
                a.href = link.href;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                let icon = 'mdi:link';
                const href = (link.href || '').toLowerCase();
                const text = (link.textContent || '').toLowerCase();
                for (const [key, val] of Object.entries(iconMap)) {
                    if (href.includes(key) || text.includes(key)) { icon = val; break; }
                }
                a.innerHTML = `<span class="iconify" data-icon="${icon}"></span>${link.textContent}`;
                contactDiv.appendChild(a);
            });
            header.appendChild(contactDiv);
        }

        // ── 2. Impact metrics strip ──
        const metricsData = extractMetrics(plainText);
        let metricsEl = null;
        if (metricsData.length >= 3) {
            metricsEl = document.createElement('div');
            metricsEl.className = 'v3-metrics';
            metricsData.forEach(m => {
                const cell = document.createElement('div');
                cell.className = 'v3-metric';
                cell.innerHTML = `<span class="v3-metric-value">${m.value}</span><span class="v3-metric-label">${m.label}</span>`;
                metricsEl.appendChild(cell);
            });
        }

        // ── 3. Collect sections ──
        const sections = [];
        let currentSection = null;
        for (const el of Array.from(wrapper.children)) {
            if (el.tagName === 'H1' || (el.tagName === 'P' && el === firstP)) continue;
            if (el.tagName === 'H2') {
                currentSection = { name: el.textContent.trim().toLowerCase(), heading: el, elements: [] };
                sections.push(currentSection);
            } else if (currentSection) {
                currentSection.elements.push(el);
            }
        }

        // ── 4. Build each section ──
        const output = document.createDocumentFragment();
        output.appendChild(header);
        if (metricsEl) output.appendChild(metricsEl);

        for (const section of sections) {
            const iconName = v3Icons[section.name] || 'mdi:information-outline';

            // Section title
            const title = document.createElement('div');
            title.className = 'v3-section-title';
            title.innerHTML = `<span class="iconify" data-icon="${iconName}"></span>${section.heading.textContent}`;

            // ── Professional Summary ──
            if (section.name === 'professional summary') {
                output.appendChild(title);
                const wrap = document.createElement('div');
                wrap.className = 'v3-summary';
                section.elements.forEach(el => wrap.appendChild(el.cloneNode(true)));
                output.appendChild(wrap);
                continue;
            }

            // ── Core Skills → pills ──
            if (section.name === 'core skills') {
                output.appendChild(title);
                const grid = document.createElement('div');
                grid.className = 'v3-skills-grid';
                section.elements.forEach(el => {
                    const text = el.textContent || '';
                    const skills = [];
                    let depth = 0, start = 0;
                    for (let i = 0; i < text.length; i++) {
                        if (text[i] === '(') depth++;
                        else if (text[i] === ')') depth--;
                        else if (text[i] === ',' && depth === 0) {
                            const s = text.slice(start, i).trim();
                            if (s) skills.push(s);
                            start = i + 1;
                        }
                    }
                    const last = text.slice(start).trim();
                    if (last) skills.push(last);
                    skills.forEach((skill, idx) => {
                        const pill = document.createElement('span');
                        pill.className = 'v3-skill-pill';
                        pill.textContent = skill;
                        grid.appendChild(pill);
                        if (idx < skills.length - 1) {
                            grid.appendChild(document.createTextNode('  \u00B7  '));
                        }
                    });
                });
                output.appendChild(grid);
                continue;
            }

            // ── Technical Skills → tags ──
            if (section.name === 'technical skills') {
                output.appendChild(title);
                const tags = document.createElement('div');
                tags.className = 'v3-tech-tags';
                section.elements.forEach(el => {
                    (el.textContent || '').split(',').map(s => s.trim()).filter(Boolean).forEach(skill => {
                        const tag = document.createElement('span');
                        tag.className = 'v3-tech-tag';
                        tag.textContent = skill;
                        tags.appendChild(tag);
                    });
                });
                output.appendChild(tags);
                continue;
            }

            // ── Professional Experience → timeline ──
            if (section.name === 'professional experience') {
                output.appendChild(title);
                const timeline = document.createElement('div');
                timeline.className = 'v3-experience';

                let currentJob = null;
                for (const el of section.elements) {
                    if (el.tagName === 'H3') {
                        currentJob = document.createElement('div');
                        currentJob.className = 'v3-job';
                        const jobHeader = document.createElement('div');
                        jobHeader.className = 'v3-job-header';

                        // Extract title and dates
                        const titleText = el.childNodes[0]?.textContent?.trim() || el.textContent.trim();
                        const dateSpan = el.querySelector('.normal');
                        const dates = dateSpan ? dateSpan.textContent.trim() : '';

                        const titleEl = document.createElement('div');
                        titleEl.className = 'v3-job-title';
                        titleEl.textContent = titleText.replace(/\s+$/, '');

                        jobHeader.appendChild(titleEl);

                        if (dates) {
                            const dateEl = document.createElement('div');
                            dateEl.className = 'v3-job-dates';
                            dateEl.textContent = dates;
                            jobHeader.appendChild(dateEl);
                        }

                        currentJob.appendChild(jobHeader);
                        timeline.appendChild(currentJob);
                    } else if (el.tagName === 'H4' && currentJob) {
                        const company = document.createElement('div');
                        company.className = 'v3-job-company';
                        company.textContent = el.textContent;
                        currentJob.appendChild(company);
                    } else if (currentJob) {
                        currentJob.appendChild(el.cloneNode(true));
                    }
                }

                output.appendChild(timeline);
                continue;
            }

            // ── Projects ──
            if (section.name === 'projects' || section.name === 'selected projects') {
                output.appendChild(title);
                const wrap = document.createElement('div');
                wrap.className = 'v3-projects';

                let currentProject = null;
                for (const el of section.elements) {
                    if (el.tagName === 'H3') {
                        currentProject = document.createElement('div');
                        currentProject.className = 'v3-project';
                        const pTitle = document.createElement('div');
                        pTitle.className = 'v3-project-title';
                        pTitle.textContent = el.textContent.trim();
                        currentProject.appendChild(pTitle);
                        wrap.appendChild(currentProject);
                    } else if (currentProject) {
                        currentProject.appendChild(el.cloneNode(true));
                    }
                }

                output.appendChild(wrap);
                continue;
            }

            // ── Key Achievements → highlighted block ──
            if (section.name === 'key achievements') {
                output.appendChild(title);
                const wrap = document.createElement('div');
                wrap.className = 'v3-achievements';
                section.elements.forEach(el => wrap.appendChild(el.cloneNode(true)));
                output.appendChild(wrap);
                continue;
            }

            // ── Certifications → badge chips ──
            if (section.name === 'certifications') {
                output.appendChild(title);
                const certs = document.createElement('div');
                certs.className = 'v3-certs';
                section.elements.forEach(el => {
                    if (el.tagName === 'UL') {
                        el.querySelectorAll('li').forEach(li => {
                            const badge = document.createElement('div');
                            badge.className = 'v3-cert-badge';
                            badge.innerHTML = `<span class="iconify" data-icon="mdi:certificate-outline"></span>${li.innerHTML}`;
                            certs.appendChild(badge);
                        });
                    }
                });
                output.appendChild(certs);
                continue;
            }

            // ── Education → minimal ──
            if (section.name === 'education') {
                output.appendChild(title);
                const wrap = document.createElement('div');
                wrap.className = 'v3-education';
                section.elements.forEach(el => {
                    const entry = document.createElement('div');
                    entry.className = 'v3-edu-entry';
                    entry.innerHTML = el.innerHTML;
                    wrap.appendChild(entry);
                });
                output.appendChild(wrap);
                continue;
            }

            // ── Default fallback ──
            output.appendChild(title);
            section.elements.forEach(el => output.appendChild(el.cloneNode(true)));
        }

        // ── 5. Replace wrapper contents ──
        wrapper.innerHTML = '';
        wrapper.appendChild(output);
    }

    // ────── AI "Neural" DOM Restructuring ──────
    // Transforms flat markdown into the AI-Native resume layout:
    //   .ai-header       (centered name + gradient accent + contact icons)
    //   .ai-metrics      (4 AI-specific impact metrics dashboard)
    //   sections:        Summary → Core Skills (capsules) → Technical Skills (tags)
    //                    → Experience (timeline) → AI Agent Projects (cards)
    //                    → Achievements (highlight strip) → Certs (badges) → Education

    const aiIcons = {
        'professional summary': 'mdi:account-circle-outline',
        'core skills': 'mdi:brain',
        'technical skills': 'mdi:cpu-64-bit',
        'professional experience': 'mdi:briefcase-outline',
        'ai agent projects': 'mdi:robot-outline',
        'key achievements': 'mdi:trophy-outline',
        'certifications': 'mdi:certificate-outline',
        'education': 'mdi:school-outline'
    };

    function extractAIMetrics(text) {
        const metrics = [];
        const patterns = [
            { regex: /(\d+)\s+production-grade\s+AI\s+agents/i, label: 'AI Agents Built' },
            { regex: /(\d+)\+?\s+hours?\s+(?:saved\s+)?per\s+quarter/i, label: 'Hrs Saved / Quarter', transform: v => v + '+' },
            { regex: /(\d+)%\s+reduction\s+in\s+test\s+case\s+creation/i, label: 'Faster Test Creation', transform: v => v + '%' },
            { regex: /(\d+)-person\s+QE\s+organization/i, label: 'Engineers Trained' },
            { regex: /across\s+(\d+)\s+(?:DCX\s+)?teams/i, label: 'Teams Adopted' },
            { regex: /(\d+)\s*(?:\+\s*)?years?\s+of\s+experience/i, label: 'Years Experience', transform: v => v + '+' },
        ];
        for (const p of patterns) {
            if (metrics.length >= 4) break;
            const match = text.match(p.regex);
            if (match) {
                const value = p.transform ? p.transform(match[1]) : match[1];
                metrics.push({ value, label: p.label });
            }
        }
        return metrics;
    }

    function restructureForAI(wrapper) {
        const plainText = wrapper.textContent || '';

        // ── 1. Header ──
        const header = document.createElement('div');
        header.className = 'ai-header';

        const h1 = wrapper.querySelector('h1');
        if (h1) {
            const nameEl = document.createElement('h1');
            nameEl.textContent = h1.textContent;
            header.appendChild(nameEl);
        }

        const firstP = wrapper.querySelector('h1 + p');
        if (firstP) {
            const contactDiv = document.createElement('div');
            contactDiv.className = 'ai-contact';
            const iconMap = {
                'mailto:': 'mdi:email-outline',
                'linkedin': 'mdi:linkedin',
                'github.com': 'mdi:github',
                'portfolio': 'mdi:web',
                'sivasankaramalan.is': 'mdi:web'
            };
            firstP.querySelectorAll('a').forEach(link => {
                const a = document.createElement('a');
                a.href = link.href;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                let icon = 'mdi:link';
                const href = (link.href || '').toLowerCase();
                const text = (link.textContent || '').toLowerCase();
                for (const [key, val] of Object.entries(iconMap)) {
                    if (href.includes(key) || text.includes(key)) { icon = val; break; }
                }
                a.innerHTML = `<span class="iconify" data-icon="${icon}"></span>${link.textContent}`;
                contactDiv.appendChild(a);
            });
            header.appendChild(contactDiv);
        }

        // ── 2. AI Metrics Dashboard ──
        const metricsData = extractAIMetrics(plainText);
        let metricsEl = null;
        if (metricsData.length >= 3) {
            metricsEl = document.createElement('div');
            metricsEl.className = 'ai-metrics';
            metricsData.forEach(m => {
                const cell = document.createElement('div');
                cell.className = 'ai-metric';
                cell.innerHTML = `<span class="ai-metric-value">${m.value}</span><span class="ai-metric-label">${m.label}</span>`;
                metricsEl.appendChild(cell);
            });
        }

        // ── 3. Collect sections ──
        const sections = [];
        let currentSection = null;
        for (const el of Array.from(wrapper.children)) {
            if (el.tagName === 'H1' || (el.tagName === 'P' && el === firstP)) continue;
            if (el.tagName === 'H2') {
                currentSection = { name: el.textContent.trim().toLowerCase(), heading: el, elements: [] };
                sections.push(currentSection);
            } else if (currentSection) {
                currentSection.elements.push(el);
            }
        }

        // ── 4. Build output ──
        const output = document.createDocumentFragment();
        output.appendChild(header);
        if (metricsEl) output.appendChild(metricsEl);

        for (const section of sections) {
            const iconName = aiIcons[section.name] || 'mdi:information-outline';

            const title = document.createElement('div');
            title.className = 'ai-section-title';
            title.innerHTML = `<span class="iconify" data-icon="${iconName}"></span>${section.heading.textContent}`;

            // ── Professional Summary ──
            if (section.name === 'professional summary') {
                output.appendChild(title);
                const wrap = document.createElement('div');
                wrap.className = 'ai-summary';
                section.elements.forEach(el => wrap.appendChild(el.cloneNode(true)));
                output.appendChild(wrap);
                continue;
            }

            // ── Core Skills → capsule pills ──
            if (section.name === 'core skills') {
                output.appendChild(title);
                const grid = document.createElement('div');
                grid.className = 'ai-skills-grid';
                section.elements.forEach(el => {
                    const text = el.textContent || '';
                    // Parse skill groups: "GroupName (sub1, sub2), GroupName2 (sub3, sub4)"
                    const groups = [];
                    let depth = 0, start = 0;
                    for (let i = 0; i < text.length; i++) {
                        if (text[i] === '(') depth++;
                        else if (text[i] === ')') depth--;
                        else if (text[i] === ',' && depth === 0) {
                            const s = text.slice(start, i).trim();
                            if (s) groups.push(s);
                            start = i + 1;
                        }
                    }
                    const last = text.slice(start).trim();
                    if (last) groups.push(last);

                    groups.forEach(group => {
                        const pill = document.createElement('span');
                        pill.className = 'ai-skill-pill';
                        // Extract group name vs sub-items
                        const parenIdx = group.indexOf('(');
                        if (parenIdx > -1) {
                            const name = group.slice(0, parenIdx).trim();
                            const subs = group.slice(parenIdx + 1).replace(/\)$/, '').trim();
                            pill.innerHTML = `<strong>${name}</strong> <span class="ai-skill-subs">${subs}</span>`;
                        } else {
                            pill.textContent = group;
                        }
                        grid.appendChild(pill);
                    });
                });
                output.appendChild(grid);
                continue;
            }

            // ── Technical Skills → tags ──
            if (section.name === 'technical skills') {
                output.appendChild(title);
                const tags = document.createElement('div');
                tags.className = 'ai-tech-tags';
                section.elements.forEach(el => {
                    (el.textContent || '').split(',').map(s => s.trim()).filter(Boolean).forEach(skill => {
                        const tag = document.createElement('span');
                        tag.className = 'ai-tech-tag';
                        tag.textContent = skill;
                        tags.appendChild(tag);
                    });
                });
                output.appendChild(tags);
                continue;
            }

            // ── Professional Experience → timeline ──
            if (section.name === 'professional experience') {
                output.appendChild(title);
                const timeline = document.createElement('div');
                timeline.className = 'ai-experience';
                let currentJob = null;

                for (const el of section.elements) {
                    if (el.tagName === 'H3') {
                        currentJob = document.createElement('div');
                        currentJob.className = 'ai-job';
                        const jobHeader = document.createElement('div');
                        jobHeader.className = 'ai-job-header';

                        const titleText = el.childNodes[0]?.textContent?.trim() || el.textContent.trim();
                        const dateSpan = el.querySelector('.normal');
                        const dates = dateSpan ? dateSpan.textContent.trim() : '';

                        const titleEl = document.createElement('div');
                        titleEl.className = 'ai-job-title';
                        titleEl.textContent = titleText.replace(/\s+$/, '');
                        jobHeader.appendChild(titleEl);

                        if (dates) {
                            const dateEl = document.createElement('div');
                            dateEl.className = 'ai-job-dates';
                            dateEl.textContent = dates;
                            jobHeader.appendChild(dateEl);
                        }

                        currentJob.appendChild(jobHeader);
                        timeline.appendChild(currentJob);
                    } else if (el.tagName === 'H4' && currentJob) {
                        const company = document.createElement('div');
                        company.className = 'ai-job-company';
                        company.textContent = el.textContent;
                        currentJob.appendChild(company);
                    } else if (currentJob) {
                        currentJob.appendChild(el.cloneNode(true));
                    }
                }

                output.appendChild(timeline);
                continue;
            }

            // ── AI Agent Projects → cards ──
            if (section.name === 'ai agent projects') {
                output.appendChild(title);
                const wrap = document.createElement('div');
                wrap.className = 'ai-projects';
                let currentProject = null;

                for (const el of section.elements) {
                    if (el.tagName === 'H3') {
                        currentProject = document.createElement('div');
                        currentProject.className = 'ai-project-card';
                        const pTitle = document.createElement('div');
                        pTitle.className = 'ai-project-title';
                        pTitle.innerHTML = `<span class="iconify" data-icon="mdi:chip"></span>${el.textContent.trim()}`;
                        currentProject.appendChild(pTitle);
                        wrap.appendChild(currentProject);
                    } else if (currentProject) {
                        currentProject.appendChild(el.cloneNode(true));
                    }
                }

                output.appendChild(wrap);
                continue;
            }

            // ── Key Achievements → highlight strip ──
            if (section.name === 'key achievements') {
                output.appendChild(title);
                const wrap = document.createElement('div');
                wrap.className = 'ai-achievements';
                section.elements.forEach(el => wrap.appendChild(el.cloneNode(true)));
                output.appendChild(wrap);
                continue;
            }

            // ── Certifications → badges ──
            if (section.name === 'certifications') {
                output.appendChild(title);
                const certs = document.createElement('div');
                certs.className = 'ai-certs';
                section.elements.forEach(el => {
                    if (el.tagName === 'UL') {
                        el.querySelectorAll('li').forEach(li => {
                            const badge = document.createElement('div');
                            badge.className = 'ai-cert-badge';
                            badge.innerHTML = `<span class="iconify" data-icon="mdi:shield-check"></span>${li.innerHTML}`;
                            certs.appendChild(badge);
                        });
                    }
                });
                output.appendChild(certs);
                continue;
            }

            // ── Education ──
            if (section.name === 'education') {
                output.appendChild(title);
                const wrap = document.createElement('div');
                wrap.className = 'ai-education';
                section.elements.forEach(el => {
                    const entry = document.createElement('div');
                    entry.className = 'ai-edu-entry';
                    entry.innerHTML = el.innerHTML;
                    wrap.appendChild(entry);
                });
                output.appendChild(wrap);
                continue;
            }

            // ── Default fallback ──
            output.appendChild(title);
            section.elements.forEach(el => output.appendChild(el.cloneNode(true)));
        }

        // ── 5. Replace wrapper contents ──
        wrapper.innerHTML = '';
        wrapper.appendChild(output);
    }

    // ────── Mode Toggle ──────
    function setHeaderMode(isEditing) {
        const previewActions = $('#preview-actions');
        const editActions = $('#edit-actions');
        if (previewActions) previewActions.style.display = isEditing ? 'none' : 'flex';
        if (editActions) editActions.style.display = isEditing ? 'flex' : 'none';
    }

    window.toggleMode = function () {
        const activeTab = $('.tab-content.active');

        if (activeTab && activeTab.id === 'cover-letter-tab') {
            toggleCoverLetterMode();
            return;
        }

        const editorContainer = $('#editor-container');
        const previewContainer = $('#preview-container');

        if (currentMode === 'preview') {
            currentMode = 'edit';
            editorContainer.style.display = 'block';
            previewContainer.style.display = 'none';
            setHeaderMode(true);
        } else {
            currentMode = 'preview';
            editorContainer.style.display = 'none';
            previewContainer.style.display = 'block';
            markdownContent = $('#markdown-editor').value;
            updatePreview();
            setHeaderMode(false);
            if (window._triggerLiveATS) window._triggerLiveATS();
        }
        updateStatusBar();
    };

    // ────── Discard Changes ──────
    window.discardChanges = function () {
        const activeTab = $('.tab-content.active');

        if (activeTab && activeTab.id === 'cover-letter-tab') {
            const editor = $('#cover-markdown-editor');
            if (editor) editor.value = coverLetterContent;
            currentMode = 'preview';
            $('#cover-editor-container').style.display = 'none';
            $('#cover-preview-container').style.display = 'block';
        } else {
            const editor = $('#markdown-editor');
            if (editor) editor.value = markdownContent;
            currentMode = 'preview';
            $('#editor-container').style.display = 'none';
            $('#preview-container').style.display = 'block';
        }

        setHeaderMode(false);
        updateStatusBar();
        toast('Changes discarded', 'warning');
    };

    // ────── Save ──────
    window.saveResume = function () {
        const activeTab = $('.tab-content.active');
        if (activeTab && activeTab.id === 'cover-letter-tab') {
            saveCoverLetter();
            return;
        }

        markdownContent = $('#markdown-editor').value;
        localStorage.setItem('resumeContent', markdownContent);
        updatePreview();
        if (window._triggerLiveATS) window._triggerLiveATS();

        // Switch back to preview mode after saving
        currentMode = 'preview';
        $('#editor-container').style.display = 'none';
        $('#preview-container').style.display = 'block';
        setHeaderMode(false);
        updateStatusBar();
        toast('Changes saved', 'success');
    };

    // ────── Download ──────
    window.downloadMarkdown = function () {
        const activeTab = $('.tab-content.active');
        if (activeTab && activeTab.id === 'cover-letter-tab') {
            downloadCoverLetter();
            return;
        }

        const content = currentMode === 'edit'
            ? $('#markdown-editor').value
            : markdownContent;

        const companyName = $('#company-name').value.trim();
        const label = currentResumeType === 'ai' ? 'AI' : currentResumeType === 'tpm' ? 'TPM' : 'QE';
        let filename = `Resume_Sivasankaramalan_G_${label}`;
        if (companyName) {
            filename += `_${companyName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}`;
        }
        filename += '.md';

        downloadBlob(content, filename, 'text/markdown');
        toast(`Downloaded ${filename}`, 'success');
    };

    // ────── Tab Switching ──────
    window.switchTab = function (tabName) {
        currentTab = tabName;
        sessionStorage.setItem('currentTab', tabName);

        $$('.tab-content').forEach(t => t.classList.remove('active'));
        const target = $(`#${tabName}-tab`);
        if (target) target.classList.add('active');

        $$('.nav-tab-btn').forEach(btn => {
            const onclick = btn.getAttribute('onclick') || '';
            btn.classList.toggle('active', onclick.includes(`'${tabName}'`));
            btn.setAttribute('aria-current', onclick.includes(`'${tabName}'`) ? 'page' : 'false');
        });

        const typeSelector = $('#resume-type-selector');
        const tplSelector = $('#template-selector');
        const isResume = tabName === 'resume';
        if (typeSelector) typeSelector.style.display = isResume ? 'flex' : 'none';
        if (tplSelector) tplSelector.style.display = (isResume && currentResumeType !== 'ai') ? 'flex' : 'none';

        updateStatusBar();
    };

    // ────── Cover Letter ──────
    function loadCoverLetter() {
        fetch('components/cover-letter/cover-letter.md')
            .then(r => r.text())
            .then(text => {
                coverLetterContent = text;
                $('#cover-letter-content').innerHTML = marked.parse(text);
                const editor = $('#cover-markdown-editor');
                if (editor) editor.value = text;
            })
            .catch(() => {
                $('#cover-letter-content').innerHTML = `
                    <div class="empty-state">
                        <span class="iconify" data-icon="mdi:email-off"></span>
                        <h3>Could not load cover letter</h3>
                        <p>Make sure your local server is running and the markdown file exists.</p>
                    </div>`;
            });
    }

    function toggleCoverLetterMode() {
        const editorContainer = $('#cover-editor-container');
        const previewContainer = $('#cover-preview-container');

        if (currentMode === 'preview') {
            currentMode = 'edit';
            editorContainer.style.display = 'block';
            previewContainer.style.display = 'none';
            setHeaderMode(true);
        } else {
            currentMode = 'preview';
            editorContainer.style.display = 'none';
            previewContainer.style.display = 'block';
            const editor = $('#cover-markdown-editor');
            if (editor) {
                coverLetterContent = editor.value;
                $('#cover-letter-content').innerHTML = marked.parse(editor.value);
            }
            setHeaderMode(false);
        }
        updateStatusBar();
    }

    function saveCoverLetter() {
        const editor = $('#cover-markdown-editor');
        if (editor) {
            coverLetterContent = editor.value;
            localStorage.setItem('coverLetterContent', coverLetterContent);
            $('#cover-letter-content').innerHTML = marked.parse(coverLetterContent);
        }

        // Switch back to preview mode after saving
        currentMode = 'preview';
        $('#cover-editor-container').style.display = 'none';
        $('#cover-preview-container').style.display = 'block';
        setHeaderMode(false);
        updateStatusBar();
        toast('Changes saved', 'success');
    }

    function downloadCoverLetter() {
        const content = currentMode === 'edit'
            ? ($('#cover-markdown-editor')?.value || '')
            : coverLetterContent;

        const company = $('#company-name').value.trim() || 'Company';
        const filename = `Cover_Letter_Sivasankaramalan_G_${company.replace(/\s+/g, '_')}.md`;
        downloadBlob(content, filename, 'text/markdown');
        toast(`Downloaded ${filename}`, 'success');
    }

    // ────── Status Bar ──────
    function updateStatusBar() {
        const tabLabels = { 'resume': 'Resume', 'cover-letter': 'Cover Letter', 'ats-checker': 'ATS Checker' };
        const tabEl = $('#status-tab');
        const modeEl = $('#status-mode');
        const typeEl = $('#status-type');
        const wordsEl = $('#status-words');

        if (tabEl) tabEl.textContent = tabLabels[currentTab] || 'Resume';
        if (modeEl) modeEl.textContent = currentMode === 'edit' ? 'Editing' : 'Preview';
        if (typeEl) {
            const typeLabels = { qe: 'Quality Engineering', tpm: 'Tech Product Manager', ai: 'AI-Native Testing' };
            typeEl.textContent = typeLabels[currentResumeType] || 'Quality Engineering';
            typeEl.parentElement.style.display = currentTab === 'resume' ? 'flex' : 'none';
        }

        // Word count
        if (wordsEl) {
            let text = '';
            if (currentTab === 'resume') text = markdownContent;
            else if (currentTab === 'cover-letter') text = coverLetterContent;
            const words = text.trim().split(/\s+/).filter(Boolean).length;
            wordsEl.textContent = `${words} words`;
        }
    }

    // ────── Zoom ──────
    window.zoomIn = function () {
        if (currentZoomLevel < 200) {
            currentZoomLevel += 10;
            applyZoom();
        }
    };

    window.zoomOut = function () {
        if (currentZoomLevel > 50) {
            currentZoomLevel -= 10;
            applyZoom();
        }
    };

    window.resetZoom = function () {
        currentZoomLevel = 100;
        applyZoom();
    };

    function applyZoom() {
        document.body.style.zoom = currentZoomLevel + '%';
        $$('[id^="zoom-level"]').forEach(el => {
            el.textContent = `${currentZoomLevel}%`;
        });
    }

    // ────── Print Title ──────
    window.addEventListener('beforeprint', () => {
        document.body.style.zoom = '100%';
        const company = $('#company-name').value.trim();
        const clean = company ? company.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') : '';
        const activeTab = currentTab;

        if (activeTab === 'cover-letter') {
            document.title = clean ? `Cover_Letter_Sivasankaramalan_G_${clean}` : 'Cover_Letter_Sivasankaramalan_G';
        } else {
            document.title = clean ? `Resume_Sivasankaramalan_G_${clean}` : 'Resume_Sivasankaramalan_G';
        }
    });

    window.addEventListener('afterprint', () => {
        document.body.style.zoom = currentZoomLevel + '%';
        document.title = 'Resumer - Resume Builder & ATS Optimizer';
    });

    // ────── ATS Checker (preserved logic from original) ──────

    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as',
        'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
        'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
    ]);

    const keywordPatterns = [
        /\b(java|j2ee|python|javascript|typescript|c\+\+|c#|ruby|go|rust|scala|kotlin|swift|sql|nosql)\b/gi,
        /\b(selenium|webdriver|grid|appium|rest assured|junit|testng|cucumber|pytest|robot framework|cypress|playwright|karate|soapui|postman|protractor|wdio|coded ui|testcomplete)\b/gi,
        /\b(jenkins|github actions|gitlab ci|azure devops|ci\/cd|continuous integration|continuous delivery|continuous testing|pipeline|bamboo|travis)\b/gi,
        /\b(azure|aws|gcp|kubernetes|docker|containerization|cloud-native|saas|paas|multi-regional)\b/gi,
        /\b(rest|rest api|restful|api testing|soap|graphql|microservices|integration testing|contract testing|api validation)\b/gi,
        /\b(automation|test automation|qa|quality assurance|regression testing|performance testing|load testing|compatibility testing|data validation|functional testing|end-to-end|e2e)\b/gi,
        /\b(jira|confluence|git|github|gitlab|bitbucket|jmeter|blazemeter|grafana|kibana|elasticsearch|maven|gradle|npm)\b/gi,
        /\b(agile|scrum|test strategy|qa strategy|test coverage|quality standards|coding standards|best practices)\b/gi,
        /\b(lead|mentor|mentoring|technical guidance|team leadership|qa initiatives|automation strategy|framework design|devops collaboration)\b/gi,
        /\b(multi-tier|distributed systems|front-end|back-end|full-stack|scalable|enterprise)\b/gi,
        /\b(postgresql|mongodb|mysql|sql server|database|data validation|oracle)\b/gi
    ];

    function extractKeywords(text) {
        const normalizedText = text.toLowerCase();
        const allKeywords = new Set();
        const keywordFrequency = {};
        const keywordImportance = {};

        keywordPatterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            matches.forEach(match => {
                const normalized = match.toLowerCase().trim();
                if (normalized.length > 1) {
                    allKeywords.add(normalized);
                    keywordFrequency[normalized] = (keywordFrequency[normalized] || 0) + 1;
                }
            });
        });

        const phrases = [
            'test automation', 'qa strategy', 'automation framework', 'ci/cd pipeline',
            'quality assurance', 'rest api', 'api testing', 'performance testing',
            'regression testing', 'integration testing', 'data validation', 'test coverage',
            'coding standards', 'best practices', 'technical guidance', 'team leadership',
            'automation strategy', 'qa initiatives', 'test strategy', 'cloud native',
            'devops collaboration', 'continuous testing', 'build verification', 'quality standards',
            'api contract testing', 'microservices', 'kubernetes', 'docker', 'azure devops'
        ];

        phrases.forEach(phrase => {
            if (normalizedText.includes(phrase)) {
                allKeywords.add(phrase);
                keywordFrequency[phrase] = (normalizedText.match(new RegExp(phrase, 'gi')) || []).length;
            }
        });

        allKeywords.forEach(keyword => {
            const freq = keywordFrequency[keyword] || 1;
            let repetitionScore = freq === 1 ? 0.3 : freq === 2 ? 0.6 : 1.0;

            const firstIndex = normalizedText.indexOf(keyword);
            const textLength = normalizedText.length;
            let placementScore;
            if (firstIndex < textLength * 0.15) placementScore = 1.0;
            else if (firstIndex < textLength * 0.4) placementScore = 0.8;
            else if (firstIndex < textLength * 0.7) placementScore = 0.5;
            else placementScore = 0.3;

            const commonWords = ['testing', 'qa', 'test', 'quality', 'experience', 'work', 'agile', 'team'];
            const specificTools = ['selenium', 'junit', 'rest assured', 'jenkins', 'docker', 'kubernetes', 'testng', 'postman', 'azure devops'];
            const rareTerms = ['api contract testing', 'quality as code', 'shift-left testing', 'chaos engineering', 'contract testing'];

            let rarityScore;
            if (rareTerms.includes(keyword)) rarityScore = 1.0;
            else if (specificTools.includes(keyword)) rarityScore = 0.7;
            else if (commonWords.includes(keyword)) rarityScore = 0.3;
            else rarityScore = 0.5;

            keywordImportance[keyword] = (repetitionScore * 0.4) + (placementScore * 0.35) + (rarityScore * 0.25);
        });

        const sortedKeywords = Array.from(allKeywords)
            .sort((a, b) => {
                const d = (keywordImportance[b] || 0) - (keywordImportance[a] || 0);
                return Math.abs(d) > 0.05 ? d : (keywordFrequency[b] || 0) - (keywordFrequency[a] || 0);
            });

        return { keywords: sortedKeywords, frequency: keywordFrequency, importance: keywordImportance, technical: sortedKeywords };
    }

    function getKeywordVariations(keyword) {
        const variations = [keyword];
        const map = {
            'rest api': ['rest', 'restful', 'rest apis', 'rest-api', 'restful api', 'restful apis'],
            'rest': ['rest api', 'restful', 'rest apis', 'rest-api'],
            'restful': ['rest api', 'rest', 'rest apis'],
            'java': ['j2ee', 'java/j2ee', 'core java', 'java se', 'java ee'],
            'j2ee': ['java', 'java/j2ee', 'core java'],
            'selenium': ['selenium webdriver', 'webdriver', 'selenium wd'],
            'webdriver': ['selenium webdriver', 'selenium', 'web driver'],
            'rest assured': ['restassured', 'rest-assured', 'restassured framework'],
            'restassured': ['rest assured', 'rest-assured'],
            'ci/cd': ['ci cd', 'cicd', 'continuous integration', 'continuous delivery', 'continuous deployment', 'ci/cd pipeline'],
            'cicd': ['ci/cd', 'ci cd', 'continuous integration'],
            'continuous integration': ['ci/cd', 'ci cd', 'cicd'],
            'continuous delivery': ['ci/cd', 'ci cd', 'continuous deployment'],
            'frontend': ['front-end', 'front end', 'fe', 'client-side'],
            'front-end': ['frontend', 'front end', 'fe'],
            'front end': ['frontend', 'front-end', 'fe'],
            'backend': ['back-end', 'back end', 'be', 'server-side'],
            'back-end': ['backend', 'back end', 'be'],
            'back end': ['backend', 'back-end', 'be'],
            'kubernetes': ['k8s', 'kube', 'k8'],
            'k8s': ['kubernetes', 'kube'],
            'testng': ['test ng', 'testing framework testng'],
            'test ng': ['testng'],
            'junit': ['j unit', 'junit4', 'junit5'],
            'j unit': ['junit'],
            'api testing': ['api test', 'api automation', 'api test automation'],
            'api test': ['api testing', 'api automation'],
            'test automation': ['automated testing', 'test automation framework', 'automation testing'],
            'automated testing': ['test automation', 'automation testing'],
            'microservices': ['micro services', 'micro-services', 'microservice architecture'],
            'micro services': ['microservices', 'micro-services'],
            'docker': ['docker container', 'containerization', 'dockerized'],
            'containerization': ['docker', 'docker container'],
            'jenkins': ['jenkins ci', 'jenkins ci/cd', 'jenkins pipeline'],
            'azure devops': ['azure devops services', 'ado', 'azure pipelines'],
            'ado': ['azure devops', 'azure devops services'],
            'github actions': ['github action', 'gh actions'],
            'postman': ['postman api', 'postman testing'],
            'sql': ['structured query language', 'sql server', 'mysql', 'postgresql'],
            'nosql': ['no sql', 'nosql database', 'mongodb', 'cassandra'],
            'agile': ['agile methodology', 'agile scrum', 'scrum'],
            'scrum': ['agile', 'agile scrum', 'agile methodology'],
            'jira': ['atlassian jira', 'jira software'],
            'git': ['github', 'gitlab', 'version control', 'git version control'],
            'github': ['git', 'version control'],
            'api': ['application programming interface', 'web api', 'rest api', 'graphql'],
            'qa': ['quality assurance', 'software quality assurance', 'sqa'],
            'quality assurance': ['qa', 'sqa', 'software quality assurance'],
            'manual testing': ['manual qa', 'manual test', 'exploratory testing'],
            'regression testing': ['regression test', 'regression suite'],
            'smoke testing': ['smoke test', 'sanity testing', 'sanity test'],
            'sanity testing': ['smoke testing', 'smoke test', 'sanity test']
        };
        if (map[keyword]) variations.push(...map[keyword]);
        return variations;
    }

    function parseResumeSections(resumeText) {
        const t = resumeText.toLowerCase();
        const sections = { summary: '', skills: '', experience: '', projects: '', certifications: '' };
        const s = t.match(/(?:professional summary|summary|profile)([\s\S]*?)(?=\n#|technical skills|core competencies|experience|$)/i);
        if (s) sections.summary = s[1];
        const sk = t.match(/(?:technical skills|core competencies|skills)([\s\S]*?)(?=\n#|experience|projects|$)/i);
        if (sk) sections.skills = sk[1];
        const ex = t.match(/(?:professional experience|experience|work history)([\s\S]*?)(?=\n#|projects|education|$)/i);
        if (ex) sections.experience = ex[1];
        const pr = t.match(/(?:projects|key projects)([\s\S]*?)(?=\n#|education|certifications|$)/i);
        if (pr) sections.projects = pr[1];
        return sections;
    }

    function getKeywordPlacements(keyword, sections) {
        const p = [];
        if (sections.summary.includes(keyword)) p.push('summary');
        if (sections.skills.includes(keyword)) p.push('skills');
        if (sections.experience.includes(keyword)) p.push('experience');
        if (sections.projects.includes(keyword)) p.push('projects');
        if (sections.certifications.includes(keyword)) p.push('certifications');
        return p;
    }

    function extractYearsOfExperience(text) {
        const m = text.match(/(\d+)\+?\s*years?/i);
        return m ? parseInt(m[1]) : 5;
    }

    function getSeniorityLevel(years, text) {
        const t = text.toLowerCase();
        if (t.includes('lead') || t.includes('principal') || t.includes('architect') || years >= 10) return 4;
        if (t.includes('senior') || years >= 6) return 3;
        if (t.includes('mid') || years >= 3) return 2;
        return 1;
    }

    function calculateSeniorityAlignment(resumeText, jdText) {
        const rLevel = getSeniorityLevel(extractYearsOfExperience(resumeText), resumeText);
        const jLevel = getSeniorityLevel(extractYearsOfExperience(jdText), jdText);
        const diff = Math.abs(rLevel - jLevel);
        return diff === 0 ? 100 : diff === 1 ? 70 : 40;
    }

    function calculateATSScore(jdKeywords, resumeKeywords, resumeFullText) {
        const resumeSet = new Set(resumeKeywords.keywords.map(k => k.toLowerCase()));
        const resumeTextLower = resumeFullText.toLowerCase();
        const sections = parseResumeSections(resumeFullText);
        const matchedDetails = [];
        const missing = [];

        jdKeywords.keywords.forEach(keyword => {
            const kw = keyword.toLowerCase();
            const importance = jdKeywords.importance[kw] || 0.5;
            let matchType = null, matchScore = 0, placements = [];

            if (resumeSet.has(kw) || resumeTextLower.includes(kw)) {
                matchType = 'exact'; matchScore = 1.0;
            } else {
                for (const v of getKeywordVariations(kw)) {
                    if (resumeTextLower.includes(v.toLowerCase())) {
                        matchType = 'synonym'; matchScore = 0.9; break;
                    }
                }
            }

            if (!matchType) {
                const parts = kw.split(/[\s\-\/]+/);
                let partialMatches = 0;
                for (const p of parts) { if (p.length > 2 && resumeTextLower.includes(p)) partialMatches++; }
                if (partialMatches >= parts.length * 0.5 && partialMatches > 0) {
                    matchType = 'partial'; matchScore = 0.6 + (partialMatches / parts.length) * 0.3;
                }
                if (!matchType && kw.length > 4) {
                    const found = resumeKeywords.keywords.find(rk => {
                        const r = rk.toLowerCase();
                        return r.includes(kw) || kw.includes(r) || r.includes(kw.substring(0, kw.length - 1));
                    });
                    if (found) { matchType = 'partial'; matchScore = 0.7; }
                }
            }

            if (matchType) {
                placements = getKeywordPlacements(kw, sections);
                let freq = 0;
                kw.split(/[\s\-\/]+/).forEach(p => {
                    if (p.length > 2) freq = Math.max(freq, (resumeTextLower.match(new RegExp(p, 'gi')) || []).length);
                });
                matchedDetails.push({ keyword, importance, matchType, matchScore, placements, frequency: Math.max(1, freq) });
            } else {
                missing.push({ keyword, importance });
            }
        });

        const totalImportance = jdKeywords.keywords.reduce((s, kw) => s + (jdKeywords.importance[kw.toLowerCase()] || 0.5), 0);
        const matchedImportance = matchedDetails.reduce((s, m) => s + m.importance * m.matchScore, 0);
        const skillMatchRate = totalImportance > 0 ? (matchedImportance / totalImportance) * 100 : 0;

        const avgJDFreq = jdKeywords.keywords.length > 0
            ? Object.values(jdKeywords.frequency).reduce((a, b) => a + b, 0) / jdKeywords.keywords.length : 1;
        const avgResumeFreq = matchedDetails.length > 0
            ? matchedDetails.reduce((s, m) => s + Math.min(m.frequency, 3), 0) / matchedDetails.length : 0;
        const frequencyScore = Math.min(100, (avgResumeFreq / Math.max(avgJDFreq, 1)) * 100);

        let contextScore = 0;
        const weakPlacements = [];
        matchedDetails.forEach(m => {
            let w = 0;
            if (m.placements.includes('experience')) w = 1.0;
            else if (m.placements.includes('summary') || m.placements.includes('projects')) w = 0.7;
            else if (m.placements.includes('skills')) {
                w = 0.3;
                if (m.placements.length === 1) weakPlacements.push(m.keyword);
            }
            contextScore += w * m.importance;
        });
        contextScore = totalImportance > 0 ? (contextScore / totalImportance) * 100 : 0;

        const seniorityScore = calculateSeniorityAlignment(resumeFullText, jdKeywords.keywords.join(' '));
        const baseScore = (skillMatchRate * 0.4) + (frequencyScore * 0.2) + (contextScore * 0.3) + (seniorityScore * 0.1);
        const criticalMatched = matchedDetails.filter(m => m.importance >= 0.75).length;
        const highMatched = matchedDetails.filter(m => m.importance >= 0.5 && m.importance < 0.75).length;
        const importanceBoost = Math.min(20, (criticalMatched * 3) + (highMatched * 1));
        const weakPlacementPenalty = Math.min(10, weakPlacements.length * 2);
        const finalScore = Math.min(100, Math.max(0, Math.round(baseScore + importanceBoost - weakPlacementPenalty)));

        return {
            score: finalScore,
            components: {
                skillMatchRate: Math.round(skillMatchRate * 0.4),
                frequencyScore: Math.round(frequencyScore * 0.2),
                contextScore: Math.round(contextScore * 0.3),
                seniorityScore: Math.round(seniorityScore * 0.1)
            },
            importanceBoost, weakPlacementPenalty,
            matched: matchedDetails.map(m => m.keyword),
            matchedDetails,
            missing: missing.map(m => m.keyword),
            missingDetails: missing,
            weakPlacements,
            totalJDKeywords: jdKeywords.keywords.length,
            totalMatched: matchedDetails.length,
            totalMissing: missing.length
        };
    }

    function generateAutoPatchRecommendations(missingDetails, weakPlacements, resumeText) {
        const recs = [];
        const sortedMissing = missingDetails.sort((a, b) => b.importance - a.importance);

        weakPlacements.slice(0, 5).forEach(keyword => {
            recs.push({
                section: 'Experience - Most Recent Role', keyword, importance: 'High',
                sentence: `Developed test automation using **${keyword}** for continuous integration, reducing deployment time 40%`,
                rationale: 'CRITICAL: Move from weak placement (Skills only) to experience context',
                projectedImpact: 6
            });
        });

        const highImpact = sortedMissing.filter(m => m.importance >= 0.75);
        highImpact.slice(0, 3).forEach((m, idx) => {
            recs.push({
                section: 'Professional Summary', keyword: m.keyword, importance: m.importance.toFixed(2),
                sentence: idx === 0
                    ? `10+ years delivering quality solutions with **${m.keyword}** expertise across enterprise environments`
                    : `...specializing in **${m.keyword}** and test automation frameworks...`,
                rationale: `Critical keyword (${m.importance.toFixed(2)}) - ATS scans summary first`,
                projectedImpact: 10
            });
        });

        highImpact.slice(3, 8).forEach(m => {
            let sentence;
            const k = m.keyword;
            if (k.includes('test') || k.includes('qa') || k.includes('quality'))
                sentence = `Led **${k}** initiatives that improved release quality 35% through automated validation`;
            else if (k.includes('cloud') || k.includes('azure') || k.includes('aws'))
                sentence = `Architected test infrastructure on **${k}** platform for scalable CI/CD pipelines`;
            else if (k.includes('api') || k.includes('rest') || k.includes('microservice'))
                sentence = `Designed comprehensive **${k}** testing framework covering contract and integration scenarios`;
            else
                sentence = `Implemented **${k}** solutions that enhanced automation coverage and deployment efficiency`;

            recs.push({
                section: 'Experience - Most Recent Role', keyword: k, importance: m.importance.toFixed(2),
                sentence, rationale: `Critical keyword (${m.importance.toFixed(2)}) needs strong contextual placement`,
                projectedImpact: 7
            });
        });

        const mediumImpact = sortedMissing.filter(m => m.importance >= 0.5 && m.importance < 0.75);
        mediumImpact.slice(0, 3).forEach(m => {
            recs.push({
                section: 'Experience - Most Recent Role', keyword: m.keyword, importance: m.importance.toFixed(2),
                sentence: `Utilized **${m.keyword}** for automated testing and quality validation across releases`,
                rationale: `Medium-impact keyword (${m.importance.toFixed(2)}) - add to experience for context`,
                projectedImpact: 5
            });
        });

        mediumImpact.slice(3, 6).forEach(m => {
            recs.push({
                section: 'Technical Skills', keyword: m.keyword, importance: m.importance.toFixed(2),
                sentence: `Add "**${m.keyword}**" to relevant skills category`,
                rationale: `Medium-impact keyword (${m.importance.toFixed(2)}) - skills section quick add`,
                projectedImpact: 3
            });
        });

        return recs.slice(0, 15);
    }

    function generateRecommendations(results) {
        let html = '<ul class="recommendations-list">';
        if (results.score >= 95) html += '<li class="rec-good">Excellent! 95%+ ATS compatibility achieved.</li>';
        else if (results.score >= 80) html += '<li class="rec-good">Strong alignment. Minor improvements can reach 95%.</li>';
        else if (results.score >= 60) html += '<li class="rec-medium">Moderate alignment. Follow auto-patch recommendations.</li>';
        else html += '<li class="rec-bad">Significant optimization needed. Apply all critical recommendations.</li>';

        if (results.weakPlacements?.length > 0) {
            html += `<li class="rec-warning"><strong>Weak Placements:</strong> ${results.weakPlacements.length} keyword(s) appear only in Skills section.</li>`;
        }
        if (results.components?.contextScore < 20) html += '<li><strong>Context Match Low:</strong> Add keywords to Experience bullets, not just Skills.</li>';
        if (results.components?.frequencyScore < 15) html += '<li><strong>Keyword Frequency Low:</strong> Use critical keywords 2-3 times throughout resume.</li>';
        if (results.totalMissing > 0) {
            const critical = results.missingDetails.filter(m => m.importance >= 0.75).length;
            if (critical > 0) html += `<li class="rec-bad"><strong>${critical} Critical Keywords Missing.</strong></li>`;
        }
        html += '</ul>';
        return html;
    }

    // ────── ATS Display Functions ──────

    function displayATSScoreRing(score) {
        const circumference = 2 * Math.PI * 70; // r=70
        const offset = circumference - (score / 100) * circumference;
        const colorClass = score >= 80 ? 'score-high' : score >= 60 ? 'score-medium' : 'score-low';

        return `
            <div class="score-ring">
                <svg width="180" height="180" viewBox="0 0 180 180">
                    <circle class="ring-bg" cx="90" cy="90" r="70"></circle>
                    <circle class="ring-fill ${colorClass}" cx="90" cy="90" r="70"
                        style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${circumference};"
                        data-target-offset="${offset}"></circle>
                </svg>
                <div class="ring-text">
                    <span class="ring-value ${colorClass}" data-target="${score}">0</span>
                    <span class="ring-label">/100</span>
                </div>
            </div>`;
    }

    function animateScore(container) {
        // Animate ring fill
        const ringFill = container.querySelector('.ring-fill');
        if (ringFill) {
            const target = parseFloat(ringFill.getAttribute('data-target-offset'));
            requestAnimationFrame(() => { ringFill.style.strokeDashoffset = target; });
        }

        // Animate number counter
        const valueEl = container.querySelector('.ring-value');
        if (valueEl) {
            const target = parseInt(valueEl.getAttribute('data-target'));
            let current = 0;
            const step = Math.max(1, Math.floor(target / 40));
            const interval = setInterval(() => {
                current = Math.min(current + step, target);
                valueEl.textContent = current;
                if (current >= target) clearInterval(interval);
            }, 30);
        }
    }

    window.analyzeATS = function () {
        const jdText = $('#jd-input').value.trim();
        if (!jdText) { toast('Please paste a Job Description to analyze', 'warning'); return; }

        const resumeText = markdownContent || $('#markdown-editor')?.value;
        if (!resumeText) { toast('No resume content found. Load your resume first.', 'error'); return; }

        const jdKeywords = extractKeywords(jdText);
        const resumeKeywords = extractKeywords(resumeText);
        const results = calculateATSScore(jdKeywords, resumeKeywords, resumeText);

        window.lastATSResults = { results, jdKeywords, resumeKeywords, jdText, resumeText };
        displayResults(results);

        $('#download-json-btn').style.display = 'inline-flex';
        $('#ai-enhance-btn').style.display = 'inline-flex';
        toast(`ATS Score: ${results.score}/100`, results.score >= 80 ? 'success' : results.score >= 60 ? 'warning' : 'error');
    };

    function displayResults(results) {
        const resultsEl = $('#ats-results');
        resultsEl.style.display = 'block';
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Score ring
        const scoreSection = resultsEl.querySelector('.score-section');
        const oldCircle = scoreSection.querySelector('.score-circle, .score-ring');
        if (oldCircle) {
            const ringHTML = displayATSScoreRing(results.score);
            oldCircle.outerHTML = ringHTML;
        }

        // Animate after render
        requestAnimationFrame(() => {
            requestAnimationFrame(() => animateScore(scoreSection));
        });

        // Score breakdown
        $('#score-details').innerHTML = `
            <div class="breakdown-item"><span class="breakdown-label">Skill Match Rate (40%)</span><span class="breakdown-value">${results.components.skillMatchRate}/40</span></div>
            <div class="breakdown-item"><span class="breakdown-label">Keyword Frequency (20%)</span><span class="breakdown-value">${results.components.frequencyScore}/20</span></div>
            <div class="breakdown-item"><span class="breakdown-label">Context Match (30%)</span><span class="breakdown-value">${results.components.contextScore}/30</span></div>
            <div class="breakdown-item"><span class="breakdown-label">Seniority Alignment (10%)</span><span class="breakdown-value">${results.components.seniorityScore}/10</span></div>
            <div class="breakdown-item" style="border-top: 1px solid rgba(255,255,255,0.2); margin-top: 8px; padding-top: 8px;">
                <span class="breakdown-label">Importance Boost</span><span class="breakdown-value" style="color: #4ade80;">+${results.importanceBoost}</span>
            </div>
            ${results.weakPlacementPenalty > 0 ? `<div class="breakdown-item"><span class="breakdown-label">Weak Placement Penalty</span><span class="breakdown-value" style="color: #f87171;">-${results.weakPlacementPenalty}</span></div>` : ''}
            <div class="breakdown-item" style="font-weight: 700; border-top: 2px solid rgba(255,255,255,0.4); margin-top: 8px; padding-top: 8px;">
                <span class="breakdown-label">Total JD Keywords</span><span class="breakdown-value">${results.totalJDKeywords}</span>
            </div>
        `;

        // Matched keywords
        $('#matched-count').textContent = results.totalMatched;
        $('#matched-keywords').innerHTML = results.matchedDetails.map(m => {
            const badge = m.matchType === 'synonym' ? ' ≈' : m.matchType === 'partial' ? ' ~' : '';
            return `<span class="keyword matched" title="Match: ${m.matchType}, Placements: ${m.placements.join(', ')}">${m.keyword}${badge}</span>`;
        }).join('');

        // Missing keywords
        $('#missing-count').textContent = results.totalMissing;
        $('#missing-keywords').innerHTML = results.missingDetails
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 20)
            .map(m => {
                let cls = 'keyword missing';
                if (m.importance >= 0.75) cls += ' high-impact';
                else if (m.importance >= 0.5) cls += ' medium-impact';
                return `<span class="${cls}" title="Importance: ${m.importance.toFixed(2)}">${m.keyword}</span>`;
            }).join('');

        // Weak placements
        const existingWeak = resultsEl.querySelector('.weak-placements-section');
        if (existingWeak) existingWeak.remove();

        if (results.weakPlacements?.length > 0) {
            const weakHTML = `
                <div class="weak-placements-section" style="background: var(--color-warning-soft); border-left: 4px solid var(--color-warning); padding: 16px; margin: 20px 0; border-radius: var(--radius-md);">
                    <h4 style="margin: 0 0 12px 0; color: var(--color-warning); display: flex; align-items: center; gap: 8px;">
                        <span class="iconify" data-icon="mdi:alert"></span> Weak Placements (${results.weakPlacements.length})
                    </h4>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: var(--text-secondary);">Keywords only in Skills section. Add them to Experience bullets for stronger ATS impact.</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${results.weakPlacements.map(kw => `<span class="keyword" style="background: var(--color-warning-soft); border: 1px solid var(--color-warning);">${kw}</span>`).join('')}
                    </div>
                </div>`;
            const keywordsSection = resultsEl.querySelector('.keywords-section');
            if (keywordsSection) keywordsSection.insertAdjacentHTML('afterend', weakHTML);
        }

        // Auto-patch recommendations
        const existingPatch = resultsEl.querySelector('.auto-patch-section');
        if (existingPatch) existingPatch.remove();

        const resumeText = markdownContent || $('#markdown-editor')?.value;
        const autoPatchRecs = generateAutoPatchRecommendations(results.missingDetails || [], results.weakPlacements || [], resumeText);

        if (autoPatchRecs.length > 0) {
            const projectedScore = Math.min(100, results.score + autoPatchRecs.reduce((s, r) => s + r.projectedImpact, 0));
            const autoPatchHTML = `
                <div class="auto-patch-section" style="background: var(--color-info-soft); border-left: 4px solid var(--color-info); padding: 20px; margin: 20px 0; border-radius: var(--radius-md);">
                    <h4 style="margin: 0 0 16px 0; color: var(--color-info); display: flex; align-items: center; gap: 8px;">
                        <span class="iconify" data-icon="mdi:auto-fix"></span> Auto-Patch Recommendations (${autoPatchRecs.length})
                    </h4>
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: var(--text-secondary);">Apply these insertions to reach 95% ATS score:</p>
                    ${autoPatchRecs.map((rec, i) => `
                        <div style="background: var(--surface-card); padding: 16px; margin-bottom: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-default);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <strong style="color: var(--color-info);">#${i + 1} ${rec.section}</strong>
                                <span style="background: var(--color-success); color: white; padding: 2px 8px; border-radius: var(--radius-full); font-size: 12px;">+${rec.projectedImpact} pts</span>
                            </div>
                            <div style="background: var(--surface-code); padding: 12px; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 13px; line-height: 1.6;">
                                ${rec.sentence.replace(/\*\*(.*?)\*\*/g, '<strong style="background: #fef08a; padding: 1px 4px; border-radius: 3px;">$1</strong>')}
                            </div>
                            <div style="font-size: 13px; color: var(--text-tertiary); margin-top: 8px;"><em>Rationale:</em> ${rec.rationale}</div>
                        </div>
                    `).join('')}
                    <p style="margin: 16px 0 0; font-size: 13px; color: var(--text-secondary);">
                        <strong>Projected Score:</strong> ${projectedScore}/100 ${projectedScore >= 95 ? '&#10003; Target achieved!' : ''}
                    </p>
                </div>`;
            const recsSection = resultsEl.querySelector('.recommendations-section');
            if (recsSection) recsSection.insertAdjacentHTML('beforebegin', autoPatchHTML);
        }

        // Recommendations
        $('#recommendations').innerHTML = generateRecommendations(results);
    }

    window.downloadJSONReport = function () {
        if (!window.lastATSResults) { toast('Run analysis first', 'warning'); return; }

        const { results, jdKeywords } = window.lastATSResults;
        const resumeText = markdownContent || $('#markdown-editor')?.value;
        const autoPatchRecs = generateAutoPatchRecommendations(results.missingDetails || [], results.weakPlacements || [], resumeText);

        const report = {
            ats_score: {
                current: results.score,
                components: results.components,
                importance_boost: results.importanceBoost,
                weak_placement_penalty: results.weakPlacementPenalty,
                projected_after_fixes: Math.min(100, results.score + autoPatchRecs.reduce((s, r) => s + r.projectedImpact, 0)),
                target_achieved: (results.score + autoPatchRecs.reduce((s, r) => s + r.projectedImpact, 0)) >= 95
            },
            keywords_matched: { count: results.totalMatched, details: results.matchedDetails.map(m => ({ keyword: m.keyword, type: m.matchType, placements: m.placements })) },
            keywords_missing: { count: results.totalMissing, details: results.missingDetails.map(m => ({ keyword: m.keyword, importance: m.importance })) },
            weak_placements: results.weakPlacements,
            auto_patch: autoPatchRecs.map((r, i) => ({ priority: i + 1, section: r.section, keyword: r.keyword, sentence: r.sentence, impact: r.projectedImpact })),
            timestamp: new Date().toISOString(),
            version: '2.0.0'
        };

        downloadBlob(JSON.stringify(report, null, 2), `ATS_Report_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        toast('ATS report downloaded', 'success');
    };

    window.clearATS = function () {
        $('#jd-input').value = '';
        $('#ats-results').style.display = 'none';
        $('#download-json-btn').style.display = 'none';
        $('#ai-enhance-btn').style.display = 'none';
        $('#ai-results').style.display = 'none';
        const weakSection = document.querySelector('.weak-placements-section');
        const patchSection = document.querySelector('.auto-patch-section');
        if (weakSection) weakSection.remove();
        if (patchSection) patchSection.remove();
    };

    window.enhanceWithAI = function () {
        toast('AI Enhancement coming soon! Will use GitHub Models API for detailed analysis.', 'info', 5000);
    };

    // ────── Utilities ──────
    function downloadBlob(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ────── Pagination Helpers (for screen preview) ──────
    function paginateByLines(container) {
        const children = Array.from(container.children);
        const pages = [];
        let currentPage = [];
        let currentLineCount = 0;
        const maxLinesPerPage = 63;

        for (const element of children) {
            const lines = estimateElementLines(element);
            if (currentLineCount + lines > maxLinesPerPage && currentPage.length > 0) {
                pages.push(currentPage);
                currentPage = [element.cloneNode(true)];
                currentLineCount = lines;
            } else {
                currentPage.push(element.cloneNode(true));
                currentLineCount += lines;
            }
        }
        if (currentPage.length > 0) pages.push(currentPage);
        return pages;
    }

    function estimateElementLines(element) {
        const tag = element.tagName;
        const text = element.textContent || '';
        if (tag === 'H1') return 2;
        if (tag === 'H2') return 1.5;
        if (tag === 'H3' || tag === 'H4') return 1;
        if (tag === 'P') return Math.max(Math.ceil(text.length / 100), 0.5);
        if (tag === 'UL' || tag === 'OL') {
            let total = 0;
            element.querySelectorAll('li').forEach(li => {
                total += Math.max(Math.ceil((li.textContent || '').length / 100), 1);
            });
            return total;
        }
        if (tag === 'HR') return 0.5;
        return 0.5;
    }

    // ────── Auto-save ──────
    setInterval(() => {
        if (currentMode === 'edit') {
            const editor = $('#markdown-editor');
            if (editor) localStorage.setItem('resumeContentDraft', editor.value);
        }
    }, 30000);

    // ────── Init ──────
    window.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initKeyboardShortcuts();
        initTemplate();

        const savedTab = sessionStorage.getItem('currentTab');
        const savedType = sessionStorage.getItem('currentResumeType');

        if (savedType === 'qe' || savedType === 'tpm' || savedType === 'ai') {
            currentResumeType = savedType;
            $('#qe-resume-btn').classList.toggle('active', savedType === 'qe');
            $('#tpm-resume-btn').classList.toggle('active', savedType === 'tpm');
            const aiBtn = $('#ai-resume-btn');
            if (aiBtn) aiBtn.classList.toggle('active', savedType === 'ai');

            // Handle AI-specific CSS and template selector on restore
            if (savedType === 'ai') {
                const aiCss = $('#resume-css-ai');
                if (aiCss) aiCss.disabled = false;
                const v1 = $('#resume-css-v1');
                const v2 = $('#resume-css-v2');
                const v3 = $('#resume-css-v3');
                const settings = $('#resume-settings-css');
                if (v1) v1.disabled = true;
                if (v2) v2.disabled = true;
                if (v3) v3.disabled = true;
                if (settings) settings.disabled = true;
                const tplSelector = $('#template-selector');
                if (tplSelector) tplSelector.style.display = 'none';
            }
        }

        if (savedTab && ['resume', 'cover-letter', 'ats-checker'].includes(savedTab)) {
            switchTab(savedTab);
        }

        loadResume();
        loadCoverLetter();
        initFileWatcher();

        // Restore persisted company name
        const savedCompany = localStorage.getItem('resumer-company-name');
        const companyInput = $('#company-name');
        if (savedCompany && companyInput) companyInput.value = savedCompany;

        // Persist company name on every change
        if (companyInput) {
            companyInput.addEventListener('input', () => {
                localStorage.setItem('resumer-company-name', companyInput.value);
            });
        }

        // Auto-extract company name from JD input
        const jdInput = $('#jd-input');
        if (jdInput) {
            jdInput.addEventListener('input', () => {
                const extracted = extractCompanyFromJD(jdInput.value);
                if (extracted && companyInput && !companyInput.value.trim()) {
                    companyInput.value = extracted;
                    localStorage.setItem('resumer-company-name', extracted);
                    toast(`Company detected: ${extracted}`, 'info', 2500);
                }
            });
        }

        // Clear stale drafts on fresh load (drafts are only useful during an active edit session)
        localStorage.removeItem('resumeContentDraft');

        // Phase 3: Live ATS badge
        _initLiveATS();

        // Phase 5: Customise panel
        _initThemeSettings();

        updateStatusBar();
    });

    // ────── Live File Watcher (auto-reload on save/undo) ──────
    function initFileWatcher() {
        const files = [
            { path: 'components/resume/resume.md',      type: 'resume-qe' },
            { path: 'components/resume-tpm/resume-tpm.md', type: 'resume-tpm' },
            { path: 'components/resume-ai/resume-ai.md',   type: 'resume-ai' },
            { path: 'components/cover-letter/cover-letter.md', type: 'cover' },
        ];

        const lastSeen = {};

        async function checkFile(file) {
            try {
                const res = await fetch(file.path, { method: 'HEAD', cache: 'no-store' });
                const stamp = res.headers.get('Last-Modified') || res.headers.get('ETag') || '';
                if (lastSeen[file.path] !== undefined && lastSeen[file.path] !== stamp) {
                    lastSeen[file.path] = stamp;
                    return true;
                }
                lastSeen[file.path] = stamp;
            } catch { /* server not available */ }
            return false;
        }

        async function poll() {
            for (const file of files) {
                const changed = await checkFile(file);
                if (!changed) continue;

                if (file.type === 'cover') {
                    loadCoverLetter();
                    toast('Cover letter updated', 'info', 1500);
                } else {
                    const typeMap = { 'resume-qe': 'qe', 'resume-tpm': 'tpm', 'resume-ai': 'ai' };
                    if (currentResumeType === typeMap[file.type]) {
                        // Don't overwrite editor if user is actively editing
                        if (currentMode !== 'edit') {
                            loadResume();
                            toast('Resume updated', 'info', 1500);
                        }
                    }
                }
                break; // one change per cycle
            }
        }

        setInterval(poll, 1500);
    }

    // ────── Extract company name from JD text ──────
    function extractCompanyFromJD(jdText) {
        if (!jdText || jdText.length < 20) return null;

        // Common patterns: "at CompanyName", "join CompanyName", "About CompanyName", "Company: CompanyName"
        const patterns = [
            /^(?:about\s+)?([A-Z][\w\s,\.]+(?:Inc|Ltd|LLC|Corp|Corporation|Technologies|Solutions|Systems|Labs|Health|Group|India|Global)?)\.?$/im,
            /(?:join|joining)\s+([A-Z][\w]+(?:\s+[A-Z][\w]+){0,3})/i,
            /([A-Z][\w]+(?:\s+[A-Z][\w]+){0,3})\s+is\s+(?:a|an|the)\s+(?:leading|global|pioneer|fast)/i,
            /^([A-Z][\w]+(?:\s+[A-Z][\w]+){0,3})\s+(?:Corporation|Inc|Ltd|LLC|Corp|Technologies|Solutions)/im,
        ];

        for (const pattern of patterns) {
            const match = jdText.match(pattern);
            if (match && match[1]) {
                const name = match[1].trim().replace(/[,\.]+$/, '');
                if (name.length > 2 && name.length < 50) return name;
            }
        }
        return null;
    }

    // ────── Live ATS Badge + JD Sidebar ──────

    let _liveATSDebounce = null;
    let _heatMapActive = false;

    window.toggleJDPanel = function () {
        const sidebar = document.getElementById('jd-sidebar');
        if (!sidebar) return;
        sidebar.classList.toggle('collapsed');
        const isOpen = !sidebar.classList.contains('collapsed');
        if (isOpen) {
            const ta = document.getElementById('jd-sidebar-input');
            if (ta) ta.focus();
        } else {
            // Remove heat map when panel closes
            if (_heatMapActive) {
                _removeHeatMapDOM();
                _heatMapActive = false;
                const btn = document.getElementById('heatmap-toggle-btn');
                if (btn) btn.classList.remove('active');
            }
        }
    };

    window.toggleHeatMap = function () {
        _heatMapActive = !_heatMapActive;
        const btn = document.getElementById('heatmap-toggle-btn');
        if (btn) btn.classList.toggle('active', _heatMapActive);
        if (_heatMapActive && window._lastLiveATSResult) {
            _applyHeatMapDOM(window._lastLiveATSResult.matched, window._lastLiveATSResult.missing);
        } else {
            _removeHeatMapDOM();
        }
    };

    function _updateLiveBadge(score) {
        const badge = document.getElementById('ats-live-badge');
        const scoreEl = document.getElementById('ats-badge-score');
        if (!badge || !scoreEl) return;
        scoreEl.textContent = score === null ? '--' : score + '%';
        badge.classList.remove('score-low', 'score-medium', 'score-high', 'score-excellent');
        if (score === null) return;
        if (score < 50) badge.classList.add('score-low');
        else if (score < 65) badge.classList.add('score-medium');
        else if (score < 80) badge.classList.add('score-high');
        else badge.classList.add('score-excellent');
    }

    function _updateQuickWins(missingDetails) {
        const list = document.getElementById('quick-wins-list');
        if (!list) return;
        const top5 = (missingDetails || [])
            .sort((a, b) => (b.importance || 0) - (a.importance || 0))
            .slice(0, 5);
        if (top5.length === 0) {
            list.innerHTML = '<div class="quick-wins-empty">All key terms found!</div>';
            return;
        }
        list.innerHTML = top5.map(item => `
            <div class="quick-win-item">
                <span class="quick-win-keyword" title="${item.keyword}">${item.keyword}</span>
                <button class="quick-win-insert" onclick="window._insertKeyword('${item.keyword.replace(/'/g, "\\'")}')" title="Add to resume">+Add</button>
            </div>
        `).join('');
    }

    window._insertKeyword = function (kw) {
        const editor = document.getElementById('markdown-editor');
        if (!editor) return;
        const pos = editor.selectionStart || editor.value.length;
        editor.value = editor.value.slice(0, pos) + ' ' + kw + editor.value.slice(pos);
        editor.dispatchEvent(new Event('input'));
        editor.focus();
        editor.selectionStart = editor.selectionEnd = pos + kw.length + 1;
    };

    function _applyHeatMapDOM(matched, missing) {
        const previewEl = document.getElementById('resume-content');
        if (!previewEl) return;
        _removeHeatMapDOM();
        const matArr = (matched || []).map(k => k.toLowerCase()).filter(k => k.length > 2);
        const misArr = (missing || []).map(k => k.toLowerCase()).filter(k => k.length > 2);
        // Sort longest first to avoid partial double-wraps
        const sortByLen = arr => [...arr].sort((a, b) => b.length - a.length);
        _walkAndWrap(previewEl, sortByLen(matArr), sortByLen(misArr));
    }

    function _removeHeatMapDOM() {
        document.querySelectorAll('.kw-highlighted').forEach(el => {
            el.replaceWith(...el.childNodes);
        });
    }

    function _walkAndWrap(root, matched, missing) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const tag = node.parentElement?.tagName?.toLowerCase();
                if (['script', 'style', 'code', 'pre'].includes(tag)) return NodeFilter.FILTER_REJECT;
                if (node.parentElement?.closest('.kw-highlighted')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];
        let n;
        while ((n = walker.nextNode())) nodes.push(n);
        nodes.forEach(textNode => {
            let html = textNode.nodeValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            let changed = false;
            for (const kw of matched) {
                const re = new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
                if (re.test(html)) { html = html.replace(re, '<span class="kw-match">$1</span>'); changed = true; }
            }
            for (const kw of missing) {
                const re = new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
                if (re.test(html)) { html = html.replace(re, '<span class="kw-miss">$1</span>'); changed = true; }
            }
            if (changed) {
                const wrap = document.createElement('span');
                wrap.className = 'kw-highlighted';
                wrap.innerHTML = html;
                textNode.parentNode.replaceChild(wrap, textNode);
            }
        });
    }

    function _runLiveATS() {
        const jdText = (document.getElementById('jd-sidebar-input')?.value || '').trim();
        if (!jdText) { _updateLiveBadge(null); return; }
        const resumeText = markdownContent || document.getElementById('markdown-editor')?.value || '';
        if (!resumeText.trim()) { _updateLiveBadge(null); return; }
        const jdKw = extractKeywords(jdText);
        const resumeKw = extractKeywords(resumeText);
        const result = calculateATSScore(jdKw, resumeKw, resumeText);
        window._lastLiveATSResult = result;
        _updateLiveBadge(result.score);
        _updateQuickWins(result.missingDetails);
        if (_heatMapActive) {
            _applyHeatMapDOM(result.matched, result.missing);
        }
    }

    function _initLiveATS() {
        const jdInput = document.getElementById('jd-sidebar-input');
        if (!jdInput) return;

        // Restore saved JD
        const savedJD = localStorage.getItem('resumer-jd');
        if (savedJD) jdInput.value = savedJD;

        // Debounced scoring on JD input
        jdInput.addEventListener('input', () => {
            localStorage.setItem('resumer-jd', jdInput.value);
            clearTimeout(_liveATSDebounce);
            _liveATSDebounce = setTimeout(_runLiveATS, 350);
        });

        // Run initial score if JD already loaded
        if (savedJD) setTimeout(_runLiveATS, 100);
    }

    // Expose for external triggers (e.g. after resume re-render)
    window._triggerLiveATS = function () {
        clearTimeout(_liveATSDebounce);
        _liveATSDebounce = setTimeout(_runLiveATS, 350);
    };

    // ────── Phase 5: Customise Panel ──────
    // Settings are sourced from localStorage key `resumer-theme-settings`.
    // Overrides are injected into <style id="resumer-theme-overrides"> so
    // all 3 resume templates pick them up with no changes to their CSS files.

    const _THEME_FONTS = {
        calibri:  "Calibri, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        inter:    "'Inter', 'Segoe UI', system-ui, sans-serif",
        georgia:  "Georgia, 'Times New Roman', serif",
        garamond: "Garamond, 'EB Garamond', Georgia, serif",
        mono:     "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    };
    const _THEME_MARGINS = {
        narrow: { block: '0.28in', inline: '0.22in' },
        normal: { block: '0.40in', inline: '0.35in' },
        wide:   { block: '0.55in', inline: '0.50in' },
    };
    const _THEME_DEFAULTS = { font: 'calibri', fontSize: 11, lineHeight: 1.3, accent: '#1E3A5F', margins: 'normal' };
    let _themeSettings = { ..._THEME_DEFAULTS };

    function _loadThemeSettings() {
        try {
            const raw = localStorage.getItem('resumer-theme-settings');
            _themeSettings = raw ? { ..._THEME_DEFAULTS, ...JSON.parse(raw) } : { ..._THEME_DEFAULTS };
        } catch { _themeSettings = { ..._THEME_DEFAULTS }; }
    }

    function _hexAlpha(hex, a) {
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${a})`;
    }

    function _applyThemeSettings(s) {
        const styleEl = document.getElementById('resumer-theme-overrides');
        if (!styleEl) return;
        const font   = _THEME_FONTS[s.font] || _THEME_FONTS.calibri;
        const margin = _THEME_MARGINS[s.margins] || _THEME_MARGINS.normal;
        const accent = s.accent || '#1E3A5F';
        const aLight = _hexAlpha(accent, 0.08);
        const aMid   = _hexAlpha(accent, 0.20);
        styleEl.textContent = `
@page { margin: ${margin.block} ${margin.inline}; }
.resume-page { font-family: ${font} !important; font-size: ${s.fontSize}pt !important; line-height: ${s.lineHeight} !important; }
@media print { body { font-family: ${font} !important; font-size: ${s.fontSize}pt !important; margin: ${margin.block} ${margin.inline} !important; } }
@media screen { .resume-page { padding: ${margin.block} ${margin.inline} !important; } }
:root { --v3-accent:${accent}; --v3-accent-light:${aLight}; --v3-accent-mid:${aMid}; --v3-highlight:${accent}; --v3-highlight-light:${aLight}; }
.resume-page h2 { background:${aLight} !important; border-left:3px solid ${accent} !important; padding-left:6pt !important; }
`.trim();
    }

    function _syncCustomizePanelUI(s) {
        // Font buttons
        document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
        const fb = document.getElementById(`font-btn-${s.font}`);
        if (fb) fb.classList.add('active');

        // Accent swatches
        document.querySelectorAll('.accent-swatch').forEach(b => {
            b.classList.toggle('active', b.title.toLowerCase() === _swatchTitle(s.accent));
        });
        const picker = document.getElementById('accent-color-picker');
        if (picker) picker.value = s.accent;

        // Sliders + displays
        const fsRange = document.getElementById('font-size-range');
        const fsDisplay = document.getElementById('font-size-display');
        if (fsRange) fsRange.value = s.fontSize;
        if (fsDisplay) fsDisplay.textContent = `${s.fontSize}pt`;

        const lhRange = document.getElementById('line-height-range');
        const lhDisplay = document.getElementById('line-height-display');
        if (lhRange) lhRange.value = s.lineHeight;
        if (lhDisplay) lhDisplay.textContent = String(s.lineHeight);

        // Margin buttons
        document.querySelectorAll('.margin-btn').forEach(b => b.classList.remove('active'));
        const mb = document.getElementById(`margin-btn-${s.margins}`);
        if (mb) mb.classList.add('active');
    }

    function _swatchTitle(accent) {
        const map = { '#1E3A5F':'navy','#2563eb':'blue','#4f46e5':'indigo','#7c3aed':'violet','#059669':'emerald','#0d9488':'teal','#e11d48':'rose','#d97706':'amber' };
        return (map[accent.toLowerCase()] || '').toLowerCase();
    }

    function _initThemeSettings() {
        _loadThemeSettings();
        _applyThemeSettings(_themeSettings);
    }

    window.openCustomizePanel = function () {
        const panel = document.getElementById('customize-panel');
        if (!panel) return;
        _syncCustomizePanelUI(_themeSettings);
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        document.getElementById('customize-btn')?.classList.add('active');
    };
    window.closeCustomizePanel = function () {
        const panel = document.getElementById('customize-panel');
        if (!panel) return;
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        document.getElementById('customize-btn')?.classList.remove('active');
    };

    window.setCustomFont = function (fontId) {
        _themeSettings.font = fontId;
        _applyThemeSettings(_themeSettings);
        document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`font-btn-${fontId}`)?.classList.add('active');
    };
    window.setCustomAccent = function (color) {
        _themeSettings.accent = color;
        _applyThemeSettings(_themeSettings);
        // Update swatches
        document.querySelectorAll('.accent-swatch').forEach(b => {
            const sw = (b.style.getPropertyValue('--swatch') || '').trim().toLowerCase();
            b.classList.toggle('active', sw === color.toLowerCase());
        });
        const picker = document.getElementById('accent-color-picker');
        if (picker) picker.value = color;
    };
    window.setCustomFontSize = function (val) {
        _themeSettings.fontSize = parseFloat(val);
        _applyThemeSettings(_themeSettings);
        const display = document.getElementById('font-size-display');
        if (display) display.textContent = `${parseFloat(val)}pt`;
    };
    window.setCustomLineHeight = function (val) {
        _themeSettings.lineHeight = parseFloat(val);
        _applyThemeSettings(_themeSettings);
        const display = document.getElementById('line-height-display');
        if (display) display.textContent = String(parseFloat(val));
    };
    window.setCustomMargins = function (preset) {
        _themeSettings.margins = preset;
        _applyThemeSettings(_themeSettings);
        document.querySelectorAll('.margin-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`margin-btn-${preset}`)?.classList.add('active');
    };
    window.saveThemeSettings = function () {
        localStorage.setItem('resumer-theme-settings', JSON.stringify(_themeSettings));
        toast('Theme saved', 'success');
        window.closeCustomizePanel();
    };
    window.resetThemeSettings = function () {
        localStorage.removeItem('resumer-theme-settings');
        _themeSettings = { ..._THEME_DEFAULTS };
        _applyThemeSettings(_themeSettings);
        _syncCustomizePanelUI(_themeSettings);
        toast('Theme reset to defaults', 'info');
    };

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('customize-panel');
        const btn   = document.getElementById('customize-btn');
        if (panel?.classList.contains('open') && !panel.contains(e.target) && e.target !== btn && !btn?.contains(e.target)) {
            window.closeCustomizePanel();
        }
    });

    // ────── Phase 4: AI Panel ──────

    window.toggleAIPanel = function () {
        const panel = document.getElementById('ai-panel');
        const btn   = document.getElementById('ai-panel-btn');
        if (!panel) return;
        panel.classList.toggle('collapsed');
        const isOpen = !panel.classList.contains('collapsed');
        if (btn) btn.classList.toggle('active', isOpen);
        if (isOpen) _syncAIProviderLabel();
    };

    function _syncAIProviderLabel() {
        const el = document.getElementById('ai-provider-label');
        if (!el) return;
        try {
            const cfg = JSON.parse(localStorage.getItem('resumer-ai-config') || '{}');
            const names = { ollama: 'Ollama (local)', openai: 'OpenAI', anthropic: 'Anthropic', custom: 'Custom' };
            el.textContent = names[cfg.provider || 'ollama'] || 'Ollama (local)';
            el.className = 'ai-provider-label';
        } catch {
            el.textContent = 'Ollama (local)';
        }
    }

    window.aiTestConnection = async function () {
        const btn = document.querySelector('.ai-test-btn');
        const label = document.getElementById('ai-provider-label');
        if (btn) btn.disabled = true;
        if (label) { label.textContent = 'Testing...'; label.className = 'ai-provider-label'; }
        try {
            const cfg = JSON.parse(localStorage.getItem('resumer-ai-config') || '{}');
            const provider = cfg.provider || 'ollama';
            const model    = cfg.model    || 'llama3';
            const baseUrls = { ollama: 'http://localhost:11434', openai: 'https://api.openai.com/v1', anthropic: 'https://api.anthropic.com/v1', custom: cfg.customUrl || '' };
            const url = `${baseUrls[provider]}/api/chat`;
            // Minimal ping for Ollama; for cloud providers just report configured
            if (provider === 'ollama') {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Hi' }], stream: false }),
                    signal: AbortSignal.timeout(5000),
                }).catch(() => null);
                if (res && res.ok) {
                    if (label) { label.textContent = 'Ollama connected'; label.className = 'ai-provider-label connected'; }
                    toast('Ollama is running', 'success');
                } else {
                    if (label) { label.textContent = 'Ollama not running'; label.className = 'ai-provider-label error'; }
                    toast('Ollama not found — start it with: ollama serve', 'warning', 5000);
                }
            } else {
                if (label) { label.textContent = cfg.openaiKey || cfg.anthropicKey ? 'API key configured' : 'No key configured'; label.className = 'ai-provider-label connected'; }
                toast(`${provider} configured. Key must be valid to run AI actions.`, 'info');
            }
        } catch {
            if (label) { label.textContent = 'Connection failed'; label.className = 'ai-provider-label error'; }
        }
        if (btn) btn.disabled = false;
    };

    window.aiAction = function (action) {
        if (action === 'paste-parse') { openImportModal(); return; }

        const panel = document.getElementById('ai-panel');
        if (panel?.classList.contains('collapsed')) toggleAIPanel();

        const outputEl = document.getElementById('ai-output');
        const diffPanel = document.getElementById('ai-diff-panel');
        if (diffPanel) diffPanel.style.display = 'none';

        const jdText = document.getElementById('jd-sidebar-input')?.value?.trim() || '';
        const resumeText = markdownContent || document.getElementById('markdown-editor')?.value || '';

        const actionLabels = { tailor: 'Tailor Resume', 'cover-letter': 'Generate Cover Letter', summary: 'Generate Summary', 'ats-gap': 'ATS Gap Analysis' };
        if (outputEl) outputEl.innerHTML = `<div class="ai-output-loading"><div class="ai-spinner"></div><span>Running: ${actionLabels[action] || action}...</span></div>`;

        _runAIAction(action, resumeText, jdText).then(result => {
            _renderAIResult(action, result);
        }).catch(err => {
            if (outputEl) outputEl.innerHTML = `<div class="ai-output-empty">${err.message}</div>`;
            toast(`AI error: ${err.message}`, 'error', 5000);
        });
    };

    async function _runAIAction(action, resumeText, jdText) {
        const cfg = JSON.parse(localStorage.getItem('resumer-ai-config') || '{}');
        const provider = cfg.provider || 'ollama';

        if (!resumeText.trim()) throw new Error('No resume loaded. Load your resume first.');
        if ((action === 'tailor' || action === 'cover-letter' || action === 'ats-gap') && !jdText) {
            throw new Error('Paste a Job Description in the JD panel first.');
        }

        const prompts = {
            tailor: () => _buildTailorPrompt(resumeText, jdText),
            'cover-letter': () => _buildCoverLetterPrompt(resumeText, jdText),
            summary: () => _buildSummaryPrompt(resumeText, jdText),
            'ats-gap': () => _buildATSGapPrompt(resumeText, jdText),
        };

        const { system, user } = prompts[action]();
        const raw = await _callProvider(system, user, cfg, provider);
        return _parseAIResponse(action, raw);
    }

    function _buildTailorPrompt(resumeText, jdText) {
        return {
            system: `You are a senior resume writer and ATS optimization expert. Tailor the resume to the job description. NEVER fabricate experience. No EM dashes. Return ONLY valid JSON: { "summary": ["bullet1","bullet2","bullet3","bullet4"], "tailoredBullets": [{"section":"...","original":"...","tailored":"..."}], "addedKeywords": [], "atsScore": {"before":0,"after":0} }`,
            user: `Job Description:\n---\n${jdText}\n---\nResume:\n---\n${resumeText}\n---\nReturn the JSON tailoring result.`
        };
    }
    function _buildCoverLetterPrompt(resumeText, jdText) {
        const company = document.getElementById('company-name')?.value?.trim() || 'the company';
        return {
            system: `You are a professional cover letter writer. Write 4 paragraphs, 250-300 words. No fabrication, no EM dashes, no clichés. Return ONLY valid JSON: { "coverLetter": "full text with \\n for newlines" }`,
            user: `Resume:\n${resumeText}\nJob Description:\n${jdText}\nCompany: ${company}\nWrite the cover letter JSON.`
        };
    }
    function _buildSummaryPrompt(resumeText, jdText) {
        return {
            system: `You are an expert resume writer. Write exactly 4 professional summary bullets. No fabrication, no clichés. Return ONLY valid JSON: { "summary": ["bullet1","bullet2","bullet3","bullet4"] }`,
            user: `Resume:\n${resumeText}${jdText ? `\nJD:\n${jdText}` : ''}\nWrite the 4-bullet summary JSON.`
        };
    }
    function _buildATSGapPrompt(resumeText, jdText) {
        return {
            system: `You are an ATS optimization expert. Analyze the resume against the JD. Return ONLY valid JSON: { "score": {"estimate": 0, "rationale": ""}, "critical": [{"keyword":"","suggestedSection":"","insertionHint":""}], "important": [{"keyword":"","suggestedSection":""}], "strengths": [] }`,
            user: `JD:\n${jdText}\nResume:\n${resumeText}\nProvide the ATS gap analysis JSON.`
        };
    }

    async function _callProvider(system, user, cfg, provider) {
        const baseUrls = { ollama: 'http://localhost:11434', openai: 'https://api.openai.com/v1', anthropic: 'https://api.anthropic.com/v1', custom: cfg.customUrl || '' };
        const model = cfg.model || (provider === 'ollama' ? 'llama3' : provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-haiku-20240307');

        if (provider === 'ollama') {
            const res = await fetch(`${baseUrls.ollama}/api/chat`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], stream: false }),
            });
            if (!res.ok) throw new Error(`Ollama error ${res.status}. Is it running? Try: ollama serve`);
            return (await res.json()).message?.content || '';
        }

        if (provider === 'openai') {
            if (!cfg.openaiKey) throw new Error('OpenAI API key not set. Click the gear icon to configure.');
            const res = await fetch(`${baseUrls.openai}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.openaiKey}` },
                body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.3 }),
            });
            if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
            return (await res.json()).choices?.[0]?.message?.content || '';
        }

        if (provider === 'anthropic') {
            if (!cfg.anthropicKey) throw new Error('Anthropic API key not set. Click the gear icon to configure.');
            const res = await fetch(`${baseUrls.anthropic}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': cfg.anthropicKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({ model, max_tokens: 4096, system, messages: [{ role: 'user', content: user }] }),
            });
            if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
            return (await res.json()).content?.[0]?.text || '';
        }

        throw new Error(`Unknown provider: ${provider}`);
    }

    function _parseAIResponse(action, raw) {
        let text = raw.trim();
        const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (fence) text = fence[1].trim();
        const start = text.indexOf('{');
        const end   = text.lastIndexOf('}');
        if (start === -1 || end === -1) throw new Error('AI returned no JSON. Try again or check your provider.');
        try {
            return JSON.parse(text.slice(start, end + 1));
        } catch {
            throw new Error('Could not parse AI response. The model may not support JSON output well.');
        }
    }

    window._pendingAIResult = null;

    function _renderAIResult(action, data) {
        const outputEl = document.getElementById('ai-output');
        const diffPanel = document.getElementById('ai-diff-panel');
        const diffTitle = document.getElementById('ai-diff-title');
        const diffContent = document.getElementById('ai-diff-content');
        if (!outputEl) return;

        window._pendingAIResult = { action, data };

        if (action === 'tailor') {
            const summary = (data.summary || []).map((b, i) => `<div class="ai-bullet-item"><span style="color:var(--color-primary);font-weight:700;">${i+1}.</span> ${b}</div>`).join('');
            const keywords = (data.addedKeywords || []).map(k => `<span class="ai-keyword-chip">${k}</span>`).join('');
            outputEl.innerHTML = `
                <div class="ai-output-section"><h4>Tailored Summary</h4>${summary}</div>
                ${keywords ? `<div class="ai-output-section"><h4>Keywords Added</h4>${keywords}</div>` : ''}
                ${data.atsScore ? `<div class="ai-output-section"><h4>Score Projection</h4><span style="font-size:1.1rem;font-weight:700;color:#16a34a;">${data.atsScore.before} → ${data.atsScore.after}</span></div>` : ''}`;
            if (data.tailoredBullets?.length && diffPanel && diffContent && diffTitle) {
                diffTitle.textContent = `Review ${data.tailoredBullets.length} tailored bullet(s)`;
                diffContent.innerHTML = data.tailoredBullets.slice(0, 5).map(b => `
                    <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--color-border,#eee);">
                        <div style="font-size:0.72rem;color:var(--color-text-muted,#888);margin-bottom:4px;">${b.section}</div>
                        <div class="ai-diff-old">${b.original}</div>
                        <div class="ai-diff-new">${b.tailored}</div>
                    </div>`).join('');
                diffPanel.style.display = 'block';
            }
        } else if (action === 'cover-letter') {
            const text = (data.coverLetter || '').replace(/\n/g, '<br>');
            outputEl.innerHTML = `<div class="ai-output-section"><h4>Generated Cover Letter</h4><div style="line-height:1.7;">${text}</div></div>`;
            if (diffPanel && diffContent && diffTitle) {
                diffTitle.textContent = 'Accept cover letter?';
                diffContent.innerHTML = `<p style="font-size:0.8rem;">This will replace your current cover letter file content. Review above, then accept.</p>`;
                diffPanel.style.display = 'block';
            }
        } else if (action === 'summary') {
            const bullets = (data.summary || []).map((b, i) => `<div class="ai-bullet-item"><span style="color:var(--color-primary);font-weight:700;">${i+1}.</span> ${b}</div>`).join('');
            outputEl.innerHTML = `<div class="ai-output-section"><h4>Generated Summary</h4>${bullets}</div>`;
            if (diffPanel && diffTitle) {
                diffTitle.textContent = 'Accept summary?';
                if (diffContent) diffContent.innerHTML = `<p style="font-size:0.8rem;">This will update the Professional Summary in your resume.</p>`;
                diffPanel.style.display = 'block';
            }
        } else if (action === 'ats-gap') {
            const critical = (data.critical || []).map(g => `<span class="ai-keyword-chip critical">${g.keyword}</span>`).join('');
            const important = (data.important || []).map(g => `<span class="ai-keyword-chip">${g.keyword}</span>`).join('');
            const strengths = (data.strengths || []).map(s => `<span class="ai-keyword-chip" style="background:#f0fdf4;color:#166534;border-color:#4ade80;">${s}</span>`).join('');
            outputEl.innerHTML = `
                ${data.score ? `<div class="ai-output-section"><h4>Estimated Score</h4><span style="font-size:1.2rem;font-weight:700;">${data.score.estimate}/100</span> <span style="font-size:0.75rem;color:var(--color-text-muted);">${data.score.rationale}</span></div>` : ''}
                ${critical ? `<div class="ai-output-section"><h4>Critical Gaps</h4>${critical}</div>` : ''}
                ${important ? `<div class="ai-output-section"><h4>Nice to Have</h4>${important}</div>` : ''}
                ${strengths ? `<div class="ai-output-section"><h4>Strengths Found</h4>${strengths}</div>` : ''}`;
        }

        toast('AI analysis complete', 'success');
    }

    window.aiAcceptChanges = function () {
        const pending = window._pendingAIResult;
        if (!pending) return;
        const { action, data } = pending;

        if (action === 'tailor' && data.summary) {
            const summaryText = data.summary.map(b => `- ${b}`).join('\n');
            const newContent = markdownContent.replace(
                /## Professional Summary[\s\S]*?(?=\n## )/,
                `## Professional Summary\n\n${summaryText}\n\n`
            );
            if (newContent !== markdownContent) {
                markdownContent = newContent;
                const editor = document.getElementById('markdown-editor');
                if (editor) editor.value = markdownContent;
                updatePreview();
                if (window._triggerLiveATS) window._triggerLiveATS();
                toast('Summary updated', 'success');
            } else {
                toast('Could not locate summary section — edit manually', 'warning');
            }
        } else if (action === 'cover-letter' && data.coverLetter) {
            const clContent = document.getElementById('cover-letter-content');
            if (clContent) clContent.innerHTML = data.coverLetter.replace(/\n/g, '<br>');
            toast('Cover letter updated — save to persist changes', 'success');
        } else if (action === 'summary' && data.summary) {
            const summaryText = data.summary.map(b => `- ${b}`).join('\n');
            const newContent = markdownContent.replace(
                /## Professional Summary[\s\S]*?(?=\n## )/,
                `## Professional Summary\n\n${summaryText}\n\n`
            );
            markdownContent = newContent;
            const editor = document.getElementById('markdown-editor');
            if (editor) editor.value = markdownContent;
            updatePreview();
            toast('Summary updated', 'success');
        }

        const diffPanel = document.getElementById('ai-diff-panel');
        if (diffPanel) diffPanel.style.display = 'none';
        window._pendingAIResult = null;
    };

    window.aiRejectChanges = function () {
        const diffPanel = document.getElementById('ai-diff-panel');
        if (diffPanel) diffPanel.style.display = 'none';
        window._pendingAIResult = null;
        toast('Changes discarded', 'info');
    };

    // ── Import from text (Paste & Parse) ─────────────────────────────────────

    window.openImportModal = function () {
        const modal = document.getElementById('import-modal');
        if (modal) { modal.style.display = 'flex'; document.getElementById('import-text-input')?.focus(); }
    };
    window.closeImportModal = function () {
        const modal = document.getElementById('import-modal');
        if (modal) modal.style.display = 'none';
    };

    window.runImportParse = async function () {
        const input = document.getElementById('import-text-input');
        const rawText = input?.value?.trim();
        if (!rawText || rawText.length < 50) { toast('Please paste some text (50+ characters)', 'warning'); return; }

        const btn = document.querySelector('.import-modal-content .btn-primary');
        if (btn) { btn.disabled = true; btn.textContent = 'Extracting...'; }

        const cfg = JSON.parse(localStorage.getItem('resumer-ai-config') || '{}');
        const provider = cfg.provider || 'ollama';

        const system = `You are a precise data extraction engine. Extract career information from text and return ONLY valid JSON. NEVER fabricate. If a field has no data, use empty string or empty array. Return ONLY the JSON with these keys: identity (name, email, phone, location, linkedin, github, portfolio), summary (string), experience (array of {title, company, location, startDate, endDate, current, bullets}), skills ({core: [{label, items}], technical: []}), education (array of {degree, field, institution, year}), certifications (array of {name, issuer, year}), projects (array of {name, description, bullets}), achievements (array of strings).`;
        const user = `Extract career profile from:\n\n${rawText}`;

        try {
            const raw = await _callProvider(system, user, cfg, provider);
            const profile = _parseAIResponse('paste-parse', raw);

            // Store in localStorage
            localStorage.setItem('resumer-profile', JSON.stringify(profile));

            closeImportModal();
            if (input) input.value = '';
            toast(`Profile extracted: ${profile.identity?.name || 'Unknown'}. ${profile.experience?.length || 0} roles, ${profile.skills?.technical?.length || 0} technical skills.`, 'success', 6000);
        } catch (err) {
            toast(`Import failed: ${err.message}`, 'error', 6000);
        }

        if (btn) { btn.disabled = false; btn.innerHTML = '<span class="iconify" data-icon="mdi:robot"></span> Extract profile'; }
    };

    // ── AI Settings ───────────────────────────────────────────────────────────

    window.openAISettings = function () {
        const modal = document.getElementById('ai-settings-modal');
        if (!modal) return;
        // Populate current values
        const cfg = JSON.parse(localStorage.getItem('resumer-ai-config') || '{}');
        const provSel = document.getElementById('ai-provider-select');
        const modelIn = document.getElementById('ai-model-input');
        const keyIn   = document.getElementById('ai-key-input');
        const urlIn   = document.getElementById('ai-url-input');
        if (provSel) provSel.value = cfg.provider || 'ollama';
        if (modelIn) modelIn.value = cfg.model || '';
        if (keyIn) keyIn.value = cfg.openaiKey || cfg.anthropicKey || '';
        if (urlIn) urlIn.value = cfg.customUrl || '';
        modal.style.display = 'flex';
        _updateAISettingsFields();
    };
    window.closeAISettings = function () {
        const modal = document.getElementById('ai-settings-modal');
        if (modal) modal.style.display = 'none';
    };
    window.onAIProviderChange = function () { _updateAISettingsFields(); };

    function _updateAISettingsFields() {
        const provider = document.getElementById('ai-provider-select')?.value || 'ollama';
        const keyField = document.getElementById('ai-key-field');
        const urlField = document.getElementById('ai-url-field');
        if (keyField) keyField.style.display = (provider === 'openai' || provider === 'anthropic') ? 'block' : 'none';
        if (urlField) urlField.style.display = (provider === 'ollama' || provider === 'custom') ? 'block' : 'none';
        const modelPlaceholders = { ollama: 'e.g. llama3, mistral, phi3', openai: 'e.g. gpt-4o-mini, gpt-4o', anthropic: 'e.g. claude-3-haiku-20240307', custom: 'model name' };
        const modelIn = document.getElementById('ai-model-input');
        if (modelIn) modelIn.placeholder = modelPlaceholders[provider] || 'model name';
    }

    window.saveAISettings = function () {
        const provider = document.getElementById('ai-provider-select')?.value || 'ollama';
        const model    = document.getElementById('ai-model-input')?.value?.trim() || '';
        const key      = document.getElementById('ai-key-input')?.value?.trim() || '';
        const url      = document.getElementById('ai-url-input')?.value?.trim() || '';

        const existing = JSON.parse(localStorage.getItem('resumer-ai-config') || '{}');
        const cfg = { ...existing, provider, model, customUrl: url };
        if (provider === 'openai')    cfg.openaiKey    = key;
        if (provider === 'anthropic') cfg.anthropicKey = key;
        localStorage.setItem('resumer-ai-config', JSON.stringify(cfg));

        closeAISettings();
        _syncAIProviderLabel();
        toast('AI settings saved', 'success');
    };

})();
