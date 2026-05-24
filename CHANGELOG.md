# Changelog

All notable changes to this repository will be documented here.

The format will follow a simple date-based history until a release process is selected.

## Unreleased

### Added

- Governance-first repository skeleton.
- GitHub issue and pull request templates.
- Baseline structure validation.
- Governance baselines: `docs/governance/AI_RULES.md`, `docs/governance/REPOSITORY_RULES.md`, `docs/governance/EDUCATIONAL_SYNC_POLICY.md`.
- ADR entry point at `docs/adr/README.md` referencing the existing `docs/architecture/adr/` registry.
- Prompt governance baseline at `prompts/README.md`.
- GitHub issue config and AI implementation task template (`.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/ai_implementation_task.yml`).
- Product baselines: `docs/product/PRODUCT_VISION.md`, `docs/product/MVP_SCOPE.md`.
- Architecture baselines: `docs/architecture/ARCHITECTURE.md`, `docs/architecture/DOMAIN_MODEL.md`.
- Development standards: `docs/development/CODING_STANDARDS.md`, `docs/development/API_STANDARDS.md`, `docs/development/ERROR_HANDLING.md`.
- Testing strategy at `docs/testing/TESTING_STRATEGY.md`.
- Release governance at `docs/releases/README.md`.
- Research governance and template at `docs/research/README.md` and `docs/research/template.md`.
- Structure validator extended to enforce the new baseline files and directories.

### Removed

- Legacy planning and solution experiment files during the required cleanup phase.

## TODO

- Select release cadence and changelog format.
- Add versioning rules when production packages are introduced.
