#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

failures=0

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  failures=$((failures + 1))
}

require_dir() {
  local path="$1"
  [[ -d "$path" ]] || fail "missing directory: $path"
}

require_file() {
  local path="$1"
  [[ -f "$path" ]] || fail "missing file: $path"
}

reject_path() {
  local path="$1"
  [[ ! -e "$path" ]] || fail "legacy path should not exist: $path"
}

required_root_entries=(
  ".editorconfig"
  ".env.example"
  ".gitattributes"
  ".github"
  ".gitkeep"
  ".gitignore"
  "AI_GOVERNANCE.md"
  "AI_RULES.md"
  "AI_QUICK_REF.md"
  "CHANGELOG.md"
  "CONTRIBUTING.md"
  "LICENSE"
  "PRODUCT_VISION.md"
  "README.md"
  "ROADMAP.md"
  "app"
  "components"
  "contracts"
  "docs"
  "features"
  "hooks"
  "infrastructure"
  "integrations"
  "lib"
  "prompts"
  "public"
  "scripts"
  "services"
  "stores"
  "tests"
)

required_directories=(
  ".github/ISSUE_TEMPLATE"
  ".github/workflows"
  "app"
  "components/ui"
  "features/auth"
  "features/dashboard"
  "features/profile"
  "features/catalog"
  "features/integrations"
  "features/education-sync"
  "contracts/api"
  "contracts/events"
  "contracts/ai-agents"
  "services"
  "integrations"
  "lib"
  "hooks"
  "stores"
  "prompts/architecture"
  "prompts/frontend"
  "prompts/backend"
  "prompts/reviews"
  "docs/product"
  "docs/architecture/adr"
  "docs/adr"
  "docs/development"
  "docs/governance"
  "docs/integrations"
  "docs/releases"
  "docs/research"
  "docs/testing"
  "scripts/cleanup"
  "scripts/bootstrap"
  "infrastructure"
  "tests"
  "public"
)

required_files=(
  ".github/ISSUE_TEMPLATE/foundation.md"
  ".github/ISSUE_TEMPLATE/feature.md"
  ".github/ISSUE_TEMPLATE/ai_implementation_task.yml"
  ".github/ISSUE_TEMPLATE/config.yml"
  ".github/pull_request_template.md"
  ".github/workflows/validate-structure.yml"
  ".editorconfig"
  ".gitattributes"
  ".gitignore"
  ".env.example"
  "README.md"
  "AI_GOVERNANCE.md"
  "AI_RULES.md"
  "AI_QUICK_REF.md"
  "PRODUCT_VISION.md"
  "ROADMAP.md"
  "CONTRIBUTING.md"
  "CHANGELOG.md"
  "LICENSE"
  "docs/adr/README.md"
  "docs/architecture/ARCHITECTURE.md"
  "docs/architecture/DOMAIN_MODEL.md"
  "docs/development/CODING_STANDARDS.md"
  "docs/development/API_STANDARDS.md"
  "docs/development/ERROR_HANDLING.md"
  "docs/governance/AI_RULES.md"
  "docs/governance/DOCUMENT_UPDATE_POLICY.md"
  "docs/governance/EDUCATIONAL_SYNC_POLICY.md"
  "docs/governance/REPOSITORY_RULES.md"
  "docs/governance/repository-labels.md"
  "docs/product/PRODUCT_VISION.md"
  "docs/product/MVP_SCOPE.md"
  "docs/releases/README.md"
  "docs/research/README.md"
  "docs/research/template.md"
  "docs/testing/TESTING_STRATEGY.md"
  "prompts/README.md"
  "tests/validate-issue-templates.sh"
  "tests/validate-repository-structure.sh"
)

legacy_paths=(
  "CONCEPT.md"
  "DECOMPOSITION.md"
  "ROLES.md"
  "STRUCTURE.md"
  "deployment"
  "solutions"
)

for entry in "${required_root_entries[@]}"; do
  [[ -e "$entry" ]] || fail "missing root entry: $entry"
done

mapfile -t actual_root_entries < <(
  find . -mindepth 1 -maxdepth 1 \
    ! -name ".git" \
    ! -name ".DS_Store" \
    -printf '%f\n' | sort
)
mapfile -t expected_root_entries < <(printf '%s\n' "${required_root_entries[@]}" | sort)

if ! diff -u <(printf '%s\n' "${expected_root_entries[@]}") <(printf '%s\n' "${actual_root_entries[@]}"); then
  fail "top-level repository entries differ from approved skeleton"
fi

for dir in "${required_directories[@]}"; do
  require_dir "$dir"
done

for file in "${required_files[@]}"; do
  require_file "$file"
done

for path in "${legacy_paths[@]}"; do
  reject_path "$path"
done

"$ROOT_DIR/tests/validate-issue-templates.sh"

if [[ "$failures" -gt 0 ]]; then
  printf '\nRepository structure validation failed with %d issue(s).\n' "$failures" >&2
  exit 1
fi

printf 'Repository structure validation passed.\n'
