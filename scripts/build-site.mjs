#!/usr/bin/env node
// Сборка всего сайта open-ai.ru одним стеком — Node + статический HTML/JS (issue #68, НФТ-3).
//
//   node scripts/build-site.mjs --mango-source <каталог site/ спицы> [--mango-lock <source.json>]
//                               [--out _site] [--base-path /]
//
//   _site/index.html                          — стартовая страница (hub/index.html): два проекта;
//   _site/404.html                            — страница 404 и переходы вглубь витрины (/mango/ain-06);
//   _site/assets/                             — стили и значки стартовой страницы;
//   _site/projects/ai-team-management-program/ — брошюра «ИИ в работе с командой» (прежние URL);
//   _site/projects/mango-bcreq/               — страница «О витрине BCREQ»;
//   _site/mango/                              — витрина BCREQ из site/ спицы на зафиксированном коммите;
//   _site/.nojekyll                           — сайт уже собран, Jekyll не нужен.
//
// --mango-source обязателен: без витрины сайт не собирается (ГК-2, fail-closed).
// --base-path — путь сайта на хостинге (actions/configure-pages → base_path, например
// /open-ai.ru/); нужен только странице 404, которую Pages отдаёт с любого адреса.
// Повторная сборка из тех же входов даёт побайтово тот же _site (НФТ-5): без дат и случайных
// значений; версии ресурсов (?v=) — хэши содержимого.
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as buildBrochure } from '../projects/ai-team-management-program/scripts/build-site.mjs';
import { LOCK, readLock } from '../projects/mango-bcreq/scripts/lock.mjs';
import { SourceError, prepare } from '../projects/mango-bcreq/scripts/prepare-site.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HUB = path.join(ROOT, 'hub');
const MANGO_PAGE = path.join(ROOT, 'projects/mango-bcreq/page/index.html');

// id элементов стартовой страницы. Прочие якоря (#passport, #appendix…) — старые закладки
// на брошюру: корень сайта раньше переадресовывал туда с сохранением якоря.
export const LANDING_IDS = ['top', 'main', 'projects', 'projects-title', 'project-team', 'project-mango'];

// Разделы SPA витрины (const PAGES в app.js спицы) — для адресов вида /mango/catalog.
export const MANGO_PAGES = ['about', 'catalog', 'standards', 'dashboard', 'roadmap', 'processes', 'patterns', 'glossary'];

const sha = (data) => createHash('sha256').update(data).digest('hex');

export const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// JSON внутри <script>: «<» экранируется, чтобы строка не закрыла тег.
const scriptJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

// Подстановка {{имя}} и {{asset:путь}}. Неизвестное имя — ошибка сборки, а не пустое место.
export function fill(template, vars, { assetPrefix = '', assetRoot = HUB } = {}) {
  const out = template.replace(/\{\{([\w.:/-]+)\}\}/g, (match, key) => {
    if (key.startsWith('asset:')) {
      const rel = key.slice('asset:'.length);
      return `${assetPrefix}${rel}?v=${sha(readFileSync(path.join(assetRoot, rel))).slice(0, 10)}`;
    }
    if (!Object.hasOwn(vars, key)) throw new Error(`Шаблон: нет значения для ${match}`);
    return vars[key];
  });
  return out;
}

export function normalizeBasePath(base) {
  let value = String(base || '/').trim();
  if (!value.startsWith('/')) value = `/${value}`;
  if (!value.endsWith('/')) value += '/';
  if (!/^\/(?:[\w.~-]+\/)*$/.test(value)) throw new Error(`Некорректный --base-path: ${base}`);
  return value;
}

// Коды шагов процесса витрины: Ш-0…Ш-С из test-kit.json и AIN-01…24 из a-in-kit.json.
export function mangoSteps(mangoDir) {
  const read = (rel) => JSON.parse(readFileSync(path.join(mangoDir, 'data', rel), 'utf8'));
  const codes = [
    ...read('test-kit.json').steps.map(({ step }) => String(step).split(' ')[0]),
    ...read('a-in-kit.json').steps.map(({ id }) => id),
  ];
  const bad = codes.filter((code) => !/^(?:Ш-[0-9А-Я]|AIN-\d{2})$/u.test(code));
  if (bad.length) throw new SourceError(`Неожиданные коды шагов витрины: ${bad.join(', ')}`);
  return [...new Set(codes)];
}

export function mangoVars(lock, prepared) {
  return {
    'mango.version': escapeHtml(lock.version),
    'mango.commit': escapeHtml(lock.commit),
    'mango.short': escapeHtml(lock.commit.slice(0, 7)),
    'mango.repository': escapeHtml(lock.repository),
    'mango.repositoryUrl': escapeHtml(`https://github.com/${lock.repository}`),
    'mango.path': escapeHtml(lock.path),
    'mango.files': String(prepared.source.files),
    'mango.tree': escapeHtml(prepared.source.sha256),
  };
}

export function build({ out, basePath = '/', mangoSource, mangoLock = LOCK }) {
  if (!mangoSource) throw new SourceError('Не указан --mango-source: без витрины BCREQ сайт не собирается (fail-closed).');
  out = path.resolve(out);
  const base = normalizeBasePath(basePath);
  const lock = readLock(mangoLock);

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  // Витрина первой: при любой ошибке источника сборка останавливается до остальных файлов.
  const mango = prepare({ source: mangoSource, out: path.join(out, 'mango'), lock });
  buildBrochure(path.join(out, 'projects/ai-team-management-program'));

  const vars = { ...mangoVars(lock, mango), landingIds: scriptJson(LANDING_IDS) };
  const page = (rel) => readFileSync(path.join(HUB, rel), 'utf8');
  cpSync(path.join(HUB, 'assets'), path.join(out, 'assets'), { recursive: true });
  writeFileSync(path.join(out, 'index.html'), fill(page('index.html'), vars));
  writeFileSync(path.join(out, '404.html'), fill(page('404.html'), {
    base: escapeHtml(base),
    basePathJson: scriptJson(base),
    stepsJson: scriptJson(mangoSteps(path.join(out, 'mango'))),
    pagesJson: scriptJson(MANGO_PAGES),
  }, { assetPrefix: base }));
  mkdirSync(path.join(out, 'projects/mango-bcreq'), { recursive: true });
  writeFileSync(path.join(out, 'projects/mango-bcreq/index.html'),
    fill(readFileSync(MANGO_PAGE, 'utf8'), vars, { assetPrefix: '../../' }));
  writeFileSync(path.join(out, '.nojekyll'), '');
  return { out, base, lock, mango };
}

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i > 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : fallback;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = build({
      out: arg('--out', path.join(ROOT, '_site')),
      basePath: arg('--base-path', '/'),
      mangoSource: arg('--mango-source'),
      mangoLock: path.resolve(arg('--mango-lock', LOCK)),
    });
    console.log(`Сайт собран: ${result.out} (base path ${result.base})`);
    console.log(`Витрина BCREQ v${result.lock.version} @ ${result.lock.commit}: ${result.mango.output.files} файлов, sha256 ${result.mango.output.sha256}`);
  } catch (error) {
    const message = error instanceof SourceError ? error.message : error.stack;
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::error title=Сайт не собран::${String(error.message).replaceAll('\n', '%0A')}`);
    }
    console.error(message);
    process.exit(1);
  }
}
