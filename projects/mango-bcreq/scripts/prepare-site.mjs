#!/usr/bin/env node
// Подготовка витрины BCREQ к публикации в /mango/ (issue #68).
//
//   node scripts/prepare-site.mjs --source <site/ спицы> --out <_site/mango> [--lock source.json]
//
// 1. Сверка (fail-closed, ГК-2/НФТ-5): отпечаток --source совпадает с tree в source.json,
//    версия в index.html — с version. Иначе публикации нет: ошибка с причиной.
// 2. Копия site/ без изменений, кроме детерминированных правок (каждая проверяет, что
//    шаблон найден ровно столько раз, сколько ожидается; иначе — ошибка, а не молчаливый пропуск):
//    • gate.js: HOME_URL — каталог витрины (был адрес сайта Pages спицы; ФТ-3, НФТ-4);
//    • HTML: ?v=<коммит> у локальных скриптов, стилей и значка; app.js: ?v= у data/*.json —
//      новая версия не смешивается с кэшем старой (ГК-3);
//    • index.html, подвал: коммит спицы рядом с версией (НФТ-2) и выход «Все проекты» (ГК-1);
//    • deploy.json — версия и коммит источника для проверки опубликованной версии.
// 3. Проверка приватности результата (check-privacy.mjs, НФТ-4).
// Результат зависит только от --source и source.json: повторная сборка побайтово та же (НФТ-5).
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { checkPrivacy } from './check-privacy.mjs';
import { LOCK, readLock } from './lock.mjs';
import { treeHash } from './tree.mjs';

export class SourceError extends Error {}

const HTML_PAGES = ['index.html', 'login.html', 'reports/index.html'];

// Подстановка с проверкой числа совпадений.
function replaceCounted(text, re, replacement, expected, label) {
  let count = 0;
  const result = text.replace(re, (...m) => {
    count += 1;
    return typeof replacement === 'function' ? replacement(...m) : replacement;
  });
  const ok = typeof expected === 'function' ? expected(count) : count === expected;
  if (!ok) throw new SourceError(`${label}: шаблон найден ${count} раз — структура витрины изменилась, правку нужно обновить`);
  return result;
}

const isLocal = (url) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#|\?)/i.test(url);

// ?v=<версия> у локальных <script src> и <link href> (стили, значок).
export function versionAssets(html, v, label) {
  let count = 0;
  const out = html.replace(/(<(?:script\b[^>]*?\bsrc|link\b[^>]*?\bhref)\s*=\s*")([^"?#]+\.(?:js|css|svg))(")/gi,
    (all, head, url, tail) => {
      if (!isLocal(url)) return all;
      count += 1;
      return `${head}${url}?v=${v}${tail}`;
    });
  if (!count) throw new SourceError(`${label}: нет локальных скриптов и стилей — структура витрины изменилась`);
  return out;
}

export function patchIndex(html, { lock, v }) {
  html = versionAssets(html, v, 'index.html');
  const stamp = [
    `      <span class="deploy-source" data-deploy-source="${lock.commit}" title="Коммит спицы-источника ${lock.commit}">`
      + `· сборка v${lock.version} · коммит спицы <code>${v}</code></span>`,
    '      · <a class="deploy-home" href="../" data-deploy-home>Все проекты open-ai.ru</a>',
  ].join('\n');
  return replaceCounted(html, /(<footer class="site-footer">[\s\S]*?)(\n\s*<\/footer>)/, (all, body, end) => `${body}\n${stamp}${end}`,
    1, 'index.html: подвал <footer class="site-footer">');
}

export function patchApp(js, { v }) {
  return replaceCounted(js, /(["'`])(data\/[\w.-]+\.json)\1/g, (all, q, url) => `${q}${url}?v=${v}${q}`,
    (n) => n > 0, 'app.js: загрузка data/*.json');
}

export function patchGate(js) {
  return replaceCounted(js, /const HOME_URL = "[^"]*";/, 'const HOME_URL = baseUrl.href; // open-ai.ru: главная витрины — /mango/',
    1, 'gate.js: HOME_URL');
}

export function verifySource(source, lock) {
  if (!existsSync(source)) throw new SourceError(`Каталог витрины не найден: ${source}. Забор site/ из ${lock.repository} не выполнен.`);
  const actual = treeHash(source);
  if (actual.files === 0) throw new SourceError(`Каталог витрины пуст: ${source}. Публикация пустой витрины запрещена.`);
  if (actual.sha256 !== lock.tree.sha256 || actual.files !== lock.tree.files) {
    throw new SourceError(`Содержимое ${source} не совпадает с source.json: ожидался ${lock.tree.sha256} (${lock.tree.files} файлов), `
      + `получен ${actual.sha256} (${actual.files} файлов). Забран не тот коммит или файлы изменены.`);
  }
  for (const rel of ['index.html', 'app.js', 'gate.js', 'data/prompts.json']) {
    if (!existsSync(path.join(source, rel))) throw new SourceError(`В витрине нет ${rel}`);
  }
  const index = readFileSync(path.join(source, 'index.html'), 'utf8');
  if (!index.includes(`>v${lock.version}<`)) throw new SourceError(`index.html витрины не показывает версию v${lock.version} из source.json`);
  return actual;
}

export function prepare({ source, out, lock = readLock() }) {
  source = path.resolve(source);
  out = path.resolve(out);
  const sourceTree = verifySource(source, lock);
  const v = lock.commit.slice(0, 7);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(path.dirname(out), { recursive: true });
  cpSync(source, out, { recursive: true });
  const edit = (rel, fn) => {
    const file = path.join(out, rel);
    writeFileSync(file, fn(readFileSync(file, 'utf8')));
  };
  edit('gate.js', patchGate);
  edit('app.js', (js) => patchApp(js, { v }));
  edit('index.html', (html) => patchIndex(html, { lock, v }));
  for (const rel of HTML_PAGES.slice(1)) {
    if (existsSync(path.join(out, rel))) edit(rel, (html) => versionAssets(html, v, rel));
  }
  writeFileSync(path.join(out, 'deploy.json'), `${JSON.stringify({
    repository: lock.repository,
    commit: lock.commit,
    version: lock.version,
    source: sourceTree,
  }, null, 2)}\n`);
  const privacy = checkPrivacy(out, lock);
  if (privacy.errors.length) throw new SourceError(`Проверка приватности не пройдена:\n${privacy.errors.join('\n')}`);
  return { out, source: sourceTree, output: treeHash(out), anchors: privacy.anchors };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const value = (name, fallback) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : fallback;
  };
  try {
    const result = prepare({
      source: value('--source'),
      out: value('--out'),
      lock: readLock(path.resolve(value('--lock', LOCK))),
    });
    console.log(`✔ Витрина: ${result.out} — источник ${result.source.sha256} (${result.source.files} файлов), `
      + `вывод ${result.output.sha256} (${result.output.files} файлов)`);
  } catch (error) {
    const title = error instanceof SourceError ? 'Витрина BCREQ не опубликована' : 'Ошибка сборки витрины';
    console.error(process.env.GITHUB_ACTIONS ? `::error title=${title}::${error.message.replaceAll('\n', '%0A')}` : `✘ ${title}: ${error.message}`);
    process.exit(1);
  }
}
