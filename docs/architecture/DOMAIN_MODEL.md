# Domain Model

Baseline domain model for the portal. Entities, relationships, and bounded contexts are intentionally small at this stage and grow with each feature increment.

## 1. Modeling Principles

- **Bounded contexts mirror feature modules.** A new feature in `features/` introduces or extends a bounded context.
- **Cross-context references are explicit.** They flow through contracts in `contracts/` rather than through shared data structures.
- **Persistence-agnostic.** The domain model is defined independently of storage; persistence decisions are captured in ADRs.
- **AI-readable.** Entity and relationship names match those used by AI contributors in issues and prompts.

## 2. Bounded Contexts

| Context | Responsibility | Feature module |
| --- | --- | --- |
| Identity | Authentication, sessions, account lifecycle. | `features/auth` |
| Profile | User identity attributes and preferences. | `features/profile` |
| Dashboard | Operational overview, widgets, surfaced telemetry. | `features/dashboard` |
| Catalog | Listing of AI-assisted services and integrations. | `features/catalog` |
| Integrations | External system connections and credentials. | `features/integrations` |
| Education Sync | Boundary with the educational repository. | `features/education-sync` |
| AI Agents | Agent definitions, prompts, execution records. | Cross-cutting via `contracts/ai-agents` |

## 3. Core Entities (Baseline)

```
Account
  - id
  - email
  - status
  - createdAt

Profile
  - accountId
  - displayName
  - locale
  - timezone

Session
  - id
  - accountId
  - issuedAt
  - expiresAt

Service
  - id
  - name
  - category
  - status

Integration
  - id
  - serviceId
  - accountId
  - status
  - configRef

AIAgent
  - id
  - name
  - capabilities
  - contractRef

AIExecution
  - id
  - agentId
  - issueRef
  - status
  - artifacts
```

These shapes are illustrative and will be refined by ADRs and feature work. Field types are intentionally omitted until a persistence ADR is accepted.

## 4. Relationships (Baseline)

- An `Account` owns at most one `Profile`.
- An `Account` may hold many `Session`s and many `Integration`s.
- A `Service` may be referenced by many `Integration`s.
- An `AIAgent` may produce many `AIExecution`s, each tied to an issue or task in the repository.
- An `AIExecution` may reference one or more `Service` or `Integration` entities through its artifacts.

## 5. Invariants

- An `Integration` cannot exist without both an `Account` and a `Service`.
- A `Session` is invalidated if its `Account` status becomes inactive.
- An `AIExecution` must reference a contract version that is currently accepted.

## 6. Out of Scope (For Now)

- Billing, plans, entitlements.
- Multi-tenant organization structures.
- Granular permission models beyond the account boundary.
- Notifications, messaging, and inbox primitives.

These belong to later iterations and require their own ADRs before entering the domain model.

## TODO

- Replace baseline tables with a formal entity diagram once a modeling tool is selected.
- Map each entity to its contract definitions under `contracts/`.
- Capture explicit value objects, aggregates, and repository boundaries once persistence is selected.
