#!/usr/bin/env node
// Витрина BCREQ на open-ai.ru работает идентично исходному site/ спицы (issue #68, НФТ-2, ГК-1).
//
//   node scripts/check-mango.mjs --site _site --reference <site/ спицы> [--lock <source.json>]
//                                [--base /open-ai.ru/] [--report <файл JSON>]
//
// Один и тот же браузерный прогон выполняется дважды — на эталоне (исходный site/ спицы на
// закреплённом коммите) и на развёрнутой витрине (_site/mango под base path, как на Pages) —
// и результаты сравниваются целиком:
//   • каталог: число карточек, порядок id, текст каждого «Копировать» из буфера обмена (SHA-256);
//   • поиск: число и порядок результатов для набора запросов;
//   • фильтры: число и порядок результатов для каждого фильтра;
//   • шаги процесса Ш-0 → AIN-01…24 → Ш-3…Ш-С в обоих форматах: карточка в фокусе, формат,
//     текст каждого «Копировать» шага (SHA-256);
//   • разделы SPA (#about, #catalog, …): текст раздела (SHA-256);
//   • 404 и ошибки JavaScript.
// Только для развёрнутой витрины:
//   • в футере версия сборки v<version> и коммит спицы; ссылка «Все проекты» ведёт на стартовую;
//   • стартовая страница → «Открыть» → витрина; витрина → «Все проекты» → стартовая (ГК-1);
//   • прямой заход вглубь (/mango/ain-06, /mango/ш-3) и перезагрузка вглуби;
//   • сторонние адреса не запрашиваются (кроме виджета, который грузит сама витрина — он
//     блокируется в обоих прогонах одинаково).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { LOCK, readLock } from '../projects/mango-bcreq/scripts/lock.mjs';
import { serve } from './static-server.mjs';

const SEARCHES = ['AIN', 'Ш-3', 'контекст', 'глоссарий', 'требования', 'нет-такого-промпта-xyz'];

const sha = (text) => createHash('sha256').update(text).digest('hex');

export function launch() {
  return chromium.launch(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: 'chrome' });
}

async function newPage(browser, origin) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  const page = await context.newPage();
  const errors = [];
  const external = new Set();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route(/^https?:\/\//, (route) => {
    const url = new URL(route.request().url());
    if (url.origin === origin) return route.continue();
    external.add(url.host);
    return route.abort();
  });
  return { context, page, errors, external };
}

// Текст всех секций раздела (у некоторых разделов их несколько), пробелы нормализованы.
const hashText = (page, selector) => page.locator(selector)
  .evaluateAll((list) => list.map((node) => node.innerText.replace(/\s+/g, ' ').trim()).join('\n'))
  .then(sha);

async function clipboardOf(page, button) {
  await page.evaluate(() => navigator.clipboard.writeText(''));
  await button.click();
  await page.waitForFunction(async () => (await navigator.clipboard.readText()) !== '', null, { timeout: 5000 })
    .catch(() => {});
  return sha(await page.evaluate(() => navigator.clipboard.readText()));
}

async function catalogState(page) {
  return page.evaluate(() => ({
    count: document.querySelector('#result-count')?.innerText.trim(),
    ids: [...document.querySelectorAll('#prompt-grid [data-copy-id]')].map((b) => b.dataset.copyId),
  }));
}

