#!/usr/bin/env node
// Сборка цифровой брошюры «ИИ в работе с командой» без Jekyll (issue #68, НФТ-3).
//
//   node scripts/build-site.mjs [--out <каталог>]
//
// --out — каталог сайта программы (по умолчанию _site/projects/ai-team-management-program
//         в корне репозитория). Каталог очищается и собирается заново:
//   index.html     — веб-брошюра: 01 (без «Экономика») → 02 → 03 (раздел [4] — «Смотри PDF»);
//   brochure.html  — источник brochure.pdf: 01 (без «Почему так») → 02 → 05 → 03 полностью;
//   brochure.pdf   — копия из репозитория; свежий PDF печатает scripts/build-pdf.mjs;
//   assets/        — стили и значок.
// Тексты — дословно из content/*.md, метаданные страницы — site.json.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_SITE, ORDER, PROJECT, arg, readSource } from './brochure-common.mjs';
import { brochure, hero, layout, mdDoc, pdfAppendix, webAppendix } from './render.mjs';

const read = (rel) => readFileSync(path.join(PROJECT, rel), 'utf8');

export function site() {
  return JSON.parse(read('site.json'));
}

export function indexPage(meta = site()) {
  const summary = read('content/01-project-summary.md');
  const content = [
    hero(summary),
    mdDoc(summary, { id: 'summary', heading: 'page', label: 'Резюме проекта', skip: ['Экономика'] }),
    mdDoc(read('content/02-project-passport.md'), { id: 'passport', heading: 'section' }),
    mdDoc(webAppendix(read('content/03-appendix.md')), { id: 'appendix', heading: 'section' }),
  ].join('\n');
  return layout(meta, content);
}

const DOC_ID = (rel) => `doc-${path.basename(rel).slice(0, 2)}`;

export function brochurePage(meta = site()) {
  return brochure(meta, ORDER.map((rel) => {
    const markdown = readSource(rel);
    return { id: DOC_ID(rel), rel, markdown: rel.endsWith('03-appendix.md') ? pdfAppendix(markdown) : markdown };
  }));
}

export function build(out) {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const meta = site();
  writeFileSync(path.join(out, 'index.html'), indexPage(meta));
  writeFileSync(path.join(out, 'brochure.html'), brochurePage(meta));
  cpSync(path.join(PROJECT, 'assets'), path.join(out, 'assets'), { recursive: true });
  const pdf = path.join(PROJECT, 'brochure.pdf');
  if (existsSync(pdf)) cpSync(pdf, path.join(out, 'brochure.pdf'));
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = path.resolve(arg('--out', DEFAULT_SITE));
  build(out);
  console.log(`Брошюра собрана: ${out}`);
}
