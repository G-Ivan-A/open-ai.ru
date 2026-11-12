#!/usr/bin/env node
// Хеш источников PDF (ssot-sha256).
//
//   node scripts/pdf-hash.mjs --site <каталог сборки>   — хеш текущей сборки brochure.html;
//   node scripts/pdf-hash.mjs --pdf <файл.pdf>          — хеш, записанный в PDF при генерации.
//
// Если хеши совпадают, brochure.pdf в репозитории соответствует content/*.md.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { HASH_PREFIX, arg, sourceHash } from './brochure-common.mjs';

const pdfPath = arg('--pdf');
if (pdfPath) {
  let keywords = '';
  try {
    const doc = await PDFDocument.load(readFileSync(pdfPath), { updateMetadata: false });
    keywords = doc.getKeywords() || '';
  } catch {
    keywords = '';
  }
  const m = keywords.match(new RegExp(`${HASH_PREFIX}([0-9a-f]{64})`));
  console.log(m ? m[1] : 'none');
} else {
  const site = arg('--site');
  if (!site) throw new Error('Укажите --site или --pdf');
  console.log(sourceHash(path.resolve(site)));
}
