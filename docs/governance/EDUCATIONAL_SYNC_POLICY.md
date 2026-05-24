# Educational Sync Policy

Defines how the production repository (`open-ai.ru`) and the educational repository (`research-and-edu-ai-lab`) coexist without compromising either side.

## 1. Repository Separation

| Repository | Scope | Audience |
| --- | --- | --- |
| [`open-ai.ru`](https://github.com/G-Ivan-A/open-ai.ru) | Production code, architecture, governance, AI-assisted SDLC artifacts. | Product team, AI contributors, reviewers. |
| [`research-and-edu-ai-lab`](https://github.com/G-Ivan-A/research-and-edu-ai-lab) | Research notes, tutorials, exploratory experiments, educational publications. | Learners, researchers, public audience. |

The production repository **must not** become a tutorial host, course platform, or educational wiki.
The educational repository **must not** depend on production secrets, internal infrastructure, or unfinalized contracts.

## 2. Direction of Sync

Sync is one-way by default:

- `open-ai.ru` → `research-and-edu-ai-lab` for **structured, redacted, reusable** material.
- `research-and-edu-ai-lab` → `open-ai.ru` only when a research output graduates into an ADR, contract, or feature backlog item via a normal issue.

## 3. What May Be Exported

After explicit approval by the project owner:

- Generalized governance patterns (with project-specific names redacted).
- Anonymized ADRs and decision narratives.
- Reusable prompt templates with no production identifiers.
- Reviewed AI workflow descriptions.
- Architecture concepts that have been validated and published in `docs/architecture/`.

## 4. What Must Not Be Exported

- Secrets, credentials, environment values.
- Customer or partner names, integration endpoints, contractual terms.
- Internal feature backlog, MVP scope, or release dates that have not been publicly announced.
- Code from `features/`, `services/`, `integrations/`, or `infrastructure/` without explicit owner approval.
- AI prompts that embed proprietary product context.

## 5. Sync Workflow

1. Identify the candidate material inside the production repository.
2. Open an issue using the `foundation` template with the `educational-export` label (or equivalent once labels are formalized).
3. Prepare a sanitized version inside `features/education-sync/` or `docs/governance/` as a staging area.
4. Request human review focused on disclosure, security, and educational fit.
5. After approval, copy or summarize the material into `research-and-edu-ai-lab` via a pull request in that repository.
6. Link the source and destination references in both pull requests for traceability.

## 6. Educational Boundary Rules

- Tutorials, course modules, lesson plans, and student-facing exercises live only in the educational repository.
- The production repository may host concise governance baselines that explain how the system is meant to evolve, but not how to teach the system.
- When a document is at risk of becoming a tutorial, split it: keep the governance contract here and move the explanatory long-form content to the educational repository.

## 7. Ownership

- Owner: Project lead.
- Reviewers: Human maintainers of both repositories.
- Update cadence: Reviewed whenever cross-repository exports occur or whenever the educational repository changes its publication model.

## TODO

- Define the `educational-export` label across both repositories.
- Document an automated changelog hand-off when releases begin.
- Add a checklist for sanitizing prompts before export.
