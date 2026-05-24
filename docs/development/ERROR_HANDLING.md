# Error Handling

Baseline error-handling philosophy for the portal. Concrete error codes, response shapes, and observability hooks are defined in [`API_STANDARDS.md`](API_STANDARDS.md) and feature-level documentation.

## 1. Principles

- **Predictability.** A given failure mode produces the same shape, the same code, and the same log entry every time.
- **Locality.** Errors are handled at the layer that can act on them. Layers that cannot act on an error must propagate it without altering it.
- **Honesty.** Errors are never silently swallowed. Either they are handled, or they are surfaced with context.
- **Safety.** Error paths never leak secrets, credentials, or internal implementation details to clients.

## 2. Error Categories

| Category | Origin | Example | Disposition |
| --- | --- | --- | --- |
| Validation | Client input | Missing required field | Return `400` with a validation error code. |
| Authentication | Missing or invalid credentials | Expired session | Return `401` and require re-authentication. |
| Authorization | Authenticated but not permitted | Cross-account access attempt | Return `403`. Never reveal whether the resource exists. |
| Not found | Resource lookup miss | Unknown profile id | Return `404`. |
| Conflict | State or idempotency violation | Duplicate creation | Return `409` with a conflict code. |
| Rate limit | Throughput protection | Burst exceeded | Return `429` with retry guidance. |
| Upstream | External integration failure | Provider timeout | Return `502` or `503`; record retry policy. |
| Internal | Unexpected runtime failure | Unhandled exception | Return `500` with a generic message; log full context. |

## 3. Boundaries

- **Domain layer.** Throws or returns typed errors named after the failure (`AccountInactiveError`, `ServiceUnavailableError`). Never speaks HTTP.
- **Service layer.** Translates domain errors into application-level outcomes and decides whether to retry, fall back, or surface.
- **API layer.** Translates application outcomes into HTTP responses using the shape defined in `API_STANDARDS.md`.
- **UI layer.** Renders user-facing error states. Distinguishes between recoverable and non-recoverable errors.

## 4. Retries and Fallbacks

- Retries apply only to idempotent operations.
- Retry policies are explicit: backoff strategy, attempt cap, and dead-letter destination.
- Fallbacks are documented at the feature level. A fallback is acceptable only when the degraded behavior is clearly distinguishable to the user.

## 5. Logging and Observability

- Every error is logged as a structured event with at least: timestamp, trace identifier, error code, layer, optional account identifier.
- Stack traces are logged for internal errors only; expected client errors do not pollute error metrics.
- Error metrics are emitted per category and per route. Alerting thresholds are defined per environment.

## 6. AI-Generated Code Considerations

- AI contributors must surface unexpected errors via the standard channels rather than catching and discarding them.
- AI-generated error messages are reviewed for tone, accuracy, and absence of sensitive content.
- Prompt and contract violations during AI execution are first-class errors with their own code namespace (for example, `AI_CONTRACT_VIOLATION`).

## 7. User Experience

- User-facing error messages are short, actionable, and free of internal jargon.
- Recoverable errors offer a next step (retry, sign in again, contact support).
- Non-recoverable errors include a reference identifier that maps to the structured log entry.

## TODO

- Define the canonical list of error codes once the stack is selected.
- Add error-state design tokens to the design system.
- Add a runbook section per error category once on-call exists.
