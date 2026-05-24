# AI_RULES.md

Technical constraints for AI-assisted development in this repository.

This document supplements [`AI_GOVERNANCE.md`](AI_GOVERNANCE.md). AI agents must follow the current issue first, then the governance documents that apply to the requested change.

---

## Technical Constraints

1. Work only within the scope described by the issue.
2. Preserve existing repository structure unless the issue explicitly allows structural changes.
3. Reuse existing documents, templates, scripts, and validation patterns before adding new ones.
4. Keep changes minimal, traceable, and easy for a human reviewer to inspect.
5. Do not add dependencies, services, secrets, or infrastructure without explicit approval.
6. Do not delete, rename, or move existing files unless the issue explicitly requires it.
7. Update related documentation when changing governance, architecture, contracts, or contributor workflows.
8. Run the relevant validation scripts before requesting review.

## Escalation Rules

Ask for human clarification before proceeding when:

- Requirements conflict with `AI_GOVERNANCE.md`, repository rules, or accepted architecture decisions.
- The requested change needs a new architecture decision record.
- The issue does not define enough acceptance criteria to verify completion.
- A change would affect public contracts, security posture, or release behavior.

## Related Documents

- [`AI_GOVERNANCE.md`](AI_GOVERNANCE.md)
- [`AI_QUICK_REF.md`](AI_QUICK_REF.md)
- [`docs/governance/AI_RULES.md`](docs/governance/AI_RULES.md)
- [`docs/governance/DOCUMENT_UPDATE_POLICY.md`](docs/governance/DOCUMENT_UPDATE_POLICY.md)
