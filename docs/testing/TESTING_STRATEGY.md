# Testing Strategy

Baseline testing philosophy for the portal. Stack-specific tools are selected by ADR; this document defines the layers that must exist and the responsibilities of each.

## 1. Goals

- Validate behavior, not implementation details.
- Detect regressions early, automatically, and on every pull request.
- Provide AI contributors with executable specifications they can reason about.
- Keep the test suite fast enough to run locally and in CI without friction.

## 2. Validation Layers

| Layer | What it validates | Triggers |
| --- | --- | --- |
| Structural | Repository skeleton, issue templates, baseline files. | `tests/validate-repository-structure.sh`, `tests/validate-issue-templates.sh` on every pull request. |
| Static | Type safety, linting, formatting. | Pre-commit and CI once a stack is selected. |
| Unit | Pure logic in `lib/`, `services/`, and feature internals. | Run on every change to the touched module. |
| Integration | Interaction between modules and adapters (`integrations/`, `contracts/`). | Run on every pull request that touches integrated modules. |
| Contract | API, event, and AI-agent contracts honor their declared shape. | Run on every contract or feature change that consumes the contract. |
| End-to-end | Critical user journeys through the application shell. | Run on pull requests that touch shell, auth, or critical user paths. |

Each layer is mandatory once the relevant code exists. Skipping a layer requires explicit justification in the pull request.

## 3. Testing Conventions

- **Arrange-Act-Assert.** Tests state setup, action, and expectation explicitly.
- **One concept per test.** Avoid multiple unrelated assertions in a single test case.
- **Deterministic.** No time-, network-, or file-system dependence without explicit fixtures or fakes.
- **Readable names.** Test names describe the behavior being verified, not the function being called.

## 4. Fixtures and Test Data

- Fixtures live alongside the code they test, or under a feature-local `__fixtures__` directory.
- Shared fixtures live under a future `tests/fixtures/` directory once justified.
- Test data never contains real account, partner, or secret values.
- AI-generated fixtures are reviewed for accuracy before being committed.

## 5. AI-Generated Code Verification

- Every AI-generated module ships with at least one unit test that covers its happy path and one explicit failure path.
- AI-generated contract changes ship with contract tests that pin the declared shape.
- AI contributors must run the relevant layers locally before requesting review. Test logs are linked from the pull request when failures are encountered and resolved.
- Reviewers reject AI-generated tests that simply mirror the implementation instead of validating behavior.

## 6. Performance and Load

- Performance tests are not part of the MVP. Once telemetry and SLAs exist, performance budgets are introduced and validated via dedicated CI jobs.
- Until then, performance considerations are documented in feature pull requests with measurements where applicable.

## 7. CI Expectations

- All structural, static, and unit layers must pass on every pull request.
- Integration, contract, and end-to-end suites must pass on pull requests that touch their domains.
- Failing CI blocks merge. Skipping CI requires explicit owner approval.

## 8. Failure Triage

- A failing test is treated as a blocker, not a nuisance.
- Flaky tests are quarantined within one working day and tracked via an issue until resolved.
- Recurrent failures trigger a retrospective entry in `docs/releases/`.

## TODO

- Select the unit, integration, and end-to-end testing frameworks via ADR.
- Add a test coverage policy once the stack is in place.
- Add a self-review prompt under `prompts/reviews/` aligned with this strategy.
