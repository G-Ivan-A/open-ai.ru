# Product Vision Options

Status: draft for stakeholder agreement
Date: 2026-05-25
Issue: [G-Ivan-A/open-ai.ru#42](https://github.com/G-Ivan-A/open-ai.ru/issues/42)
Related audit: [`2026-05-25-repository-audit-comparison.md`](2026-05-25-repository-audit-comparison.md)

## Decision Need

The repository currently expresses a governance-first AI-assisted portal. Issue #42 expands the concept into an open-source AI solution platform with courses, corporate project workspaces, roles, and access to closed licensed resources. These are compatible only if the product chooses a phased position and avoids trying to be every surface at once.

## Vision Options

| Option | Product statement | Primary audience | Main value | MVP shape | Strength | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| A. Governance-first AI SDLC portal | A portal that demonstrates controlled AI-assisted development and governance for production web products. | Founders, product owners, AI-assisted delivery teams. | Trustworthy AI-assisted delivery process. | Governance docs, app shell, prompt/contracts lifecycle, review automation. | Matches current repo strongly. | Too internal; does not fully address open-source solution catalog or corporate users. |
| B. Open AI solutions catalog | A curated hub of commercially usable open-source AI agents and business automation solutions with deployment guidance. | SMBs, integrators, open-source maintainers. | Faster discovery and safer adoption of deployable AI tools. | Static catalog, solution cards, maturity tiers, one reference solution. | Directly matches issue #42 and issue #20. | Needs strong license/security review to avoid recommending risky projects. |
| C. Corporate project workspace | A role-based workspace for distributed teams working with open and closed AI projects across companies. | Corporate teams, external contractors, partner delivery teams. | Controlled collaboration outside a single corporate environment. | Auth, organizations, projects, RBAC, audit log, private repo entitlements. | Addresses the strongest enterprise need in issue #42. | Heavy security and access-management scope for an early project. |
| D. Open education portal | A learning surface for courses about AI agents, deployment, and business automation. | Learners, contributors, business teams adopting AI. | Education and onboarding into the ecosystem. | Course catalog metadata, links to education repo or LMS, learning paths. | Useful growth channel. | Conflicts with production repo boundaries if courses are hosted here. |
| E. Phased Open AI Solutions Hub | A governance-led portal for discovering, evaluating, and deploying open-source AI solutions, with role-based project workspaces and linked education. | SMBs, solution maintainers, integrators, corporate project teams. | Combines trust, deployability, collaboration, and learning without merging all content into one repo. | Catalog contract, one reference solution, app shell, RBAC model, education metadata. | Best fit across current repo and issue #42. | Requires strict sequencing and owner decisions. |

## Recommended Vision

Choose option E as the north star, implemented in phases:

> `open-ai.ru` is a governance-led Open AI Solutions Hub. It helps business teams discover, evaluate, and deploy commercially usable open-source AI agents and automation solutions. It gives maintainers a controlled way to publish solution metadata, deployment tiers, and limitations. It gives corporate and distributed teams role-based project workspaces for open or licensed private resources. Education is connected through approved metadata and sync, while course content lives outside the production repository.

## Positioning Boundaries

| The product is | The product is not |
| --- | --- |
| A curated solution hub with reviewable metadata. | A generic AI news portal or content farm. |
| A deployment-readiness and governance layer. | A package registry that blindly mirrors every project. |
| A role-based workspace for controlled collaboration. | A social network with likes, expert ratings, or reputation scores for participants. |
| A connector to education and onboarding materials. | A course-hosting repository. |
| A platform that can integrate open and licensed private resources. | A place to publish secrets, customer data, or unreviewed internal prompts. |

## Product Promise by Audience

| Audience | Promise | First proof |
| --- | --- | --- |
| Business user | Find an AI solution by business task and understand deployment, limits, and risks. | One complete solution card with maturity tier and deployment path. |
| Solution maintainer | Publish a solution in a predictable format without negotiating every field. | Solution-card template and intake checklist. |
| Corporate project owner | Give internal and external contributors controlled access to project resources. | RBAC matrix and workspace domain model. |
| AI contributor | Work inside contracts with reviewable prompts, permissions, and outputs. | AI-agent contract template. |
| Learner | Move from course material to deployable solution context. | Course metadata linked to solution card, hosted outside this repo. |

## MVP Product Shape

The MVP should be a narrow proof, not a full platform:

1. Product source of truth and approved license path.
2. Catalog contract and intake checklist.
3. One reference solution card, ideally Clarify Engine because it is already referenced by issue #21.
4. Runtime/app-shell ADR and minimal portal shell.
5. Auth/RBAC model accepted before account implementation.
6. Education metadata contract, without course hosting in this repository.

## Success Metrics

| Metric | Initial target |
| --- | --- |
| Solution-card completeness | 100% of required fields filled for the reference solution. |
| Deployment clarity | Reference solution states supported deployment tier and missing work. |
| License clarity | Repository and reference solution license status are explicit. |
| Reviewability | Every catalog entry has owner, source, last review date, and risk notes. |
| Workspace readiness | RBAC matrix accepted before implementation. |
| Education boundary | Course content remains outside this repo; only metadata or approved summaries are linked. |

## Open Questions for Stakeholders

1. Should the first public product promise lead with "open-source AI solution catalog" or "role-based corporate AI workspace"?
2. Is Apache-2.0-style attribution and patent language acceptable for the repository, or should solution components choose licenses independently?
3. Should Clarify Engine be the first reference solution, or should the first card be a neutral third-party OSS project?
4. Should education initially be GitHub-based in `research-and-edu-ai-lab`, or should an LMS decision be researched early?
