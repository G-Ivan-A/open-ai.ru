# Contributing

This repository is in governance foundation mode. Contributions should preserve traceability and avoid introducing product code before the related structure, contracts, and decisions are documented.

## 🌐 External Teams & Onboarding

New to this project or joining as an external team?<br>
→ Read [PORTAL_BUILDING_METHODOLOGY.md](docs/architecture/PORTAL_BUILDING_METHODOLOGY.md) to understand HOW we build this portal (process, principles, AI interaction).<br>
→ Then follow the technical contribution guidelines below.

## Workflow

1. Start from a GitHub issue with clear acceptance criteria.
2. Use the feature branch associated with the issue.
3. Keep commits focused and forward-moving.
4. Add or update tests for structural and behavioral requirements.
5. Update documentation when changing governance, contracts, architecture, or workflows.

## Local Validation

Run:

```bash
./tests/validate-repository-structure.sh
```

## Pull Requests

Pull requests should include:

- Linked issue.
- Summary of the change.
- Validation performed.
- Risks, assumptions, and follow-up tasks.

## TODO

- Add coding standards after the runtime stack is selected.
- Add local development setup once the application framework is introduced.
- Add release and versioning rules.
