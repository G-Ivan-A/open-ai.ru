#!/usr/bin/env node
// Проверка собранного сайта open-ai.ru (issue #68): НФТ-1, ФТ-3, НФТ-4.
//
//   node scripts/check-site.mjs --site _site [--base /open-ai.ru/] [--lock <source.json>]
//
//   • прежние адреса на месте: брошюра, её PDF, стили и значок (НФТ-1: ни один URL не стал 404);
//   • стартовая страница ведёт в оба проекта; есть 404.html, витрина и страница «О витрине»;
//   • внутренние ссылки и ресурсы всех HTML-страниц ведут на существующие файлы;
//   • изоляция (ФТ-3): относительные ссылки витрины не выходят из /mango/, кроме явной
//     «Все проекты» (data-deploy-home); брошюра не ссылается внутрь витрины;
//   • приватность всего сайта (НФТ-4): нет токенов, ничего не загружается из приватной спицы.
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { checkPrivacy } from '../projects/mango-bcreq/scripts/check-privacy.mjs';
import { LOCK, readLock } from '../projects/mango-bcreq/scripts/lock.mjs';
import { listFiles } from '../projects/mango-bcreq/scripts/tree.mjs';

const BROCHURE = 'projects/ai-team-management-program/';

// Адреса, опубликованные до issue #68 (корень сайта и брошюра), и новые обязательные файлы.
export const REQUIRED = [
  'index.html',
  `${BROCHURE}index.html`,
  `${BROCHURE}brochure.html`,
  `${BROCHURE}brochure.pdf`,
  `${BROCHURE}assets/css/site.css`,
  `${BROCHURE}assets/css/brochure.css`,
  `${BROCHURE}assets/favicon.svg`,
  '404.html',
  '.nojekyll',
  'mango/index.html',
  'mango/deploy.json',
  'projects/mango-bcreq/index.html',
];

const ATTRS = /<([a-z][\w-]*)\b([^>]*?)\s(href|src)\s*=\s*"([^"]*)"([^>]*)>/gi;

// Все ссылки и ресурсы страницы: [тег целиком, url].
export function links(html) {
  const withoutScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => m.replace(/>[\s\S]*<\/script>$/i, '></script>'));
  return [...withoutScripts.matchAll(ATTRS)].map((m) => ({ tag: m[0], url: m[4] }));
}

const external = (url) => /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url);

// Путь файла сайта, на который указывает url со страницы rel (null — не файл сайта).
export function target(rel, url, base) {
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return null;
  let resolved;
  if (clean.startsWith('/')) {
    if (!`${clean}/`.startsWith(base)) return { outside: true, path: clean };
    resolved = clean.slice(base.length);
  } else {
    resolved = path.posix.join(path.posix.dirname(rel), clean);
    if (clean.endsWith('/') && !resolved.endsWith('/')) resolved += '/';
  }
  resolved = path.posix.normalize(resolved);
  if (resolved === '.' || resolved === './') resolved = '';
  if (resolved.startsWith('..')) return { outside: true, path: resolved };
  return { path: resolved };
}

function exists(site, rel) {
  const file = path.join(site, decodeURIComponent(rel));
  if (!existsSync(file)) return false;
  return statSync(file).isDirectory() ? existsSync(path.join(file, 'index.html')) : true;
}

export function checkSite({ site, base = '/', lock = readLock() }) {
  site = path.resolve(site);
  const errors = [];
  for (const rel of REQUIRED) {
    if (!existsSync(path.join(site, rel))) errors.push(`нет ${rel}`);
  }
  const files = listFiles(site);
  const pages = files.filter((rel) => rel.endsWith('.html'));
  let checked = 0;
  for (const rel of pages) {
    const html = readFileSync(path.join(site, rel), 'utf8');
    for (const { tag, url } of links(html)) {
      if (!url || url.startsWith('#') || external(url) || url.startsWith('mailto:')) continue;
      const t = target(rel, url, base);
      if (!t) continue;
      checked += 1;
      if (t.outside) {
        errors.push(`${rel}: ссылка за пределы сайта ${url}`);
        continue;
      }
      // 404.html Pages отдаёт с любого адреса — её ссылки абсолютные (от base) и проверяются так же.
      if (!exists(site, t.path)) errors.push(`${rel}: битая ссылка ${url}`);
      if (rel.startsWith('mango/') && !t.path.startsWith('mango/') && !/\bdata-deploy-home\b/.test(tag)) {
        errors.push(`${rel}: витрина ссылается за пределы /mango/: ${url}`);
      }
      if (rel.startsWith(BROCHURE) && t.path.startsWith('mango/')) {
        errors.push(`${rel}: брошюра ссылается внутрь витрины: ${url}`);
      }
    }
  }
  const index = readFileSync(path.join(site, 'index.html'), 'utf8');
  for (const href of ['mango/', BROCHURE]) {
    if (!index.includes(`href="${href}"`)) errors.push(`index.html: нет ссылки на ${href}`);
  }
  const privacy = checkPrivacy(site, lock);
  errors.push(...privacy.errors);
  return { errors: [...new Set(errors)], files: files.length, pages: pages.length, links: checked, anchors: privacy.anchors };
}

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = checkSite({
    site: arg('--site', '_site'),
    base: arg('--base', '/'),
    lock: readLock(path.resolve(arg('--lock', LOCK))),
  });
  console.log(`Сайт: ${result.files} файлов, ${result.pages} HTML-страниц, ${result.links} внутренних ссылок проверено.`);
  if (result.errors.length) {
    for (const error of result.errors) console.error(`✘ ${error}`);
    if (process.env.GITHUB_ACTIONS) console.log(`::error title=Проверка сайта не пройдена::${result.errors.length} ошибок, см. лог шага`);
    process.exit(1);
  }
  console.log('✔ Прежние адреса на месте, ссылки целы, проекты изолированы, приватных источников и токенов нет.');
}
