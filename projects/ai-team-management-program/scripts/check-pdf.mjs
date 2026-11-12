#!/usr/bin/env node
// Проверка brochure.pdf (issue #61).
//
//   node scripts/check-pdf.mjs [--pdf <файл.pdf>] [--site <каталог сборки>]
//
// --pdf   — проверяемый PDF (по умолчанию <site>/brochure.pdf);
// --site  — каталог собранного сайта программы; если в нём есть brochure.html,
//           хеш в PDF сверяется с хешем этой сборки.
//
// Что проверяется:
//   1. Формат A4 на каждой странице, весь текст — внутри полей 2 см.
//   2. Закладки верхнего уровня — H1 файлов строго в порядке 01 → 02 → 05 → 03,
//      и каждый файл начинается с новой страницы со своего H1.
//   3. Дословность: каждый заголовок, абзац, пункт списка и ячейка таблицы
//      из content/*.md есть в тексте PDF в порядке файла (без учёта переносов строк).
//   4. Кириллица: шрифты встроены в PDF, текст извлекается без «�».
//   5. Имена кандидатов без согласия (consent: false) в PDF отсутствуют.
//   6. Хеш источников в метаданных совпадает со сборкой (если передан --site).
//   7. Разделы из PDF_SKIP (раздел «Почему так» резюме) в PDF отсутствуют,
//      сокращение «а.ч.» не встречается — только «ак.ч.» (issue #63).
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { PDFDocument, PDFDict, PDFName } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  DEFAULT_SITE, HASH_PREFIX, OLD_HOURS, ORDER, arg, candidates, mdBlocks, readSource,
  skippedSections, sourceHash, squash,
} from './brochure-common.mjs';

const A4 = { w: 595.28, h: 841.89 };
const MARGIN = (2 / 2.54) * 72; // 2 см в пунктах
const TOL = 1; // пункт: округление координат

const site = path.resolve(arg('--site', DEFAULT_SITE));
const pdfPath = path.resolve(arg('--pdf', path.join(site, 'brochure.pdf')));
if (!existsSync(pdfPath)) {
  console.error(`Нет ${pdfPath}: сначала выполните npm run pdf`);
  process.exit(1);
}

const errors = [];
const fail = (msg) => errors.push(msg);
const data = new Uint8Array(readFileSync(pdfPath));

// --- Текст и геометрия (pdf.js) ---
const pdf = await getDocument({ data: data.slice(), useSystemFonts: false, verbosity: 0 }).promise;
const pages = [];
for (let n = 1; n <= pdf.numPages; n += 1) {
  const page = await pdf.getPage(n);
  const [x0, y0, x1, y1] = page.view;
  const w = x1 - x0;
  const h = y1 - y0;
  if (Math.abs(w - A4.w) > TOL || Math.abs(h - A4.h) > TOL) {
    fail(`стр. ${n}: размер ${w.toFixed(2)}×${h.toFixed(2)} pt, ожидается A4 ${A4.w}×${A4.h}`);
  }
  const { items } = await page.getTextContent();
  let text = '';
  for (const it of items) {
    if (!('str' in it)) continue;
    text += it.str;
    if (!it.str.trim()) continue;
    const x = it.transform[4];
    const y = it.transform[5];
    if (x < MARGIN - TOL || x + it.width > w - MARGIN + TOL || y < MARGIN - TOL || y + it.height > h - MARGIN + TOL) {
      fail(`стр. ${n}: текст «${it.str.slice(0, 40)}» выходит за поля 2 см (x=${x.toFixed(1)}, y=${y.toFixed(1)})`);
    }
  }
  pages.push(squash(text));
}
const all = pages.join('');
if (!all) fail('в PDF нет извлекаемого текста');
if (all.includes('�')) fail('в тексте PDF есть «�»: шрифт без таблицы ToUnicode');
if (!/[А-Яа-яЁё]/.test(all)) fail('в тексте PDF нет кириллицы');

// --- Порядок разделов: закладки и начало страниц ---
const titles = ORDER.map((rel) => mdBlocks(readSource(rel)).find((b) => b.kind === 'h1')?.text);
const outline = (await pdf.getOutline()) || [];
const top = outline.map((o) => o.title.trim());
if (JSON.stringify(top) !== JSON.stringify(titles)) {
  fail(`закладки верхнего уровня: ${JSON.stringify(top)}; ожидается H1 в порядке 01 → 02 → 05 → 03: ${JSON.stringify(titles)}`);
}
let lastPage = -1;
titles.forEach((t, i) => {
  const p = pages.findIndex((s) => s.startsWith(squash(t)));
  if (p < 0) fail(`H1 «${t}» (${ORDER[i]}) не начинает страницу`);
  else if (p <= lastPage) fail(`H1 «${t}» (${ORDER[i]}) стоит раньше предыдущего раздела`);
  else lastPage = p;
});

