# API Standards

Baseline rules for the portal's API surface. Concrete contracts live under [`contracts/api/`](../../contracts/api/README.md); this document defines the policies they must follow.

## 1. Design Consistency

- **Resource-oriented.** Model APIs around domain resources from the [domain model](../architecture/DOMAIN_MODEL.md). Verbs encode operations on resources.
- **HTTP semantics.** Use standard HTTP methods and status codes. Avoid custom semantics on top of HTTP unless an ADR justifies it.
- **Predictable URLs.** Lowercase, kebab-case paths. Plural collection names. Stable identifiers.
- **JSON by default.** Request and response bodies are JSON unless a contract requires otherwise.
- **No leaky abstractions.** API payloads expose domain concepts, not storage layout.

## 2. Naming Conventions

| Element | Convention | Example |
| --- | --- | --- |
| Path segment | `kebab-case` | `/ai-agents/executions` |
| JSON field | `camelCase` | `accountId`, `createdAt` |
| Query parameter | `camelCase` | `?createdAfter=...` |
| Header (custom) | `X-Open-Ai-<Purpose>` | `X-Open-Ai-Trace-Id` |
| Enum value | `UPPER_SNAKE_CASE` | `STATUS_ACTIVE` |

## 3. Versioning

- API versions are major-only and exposed in the URL: `/v1/...`.
- A new version is created only when a backwards-incompatible change is required.
- A version reaches end of life only after the project owner approves the deprecation in an ADR.
- Within a version, additive changes are allowed; renames and removals are not.

## 4. Errors

- Error responses use a single shape:

  ```json
  {
    "error": {
      "code": "RESOURCE_NOT_FOUND",
      "message": "Human-readable summary.",
      "details": {}
    }
  }
  ```

- Error codes are stable strings. Messages may evolve; codes may not.
- Status codes follow HTTP conventions:
  - `400` for client input errors.
  - `401` and `403` for authentication and authorization failures respectively.
  - `404` for missing resources.
  - `409` for conflict and idempotency violations.
  - `429` for rate limiting.
  - `5xx` for server-side failures.

## 5. Authentication and Authorization

- All non-public endpoints require authentication. The exact scheme is decided by ADR.
- Authorization checks are explicit at the route boundary and never assumed by lower layers.
- Tokens, secrets, and credentials are never logged or echoed in responses.

## 6. Pagination, Filtering, Sorting

- Pagination uses cursor-based pagination by default: `?cursor=...&limit=...`.
- Filtering uses explicit field-based query parameters; complex filtering is deferred until justified by an ADR.
- Sorting uses `?sort=<field>:asc|desc`.

## 7. Integration Expectations

- External system integrations are isolated under `integrations/` and exposed through internal contracts in `contracts/api/`.
- External APIs are never called directly from `features/` modules; they go through an `integrations/` adapter.
- Webhooks and async callbacks define their payloads under `contracts/events/`.

## 8. AI Agent Endpoints

- Endpoints that trigger or report AI executions follow the contracts in [`contracts/ai-agents/`](../../contracts/ai-agents/README.md).
- Long-running AI work returns immediately with an `executionId`; status and artifacts are fetched separately.
- AI-generated content carries metadata describing the originating agent and prompt version.

## 9. Observability

- Every request carries a trace identifier (`X-Open-Ai-Trace-Id`) generated upstream or assigned at the edge.
- Structured logs capture method, path, status, latency, account identifier (when authenticated), and trace identifier.
- API metrics include request counts, error rates, and latency histograms per route.

## TODO

- Replace baseline rules with the first concrete contract once the stack is selected.
- Decide on contract format (OpenAPI, schema-first, code-first) via ADR.
- Add an automated contract lint step in CI.
