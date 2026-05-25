# Improvement Roadmap Draft

Status: draft for stakeholder agreement
Date: 2026-05-25
Issue: [G-Ivan-A/open-ai.ru#42](https://github.com/G-Ivan-A/open-ai.ru/issues/42)
Related audit: [`2026-05-25-repository-audit-comparison.md`](2026-05-25-repository-audit-comparison.md)

## Roadmap Principle

The project should not jump from governance skeleton to full marketplace. The practical route is:

1. Align the product source of truth.
2. Define catalog and licensing contracts.
3. Prove the catalog with one reference solution.
4. Add role-based workspaces.
5. Connect education through metadata and approved sync.
6. Scale into orchestration and ecosystem operations.

## Phase Plan

| Phase | Horizon | Goal | Deliverables | Exit gate |
| --- | --- | --- | --- | --- |
| 0. Alignment and cleanup | 0-2 weeks | Remove ambiguity before building. | Product source-of-truth decision; document ownership notes; license decision issue; cleanup issue for branch-specific CI trigger; approved vision option. | Stakeholders can state the same product promise in one paragraph. |
| 1. Catalog foundation | 2-6 weeks | Define what a solution is and how it enters the portal. | Solution-card contract; catalog intake checklist; deployment-tier model; license/security metadata; first catalog feature README. | A contributor can submit a solution proposal without guessing the format. |
| 2. Reference solution | 6-10 weeks | Prove the catalog with a real candidate. | Clarify Engine catalog card draft; deployment readiness assessment; limitations; support status; data boundary; evaluation notes. | One solution has a reviewable path from card to deployment instructions. |
| 3. Portal shell and account baseline | 8-14 weeks | Start product UI only after contracts are clear. | Runtime ADR; Next.js app shell; auth ADR/provider decision; profile and dashboard empty states; governance page links. | A contributor can run the shell and see the intended product structure. |
| 4. Role-based project workspace | 12-20 weeks | Support the corporate collaboration concept. | Organization/project/RBAC model; project membership flow; repository/license entitlement policy; audit-event contract. | A project can define who can access which solution, artifact, or private resource. |
| 5. AI-agent operations | 16-28 weeks | Make agent execution safe and traceable. | AI-agent contract template; prompt registry rules; execution log model; sandbox decision; MCP/A2A research note. | An agent workflow can be reviewed before it touches user data or tools. |
| 6. Education sync | 20-32 weeks | Connect courses without turning this repo into an LMS. | Course metadata contract; education export checklist; open-course placement decision; `research-and-edu-ai-lab` sync process. | A course can be linked to a solution without duplicating course content here. |
| 7. Ecosystem scale | 32-52 weeks | Grow from curated hub to ecosystem platform. | Partner onboarding playbook; supply-chain scoring automation; solution quality badges; deployment template library; incident and support processes. | The portal can support multiple external contributors and solutions without manual exceptions. |

## Workstreams

| Workstream | Near-term focus | Later focus |
| --- | --- | --- |
| Product | Source of truth, positioning, MVP success criteria. | Packaging, partner program, ecosystem governance. |
| Architecture | Runtime ADR, contracts, domain model updates. | Workspace isolation, agent orchestration, deployment topology. |
| Governance and legal | License choice, contribution rules, review gates. | Third-party solution terms, vulnerability disclosure, support policy. |
| Catalog | Solution card, criteria, deployment tiers. | Automated scoring, quality badges, recommendation logic. |
| Workspace | RBAC model, project audit events. | Private repo/license integration and inter-company collaboration. |
| Education | Metadata-only course link policy. | Course platform integration or external LMS sync. |
| Security | Secrets policy, supply-chain checklist. | SBOM/provenance, sandboxing, incident response. |

## Key Decisions by Phase

| Decision | Needed by | Owner role | Notes |
| --- | --- | --- | --- |
| Product vision option | Phase 0 | Product Owner | Choose between governance portal, catalog hub, workspace platform, education hub, or phased hybrid. |
| Repository license | Phase 0 | Product Owner + reviewer | Required before commercial-use language is published. |
| Solution-card schema | Phase 1 | Product + architecture | Should include license, data boundary, deployment tier, support status, risks, and owner. |
| Runtime stack ADR | Phase 3 | Architecture | README names Next.js/TypeScript, but no accepted ADR pins it yet. |
| Auth and RBAC model | Phase 4 | Architecture + security | Must precede corporate workspaces and closed-resource access. |
| Agent protocol posture | Phase 5 | Architecture + security | MCP and A2A are candidates, not implementation defaults. |
| Education platform boundary | Phase 6 | Product + governance | Avoid duplicating course content in this production repository. |

## First 30 Days

| Week | Outcome | Concrete tasks |
| --- | --- | --- |
| 1 | Product alignment | Review this audit package; approve vision option; open follow-up issues for license, solution-card, RBAC model, and CI cleanup. |
| 2 | Catalog contract draft | Draft `contracts/catalog/` or `features/catalog/README.md` proposal; define maturity levels and metadata fields. |
| 3 | License and security baseline | Compare Apache-2.0/MIT/component-level licenses; add supply-chain checklist fields for curated projects. |
| 4 | Reference solution assessment | Prepare Clarify Engine card draft using the new template; list deployment gaps and data/security constraints. |

## Success Metrics

| Metric | Target for first quarter |
| --- | --- |
| Product clarity | One approved product vision and one source-of-truth path. |
| Catalog readiness | At least one complete solution-card draft and one reviewed intake checklist. |
| Governance quality | Structure validation stays green; document ownership ambiguity reduced. |
| License readiness | Repository license decision made or explicitly blocked with owner question. |
| Workspace readiness | RBAC model accepted before auth implementation begins. |
| Education boundary | Course sync policy exists without tutorial content in this repo. |

## Explicit Non-Goals for the Next 90 Days

- Do not build billing, marketplace payments, ratings, likes, or social metrics.
- Do not host full courses in this repository.
- Do not grant closed repository access before the RBAC and audit model is accepted.
- Do not introduce new runtime dependencies without ADR approval.
- Do not add solution implementations into legacy root `solutions/`; use the approved feature/contract structure.
