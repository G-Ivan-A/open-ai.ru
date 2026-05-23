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
  ".gitignore"
  "AI_GOVERNANCE.md"
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
  "docs/governance"
  "docs/integrations"
  "scripts/cleanup"
  "scripts/bootstrap"
  "infrastructure"
  "tests"
  "public"
)

required_files=(
  ".github/ISSUE_TEMPLATE/foundation.md"
  ".github/ISSUE_TEMPLATE/feature.md"
  ".github/pull_request_template.md"
  ".github/workflows/validate-structure.yml"
  ".editorconfig"
  ".gitattributes"
  ".gitignore"
  ".env.example"
  "README.md"
  "AI_GOVERNANCE.md"
  "PRODUCT_VISION.md"
  "ROADMAP.md"
  "CONTRIBUTING.md"
  "CHANGELOG.md"
  "LICENSE"
  "docs/governance/repository-labels.md"
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

if [[ "$failures" -gt 0 ]]; then
  printf '\nRepository structure validation failed with %d issue(s).\n' "$failures" >&2
  exit 1
fi

printf 'Repository structure validation passed.\n'
