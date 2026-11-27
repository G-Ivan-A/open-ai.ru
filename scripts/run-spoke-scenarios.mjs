#!/usr/bin/env node
// Playwright-сценарии спицы на развёрнутой витрине (issue #68, НФТ-2).
//
//   node scripts/run-spoke-scenarios.mjs --scenarios <каталог> --reference <site/ спицы>
//        --after <каталог витрины> --smoke-before <site/ среза> --route-before <site/ среза>
//        [--root <корень сайта>] [--out <каталог снимков>] [--report <файл JSON>]
//
// Сценарии experiments/issue_500/browser-smoke.js и route-browser.js берутся из спицы на
// закреплённом коммите (projects/mango-bcreq/source.json) и выполняются как есть — так же,
// как их выполняет Playwright MCP (browser_run_code_unsafe): выражение-функция (page, args).
// Оба сценария открывают ${base}/before/site/ (срез до изменения) и ${base}/after/site/
// (проверяемая витрина) на http://127.0.0.1:8137 — сервер с поведением GitHub Pages
// (scripts/static-server.mjs). Единственное отличие от прогона в спице — база URL.
//
// Каждый сценарий выполняется дважды:
//   эталон    — /after/site/ = исходный site/ спицы (--reference) на закреплённом коммите;
//   развёрнуто — /after/site/ = собранная витрина _site/mango (--after).
// Проверка «работает идентично спице»: исход развёрнутой витрины (успех или текст первой
// ошибки) совпадает с исходом эталона, а 404 и ошибок JavaScript на /after/ нет сверх эталона.
// Так сценарий, который на закреплённом коммите спицы уже не проходит (устарел в самой спице),
// не маскирует регрессию и не блокирует публикацию: расхождение с эталоном — провал.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { chromium } from 'playwright-core';
import { serve } from './static-server.mjs';

const PORT = 8137; // route-browser.js задаёт базу http://127.0.0.1:8137 внутри сценария.
const BASE = `http://127.0.0.1:${PORT}`;
const ROUTE_OUT = '/tmp/mango-ft4'; // Каталог снимков route-browser.js (задан в сценарии).

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  if (fallback === undefined) throw new Error(`Не задан ${name}`);
  return fallback;
};

const scenarios = path.resolve(arg('--scenarios'));
const reference = path.resolve(arg('--reference'));
const after = path.resolve(arg('--after'));
const reportFile = args.includes('--report') ? path.resolve(arg('--report')) : null;
const root = path.resolve(arg('--root', after));
const out = path.resolve(arg('--out', '/tmp/mango-500-preview'));

const RUNS = [
  { name: 'browser-smoke.js', before: path.resolve(arg('--smoke-before')), params: { base: BASE, output: out } },
  { name: 'route-browser.js', before: path.resolve(arg('--route-before')), params: undefined },
];

function load(file) {
  const source = readFileSync(file, 'utf8');
  const fn = vm.runInThisContext(source, { filename: file });
  if (typeof fn !== 'function') throw new Error(`${file}: ожидается выражение-функция (page, args)`);
  return fn;
}

async function runOnce(browser, run, scenario, target) {
  const site = await serve({
    root: run.root ?? root,
    port: PORT,
    mounts: [['/before/site/', run.before], ['/after/site/', target]],
  });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  let outcome;
  try {
    outcome = { ok: true, result: String(await scenario(page, run.params)) };
  } catch (error) {
    outcome = { ok: false, error: String(error.message).split('\n')[0] };
  } finally {
    await context.close();
    await site.close();
  }
  outcome.missing = [...new Set(site.requests
    .filter(([url, status]) => status === 404 && url.startsWith('/after/'))
    .map(([url]) => url.replace(/\?.*$/, '')))];
  outcome.pageErrors = [...new Set(errors)];
  return outcome;
}

const describe = (o) => (o.ok ? `успех (${o.result})` : `ошибка «${o.error}»`);

mkdirSync(out, { recursive: true });
mkdirSync(ROUTE_OUT, { recursive: true });
const browser = await chromium.launch(process.env.CHROME_PATH
  ? { executablePath: process.env.CHROME_PATH }
  : { channel: 'chrome' });
const report = [];
let failed = 0;
try {
  for (const run of RUNS) {
    const scenario = load(path.join(scenarios, run.name));
    const ref = await runOnce(browser, run, scenario, reference);
    const dep = await runOnce(browser, run, scenario, after);
    const problems = [];
    if (ref.ok !== dep.ok || (ref.ok ? false : ref.error !== dep.error)) {
      problems.push(`исход отличается от эталона: эталон — ${describe(ref)}, витрина — ${describe(dep)}`);
    }
    const extraMissing = dep.missing.filter((url) => !ref.missing.includes(url));
    if (extraMissing.length) problems.push(`404 на витрине: ${extraMissing.join(', ')}`);
    const extraErrors = dep.pageErrors.filter((e) => !ref.pageErrors.includes(e));
    if (extraErrors.length) problems.push(`ошибки JavaScript: ${extraErrors.join('; ')}`);
    report.push({ scenario: run.name, reference: ref, deployed: dep, identical: !problems.length, problems });
    if (problems.length) {
      failed += 1;
      console.error(`✘ ${run.name}: ${problems.join(' | ')}`);
    } else {
      console.log(`✔ ${run.name}: как в спице — ${describe(dep)}`);
      if (!dep.ok) {
        console.log(`  ⚠ сценарий не проходит и на исходном site/ спицы (устарел в спице): ${dep.error}`);
      }
    }
  }
} finally {
  await browser.close();
}
if (reportFile) writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
if (failed) {
  console.error(`Сценарии спицы: расхождений с эталоном — ${failed}`);
  process.exit(1);
}
console.log('Сценарии спицы: витрина ведёт себя идентично исходному site/ спицы.');
