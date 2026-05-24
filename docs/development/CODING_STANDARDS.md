# Coding Standards

Baseline coding rules for the portal. Stack-specific addenda are added once a runtime is selected via ADR.

## 1. Maintainability Principles

- **Single responsibility.** Each module, function, and React component does one thing.
- **Composition over inheritance.** Prefer small composable units that can be replaced independently.
- **Pure first.** Push side effects to the edges of a module. Keep core logic deterministic and testable.
- **No dead code.** Remove unused exports, dead branches, and commented-out blocks before merging.

## 2. Readability Expectations

- Names express intent: business identifiers over technical jargon.
- Functions stay short. When a function grows beyond a screen, split it.
- Comments explain *why*, never *what*. Well-named identifiers carry the *what*.
- Public APIs (exports, route handlers, contracts) are documented with a one-line purpose statement when their behavior is non-obvious.

## 3. Consistency Standards

- File and directory naming follows [`REPOSITORY_RULES.md`](../governance/REPOSITORY_RULES.md).
- Formatting is enforced by `.editorconfig` and the eventual linter. Two-space indentation, LF line endings, UTF-8.
- Imports are grouped: external dependencies, internal absolute imports, relative imports.
- Module exports use named exports by default. Default exports are reserved for framework conventions (for example, Next.js page or layout files).

## 4. Module Boundaries

- Cross-feature imports are forbidden. Shared code moves into `components/`, `lib/`, `hooks/`, `services/`, or `stores/`.
- Public surfaces are explicit: a feature exposes only what is needed by routes or other shared modules through a single entry file once a stack is in place.
- Contracts under `contracts/` are the only source of truth for cross-boundary types.

## 5. AI-Assisted Coding Considerations

- AI-generated code must follow the same standards as human-written code. Reviewers should reject changes that violate these standards regardless of author.
- AI agents prefer reuse: search the codebase before introducing a new helper.
- Generated boilerplate must be trimmed to what is actually used.
- AI agents do not introduce new dependencies. New dependencies require an ADR.
- AI agents annotate uncertain decisions in the pull request description rather than in code comments.

## 6. Error Handling, Logging, Testing

- Error handling follows [`ERROR_HANDLING.md`](ERROR_HANDLING.md).
- Logging emits structured events; sensitive fields are redacted at the source.
- Testing follows [`TESTING_STRATEGY.md`](../testing/TESTING_STRATEGY.md). Every functional requirement gets at least one test.

## 7. Pull Request Standards

- One issue per pull request, one logical change per commit when possible.
- Pull request description references the issue, summarizes the change, and lists validation steps.
- Reviewer checklist (in addition to the template): naming, module boundaries, test coverage, contract impact, security impact, documentation impact.

## TODO

- Add stack-specific style guide entries (TypeScript, React, Next.js, etc.) after the stack ADR lands.
- Add lint and formatter configuration files and reference them here.
- Add a code-review prompt under `prompts/reviews/` aligned with these standards.
