// Рендер страниц PDF в PNG для визуальной проверки (нужны pdfjs-dist и @napi-rs/canvas).
//   NODE_PATH-независимо: запускать из каталога, где установлены пакеты:
//   node render-pdf.mjs <file.pdf> <outdir> [scale] [pages: 1,2,3]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
const [file, outdir, scale = '1.2', pagesArg] = process.argv.slice(2);
mkdirSync(outdir, { recursive: true });
const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(file)) }).promise;
const pages = pagesArg ? pagesArg.split(',').map(Number) : [...Array(doc.numPages).keys()].map((i) => i + 1);
for (const n of pages) {
  const page = await doc.getPage(n);
  const vp = page.getViewport({ scale: Number(scale) });
  const canvas = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
  writeFileSync(`${outdir}/page-${String(n).padStart(2, '0')}.png`, canvas.toBuffer('image/png'));
}
console.log(`pages: ${doc.numPages}`);
