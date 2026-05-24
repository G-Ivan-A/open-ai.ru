# Releases

Baseline release governance for the portal. Concrete release tooling is introduced once the runtime stack is selected via ADR.

## 1. Release Philosophy

- **Foundation first.** No release before the governance, architecture, and testing baselines are in place.
- **Small, frequent releases.** Smaller releases are easier to review, ship, and revert.
- **Reversible by default.** Every release ships with a rollback plan, even if it is "redeploy the previous build".
- **Traceable.** Each release maps to a documented set of merged pull requests and updated `CHANGELOG.md` entries.

## 2. Release Lifecycle

1. **Plan.** A release is scoped to a milestone or a curated set of issues.
2. **Stabilize.** The release branch (or trunk-tagged commit, depending on the chosen strategy) is frozen for new features; only fixes are accepted.
3. **Verify.** Structural, static, unit, integration, contract, and end-to-end validation layers pass.
4. **Publish.** A versioned artifact is produced. `CHANGELOG.md` is updated. A release note is added under `docs/releases/`.
5. **Deploy.** Deployment is performed via the documented process under `infrastructure/`.
6. **Observe.** Post-release telemetry is monitored for the stated observation window.
7. **Retrospect.** Lessons are captured as issues, ADRs, or updates to this directory.

## 3. Versioning

- Until the first production deployment, the project uses date-based pre-release tags (`YYYY-MM-DD-foundation-NN`).
- After the first production deployment, versioning follows the convention selected by ADR (Semantic Versioning is the assumed default).
- Breaking changes always bump the major version.

## 4. Changelog Conventions

- `CHANGELOG.md` follows a simple chronological layout: `Unreleased`, then dated release sections.
- Entries are grouped by `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
- Each entry references the pull request and, when applicable, the related ADR.

## 5. Release Notes

- Each release adds a file `docs/releases/<version>.md` describing scope, validation, risks, rollback plan, and follow-up issues.
- Release notes are written for two audiences: maintainers and end users. The end-user section is kept short and free of internal jargon.

## 6. AI-Assisted Release Activities

- AI contributors may draft release notes from `CHANGELOG.md` and merged pull request descriptions.
- AI contributors must not initiate publication, deployment, or tag creation.
- AI-assisted regression analysis is reviewed by a human before being acted on.

## 7. Operational Gates

- A release requires sign-off from the project owner.
- Security-relevant releases require an additional security review.
- A release that touches governance or contracts requires explicit reference to the ADR or governance document that authorizes the change.

## TODO

- Select the release tooling via ADR (CI publishing, environment promotion strategy, artifact registry).
- Add a release readiness checklist template.
- Add a rollback runbook template once `infrastructure/` is populated.
