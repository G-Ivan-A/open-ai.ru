# open-ai.ru

Production-ready AI-assisted portal for the open-ai.ru ecosystem.

This repository starts from a governance-first skeleton. It defines the operational boundaries for human contributors and AI agents before product code is introduced.

## Repository Purpose

- Maintain a clear feature-first application structure.
- Keep API, event, and AI-agent contracts explicit before implementation.
- Make architectural decisions reproducible through ADRs and governance docs.
- Separate production portal work from educational and research materials.

Educational and research materials are maintained in a separate repository:

https://github.com/G-Ivan-A/research-and-edu-ai-lab

## Approved Skeleton

```text
open-ai.ru/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   └── pull_request_template.md
├── app/
├── components/ui/
├── features/
├── contracts/
├── services/
├── integrations/
├── lib/
├── hooks/
├── stores/
├── prompts/
├── docs/
├── scripts/
├── infrastructure/
├── tests/
└── public/
```

## Current Status

Foundation phase. Product implementation, framework selection, and runtime architecture are intentionally pending.

## Validation

Run the structure validation locally:

```bash
./tests/validate-repository-structure.sh
```

## TODO

- Select the production application framework.
- Define the first API and event contracts.
- Add ADRs for major architecture decisions.
- Replace placeholder files with implementation-specific documentation as features are created.
