# open-ai.ru

Minimal planning repository for the open-ai.ru web portal.

Status: Phase 0 - Planning.

## Repository Structure

```text
.
|-- README.md
|-- docs/
|   |-- vision.md
|   |-- product-concept.md
|   |-- solution-concept.md
|   `-- adr/
|       `-- .gitkeep
|-- src/
|   `-- .gitkeep
`-- .gitignore
```

## Documents

- [Vision](docs/vision.md) defines the product intent and boundaries.
- [Product concept](docs/product-concept.md) captures users, jobs, MVP scope, flows, metrics, and roadmap.
- [Solution concept](docs/solution-concept.md) captures architecture decisions, integrations, data, non-functional requirements, deployment, and risks.
- `docs/adr/` is reserved for architecture decision records once implementation decisions are made.
- `src/` is reserved for source code after the planning baseline is approved.

## Current Rules

- Keep this repository small until the planning documents are reviewed.
- Add implementation code only after the solution concept identifies the initial stack and deployment model.
- Record durable technical decisions in `docs/adr/`.
