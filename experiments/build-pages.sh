#!/bin/sh
# Локальная сборка тем же образом, что и actions/jekyll-build-pages (и legacy Pages): из корня репозитория.
cd "$(dirname "$0")/.." && docker run --rm --user "$(id -u):$(id -g)" -v "$PWD":/github/workspace -w /github/workspace \
  -e GITHUB_WORKSPACE=/github/workspace -e INPUT_SOURCE=. -e INPUT_DESTINATION=./_site -e INPUT_BUILD_REVISION=local \
  -e INPUT_VERBOSE=false -e INPUT_TOKEN= -e GITHUB_REPOSITORY=G-Ivan-A/open-ai.ru -e PAGES_REPO_NWO=G-Ivan-A/open-ai.ru \
  -e JEKYLL_ENV=production ghcr.io/actions/jekyll-build-pages:v1.0.13
