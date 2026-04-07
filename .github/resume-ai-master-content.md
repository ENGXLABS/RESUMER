# Resume AI Master Content - Sivasankaramalan Gunasekarasivam

> **Purpose:** This file is the single source of truth for all AI-related achievements, metrics, and experience used in the AI-Native Testing resume variant. Every fact in `components/resume-ai/resume-ai.md` MUST be traceable to this file. DO NOT fabricate any content.

---

## Contact Information

- **Full Name:** Sivasankaramalan Gunasekarasivam
- **Email:** ssmalan94@gmail.com
- **LinkedIn:** [linkedin.com/in/Sivasankaramalan](https://linkedin.com/in/Sivasankaramalan)
- **GitHub:** [github.com/Sivasankaramalan](https://github.com/Sivasankaramalan)
- **Portfolio:** [sivasankaramalan.is-a.dev](https://sivasankaramalan.is-a.dev/)

---

## Professional Identity (AI-Native QE)

- **Current Title:** Lead QA Engineer (Domain Lead - QE)
- **Years of Experience:** 11 years (QE) + AI-native testing transformation lead
- **Focus:** AI agent engineering for test automation, MCP protocol integration, prompt engineering for deterministic test outputs, AI-driven quality transformation
- **Microsoft Certified:** GitHub Copilot Engineer

---

## AI Agents Built at EPAM (Edward Jones Engagement)

### Agent 1: GitHub Copilot Test Case Creation Agent

- **Category:** GenAI / Value Creation
- **Problem:** 1-2 hours per JIRA story for manual test case creation following EDJO standards. 50+ stories per sprint = 50-100 hours of manual work. Inconsistent formats, missing edge cases, compliance overhead.
- **Solution:** Built a GitHub Copilot agent that generates manual test cases in qTest from JIRA user stories. Single command execution: "Create test cases for OA-61964 and add to folder 55195960". Agent prompts for manual verification and confirmation before creating in qTest.
- **Metrics:**
  - 92% reduction in test case creation time (1 hour to ~30 minutes per story)
  - 50 hours saved per month across 7 teams
  - 140 hours realized savings per quarter
  - 100% folder placement accuracy
  - 100% compliance with organizational standards
  - Less than 1% error rate (compared to 10-15% with manual processes)
- **Scale:** Used across all 7 teams within DCX (100+ user stories per month)
- **Implementation Timeline:** Nov 10-17, 2025 (5 days)
- **Client Approved:** Yes
- **Client Feedback:** "It is going to be a GREAT tool. This tool can be used across all teams, it is really awesome. Appreciate your work in creating this." - Dilmurat Dilshat (QE Lead, EDJO), Charity Queen (Senior QE Specialist, EDJO)

### Agent 2: GitHub Copilot Requirement Mapping Agent

- **Category:** GenAI / Value Creation
- **Problem:** 5 minutes per story spent on manual qTest requirement searching and linking. Inconsistent traceability practices between teams. Late discovery of coverage gaps during sprint reviews.
- **Solution:** Built a GitHub Copilot agent to link JIRA requirements with manual test cases in qTest via API integration. Single command: "Link the requirement REQ-61964 with the Test cases created".
- **Metrics:**
  - 90% time reduction (5 minutes to 30 seconds per requirement link)
  - 100% requirements traceability through automatic linking
  - Zero linking errors with automated API-based requirement matching
  - 87.5% efficiency increase
  - 9 hours saved per month across teams
  - 30 hours realized savings per quarter
- **Scale:** 100 stories per month across 7 teams in DCX
- **Implementation Timeline:** Nov 12-15, 2025 (3 days)
- **Client Approved:** Yes
- **Client Feedback:** "This tool can be used across all teams. It is going to save lot of QE efforts. Awesome work done." - Dilmurat Dilshat (QE Lead, EDJO), Charity Queen (Senior QE Specialist, EDJO)

### Agent 3: AI Test Finder and Predictor Agent (Shift-Left)

- **Category:** Quality Improvement / Value Creation
- **Problem:** Developers making changes are not aware of existing tests affected by their changes. No visibility into which ACs are already covered vs. need new tests. Gap between development and testing discovered late in sprint.
- **Solution:** Built a GitHub Copilot agent that semantically matches acceptance criteria, GWT statements, API endpoints, and Figma links against existing test repository. Auto-comments matching test suggestions back to JIRA ticket for developers to review as they develop.
- **Key Capabilities:**
  - Semantic matching of ACs to existing automated tests
  - Identifies which acceptance criteria are already covered
  - Suggests new test cases for uncovered criteria
  - Determines test age and staleness
  - Finds matching test users for the story
  - Comments suggestions directly on JIRA tickets
- **Impact:**
  - Prevents missing acceptance criteria coverage
  - Improves test coverage through early visibility
  - Enables team to prepare test data early in sprint (vs. end of sprint)
  - Bridges the testing gap between development and QE
- **Implementation:** March 2, 2026 (in progress)
- **Client Feedback:** "Client appreciated the idea of reducing the gap between development and testing"

### Agent 4: Jenkins Trigger Agent (QE-Copilot)

- **Category:** GenAI / Innovation
- **Problem:** Engineers manually log into Jenkins server to trigger jobs for feature branches. Repeated manual parameter selection increases effort and risk of misconfiguration. Context switching between IDE and Jenkins reduces productivity.
- **Solution:** Extended QE-Copilot instruction-based agent to support Jenkins job triggering directly from IDE. Integrated secure Jenkins API calls through shell script orchestration. Enabled feature branch-specific job execution. Externalized job parameters into configurable config.json for team-level customization. Standardized command-based triggering for CP, Regression, and Smoke suites.
- **Metrics:**
  - 7 minutes saved per job execution on average
  - 3 executions per day per QE engineer
  - 7 hours saved per engineer per month
  - 49 hours saved per month across 7 engineers
  - 147 hours saved per quarter across team
  - Standardized parameter usage reducing misconfiguration risk
  - Reduced context switching between Jenkins and IDE
- **Implementation Timeline:** Feb 6-20, 2026 (2 weeks)
- **Client Approved:** Yes

### Agent 5: Serenity Report Triage Agent (QE-Copilot)

- **Category:** GenAI / Value Creation
- **Problem:** Engineers manually open Serenity HTML reports after each Jenkins run. Failure triaging is time-consuming and dependent on individual expertise. No centralized pattern recognition across builds. Critical Path failures require daily manual validation.
- **Solution:** Built Serenity Report Agent within QE-Copilot ecosystem. Fetches complete Jenkins artifact folders, parses report data including test results, stack traces, execution time, tags, and failure logs. Applies pattern detection for recurring failures and flaky tests. Performs stability analysis on regression trends. Classifies failures by suite type (CP, Regression, Smoke). Auto-generates daily CP failure summaries. Builds structured dashboard views for leadership reporting.
- **Metrics:**
  - 15 minutes saved per QE per day on manual regression and CP analysis
  - 5 hours saved per QE per month
  - 35 hours saved per month across 7 QE engineers
  - 105 hours saved per quarter across the QE team
  - 85-90 hours saved per month across 7 QE engineers (expanded calculation)
  - 250-260 hours saved per quarter across the QE team
- **Key Capabilities:**
  - Automated detection of flaky tests across builds
  - Identification of recurring failure patterns and unstable features
  - Stability trend analysis across regression cycles
  - Sequence tracking of defect fixes and reoccurrence
  - Leadership-ready dashboards for QE health visibility
  - Reduced dependency on individual triaging expertise
- **Implementation Timeline:** Feb 16 - Mar 6, 2026 (3 weeks)

### Agent 6: MCP-Architected Test Case Agent (Enterprise Upgrade)

- **Category:** GenAI / Innovation
- **Problem:** Original instruction-based Copilot agent, while successful, had architectural constraints: execution relied on prompt engineering and local instruction context, limited centralized governance, harder to extend into multi-tool or multi-agent orchestration, scalability dependent on user-side configuration consistency.
- **Solution:** Refactored existing instruction-based agent to enterprise-grade MCP architecture. Designed MCP-compliant tool abstractions. Implemented structured agent orchestration layer. Standardized governance and workflow controls. Deployed across DCX teams.
- **Key Capabilities:**
  - Structured tool orchestration via MCP protocol
  - Centralized governance and version control of workflow logic
  - Multi-tool and multi-agent orchestration support
  - Platform-level standardization instead of user session-level
  - Auditable and reusable agent workflows
- **Implementation Timeline:** Jan 30 - Feb 20, 2026 (2 weeks)
- **Client Approved:** Yes

---

## MCP Experience

- Built custom Playwright MCP server for AI-driven browser automation
- Integrated Atlassian MCP for JIRA story ingestion and test management
- Integrated qTest MCP for test case creation and requirement linking
- Designed MCP-compliant tool abstractions for enterprise-scale agent orchestration
- Refactored instruction-based agents to MCP architecture for governance and scalability
- MCP + LLM context window management for extended test flow execution

---

## Prompt Engineering Expertise

- Mastered advanced prompt engineering concepts: multi-shot prompting, role-play prompting, temperature tuning
- Built prompt templates for deterministic test case generation with consistent quality
- Prompt validation frameworks ensuring agent output compliance with organizational standards
- Prompt engineering for predictable and auditable AI-generated test artifacts
- Less than 1% error rate achieved through refined prompt design

---

## AI Team Leadership

- Led team of 24 people on AI tool adoption and operationalization
- Trained team members on GitHub Copilot, Claude Code, MCP protocol, and Cursor
- Defined AI testing roadmap aligned with product velocity and sprint delivery
- Drove AI adoption across 7 DCX teams at Edward Jones via EPAM engagement
- Built QE-Copilot agent ecosystem used organization-wide
- Received direct client approval and testimonials for AI-driven QE innovations

---

## Aggregate AI Impact Metrics

- **Total agents built:** 6 production-grade AI agents
- **Total hours saved per quarter:** 400+ hours across QE team
- **Teams impacted:** 7 teams across DCX organization
- **Team trained on AI:** 24 engineers
- **Client satisfaction:** Multiple direct testimonials from QE leads and senior specialists
- **Error rate reduction:** From 10-15% (manual) to less than 1% (AI-assisted)
- **Compliance:** 100% organizational standard compliance maintained

---

## Certifications (AI-Relevant)

- **Microsoft Certified: GitHub Copilot Engineer** - Microsoft (AI-assisted development, GitHub Copilot best practices, agent engineering)
- **Professional Scrum Master** - Scrum.org
- **Agile Project Management** - Google/Coursera

---

## Education

- **Executive MBA - Product Engineering** | Indian Institute of Technology Madras (IIT Madras)
- **Bachelor of Engineering - Mechanical Engineering** | Anna University

---

## Previous Roles (Non-AI Focus - Carried from Main Resume)

These roles are NOT rewritten for AI focus. They maintain their original mobile/web automation positioning from the QE master content:

- **Senior SDET** | Navi Technologies (Apr 2022 - Oct 2023) - Fintech mobile automation, Karate/REST Assured, 120+ workflows
- **Associate Tech Lead** | OkCredit (Apr 2020 - Apr 2022) - SaaS quality for 1M+ users, Selenium/Appium, 60% to 95% coverage
- **Senior Software Engineer** | Rakuten Viki, Singapore (Nov 2019 - Apr 2020) - Multi-device OTT testing, 50+ configurations, iOS/Android/FireTV/AppleTV
- **Software Engineer** | Altisource (Jun 2017 - Oct 2019) - Selenium/Java automation, 92% coverage, parallel execution
- **Software Test Engineer** | AB Innovative (May 2015 - May 2017) - Test case management, defect tracking, reusable test libraries

---

## Notes for Resume Tailoring

- **Core identity:** AI-native QE leader who builds autonomous test agents
- **Differentiation:** Not "AI-curious" but "AI-practitioner" - 6 production agents with measurable impact
- **MCP angle:** Actually built MCP servers and refactored agents to MCP architecture (rare in industry)
- **Shift-left with AI:** Test Finder agent bridges dev-QE gap at story level
- **Leadership:** Trained 24 people, defined AI roadmap, drove adoption across 7 teams
- **Always lead with:** Agent engineering, MCP, prompt engineering, then traditional QE foundations
