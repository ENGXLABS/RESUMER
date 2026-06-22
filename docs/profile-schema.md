# Profile Schema

Your profile data lives in `profile.json` (gitignored). Use `profile.sample.json` as a starting template.

The file is stored in `localStorage` under the key `resumer-profile`.

---

## Top-Level Structure

```json
{
  "identity":       { ... },
  "experience":     [ ... ],
  "skills":         { ... },
  "education":      [ ... ],
  "certifications": [ ... ],
  "projects":       [ ... ]
}
```

---

## `identity`

Personal and contact information.

```json
"identity": {
  "name":      "Alex Rivera",
  "email":     "alex@example.com",
  "linkedin":  "https://linkedin.com/in/alexrivera",
  "github":    "https://github.com/alexrivera",
  "portfolio": "https://alexrivera.dev"
}
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | ✅ |
| `email` | string (valid email) | ✅ |
| `linkedin` | string (URL) | ❌ |
| `github` | string (URL) | ❌ |
| `portfolio` | string (URL) | ❌ |

---

## `experience`

Array of work experience objects in reverse chronological order.

```json
"experience": [
  {
    "company":   "Acme Corp",
    "title":     "Senior QA Engineer",
    "startDate": "January 2022",
    "endDate":   "Present",
    "bullets": [
      "Built Selenium automation framework reducing manual testing by 80%",
      "Mentored team of 4 junior QA engineers"
    ]
  }
]
```

| Field | Type | Required |
|-------|------|----------|
| `company` | string | ✅ |
| `title` | string | ✅ |
| `startDate` | string | ✅ |
| `endDate` | string | ✅ |
| `bullets` | string[] | ✅ |

---

## `skills`

Divided into thematic core skill groups and technical tools.

```json
"skills": {
  "core": [
    {
      "group": "Quality Leadership",
      "items": ["QA Strategy", "Team Mentoring", "Process Improvement"]
    },
    {
      "group": "Test Automation",
      "items": ["Selenium WebDriver", "REST Assured", "Appium"]
    }
  ],
  "technical": [
    "Java", "Kotlin", "Selenium WebDriver", "REST Assured",
    "Jenkins", "Docker", "Git"
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| `skills.core` | object[] | ❌ |
| `skills.core[].group` | string | ✅ if core item present |
| `skills.core[].items` | string[] | ✅ if core item present |
| `skills.technical` | string[] | ❌ |

---

## `education`

```json
"education": [
  {
    "degree":      "B.Sc Computer Science",
    "institution": "Massachusetts Institute of Technology",
    "year":        "2019"
  }
]
```

| Field | Type | Required |
|-------|------|----------|
| `degree` | string | ✅ |
| `institution` | string | ✅ |
| `year` | string | ❌ |

---

## `certifications`

```json
"certifications": [
  {
    "name":   "ISTQB Foundation Level",
    "issuer": "ISQI",
    "year":   "2022"
  }
]
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | ✅ |
| `issuer` | string | ❌ |
| `year` | string | ❌ |

---

## `projects`

```json
"projects": [
  {
    "name":        "selenium-framework",
    "description": "Enterprise Selenium WebDriver framework for UI test automation",
    "url":         "https://github.com/alexrivera/selenium-framework",
    "keywords":    ["Java", "Selenium", "TestNG", "Jenkins"]
  }
]
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | ✅ |
| `description` | string | ❌ |
| `url` | string (URL) | ❌ |
| `keywords` | string[] | ❌ |

---

## Validation

Use the built-in validator before loading your profile into the app:

```js
import { validateProfile } from './src/features/profile/validator.js';

const result = validateProfile(myProfile);
if (!result.valid) {
  console.error(result.errors);
}
```

See [src/features/profile/validator.js](../src/features/profile/validator.js) for the full list of validations.
