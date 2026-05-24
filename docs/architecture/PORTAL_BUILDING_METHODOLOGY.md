# PORTAL_BUILDING_METHODOLOGY.md

> Operational guide for external teams joining the `open-ai.ru` project  
> 📌 AI behavior rules: [AI_GOVERNANCE.md](../../AI_GOVERNANCE.md)  
> 🔗 Educational materials & independent research: [research-and-edu-ai-lab](https://github.com/G-Ivan-A/research-and-edu-ai-lab)

---

## 1. Core Philosophy

This project follows **Controlled AI-Assisted Development**:

- Human defines architecture, requirements, and governance boundaries.
- AI implements within those boundaries — no free-form generation.
- Every change is traceable: Issue → Implementation → Review → ADR (if architectural).
- Predictability > creativity in execution; creativity is channeled through structured proposals.

We build portals via **feature-first, contract-driven development**, not via "generate everything and fix later".

---

## 2. System Building Principles

- **Feature-first architecture**: Each feature is a bounded context (`/features/`), enabling isolated development and testing.
- **Contract-first development**: Requirements, allowed/forbidden changes, and acceptance criteria are defined before implementation.
- **Deterministic UI composition**: AI assembles interfaces from approved components (`shadcn/ui` + design tokens), not via free generation.
- **Separation of concerns**: Product code, governance, and educational content live in separate repositories.
- **Traceability by design**: Every architectural decision is recorded via ADR; every task via Issue + PR.

---

## 3. Development Model: Human + AI Collaboration

### Roles
| Role | Responsibility |
|------|---------------|
| Human (PO/BA/Architect) | Define architecture, requirements, governance, approve ADRs |
| Human (Developer/Reviewer) | Implement, review, validate within contracts |
| AI Agent (Codex/Cursor/Claude/Qwen) | Generate code/content within explicit constraints; propose improvements only in Creative Mode |

### Modes
- **Structured Mode** (default): Follow constraints strictly; minimal interpretation.
- **Creative Mode** (explicitly marked): Propose alternatives, but isolate experiments and require human approval before merging.

### Validation Flow
```text
Issue (with constraints) 
→ AI/Human implementation 
→ Self-review (AI) + Human review 
→ Merge (if approved) 
→ ADR (if architectural decision)
```

---

## 4. Repository Interpretation Guide

### Key Directories
| Path | Purpose |
|------|---------|
| `/` | Root governance: `AI_GOVERNANCE.md`, `CONTRIBUTING.md`, issue templates |
| `/features/` | Feature-first implementation units (bounded contexts) |
| `/components/ui/` | Approved, reusable UI components (shadcn/ui registry) |
| `/docs/architecture/` | Architecture docs: `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, **this file**, ADRs |
| `/docs/governance/` | Governance contracts: `AI_RULES.md`, `REPOSITORY_RULES.md` |
| `/prompts/` | Reusable prompt templates for AI tasks |
| `/.github/` | GitHub-native governance: issue/PR templates, workflows |

### Reading Strategy for New Teams
1. Start with `README.md` → understand repo purpose.
2. Read **this file** → understand HOW we build.
3. Read `AI_GOVERNANCE.md` → understand AI interaction rules.
4. Review `ARCHITECTURE.md` + ADRs → understand system structure and key decisions.
5. Follow `CONTRIBUTING.md` → technical contribution standards.

---

## 5. External Team Onboarding

### 5.1 Prerequisites: Required Reading
- [README.md](../../README.md)
- [PORTAL_BUILDING_METHODOLOGY.md](./PORTAL_BUILDING_METHODOLOGY.md) ← you are here
- [AI_GOVERNANCE.md](../../AI_GOVERNANCE.md)
- [CONTRIBUTING.md](../../CONTRIBUTING.md)

### 5.2 Week-by-Week Checklist
**Week 1: Orientation**
□ Understand dual-repo strategy: `open-ai.ru` = production/governance; `research-and-edu-ai-lab` = research/education  
□ Learn issue templates: `foundation.md` (infrastructure), `feature.md` (functional)  
□ Practice reading ADRs: understand WHY decisions were made  

**Week 2: First Contribution**
□ Pick a `good first issue` (Structured Mode)  
□ Follow template exactly; respect Allowed/Forbidden Changes  
□ Run self-review before PR  
□ Submit PR with clear change description  

**Week 3: Autonomous Work**
□ Propose small improvements via Feature issues  
□ Suggest ADRs only for genuine architectural decisions  
□ When completing significant milestones: notify edu-team for possible knowledge reuse in `research-and-edu-ai-lab` (passive linkage only)

### 5.3 Communication & Escalation
- Questions about governance? → Comment on Issue or tag PO.
- Ambiguity in constraints? → Escalate per `AI_GOVERNANCE.md` § "When to escalate ambiguity".
- Architectural proposal? → Create Foundation issue → ADR workflow.

---

## 6. AI Interaction Model for Human Teams

### How Humans Set Tasks for AI
1. Create Issue using approved template (`foundation.md` or `feature.md`).
2. Explicitly set `Mode: Structured/Creative`.
3. Define Constraints, Allowed/Forbidden Changes, Acceptance Criteria.
4. Reference relevant contracts (`AI_GOVERNANCE.md`, `AI_RULES.md`, ADRs).

### How Humans Validate AI Output
- Check adherence to Allowed/Forbidden Changes.
- Verify no architectural drift (compare to `ARCHITECTURE.md` + ADRs).
- Ensure code reuses existing components before creating new ones.
- Confirm self-review checklist was executed (if applicable).

---

## 7. Decision Layering: Where Decisions Live

| Decision Type | Location | Process |
|--------------|----------|---------|
| Product vision / scope | `docs/product/` | PO-defined, reviewed by stakeholders |
| Architecture principles | `docs/architecture/ARCHITECTURE.md` | Architect + PO, documented |
| Specific architectural decision | `docs/architecture/adr/` | ADR workflow: proposal → review → merge |
| Implementation detail | Issue + PR | Follow template; human review required |
| Technology evaluation (OSS vs commercial) | ADR + optional external research | ADR in this repo; research conducted in `research-and-edu-ai-lab` if needed |

> 🔹 **Critical**: This repository (`open-ai.ru`) does NOT initiate independent research or educational content creation.  
> 🔹 ADRs may reference findings from `research-and-edu-ai-lab`, but research itself lives externally.  
> 🔹 Implementation experience may be reused by the educational team, but export is passive and initiated by them.

---

## 8. Anti-Patterns to Avoid

❌ "Let AI generate freely, we'll fix later" → leads to architectural drift.  
❌ Skipping ADR for architectural changes → loses traceability.  
❌ Mixing product code with educational content → violates dual-repo strategy.  
❌ Ignoring Allowed/Forbidden Changes → breaks governance contracts.  
❌ Initiating research tasks in this repo → belongs in `research-and-edu-ai-lab`.

---

## 9. Technology Selection Note: OSS vs Commercial

**Default policy**: Prefer open-source solutions.

**When commercial tools may be considered**:
- OSS solution demonstrably limits critical project KPIs (performance, time-to-market, reliability).
- Commercial tool provides measurable ROI with clear cost/benefit.

**Process**:
1. Document gap in OSS ecosystem.
2. Create ADR in this repo with justification, cost analysis, and integration plan.
3. If research of alternatives is needed, it is conducted in `research-and-edu-ai-lab` via separate request.
4. PO approval required before implementation.

> 🔹 This repo does NOT host technology evaluation research.  
> 🔹 ADRs may reference external research findings, but do not initiate them.

---

## 10. Glossary

| Term | Meaning |
|------|---------|
| Controlled AI-Assisted Development | Human-defined boundaries + AI execution within them |
| Structured Mode | Strict constraint-following; minimal interpretation |
| Creative Mode | Proposal-friendly; requires human approval before merge |
| ADR | Architecture Decision Record: documents WHY a specific architectural choice was made |
| Feature-first | Organization by business capability, not technical layer |
| Dual-repo strategy | `open-ai.ru` = production/governance; `research-and-edu-ai-lab` = research/education |

---

*Version: 1.0 | Last updated: May 2026 | Owner: Ivan Gulienko (Founder & PO)*
