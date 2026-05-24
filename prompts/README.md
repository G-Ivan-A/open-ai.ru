# Prompts

This directory hosts reusable prompts that support AI-assisted work across architecture, frontend, backend, and review activities.

## 1. Purpose

Prompts kept in the repository are a governance artifact, not a scratchpad. They exist to make AI execution **consistent, reviewable, and reusable** across tasks and contributors.

A prompt belongs here when it:

- is referenced from issues, ADRs, or other documentation;
- produces predictable structured output;
- is intended to be reused by more than one contributor or agent;
- has been reviewed at least once by a human.

Ad-hoc, single-use prompts stay in the issue or pull request that uses them.

## 2. Organization

Prompts are grouped by responsibility:

- [`architecture/`](architecture/README.md) — prompts that support ADR drafting and architectural analysis.
- [`frontend/`](frontend/README.md) — prompts that support UI implementation and review.
- [`backend/`](backend/README.md) — prompts that support backend implementation and review.
- [`reviews/`](reviews/README.md) — prompts that drive code, governance, and security reviews.

New categories require an explicit decision in an issue. Avoid creating ad-hoc subdirectories.

## 3. File Naming

```
prompts/<category>/<kebab-case-purpose>.md
```

Examples:

- `prompts/reviews/ai-self-review.md`
- `prompts/architecture/runtime-stack-comparison.md`

Each prompt file must contain:

1. **Purpose.** One sentence describing the intended outcome.
2. **Inputs.** The variables, files, or context the prompt expects.
3. **Output.** The structure or schema of the expected result.
4. **Constraints.** Forbidden behaviors, length limits, language, tone.
5. **Owner.** The human responsible for the prompt.

## 4. AI Execution Consistency

- Prompts must be deterministic enough that two independent agents produce comparable outputs given the same inputs.
- Update the prompt rather than editing AI output across many tasks when a systematic correction is needed.
- When a prompt is changed in a way that affects downstream artifacts, note the change in the corresponding pull request and, when relevant, in the linked ADR.

## 5. Maintainability

- Keep prompts short. If a prompt grows beyond two screens, refactor it or split it.
- Reuse vocabulary from [`AI_GOVERNANCE.md`](../AI_GOVERNANCE.md) and [`docs/governance/AI_RULES.md`](../docs/governance/AI_RULES.md) so prompts inherit the same guardrails.
- Mark experimental prompts with a `status: experimental` line in their header until they are reviewed.

## 6. Review Gate

A new or modified prompt:

- is referenced from the issue that introduced it;
- has been used at least once to validate that the output meets the stated structure;
- has been reviewed by a human listed in the owner field.

## TODO

- Add a top-level index of accepted prompts once a critical mass exists.
- Add automated linting for prompt headers.