// --- Дословность: все блоки файлов в порядке ORDER ---
let pos = 0;
for (const rel of ORDER) {
  const blocks = mdBlocks(readSource(rel));
  let missing = 0;
  for (const b of blocks) {
    const needle = squash(b.text);
    const at = all.indexOf(needle, pos);
    if (at < 0) {
      missing += 1;
      const anywhere = all.includes(needle);
      fail(`${rel}: ${b.kind} «${b.text.slice(0, 70)}» ${anywhere ? 'стоит не по порядку' : 'отсутствует в PDF'}`);
      if (missing > 20) break;
      continue;
    }
    pos = at + needle.length;
  }
  console.log(`${rel}: ${blocks.length} блоков, не найдено ${missing}`);
}

// --- Согласие кандидатов ---
for (const c of candidates()) {
  if (!c.consent && c.name && all.includes(squash(c.name))) {
    fail(`имя кандидата без согласия в PDF: ${c.name}`);
  }
}

// --- Исключённые разделы и «а.ч.» ---
for (const rel of ORDER) {
  for (const sec of skippedSections(rel)) {
    if (!sec.blocks.length) fail(`${rel}: в файле нет раздела «${sec.title}» из PDF_SKIP`);
    for (const b of sec.blocks) {
      if (b.kind === 'h2' && all.includes(squash(b.text))) fail(`${rel}: заголовок исключённого раздела «${b.text}» есть в PDF`);
      if (b.kind !== 'h2' && b.text.length > 30 && all.includes(squash(b.text))) {
        fail(`${rel}: текст исключённого раздела «${sec.title}» есть в PDF: «${b.text.slice(0, 60)}»`);
      }
    }
  }
}
const oldHours = pages.findIndex((t) => OLD_HOURS.test(t));
if (oldHours > -1) fail(`стр. ${oldHours + 1}: сокращение «а.ч.» вместо «ак.ч.»`);

// --- Шрифты и метаданные (pdf-lib) ---
const doc = await PDFDocument.load(data, { updateMetadata: false });
const fonts = [];
for (const [, obj] of doc.context.enumerateIndirectObjects()) {
  if (!(obj instanceof PDFDict)) continue;
  if (obj.get(PDFName.of('Type')) !== PDFName.of('FontDescriptor')) continue;
  const name = obj.get(PDFName.of('FontName'))?.decodeText?.() ?? String(obj.get(PDFName.of('FontName')));
  const embedded = ['FontFile', 'FontFile2', 'FontFile3'].some((k) => obj.get(PDFName.of(k)));
  fonts.push({ name: name.replace(/^\/?[A-Z]{6}\+/, '').replace(/^\//, ''), embedded });
}
if (!fonts.length) fail('в PDF нет шрифтов');
for (const f of fonts) if (!f.embedded) fail(`шрифт ${f.name} не встроен в PDF`);
if (!fonts.some((f) => /Liberation|DejaVu|Arial/i.test(f.name))) {
  fail(`основной шрифт с кириллицей не найден; шрифты: ${fonts.map((f) => f.name).join(', ')}`);
}
console.log(`Шрифты PDF: ${[...new Set(fonts.map((f) => `${f.name}${f.embedded ? '' : ' (не встроен)'}`))].join(', ')}`);

const keywords = doc.getKeywords() || '';
const embeddedHash = keywords.match(new RegExp(`${HASH_PREFIX}([0-9a-f]{64})`))?.[1];
if (!embeddedHash) fail(`в метаданных PDF нет ${HASH_PREFIX}: файл создан не scripts/build-pdf.mjs`);
if (existsSync(path.join(site, 'brochure.html')) && embeddedHash) {
  const expected = sourceHash(site);
  if (embeddedHash !== expected) {
    fail(`PDF устарел: ${HASH_PREFIX}${embeddedHash.slice(0, 12)}…, сборка ${expected.slice(0, 12)}…; выполните npm run pdf`);
  }
}

if (errors.length) {
  console.error(`\nОшибок: ${errors.length}`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`OK: ${pdfPath} — ${pdf.numPages} стр. A4, поля 2 см, порядок 01 → 02 → 05 → 03, текст дословный`);
