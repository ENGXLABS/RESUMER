# Themes & Customization

Resumer ships with three resume layout templates and a full CSS custom-properties theming system.

---

## Resume Templates

Select a template from the **Theme** menu in the app.

| Template | File | Best for |
|----------|------|----------|
| **Classic (v1)** | `components/resume/resume.css` | Traditional, ATS-safe single column |
| **Accent** | `components/resume/resume-accent.css` | Clean two-tone header, wider margins |
| **Timeline** | `components/resume/resume-timeline.css` | Ultra-clean, maximum whitespace |

---

## CSS Custom Properties

All theme values are defined as CSS custom properties in `settings.css`. Override any variable to customise the look.

### Typography

```css
:root {
  --font-body:       'Georgia', serif;
  --font-heading:    'Helvetica Neue', sans-serif;
  --font-size-base:  11pt;
  --font-size-name:  22pt;
  --font-size-h2:    13pt;
  --font-size-h3:    11pt;
  --line-height:     1.5;
}
```

### Colors

```css
:root {
  --color-name:        #1a1a2e;
  --color-heading:     #2c3e50;
  --color-body:        #333333;
  --color-muted:       #666666;
  --color-accent:      #2980b9;
  --color-border:      #e0e0e0;
  --color-background:  #ffffff;
}
```

### Spacing

```css
:root {
  --page-padding-x:    0.75in;
  --page-padding-y:    0.5in;
  --section-gap:       0.6em;
  --bullet-indent:     1.2em;
}
```

---

## Applying a Custom Theme

1. Open `settings.css` in your editor.
2. Modify the CSS variables under `:root { }`.
3. Save — the live-server reloads automatically.

### Example: Dark Accent Theme

```css
:root {
  --color-name:    #0d1117;
  --color-heading: #0d1117;
  --color-accent:  #58a6ff;
  --font-body:     'Roboto', sans-serif;
}
```

---

## Per-Template Variables

Each template may declare its own overrides scoped to its class. For example `resume-accent.css`:

```css
.theme-v2 {
  --color-header-bg: #2c3e50;
  --color-header-fg: #ffffff;
}
```

These take precedence over `settings.css` only when that template is active.

---

## Cover Letter Themes

The cover letter uses its own stylesheet at `components/cover-letter/cover-letter.css`. It references the same `--color-*` and `--font-*` variables, so colour/font changes in `settings.css` apply automatically.

---

## Print / PDF Considerations

All templates use `@media print` rules to:

- Remove on-screen chrome (toolbar, modals)
- Set `@page { margin: 0; }` so the browser doesn't add headers/footers
- Force `font-size` to exact pt values for consistency

When exporting to PDF via the browser's **Print → Save as PDF** dialog, use:

- Paper: A4 or Letter
- Margins: None (the CSS handles margins)
- Scale: 100%

---

## Adding a New Theme

1. Create `components/resume/resume-custom.css` with your styles.
2. Add a `<link>` tag for it in `index.html` (disabled by default).
3. Register it in the theme switcher array inside `app.js`:

```js
const THEMES = ['v1', 'v2', 'v3', 'v4'];
```

1. Add a button/option in the Theme panel in `index.html`.
