#!/usr/bin/env node
// brochure.html → brochure.pdf.
//
//   node scripts/build-pdf.mjs [--site <каталог сборки>] [--out <файл.pdf>]
//
// --site  — каталог собранного Jekyll сайта программы
//           (по умолчанию _site/projects/ai-team-management-program в корне репозитория);
// --out   — путь PDF (по умолчанию <site>/brochure.pdf).
// Браузер — системный Chrome/Chromium: переменная CHROME_PATH или google-chrome,
// chromium, chromium-browser в PATH.
//
// Формат A4, поля 2 см, без колонтитулов; закладки PDF — по заголовкам H1–H3.
// JavaScript на странице отключён: в PDF попадает только свёрстанный текст.
// В метаданные (Keywords) записывается ssot-sha256 — хеш собранной brochure.html,
// её стилей и этого скрипта; по нему workflow понимает, устарел ли brochure.pdf в репозитории.
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import { PDFDocument } from 'pdf-lib';
import { DEFAULT_SITE, HASH_PREFIX, arg, sourceHash } from './brochure-common.mjs';

// Основной шрифт текста (кириллица) и допустимые запасные — для отдельных символов
// (●, ◐, →, ≥, δ), которых нет в основном шрифте.
const BODY_FONTS = /^(Liberation Sans|DejaVu Sans|Arial)$/;
const FALLBACK_FONTS = /^(Liberation Sans|DejaVu Sans|Arial|FreeSans|Noto Sans|Noto Sans Symbols2?)$/;

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try {
      return execFileSync('which', [name], { encoding: 'utf8' }).trim();
    } catch { /* следующий кандидат */ }
  }
  throw new Error('Chrome не найден: задайте CHROME_PATH');
}

const site = path.resolve(arg('--site', DEFAULT_SITE));
const out = path.resolve(arg('--out', path.join(site, 'brochure.pdf')));
const html = path.join(site, 'brochure.html');
if (!existsSync(html)) throw new Error(`Нет ${html}: сначала соберите сайт Jekyll`);

const browser = await puppeteer.launch({
  executablePath: chromePath(),
  // На раннерах Ubuntu 24.04 песочница Chrome недоступна (AppArmor userns).
  args: ['--no-sandbox', '--font-render-hinting=none'],
});
try {
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(false);
  await page.goto(pathToFileURL(html).href, { waitUntil: 'load' });
  await page.emulateMediaType('print');

  // Шрифты с кириллицей: проверяем, какой шрифт Chrome реально взял для текста.
  const cdp = await page.createCDPSession();
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const used = new Map();
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', {
    nodeId: root.nodeId, selector: 'h1, h2, h3, p, li, th, td, strong, a',
  });
  for (const nodeId of nodeIds) {
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    for (const f of fonts) used.set(f.familyName, (used.get(f.familyName) || 0) + f.glyphCount);
  }
  const families = [...used.keys()];
  console.log(`Шрифты текста: ${families.map((f) => `${f} (${used.get(f)} глифов)`).join(', ')}`);
  const total = [...used.values()].reduce((a, b) => a + b, 0);
  const body = families.filter((f) => BODY_FONTS.test(f)).reduce((a, f) => a + used.get(f), 0);
  const bad = families.filter((f) => !FALLBACK_FONTS.test(f));
  if (!total || body / total < 0.95 || bad.length) {
    throw new Error('Текст должен быть набран шрифтом с кириллицей (Liberation Sans, DejaVu Sans или Arial; '
      + `запасные: FreeSans, Noto Sans). Получено: ${families.join(', ') || 'шрифты не найдены'}`);
  }

  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
    printBackground: true,
    displayHeaderFooter: false,
    preferCSSPageSize: false,
    outline: true,
    tagged: true,
  });

  const doc = await PDFDocument.load(pdf, { updateMetadata: false });
  const hash = sourceHash(site);
  doc.setKeywords([`${HASH_PREFIX}${hash}`]);
  doc.setLanguage('ru');
  writeFileSync(out, await doc.save());
  console.log(`PDF: ${out} (${doc.getPageCount()} стр., ${HASH_PREFIX}${hash})`);
} finally {
  await browser.close();
}