// Полный прогон витрины по адресу url (каталог витрины, со слэшем на конце).
export async function survey(browser, origin, url, { steps }) {
  const { context, page, errors, external } = await newPage(browser, origin);
  const result = { catalog: {}, copies: {}, searches: {}, filters: {}, steps: {}, pages: {} };
  try {
    await page.goto(`${url}#catalog`);
    await page.waitForSelector('#prompt-grid [data-copy-id]');
    result.catalog = await catalogState(page);
    const buttons = page.locator('#prompt-grid [data-copy-id]');
    const total = await buttons.count();
    for (let i = 0; i < total; i += 1) {
      const button = buttons.nth(i);
      const key = `${i}:${await button.getAttribute('data-copy-id')}:${(await button.innerText()).trim()}`;
      result.copies[key] = await clipboardOf(page, button);
    }

    for (const query of SEARCHES) {
      await page.fill('#search-input', query);
      await page.waitForTimeout(150);
      result.searches[query] = await catalogState(page);
    }
    await page.fill('#search-input', '');
    await page.waitForTimeout(150);

    const tokens = await page.locator('[data-filter-token]').evaluateAll((list) => list.map((b) => b.dataset.filterToken));
    for (const token of tokens) {
      const chip = page.locator(`[data-filter-token="${token.replace(/"/g, '\\"')}"]`).first();
      // Недоступный при текущих данных фильтр (disabled) фиксируется как есть.
      if (await chip.isDisabled()) {
        result.filters[token] = 'disabled';
        continue;
      }
      await chip.click();
      await page.waitForTimeout(100);
      result.filters[token] = await catalogState(page);
      await chip.click();
      await page.waitForTimeout(100);
    }

    for (const code of steps) {
      for (const track of ['decomposed', 'system']) {
        const params = new URLSearchParams({ step: code, track });
        await page.evaluate((hash) => { location.hash = hash; }, `processes?${params}`);
        const card = page.locator(`[id="bcreq-testkit-${code}"]`);
        await card.and(page.locator(':focus')).waitFor({ timeout: 5000 }).catch(() => {});
        const entry = await page.evaluate((id) => ({
          focused: document.activeElement?.id === id,
          format: document.querySelector('#step-format-switch [data-active="true"]')?.dataset.stepFormat ?? null,
        }), `bcreq-testkit-${code}`);
        const copies = card.locator('.testkit-copy:visible');
        entry.copies = [];
        for (let i = 0, n = await copies.count(); i < n; i += 1) {
          entry.copies.push(await clipboardOf(page, copies.nth(i)));
        }
        result.steps[`${code}/${track}`] = entry;
      }
    }

    const pages = await page.locator('section[data-page]').evaluateAll((list) => [...new Set(list.map((s) => s.dataset.page))]);
    for (const name of pages) {
      await page.evaluate((hash) => { location.hash = hash; }, name);
      await page.locator(`section[data-page="${name}"]:not([hidden])`).first().waitFor({ timeout: 5000 });
      await page.waitForTimeout(100);
      result.pages[name] = await hashText(page, `section[data-page="${name}"]`);
    }
  } finally {
    result.pageErrors = [...new Set(errors)];
    result.external = [...external].sort();
    await context.close();
  }
  return result;
}

// Поля, которые различаются (для отчёта): путь → [эталон, витрина].
export function differences(a, b, prefix = '') {
  if (isDeepStrictEqual(a, b)) return [];
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a)) {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])]
      .flatMap((key) => differences(a[key], b[key], prefix ? `${prefix}.${key}` : key));
  }
  return [[prefix, a, b]];
}

