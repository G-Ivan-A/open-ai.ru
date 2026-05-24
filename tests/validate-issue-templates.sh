#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

foundation_expected="$(mktemp)"
feature_expected="$(mktemp)"
trap 'rm -f "$foundation_expected" "$feature_expected"' EXIT

cat > "$foundation_expected" <<'EOF'
# Foundation / Governance

**Issue Type:** Foundation  
**Priority:** (High / Medium / Low)  
**Mode:** Structured Mode / Creative Mode

---

### Context

### User Story

As a [роль], I want to [действие], so that [цель].

### Operating Mode

- **Structured Mode** — строгий режим (по умолчанию)
- **Creative Mode** — разрешено предлагать улучшения

### Functional Requirements

- FR-1: ...
- FR-2: ...

### Constraints

### Allowed / Forbidden Changes

**Allowed:**
- ...

**Forbidden:**
- ...

### Architecture Impact

### Related Documents

- ...

### AI Guidance & Constraints

Правила для AI-агентов (Codex / Cursor / Claude / Qwen):

### Acceptance Criteria

- [ ] ...
- [ ] ...

### Human Review Required

**Да**
EOF

cat > "$feature_expected" <<'EOF'
# Feature

**Issue Type:** Feature  
**Priority:** (High / Medium / Low)  
**Mode:** Structured Mode / Creative Mode

---

### Context

### User Story

As a [тип пользователя], I want to [действие], so that [польза].

### Operating Mode

- **Structured Mode** — строгий режим
- **Creative Mode** — разрешено улучшения в рамках ограничений

### Functional Requirements

- FR-1: ...
- FR-2: ...

### Non-Functional Requirements

### Constraints

### Allowed / Forbidden Changes

**Allowed:**
- ...

**Forbidden:**
- ...

### Architecture Impact

### Related Documents

- ...

### AI Guidance & Constraints

Правила для AI-агентов (Codex / Cursor / Claude / Qwen):

### AI Self-Review Checklist

Перед отправкой PR выполнить самопроверку по `prompts/reviews/ai-self-review.md` (если файл существует).

### Acceptance Criteria

- [ ] ...
- [ ] Соответствует Design System
- [ ] ...

### Human Review Required

**Да**
EOF

diff -u "$foundation_expected" .github/ISSUE_TEMPLATE/foundation.md
diff -u "$feature_expected" .github/ISSUE_TEMPLATE/feature.md

if [[ -e .github/ISSUE_TEMPLATE/research.md ]]; then
  printf 'FAIL: .github/ISSUE_TEMPLATE/research.md should not exist\n' >&2
  exit 1
fi

printf 'Issue template validation passed.\n'
