#!/usr/bin/env node
// Playwright-сценарии спицы на развёрнутой витрине (issue #68, НФТ-2).
//
//   node scripts/run-spoke-scenarios.mjs --scenarios <каталог> --after <каталог витрины>
//        --smoke-before <site/ исходного среза> --route-before <site/ исходного среза>
//        [--root <корень сайта>] [--out <каталог снимков>]
//
// Сценарии experiments/issue_500/browser-smoke.js и route-browser.js берутся из спицы на
// закреплённом коммите (projects/mango-bcreq/source.json) и выполняются как есть — так же,
// как их выполняет Playwright MCP (browser_run_code_unsafe): выражение-функция (page, args).
// Оба сценария открывают ${base}/before/site/ (срез до изменения) и ${base}/after/site/
// (проверяемая витрина) на http://127.0.0.1:8137. Сервер отдаёт под /after/site/ каталог
// --after — собранный _site/mango/ — с поведением GitHub Pages (scripts/static-server.mjs),
// поэтому единственное отличие от прогона в спице — база URL.
import { mkdirSync, readFileSync } from 'node:fs';
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
const after = path.resolve(arg('--after'));
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

mkdirSync(out, { recursive: true });
mkdirSync(ROUTE_OUT, { recursive: true });
const browser = await chromium.launch(process.env.CHROME_PATH
  ? { executablePath: process.env.CHROME_PATH }
  : { channel: 'chrome' });
let failed = 0;
try {
  for (const run of RUNS) {
    const scenario = load(path.join(scenarios, run.name));
    const site = await serve({
      root,
      port: PORT,
      mounts: [['/before/site/', run.before], ['/after/site/', after]],
    });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      const result = await scenario(page, run.params);
      const missing = site.requests.filter(([url, status]) => status === 404 && url.startsWith('/after/'));
      if (missing.length) throw new Error(`404 на витрине: ${missing.map(([url]) => url).join(', ')}`);
      if (errors.length) throw new Error(`ошибки JavaScript: ${errors.join('; ')}`);
      console.log(`✔ ${run.name}: ${result}`);
    } catch (error) {
      failed += 1;
      console.error(`✘ ${run.name}: ${error.message.split('\n')[0]}`);
    } finally {
      await context.close();
      await site.close();
    }
  }
} finally {
  await browser.close();
}
if (failed) {
  console.error(`Сценарии спицы: провалов ${failed}`);
  process.exit(1);
}
console.log('Сценарии спицы пройдены.');
