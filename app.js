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

        loadResume();
        updateStatusBar();
    };

    function loadResume() {
        const path = currentResumeType === 'qe'
            ? 'components/resume/resume.md'
            : 'components/resume-tpm/resume-tpm.md';

        fetch(path)
            .then(r => r.text())
            .then(text => {
                markdownContent = text;
                updatePreview();
                const editor = $('#markdown-editor');
                if (editor) editor.value = text;
                updateStatusBar();
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

        if (currentTemplate === 'v3') {
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
            { regex: /automating\s+(\d+)\+?\s+critical/i, label: 'Workflows Automated' },
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
        const label = currentResumeType === 'qe' ? 'QE' : 'TPM';
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
        if (tplSelector) tplSelector.style.display = isResume ? 'flex' : 'none';

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
            typeEl.textContent = currentResumeType === 'qe' ? 'Quality Engineering' : 'Tech Product Manager';
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

        if (savedType === 'qe' || savedType === 'tpm') {
            currentResumeType = savedType;
            $('#qe-resume-btn').classList.toggle('active', savedType === 'qe');
            $('#tpm-resume-btn').classList.toggle('active', savedType === 'tpm');
        }

        if (savedTab && ['resume', 'cover-letter', 'ats-checker'].includes(savedTab)) {
            switchTab(savedTab);
        }

        loadResume();
        loadCoverLetter();

        // Clear stale drafts on fresh load (drafts are only useful during an active edit session)
        localStorage.removeItem('resumeContentDraft');

        updateStatusBar();
    });

})();
