# Repository Concept Audit and Improvement Options

Status: draft for stakeholder agreement
Date: 2026-05-25
Issue: [G-Ivan-A/open-ai.ru#42](https://github.com/G-Ivan-A/open-ai.ru/issues/42)
Canonical editable format: Markdown
Review format: HTML pair in the same directory

## Target File Set

This audit package is stored in `docs/product/` because the requested outputs define product direction, roadmap, backlog, and positioning for the portal.

| Requested artifact | Markdown | HTML |
| --- | --- | --- |
| Repository audit and comparison table | `docs/product/2026-05-25-repository-audit-comparison.md` | `docs/product/2026-05-25-repository-audit-comparison.html` |
| Roadmap draft | `docs/product/2026-05-25-improvement-roadmap.md` | `docs/product/2026-05-25-improvement-roadmap.html` |
| Backlog draft | `docs/product/2026-05-25-implementation-backlog.md` | `docs/product/2026-05-25-implementation-backlog.html` |
| Product vision options | `docs/product/2026-05-25-product-vision-options.md` | `docs/product/2026-05-25-product-vision-options.html` |

## Scope

The audit evaluates the repository as of 2026-05-25 against the concept stated in issue #42:

- `open-ai.ru` as a portal and platform for open-source AI solutions and agents for business automation.
- Ready-to-deploy components and complete solutions that can be used commercially with attribution and clear licensing.
- Open educational courses connected to the ecosystem without mixing production and learning artifacts.
- A personal account with authorization, corporate project access by role and project, and optional access to closed licensed software or repositories.
- A tool for distributed teams that cannot always work inside one corporate environment and may need an additional controlled repository or workspace.

Repository sources reviewed:

- `README.md`, `PRODUCT_VISION.md`, `ROADMAP.md`
- `docs/product/PRODUCT_VISION.md`, `docs/product/MVP_SCOPE.md`
- `docs/architecture/ARCHITECTURE.md`, `docs/architecture/DOMAIN_MODEL.md`, `docs/architecture/PORTAL_BUILDING_METHODOLOGY.md`
- `docs/governance/*`, `AI_GOVERNANCE.md`, `AI_RULES.md`, `AI_QUICK_REF.md`
- `contracts/*`, `features/README.md`, `.github/*`, `tests/*`
- Related issues: #5, #7, #20, #21, #42
- Related repository context: `G-Ivan-A/clarify-engine-ai` at a high level, as a candidate ecosystem solution referenced by issue #21.

## Executive Conclusion

The repository is coherent as a governance-first foundation, but it is not yet aligned with the full product concept from issue #42. The strongest assets are controlled AI-assisted development rules, feature-oriented skeleton, validation scripts, and early product/architecture baselines. The main gaps are product definition, catalog model, solution intake criteria, license policy, workspace/RBAC model, and education integration boundary.

The recommended direction is a phased hybrid: keep the governance-first foundation, then make `open-ai.ru` a curated Open AI Solutions Hub with role-based project workspaces. Do not start with a broad marketplace, social network, or course platform. Start with a narrow catalog contract, one reference solution, and a controlled workspace model.

## Concept Fit

| Concept dimension | Current repository state | Fit | Gap | Recommended next action |
| --- | --- | --- | --- | --- |
| Portal for open-source AI business solutions | Catalog and integrations are named as feature boundaries, but no solution-card schema, intake policy, or catalog content exists. | Partial | The repo says "catalog", but does not define what qualifies as a solution. | Add `solution-card` contract, maturity levels, and intake/review checklist. |
| Deployable components and complete solutions | `infrastructure/`, `integrations/`, and `services/` are placeholders; no deployment template policy exists. | Weak | Issue #20 describes Starter/Business/Cloud Pro/Cloud Enterprise, but current docs do not. | Add deployment-tier model and require each cataloged solution to state supported tiers. |
| Commercial use with attribution | `LICENSE` is still pending. | Weak | Commercial readiness cannot be claimed without final license and third-party license process. | Open a license decision issue/ADR; likely compare Apache-2.0, MIT, and component-level licenses. |
| AI agents for business automation | `contracts/ai-agents/`, prompts, and AI governance exist. | Good foundation | Contracts are still README placeholders. | Add an AI-agent contract template: inputs, permissions, tools, review gate, logs, outputs. |
| Open education | Education-sync boundary exists and keeps educational materials out of production repo. | Good boundary | Issue #42 also mentions open courses; current product vision treats education as external sync only. | Define course metadata and publish/sync flow without hosting tutorials here. |
| Personal account and dashboard | `features/auth`, `features/profile`, and `features/dashboard` exist as placeholders; MVP scope includes auth/profile/dashboard. | Partial | No RBAC, organization, project, or closed-resource access model. | Add workspace/RBAC domain model before implementation. |
| Corporate projects by role/project | Not modeled beyond generic `Account`, `Profile`, `Session`. | Weak | The issue explicitly needs project-role access and closed licensed resources. | Add `Organization`, `Project`, `Membership`, `Role`, `Entitlement`, `RepositoryAccess` concepts. |
| Distributed inter-company team work | Current docs focus on AI-assisted SDLC, not external collaboration. | Weak | No federation, invite, audit, data boundary, or customer workspace policy. | Add collaboration model and security assumptions as a research/ADR candidate. |
| Governance-first AI development | Strong documents and validation already exist. | Strong | Some duplication and source-of-truth ambiguity remain. | Consolidate document ownership and mark canonical vs summary docs. |

## Duplication, Redundancy, and Ambiguity

| Area | Observation | Risk | Action |
| --- | --- | --- | --- |
| Product vision | There is a root `PRODUCT_VISION.md` and a detailed `docs/product/PRODUCT_VISION.md`. | Contributors may update the wrong file. | Keep root as short public summary; mark `docs/product/PRODUCT_VISION.md` as working source. |
| AI rules | Root `AI_RULES.md` and `docs/governance/AI_RULES.md` overlap. | Divergence in AI operating constraints. | Define root file as quick technical constraints and nested file as full operational contract. |
| Roadmap | Root `ROADMAP.md` is phase-based and not connected to tracked backlog items. | Strategy does not translate into delivery. | Use the roadmap draft in this audit package to seed milestones and issues. |
| Research boundary | `docs/research/` exists, while methodology says the repo does not initiate independent research. | Confusing line between product research and educational content. | Clarify that `docs/research/` is decision support for this product, not course or tutorial content. |
| Legacy concept | Validator rejects `CONCEPT.md` and `solutions/`, while older issues reference them. | New contributors may follow closed issue artifacts and break the approved skeleton. | Use `docs/product/` and `features/catalog` instead of recreating legacy root paths. |
| Placeholder folders | Many feature and platform folders only contain `.gitkeep`. | Skeleton may look more mature than it is. | Add feature README files when a feature gets real scope; keep placeholders honest in roadmap. |
| CI workflow branches | `.github/workflows/validate-structure.yml` has a push trigger for `issue-24-d0e0bcc17e68`. | Branch-specific residue weakens repository hygiene. | Replace with a stable branch policy in a separate cleanup issue. |
| License placeholder | `LICENSE` explicitly says no production license selected. | "Open-source" and "commercial use" claims are legally incomplete. | Prioritize license decision before public solution catalog launch. |

## Risks

| Risk | Severity | Why it matters | Mitigation |
| --- | --- | --- | --- |
| Product scope too broad for the foundation phase | High | Catalog, courses, workspaces, agents, deployments, and closed repos are multiple products if pursued at once. | Choose a phased north star and define a narrow MVP. |
| License ambiguity | High | Commercial deployment depends on rights to use, modify, distribute, and attribute code, models, datasets, and templates. | Select repository license and add third-party license metadata to solution cards. |
| Trust and safety gap for agent execution | High | Agent tools can read data, call APIs, and modify artifacts. | Require explicit tool permissions, audit logs, consent, and sandboxing in agent contracts. |
| Supply-chain risk in curated solutions | High | A portal that recommends deployable OSS inherits reputational risk from vulnerable dependencies. | Add OpenSSF Scorecard, SLSA/provenance, SBOM, and vulnerability scan expectations. |
| Closed repository access without RBAC model | High | Corporate projects need least privilege, auditability, and revocation. | Model organization/project roles before building auth screens. |
| Education scope drift | Medium | The production repo may become a tutorial repository. | Keep courses in the education repo or an external LMS; sync only metadata and approved summaries. |
| Duplicate governance sources | Medium | AI agents may follow stale instructions. | Add source-of-truth markers and update policy references. |
| Premature marketplace positioning | Medium | A marketplace implies payments, support, vendor verification, and dispute handling. | Start as curated catalog and deployment hub, not marketplace. |

## Opportunities

| Opportunity | Value | First practical step |
| --- | --- | --- |
| Curated OSS AI solution catalog for SMB/business automation | Differentiates from generic model catalogs by focusing on deployable business outcomes. | Define solution card with task, result, deployment tier, license, data boundary, and support status. |
| Reference solution path using Clarify Engine | Gives the platform a concrete flagship without inventing a new demo. | Add a catalog-card draft and deployment-readiness checklist for Clarify Engine. |
| Role-based project workspace | Makes the portal useful for distributed teams and corporate collaborations. | Add RBAC domain model and access-policy backlog items. |
| Governance as product asset | The existing AI-assisted SDLC methodology can be a trust signal for partners. | Publish a concise governance page in the portal shell during MVP. |
| Education as onboarding funnel | Courses can teach safe adoption and feed contributors into the ecosystem. | Define course metadata and educational sync, but keep content outside this repo. |
| Open protocols for agents | MCP and A2A can reduce custom integration work later. | Research MCP for agent-to-tool and A2A for agent-to-agent interoperability before implementation. |

## Best Practice References

| Source | Relevance to `open-ai.ru` |
| --- | --- |
| [Open Source AI Definition 1.0, OSI](https://opensource.org/ai/open-source-ai-definition) | Helps avoid vague "open AI" claims; AI artifacts need enough material to inspect, modify, and reuse. |
| [Apache License 2.0 guidance](https://www.apache.org/legal/apply-license) and [MIT License, OSI](https://opensource.org/license/mit) | Baseline options for commercial-friendly open-source licensing; Apache-2.0 adds explicit patent terms and NOTICE practice. |
| [Hugging Face Hub docs](https://huggingface.co/docs/hub/main/en/index) | Strong pattern for cards, model/dataset/app metadata, private team collaboration, and community discovery. |
| [Artifact Hub / CNCF](https://www.cncf.io/blog/2024/09/17/artifact-hub-becomes-a-cncf-incubating-project/) | Good pattern for package discovery, official source labeling, vulnerability metadata, and related artifacts. |
| [Open edX](https://openedx.org/) | Mature open-source path for courses if the education track needs a real LMS rather than custom course hosting. |
| [Open Platform for Enterprise AI, LF AI & Data](https://www.linuxfoundation.org/press/lf-ai-data-foundation-launches-open-platform-for-enterprise-ai-opea) | Relevant reference for composable enterprise GenAI systems, RAG pipelines, and vendor-neutral collaboration. |
| [OpenSSF Scorecard](https://openssf.org/projects/scorecard/) | Candidate automated signal for evaluating curated open-source projects. |
| [SLSA specification](https://slsa.dev/spec/latest/) | Candidate framework for build provenance and supply-chain integrity. |
| [Model Context Protocol](https://modelcontextprotocol.io/specification/latest) | Relevant for agent-to-tool integrations and consent/security implications. |
| [Agent2Agent Protocol](https://a2a-protocol.org/latest/) | Relevant for future multi-agent interoperability across frameworks and vendors. |
| [OpenAPI Specification learning site](https://learn.openapis.org/specification/) | Practical standard for machine-readable API contracts when solution components expose HTTP APIs. |

## Improvement Options

| Option | Description | Pros | Cons | Effort | Recommendation |
| --- | --- | --- | --- | --- | --- |
| A. Stay governance-first only | Continue refining AI-assisted SDLC and repository rules before product artifacts. | Low execution risk; keeps quality high. | Does not answer the broader portal concept; delays catalog and workspace learning. | Low | Keep as foundation, not as whole strategy. |
| B. Catalog-first hub | Prioritize solution-card schema, selection criteria, and one or two curated AI solutions. | Fast product clarity; aligns with open-source solution concept. | Without workspace/RBAC, corporate use cases remain shallow. | Medium | Use as Phase 1. |
| C. Workspace-first platform | Build account, project, roles, closed repo access, and dashboards first. | Directly addresses corporate collaboration. | Higher security and architecture complexity before catalog value is proven. | High | Defer until catalog model is stable. |
| D. Education-first portal | Build course publishing and learner journeys first. | Supports community and adoption. | Conflicts with current production/education separation if done inside this repo. | Medium | Keep as linked ecosystem track, not MVP core. |
| E. Phased hybrid | Governance foundation -> catalog contract -> reference solution -> role-based workspace -> education sync. | Preserves current strengths while moving toward the full concept. | Requires disciplined sequencing and explicit non-goals. | Medium | Recommended. |

## Recommended Decision

Adopt option E:

> `open-ai.ru` is a governance-led portal for discovering, evaluating, and deploying commercially usable open-source AI agents and business automation solutions, with role-based project workspaces for open and licensed corporate collaboration, and an education track connected through controlled sync.

Immediate next moves:

1. Approve this target positioning or choose an alternative from the product vision options file.
2. Add a solution-card contract and catalog intake checklist before adding solution content.
3. Create a license decision issue before public "commercial use" claims.
4. Add RBAC/workspace domain concepts before implementing authentication screens.
5. Treat education as a connected track with metadata and sync, not as production repository content.

## Research Needs

| Research question | Why it is needed | Output |
| --- | --- | --- |
| Repository and solution licensing | Determines commercial-use promise and attribution model. | License ADR or owner-approved decision record. |
| Solution maturity model | Needed for Starter/Business/Cloud Pro/Cloud Enterprise levels from issue #20. | Catalog criteria and deployment-tier template. |
| RBAC and closed-resource access | Needed for corporate projects and licensed repositories. | Domain model update and security review checklist. |
| Agent sandboxing and permissions | Needed before agents can act on user or corporate data. | AI-agent contract template and threat model. |
| Education platform choice | Needed if courses become product surface. | Decision: external LMS, education repo only, or metadata-only portal integration. |
| Supply-chain scoring | Needed to curate third-party OSS responsibly. | Scorecard/provenance/security metadata policy. |
