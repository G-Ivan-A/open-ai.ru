#!/bin/sh
# Локальная сборка тем же образом, что actions/jekyll-build-pages@v1.
set -e
cd "$(dirname "$0")/.."
docker run --rm -v "$PWD":/github/workspace -e GITHUB_WORKSPACE=/github/workspace \
  -e INPUT_SOURCE=. -e INPUT_DESTINATION=./_site -e GITHUB_REPOSITORY=G-Ivan-A/open-ai.ru \
  -e INPUT_TOKEN="$(gh auth token)" ghcr.io/actions/jekyll-build-pages:v1.0.13 > ci-logs/jekyll.log 2>&1 \
  || { tail -30 ci-logs/jekyll.log; exit 1; }
# Контейнер пишет _site от root; возвращаем владельца (в CI — sudo chown).
docker run --rm -v "$PWD":/github/workspace --entrypoint chown ghcr.io/actions/jekyll-build-pages:v1.0.13 \
  -R "$(id -u):$(id -g)" /github/workspace/_site /github/workspace/.jekyll-cache 2>/dev/null || true
