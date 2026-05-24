# Product Vision

> Detailed product vision extending the root-level [`PRODUCT_VISION.md`](../../PRODUCT_VISION.md). The root document remains the short, public-facing statement; this document captures the working narrative used by the product and engineering team.

## 1. Portal Purpose

`open-ai.ru` is a production portal for AI-assisted services, integrations, and operational AI governance. The portal exposes:

- a personal account and dashboard where users manage their AI-assisted workflows;
- a catalog of AI-assisted services and integrations;
- analytics, observability, and review surfaces that make AI execution accountable;
- a foundation for safe collaboration between human contributors and AI agents.

## 2. Target Direction

Over the next iterations the portal evolves along three parallel tracks:

1. **Foundation track.** Governance, contracts, repository structure, ADRs.
2. **Platform track.** Application shell, authentication, profile, dashboard, catalog, integrations.
3. **AI-native operations track.** Prompt lifecycle, agent contracts, review automation, education sync.

Foundation work always leads platform work, and platform work always leads AI-native operations work.

## 3. AI-Native Development Philosophy

- AI assists implementation. Architecture, contracts, and governance stay under human control.
- Every AI execution lives inside an issue, prompt, or contract that defines its boundaries.
- Reuse beats reinvention: shared modules, prompts, and contracts are first-class assets.
- Observability is a feature: AI actions must be traceable through commits, ADRs, and review history.

## 4. Long-Term Platform Objectives

- **Operational maturity.** Predictable release cadence, telemetry, and incident handling.
- **Scalable governance.** Documentation that grows linearly with the system, not exponentially.
- **Composable services.** Feature modules in `features/` are independently deployable as the platform matures.
- **Open educational graduation path.** Reusable patterns flow to [`research-and-edu-ai-lab`](https://github.com/G-Ivan-A/research-and-edu-ai-lab) under the [educational sync policy](../governance/EDUCATIONAL_SYNC_POLICY.md).

## 5. Audience

| Audience | What they get | Where they enter |
| --- | --- | --- |
| Founder and product owner | Governance levers, roadmap, and decision traceability | `ROADMAP.md`, `docs/product/` |
| Product team | Vision, MVP scope, journeys | `docs/product/` |
| Engineering contributors | Architecture, contracts, standards | `docs/architecture/`, `docs/development/` |
| AI contributors | Operating rules, prompts, contracts | `AI_GOVERNANCE.md`, `docs/governance/`, `prompts/` |
| Reviewers | Pull request gates, ADRs, validators | `.github/`, `tests/` |

## 6. Boundaries

The portal is not a research platform, tutorial host, or general-purpose CMS. New scope ideas are evaluated against this vision and either accepted into the roadmap, deferred, or moved to the educational repository.

## TODO

- Add measurable platform objectives once telemetry is in place.
- Add journey maps for founder, contributor, and reviewer roles.
- Link product themes to roadmap phases and tracked issues.
