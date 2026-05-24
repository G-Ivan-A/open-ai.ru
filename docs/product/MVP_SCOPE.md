# MVP Scope

Defines the boundary of the first deliverable iteration of the portal. The MVP is governance-led: it ships only what the foundation requires and what is needed to validate the AI-assisted SDLC end-to-end.

## 1. MVP Goal

Ship a minimal, controlled portal foundation that:

- demonstrates the AI-assisted SDLC inside production guardrails;
- supports the smallest viable personal account and dashboard;
- exposes one real AI-assisted workflow end-to-end with reviewable artifacts;
- preserves room for incremental feature growth without restructuring.

## 2. In-Scope Capabilities

- **Application shell.** Single Next.js App Router shell with shared layout, navigation, and theming primitives.
- **Authentication baseline.** Email-based authentication scaffold using a single, governance-approved provider.
- **Profile foundation.** Read-only profile page sourced from authenticated session data.
- **Dashboard foundation.** Empty-state dashboard with operational widgets stubbed for future telemetry.
- **AI workflow walkthrough.** One reference AI workflow that runs against a documented contract and produces reviewable output.
- **Governance surface.** Public pages that point to repository documentation, ADRs, and educational sync policy.

## 3. Out of Scope for MVP

- Multi-tenant capabilities, billing, paid plans.
- Third-party integrations beyond the single reference workflow.
- Public catalog browsing without authentication.
- Server-side analytics dashboards.
- Mobile applications.
- Localization beyond the default language baseline (RU primary, EN secondary).
- Automated education sync.

These items remain on the roadmap and may move into a later iteration without restructuring the MVP.

## 4. Implementation Priorities

1. Foundation track must be complete before platform track work is merged.
2. Platform track must satisfy the application shell before authentication is added.
3. Authentication must be live before the dashboard or profile work is merged.
4. The reference AI workflow ships last and proves the foundation.

## 5. Delivery Constraints

- Every MVP feature is delivered behind a feature boundary inside `features/`.
- No new dependencies enter the project without an accepted ADR.
- No production data, secrets, or partner identifiers ship in repository history.
- Telemetry, alerting, and observability hooks must be present even if their backends are not yet wired up.

## 6. Acceptance for MVP

The MVP is considered complete when:

- a fresh contributor can clone the repository, run `tests/validate-repository-structure.sh`, and execute the documented bootstrap;
- the authentication walkthrough succeeds against a staging environment;
- the dashboard renders the empty-state and the single reference AI workflow;
- governance documents (this file included) reflect the shipped reality.

## TODO

- Set measurable MVP success criteria once telemetry is selected.
- Map each MVP capability to a tracked issue and milestone.
- Define a "post-MVP review" issue that captures lessons before the next iteration.
