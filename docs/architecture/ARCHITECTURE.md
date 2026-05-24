# Architecture

Baseline architecture document for the `open-ai.ru` portal. Decisions that change the contents of this document are captured in [ADRs](adr/README.md).

## 1. Architectural Goals

- **Maintainability.** New contributors and AI agents can map any change to a single feature or module.
- **Scalability.** Features grow without restructuring the repository.
- **Governance-first.** Contracts, ADRs, and tests precede implementation in the critical path.
- **Reversibility.** Every architectural change leaves an audit trail and a documented exit path.

## 2. High-Level Concept

The portal is a **feature-oriented Next.js application** backed by a small set of shared platform services and AI-agent contracts. The system is composed of three layers:

1. **Application shell.** Routing, layout, theming, authentication boundary, error handling.
2. **Feature modules.** Self-contained capabilities (auth, dashboard, profile, catalog, integrations, education-sync) with their own UI, data access, and tests.
3. **Platform services.** Cross-cutting concerns (logging, telemetry, contracts, AI-agent execution) exposed as reusable libraries.

```
+---------------------------------------+
|             Application Shell         |
|  Next.js App Router / shared layout   |
+----+----------+----------+------------+
     |          |          |
+----v---+ +----v---+ +----v------+
| auth   | | dash   | | catalog   |   feature modules
+--------+ +--------+ +-----------+
     |          |          |
+----v----------v----------v-----+
|   Platform Services / lib /     |
|   contracts / prompts / hooks   |
+---------------------------------+
```

## 3. Feature-Oriented Organization

- Each feature lives under `features/<name>/` and owns its UI components, data access, types, prompts, and tests.
- Cross-feature reuse goes through `components/`, `lib/`, `hooks/`, `services/`, or `stores/`. A feature never imports from another feature directly.
- Shared UI primitives live in `components/ui/`. Feature-specific UI stays inside the feature.
- AI-assisted execution inside a feature must use prompts under `prompts/` and contracts under `contracts/ai-agents/`.

## 4. Scalable Portal Structure

- **App entry.** `app/` hosts Next.js routes that compose features.
- **Features.** `features/` hosts capability modules. Adding a feature requires an issue, an updated `features/README.md`, and a feature-level `README.md` once code is written.
- **Contracts.** `contracts/` hosts external surface definitions:
  - `contracts/api/` for HTTP/RPC contracts.
  - `contracts/events/` for event payloads.
  - `contracts/ai-agents/` for AI agent inputs, outputs, permissions.
- **Infrastructure.** `infrastructure/` hosts deployment, environment, and platform configuration once selected.
- **Services and integrations.** `services/` is for internal capabilities, `integrations/` for external systems.

## 5. Governance-Driven Architecture

- Architectural changes flow through ADRs before code lands. The ADR is the source of truth; this document summarizes the accepted decisions.
- Contracts are immutable until a new contract version is approved. Breaking changes require an ADR and a coordinated update in `features/` and `integrations/`.
- AI agents may propose architecture changes only in Creative Mode tasks and only through ADR drafts.

## 6. Cross-Cutting Concerns

- **Configuration.** Runtime configuration is supplied via environment variables documented in `.env.example`. Secrets never enter the repository.
- **Observability.** Logging, metrics, and tracing hooks are exposed via `lib/` (or a future `services/observability/` module). Features must emit structured events for important state transitions.
- **Error handling.** Follows the principles in [`docs/development/ERROR_HANDLING.md`](../development/ERROR_HANDLING.md).
- **Testing.** Follows [`docs/testing/TESTING_STRATEGY.md`](../testing/TESTING_STRATEGY.md).

## 7. Non-Goals

- The portal does not embed a tutorial system or a content management workflow.
- The portal does not implement custom AI runtimes; it integrates with external providers via documented contracts.
- The portal does not provide a generic plugin marketplace at this stage.

## TODO

- Add ADR-0001 selecting the runtime stack and pin this document to it.
- Add context, container, and component diagrams once the stack is selected.
- Document deployment topology once `infrastructure/` is populated.