// Проверки, которые есть только у развёрнутой витрины: футер, вход/выход, адреса вглубь.
export async function deployedChecks(browser, origin, base, lock) {
  const { context, page, errors } = await newPage(browser, origin);
  const problems = [];
  const expect = (ok, message) => { if (!ok) problems.push(message); };
  const short = lock.commit.slice(0, 7);
  const focusedStep = async (code) => page.locator(`[id="bcreq-testkit-${code}"]`).and(page.locator(':focus'))
    .waitFor({ timeout: 5000 }).then(() => true, () => false);
  try {
    // Вход: стартовая → «Открыть» витрины.
    await page.goto(`${origin}${base}`);
    await page.getByRole('link', { name: 'Открыть витрину BCREQ (mango)' }).click();
    await page.waitForSelector('#prompt-grid [data-copy-id]');
    expect(new URL(page.url()).pathname === `${base}mango/`, `«Открыть» ведёт на ${page.url()}`);

    const footer = await page.locator('.site-footer').innerText();
    expect(footer.includes(`v${lock.version}`), `в футере витрины нет v${lock.version}: ${footer}`);
    expect(footer.includes(short), `в футере витрины нет коммита ${short}: ${footer}`);
    expect(await page.locator(`[data-deploy-source="${lock.commit}"]`).count() === 1, 'нет data-deploy-source с полным SHA');

    // Выход: «Все проекты open-ai.ru» → стартовая страница.
    await page.locator('[data-deploy-home]').click();
    await page.waitForLoadState();
    expect(new URL(page.url()).pathname === base, `«Все проекты» ведёт на ${page.url()}`);
    expect((await page.locator('h1').innerText()).includes('Проекты open-ai.ru'), 'выход из витрины не на стартовую');

    // Прямой заход вглубь и перезагрузка вглуби.
    for (const [deep, code] of [['mango/ain-06', 'AIN-06'], ['mango/%D1%88-3', 'Ш-3'], ['mango/AIN-24/', 'AIN-24']]) {
      const response = await page.goto(`${origin}${base}${deep}`);
      expect(response.status() === 404, `${deep}: ожидался ответ 404.html Pages, получен ${response.status()}`);
      await page.waitForURL((u) => u.pathname === `${base}mango/`, { timeout: 5000 }).catch(() => {});
      expect(await focusedStep(code), `${deep}: шаг ${code} не открыт (${page.url()})`);
      await page.reload();
      expect(await focusedStep(code), `${deep}: после перезагрузки шаг ${code} не открыт (${page.url()})`);
    }
    await page.goto(`${origin}${base}mango/glossary`);
    await page.waitForURL((u) => u.hash === '#glossary', { timeout: 5000 }).catch(() => {});
    const glossary = await page.locator('section[data-page="glossary"]:not([hidden])').first()
      .waitFor({ timeout: 5000 }).then(() => true, () => false);
    expect(glossary, `/mango/glossary: раздел не открыт (${page.url()})`);

    // Неизвестный адрес под /mango/ — честная 404 со ссылками, а не пустая витрина.
    const missing = await page.goto(`${origin}${base}mango/no-such-page`);
    expect(missing.status() === 404 && (await page.locator('h1').innerText()).includes('не найдена'), '/mango/no-such-page: нет страницы 404');

    // Паспорт публикации совпадает с закреплённым источником.
    const deploy = await (await page.request.get(`${origin}${base}mango/deploy.json`)).json();
    expect(deploy.commit === lock.commit && deploy.version === lock.version, `deploy.json: ${JSON.stringify(deploy)}`);
  } finally {
    if (errors.length) problems.push(`ошибки JavaScript: ${[...new Set(errors)].join('; ')}`);
    await context.close();
  }
  return problems;
}

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i > 0 && process.argv[i + 1]) return process.argv[i + 1];
  if (fallback === undefined) throw new Error(`Не задан ${name}`);
  return fallback;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const site = path.resolve(arg('--site', '_site'));
  const reference = path.resolve(arg('--reference'));
  const lock = readLock(path.resolve(arg('--lock', LOCK)));
  const base = arg('--base', '/open-ai.ru/');
  const reportFile = process.argv.includes('--report') ? path.resolve(arg('--report')) : null;
  const steps = readFileSync(path.join(site, '404.html'), 'utf8').match(/var STEPS = (\[.*?\]);/);
  if (!steps) throw new Error('404.html: нет списка шагов витрины');

  const server = await serve({ root: site, base, mounts: [['/reference/site/', reference]] });
  const browser = await launch();
  let problems = [];
  const report = {};
  try {
    const options = { steps: JSON.parse(steps[1]) };
    report.reference = await survey(browser, server.url, `${server.url}/reference/site/`, options);
    report.deployed = await survey(browser, server.url, `${server.url}${base}mango/`, options);
    const diff = differences(report.reference, report.deployed);
    problems = diff.map(([key, a, b]) => `${key}: эталон ${JSON.stringify(a)} ≠ витрина ${JSON.stringify(b)}`);
    // До проверок адресов вглубь: те намеренно получают 404.html.
    const missing = server.requests.filter(([url, status]) => status === 404 && url.startsWith(`${base}mango/`));
    if (missing.length) problems.push(`404 на витрине: ${missing.map(([url]) => url).join(', ')}`);
    const deployed = report.deployed;
    for (const [name, value] of [['карточек', deployed.catalog.ids.length], ['копирований', Object.keys(deployed.copies).length],
      ['шагов', Object.keys(deployed.steps).length], ['разделов', Object.keys(deployed.pages).length]]) {
      if (!value) problems.push(`витрина пуста: 0 ${name}`);
    }
    const unfocused = Object.entries(deployed.steps).filter(([, s]) => !s.focused).map(([k]) => k);
    if (unfocused.length) problems.push(`шаги не открываются: ${unfocused.join(', ')}`);
    problems.push(...await deployedChecks(browser, server.url, base, lock));
    report.summary = {
      cards: deployed.catalog.ids.length,
      catalogCopies: Object.keys(deployed.copies).length,
      searches: Object.keys(deployed.searches).length,
      filters: Object.keys(deployed.filters).length,
      stepRoutes: Object.keys(deployed.steps).length,
      stepCopies: Object.values(deployed.steps).reduce((n, s) => n + s.copies.length, 0),
      pages: Object.keys(deployed.pages).length,
      blockedExternalHosts: deployed.external,
    };
  } catch (error) {
    // Сбой прогона (витрина не загрузилась, таймаут) — тоже расхождение, с причиной в отчёте.
    problems.push(`прогон прерван: ${error.message.split('\n')[0]}`);
  } finally {
    await browser.close();
    await server.close();
  }
  report.problems = problems;
  if (reportFile) writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Витрина v${lock.version} @ ${lock.commit.slice(0, 7)}: ${JSON.stringify(report.summary)}`);
  if (problems.length) {
    for (const problem of problems) console.error(`✘ ${problem}`);
    if (process.env.GITHUB_ACTIONS) console.log(`::error title=Витрина BCREQ отличается от спицы::${problems.length} расхождений, см. лог шага`);
    process.exit(1);
  }
  console.log('✔ Витрина работает идентично исходному site/ спицы; вход, выход и адреса вглубь работают.');
}
