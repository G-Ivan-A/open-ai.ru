#!/usr/bin/env node
// Проверка публичного вывода (issue #68, НФТ-4).
//   • Нет токенов и учётных данных GitHub (ghp_, github_pat_, gho_, ghu_, ghs_, ghr_,
//     x-access-token, заголовок Authorization).
//   • Приватная спица не служит исполняемым источником: скрипты, стили, изображения,
//     fetch/import не загружаются из github.com/<спица>, raw.githubusercontent.com,
//     codeload и с сайта Pages спицы (*.github.io/<спица>). Ссылки <a href> на документы
//     спицы (страница «Источник» у шагов, CHANGELOG) — навигация для сопровождающих,
//     не исполняемый источник; они допускаются и считаются в отчёте.
//
//   node scripts/check-privacy.mjs <каталог> [--repository владелец/репозиторий]
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { listFiles } from './tree.mjs';

const TEXT = /\.(?:html?|js|mjs|css|json|svg|txt|md|xml|map)$/i;

const SECRETS = [
  [/\bgh[pousr]_[A-Za-z0-9]{20,}/, 'токен GitHub'],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}/, 'токен GitHub (fine-grained)'],
  [/x-access-token/i, 'учётные данные x-access-token'],
  [/authorization:\s*(?:basic|bearer|token)\s+[A-Za-z0-9+/=_.-]{8,}/i, 'заголовок Authorization'],
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Сайт GitHub Pages спицы: <владелец>.github.io/<репозиторий>.
export function pagesHost(repository) {
  const [owner, repo] = repository.split('/');
  return `${escapeRe(owner)}\\.github\\.io/${escapeRe(repo)}`;
}

// Адреса, по которым отдаются файлы приватной спицы.
export function privateHosts(repository) {
  const [owner, repo] = repository.split('/');
  const o = escapeRe(owner);
  const r = escapeRe(repo);
  return new RegExp(
    `(?:github\\.com/${o}/${r}|raw\\.githubusercontent\\.com/${o}/${r}|codeload\\.github\\.com/${o}/${r}`
    + `|api\\.github\\.com/repos/${o}/${r}|${pagesHost(repository)})`, 'i');
}

// Загрузки ресурсов: <script src>, <img/iframe/source/embed/audio/video src>, <link href>
// (кроме rel="canonical"/"alternate"), CSS url()/@import, JS fetch()/import().
const LOADS = [
  /<(?:script|img|iframe|source|embed|audio|video|track|input)\b[^>]*?\bsrc\s*=\s*["']?([^"'\s>]+)/gi,
  /<link\b(?![^>]*\brel\s*=\s*["']?(?:canonical|alternate)\b)[^>]*?\bhref\s*=\s*["']?([^"'\s>]+)/gi,
  /<object\b[^>]*?\bdata\s*=\s*["']?([^"'\s>]+)/gi,
  /url\(\s*["']?([^"')\s]+)/gi,
  /@import\s+["']([^"']+)/gi,
  /\bfetch\(\s*["'`]([^"'`]+)/g,
  /\bimport\s*\(\s*["'`]([^"'`]+)/g,
  /\bimport\s[^"'`;]*?\bfrom\s*["'`]([^"'`]+)/g,
  /\bnew\s+(?:Worker|SharedWorker|EventSource|WebSocket)\(\s*["'`]([^"'`]+)/g,
  /\b(?:location(?:\.href)?\s*=|location\.(?:replace|assign)\()\s*["'`]([^"'`]+)/g,
  /\bconst\s+\w*(?:URL|Url|HOME|BASE)\w*\s*=\s*["'`]([^"'`]+)/g,
];

export function checkPrivacy(dir, { repository }) {
  const host = privateHosts(repository);
  const errors = [];
  let anchors = 0;
  for (const rel of listFiles(dir)) {
    if (!TEXT.test(rel)) continue;
    const text = readFileSync(path.join(dir, rel), 'utf8');
    for (const [re, what] of SECRETS) {
      if (re.test(text)) errors.push(`${rel}: ${what}`);
    }
    for (const re of LOADS) {
      for (const match of text.matchAll(re)) {
        if (host.test(match[1])) errors.push(`${rel}: приватная спица как исполняемый источник — ${match[0].slice(0, 120)}`);
      }
    }
    // Сайт Pages спицы — не навигация из витрины: выход ведёт только на open-ai.ru.
    for (const match of text.matchAll(new RegExp(`[^\\s"'<>]*${pagesHost(repository)}[^\\s"'<>]*`, 'gi'))) {
      errors.push(`${rel}: ссылка на сайт Pages спицы ${match[0]}`);
    }
    anchors += [...text.matchAll(new RegExp(`href\\s*=\\s*["'][^"']*${host.source}`, 'gi'))].length;
  }
  return { errors: [...new Set(errors)], anchors };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const dir = path.resolve(args.find((a) => !a.startsWith('--')) ?? '.');
  const i = args.indexOf('--repository');
  const repository = i >= 0 ? args[i + 1] : JSON.parse(readFileSync(new URL('../source.json', import.meta.url))).repository;
  const { errors, anchors } = checkPrivacy(dir, { repository });
  if (errors.length) {
    for (const error of errors) console.error(`✘ ${error}`);
    process.exit(1);
  }
  console.log(`✔ ${dir}: токенов нет, приватная спица не загружается как источник (ссылок на документы спицы: ${anchors})`);
}
