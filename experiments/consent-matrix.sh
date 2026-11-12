#!/bin/sh
# Эксперимент (issue #65): сборка и проверка сайта при разных значениях consent
# в _data/team.yml. Режимы: all — все кандидаты согласились, first — только первый.
# После прогона team.yml восстанавливается из git.
set -e
cd "$(dirname "$0")/.."
TEAM=projects/ai-team-management-program/_data/team.yml
trap 'git checkout -- "$TEAM"' EXIT
for mode in ${@:-all first}; do
  git checkout -- "$TEAM"
  if [ "$mode" = all ]; then
    sed -i 's/^    consent: false/    consent: true/' "$TEAM"
  else
    sed -i '0,/^    consent: false/s//    consent: true/' "$TEAM"
  fi
  sh experiments/build-site.sh
  S=_site/projects/ai-team-management-program
  echo "=== consent: $mode"
  sed -n '/\[4\] Кандидаты на роли/,/<\/details>/p' "$S/index.html" > "ci-logs/consent-$mode.html"
  cat "ci-logs/consent-$mode.html"
  (cd projects/ai-team-management-program && python3 tests/check_site.py --site "../../$S") || true
done
