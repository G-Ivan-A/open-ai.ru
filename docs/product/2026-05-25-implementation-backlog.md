# Implementation Backlog Draft

Status: draft for stakeholder agreement
Date: 2026-05-25
Issue: [G-Ivan-A/open-ai.ru#42](https://github.com/G-Ivan-A/open-ai.ru/issues/42)
Related roadmap: [`2026-05-25-improvement-roadmap.md`](2026-05-25-improvement-roadmap.md)

## Prioritization

Priority scale:

- P0: blocks product clarity or safe public positioning.
- P1: required for catalog/workspace MVP.
- P2: useful after the first reference solution and shell.
- P3: ecosystem scale or later optimization.

## Backlog

| ID | Priority | Item | Acceptance criteria | Dependencies |
| --- | --- | --- | --- | --- |
| BL-001 | P0 | Approve product vision option | PR/issue comment states selected vision option and any edits. | Product vision options file. |
| BL-002 | P0 | Mark product document source of truth | Root `PRODUCT_VISION.md` and `docs/product/PRODUCT_VISION.md` explain summary vs working-source roles. | BL-001. |
| BL-003 | P0 | Decide repository license path | Issue or ADR compares Apache-2.0, MIT, and component-specific licenses for commercial use with attribution. | Owner/legal review. |
| BL-004 | P0 | Clean branch-specific workflow trigger | `.github/workflows/validate-structure.yml` no longer references an old issue branch unless intentionally documented. | Separate cleanup issue. |
| BL-005 | P0 | Define solution-card schema | Template includes name, problem, result, owner, license, source URL, maturity, deployment tiers, data boundary, security notes, support status. | BL-001, BL-003. |
| BL-006 | P0 | Define catalog intake checklist | Checklist covers license, maintenance, security, deployment, docs, business fit, and exclusion criteria. | BL-005. |
| BL-007 | P0 | Define deployment-tier model | Starter, Business, Cloud Pro, Cloud Enterprise are described with runtime, data, support, and operations assumptions. | Issue #20 context. |
| BL-008 | P0 | Add supply-chain metadata policy | Catalog entries require dependency/security signals such as OpenSSF Scorecard, vulnerability scan status, SBOM/provenance readiness where applicable. | BL-005. |
| BL-009 | P1 | Prepare Clarify Engine catalog-card draft | Draft states task, measurable result, deployment tier readiness, license, limitations, data handling, and integration points. | BL-005, BL-006. |
| BL-010 | P1 | Create catalog feature README | `features/catalog/README.md` explains scope, accepted artifacts, non-goals, and relationship to contracts. | BL-005. |
| BL-011 | P1 | Add AI-agent contract template | Template defines inputs, outputs, tools, permissions, logs, human review, and forbidden actions. | Existing `contracts/ai-agents/README.md`. |
| BL-012 | P1 | Add prompt lifecycle template | Reusable prompts include purpose, inputs, outputs, constraints, owner, status, and review gate. | Existing `prompts/README.md`. |
| BL-013 | P1 | Update domain model for organizations/projects | Add Organization, Project, Membership, Role, Entitlement, RepositoryAccess, AuditEvent candidates. | BL-001. |
| BL-014 | P1 | Draft RBAC matrix | Matrix defines founder, project owner, contributor, reviewer, organization admin, learner, and external partner capabilities. | BL-013. |
| BL-015 | P1 | Draft closed-resource access policy | Policy covers access request, approval, revocation, audit, and license/contract constraints. | BL-014. |
| BL-016 | P1 | Runtime stack ADR | Accept or revise the README-stated Next.js + TypeScript stack before product shell work. | Architecture review. |
| BL-017 | P1 | Auth provider ADR | Choose a governance-approved auth provider and define session/security expectations. | BL-016, BL-014. |
| BL-018 | P1 | Application shell issue | Define shell routes, navigation, governance page, catalog entry point, account entry point, and empty states. | BL-016. |
| BL-019 | P1 | MVP success criteria | Convert broad MVP scope into measurable metrics: catalog completeness, auth readiness, solution deployment proof, review cycle time. | BL-001. |
| BL-020 | P1 | Education metadata contract | Define course title, audience, skill prerequisites, linked solution, owner, license, repository/location, and sync status. | Education sync policy. |
| BL-021 | P1 | Education export checklist | Checklist verifies no secrets, internal roadmap, proprietary prompts, or unapproved product details leave the repo. | BL-020. |
| BL-022 | P2 | MCP research note | Evaluate MCP for agent-to-tool integration, consent, server trust, and security boundaries. | BL-011. |
| BL-023 | P2 | A2A research note | Evaluate A2A for agent-to-agent collaboration across frameworks and vendors. | BL-011. |
| BL-024 | P2 | Agent sandbox ADR | Decide sandbox isolation, network policy, secret access, file-system boundary, and audit requirements. | BL-022, BL-023. |
| BL-025 | P2 | API contract format ADR | Choose OpenAPI or alternative for solution APIs and portal APIs. | Runtime stack ADR. |
| BL-026 | P2 | Event contract baseline | Define catalog, project, access, and agent execution event naming/versioning. | BL-013, BL-025. |
| BL-027 | P2 | Solution quality badges | Define non-social badges such as license-checked, deployment-tested, security-reviewed, docs-ready. | BL-008. |
| BL-028 | P2 | Partner onboarding playbook | Explain how external maintainers submit, update, and support solutions. | BL-006, BL-027. |
| BL-029 | P2 | Workspace audit log model | Define audit events for access grants, repository links, solution deployments, and agent executions. | BL-014, BL-026. |
| BL-030 | P2 | Governance page in portal shell | Public page summarizes AI governance, review gates, catalog criteria, and education boundary. | BL-018. |
| BL-031 | P3 | Deployment template library | Add reviewed Docker Compose/Helm template conventions after at least one reference solution passes review. | BL-009. |
| BL-032 | P3 | Automated catalog scoring | Pull open-source health and security signals into catalog metadata. | BL-008, BL-027. |
| BL-033 | P3 | Course platform decision | Decide whether education stays in GitHub, uses Open edX, or uses another LMS. | BL-020, BL-021. |
| BL-034 | P3 | Ecosystem analytics | Track catalog views, deployment starts, solution review status, and education referrals without social ranking. | Product metrics approval. |

## Backlog Notes

- BL-001 through BL-008 should be handled before significant product UI work. They define what the portal promises.
- BL-013 through BL-017 should precede any serious account/dashboard implementation. Otherwise auth screens may be built around the wrong access model.
- BL-022 through BL-024 are intentionally research/ADR tasks. Agent protocol adoption should not happen by default.
- BL-031 through BL-034 are later-stage items and should not block the first catalog proof.

## Definition of Ready for New Feature Issues

Each feature issue should include:

- Operating mode: Structured or Creative.
- Product objective and user role.
- Allowed and forbidden changes.
- Related source-of-truth document.
- Acceptance criteria that can be checked locally or in review.
- Security, license, and documentation impact.

## Definition of Done for Product/Governance Items

A backlog item is done when:

- The resulting document or code is linked from the closest index.
- The repository structure validator passes.
- The PR description states validation, risks, and follow-up tasks.
- Any open owner decision is explicit instead of hidden in TODO text.
